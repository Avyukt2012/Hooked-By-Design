/* Hooked by Design — the feedback API (a Vercel Function).

   POST   /api/feedback          saves one anonymous response from feedback.html
   GET    /api/feedback          lists every response (needs the admin password)
   DELETE /api/feedback?id=...   removes one response, e.g. spam (needs the admin password)

   Responses are kept in an Upstash Redis database connected to the Vercel
   project (Vercel dashboard → Storage). The developer page, admin.html, sends
   the password set in the project's ADMIN_PASSWORD environment variable.
   No names, emails or IP addresses are stored. */
'use strict';

const crypto = require('crypto');

const LIST_KEY = 'hbd:feedback';
const MAX_ENTRIES = 5000;
const MAX_TEXT = 1000;
const SENDS_PER_HOUR = 8;
const WRONG_PASSWORDS_PER_HOUR = 10;

const CHOICES = {
  role: ['student', 'teacher', 'other'],
  change: ['already', 'probably', 'no']
};

/* ---------- Storage ---------- */

// Vercel's Upstash integration names its variables KV_REST_API_URL / _TOKEN,
// or with a custom prefix chosen when the database is connected.
function storageConfig() {
  const env = process.env;
  const pairs = [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']
  ];
  Object.keys(env).forEach(function (name) {
    if (/_(KV_REST_API|REDIS_REST)_URL$/.test(name)) pairs.push([name, name.replace(/_URL$/, '_TOKEN')]);
  });
  for (const [urlName, tokenName] of pairs) {
    if (env[urlName] && env[tokenName]) return { url: env[urlName].replace(/\/+$/, ''), token: env[tokenName] };
  }
  return null;
}

// Runs Redis commands in one request and returns each command's result.
async function redis(store, commands) {
  const response = await fetch(store.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + store.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!response.ok) throw new Error('Storage answered ' + response.status);
  const results = await response.json();
  return results.map(function (item) {
    if (item.error) throw new Error('Storage error: ' + item.error);
    return item.result;
  });
}

// Counts things per visitor per hour. Only a short hash of the address is
// used, and it is deleted after an hour.
function limitKey(request, kind) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const address = forwarded || request.headers['x-real-ip'] || (request.socket && request.socket.remoteAddress) || 'unknown';
  const visitor = crypto.createHash('sha256').update('hbd:' + address).digest('hex').slice(0, 16);
  const hour = Math.floor(Date.now() / 3600000);
  return 'hbd:limit:' + kind + ':' + visitor + ':' + hour;
}

async function count(store, key) {
  const [value] = await redis(store, [['INCR', key], ['EXPIRE', key, '3600']]);
  return value;
}

async function overLimit(store, request, kind, limit) {
  return (await count(store, limitKey(request, kind))) > limit;
}

/* ---------- Helpers ---------- */

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, MAX_TEXT);
}

function pick(value, allowed) {
  return allowed.indexOf(value) === -1 ? '' : value;
}

function readBody(request) {
  let body;
  try {
    body = request.body;
  } catch (error) {
    return null;
  }
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return null;
    }
  }
  return body && typeof body === 'object' ? body : {};
}

// A form sent without JavaScript expects a page back, not JSON.
function wantsPage(request) {
  const type = String(request.headers['content-type'] || '');
  const accept = String(request.headers.accept || '');
  return type.indexOf('application/x-www-form-urlencoded') !== -1 && accept.indexOf('text/html') !== -1;
}

function reply(request, response, status, payload) {
  if (wantsPage(request)) {
    response.setHeader('Location', status < 300 ? '/feedback.html#thanks' : '/feedback.html#send-error');
    return response.status(303).end();
  }
  return response.status(status).json(payload);
}

function sameText(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

async function checkPassword(store, request, response) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    response.status(503).json({ error: 'no_password_set' });
    return false;
  }
  // Only wrong passwords count towards the limit, so the team can refresh freely.
  const key = limitKey(request, 'wrong-password');
  const [wrongSoFar] = await redis(store, [['GET', key]]);
  if (Number(wrongSoFar) >= WRONG_PASSWORDS_PER_HOUR) {
    response.status(429).json({ error: 'too_many_attempts' });
    return false;
  }
  if (!sameText(request.headers['x-admin-password'] || '', password)) {
    await count(store, key);
    response.status(401).json({ error: 'wrong_password' });
    return false;
  }
  return true;
}

async function listEntries(store) {
  const [raw] = await redis(store, [['LRANGE', LIST_KEY, '0', '-1']]);
  return (raw || []).map(function (item) {
    try {
      return { raw: item, entry: JSON.parse(item) };
    } catch (error) {
      return null;
    }
  }).filter(Boolean);
}

/* ---------- Requests ---------- */

async function saveFeedback(store, request, response) {
  const body = readBody(request);
  if (!body) return reply(request, response, 400, { error: 'bad_request' });

  // Bots fill in every field, including this hidden one. Pretend it worked.
  if (cleanText(body.website)) return reply(request, response, 200, { ok: true });

  const useful = parseInt(body.useful, 10);
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    role: pick(body.role, CHOICES.role),
    useful: useful >= 1 && useful <= 5 ? useful : null,
    change: pick(body.change, CHOICES.change),
    comment: cleanText(body.comment)
  };

  if (!entry.role || !entry.useful) {
    return reply(request, response, 400, { error: 'missing_answers', fields: ['role', 'useful'].filter(function (name) { return !entry[name]; }) });
  }

  if (await overLimit(store, request, 'send', SENDS_PER_HOUR)) {
    return reply(request, response, 429, { error: 'too_many' });
  }

  await redis(store, [
    ['LPUSH', LIST_KEY, JSON.stringify(entry)],
    ['LTRIM', LIST_KEY, '0', String(MAX_ENTRIES - 1)]
  ]);
  return reply(request, response, 201, { ok: true });
}

async function readFeedback(store, request, response) {
  if (!(await checkPassword(store, request, response))) return;
  const items = await listEntries(store);
  return response.status(200).json({ entries: items.map(function (item) { return item.entry; }) });
}

async function deleteFeedback(store, request, response) {
  if (!(await checkPassword(store, request, response))) return;
  const id = String((request.query && request.query.id) || '');
  const match = (await listEntries(store)).find(function (item) { return item.entry.id === id; });
  if (!match) return response.status(404).json({ error: 'not_found' });
  await redis(store, [['LREM', LIST_KEY, '1', match.raw]]);
  return response.status(200).json({ ok: true });
}

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (['POST', 'GET', 'DELETE'].indexOf(request.method) === -1) {
    response.setHeader('Allow', 'POST, GET, DELETE');
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  const store = storageConfig();
  if (!store) {
    return request.method === 'POST'
      ? reply(request, response, 503, { error: 'storage_not_connected' })
      : response.status(503).json({ error: 'storage_not_connected' });
  }

  try {
    if (request.method === 'POST') return await saveFeedback(store, request, response);
    if (request.method === 'GET') return await readFeedback(store, request, response);
    return await deleteFeedback(store, request, response);
  } catch (error) {
    console.error('Feedback API error:', error);
    return request.method === 'POST'
      ? reply(request, response, 500, { error: 'server_error' })
      : response.status(500).json({ error: 'server_error' });
  }
};
