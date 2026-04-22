/* ==========================================================================
   Custom JS — Manoj Kumar Thota portfolio
   - Initialises AOS (scroll-triggered reveal)
   - Typing effect on the hero line (cycles through phrases)
   - Word-by-word scroll reveal for any element with .reveal-on-scroll
   ========================================================================== */

(function () {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. AOS — scroll-triggered fade/slide reveals on [data-aos] elements
  // ------------------------------------------------------------------------
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: function () {
        return window.innerWidth < 480;
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. Typed text — cycles phrases in the hero intro line
  // ------------------------------------------------------------------------
  function initTypedEffect() {
    var target = document.getElementById('typed-output');
    if (!target) return;

    var phrases = [
      'Agentic AI for Lawyers',
      'Enclaraa — Legal AI that Cites Itself',
      'Secure, On-Prem RAG for Enterprise',
      'Contract Review in Minutes, Not Hours',
      'Enterprise AI that Actually Ships'
    ];

    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var TYPE_DELAY = 70;
    var ERASE_DELAY = 35;
    var HOLD_DELAY = 1400;

    function tick() {
      var current = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex++;
        target.textContent = current.substring(0, charIndex);

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(tick, HOLD_DELAY);
          return;
        }
        setTimeout(tick, TYPE_DELAY);
      } else {
        charIndex--;
        target.textContent = current.substring(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        setTimeout(tick, ERASE_DELAY);
      }
    }

    target.textContent = '';
    setTimeout(tick, 600);
  }

  // ------------------------------------------------------------------------
  // 3. Reveal-on-scroll — splits element text into words and animates them
  //    in sequentially as the element enters the viewport.
  // ------------------------------------------------------------------------
  function splitIntoWords(el) {
    if (el.dataset.split === 'true') return;
    var raw = el.innerHTML;
    // Only split plain-text paragraphs — preserve inline tags as tokens
    var tokens = raw.split(/(<[^>]+>)/g);
    var out = '';
    tokens.forEach(function (tok) {
      if (tok.indexOf('<') === 0) {
        out += tok;
      } else {
        var words = tok.split(/(\s+)/);
        words.forEach(function (w) {
          if (w.trim().length === 0) {
            out += w;
          } else {
            out += '<span class="reveal-word">' + w + '</span>';
          }
        });
      }
    });
    el.innerHTML = out;
    el.dataset.split = 'true';
  }

  function initRevealOnScroll() {
    var targets = document.querySelectorAll('.reveal-on-scroll');
    if (!targets.length) return;

    targets.forEach(splitIntoWords);

    if (!('IntersectionObserver' in window)) {
      // Fallback — just show everything
      targets.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // ------------------------------------------------------------------------
  // 4. Boot
  // ------------------------------------------------------------------------
  function boot() {
    initTypedEffect();
    initRevealOnScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
