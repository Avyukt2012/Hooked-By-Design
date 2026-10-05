/* Hooked by Design — "Which hook gets you most?" quiz (home page)
   Runs entirely in the browser. Nothing is stored or sent anywhere. */
(function () {
  'use strict';

  var root = document.querySelector('[data-quiz]');
  if (!root) return;

  // The nine hooks. "read" points to the Playbook, "fix" to the setting that turns it down.
  var HOOKS = {
    vr: {
      name: 'Variable rewards',
      text: 'The “what’s next?” itch gets you. Every swipe might be the good one, so you keep checking.',
      read: 'playbook.html#variable-rewards',
      fix: 'youtube.html#shorts',
      fixLabel: 'Set a Shorts limit'
    },
    nsc: {
      name: 'No stopping cues',
      text: 'You keep going because nothing tells you to stop: the feed has no bottom, and the next video starts by itself.',
      read: 'playbook.html#no-stopping-cues',
      fix: 'youtube.html#autoplay',
      fixLabel: 'Turn off autoplay'
    },
    sv: {
      name: 'Social validation',
      text: 'Likes, views and comments feel good, so checking how your posts are doing is hard to resist.',
      read: 'playbook.html#social-validation',
      fix: 'instagram.html#likes',
      fixLabel: 'Hide like counts'
    },
    pers: {
      name: 'Personalisation',
      text: 'The app knows your taste really well, so there’s always one more thing you want to see.',
      read: 'playbook.html#personalisation',
      fix: 'instagram.html#recommendations',
      fixLabel: 'Reset your suggestions'
    },
    trig: {
      name: 'Triggers',
      text: 'Buzzes, badges and red dots pull you back in — and once you’re in, it’s easy to stay.',
      read: 'playbook.html#triggers',
      fix: 'instagram.html#notifications',
      fixLabel: 'Mute notifications'
    },
    fomo: {
      name: 'FOMO and scarcity',
      text: 'Things that disappear make you check now, just in case you miss something.',
      read: 'playbook.html#fomo',
      fix: 'instagram.html#stories',
      fixLabel: 'Mute Stories you check out of habit'
    },
    loss: {
      name: 'Loss aversion and investment',
      text: 'You’ve built something — followers, subscriptions, a feed that gets you — and you keep coming back to look after it.',
      read: 'playbook.html#loss-aversion',
      fix: 'challenge.html',
      fixLabel: 'Try the 7-day challenge'
    },
    unf: {
      name: 'Unfinished tasks',
      text: 'Unwatched Stories and half-finished playlists nag at you until you close the loop.',
      read: 'playbook.html#unfinished-tasks',
      fix: 'youtube.html#autoplay',
      fixLabel: 'Stop the queue playing itself'
    },
    sp: {
      name: 'Social pressure',
      text: 'You feel you owe people a quick reply or reaction, so you keep checking.',
      read: 'playbook.html#social-pressure',
      fix: 'instagram.html#seen',
      fixLabel: 'Turn off “Seen”'
    }
  };

  var ORDER = ['vr', 'nsc', 'sv', 'pers', 'trig', 'fomo', 'loss', 'unf', 'sp'];

  var QUESTIONS = [
    {
      q: 'You open YouTube to watch one video. What keeps you there longest?',
      a: [
        ['The next video just starts playing', 'nsc'],
        ['My subscriptions — I’ve built up channels I love', 'loss'],
        ['Swiping through Shorts to see what comes next', 'vr'],
        ['Finishing a playlist or the Up next queue', 'unf']
      ]
    },
    {
      q: 'Your phone buzzes while you’re doing homework. You…',
      a: [
        ['Check it straight away — it could be anything', 'trig'],
        ['Check if someone liked or commented on my post', 'sv'],
        ['Check because someone might be waiting for a reply', 'sp'],
        ['Check in case something’s happening right now', 'fomo']
      ]
    },
    {
      q: 'On Instagram, what’s hardest to leave alone?',
      a: [
        ['Stories, before they disappear', 'fomo'],
        ['The rings around Stories I haven’t watched yet', 'unf'],
        ['The likes on my latest post', 'sv'],
        ['Reels that seem to know exactly what I like', 'pers']
      ]
    },
    {
      q: 'Which would bother you most?',
      a: [
        ['Losing followers, or the posts I’ve built up', 'loss'],
        ['Leaving a friend on “Seen”', 'sp'],
        ['Missing a live or a Story before it’s gone', 'fomo'],
        ['Not knowing what’s new in my feed', 'vr']
      ]
    },
    {
      q: 'What usually makes you stop scrolling?',
      a: [
        ['Something interrupts me — the feed never ends', 'nsc'],
        ['I get bored, but the app keeps finding things I like', 'pers'],
        ['Not much — another notification pulls me back in', 'trig'],
        ['I keep refreshing to see if there’s anything new', 'vr']
      ]
    }
  ];

  var steps = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-quiz-step]'), function (el) {
    steps[el.getAttribute('data-quiz-step')] = el;
  });

  var progressEl = root.querySelector('[data-quiz-progress]');
  var questionEl = root.querySelector('[data-quiz-question]');
  var optionsEl = root.querySelector('[data-quiz-options]');
  var titleEl = root.querySelector('[data-quiz-result-title]');
  var textEl = root.querySelector('[data-quiz-result-text]');
  var runnerEl = root.querySelector('[data-quiz-runner-up]');
  var readEl = root.querySelector('[data-quiz-read]');
  var fixEl = root.querySelector('[data-quiz-fix]');

  var index = 0;
  var answers = [];
  var locked = false;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(name) {
    Object.keys(steps).forEach(function (key) {
      steps[key].hidden = key !== name;
    });
  }

  function renderQuestion() {
    var item = QUESTIONS[index];
    progressEl.textContent = 'Question ' + (index + 1) + ' of ' + QUESTIONS.length;
    questionEl.textContent = item.q;
    optionsEl.textContent = '';
    locked = false;

    // Restart the little entrance animation for each new question.
    questionEl.classList.remove('is-entering');
    void questionEl.offsetWidth;
    questionEl.classList.add('is-entering');

    item.a.forEach(function (opt, i) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.style.setProperty('--i', i);

      var key = document.createElement('span');
      key.className = 'option-key';
      key.setAttribute('aria-hidden', 'true');
      key.textContent = 'ABCD'.charAt(i);

      var label = document.createElement('span');
      label.textContent = opt[0];

      button.appendChild(key);
      button.appendChild(label);
      // Show which answer was picked for a moment before moving on.
      button.addEventListener('click', function () {
        if (locked) return;
        locked = true;
        button.classList.add('is-chosen');
        window.setTimeout(function () {
          choose(opt[1]);
        }, reduceMotion ? 0 : 280);
      });
      optionsEl.appendChild(button);
    });

    show('question');
    questionEl.focus();
  }

  function choose(hook) {
    answers.push(hook);
    index += 1;
    if (index < QUESTIONS.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }

  function firstChosen(key) {
    var i = answers.indexOf(key);
    return i === -1 ? 99 : i;
  }

  function renderResult() {
    var scores = {};
    ORDER.forEach(function (key) {
      scores[key] = 0;
    });
    answers.forEach(function (key) {
      scores[key] += 1;
    });

    // Highest score wins; a tie goes to the hook you picked first.
    var ranked = ORDER.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      return firstChosen(a) - firstChosen(b);
    });

    var top = HOOKS[ranked[0]];
    var second = scores[ranked[1]] > 0 ? HOOKS[ranked[1]] : null;

    titleEl.textContent = top.name;
    textEl.textContent = top.text;
    runnerEl.textContent = second ? 'Close behind: ' + second.name + '.' : '';
    readEl.href = top.read;
    fixEl.href = top.fix;
    fixEl.textContent = top.fixLabel;

    show('result');
    titleEl.focus();
  }

  function start() {
    index = 0;
    answers = [];
    renderQuestion();
  }

  root.querySelector('[data-quiz-start]').addEventListener('click', start);
  root.querySelector('[data-quiz-restart]').addEventListener('click', start);
})();
