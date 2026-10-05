/* Hooked by Design — the four Playbook demos.
   Every post, name and video here is made up. Everything runs in your browser:
   no sound, nothing saved, nothing sent. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(root, selector) {
    return root.querySelector(selector);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function icon(id) {
    return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function forEach(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  // Show the "What just happened" panel. Focus moves there only when the visitor asked for it.
  function showReveal(demo, moveFocus) {
    var panel = qs(demo, '[data-reveal]');
    if (!panel) return;
    panel.classList.add('is-shown');
    if (moveFocus) {
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  forEach(document.querySelectorAll('.demo'), function (demo) {
    var button = qs(demo, '[data-reveal-now]');
    if (button) {
      button.addEventListener('click', function () {
        showReveal(demo, true);
      });
    }
  });

  var NAMES = [
    'neha.draws', 'kabir_09', 'zoya.p', 'arjun.codes', 'meera_reads', 'dev.kicks',
    'tara.bakes', 'ishaan.films', 'riya.runs', 'sam_sketches', 'anaya.art', 'vihaan.plays',
    'kiara.k', 'reyansh.r', 'aarav_builds', 'myra.m'
  ];

  var TINTS = ['t-m1', 't-m2', 't-m3', 't-m4', 't-m5', 't-m6'];

  /* ------------------------------------------------------------------
     Demo 1: the feed that never ends
     ------------------------------------------------------------------ */
  (function () {
    var demo = document.getElementById('demo-feed');
    if (!demo) return;

    var feed = qs(demo, '[data-feed]');
    var cover = qs(demo, '[data-feed-cover]');
    var startBtn = qs(demo, '[data-feed-start]');
    var stopBtn = qs(demo, '[data-feed-stop]');
    var postsEl = qs(demo, '[data-feed-posts]');
    var screensEl = qs(demo, '[data-feed-screens]');
    var statusEl = qs(demo, '[data-feed-status]');
    var summaryEl = qs(demo, '[data-feed-summary]');

    var CAPTIONS = [
      'Rating every samosa near school, part 7',
      'Sunset from the bus window',
      'My cat vs the new sofa',
      'Tried the 3-ingredient cake. Results: mixed.',
      'Saturday football, final score 4–4',
      'New sketchbook, first page',
      'Rain again. Of course.',
      'Day 12 of learning guitar',
      'This chai fixed my whole week',
      'Made a tiny city out of paper',
      'Library haul',
      'Science project finally works'
    ];

    var LAYOUTS = [
      ['left:12%;top:14%;width:44%;height:44%;border-radius:50%', 'right:-14%;bottom:-20%;width:66%;height:66%;border-radius:50%'],
      ['left:-8%;bottom:10%;width:76%;height:24%;border-radius:999px', 'right:12%;top:12%;width:32%;height:32%;border-radius:10px;transform:rotate(12deg)'],
      ['left:26%;top:20%;width:48%;height:56%;border-radius:999px 999px 12px 12px', 'left:8%;bottom:8%;width:84%;height:14%;border-radius:8px'],
      ['left:10%;top:10%;width:36%;height:80%;border-radius:12px', 'right:10%;top:30%;width:36%;height:36%;border-radius:50%']
    ];

    var CAUGHT_UP_AFTER = 10;
    var made = 0;
    var seen = 0;
    var maxScreens = 0;
    var live = false;
    var ticking = false;
    var passedCaughtUp = false;
    var said25 = false;
    var said50 = false;

    function photo(i) {
      var layout = LAYOUTS[i % LAYOUTS.length];
      return '<div class="f-img ' + TINTS[i % 6] + '">' +
        '<i class="' + TINTS[(i + 2) % 6] + '" style="' + layout[0] + '"></i>' +
        '<i class="' + TINTS[(i + 4) % 6] + '" style="' + layout[1] + '"></i>' +
        '</div>';
    }

    function post(i, suggested) {
      var user = NAMES[i % NAMES.length];
      var caption = CAPTIONS[(i * 7) % CAPTIONS.length];
      return '<article class="f-post" aria-label="Post ' + (i + 1) + ' by ' + user + '">' +
        '<div class="f-head"><span class="m-avatar ' + TINTS[(i + 1) % 6] + '"></span>' + user +
        (suggested ? '<span class="f-tag">Suggested</span>' : '') + '</div>' +
        photo(i) +
        '<div class="m-actions">' + icon('i-heart') + icon('i-comment') + icon('i-share') + '</div>' +
        '<p class="f-cap"><b>' + user + '</b> ' + caption + '</p>' +
        '</article>';
    }

    function addPosts(n) {
      var html = '';
      for (var k = 0; k < n; k += 1) {
        if (made === CAUGHT_UP_AFTER) {
          html += '<div class="f-caughtup" data-caughtup>' +
            '<span class="tick">' + icon('i-check') + '</span>' +
            '<b>You’re all caught up</b>' +
            '<span>You’ve seen every new post from accounts you follow.</span>' +
            '</div><p class="f-suggest">Suggested for you</p>';
        }
        html += post(made, made >= CAUGHT_UP_AFTER);
        made += 1;
      }
      feed.insertAdjacentHTML('beforeend', html);
    }

    function update() {
      ticking = false;
      var top = feed.scrollTop;
      var view = feed.clientHeight || 1;
      var bottom = top + view;
      var posts = feed.querySelectorAll('.f-post');

      while (seen < posts.length && posts[seen].offsetTop < bottom - 40) {
        seen += 1;
      }
      maxScreens = Math.max(maxScreens, top / view);
      postsEl.textContent = seen;
      screensEl.textContent = maxScreens.toFixed(1);

      // Load more long before the bottom is reached, so there never is a bottom.
      if (feed.scrollHeight - bottom < view * 1.5) addPosts(6);

      var marker = qs(feed, '[data-caughtup]');
      if (!passedCaughtUp && marker && marker.offsetTop + marker.offsetHeight < top) {
        passedCaughtUp = true;
        statusEl.textContent = 'You just scrolled past “all caught up” — and the feed carried on.';
      } else if (seen >= 25 && !said25) {
        said25 = true;
        statusEl.textContent = '25 posts. The feed has quietly loaded more every time you got near the end.';
      } else if (seen >= 50 && !said50) {
        said50 = true;
        statusEl.textContent = '50 posts and still no bottom. There isn’t one.';
      }
    }

    function reset() {
      feed.textContent = '';
      feed.scrollTop = 0;
      made = 0;
      seen = 0;
      maxScreens = 0;
      passedCaughtUp = false;
      said25 = false;
      said50 = false;
      postsEl.textContent = '0';
      screensEl.textContent = '0.0';
      addPosts(14);
    }

    startBtn.addEventListener('click', function () {
      if (startBtn.getAttribute('data-again') === 'true') reset();
      cover.hidden = true;
      feed.classList.add('is-live');
      live = true;
      stopBtn.disabled = false;
      statusEl.textContent = 'Scroll for as long as you like.';
      feed.focus({ preventScroll: true });
      update();
    });

    feed.addEventListener('scroll', function () {
      if (!live || ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    stopBtn.addEventListener('click', function () {
      live = false;
      feed.classList.remove('is-live');
      stopBtn.disabled = true;
      summaryEl.textContent = 'You saw ' + seen + (seen === 1 ? ' post' : ' posts') + ' and scrolled about ' +
        maxScreens.toFixed(1) + ' screens — and the feed never ran out. You stopped because you decided to, not because it ended.';
      statusEl.textContent = 'Stopped. Here’s what just happened.';
      qs(cover, '.cover-title').textContent = 'You stopped after ' + seen + (seen === 1 ? ' post' : ' posts');
      startBtn.textContent = 'Start again';
      startBtn.setAttribute('data-again', 'true');
      cover.hidden = false;
      showReveal(demo, true);
    });

    reset();
  })();

  /* ------------------------------------------------------------------
     Demo 2: beat the autoplay
     ------------------------------------------------------------------ */
  (function () {
    var demo = document.getElementById('demo-autoplay');
    if (!demo) return;

    var player = qs(demo, '[data-ap-player]');
    var progress = qs(demo, '[data-ap-progress]');
    var overlay = qs(demo, '[data-ap-overlay]');
    var ring = qs(demo, '[data-ap-ring]');
    var secondsEl = qs(demo, '[data-ap-seconds]');
    var secondsText = qs(demo, '[data-ap-seconds-text]');
    var titleEl = qs(demo, '[data-ap-title]');
    var startBtn = qs(demo, '[data-ap-start]');
    var resetBtn = qs(demo, '[data-ap-reset]');
    var cancelBtn = qs(demo, '[data-ap-cancel]');
    var playNowBtn = qs(demo, '[data-ap-playnow]');
    var slowBox = qs(demo, '[data-ap-slow]');
    var statusEl = qs(demo, '[data-ap-status]');
    var summaryEl = qs(demo, '[data-ap-summary]');

    var CIRCUMFERENCE = 125.66;
    var FIRST_TITLE = titleEl.textContent;
    var NEXT_TITLE = '10 paper planes, ranked by distance';
    var timer = null;
    var frame = null;
    var endsAt = 0;
    var total = 5;

    function setProgress(p) {
      progress.style.width = (p * 100).toFixed(1) + '%';
    }

    function stopTimers() {
      if (timer) clearInterval(timer);
      if (frame) cancelAnimationFrame(frame);
      timer = null;
      frame = null;
    }

    function reset() {
      stopTimers();
      overlay.hidden = true;
      player.classList.remove('is-next');
      titleEl.textContent = FIRST_TITLE;
      setProgress(0.92);
      startBtn.hidden = false;
      startBtn.disabled = false;
      resetBtn.hidden = true;
      slowBox.disabled = false;
      statusEl.textContent = '';
    }

    function playEnd() {
      startBtn.disabled = true;
      slowBox.disabled = true;
      statusEl.textContent = 'Playing the last few seconds…';
      var from = 0.92;
      var duration = reduceMotion ? 500 : 2200;
      var t0 = performance.now();

      function step(now) {
        var k = Math.min(1, (now - t0) / duration);
        setProgress(from + (1 - from) * k);
        if (k < 1) {
          frame = requestAnimationFrame(step);
        } else {
          startCountdown();
        }
      }
      frame = requestAnimationFrame(step);
    }

    function draw(left) {
      var whole = Math.ceil(left);
      secondsEl.textContent = whole;
      secondsText.textContent = whole === 1 ? '1 second' : whole + ' seconds';
      ring.style.strokeDashoffset = (CIRCUMFERENCE * (1 - left / total)).toFixed(2);
    }

    function startCountdown() {
      total = slowBox.checked ? 15 : 5;
      endsAt = performance.now() + total * 1000;
      overlay.hidden = false;
      startBtn.hidden = true;
      draw(total);
      statusEl.textContent = 'The video ended. The next one starts in ' + total + ' seconds unless you press Cancel.';
      cancelBtn.focus();
      timer = setInterval(function () {
        var left = Math.max(0, (endsAt - performance.now()) / 1000);
        draw(left);
        if (left <= 0) autoplay(false);
      }, 100);
    }

    function cancel() {
      var left = Math.max(0, (endsAt - performance.now()) / 1000);
      stopTimers();
      overlay.hidden = true;
      resetBtn.hidden = false;
      statusEl.textContent = 'You stopped it with ' + left.toFixed(1) + ' seconds to spare.';
      summaryEl.textContent = 'You beat the countdown with ' + left.toFixed(1) +
        ' seconds left. Notice that stopping took a decision and a quick tap — while carrying on would have taken nothing at all.';
      showReveal(demo, false);
      resetBtn.focus();
    }

    function autoplay(chosen) {
      stopTimers();
      overlay.hidden = true;
      player.classList.add('is-next');
      titleEl.textContent = NEXT_TITLE;
      setProgress(0);
      resetBtn.hidden = false;

      if (chosen) {
        statusEl.textContent = 'You chose to play the next video.';
        summaryEl.textContent = 'You chose to keep watching — which is fine when it’s a real choice. The catch is that autoplay does exactly the same thing when you don’t choose.';
      } else {
        statusEl.textContent = 'Too late — the next video started. You didn’t choose it; the default did.';
        summaryEl.textContent = 'The countdown ran out and the next video started on its own. You didn’t choose it; the default did.';
      }

      // Let the new video's progress bar creep along, as if it is playing.
      if (!reduceMotion) {
        var t0 = performance.now();
        var creep = function (now) {
          var k = Math.min(1, (now - t0) / 60000);
          setProgress(k);
          if (k < 1 && player.classList.contains('is-next')) frame = requestAnimationFrame(creep);
        };
        frame = requestAnimationFrame(creep);
      }

      showReveal(demo, false);
      resetBtn.focus();
    }

    startBtn.addEventListener('click', playEnd);
    cancelBtn.addEventListener('click', cancel);
    playNowBtn.addEventListener('click', function () {
      autoplay(true);
    });
    resetBtn.addEventListener('click', function () {
      reset();
      startBtn.focus();
    });

    reset();
  })();

  /* ------------------------------------------------------------------
     Demo 3: pull to refresh (a slot machine in disguise)
     ------------------------------------------------------------------ */
  (function () {
    var demo = document.getElementById('demo-refresh');
    if (!demo) return;

    var area = qs(demo, '[data-pull-area]');
    var content = qs(demo, '[data-pull-content]');
    var pullEl = qs(demo, '.r-pull');
    var labelEl = qs(demo, '[data-pull-label]');
    var reels = demo.querySelectorAll('[data-reel]');
    var result = qs(demo, '[data-pull-result]');
    var kindEl = qs(demo, '[data-pull-kind]');
    var textEl = qs(demo, '[data-pull-text]');
    var countEl = qs(demo, '[data-pull-count]');
    var goodEl = qs(demo, '[data-pull-good]');
    var statusEl = qs(demo, '[data-pull-status]');
    var summaryEl = qs(demo, '[data-pull-summary]');
    var button = qs(demo, '[data-pull-button]');

    // Weights add up to 100: big wins are rare, "nothing much" is common.
    var OUTCOMES = [
      { w: 14, kind: 'jackpot', reels: ['i-star', 'i-star', 'i-star'], text: 'Your best friend just posted for the first time in weeks!' },
      { w: 8, kind: 'jackpot', reels: ['i-heart', 'i-heart', 'i-heart'], text: '24 new likes on your post!' },
      { w: 12, kind: 'small', reels: ['i-heart', 'i-heart', 'i-empty'], text: '2 new posts from people you follow.' },
      { w: 12, kind: 'small', reels: ['i-comment', 'i-comment', 'i-tag'], text: 'Someone replied to your comment.' },
      { w: 18, kind: 'none', reels: ['i-tag', 'i-empty', 'i-heart'], text: 'An ad for shoes you looked at once.' },
      { w: 18, kind: 'none', reels: ['i-empty', 'i-comment', 'i-empty'], text: 'Nothing new. Just posts you’ve already seen.' },
      { w: 18, kind: 'none', reels: ['i-star', 'i-empty', 'i-tag'], text: 'A suggested post from someone you don’t know.' }
    ];
    var SYMBOLS = ['i-star', 'i-heart', 'i-comment', 'i-tag', 'i-empty'];

    var count = 0;
    var good = 0;
    var jackpots = 0;
    var busy = false;
    var startY = null;
    var pointerId = null;
    var shift = 0;
    var READY = 56;

    function setReel(el, id) {
      el.innerHTML = icon(id);
    }

    function choose() {
      if (count === 3 && jackpots === 0) return OUTCOMES[0];
      var roll = Math.random() * 100;
      var sum = 0;
      for (var i = 0; i < OUTCOMES.length; i += 1) {
        sum += OUTCOMES[i].w;
        if (roll < sum) return OUTCOMES[i];
      }
      return OUTCOMES[OUTCOMES.length - 1];
    }

    function narrate() {
      if (count === 1) return 'One pull. What will the next one bring?';
      if (count === 3) return 'Notice you can’t predict it?';
      if (count === 5) return 'Five pulls. Keep going if you like — or read what just happened below.';
      if (count === 10) return 'Ten pulls. The “maybe this time” feeling doesn’t wear off, does it?';
      return statusEl.textContent;
    }

    function land(outcome) {
      forEach(reels, function (reel) {
        reel.removeAttribute('data-done');
      });
      if (outcome.kind !== 'none') good += 1;
      if (outcome.kind === 'jackpot') {
        jackpots += 1;
        result.classList.add('is-jackpot');
        forEach(reels, function (reel) {
          reel.classList.add('is-win');
        });
      }
      kindEl.textContent = outcome.kind === 'jackpot' ? 'Jackpot!' : outcome.kind === 'small' ? 'Something new' : 'Meh';
      textEl.textContent = outcome.text;
      countEl.textContent = count;
      goodEl.textContent = good;
      pullEl.classList.remove('is-loading', 'is-ready');
      labelEl.textContent = 'Pull down to refresh';
      button.disabled = false;
      busy = false;
      statusEl.textContent = narrate();
      summaryEl.textContent = 'You refreshed ' + count + (count === 1 ? ' time' : ' times') + ': ' + good +
        (good === 1 ? ' pull' : ' pulls') + ' brought something good, and ' + (count - good) + ' brought nothing much.';
      if (count === 5) showReveal(demo, false);
    }

    function refresh() {
      if (busy) return;
      busy = true;
      count += 1;
      button.disabled = true;
      pullEl.classList.add('is-loading');
      labelEl.textContent = 'Refreshing…';
      result.classList.remove('is-jackpot');
      kindEl.textContent = 'Loading';
      textEl.textContent = '…';
      forEach(reels, function (reel) {
        reel.classList.remove('is-win');
      });

      var outcome = choose();
      var spin = reduceMotion ? 0 : 900;
      var stops = [spin * 0.55, spin * 0.8, spin];
      var t0 = performance.now();
      var timer = setInterval(function () {
        var t = performance.now() - t0;
        forEach(reels, function (reel, i) {
          if (t < stops[i]) {
            setReel(reel, pick(SYMBOLS));
          } else if (!reel.hasAttribute('data-done')) {
            setReel(reel, outcome.reels[i]);
            reel.setAttribute('data-done', '');
          }
        });
        if (t >= spin) {
          clearInterval(timer);
          land(outcome);
        }
      }, 70);
    }

    area.addEventListener('pointerdown', function (event) {
      if (busy || (event.pointerType === 'mouse' && event.button !== 0)) return;
      startY = event.clientY;
      pointerId = event.pointerId;
      shift = 0;
      area.setPointerCapture(pointerId);
      area.classList.add('is-pulling');
      content.classList.add('is-dragging');
    });

    area.addEventListener('pointermove', function (event) {
      if (startY === null || event.pointerId !== pointerId) return;
      shift = Math.min(Math.max(0, event.clientY - startY) * 0.55, 96);
      content.style.transform = 'translateY(' + shift + 'px)';
      var ready = shift >= READY;
      pullEl.classList.toggle('is-ready', ready);
      labelEl.textContent = ready ? 'Release to refresh' : 'Pull down to refresh';
    });

    function endPull() {
      if (startY === null) return;
      startY = null;
      area.classList.remove('is-pulling');
      content.classList.remove('is-dragging');
      content.style.transform = '';
      if (shift >= READY) {
        refresh();
      } else {
        pullEl.classList.remove('is-ready');
        labelEl.textContent = 'Pull down to refresh';
      }
      shift = 0;
    }

    area.addEventListener('pointerup', endPull);
    area.addEventListener('pointercancel', endPull);
    button.addEventListener('click', refresh);
  })();

  /* ------------------------------------------------------------------
     Demo 4: likes trickle in
     ------------------------------------------------------------------ */
  (function () {
    var demo = document.getElementById('demo-likes');
    if (!demo) return;

    var banner = qs(demo, '[data-like-banner]');
    var bannerText = qs(demo, '[data-like-banner-text]');
    var countEl = qs(demo, '[data-like-count]');
    var totalEl = qs(demo, '[data-like-total]');
    var timeEl = qs(demo, '[data-like-time]');
    var ticks = qs(demo, '[data-like-ticks]');
    var startBtn = qs(demo, '[data-like-start]');
    var awayBtn = qs(demo, '[data-like-away-button]');
    var away = qs(demo, '[data-like-away]');
    var awaySeconds = qs(demo, '[data-like-away-seconds]');
    var statusEl = qs(demo, '[data-like-status]');
    var summaryEl = qs(demo, '[data-like-summary]');
    var heart = qs(demo, '.l-heart');

    var DURATION = 30000;
    var t0 = 0;
    var likes = 0;
    var awayLikes = 0;
    var awayTotal = 0;
    var isAway = false;
    var running = false;
    var nextTimer = null;
    var clockTimer = null;
    var awayTimer = null;
    var bannerTimer = null;

    // Random gaps between likes: mostly short, sometimes long.
    function gap() {
      var d = -Math.log(1 - Math.random()) * 1400;
      return Math.max(250, Math.min(d, 6000));
    }

    function addLike(t) {
      likes += 1;
      var tick = document.createElement('span');
      tick.className = 'l-tick';
      tick.style.left = Math.min(100, (t / DURATION) * 100).toFixed(2) + '%';
      if (isAway) {
        awayLikes += 1;
        awayTotal += 1;
        tick.className += ' away';
        tick.hidden = true;
      }
      ticks.appendChild(tick);

      if (!isAway) {
        countEl.textContent = likes;
        totalEl.textContent = likes;
        bannerText.textContent = pick(NAMES) + ' liked your photo';
        banner.classList.add('is-shown');
        clearTimeout(bannerTimer);
        bannerTimer = setTimeout(function () {
          banner.classList.remove('is-shown');
        }, 1400);
        if (!reduceMotion) {
          heart.classList.remove('is-pop');
          void heart.offsetWidth;
          heart.classList.add('is-pop');
        }
      }
    }

    function scheduleNext() {
      nextTimer = setTimeout(function () {
        var t = performance.now() - t0;
        if (!running || t >= DURATION) return;
        addLike(t);
        scheduleNext();
      }, gap());
    }

    function comeBack() {
      clearInterval(awayTimer);
      isAway = false;
      away.hidden = true;
      countEl.textContent = likes;
      totalEl.textContent = likes;
      forEach(ticks.querySelectorAll('.l-tick[hidden]'), function (tick) {
        tick.hidden = false;
      });
      statusEl.textContent = 'While you were away: +' + awayLikes + (awayLikes === 1 ? ' like' : ' likes') +
        '. The same likes arrived — you just didn’t watch them come in.';
      if (running) awayBtn.disabled = false;
    }

    function goAway() {
      if (!running || isAway) return;
      isAway = true;
      awayLikes = 0;
      awayBtn.disabled = true;
      away.hidden = false;
      banner.classList.remove('is-shown');
      var left = 10;
      awaySeconds.textContent = left;
      statusEl.textContent = 'Phone down for 10 seconds.';
      awayTimer = setInterval(function () {
        left -= 1;
        awaySeconds.textContent = left;
        if (left <= 0) comeBack();
      }, 1000);
    }

    function finish() {
      running = false;
      clearTimeout(nextTimer);
      clearInterval(clockTimer);
      if (isAway) comeBack();
      awayBtn.disabled = true;
      startBtn.disabled = false;
      startBtn.textContent = 'Post another photo';
      timeEl.textContent = '0';
      statusEl.textContent = 'Time’s up: ' + likes + (likes === 1 ? ' like' : ' likes') + ' in 30 seconds.';
      summaryEl.textContent = 'In 30 seconds your photo got ' + likes + (likes === 1 ? ' like' : ' likes') +
        ', arriving at random moments' +
        (awayTotal > 0 ? ' — ' + awayTotal + ' of them while your phone was face down' : '') + '.';
      showReveal(demo, false);
    }

    function start() {
      clearTimeout(nextTimer);
      clearInterval(clockTimer);
      clearInterval(awayTimer);
      ticks.textContent = '';
      likes = 0;
      awayLikes = 0;
      awayTotal = 0;
      isAway = false;
      away.hidden = true;
      countEl.textContent = '0';
      totalEl.textContent = '0';
      timeEl.textContent = '30';
      running = true;
      t0 = performance.now();
      startBtn.disabled = true;
      awayBtn.disabled = false;
      statusEl.textContent = 'Posted. Now watch the likes…';
      scheduleNext();
      clockTimer = setInterval(function () {
        var t = performance.now() - t0;
        timeEl.textContent = Math.max(0, Math.ceil((DURATION - t) / 1000));
        if (t >= DURATION) finish();
      }, 250);
    }

    startBtn.addEventListener('click', start);
    awayBtn.addEventListener('click', goAway);
  })();
})();
