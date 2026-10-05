/* Hooked by Design — the 7-day challenge checklist.
   Progress is saved with localStorage, in this browser only.
   No accounts, no cookies, nothing sent anywhere. */
(function () {
  'use strict';

  var KEY = 'hooked-by-design-challenge-v1';
  var DAYS = 7;

  function blank() {
    return { done: {}, keep: {}, hide: false, time: {} };
  }

  // Storage can be blocked (private windows, strict settings), so every use is wrapped.
  var canSave = (function () {
    try {
      var probe = KEY + '-probe';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function load() {
    if (!canSave) return blank();
    try {
      var saved = JSON.parse(window.localStorage.getItem(KEY));
      if (!saved || typeof saved !== 'object') return blank();
      var state = blank();
      state.done = saved.done || {};
      state.keep = saved.keep || {};
      state.hide = !!saved.hide;
      state.time = saved.time || {};
      return state;
    } catch (e) {
      return blank();
    }
  }

  function save() {
    if (!canSave) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* Storage full or blocked: the page still works, it just won't remember. */
    }
  }

  var state = load();

  var doneBoxes = document.querySelectorAll('[data-done]');
  var keepBoxes = document.querySelectorAll('[data-keep]');
  var timeInputs = document.querySelectorAll('[data-time]');
  var hideBox = document.querySelector('[data-hide-progress]');
  var progressWrap = document.querySelector('[data-progress-wrap]');
  var progressText = document.querySelector('[data-progress-text]');
  var progressFill = document.querySelector('[data-progress-fill]');
  var compareEl = document.querySelector('[data-compare]');
  var storageNote = document.querySelector('[data-storage-note]');

  if (!canSave && storageNote) {
    storageNote.textContent = 'Your browser isn’t letting this page save, so your ticks will reset when you leave. Everything else still works.';
  }

  function forEach(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function minutes(prefix) {
    var h = state.time[prefix + '-h'];
    var m = state.time[prefix + '-m'];
    if ((h === undefined || h === '') && (m === undefined || m === '')) return null;
    return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  }

  function describe(total) {
    var h = Math.floor(total / 60);
    var m = total % 60;
    if (h && m) return h + ' h ' + m + ' min';
    if (h) return h + (h === 1 ? ' hour' : ' hours');
    return m + ' min';
  }

  function updateCompare() {
    var before = minutes('day0');
    var after = minutes('day7');
    if (before === null || after === null) {
      compareEl.textContent = before === null && after !== null
        ? 'Add your day 0 number at the top to compare.'
        : '';
      return;
    }
    var diff = after - before;
    if (diff <= -5) {
      compareEl.textContent = 'That’s ' + describe(-diff) + ' less a day than on day 0.';
    } else if (diff >= 5) {
      compareEl.textContent = 'That’s ' + describe(diff) + ' more a day than on day 0. Some weeks are like that — the changes you keep still count.';
    } else {
      compareEl.textContent = 'That’s about the same as on day 0. Useful to know too.';
    }
  }

  function render() {
    var count = 0;
    for (var d = 1; d <= DAYS; d += 1) {
      if (state.done[d]) count += 1;
    }

    forEach(doneBoxes, function (box) {
      var day = box.getAttribute('data-done');
      box.checked = !!state.done[day];
      var card = box.closest('.day');
      if (card) card.classList.toggle('is-done', box.checked);
    });

    forEach(keepBoxes, function (box) {
      box.checked = !!state.keep[box.getAttribute('data-keep')];
    });

    forEach(timeInputs, function (input) {
      var value = state.time[input.getAttribute('data-time')];
      input.value = value === undefined ? '' : value;
    });

    hideBox.checked = state.hide;
    progressWrap.hidden = state.hide;
    progressText.textContent = count + ' of ' + DAYS + ' days done';
    progressFill.style.setProperty('--done', count);
    updateCompare();
  }

  forEach(doneBoxes, function (box) {
    box.addEventListener('change', function () {
      state.done[box.getAttribute('data-done')] = box.checked;
      save();
      render();
    });
  });

  forEach(keepBoxes, function (box) {
    box.addEventListener('change', function () {
      state.keep[box.getAttribute('data-keep')] = box.checked;
      save();
    });
  });

  forEach(timeInputs, function (input) {
    input.addEventListener('input', function () {
      var max = parseInt(input.getAttribute('max'), 10);
      var value = input.value === '' ? '' : Math.max(0, Math.min(parseInt(input.value, 10) || 0, max));
      state.time[input.getAttribute('data-time')] = value;
      save();
      updateCompare();
    });
  });

  hideBox.addEventListener('change', function () {
    state.hide = hideBox.checked;
    save();
    render();
  });

  // Clearing uses an inline "are you sure?", not a pop-up.
  var resetRow = document.querySelector('[data-reset-row]');
  var confirmBox = document.querySelector('[data-confirm]');
  var resetStatus = document.querySelector('[data-reset-status]');

  document.querySelector('[data-reset]').addEventListener('click', function () {
    resetRow.hidden = true;
    confirmBox.hidden = false;
    resetStatus.textContent = '';
    confirmBox.querySelector('[data-reset-no]').focus();
  });

  document.querySelector('[data-reset-no]').addEventListener('click', function () {
    confirmBox.hidden = true;
    resetRow.hidden = false;
    resetRow.querySelector('[data-reset]').focus();
  });

  document.querySelector('[data-reset-yes]').addEventListener('click', function () {
    state = blank();
    if (canSave) {
      try {
        window.localStorage.removeItem(KEY);
      } catch (e) {
        /* ignore */
      }
    }
    render();
    confirmBox.hidden = true;
    resetRow.hidden = false;
    resetStatus.textContent = 'Cleared. Start whenever you like.';
    resetRow.querySelector('[data-reset]').focus();
  });

  render();
})();
