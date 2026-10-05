/* Hooked by Design — shared behaviour: the mobile menu.
   No tracking, no cookies, no network requests. */
(function () {
  'use strict';

  var button = document.querySelector('[data-menu-button]');
  var nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  var label = button.querySelector('[data-menu-label]');
  var glyph = button.querySelector('use');

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (glyph) glyph.setAttribute('href', open ? '#i-x' : '#i-menu');
  }

  button.addEventListener('click', function () {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  // Escape closes the menu and returns focus to the button.
  nav.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setOpen(false);
      button.focus();
    }
  });

  // Choosing a link closes the menu (useful for links within the same page).
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });
})();
