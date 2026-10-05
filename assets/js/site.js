/* Hooked by Design — shared behaviour: the phone menu, the light/dark switch,
   and the gentle animations as you scroll.
   No tracking, no cookies, no network requests. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function forEach(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------- Phone menu ---------- */
  (function () {
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

  /* ---------- Light and dark theme ---------- */
  (function () {
    var KEY = 'hooked-by-design-theme';
    var button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    var meta = document.querySelector('meta[name="theme-color"]');

    function isDark() {
      return root.getAttribute('data-theme') === 'dark';
    }

    function sync() {
      var dark = isDark();
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      if (meta) meta.setAttribute('content', dark ? '#161412' : '#f6f2ea');
    }

    function apply(dark) {
      if (dark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      try {
        if (dark) {
          window.localStorage.setItem(KEY, 'dark');
        } else {
          window.localStorage.removeItem(KEY);
        }
      } catch (e) {
        /* Storage blocked: the switch still works until the page is closed. */
      }
      sync();
    }

    button.addEventListener('click', function () {
      var dark = !isDark();
      if (reduceMotion || !document.startViewTransition) {
        apply(dark);
        return;
      }

      // Grow the new theme out of the button in a circle.
      var rect = button.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      function done() {
        root.classList.remove('theme-switching');
      }

      root.classList.add('theme-switching');
      var transition = document.startViewTransition(function () {
        apply(dark);
      });
      transition.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }, done);
      transition.finished.then(done, done);
    });

    sync();
  })();

  /* ---------- A soft line under the header once you scroll ---------- */
  (function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;

    function update() {
      ticking = false;
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  })();

  /* ---------- Gentle animations as things scroll into view ---------- */
  (function () {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    // Things that fade up as they arrive. Anything inside one of these is
    // left alone, so nothing animates twice.
    var REVEAL = [
      '.section-head', '.card', '.callout', '.demo', '.route', '.feature',
      '.loop > li', '.flow > li', '.questions > li', '.promise-list > li',
      '.team > li', '.asked > li', '.legend > li', '.teardown-phone',
      '.key-idea', '.prose > p', '.sources-title', '.sources', '.lost'
    ].join(',');

    // Charts that draw themselves, and numbers that count up.
    var CHARTS = '.dots, .units, .bars';
    var COUNTS = '.finding-count, .big-stat .num, .big-num, .tie-num';

    function countUp(el) {
      var live = el.querySelector('.countup-live');
      var parts = el.countParts;
      if (!live || !parts) return;
      var start = null;
      var duration = 1200;

      function frame(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        live.setAttribute('data-text', parts[0] + Math.round(parts[1] * eased) + parts[2]);
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.setTimeout(function () {
        window.requestAnimationFrame(frame);
      }, 250);
    }

    var observer = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        if (el.classList.contains('will-reveal')) {
          // Things arriving together come in one after another.
          el.style.setProperty('--reveal-delay', Math.min(shown, 5) * 90 + 'ms');
          shown += 1;
        }
        el.classList.add('is-visible');
        if (el.countParts) countUp(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    forEach(document.querySelectorAll(REVEAL), function (el) {
      if (el.parentElement.closest('.will-reveal')) return;
      // The page headers have their own entrance (see the CSS).
      if (el.closest('.home-hero, .page-hero') && !el.matches('.teardown-phone, .legend > li')) return;
      el.classList.add('will-reveal');
      observer.observe(el);
    });

    forEach(document.querySelectorAll(CHARTS), function (chart) {
      forEach(chart.children, function (child, i) {
        child.style.setProperty('--i', i);
      });
      chart.classList.add('will-animate');
      observer.observe(chart);
    });

    // Pins on the app drawings pop in by number.
    forEach(document.querySelectorAll('.pin'), function (pin) {
      pin.style.setProperty('--i', (parseInt(pin.textContent, 10) || 1) - 1);
    });

    // "15 of 21" counts up from 0. Screen readers get the real text straight away.
    forEach(document.querySelectorAll(COUNTS), function (el) {
      var text = el.textContent;
      var match = /^(\D*)(\d+)([\s\S]*)$/.exec(text);
      if (!match || parseInt(match[2], 10) < 3) return;
      el.countParts = [match[1], parseInt(match[2], 10), match[3]];
      el.innerHTML = '<span class="visually-hidden"></span>' +
        '<span class="countup" aria-hidden="true"><span class="countup-ghost"></span><span class="countup-live"></span></span>';
      el.querySelector('.visually-hidden').textContent = text;
      // The animated copies are drawn by CSS, so copying the text gives "15 of 21" once.
      el.querySelector('.countup-ghost').setAttribute('data-text', text);
      el.querySelector('.countup-live').setAttribute('data-text', match[1] + '0' + match[3]);
      observer.observe(el);
    });
  })();
})();
