/* ============================================
   PunchAI — Punching Shear Predictor
   script.js
   ============================================ */

"use strict";

// ============================================
//  INTRO ANIMATION + CANVAS
// ============================================
(function initIntro() {
  const canvas = document.getElementById("intro-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, animFrame;
  const lines = [];
  const NUM_LINES = 30;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < NUM_LINES; i++) {
    lines.push({
      x: Math.random() * 1.2 - 0.1,
      y: Math.random() * 1.2 - 0.1,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      opacity: Math.random() * 0.4 + 0.1,
    });
  }

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);
    const step = 52;
    ctx.strokeStyle = "rgba(0,209,255,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // floating dots
    lines.forEach((l) => {
      l.x += l.vx;
      l.y += l.vy;
      if (l.x < 0 || l.x > 1) l.vx *= -1;
      if (l.y < 0 || l.y > 1) l.vy *= -1;
      ctx.beginPath();
      ctx.arc(l.x * W, l.y * H, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,209,255,${l.opacity})`;
      ctx.fill();
    });
    // connections
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const dx = (lines[i].x - lines[j].x) * W;
        const dy = (lines[i].y - lines[j].y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,209,255,${0.08 * (1 - dist / 180)})`;
          ctx.moveTo(lines[i].x * W, lines[i].y * H);
          ctx.lineTo(lines[j].x * W, lines[j].y * H);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    drawGrid();
    animFrame = requestAnimationFrame(loop);
  }
  loop();

  // Hide intro after 3s
  setTimeout(() => {
    const overlay = document.getElementById("intro-overlay");
    overlay.classList.add("hidden");
    cancelAnimationFrame(animFrame);
    document.body.style.overflow = "";
  }, 3000);

  document.body.style.overflow = "hidden";
})();

// ============================================
//  NAVBAR SCROLL EFFECT
// ============================================
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    links.classList.toggle("open");
  });

  // Close mobile nav on link click
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      toggle.classList.remove("active");
      links.classList.remove("open");
    });
  });
})();

// ============================================
//  SCROLL ANIMATION OBSERVER
// ============================================
(function initScrollAnimations() {
  const els = document.querySelectorAll("[data-animate]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => observer.observe(el));
})();

// ============================================
//  PREDICTION ENGINE
// ============================================

/**
 * Core calculation (IS 456:2000)
 * b0 = 4 × (c + d)
 * vu = Vu(N) / (b0 × d) → N/mm²
 * vc = 0.25 × √fck → N/mm²
 */
function calculatePunchingShear({ h, d, c, vu_kN, fck }) {
  const vu_N = vu_kN * 1000; // kN → N
  const b0 = 4 * (c + d); // mm
  const vu = vu_N / (b0 * d); // N/mm²
  const vc = 0.25 * Math.sqrt(fck); // N/mm²
  const ratio = vu / vc;
  const safe = vu <= vc;
  return { b0, vu, vc, ratio, safe, vu_N };
}

function predict() {
  const h = parseFloat(document.getElementById("h").value);
  const d = parseFloat(document.getElementById("d").value);
  const c = parseFloat(document.getElementById("c").value);
  const vu_kN = parseFloat(document.getElementById("vu").value);
  const fck = parseFloat(document.getElementById("fck").value);

  // Validate
  const errEl = document.getElementById("result-error");
  const errMsg = document.getElementById("error-msg");
  const dataEl = document.getElementById("result-data");
  const emptyEl = document.getElementById("result-empty");

  if (isNaN(h) || isNaN(d) || isNaN(c) || isNaN(vu_kN) || isNaN(fck)) {
    emptyEl.style.display = "none";
    dataEl.style.display = "none";
    errEl.style.display = "flex";
    errMsg.textContent = "⚠ Please fill in all fields with valid numeric values.";
    return;
  }
  if (d >= h) {
    emptyEl.style.display = "none";
    dataEl.style.display = "none";
    errEl.style.display = "flex";
    errMsg.textContent = "⚠ Effective depth d must be less than slab thickness h.";
    return;
  }
  if (d <= 0 || c <= 0 || vu_kN <= 0 || fck <= 0) {
    emptyEl.style.display = "none";
    dataEl.style.display = "none";
    errEl.style.display = "flex";
    errMsg.textContent = "⚠ All values must be greater than zero.";
    return;
  }

  errEl.style.display = "none";

  const result = calculatePunchingShear({ h, d, c, vu_kN, fck });

  // Animate button
  const btn = document.getElementById("predict-btn");
  btn.textContent = "Computing…";
  btn.style.opacity = "0.7";

  setTimeout(() => {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Predict Safety`;
    btn.style.opacity = "1";
    displayResults(result, { h, d, c, vu_kN, fck });
  }, 600);
}

function displayResults(result, inputs) {
  const emptyEl = document.getElementById("result-empty");
  const dataEl = document.getElementById("result-data");

  emptyEl.style.display = "none";
  dataEl.style.display = "block";

  // Verdict badge
  const badge = document.getElementById("verdict-badge");
  const verdictText = document.getElementById("verdict-text");
  badge.className = "verdict-badge";
  void badge.offsetWidth; // trigger reflow for animation restart
  badge.classList.add(result.safe ? "safe" : "unsafe");
  verdictText.textContent = result.safe ? "✓ SAFE" : "✗ UNSAFE";

  // Metric values — animate counting
  animateValue("res-b0", result.b0.toFixed(0), " mm");
  animateValue("res-vu", result.vu.toFixed(4), " N/mm²");
  animateValue("res-vc", result.vc.toFixed(4), " N/mm²");
  animateValue("res-ratio", result.ratio.toFixed(3), "");

  // Stress bar
  const maxStress = Math.max(result.vu, result.vc) * 1.3;
  const vuPct = Math.min((result.vu / maxStress) * 100, 100);
  const vcPct = Math.min((result.vc / maxStress) * 100, 100);
  const fill = document.getElementById("stress-bar-fill");
  const limit = document.getElementById("stress-bar-limit");
  const barPct = document.getElementById("bar-pct");

  setTimeout(() => {
    fill.style.width = vuPct + "%";
    fill.className = "stress-bar-fill " + (result.safe ? "safe-bar" : "unsafe-bar");
    limit.style.left = vcPct + "%";
    barPct.textContent = (result.ratio * 100).toFixed(1) + "% of limit";
  }, 100);

  // Formula line
  const formulaEl = document.getElementById("formula-line");
  formulaEl.innerHTML = `
    b₀ = 4×(${inputs.c}+${inputs.d}) = ${result.b0.toFixed(0)} mm &nbsp;|&nbsp;
    vu = ${(inputs.vu_kN * 1000).toFixed(0)}/(${result.b0.toFixed(0)}×${inputs.d}) = ${result.vu.toFixed(4)} N/mm²<br/>
    vc = 0.25×√${inputs.fck} = ${result.vc.toFixed(4)} N/mm² &nbsp;|&nbsp;
    Ratio = ${result.ratio.toFixed(3)} → <strong style="color:${result.safe ? "var(--safe-color)" : "var(--unsafe-color)"}">${result.safe ? "SAFE ✓" : "UNSAFE ✗"}</strong>
  `;

  // Scroll result card into view (mobile)
  if (window.innerWidth < 768) {
    document.getElementById("result-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function animateValue(id, targetStr, suffix) {
  const el = document.getElementById(id);
  const target = parseFloat(targetStr);
  if (isNaN(target)) {
    el.textContent = targetStr + suffix;
    return;
  }
  const duration = 600;
  const start = performance.now();
  const decimals = targetStr.includes(".") ? targetStr.split(".")[1].length : 0;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * ease).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = targetStr + suffix;
  }
  requestAnimationFrame(step);
}

function loadSample() {
  document.getElementById("h").value = 180;
  document.getElementById("d").value = 150;
  document.getElementById("c").value = 300;
  document.getElementById("vu").value = 450;
  document.getElementById("fck").value = 30;

  // Flash inputs
  ["h", "d", "c", "vu", "fck"].forEach((id) => {
    const el = document.getElementById(id);
    el.style.borderColor = "rgba(0,209,255,0.6)";
    el.style.boxShadow = "0 0 12px rgba(0,209,255,0.2)";
    setTimeout(() => {
      el.style.borderColor = "";
      el.style.boxShadow = "";
    }, 800);
  });
}

function resetForm() {
  ["h", "d", "c", "vu"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("fck").value = "";
  document.getElementById("result-empty").style.display = "flex";
  document.getElementById("result-data").style.display = "none";
  document.getElementById("result-error").style.display = "none";
  document.getElementById("stress-bar-fill").style.width = "0%";
}

// Allow Enter key in inputs
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".input-wrap input, .input-wrap select");
  inputs.forEach((inp) => {
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") predict();
    });
  });
});