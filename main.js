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
  // Cada proyecto se muestra PROGRAM_MS y, mientras tanto, sus fotos cambian cada PHOTO_MS.
  // Las flechas pasan las fotos del proyecto; después de la última siguen al próximo proyecto.
  // Con el mouse encima se frena el cambio de proyecto (para leer), pero las fotos siguen.
  const showcase = document.querySelector("[data-showcase]");
  if (showcase) {
    const PROGRAM_MS = 10000;
    const PHOTO_MS = 3500;
    const TICK = 100;
    const items = [...showcase.querySelectorAll("[data-showcase-item]")];
    const allPhotos = [...showcase.querySelectorAll(".showcase__stage img")];
    const progOf = (it) => it.querySelector(".showcase__title button").id.replace("sc-tab-", "");
    const photosOf = items.map((it) => {
      const own = allPhotos.filter((ph) => ph.dataset.program === progOf(it));
      return own.length ? own : [allPhotos[items.indexOf(it)]].filter(Boolean);
    });
    const chip = showcase.querySelector(".showcase__chip");
    const chipName = showcase.querySelector("[data-showcase-name]");
    const chipCount = showcase.querySelector("[data-showcase-count]");
    const total = items.length;
    showcase.style.setProperty("--sc-dur", PROGRAM_MS + "ms");

    let index = 0, photo = 0;
    let programElapsed = 0, photoElapsed = 0;
    let visible = false, hovering = false, ticker = null, last = 0;
    const pad = (n) => String(n).padStart(2, "0");
    const nameOf = (n) => items[n].querySelector(".showcase__title span").textContent.trim();

    const updateChip = (animateName) => {
      chipCount.textContent = pad(photo + 1) + " / " + pad(photosOf[index].length);
      if (!animateName) { chipName.textContent = nameOf(index); return; }
      chip.classList.add("is-swapping");
      setTimeout(() => { chipName.textContent = nameOf(index); chip.classList.remove("is-swapping"); }, 250);
    };

    const showPhoto = () => {
      const current = photosOf[index][photo];
      allPhotos.forEach((ph) => {
        if (ph === current) { ph.classList.remove("is-active"); void ph.offsetWidth; ph.classList.add("is-active"); }
        else ph.classList.remove("is-active");
      });
      photoElapsed = 0;
      updateChip(false);
    };

    const selectProgram = (n, startPhoto = 0) => {
      const changed = ((n + total) % total) !== index;
      index = (n + total) % total;
      photo = (startPhoto + photosOf[index].length) % photosOf[index].length;
      items.forEach((it, k) => {
        const on = k === index;
        it.classList.toggle("is-active", on);
        it.querySelector(".showcase__title button").setAttribute("aria-expanded", String(on));
      });
      // reinicia la línea de progreso del proyecto
      const bar = items[index].querySelector(".showcase__bar");
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
      programElapsed = 0;
      showPhoto();
      if (changed) updateChip(true);
    };

    const step = (dir) => {
      const count = photosOf[index].length;
      if (dir > 0 && photo === count - 1) return selectProgram(index + 1, 0);
      if (dir < 0 && photo === 0) return selectProgram(index - 1, -1);
      photo += dir;
      showPhoto();
    };

    const running = () => visible && !document.hidden;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(now - last, 500);
      last = now;
      if (!running()) return;
      photoElapsed += dt;
      if (!hovering) programElapsed += dt;
      if (programElapsed >= PROGRAM_MS) { selectProgram(index + 1); return; }
      if (photoElapsed >= PHOTO_MS && photosOf[index].length > 1) {
        photo = (photo + 1) % photosOf[index].length;
        showPhoto();
      }
    };
    const syncPaused = () => showcase.classList.toggle("is-paused", hovering || !running());
    const start = () => { if (!ticker) { last = performance.now(); ticker = setInterval(tick, TICK); } syncPaused(); };
    const halt = () => { clearInterval(ticker); ticker = null; syncPaused(); };

    items.forEach((it, k) => {
      it.addEventListener("click", () => { if (k !== index) selectProgram(k); });
      it.querySelector(".showcase__title button").addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          selectProgram(index + (e.key === "ArrowDown" ? 1 : -1));
          items[index].querySelector(".showcase__title button").focus();
        }
      });
    });

    const prevBtn = showcase.querySelector("[data-showcase-prev]");
    const nextBtn = showcase.querySelector("[data-showcase-next]");
    const labelArrows = () => {
      prevBtn.setAttribute("aria-label", t("showcase.prev"));
      nextBtn.setAttribute("aria-label", t("showcase.next"));
    };
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); step(1); });
    labelArrows();
    document.addEventListener("langchange", () => { labelArrows(); updateChip(false); });

    showcase.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; syncPaused(); } });
    showcase.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovering = false; syncPaused(); } });

    // Deslizar la foto con el dedo en el celular
    const stage = showcase.querySelector(".showcase__stage");
    let sx = 0, sy = 0;
    stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    });

    let seen = false;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !seen) { seen = true; selectProgram(0); }
      if (visible) start(); else halt();
    }, { threshold: 0.3 }).observe(showcase);
    document.addEventListener("visibilitychange", syncPaused);
    updateChip(false);
    syncPaused();
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

  /* ---------- Formulario único (consultas, proveedores, CV, reclamos) ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form__status");
    const motivo = form.elements.motivo;
    const extra = form.querySelector("[data-extra]");
    const company = form.querySelector("[data-company]");
    const nameRow = form.querySelector("[data-row-name]");
    const optional = form.querySelector("[data-optional]");
    const fileInput = form.elements.attachment;
    const fileBox = fileInput.closest(".file");
    const fileName = fileBox.querySelector(".file__name");
    const JOB = "Trabajá con nosotros";
    const MAX_MB = 4;
    const isJob = () => motivo.value === JOB;

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const fileOk = () => {
      const f = fileInput.files[0];
      return !!f && f.size <= MAX_MB * 1024 * 1024 && /\.(pdf|docx?)$/i.test(f.name);
    };
    const checks = {
      nombre: (el) => el.value.trim().length > 1,
      correo: (el) => emailOk(el.value),
      mensaje: (el) => isJob() || el.value.trim().length > 2,
      telefono: (el) => el.value.replace(/\D/g, "").length >= 6,
      attachment: fileOk,
    };
    const active = () => Object.keys(checks).filter((n) => !form.elements[n].disabled);
    const setInvalid = (el, bad) => {
      const field = el.closest(".field");
      field.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", String(bad));
      const err = field.querySelector(".field__error");
      if (err) el.setAttribute("aria-describedby", err.id);
    };
    const validate = (el) => {
      const ok = checks[el.name](el);
      setInvalid(el, !ok);
      return ok;
    };
    Object.keys(checks).forEach((name) => {
      const el = form.elements[name];
      el.addEventListener("blur", () => { if (el.value) validate(el); });
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("is-invalid")) validate(el); });
    });

    const setStatus = (msg, type) => {
      status.textContent = msg;
      status.className = "form__status" + (type ? " is-" + type : "");
    };

    // Campos según el motivo elegido
    const applyMotivo = () => {
      const job = isJob();
      extra.hidden = !job;
      extra.querySelectorAll("input, select").forEach((el) => { el.disabled = !job; });
      company.hidden = job;
      form.elements.empresa.disabled = job;
      nameRow.classList.toggle("form__row--single", job);
      optional.hidden = !job;
      form.elements.mensaje.rows = job ? 3 : 5;
      form.querySelector('[data-send="msg"]').hidden = job;
      form.querySelector('[data-send="job"]').hidden = !job;
      if (!job) ["telefono", "attachment"].forEach((n) => setInvalid(form.elements[n], false));
      setInvalid(form.elements.mensaje, false);
      setStatus("");
    };
    motivo.addEventListener("change", applyMotivo);
    applyMotivo();

    // "Enviá tu CV" y otros links que eligen el motivo
    document.querySelectorAll("[data-motivo]").forEach((a) =>
      a.addEventListener("click", () => {
        motivo.value = a.dataset.motivo;
        applyMotivo();
        setTimeout(() => form.elements.nombre.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
      })
    );

    const showFile = () => {
      const f = fileInput.files[0];
      fileBox.classList.toggle("has-file", !!f);
      fileName.textContent = f ? `${f.name} · ${(f.size / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : t("jobs.cv.empty");
      if (f) validate(fileInput);
    };
    fileInput.addEventListener("change", showFile);
    document.addEventListener("langchange", () => { if (fileInput.files[0]) showFile(); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = active().map((n) => form.elements[n]);
      const results = fields.map(validate);
      if (results.includes(false)) {
        fields[results.indexOf(false)].focus();
        setStatus(t("form.check"), "error");
        return;
      }
      if (form.elements._honey.value) return; // bot

      const job = isJob();
      const en = window.i18n && window.i18n.lang === "en";
      form.classList.add("is-sending");
      setStatus(t(job ? "jobs.sending" : "form.sending"));
      const slow = setTimeout(() => setStatus(t(job ? "jobs.slow" : "form.slow")), 6000);
      const ctrl = new AbortController();
      const giveUp = setTimeout(() => ctrl.abort(), 120000);

      const fd = new FormData(form);
      fd.append("tipo", job ? "postulacion" : "contacto");
      if (en) fd.append("idioma", "Inglés");
      const data = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));

      const done = () => {
        form.reset();
        applyMotivo();
        showFile();
        openModal("ok", t(job ? "jobs.ok.title" : "modal.ok.title"), t(job ? "jobs.ok.text" : "modal.ok.text"));
      };

      try {
        if ((await sendViaApi(fd, job ? 90000 : 45000)) === "ok") return done();

        // Respaldo: FormSubmit
        form.elements._subject.value = job ? `Nueva postulación · ${data.nombre}` : `${data.motivo} · ${data.nombre}`;
        if (job) {
          // FormSubmit solo acepta archivos con un envío común; vuelve con ?postulacion=ok
          const back = new URL(location.pathname, location.origin);
          back.searchParams.set("postulacion", "ok");
          if (en) back.searchParams.set("lang", "en");
          back.hash = "contacto";
          form.elements._next.value = back.href;
          form.classList.add("is-native"); // el navegador queda esperando a FormSubmit
          HTMLFormElement.prototype.submit.call(form);
          return;
        }
        data._subject = form.elements._subject.value;
        data._replyto = data.correo;
        const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) !== "true") throw new Error(json.message || "error " + res.status);
        done();
      } catch (err) {
        console.warn("[formulario] El envío falló:", err.message);
        setStatus("");
        if (job) {
          openModal("error", t("jobs.err.title"), t("jobs.err.text"));
        } else {
          // Para no perder lo que escribió: WhatsApp y correo con el mensaje ya cargado
          const texto = `${data.nombre}${data.empresa ? " (" + data.empresa + ")" : ""}: ${data.mensaje}`;
          const wa = "https://wa.me/5493813983953?text=" + encodeURIComponent(texto);
          const mail = "mailto:cusillos@cusillos.com.ar?subject=" + encodeURIComponent(data.motivo) +
            "&body=" + encodeURIComponent(data.mensaje + "\n\n" + data.nombre + (data.empresa ? " · " + data.empresa : "") + " · " + data.correo);
          openModal("error", t("modal.err.title"), t("modal.err.alt", { wa, mail }));
        }
      } finally {
        clearTimeout(giveUp);
        if (!form.classList.contains("is-native")) {
          clearTimeout(slow);
          form.classList.remove("is-sending");
        }
      }
    });
    window.addEventListener("pageshow", () => form.classList.remove("is-sending", "is-native"));
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
