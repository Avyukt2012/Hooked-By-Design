/* Hooked by Design — the developer page (admin.html).
   Asks for the admin password, loads every feedback response from
   /api/feedback, and lets the team download them for Excel or delete spam.
   The password is only kept in memory while this page is open. */
(function () {
  'use strict';

  var login = document.querySelector('[data-admin-login]');
  if (!login) return;

  var loginStatus = login.querySelector('[data-admin-status]');
  var results = document.querySelector('[data-admin-results]');
  var stats = document.querySelector('[data-admin-stats]');
  var rows = document.querySelector('[data-admin-rows]');
  var note = document.querySelector('[data-admin-note]');

  var password = '';
  var entries = [];

  var LABELS = {
    role: { student: 'Student', teacher: 'Teacher', other: 'Other' },
    change: { already: 'Already did', probably: 'Probably', no: 'No' }
  };

  var ERRORS = {
    wrong_password: 'That password isn’t right.',
    too_many_attempts: 'Too many wrong passwords. Try again in an hour.',
    no_password_set: 'No admin password has been set yet. Add ADMIN_PASSWORD in Vercel (see the README).',
    storage_not_connected: 'The feedback database isn’t connected yet. Connect it in Vercel (see the README).'
  };

  function api(method, query) {
    return fetch('/api/feedback' + (query || ''), {
      method: method,
      headers: { 'x-admin-password': password },
      cache: 'no-store'
    }).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (body) {
        if (!response.ok) throw new Error(body.error || 'failed');
        return body;
      });
    });
  }

  function message(error) {
    return ERRORS[error.message] || 'Couldn’t load the responses. Check your connection and try again.';
  }

  function when(iso) {
    var date = new Date(iso);
    return isNaN(date) ? '' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function label(group, value) {
    return LABELS[group][value] || '—';
  }

  function cell(tr, text, className) {
    var td = document.createElement('td');
    td.textContent = text;
    if (className) td.className = className;
    tr.appendChild(td);
  }

  function render() {
    var count = entries.length;
    var total = 0;
    var changing = 0;
    var students = 0;
    var teachers = 0;
    entries.forEach(function (entry) {
      total += entry.useful || 0;
      if (entry.change === 'already' || entry.change === 'probably') changing += 1;
      if (entry.role === 'student') students += 1;
      if (entry.role === 'teacher') teachers += 1;
    });

    stats.textContent = '';
    [
      [count, count === 1 ? 'response' : 'responses'],
      [count ? (total / count).toFixed(1) + ' / 5' : '—', 'average usefulness'],
      [changing + ' of ' + count, 'will change a setting'],
      [students + ' · ' + teachers, 'students · teachers']
    ].forEach(function (item) {
      var li = document.createElement('li');
      var b = document.createElement('b');
      b.textContent = item[0];
      li.appendChild(b);
      li.appendChild(document.createTextNode(item[1]));
      stats.appendChild(li);
    });

    rows.textContent = '';
    if (!count) {
      var empty = document.createElement('tr');
      cell(empty, 'No responses yet.', 'empty');
      empty.firstChild.colSpan = 6;
      rows.appendChild(empty);
    }
    entries.forEach(function (entry) {
      var tr = document.createElement('tr');
      cell(tr, when(entry.at));
      cell(tr, label('role', entry.role));
      cell(tr, entry.useful ? String(entry.useful) : '—');
      cell(tr, label('change', entry.change));
      cell(tr, entry.comment || '', 'comment');
      var td = document.createElement('td');
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'delete-btn';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', 'Delete response from ' + when(entry.at));
      remove.addEventListener('click', function () {
        if (!window.confirm('Delete this response? This can’t be undone.')) return;
        api('DELETE', '?id=' + encodeURIComponent(entry.id)).then(function () {
          note.textContent = 'Response deleted.';
          return load();
        }).catch(function (error) {
          note.textContent = message(error);
        });
      });
      td.appendChild(remove);
      tr.appendChild(td);
      rows.appendChild(tr);
    });
  }

  function load() {
    return api('GET').then(function (body) {
      entries = body.entries || [];
      render();
      login.hidden = true;
      results.hidden = false;
    });
  }

  // Excel opens this file directly. Cells that start like a formula are
  // escaped so a comment can never run as a formula.
  function csvCell(value) {
    var text = String(value == null ? '' : value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function downloadCsv() {
    var lines = [['Date', 'Time', 'Who', 'Usefulness (1-5)', 'Will change a setting', 'Comment'].map(csvCell).join(',')];
    entries.forEach(function (entry) {
      var date = new Date(entry.at);
      lines.push([
        date.toLocaleDateString('en-GB'),
        date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        label('role', entry.role),
        entry.useful || '',
        label('change', entry.change),
        entry.comment || ''
      ].map(csvCell).join(','));
    });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hooked-by-design-feedback-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(link.href);
    }, 1000);
  }

  login.addEventListener('submit', function (event) {
    event.preventDefault();
    password = login.elements.password.value;
    loginStatus.textContent = 'Loading…';
    load().then(function () {
      loginStatus.textContent = '';
      note.textContent = '';
    }).catch(function (error) {
      loginStatus.textContent = message(error);
    });
  });

  document.querySelector('[data-admin-csv]').addEventListener('click', downloadCsv);
  document.querySelector('[data-admin-refresh]').addEventListener('click', function () {
    note.textContent = 'Refreshing…';
    load().then(function () {
      note.textContent = 'Up to date.';
    }).catch(function (error) {
      note.textContent = message(error);
    });
  });
})();
