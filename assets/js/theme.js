/* Hooked by Design — runs before the page is drawn.
   Marks that JavaScript is switched on, and applies the dark theme if this
   visitor chose it. The choice is saved only in this browser. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.replace('no-js', 'js');

  try {
    if (window.localStorage.getItem('hooked-by-design-theme') === 'dark') {
      root.setAttribute('data-theme', 'dark');
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#121316');
    }
  } catch (e) {
    /* Storage blocked: stay on the light theme. */
  }
})();
