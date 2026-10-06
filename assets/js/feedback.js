/* Hooked by Design — the feedback form (feedback.html).
   Checks the two required answers, sends the form to /api/feedback and says
   thank you. Without JavaScript the form still works as a normal form. */
(function () {
  'use strict';

  var form = document.querySelector('[data-feedback-form]');
  if (!form) return;

  var button = form.querySelector('button[type="submit"]');
  var status = form.querySelector('[data-feedback-status]');
  var thanks = document.getElementById('thanks');

  var REQUIRED = {
    role: 'Choose student, teacher or other.',
    useful: 'Pick a number from 1 to 5.'
  };

  var PROBLEMS = {
    too_many: 'You’ve sent a lot of feedback in the last hour. Thank you! Please try again later.',
    storage_not_connected: 'Feedback isn’t switched on yet. Please try again soon.'
  };

  // We show our own messages instead of the browser's pop-up bubbles.
  form.noValidate = true;

  function setError(name, message) {
    var group = form.querySelector('[data-q="' + name + '"]');
    group.classList.toggle('has-error', !!message);
    group.querySelector('[data-error]').textContent = message;
  }

  form.addEventListener('change', function (event) {
    if (!REQUIRED[event.target.name]) return;
    setError(event.target.name, '');
    if (!form.querySelector('.has-error')) status.textContent = '';
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });

    var missing = Object.keys(REQUIRED).filter(function (name) {
      return !data[name];
    });
    Object.keys(REQUIRED).forEach(function (name) {
      setError(name, missing.indexOf(name) === -1 ? '' : REQUIRED[name]);
    });
    if (missing.length) {
      status.textContent = 'Please answer the first two questions.';
      form.querySelector('input[name="' + missing[0] + '"]').focus();
      return;
    }

    button.disabled = true;
    status.textContent = 'Sending…';

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (body) {
        if (!response.ok) {
          var problem = new Error(body.error || 'failed');
          problem.status = response.status;
          throw problem;
        }
      });
    }).then(function () {
      form.hidden = true;
      thanks.classList.add('is-shown');
      thanks.focus();
    }).catch(function (error) {
      if (window.console) console.error('Feedback not sent:', error.status || '', error.message);

      if (!error.status && !PROBLEMS[error.message]) {
        // The browser couldn't reach the server (some school networks and
        // extensions block this kind of request). Send it as a normal form
        // instead: the server answers by opening the thank-you message.
        status.textContent = 'Sending…';
        form.submit();
        return;
      }

      if (PROBLEMS[error.message]) {
        status.textContent = PROBLEMS[error.message];
      } else {
        // The server answered with an error: show its code, so we can fix it.
        status.textContent = 'Sorry, that didn’t send (error ' + error.status + (error.message !== 'failed' ? ', ' + error.message : '') + '). Please try again in a minute.';
      }
      button.disabled = false;
    });
  });
})();
