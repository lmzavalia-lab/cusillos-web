// Envío de los formularios de la web (contacto y postulaciones) por correo, con Resend.
//
// Variables de entorno en Vercel (Settings → Environment Variables):
//   RESEND_API_KEY  (obligatoria)  clave de Resend con permiso de envío
//   CONTACT_TO      (opcional)     a quién llegan los mails; por defecto cusillos@cusillos.com.ar
//   RESEND_FROM     (opcional)     remitente; por defecto "Web Cusillos <onboarding@resend.dev>",
//                                  que solo puede enviar al correo dueño de la cuenta de Resend.
//                                  Con el dominio verificado en Resend: "Web Cusillos <web@cusillos.com.ar>"
//
// Sin RESEND_API_KEY responde 503 y la web vuelve a usar FormSubmit.

const MAX_CV = 4 * 1024 * 1024; // Vercel acepta hasta 4,5 MB por pedido
const CV_OK = /\.(pdf|docx?)$/i;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const tabla = (filas) =>
  `<table style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif;color:#1f2a2c">${filas
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#4a5759;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table>`;

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: "formato" });
  }
  const get = (k) => String(form.get(k) ?? "").trim();

  if (get("_honey")) return json(200, { ok: true }); // robot: se descarta sin avisar

  const tipo = get("tipo");
  const nombre = get("nombre");
  const correo = get("correo");
  if (!["contacto", "postulacion"].includes(tipo) || nombre.length < 2 || !EMAIL_OK.test(correo)) {
    return json(400, { ok: false, error: "datos" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return json(503, { ok: false, error: "no-configurado" });

  const idioma = get("idioma");
  let subject, filas, attachments;
  if (tipo === "contacto") {
    const mensaje = get("mensaje");
    if (mensaje.length < 3) return json(400, { ok: false, error: "datos" });
    const motivo = get("motivo") || "Consulta";
    subject = `${motivo} · ${nombre} · desde la web`;
    filas = [["Motivo", motivo], ["Nombre", nombre], ["Empresa", get("empresa")], ["Correo", correo], ["Mensaje", mensaje], ["Idioma", idioma]];
  } else {
    const cv = form.get("attachment");
    if (!cv || typeof cv === "string" || !cv.size || cv.size > MAX_CV || !CV_OK.test(cv.name)) {
      return json(400, { ok: false, error: "cv" });
    }
    subject = `Postulación · ${nombre} · ${get("zona") || "sin zona"}`;
    filas = [["Motivo", "Trabajá con nosotros"], ["Nombre", nombre], ["Teléfono", get("telefono")], ["Correo", correo], ["Zona", get("zona")], ["Mensaje", get("mensaje")], ["Idioma", idioma]];
    attachments = [{ filename: cv.name, content: Buffer.from(await cv.arrayBuffer()).toString("base64") }];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Web Cusillos <onboarding@resend.dev>",
      to: (process.env.CONTACT_TO || "cusillos@cusillos.com.ar").split(",").map((s) => s.trim()),
      reply_to: correo,
      subject,
      html: `<p style="font:15px Arial,sans-serif;color:#004b55;margin:0 0 12px">${esc(subject)}</p>${tabla(filas)}`,
      text: filas.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n"),
      attachments,
    }),
  });

  if (!res.ok) {
    console.error("Resend respondió", res.status, await res.text().catch(() => ""));
    return json(502, { ok: false, error: "envio" });
  }
  return json(200, { ok: true });
}
