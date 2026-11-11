(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });

  /* ---------- Link activo según la sección ---------- */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const setActive = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    targets.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = "contacto";
    links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + current));
  };
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { setActive(); ticking = false; }); ticking = true; }
  }, { passive: true });
  setActive();

  /* ---------- Aparición al scrollear ---------- */
  document.querySelectorAll("[data-reveal-group]").forEach((g) =>
    [...g.children].forEach((c, i) => c.style.setProperty("--i", i))
  );
  const revealEls = document.querySelectorAll("[data-reveal], [data-reveal-group]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Carruseles ---------- */
  const chevron = (dir) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}"/></svg>`;
  const pad = (n) => String(n).padStart(2, "0");
  const DURATION = 6000;

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const slides = [...track.children];
    const total = slides.length;
    if (total < 2) return;

    const label = carousel.getAttribute("aria-label") || "Fotos";
    slides.forEach((s, n) => {
      s.setAttribute("aria-roledescription", "foto");
      if (!s.alt) s.alt = `${label.replace(/^Fotos (de|del) /, "")}, foto ${n + 1}`;
      if (n > 0) s.setAttribute("aria-hidden", "true");
    });

    carousel.insertAdjacentHTML("beforeend", `
      <div class="carousel__shade" aria-hidden="true"></div>
      <button type="button" class="carousel__btn carousel__btn--prev" aria-label="Foto anterior">${chevron("prev")}</button>
      <button type="button" class="carousel__btn carousel__btn--next" aria-label="Foto siguiente">${chevron("next")}</button>
      <div class="carousel__bar">
        <div class="carousel__dots">${slides.map((_, n) => `<button type="button" class="carousel__dot" aria-label="Ver foto ${n + 1} de ${total}"></button>`).join("")}</div>
        <span class="carousel__count" aria-hidden="true"><span data-current>01</span> / ${pad(total)}</span>
      </div>`);

    const dots = [...carousel.querySelectorAll(".carousel__dot")];
    const current = carousel.querySelector("[data-current]");
    carousel.style.setProperty("--dur", DURATION + "ms");

    let index = 0;
    let timer = null;
    let remaining = DURATION;
    let startedAt = 0;
    let visible = false;
    let hovering = false;

    const render = () => {
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      slides.forEach((s, n) => s.toggleAttribute("aria-hidden", n !== index));
      dots.forEach((d, n) => {
        d.classList.remove("is-active");
        d.classList.toggle("is-done", n < index);
        d.toggleAttribute("aria-current", n === index);
      });
      // reinicia la animación de progreso del punto activo
      void dots[index].offsetWidth;
      dots[index].classList.add("is-active");
      current.textContent = pad(index + 1);
    };

    const stop = () => { clearTimeout(timer); timer = null; };
    const schedule = (ms) => {
      stop();
      if (reduceMotion || !visible || hovering) return;
      startedAt = performance.now();
      remaining = ms;
      timer = setTimeout(() => go(index + 1), ms);
    };
    const pause = () => {
      if (timer) remaining = Math.max(0, remaining - (performance.now() - startedAt));
      stop();
      carousel.classList.add("is-paused");
    };
    const resume = () => {
      carousel.classList.remove("is-paused");
      schedule(remaining);
    };
    const go = (n) => {
      index = (n + total) % total;
      render();
      remaining = DURATION;
      schedule(DURATION);
    };

    carousel.querySelector(".carousel__btn--prev").addEventListener("click", () => go(index - 1));
    carousel.querySelector(".carousel__btn--next").addEventListener("click", () => go(index + 1));
    dots.forEach((d, n) => d.addEventListener("click", () => go(n)));

    carousel.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; pause(); } });
    carousel.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovering = false; resume(); } });
    carousel.addEventListener("focusin", () => { hovering = true; pause(); });
    carousel.addEventListener("focusout", (e) => { if (!carousel.contains(e.relatedTarget)) { hovering = false; resume(); } });
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    // Swipe con seguimiento del dedo
    let startX = 0, startY = 0, dx = 0, dragging = false, locked = null;
    const width = () => carousel.clientWidth;
    carousel.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; dx = 0; dragging = true; locked = null;
      pause();
    }, { passive: true });
    carousel.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const mx = e.touches[0].clientX - startX;
      const my = e.touches[0].clientY - startY;
      if (locked === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
      if (locked !== "x") return;
      dx = mx;
      const edge = (index === 0 && dx > 0) || (index === total - 1 && dx < 0) ? 0.35 : 1;
      track.style.transition = "none";
      track.style.transform = `translate3d(${-index * width() + dx * edge}px, 0, 0)`;
    }, { passive: true });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      if (locked === "x" && Math.abs(dx) > width() * 0.18) go(index + (dx < 0 ? 1 : -1));
      else { render(); resume(); }
    };
    carousel.addEventListener("touchend", endDrag);
    carousel.addEventListener("touchcancel", endDrag);

    // Solo avanza cuando está a la vista
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume(); else pause();
    }, { threshold: 0.4 }).observe(carousel);
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));

    render();
    pause();
  });

  /* ---------- Volver arriba ---------- */
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    const updateToTop = () => toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();
    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      document.querySelector(".header__logo").focus({ preventScroll: true });
    });
  }

  /* ---------- Popup ---------- */
  const modal = document.getElementById("form-modal");
  const openModal = (type, title, html) => {
    if (!modal) return;
    modal.classList.toggle("is-error", type === "error");
    modal.querySelector(".modal__title").textContent = title;
    modal.querySelector(".modal__text").innerHTML = html;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    modal.querySelector("[data-modal-close]").focus();
  };
  if (modal) {
    const close = () => (typeof modal.close === "function" ? modal.close() : modal.removeAttribute("open"));
    modal.querySelector("[data-modal-close]").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); }); // clic fuera de la caja
  }

  /* ---------- Formulario de contacto ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form__status");
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const checks = {
      nombre: (v) => v.trim().length > 1,
      correo: emailOk,
      mensaje: (v) => v.trim().length > 2,
    };
    const validateField = (input) => {
      const test = checks[input.name];
      if (!test) return true;
      const ok = test(input.value);
      const field = input.closest(".field");
      field.classList.toggle("is-invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      const err = field.querySelector(".field__error");
      if (err) input.setAttribute("aria-describedby", err.id);
      return ok;
    };
    Object.keys(checks).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => { if (input.value) validateField(input); });
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("is-invalid")) validateField(input);
      });
    });

    const setStatus = (msg, type) => {
      status.textContent = msg;
      status.className = "form__status" + (type ? " is-" + type : "");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = Object.keys(checks).map((n) => form.elements[n]);
      const results = fields.map(validateField);
      if (results.includes(false)) {
        fields[results.indexOf(false)].focus();
        setStatus("Revisá los campos marcados.", "error");
        return;
      }
      if (form.elements._honey.value) return; // bot

      form.classList.add("is-sending");
      setStatus("Enviando…");
      const slowHint = setTimeout(() => setStatus("Enviando… puede tardar unos segundos, no cierres la página."), 5000);
      const data = Object.fromEntries(new FormData(form));
      data._replyto = data.correo;

      try {
        const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) === "false") throw new Error(json.message || "error " + res.status);
        form.reset();
        setStatus("");
        openModal("ok", "Mensaje enviado", "Gracias por escribirnos. Nos pondremos en contacto a la brevedad.");
      } catch (err) {
        console.warn("[contacto] No se pudo enviar:", err.message);
        setStatus("");
        openModal(
          "error",
          "No pudimos enviar el mensaje",
          'Probá de nuevo en unos minutos, o escribinos a <a href="mailto:cusillos@cusillos.com.ar">cusillos@cusillos.com.ar</a> o por <a href="https://wa.me/5493815430098" target="_blank" rel="noopener">WhatsApp</a>.'
        );
      } finally {
        clearTimeout(slowHint);
        form.classList.remove("is-sending");
      }
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
