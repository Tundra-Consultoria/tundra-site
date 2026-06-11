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

  /* ---------- Parallax dos flares do hero ---------- */
  var flares = document.querySelectorAll(".flare[data-parallax]");
  if (flares.length &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    function updateParallax() {
      var y = window.scrollY;
      flares.forEach(function (el) {
        var factor = parseFloat(el.getAttribute("data-parallax")) || 0;
        el.style.transform = "translate3d(0," + (y * factor).toFixed(2) + "px, 0)";
      });
      ticking = false;
    }
    function onParallaxScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }
    updateParallax();
    window.addEventListener("scroll", onParallaxScroll, { passive: true });
  }

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
        setStatus("Sem conexão no momento. Tente de novo ou fale com a gente no WhatsApp (11) 93020-1283.", "err");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
      }
    });
  }
})();
