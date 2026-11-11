/* ==========================================================================
   Idiomas · español (texto del HTML) e inglés
   - El español vive en index.html; acá solo está la traducción al inglés.
   - Elementos: data-i18n="clave" (contenido) y data-i18n-<atributo>="clave"
     (alt, aria-label, content, href).
   - Textos que arma main.js: window.i18n.t("clave").
   ========================================================================== */
(() => {
  "use strict";

  const WA = "https://wa.me/5493813983953?text=";

  const EN = {
    "meta.title": "Cusillos S.A. · Agricultural production in Northern Argentina",
    "meta.description": "Agribusiness from Tucumán founded in 1997. Certified production of soybean, corn, wheat, dry beans, chickpea and rapeseed in Salta, Santiago del Estero and Tucumán.",
    "skip": "Skip to content",
    "logo.home": "Cusillos S.A., back to top",
    "lang.label": "Language",

    "nav.label": "Main",
    "nav.about": "About us",
    "nav.production": "Production",
    "nav.commitment": "Social & Environmental Commitment",
    "nav.contact": "Contact",

    "hero.title": "Agricultural Production<br> in Northern Argentina",
    "hero.lead": "We are a company from Tucumán, with certified production in three provinces.",
    "hero.more": "Get to know us",
    "hero.fact1": "<strong>Since 1997</strong> in agricultural production",
    "hero.fact3": "<strong>RTRS and FSA certified · CREA members</strong>",

    "about.group": "Cusillos and Garmat",
    "about.title": "We are an agribusiness that creates opportunities for the sustainable growth of its shareholders and its community.",
    "about.p1": "Founded in 1997 by a group of agronomists, Cusillos SA now operates with a professional board and stable teams in each production area.",
    "about.p2": "We see farming as a long-term business: in the short term the risk is high; in the long term, it tends toward zero.",

    "pillars.label": "Who we are",
    "pillars.1.t": "Resilient",
    "pillars.1.p": "We adapt to different scenarios and to changes in the rules of the game.",
    "pillars.2.t": "Dynamic",
    "pillars.2.p": "We adapt to the ups and downs of the business; we learn and unlearn.",
    "pillars.3.t": "Innovative",
    "pillars.3.p": "We adopt new technologies and keep improving our processes.",

    "mv.label": "Mission and vision",
    "mv.alt": "Cusillos agronomists inspecting a crop in the field",
    "mv.mission": "Mission",
    "mv.mission.p": "<strong>We create value.</strong> Our purpose is to create economic, social and environmental value through continuous improvement and innovation. We create opportunities for our community, building a company able to evolve and last for generations.",
    "mv.vision": "Vision",
    "mv.vision.p": "To be the best choice for our clients and strategic partners. We will stand out for our adaptability, transparency and efficiency.",

    "values.eyebrow": "Values",
    "values.title": "Four principles that shape how we work.",
    "values.1.t": "Respect",
    "values.1.p": "Deep respect: listening to others and accepting their differences.",
    "values.2.t": "Honesty",
    "values.2.p": "Transparency, consistency, integrity, clarity.",
    "values.3.t": "Commitment",
    "values.3.p": "Trust, loyalty, perseverance.",
    "values.4.t": "Professionalism",
    "values.4.p": "Excellence, long-term thinking, team building.",

    "prod.title": "We are dedicated to food production.",
    "prod.p": "We grow grains and pulses in Northern Argentina, combining planned crop rotations, professional management and local teams to deliver quality food, season after season.",
    "crop.soja": "Soybean",
    "crop.soja.alt": "Soybean field",
    "crop.maiz": "Corn",
    "crop.maiz.alt": "Corn field",
    "crop.trigo": "Wheat",
    "crop.trigo.alt": "Ears of wheat",
    "crop.poroto": "Dry beans",
    "crop.poroto.alt": "Dry bean field",
    "crop.garbanzo": "Chickpea",
    "crop.garbanzo.alt": "Chickpea plant with pods",
    "crop.colza": "Rapeseed",
    "crop.colza.alt": "Rapeseed in bloom",

    "how.eyebrow": "How we produce",
    "how.title": "Three conditions that sustain every season.",
    "how.1.t": "Certified agriculture",
    "how.1.p": "We produce under certified standards, in compliance with regulations.",
    "how.2.t": "Technology and processes",
    "how.2.p": "Productivity is built by applying technology, know-how and defined processes at every stage.",
    "how.3.t": "Production areas",
    "how.3.p": "We operate in Salta, Santiago del Estero and Tucumán, with work teams based in each region.",

    "csr.eyebrow": "Social and environmental responsibility",
    "csr.title": "Three pillars frame our work: economic, social and environmental.",

    "jornadas.photos": "Field Days photos",
    "jornadas.alt": "Secondary school students at a field day",
    "jornadas.t": "Field Days",
    "jornadas.tag": "The value of Work and Production.",
    "jornadas.p1": "We open our farms to secondary school students, building a bridge between education and the region’s productive engine, and showing the sector’s needs in terms of job training.",
    "jornadas.p2": "We believe that to understand the value of this work, you need to see it from the inside. That is why this experience has unique protagonists: our own field teams.",

    "habitat.photos": "Habitat Project photos",
    "habitat.alt": "House under construction for the Habitat Project",
    "habitat.t": "Habitat Project",
    "habitat.tag": "Improving the places where our families live.",
    "habitat.p1": "A better home is also an opportunity to improve the daily lives of the people who live in it. During the period reviewed, work was carried out in different areas, reaching a number of families.",
    "habitat.p2": "The work included different types of intervention, according to each family’s needs: repairs, extensions, finishing work and the construction of new homes.",

    "bosque.photos": "School Forest photos",
    "bosque.alt": "Native tree planting day with the community",
    "bosque.t": "School Forest",
    "bosque.tag": "Planting the future.",
    "bosque.p1": "Together with the Model Forest Business Network for Sustainability, we carry out afforestation and native species planting, linking the work on our farms with initiatives alongside local communities.",
    "bosque.p2": "We promote environmental education while also showcasing the company’s sustainability actions.",

    "phytobac.photos": "Phytobac photos",
    "phytobac.alt": "Phytobac system installed on a farm",
    "phytobac.t": "Phytobac",
    "phytobac.tag": "Protecting soil and water.",
    "phytobac.p1": "We install Phytobac systems for the biological treatment of the wastewater produced when washing spraying equipment.",
    "phytobac.p2": "Pesticide residues break down in a bed of soil and organic matter, keeping them from reaching the soil and groundwater.",

    "nav.certs": "Certifications",
    "how.1.link": "See certifications",
    "how.3.link": "See the map",

    "zones.eyebrow": "Where we farm",
    "zones.title": "Our operations in Northern Argentina.",
    "zones.lead": "We farm in Tucumán, Salta and Santiago del Estero, with our operations centred at these locations:",
    "zones.medialuna": "Provincial Route 4 · Pellegrini, Santiago del Estero",
    "zones.office": "Head office",
    "zones.note": "The orange dots mark the main farmstead of each operation. Illustrative map, locations are approximate.",
    "zones.map": "Illustrative map showing Cusillos farms in Salta and Santiago del Estero and the office in Yerba Buena, Tucumán",

    "certs.title": "Certified production since 2014.",
    "certs.lead": "We have been RTRS certified since 2014, and added FSA in 2020. Every season, independent external auditors verify both standards in the field and in our records.",
    "certs.eyebrow": "Certifications and networks",
    "certs.since": "Since 2014",
    "certs.since.fsa": "Since 2020",
    "certs.rtrs.t": "Responsible soy",
    "certs.rtrs.p": "International standard certifying that soybeans are produced responsibly, environmentally, socially and economically.",
    "certs.rtrs.1": "No deforestation or conversion of natural ecosystems",
    "certs.rtrs.2": "Good agricultural practices and responsible use of crop protection products",
    "certs.rtrs.3": "Fair and safe working conditions",
    "certs.rtrs.4": "Good relations with neighbouring communities",
    "certs.fsa.t": "On-farm sustainability",
    "certs.fsa.p": "A tool used by the global food and beverage industry to assess how crops are grown on the farm and to choose its suppliers.",
    "certs.fsa.1": "Care for soil, water and biodiversity",
    "certs.fsa.2": "Responsible management of nutrients and crop protection products",
    "certs.fsa.3": "Health, safety and rights of everyone who works with us",
    "certs.fsa.4": "Professional management and economic viability of the farm",

    "networks.label": "We are also part of",
    "networks.crea": "For 30 years we have been part of the CREA San Patricio group, where farmers and advisors share experience and information to improve production and the management of each business.",
    "networks.bff": "We are part of the network of independent farmers through which Bayer promotes and showcases regenerative agriculture practices on real farms.",

    "report.eyebrow": "Sustainability magazines",
    "report.t": "Sustainability Actions 2025 / 2026",
    "report.p": "A detailed look at our programmes with people, teams and the communities where we work. There is one magazine for each company in the group (in Spanish).",
    "report.btn": "Download",

    "jobs.title": "Join our teams.",
    "jobs.p1": "We are looking for committed people for our farms in Salta and Santiago del Estero and for our office in Yerba Buena.",
    "jobs.p2": "Send us your details and your CV. We consider it every time a position opens that matches your profile.",
    "jobs.name": "Full name",
    "jobs.phone": "Phone",
    "jobs.phone.err": "Please leave a contact phone number.",
    "jobs.area": "Area of interest",
    "jobs.area.1": "Field operations",
    "jobs.area.2": "Agronomy and technical",
    "jobs.area.3": "Maintenance and machinery",
    "jobs.area.4": "Administration",
    "jobs.area.5": "Other",
    "jobs.zone": "Location",
    "jobs.zone.any": "Any",
    "jobs.cv": "CV",
    "jobs.cv.empty": "Choose a PDF or Word file, up to 5 MB",
    "jobs.cv.err": "Please attach your CV as a PDF or Word file, up to 5 MB.",
    "jobs.message": 'Message <span class="field__opt">(optional)</span>',
    "jobs.send": "Send application",
    "jobs.sending": "Sending your application…",
    "jobs.ok.title": "Application sent",
    "jobs.ok.text": "Thank you for your interest in Cusillos. We will contact you if a position matches your profile.",

    "footer.jobs": "Work with us",
    "footer.ig": "Cusillos on Instagram",

    "contact.title": "Write to us and we’ll get back to you.",
    "contact.email": "Email",
    "contact.office": "Office",
    "wa.href": WA + encodeURIComponent("Hello, I’m writing from the Cusillos website."),

    "form.name": "Name",
    "form.name.err": "Please tell us your name.",
    "form.company": 'Company <span class="field__opt">(optional)</span>',
    "form.email": "Email",
    "form.email.err": "Please check your email, e.g. name@company.com.",
    "form.message": "Message",
    "form.message.err": "Please write your message.",
    "form.send": "Send message",
    "form.check": "Please check the highlighted fields.",
    "form.sending": "Sending…",
    "form.slow": "Still sending… it can take up to a minute. Please don’t close the page.",
    "jobs.slow": "Still sending your application… it can take up to a minute. Please don’t close the page.",
    "modal.err.alt": 'The form service isn’t responding right now. You can send us the same message on <a href="{wa}" target="_blank" rel="noopener">WhatsApp</a> or by <a href="{mail}">email</a>; it’s already filled in.',

    "modal.ok.title": "Message sent",
    "modal.ok.text": "Thank you for writing to us. We’ll be in touch shortly.",
    "modal.err.title": "We couldn’t send your message",
    "modal.err.text": 'Please try again in a few minutes, or write to us at <a href="mailto:cusillos@cusillos.com.ar">cusillos@cusillos.com.ar</a> or on <a href="https://wa.me/5493813983953" target="_blank" rel="noopener">WhatsApp</a>.',
    "modal.close": "Close",

    "footer.label": "Footer",
    "footer.commitment": "Commitment",
    "footer.rights": "All rights reserved.",
    "footer.wa": "Message us on WhatsApp at 381 398-3953",
    "totop": "Back to top",

    "menu.open": "Open menu",
    "menu.close": "Close menu",
    "carousel": "carousel",
    "carousel.photo": "photo",
    "carousel.prev": "Previous photo",
    "carousel.next": "Next photo",
    "carousel.goto": "Show photo {n} of {total}",
    "carousel.alt": "{name}, photo {n}",
  };

  // Textos que solo existen en JavaScript (el resto del español sale del HTML)
  const ES = {
    "jobs.cv.empty": "Elegí un archivo PDF o Word, de hasta 5 MB",
    "jobs.sending": "Enviando tu postulación…",
    "jobs.ok.title": "Postulación enviada",
    "jobs.ok.text": "Gracias por tu interés en Cusillos. Si se abre una búsqueda que coincide con tu perfil, te vamos a contactar.",
    "form.check": "Revisá los campos marcados.",
    "form.sending": "Enviando…",
    "form.slow": "Seguimos enviando… puede tardar hasta un minuto. No cierres la página.",
    "jobs.slow": "Seguimos enviando tu postulación… puede tardar hasta un minuto. No cierres la página.",
    "modal.err.alt": 'El servicio de formularios no está respondiendo. Podés mandarnos el mismo mensaje por <a href="{wa}" target="_blank" rel="noopener">WhatsApp</a> o por <a href="{mail}">correo</a>: ya queda escrito.',
    "modal.ok.title": "Mensaje enviado",
    "modal.ok.text": "Gracias por escribirnos. Nos pondremos en contacto a la brevedad.",
    "modal.err.title": "No pudimos enviar el mensaje",
    "modal.err.text": 'Probá de nuevo en unos minutos, o escribinos a <a href="mailto:cusillos@cusillos.com.ar">cusillos@cusillos.com.ar</a> o por <a href="https://wa.me/5493813983953" target="_blank" rel="noopener">WhatsApp</a>.',
    "menu.open": "Abrir menú",
    "menu.close": "Cerrar menú",
    "carousel": "carrusel",
    "carousel.photo": "foto",
    "carousel.prev": "Foto anterior",
    "carousel.next": "Foto siguiente",
    "carousel.goto": "Ver foto {n} de {total}",
    "carousel.alt": "{name}, foto {n}",
  };

  const LANGS = ["es", "en"];
  const ATTRS = ["alt", "aria-label", "content", "href"];
  // Guarda el español original de cada elemento para poder volver a él
  const nodes = [...document.querySelectorAll("[data-i18n]")].map((el) => ({ el, key: el.dataset.i18n, es: el.innerHTML }));
  const attrNodes = [];
  ATTRS.forEach((attr) => {
    document.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) =>
      attrNodes.push({ el, attr, key: el.getAttribute(`data-i18n-${attr}`), es: el.getAttribute(attr) })
    );
  });

  let lang = "es";

  const t = (key, vars) => {
    let s = (lang === "en" ? EN[key] : ES[key]) ?? ES[key] ?? key;
    if (vars) Object.keys(vars).forEach((k) => (s = s.replaceAll(`{${k}}`, vars[k])));
    return s;
  };

  const apply = (next) => {
    lang = LANGS.includes(next) ? next : "es";
    const en = lang === "en";
    document.documentElement.lang = en ? "en" : "es-AR";
    nodes.forEach(({ el, key, es }) => { el.innerHTML = en && EN[key] != null ? EN[key] : es; });
    attrNodes.forEach(({ el, attr, key, es }) => { el.setAttribute(attr, en && EN[key] != null ? EN[key] : es); });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  };

  const set = (next) => {
    apply(next);
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(history.state, "", url);
  };

  // Siempre abre en español; en inglés solo con la bandera o con un link ?lang=en
  const initial = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "es";

  window.i18n = { t, set, get lang() { return lang; } };
  if (initial !== "es") apply(initial);

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => set(b.dataset.lang)));
})();
