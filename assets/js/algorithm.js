/* Hooked by Design — "train a mini algorithm" (YouTube page).
   A toy recommender: every Watch makes a topic count for more, every
   Not interested makes it count for less, and the feed is re-ranked.
   All videos are made up. Nothing is saved or sent. */
(function () {
  'use strict';

  var root = document.querySelector('[data-trainer]');
  if (!root) return;

  var feedEl = root.querySelector('[data-t-feed]');
  var weightsEl = root.querySelector('[data-t-weights]');
  var statusEl = root.querySelector('[data-t-status]');
  var resetBtn = root.querySelector('[data-t-reset]');

  var TOPICS = [
    {
      id: 'football', name: 'Football', icon: 'i-ball', tint: 't-m2',
      titles: ['Every penalty from the final, ranked', 'I trained like a pro for a week', 'Best goals from school football', 'Why left-footed players are rare', 'Keeper saves in slow motion', 'Rating every football boot I own']
    },
    {
      id: 'gaming', name: 'Gaming', icon: 'i-pad', tint: 't-m1',
      titles: ['I built a whole city in one hour', 'A speedrun record, explained', 'Ranking every boss fight', 'Can you finish it without jumping?', 'Making a game in 48 hours', 'The hardest level ever made']
    },
    {
      id: 'cooking', name: 'Cooking', icon: 'i-pan', tint: 't-m3',
      titles: ['Testing a 3-ingredient dessert', 'Perfect dal, three ways', 'Street-food tour on a tiny budget', 'Baking bread without an oven', 'Rating school canteen snacks', 'One egg, ten breakfasts']
    },
    {
      id: 'music', name: 'Music', icon: 'i-note', tint: 't-m6',
      titles: ['Learning guitar in 30 days', 'Why songs get stuck in your head', 'Drum cover in one take', 'A beat made from kitchen sounds', 'Singing one song in 5 languages', 'Piano for total beginners']
    },
    {
      id: 'science', name: 'Science', icon: 'i-flask', tint: 't-m4',
      titles: ['What happens inside a black hole?', 'Building a tiny water rocket', 'Why the sky is blue, simply', 'The science of sleep', 'Can you boil water on a mountain?', 'How magnets really work']
    },
    {
      id: 'comedy', name: 'Comedy', icon: 'i-smile', tint: 't-m5',
      titles: ['When the teacher says “pair up”', 'Every group project ever', 'My cat reviews my cooking', 'Things only younger siblings know', 'Explaining memes to my dad', 'If school bells could talk']
    }
  ];

  var FEED_SIZE = 6;
  var weights;
  var used;
  var feed;
  var taps;

  function topicById(id) {
    for (var i = 0; i < TOPICS.length; i += 1) {
      if (TOPICS[i].id === id) return TOPICS[i];
    }
    return null;
  }

  // Take the next unused title for a topic. When they run out, start a "part 2".
  function nextVideo(topic) {
    var n = used[topic.id];
    used[topic.id] = n + 1;
    var title = topic.titles[n % topic.titles.length];
    var round = Math.floor(n / topic.titles.length);
    if (round > 0) title += ' (part ' + (round + 1) + ')';
    return { topic: topic.id, title: title, key: topic.id + '-' + n };
  }

  // Share out the 6 slots in proportion to how much it thinks you like each topic,
  // then rank: the topics it believes you like most go to the top.
  function refill() {
    var total = 0;
    TOPICS.forEach(function (t) {
      total += weights[t.id];
    });

    var slots = TOPICS.map(function (t, order) {
      var exact = (FEED_SIZE * weights[t.id]) / total;
      return { topic: t, order: order, count: Math.floor(exact), rest: exact - Math.floor(exact) };
    });

    var given = 0;
    slots.forEach(function (s) {
      given += s.count;
    });

    slots.slice().sort(function (a, b) {
      return b.rest - a.rest || a.order - b.order;
    }).slice(0, FEED_SIZE - given).forEach(function (s) {
      s.count += 1;
    });

    slots.sort(function (a, b) {
      return weights[b.topic.id] - weights[a.topic.id] || a.order - b.order;
    });

    feed = [];
    slots.forEach(function (s) {
      for (var k = 0; k < s.count; k += 1) feed.push(nextVideo(s.topic));
    });
  }

  function share(id) {
    var total = 0;
    TOPICS.forEach(function (t) {
      total += weights[t.id];
    });
    return weights[id] / total;
  }

  function render(focusIndex, focusAction) {
    feedEl.textContent = '';
    feed.forEach(function (video, i) {
      var topic = topicById(video.topic);
      var li = document.createElement('li');
      li.className = 't-video';
      li.style.setProperty('--i', i);
      li.innerHTML =
        '<div class="t-thumb ' + topic.tint + '"><svg class="icon" aria-hidden="true"><use href="#' + topic.icon + '"/></svg></div>' +
        '<div class="t-body">' +
        '<span class="t-topic">' + topic.name + '</span>' +
        '<span class="t-title"></span>' +
        '<div class="t-actions">' +
        '<button type="button" class="t-btn watch" data-action="watch">Watch</button>' +
        '<button type="button" class="t-btn" data-action="nope">Not interested</button>' +
        '</div></div>';
      li.querySelector('.t-title').textContent = video.title;
      li.querySelector('[data-action="watch"]').setAttribute('aria-label', 'Watch: ' + video.title);
      li.querySelector('[data-action="nope"]').setAttribute('aria-label', 'Not interested: ' + video.title);
      li.querySelector('[data-action="watch"]').addEventListener('click', function () {
        act(i, 'watch');
      });
      li.querySelector('[data-action="nope"]').addEventListener('click', function () {
        act(i, 'nope');
      });
      feedEl.appendChild(li);
    });

    // The rows are made once and then updated, so the bars slide to their new size.
    if (!weightsEl.children.length) {
      TOPICS.forEach(function (topic) {
        var li = document.createElement('li');
        li.innerHTML = '<span></span><span class="w-track" aria-hidden="true"><span class="w-fill"></span></span><span class="w-val"></span>';
        li.children[0].textContent = topic.name;
        weightsEl.appendChild(li);
      });
    }
    TOPICS.forEach(function (topic, i) {
      var pct = Math.round(share(topic.id) * 100);
      var li = weightsEl.children[i];
      li.querySelector('.w-fill').style.width = pct + '%';
      li.querySelector('.w-val').textContent = pct + '%';
    });

    if (typeof focusIndex === 'number') {
      var cards = feedEl.querySelectorAll('.t-video');
      var card = cards[Math.min(focusIndex, cards.length - 1)];
      if (card) card.querySelector('[data-action="' + focusAction + '"]').focus();
    }
  }

  function act(index, action) {
    var video = feed[index];
    var topic = topicById(video.topic);
    taps += 1;
    if (action === 'watch') {
      weights[video.topic] = Math.min(weights[video.topic] * 2, 64);
    } else {
      weights[video.topic] = Math.max(weights[video.topic] * 0.35, 0.05);
    }
    // Like refreshing Home: the whole feed is rebuilt from the new weights.
    refill();

    // Describe what changed, honestly and briefly.
    var counts = {};
    feed.forEach(function (v) {
      counts[v.topic] = (counts[v.topic] || 0) + 1;
    });
    var topId = null;
    Object.keys(counts).forEach(function (id) {
      if (topId === null || counts[id] > counts[topId]) topId = id;
    });

    var message;
    if (counts[topId] >= 4) {
      message = counts[topId] + ' of your 6 videos are now ' + topicById(topId).name + '. That took ' + taps + (taps === 1 ? ' tap.' : ' taps.');
    } else if (action === 'watch') {
      message = 'You watched a ' + topic.name + ' video, so ' + topic.name + ' now counts for more.';
    } else {
      message = 'Got it: less ' + topic.name + '.';
    }
    statusEl.textContent = message;
    render(index, action);
  }

  function reset() {
    weights = {};
    used = {};
    TOPICS.forEach(function (t) {
      weights[t.id] = 1;
      used[t.id] = 0;
    });
    taps = 0;
    // Equal weights to start with, so one video from each topic: a bit of everything.
    refill();
    statusEl.textContent = 'Your feed starts with a bit of everything.';
    render();
  }

  resetBtn.addEventListener('click', reset);
  reset();
})();
