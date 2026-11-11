(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t = window.i18n ? window.i18n.t : (k) => k;

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
    toggle.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 1081px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });
  document.addEventListener("langchange", () => setMenu(nav.classList.contains("is-open")));

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
  const DURATION = 4000;

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const slides = [...track.children];
    const total = slides.length;
    if (total < 2) return;

    // Fotos sin alt propio: se nombran con el título del programa
    const unnamed = slides.filter((s) => !s.alt);
    slides.forEach((s, n) => { if (n > 0) s.setAttribute("aria-hidden", "true"); });

    carousel.insertAdjacentHTML("beforeend", `
      <div class="carousel__shade" aria-hidden="true"></div>
      <button type="button" class="carousel__btn carousel__btn--prev">${chevron("prev")}</button>
      <button type="button" class="carousel__btn carousel__btn--next">${chevron("next")}</button>
      <div class="carousel__bar">
        <div class="carousel__dots">${slides.map(() => `<button type="button" class="carousel__dot"></button>`).join("")}</div>
        <span class="carousel__count" aria-hidden="true"><span data-current>01</span> / ${pad(total)}</span>
      </div>`);

    const dots = [...carousel.querySelectorAll(".carousel__dot")];
    const current = carousel.querySelector("[data-current]");
    const title = carousel.closest(".program")?.querySelector(".program__title");

    const label = () => {
      carousel.setAttribute("aria-roledescription", t("carousel"));
      const name = title ? title.textContent.trim() : "";
      slides.forEach((s, n) => {
        s.setAttribute("aria-roledescription", t("carousel.photo"));
        if (unnamed.includes(s)) s.alt = t("carousel.alt", { name, n: n + 1 });
      });
      carousel.querySelector(".carousel__btn--prev").setAttribute("aria-label", t("carousel.prev"));
      carousel.querySelector(".carousel__btn--next").setAttribute("aria-label", t("carousel.next"));
      dots.forEach((d, n) => d.setAttribute("aria-label", t("carousel.goto", { n: n + 1, total })));
    };
    label();
    document.addEventListener("langchange", label);
    carousel.style.setProperty("--dur", DURATION + "ms");

    let index = 0;
    let timer = null;
    let remaining = DURATION;
    let startedAt = 0;
    let visible = false;
    let hovering = false;

    // Cada foto entra con un fundido y se mueve despacio (zoom + leve desplazamiento)
    const render = () => {
      slides.forEach((s, n) => {
        s.classList.toggle("is-active", n === index);
        s.toggleAttribute("aria-hidden", n !== index);
      });
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
      if (!visible || hovering) return;
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

    // Deslizar con el dedo para pasar de foto
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
    carousel.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; dx = dy = 0; dragging = true;
    }, { passive: true });
    carousel.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      dx = e.touches[0].clientX - startX;
      dy = e.touches[0].clientY - startY;
    }, { passive: true });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    };
    carousel.addEventListener("touchend", endDrag);
    carousel.addEventListener("touchcancel", endDrag);

    // Solo avanza cuando está a la vista
    let seen = false;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !seen) {
        // la primera vez que aparece, la foto arranca su movimiento desde cero
        seen = true;
        slides[index].classList.remove("is-active");
        void slides[index].offsetWidth;
        slides[index].classList.add("is-active");
      }
      if (visible) resume(); else pause();
    }, { threshold: 0.3 }).observe(carousel);
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));

    render();
    pause();
  });

  /* ---------- Programas de sustentabilidad: lista + foto grande ---------- */
  const showcase = document.querySelector("[data-showcase]");
  if (showcase) {
    const items = [...showcase.querySelectorAll("[data-showcase-item]")];
    const photos = [...showcase.querySelectorAll(".showcase__stage img")];
    const chip = showcase.querySelector(".showcase__chip");
    const chipName = showcase.querySelector("[data-showcase-name]");
    const chipCount = showcase.querySelector("[data-showcase-count]");
    const SC_DURATION = 7000;
    const total = items.length;
    showcase.style.setProperty("--sc-dur", SC_DURATION + "ms");

    let index = 0, timer = null, remaining = SC_DURATION, startedAt = 0;
    let visible = false, hovering = false;

    const nameOf = (n) => items[n].querySelector(".showcase__title span").textContent.trim();
    const updateChip = (animate) => {
      chipCount.textContent = String(index + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
      if (!animate) { chipName.textContent = nameOf(index); return; }
      chip.classList.add("is-swapping");
      setTimeout(() => { chipName.textContent = nameOf(index); chip.classList.remove("is-swapping"); }, 250);
    };

    const stop = () => { clearTimeout(timer); timer = null; };
    const schedule = (ms) => {
      stop();
      if (!visible || hovering) { showcase.classList.add("is-paused"); return; }
      showcase.classList.remove("is-paused");
      startedAt = performance.now();
      remaining = ms;
      timer = setTimeout(() => select(index + 1), ms);
    };
    const pause = () => {
      if (timer) remaining = Math.max(0, remaining - (performance.now() - startedAt));
      stop();
      showcase.classList.add("is-paused");
    };
    const resume = () => { showcase.classList.remove("is-paused"); schedule(remaining); };

    const select = (n, restartPhoto) => {
      index = (n + total) % total;
      items.forEach((it, k) => {
        const on = k === index;
        it.classList.toggle("is-active", on);
        it.querySelector(".showcase__title button").setAttribute("aria-expanded", String(on));
      });
      photos.forEach((ph, k) => {
        if (k === index && restartPhoto) { ph.classList.remove("is-active"); void ph.offsetWidth; }
        ph.classList.toggle("is-active", k === index);
      });
      // reinicia la línea de progreso
      const bar = items[index].querySelector(".showcase__bar");
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
      updateChip(true);
      remaining = SC_DURATION;
      schedule(SC_DURATION);
    };

    items.forEach((it, k) => {
      it.addEventListener("click", () => { if (k !== index) select(k); });
      it.querySelector(".showcase__title button").addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          select(index + (e.key === "ArrowDown" ? 1 : -1));
          items[index].querySelector(".showcase__title button").focus();
        }
      });
    });

    showcase.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; pause(); } });
    showcase.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovering = false; resume(); } });

    // Deslizar la foto con el dedo en el celular
    const stage = showcase.querySelector(".showcase__stage");
    let sx = 0, sy = 0;
    stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) select(index + (dx < 0 ? 1 : -1));
    });

    let seen = false;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !seen) { seen = true; select(index, true); return; }
      if (visible) resume(); else pause();
    }, { threshold: 0.3 }).observe(showcase);
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));
    document.addEventListener("langchange", () => updateChip(false));
    updateChip(false);
    pause();
  }

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

  /* ---------- Envío propio (función de Vercel con Resend) ---------- */
  // Devuelve "ok", "fallback" (la función no existe o no tiene la clave cargada:
  // se usa FormSubmit como antes) o lanza un error si el envío falló.
  const sendViaApi = async (formData, timeoutMs = 45000) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    let res;
    try {
      res = await fetch("/api/enviar", { method: "POST", body: formData, signal: ctrl.signal });
    } catch (err) {
      if (err.name === "AbortError") throw err;
      return "fallback"; // sin conexión con la función
    } finally {
      clearTimeout(timer);
    }
    if ([404, 405, 501, 503].includes(res.status)) return "fallback";
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || "error " + res.status);
    return "ok";
  };

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
        setStatus(t("form.check"), "error");
        return;
      }
      if (form.elements._honey.value) return; // bot

      form.classList.add("is-sending");
      setStatus(t("form.sending"));
      const data = Object.fromEntries(new FormData(form));
      data._replyto = data.correo;
      if (window.i18n && window.i18n.lang === "en") data.idioma = "Inglés";

      // Primero la función propia; si todavía no está configurada, FormSubmit
      // (que a veces tarda más de un minuto: esperamos la respuesta real y avisamos).
      const TIMEOUT_MS = 120000;
      const ctrl = new AbortController();
      const slow = setTimeout(() => setStatus(t("form.slow")), 6000);
      const giveUp = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

      try {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => fd.append(k, v));
        fd.append("tipo", "contacto");
        if ((await sendViaApi(fd)) === "ok") {
          form.reset();
          setStatus("");
          openModal("ok", t("modal.ok.title"), t("modal.ok.text"));
          return;
        }
        const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "error " + res.status);
        form.reset();
        setStatus("");
        openModal("ok", t("modal.ok.title"), t("modal.ok.text"));
      } catch (err) {
        console.warn("[contacto] El envío falló:", err.message);
        setStatus("");
        // Para no perder lo que escribió: WhatsApp y correo con el mensaje ya cargado
        const texto = `${data.nombre}${data.empresa ? " (" + data.empresa + ")" : ""}: ${data.mensaje}`;
        const wa = "https://wa.me/5493813983953?text=" + encodeURIComponent(texto);
        const mail = "mailto:cusillos@cusillos.com.ar?subject=" + encodeURIComponent("Consulta desde la web") +
          "&body=" + encodeURIComponent(data.mensaje + "\n\n" + data.nombre + (data.empresa ? " · " + data.empresa : "") + " · " + data.correo);
        openModal("error", t("modal.err.title"), t("modal.err.alt", { wa, mail }));
      } finally {
        clearTimeout(slow);
        clearTimeout(giveUp);
        form.classList.remove("is-sending");
      }
    });
  }

  /* ---------- Mapa de zonas: lista y pines se resaltan juntos ---------- */
  const zones = document.querySelectorAll(".zone[data-pin]");
  const pinOf = (id) => document.querySelector(`.pin[data-pin="${id}"]`);
  const hot = (id, on) => {
    document.querySelectorAll(`[data-pin="${id}"]`).forEach((el) => el.classList.toggle("is-hot", on));
  };
  zones.forEach((z) => {
    const id = z.dataset.pin;
    if (!pinOf(id)) return;
    ["pointerenter", "focus"].forEach((ev) => z.addEventListener(ev, () => hot(id, true)));
    ["pointerleave", "blur"].forEach((ev) => z.addEventListener(ev, () => hot(id, false)));
    pinOf(id).addEventListener("pointerenter", () => hot(id, true));
    pinOf(id).addEventListener("pointerleave", () => hot(id, false));
  });

  /* ---------- Formulario de empleo ---------- */
  const jobs = document.getElementById("jobs-form");
  if (jobs) {
    const status = jobs.querySelector(".form__status");
    const fileInput = jobs.elements.attachment;
    const fileBox = fileInput.closest(".file");
    const fileName = fileBox.querySelector(".file__name");
    const MAX_MB = 4;
    const fileOk = () => {
      const f = fileInput.files[0];
      return !!f && f.size <= MAX_MB * 1024 * 1024 && /\.(pdf|docx?)$/i.test(f.name);
    };
    const checks = {
      nombre: (el) => el.value.trim().length > 1,
      telefono: (el) => el.value.replace(/\D/g, "").length >= 6,
      correo: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()),
      attachment: fileOk,
    };
    const validate = (el) => {
      const ok = checks[el.name](el);
      const field = el.closest(".field");
      field.classList.toggle("is-invalid", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      return ok;
    };
    Object.keys(checks).forEach((name) => {
      const el = jobs.elements[name];
      el.addEventListener("blur", () => { if (el.value) validate(el); });
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("is-invalid")) validate(el); });
    });

    const showFile = () => {
      const f = fileInput.files[0];
      fileBox.classList.toggle("has-file", !!f);
      fileName.textContent = f ? `${f.name} · ${(f.size / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : t("jobs.cv.empty");
      if (f) validate(fileInput);
    };
    fileInput.addEventListener("change", showFile);
    document.addEventListener("langchange", () => { if (fileInput.files[0]) showFile(); });

    jobs.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = Object.keys(checks).map((n) => jobs.elements[n]);
      const results = fields.map(validate);
      if (results.includes(false)) {
        fields[results.indexOf(false)].focus();
        status.textContent = t("form.check");
        status.className = "form__status is-error";
        return;
      }
      if (jobs.elements._honey.value) return; // bot

      jobs.classList.add("is-sending");
      status.textContent = t("jobs.sending");
      status.className = "form__status";
      const slow = setTimeout(() => { if (jobs.classList.contains("is-sending")) status.textContent = t("jobs.slow"); }, 6000);
      const en = window.i18n && window.i18n.lang === "en";

      try {
        const fd = new FormData(jobs);
        fd.append("tipo", "postulacion");
        if (en) fd.append("idioma", "Inglés");
        if ((await sendViaApi(fd, 90000)) === "ok") {
          clearTimeout(slow);
          jobs.reset();
          showFile();
          jobs.classList.remove("is-sending");
          status.textContent = "";
          openModal("ok", t("jobs.ok.title"), t("jobs.ok.text"));
          return;
        }
        // Respaldo: FormSubmit solo acepta archivos con un envío común del formulario,
        // que vuelve a esta página con ?postulacion=ok
        const back = new URL(location.pathname, location.origin);
        back.searchParams.set("postulacion", "ok");
        if (en) back.searchParams.set("lang", "en");
        back.hash = "empleo";
        jobs.elements._next.value = back.href;
        HTMLFormElement.prototype.submit.call(jobs);
      } catch (err) {
        console.warn("[postulación] El envío falló:", err.message);
        clearTimeout(slow);
        jobs.classList.remove("is-sending");
        status.textContent = "";
        openModal("error", t("jobs.err.title"), t("jobs.err.text"));
      }
    });
    window.addEventListener("pageshow", () => jobs.classList.remove("is-sending"));
  }

  // Vuelta del envío de la postulación
  const params = new URLSearchParams(location.search);
  if (params.get("postulacion") === "ok") {
    params.delete("postulacion");
    const clean = location.pathname + (params.toString() ? "?" + params : "") + location.hash;
    history.replaceState(history.state, "", clean);
    openModal("ok", t("jobs.ok.title"), t("jobs.ok.text"));
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
