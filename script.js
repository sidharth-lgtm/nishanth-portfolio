/* ================================================================
   NISHANTH KRISHNAN — ANIMATION DIRECTOR PORTFOLIO
   script.js
   ================================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     LENIS — Smooth Scroll
  --------------------------------------------------------------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    direction: 'vertical',
    smoothTouch: false,
  });

  function lenisRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  }
  requestAnimationFrame(lenisRaf);

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* ---------------------------------------------------------------
     GSAP REGISTER
  --------------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------
     NAV — Hidden on load → fades in on first scroll
          Transparent → frosted glass after 80px
  --------------------------------------------------------------- */
  const nav = document.getElementById('nav');

  // Show nav immediately on load — no scroll required
  nav.classList.add('nav--visible');

  // Frosted glass effect past 80px
  ScrollTrigger.create({
    start: '80px top',
    onEnter:     () => nav.classList.add('nav--scrolled'),
    onLeaveBack: () => nav.classList.remove('nav--scrolled'),
  });

  /* ---------------------------------------------------------------
     NAV — Mobile menu toggle
  --------------------------------------------------------------- */
  const menuBtn    = document.querySelector('.nav__menu-btn');
  const navDrawer  = document.getElementById('navDrawer');
  const drawerLinks = document.querySelectorAll('.nav__drawer-link');

  function closeDrawer() {
    menuBtn.classList.remove('is-open');
    navDrawer.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.classList.toggle('is-open');
    navDrawer.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  /* ---------------------------------------------------------------
     SMOOTH ANCHOR SCROLL
  --------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -92, duration: 1.4 });
    });
  });

  /* ---------------------------------------------------------------
     HERO — Cinematic entry sequence
     Order: bars → scrim → name → title → tagline → CTA → hint
  --------------------------------------------------------------- */

  // Set scrim to full black before sequence begins
  gsap.set('.hero__scrim', { opacity: 1 });

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    // 1. Letterbox bars slide in from top and bottom — pure GSAP
    .fromTo('#barTop',
      { height: 0 },
      { height: '8vh', duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      0
    )
    .fromTo('#barBottom',
      { height: 0 },
      { height: '8vh', duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      0
    )

    // 2. Scrim dissolves to working opacity as bars finish
    .to('.hero__scrim',
      { opacity: 0.55, duration: 0.8, ease: 'power2.out' },
      0.2
    )

    // 3. Name lines stagger up (delay 0.5s from start)
    .fromTo('.hero__name-line',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.18 },
      0.5
    )

    // 4. Title label (+0.2s after name starts)
    .fromTo('#heroTitle',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.7
    )

    // 5. Tagline (+0.2s stagger)
    .fromTo('#heroTagline',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.9
    )

    // 6. CTA button (+0.2s stagger)
    .fromTo('#heroCta',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6 },
      1.1
    )

    // 7. Scroll hint fades in last
    .fromTo('#scrollHint',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' },
      1.4
    );

  /* ---------------------------------------------------------------
     HERO — Content fades out + scales down as user scrolls
  --------------------------------------------------------------- */
  gsap.to('#heroContent', {
    opacity: 0,
    scale: 0.94,
    y: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'center top',
      scrub: true,
    },
  });

  // Scroll hint fades out quickly
  gsap.to('#scrollHint', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '15% top',
      scrub: true,
    },
  });

  /* ---------------------------------------------------------------
     HERO — Video hover parallax (subtle)
  --------------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    document.addEventListener('mousemove', (e) => {
      const xPct = (e.clientX / window.innerWidth  - 0.5) * 2;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(heroVideo, {
        x: xPct * 12,
        y: yPct * 8,
        duration: 2.5,
        ease: 'power1.out',
      });
    });
  }

  /* ---------------------------------------------------------------
     HERO — Scroll parallax (video drifts down)
  --------------------------------------------------------------- */
  gsap.to('.hero__video-wrap', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  /* ---------------------------------------------------------------
     SCROLL REVEALS — Generic .reveal-up and .reveal-left
     (used by About, Clients, Contact sections)
  --------------------------------------------------------------- */
  function setupReveal(selector, xFrom = 0, yFrom = 36) {
    document.querySelectorAll(selector).forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, x: xFrom, y: yFrom },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 95%',
            once: true,
          },
        }
      );
    });
  }

  setupReveal('.reveal-up',   0,   36);
  setupReveal('.reveal-left', -40,  0);

  /* ---------------------------------------------------------------
     WORK — Slate label reveal
  --------------------------------------------------------------- */
  gsap.to(['.work__slate-label', '.work__slate-count'], {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '#work',
      start: 'top 95%',
      once: true,
    },
  });

  /* ---------------------------------------------------------------
     WORK CARDS — Staggered entry
  --------------------------------------------------------------- */
  gsap.to('.work__card', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.work__grid',
      start: 'top 95%',
      once: true,
    },
  });

  /* ---------------------------------------------------------------
     WORK CARDS — Video preview (GSAP-controlled opacity)
  --------------------------------------------------------------- */
  document.querySelectorAll('.work__card').forEach((card) => {
    const video = card.querySelector('.work__card-video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
      gsap.to(video, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(video, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          video.pause();
          video.currentTime = 0;
        },
      });
    });
  });

  /* ---------------------------------------------------------------
     WORK CARDS — 3D mouse-tracking tilt
  --------------------------------------------------------------- */
  document.querySelectorAll('.work__card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -5;
      const ry = ((x - cx) / cx) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';
      card.style.boxShadow = '0 20px 60px rgba(200,169,110,0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      card.style.boxShadow = 'none';
    });
  });

  /* ---------------------------------------------------------------
     FILM GRAIN — Canvas overlay on hero
  --------------------------------------------------------------- */
  const grainCanvas = document.getElementById('grainCanvas');

  if (grainCanvas) {
    const ctx = grainCanvas.getContext('2d');
    let grainFrame;

    function resizeGrain() {
      grainCanvas.width  = window.innerWidth;
      grainCanvas.height = window.innerHeight;
    }

    function renderGrain() {
      const w = grainCanvas.width;
      const h = grainCanvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i]     = v; // R
        data[i + 1] = v; // G
        data[i + 2] = v; // B
        data[i + 3] = 18;  // Alpha — very subtle
      }

      ctx.putImageData(imageData, 0, 0);
      grainFrame = requestAnimationFrame(renderGrain);
    }

    // Only run on non-mobile for performance
    if (window.innerWidth > 768) {
      resizeGrain();
      renderGrain();
      window.addEventListener('resize', resizeGrain);
    } else {
      grainCanvas.style.display = 'none';
    }

    // Pause grain when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(grainFrame);
      } else if (window.innerWidth > 768) {
        grainFrame = requestAnimationFrame(renderGrain);
      }
    });
  }

  /* ---------------------------------------------------------------
     CLIENTS — Stats counter animation
  --------------------------------------------------------------- */
  document.querySelectorAll('.about__stat-num, .director__pillar-num').forEach((el) => {
    const target = parseFloat(el.textContent.replace('+', '').replace('k', ''));
    const hasSuffix = el.textContent.includes('+');
    const isDecimal = el.textContent.includes('.');

    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = isDecimal
              ? obj.val.toFixed(1) + (hasSuffix ? '+' : '')
              : Math.round(obj.val) + (hasSuffix ? '+' : '');
          },
        });
      },
    });
  });

  /* ---------------------------------------------------------------
     AWARDS — Stagger reveal
  --------------------------------------------------------------- */
  gsap.fromTo('.awards__item',
    { opacity: 0, x: -24 },
    {
      opacity: 1,
      x: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.awards__list',
        start: 'top 95%',
        once: true,
      },
    }
  );

  /* ---------------------------------------------------------------
     SECTION TITLE — Subtle horizontal line wipe
  --------------------------------------------------------------- */
  document.querySelectorAll('.section__title').forEach((title) => {
    gsap.fromTo(title,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: title,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  /* ---------------------------------------------------------------
     CLIENTS LOGO GRID — stagger fade
  --------------------------------------------------------------- */
  gsap.fromTo('.clients__logo-item',
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.clients__logos',
        start: 'top 95%',
        once: true,
      },
    }
  );

  /* ---------------------------------------------------------------
     CONTACT — Background parallax
  --------------------------------------------------------------- */
  gsap.to('.contact__bg img', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.contact',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  /* ---------------------------------------------------------------
     RESIZE — Refresh ScrollTrigger
  --------------------------------------------------------------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  });

})();


/* ================================================================
   PASSWORD GATE
================================================================ */
(function () {
  var gate      = document.getElementById('gate');
  var input     = document.getElementById('gateInput');
  var btn       = document.getElementById('gateBtn');
  var errorEl   = document.getElementById('gateError');
  var countdown = document.getElementById('gateCountdown');
  if (!gate) return;

  var PASSWORD = '2222';

  /* Already unlocked this session — skip gate instantly */
  if (sessionStorage.getItem('nk-unlocked')) {
    gate.style.display = 'none';
    return;
  }

  document.body.style.overflow = 'hidden';
  setTimeout(function () { input.focus(); }, 400);

  function shake() {
    input.classList.add('is-shake');
    errorEl.classList.add('is-visible');
    input.value = '';
    setTimeout(function () {
      input.classList.remove('is-shake');
      input.focus();
    }, 420);
  }

  function runCountdown() {
    countdown.classList.add('is-active');
    var n = 5;

    /* Fade out gate content */
    gsap.to('.gate__content', { opacity: 0, duration: 0.35, ease: 'power2.in' });

    function tick() {
      if (n < 0) {
        /* Reveal site */
        gsap.to(gate, {
          opacity: 0, duration: 0.7, ease: 'power2.inOut',
          onComplete: function () {
            gate.style.display = 'none';
            document.body.style.overflow = '';
            sessionStorage.setItem('nk-unlocked', '1');
          }
        });
        return;
      }
      var label = n === 0 ? '\u25BA' : String(n);
      countdown.innerHTML = '<span class="gate__countdown-num">' + label + '</span>';
      n--;
      setTimeout(tick, 460);
    }

    tick();
  }

  function tryUnlock() {
    if (input.value === PASSWORD) {
      errorEl.classList.remove('is-visible');
      runCountdown();
    } else {
      shake();
    }
  }

  btn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryUnlock();
  });
}());

/* ================================================================
   CUSTOM CURSOR
================================================================ */
(function () {
  var dot      = document.getElementById('cursor');
  var ring     = document.getElementById('cursorFollower');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = 'translate(' + (rx - 15) + 'px,' + (ry - 15) + 'px)';
    requestAnimationFrame(animateRing);
  }());

  var hoverEls = document.querySelectorAll('a, button, .work__card, [role="button"]');
  hoverEls.forEach(function (el) {
    el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
  });
}());

/* ================================================================
   REEL MODAL
================================================================ */
(function () {
  var modal    = document.getElementById('reelModal');
  var video    = document.getElementById('reelVideo');
  var openBtn  = document.getElementById('heroReelBtn');
  var closeBtn = document.getElementById('reelClose');
  var backdrop = document.getElementById('reelBackdrop');
  if (!modal || !openBtn) return;

  function open() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (video) video.play().catch(function () {});
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (video) { video.pause(); video.currentTime = 0; }
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}());


/* ================================================================
   WORK INDEX — Hover image reveal
================================================================ */
(function () {
  var items   = document.querySelectorAll('.work__index-item');
  var imgs    = document.querySelectorAll('.work__index-img');
  var list    = document.querySelector('.work__index-list');
  if (!items.length || !imgs.length) return;

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      var idx = parseInt(item.dataset.img, 10);
      imgs.forEach(function (img, i) {
        img.classList.toggle('is-active', i === idx);
      });
    });
  });

  if (list) {
    list.addEventListener('mouseleave', function () {
      imgs.forEach(function (img) { img.classList.remove('is-active'); });
    });
  }
}());


/* ================================================================
   FIXES: Cursor, Active Nav, UX Polish
================================================================ */

/* ---- 1. Cursor: hidden until first mouse move ---- */
(function () {
  var cursor   = document.getElementById('cursor');
  var follower = document.getElementById('cursorFollower');
  if (!cursor) return;

  var activated = false;
  document.addEventListener('mousemove', function activate() {
    if (activated) return;
    activated = true;
    document.body.classList.add('cursor-ready');
    document.removeEventListener('mousemove', activate);
  }, { passive: true });
}());

/* ---- 2. Active nav link via IntersectionObserver ---- */
(function () {
  var sections = document.querySelectorAll('section[id], .director[id]');
  var links    = document.querySelectorAll('.nav__link');
  if (!sections.length || !links.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        links.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + id;
          link.classList.toggle('nav__link--active', active);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-72px 0px 0px 0px' });

  sections.forEach(function (s) { observer.observe(s); });
}());
