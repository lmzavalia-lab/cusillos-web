// Header: sombra al scrollear
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menú mobile
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Link activo según la sección visible
const links = [...nav.querySelectorAll("a")];
const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => s && spy.observe(s));

// Aparición suave al scrollear
const revealEls = document.querySelectorAll(
  ".section .split, .pillar, .mv__card, .values > div, .crops figure, .how article, .program, .contact .split"
);
const reveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        reveal.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => {
  el.classList.add("reveal");
  reveal.observe(el);
});

// Carruseles: con 2+ imágenes muestran flechas y puntos
const arrow = (d) =>
  `<svg viewBox="0 0 24 24"><path d="${d === "prev" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"}"/></svg>`;

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel__track");
  const slides = track.children;
  if (slides.length < 2) return;
  let i = 0;
  let timer;

  const prev = document.createElement("button");
  prev.className = "carousel__btn carousel__btn--prev";
  prev.setAttribute("aria-label", "Foto anterior");
  prev.innerHTML = arrow("prev");
  const next = document.createElement("button");
  next.className = "carousel__btn carousel__btn--next";
  next.setAttribute("aria-label", "Foto siguiente");
  next.innerHTML = arrow("next");
  const dots = document.createElement("div");
  dots.className = "carousel__dots";
  [...slides].forEach((_, n) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Ir a la foto ${n + 1}`);
    b.addEventListener("click", () => go(n));
    dots.appendChild(b);
  });
  carousel.append(prev, next, dots);

  function go(n) {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    [...dots.children].forEach((d, k) => d.classList.toggle("is-active", k === i));
    clearInterval(timer);
    timer = setInterval(() => go(i + 1), 6000);
  }
  prev.addEventListener("click", () => go(i - 1));
  next.addEventListener("click", () => go(i + 1));

  // swipe en mobile
  let x0 = null;
  carousel.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  carousel.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  go(0);
});

// Formulario de contacto
// Por ahora abre el cliente de correo con el mensaje armado.
// Cuando definamos el servicio de envío (Formspree, Resend, etc.) se reemplaza acá.
const form = document.getElementById("contact-form");
const status = form.querySelector(".form__status");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const subject = `Contacto web — ${d.get("nombre")}${d.get("empresa") ? " (" + d.get("empresa") + ")" : ""}`;
  const body = `${d.get("mensaje")}\n\n${d.get("nombre")}\n${d.get("empresa") || ""}\n${d.get("correo")}`;
  window.location.href =
    `mailto:cusillos@cusillos.com.ar?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Abrimos tu programa de correo para enviar el mensaje.";
});

document.getElementById("year").textContent = new Date().getFullYear();
