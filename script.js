/* =========================================================
   3F Digitals — script.js
   Mobile nav, scroll reveals, animated flow pipeline + timer
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    // close menu when a link is tapped
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.08) + "s";
      io.observe(el);
    });
  }

  /* ---------- Animate travelling leads along the flow path ---------- */
  /* Uses the SVG <path id="flowPath"> as a track; falls back gracefully. */
  var path = document.getElementById("flowPath");
  var dots = document.querySelectorAll(".flow-dot");

  if (path && dots.length && !reduceMotion && typeof path.getTotalLength === "function") {
    var len = path.getTotalLength();
    var speed = 70;            // px per second
    var spacing = len / dots.length;
    var offsets = [];
    dots.forEach(function (d, i) { offsets[i] = i * spacing; });

    var last = null;
    function frame(now) {
      if (last === null) last = now;
      var dt = (now - last) / 1000;
      last = now;
      dots.forEach(function (dot, i) {
        offsets[i] = (offsets[i] + speed * dt) % len;
        var p = path.getPointAtLength(offsets[i]);
        dot.setAttribute("cx", p.x);
        dot.setAttribute("cy", p.y);
        // fade slightly at the very start so leads "appear" entering
        var ratio = offsets[i] / len;
        dot.setAttribute("opacity", ratio < 0.04 ? (ratio / 0.04).toFixed(2) : "1");
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  } else if (dots.length) {
    dots.forEach(function (d) { d.setAttribute("opacity", "0"); });
  }

  /* ---------- Live "reply" timer in the flow header ---------- */
  var timer = document.getElementById("flowTimer");
  if (timer && !reduceMotion) {
    var secs = 58;
    setInterval(function () {
      secs = secs >= 60 ? 1 : secs + 1;
      var s = secs < 10 ? "0" + secs : "" + secs;
      timer.innerHTML = "reply&nbsp;00:" + s;
    }, 1000);
  }

  /* ---------- Count-up stats when hero is in view ---------- */
  function countUp(el, target, suffix, duration) {
    var start = 0, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var prog = Math.min((ts - t0) / duration, 1);
      var val = Math.floor(prog * (target - start) + start);
      el.textContent = val + suffix;
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var statCapture = document.getElementById("statCapture");
  if (statCapture && !reduceMotion && "IntersectionObserver" in window) {
    var done = false;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !done) {
          done = true;
          countUp(statCapture, 100, "%", 1400);
        }
      });
    }, { threshold: 0.5 });
    so.observe(statCapture);
  }

})();