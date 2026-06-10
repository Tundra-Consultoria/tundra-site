/* ===================================================================
   Tundra Consultoria — interações
=================================================================== */
(function () {
  "use strict";

  /* ---------- Ano no rodapé ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sombra ao rolar ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Contador animado das estatísticas ---------- */
  var counted = false;
  function animateCounters() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat-num[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var dur = 1200, start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  var statsSection = document.querySelector(".stats");
  if (statsSection && "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.4 }).observe(statsSection);
  }

  /* ---------- Formulário de contato ----------
     Envia para a função serverless /api/contato (ver api/contato.js).
     O e-mail de destino fica numa variável de ambiente na Vercel
     (CONTACT_TO) — nada de destino nem chave de API fica exposto aqui. */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var originalLabel = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      setStatus("", "");

      var payload = {
        nome: form.nome.value.trim(),
        email: form.email.value.trim(),
        empresa: form.empresa.value.trim(),
        mensagem: form.mensagem.value.trim(),
        site: form.site ? form.site.value.trim() : "" // honeypot anti-spam
      };

      try {
        var resp = await fetch("/api/contato", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        var data = await resp.json().catch(function () { return {}; });

        if (resp.ok && data.ok) {
          setStatus("Mensagem enviada! Em breve entramos em contato. ✓", "ok");
          form.reset();
        } else {
          setStatus(data.error || "Não foi possível enviar. Tente novamente em instantes.", "err");
        }
      } catch (err) {
        setStatus("Sem conexão no momento. Tente de novo ou escreva para contato@tundraconsultoria.com.br.", "err");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
      }
    });
  }
})();
