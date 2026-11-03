// Panel del coach. Lee todo con /api/sync y solo escribe la rutina y los mensajes.
"use strict";
const BASE = "/rutina";
// On anticipamx.com/belift/coach the API is on the server (prueba.anticipamx.com); served from the server itself, same origin.
const API_ORIGEN = /(^|\.)anticipamx\.com$/.test(location.hostname) && location.hostname !== "prueba.anticipamx.com" ? "https://prueba.anticipamx.com" : "";
const SRV = API_ORIGEN + BASE;
const DOWS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const PLATES = { red: 25, blue: 20, yellow: 15, green: 10, white: 5 };
const COLORES = { red: "Rojo", blue: "Azul", yellow: "Amarillo", green: "Verde", white: "Blanco" };
const BARRAS = { olimpica: "Barra olímpica", corta: "Barra corta o Z", sin: "Sin barra / máquina" };
// Campos del reporte SECA (mBCA). La app usa las mismas claves.
const INBODY = [
  ["peso", "Peso", "kg"], ["imc", "IMC", "kg/m²"], ["grasaKg", "Masa grasa", "kg"], ["grasaPct", "Grasa", "%"],
  ["mlg", "Masa libre de grasa", "kg"], ["mme", "Masa muscular esquelética", "kg"], ["aguaTotal", "Agua total", "L"],
  ["aguaExtra", "Agua extracelular", "L"], ["anguloFase", "Ángulo de fase", "°"], ["grasaVisceral", "Grasa visceral", "L"],
  ["ger", "Gasto en reposo", "kcal"], ["cintura", "Cintura", "cm"],
  ["fmi", "Índice de masa grasa", "kg/m²"], ["ffmi", "Índice de masa libre de grasa", "kg/m²"], ["aguaRatio", "Agua extracelular / total", "%"],
  ["estatura", "Estatura", "cm"], ["brazoDer", "Músculo brazo derecho", "kg"], ["brazoIzq", "Músculo brazo izquierdo", "kg"],
  ["torso", "Músculo torso", "kg"], ["piernaDer", "Músculo pierna derecha", "kg"], ["piernaIzq", "Músculo pierna izquierda", "kg"],
];

const S = { user: null, gente: [], docs: {}, seq: 0, view: "resumen", draft: null, dirty: false, dayI: 0, abiertos: new Set(), imagenes: null, catalogo: null, invitacion: null, perfil: null };
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n, d = 1) => n == null || !isFinite(n) ? "–" : (Math.round(n * 10 ** d) / 10 ** d).toLocaleString("es-MX");
const signo = (n, d = 1, invertir = false) => n == null || !isFinite(n) || Math.abs(n) < 1e-9 ? '<span class="muted">0</span>'
  : `<span class="${(n > 0) !== invertir ? "pos" : "neg"}">${n > 0 ? "+" : "−"}${fmt(Math.abs(n), d)}</span>`;
const fdate = (t) => new Date(t).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
const sdate = (t) => new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dia0 = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d; };
const nuevoId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const imgURL = (img, i = 0) => !img ? "" : img.startsWith("file:") ? `${SRV}/api/archivos/${img.slice(5)}` : `${SRV}/img/${img}-${i}.jpg`;
const ICON = {
  up: '<path d="M12 19V5m-6 6l6-6 6 6"/>', down: '<path d="M12 5v14m6-6l-6 6-6-6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', refresh: '<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>', out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="12" cy="12" r="3.2"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
};
const LOGO = '<svg class="logo" viewBox="0 0 100 100" aria-label="BeLift"><path d="M21.75 89V25L35.75 11V89Z" fill="currentColor"/><circle cx="54.75" cy="65.5" r="17" fill="none" stroke="currentColor" stroke-width="13"/></svg>';
const I = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

// ---------- server ----------
async function api(path, opt = {}) {
  const json = opt.body && typeof opt.body === "string";
  const r = await fetch(SRV + path, { credentials: "include", ...opt, headers: { "X-Rutina": "1", ...(json ? { "Content-Type": "application/json" } : {}), ...(opt.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || "No se pudo conectar."), { status: r.status });
  return j;
}
async function sincronizar() {
  let mas = true;
  while (mas) {
    const r = await api(`/api/sync?desde=${S.seq}`);
    for (const d of r.docs) (S.docs[d.kind] ||= {})[d.id] = d;
    S.seq = r.seq; mas = r.mas;
  }
}
async function guardarDocs(docs) {
  const r = await api("/api/sync", { method: "POST", body: JSON.stringify({ docs }) });
  if (r.rechazados?.length) throw new Error("El servidor no aceptó el cambio: " + r.rechazados[0].motivo);
  await sincronizar();
}
function aviso(t) { const el = $("#aviso"); el.textContent = t; el.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => (el.hidden = true), 2600); }

// ---------- data ----------
const vivos = (kind) => Object.values(S.docs[kind] || {}).filter((d) => !d.deleted && d.data);
const rutina = () => S.docs.routine?.actual?.data || { days: [] };
const sesiones = () => vivos("session").map((d) => d.data).filter((s) => s.endedAt && s.log).sort((a, b) => b.startedAt - a.startedAt);
const atleta = () => S.gente.find((g) => g.role === "atleta");
function catalogo() {
  const m = {};
  rutina().days.forEach((d, di) => d.ex.forEach((e, ei) => {
    m[e.k] = { ...e, day: d, orden: di * 100 + ei };
    (e.alts || []).forEach((a, ai) => { if (!m[a.k]) m[a.k] = { ...a, day: d, alt: true, de: e.name, orden: di * 100 + ei + (ai + 1) / 10 }; });
  }));
  return m;
}
const nombreEj = (k, s) => s?.exNames?.[k] || catalogo()[k]?.name || k.replace(/^alt:/, "").replace(/-/g, " ");
const hechas = (l) => (l || []).filter((x) => x.done && !x.warm);
const e1rm = (w, r) => (w || 0) * (1 + (r || 0) / 30);
function historial(k) {
  return sesiones().slice().reverse().map((s) => { const sets = hechas(s.log[k]); if (!sets.length) return null;
    const top = Math.max(...sets.map((x) => +x.w || 0));
    return { at: s.startedAt, unit: s.unit || "kg", sets, top, e1: Math.max(...sets.map((x) => e1rm(+x.w, +x.r))) };
  }).filter(Boolean);
}
function planDows() { return new Set(rutina().days.map((d) => d.dow)); }
function racha() {
  const plan = planDows(), hechos = new Set(sesiones().map((s) => +dia0(s.startedAt)));
  if (!hechos.size) return 0;
  const hoy = dia0(Date.now()), primero = Math.min(...hechos); let n = 0;
  for (const d = new Date(hoy); +d >= primero; d.setDate(d.getDate() - 1)) {
    if (hechos.has(+d)) n++; else if (+d !== +hoy && plan.has(d.getDay())) break;
  }
  return n;
}

// ---------- views ----------
function topbar() {
  const tabs = [["resumen", "Resumen"], ["entrenos", "Entrenamientos"], ["progreso", "Progreso"], ["cuerpo", "Cuerpo"], ["rutina", "Rutina"], ["mensajes", "Mensajes"]];
  const a = atleta();
  return `<header class="top"><h1>${LOGO}<span>Coach</span></h1><span class="quien">${a ? esc(a.name) : ""}</span><span class="grow"></span>
      <button class="yo" data-a="ver" data-v="perfil" aria-label="Mi perfil">${avatar(S.user)}</button>
      <button class="ic" data-a="refrescar" aria-label="Actualizar">${I("refresh")}</button><button class="ic" data-a="salir" aria-label="Cerrar sesión">${I("out")}</button></header>
    <nav class="nav"><div class="tabs glass">${tabs.map(([k, n]) => `<button class="tab" data-a="ver" data-v="${k}" ${S.view === k ? 'aria-current="page"' : ""}>${n}</button>`).join("")}</div></nav>`;
}
const faltaPerfil = () => S.user?.role === "coach" && (!S.user.photo || !S.user.bio);
const avatar = (u, cls = "") => u?.photo ? `<img class="avatar ${cls}" src="${SRV}/api/archivos/${esc(u.photo)}" alt="">`
  : `<span class="avatar ${cls}">${esc((u?.name || "?").trim().charAt(0).toUpperCase())}</span>`;
function render() {
  const app = $("#app");
  if (!S.user) { app.innerHTML = loginV(); return; }
  if (faltaPerfil() || S.view === "perfil") { app.innerHTML = perfilV(); return; }
  const v = { resumen: resumenV, entrenos: entrenosV, progreso: progresoV, cuerpo: cuerpoV, rutina: rutinaV, mensajes: mensajesV }[S.view] || resumenV;
  const y = scrollY;
  app.innerHTML = topbar() + `<main>${v()}</main>` + (S.view === "rutina" && S.dirty ? savebar() : "");
  scrollTo(0, y);
}

function loginV() {
  const inv = S.invitacion != null;
  return `<div class="login"><form class="card glass" id="${inv ? "registro" : "login"}">
    <div class="marca">${LOGO}<b>BeLift</b><span>Coach</span></div>
    <div><h2>${inv ? "Crea tu cuenta" : "Panel del coach"}</h2><p class="lead" style="margin:6px 0 0">${inv ? "Elige tu usuario y tu contraseña. El código solo sirve una vez." : "Entra para ver los entrenamientos y ajustar la rutina."}</p></div>
    ${inv ? `<label class="field">Código de invitación<input class="in" name="codigo" value="${esc(S.invitacion)}" autocomplete="off" required></label>` : ""}
    <label class="field">Usuario<input class="in" name="username" autocomplete="username" autocapitalize="none" required></label>
    <label class="field">Contraseña<input class="in" name="password" type="password" autocomplete="${inv ? "new-password" : "current-password"}" ${inv ? 'minlength="8"' : ""} required></label>
    <div class="err" id="err"></div>
    <button class="btn pri" type="submit">${inv ? "Crear cuenta" : "Entrar"}</button>
    <button class="btn" type="button" data-a="modo">${inv ? "Ya tengo cuenta" : "Tengo un código de invitación"}</button>
  </form></div>`;
}

// Your profile: the athlete sees your photo and name above the chat, and your bio when they tap it.
function perfilV() {
  const P = (S.perfil ||= { name: S.user.name || "", bio: S.user.bio || "", photo: S.user.photo || null }), nuevo = faltaPerfil();
  return `<div class="login"><form class="card glass perfil" id="perfil">
    <div><h2>${nuevo ? "Completa tu perfil" : "Tu perfil"}</h2><p class="lead" style="margin:6px 0 0">Tu atleta ve tu foto y tu nombre arriba del chat. Al tocarlos, lee tu biografía.</p></div>
    <label class="foto-perfil">${avatar({ name: P.name, photo: P.photo }, "xl")}<span class="btn sm">${P.photo ? "Cambiar foto" : "Subir foto"}</span>
      <input type="file" id="foto-perfil" accept="image/jpeg,image/png" hidden></label>
    <label class="field">Nombre<input class="in" name="name" data-perfil="name" value="${esc(P.name)}" maxlength="60" required></label>
    <label class="field">Biografía<textarea class="in" name="bio" data-perfil="bio" rows="6" maxlength="800" required
      placeholder="Tu experiencia, certificaciones, en qué te especializas y cómo trabajas.">${esc(P.bio)}</textarea></label>
    <div class="err" id="err"></div>
    <button class="btn pri" type="submit">${nuevo ? "Guardar y entrar" : "Guardar"}</button>
    ${nuevo ? "" : '<button class="btn" type="button" data-a="ver" data-v="resumen">Cancelar</button>'}
  </form></div>`;
}

function sesionFila(s) {
  const d = rutina().days.find((x) => x.k === s.day), mins = Math.round((s.endedAt - s.startedAt) / 60000);
  const sets = Object.values(s.log).flatMap(hechas), plan = Object.values(s.plan || {}).reduce((a, p) => a + (p.sets || 0), 0);
  const vol = sets.reduce((a, x) => a + (+x.w || 0) * (+x.r || 0), 0);
  return `<span class="dot" style="--c:var(--${d?.plate || "blue"})"></span><div class="t"><b>${esc(s.dayName || d?.name || s.day)}</b>
    <span class="num">${fdate(s.startedAt)} · ${mins} min · ${sets.length}${plan ? "/" + plan : ""} series · ${Math.round(vol).toLocaleString("es-MX")} ${s.unit || "kg"}</span></div>`;
}
function resumenV() {
  const a = atleta(), ss = sesiones(), hace28 = Date.now() - 28 * 864e5, rec = ss.filter((s) => s.startedAt >= hace28);
  const plan = rutina().days.length * 4, pct = plan ? Math.round(rec.length / plan * 100) : 0;
  const semana = ss.filter((s) => s.startedAt >= Date.now() - 7 * 864e5).flatMap((s) => Object.values(s.log).flatMap(hechas)).filter((x) => x.rir != null && x.rir !== "");
  const rir = semana.length ? semana.reduce((t, x) => t + +x.rir, 0) / semana.length : null;
  const pesos = vivos("body").map((d) => d.data).filter((b) => b.w != null).sort((x, y) => x.d < y.d ? -1 : 1);
  const ib = vivos("inbody").map((d) => d.data).sort((x, y) => x.d < y.d ? -1 : 1);
  const msgs = vivos("comment").map((d) => d.data).sort((x, y) => y.at - x.at).slice(0, 3);
  const ult = pesos[pesos.length - 1], prev4 = pesos.filter((b) => +fromIso(b.d) <= Date.now() - 27 * 864e5).pop();
  const lastIb = ib[ib.length - 1], prevIb = ib[ib.length - 2];
  const prs = recientesPR();
  return `<h2>${a ? esc(a.name) : "Tu atleta"}</h2><p class="lead">${ss[0] ? "Último entrenamiento: " + fdate(ss[0].startedAt) : "Todavía no hay entrenamientos sincronizados."}</p>
    <div class="grid g4">
      <div class="card glass kpi"><b class="num">${racha()}</b><span>días de racha</span></div>
      <div class="card glass kpi"><b class="num">${rec.length}<span class="dim" style="font-size:18px">/${plan}</span></b><span>entrenos en 28 días</span><small>${pct}% del plan</small></div>
      <div class="card glass kpi"><b class="num">${rir == null ? "–" : fmt(rir)}</b><span>RIR promedio (7 días)</span><small>Meta del plan: 1–3</small></div>
      <div class="card glass kpi"><b class="num">${ult ? fmt(ult.w) + " " + (ult.unit || "kg") : "–"}</b><span>peso corporal</span><small>${ult && prev4 ? signo(ult.w - prev4.w, 1, true) + " en 4 semanas" : ult ? sdate(+fromIso(ult.d)) : ""}</small></div>
    </div>
    <div class="grid g2" style="margin-top:12px">
      <div><h3>Últimos entrenamientos <button class="btn sm" data-a="ver" data-v="entrenos">Ver todos</button></h3>
        <div class="list glass">${ss.slice(0, 5).map((s) => `<button class="row" data-a="abrir-ses" data-v="${s.id}">${sesionFila(s)}</button>`).join("") || '<div class="empty">Sin entrenamientos todavía.</div>'}</div></div>
      <div><h3>Récords recientes <small>últimos 14 días</small></h3>
        <div class="list glass">${prs.map((p) => `<div class="row"><span class="pill pr">PR</span><div class="t"><b>${esc(p.name)}</b><span class="num">${fmt(p.w)} ${p.unit} × ${p.r} · ${sdate(p.at)}</span></div></div>`).join("") || '<div class="empty">Sin récords nuevos.</div>'}</div></div>
      <div><h3>Composición (SECA) <button class="btn sm" data-a="ver" data-v="cuerpo">Ver todo</button></h3>
        <div class="card glass">${lastIb ? `<div class="grid g4" style="grid-template-columns:repeat(2,1fr)">${["peso", "grasaPct", "mme", "grasaVisceral"].map((k) => { const f = INBODY.find((x) => x[0] === k);
          return `<div class="kpi"><b class="num" style="font-size:22px">${fmt(lastIb[k])} <small style="display:inline;font-size:13px">${f[2]}</small></b><span>${f[1]}</span>${prevIb && lastIb[k] != null && prevIb[k] != null ? `<small>${signo(lastIb[k] - prevIb[k], 1, k !== "mme")} vs. ${sdate(+fromIso(prevIb.d))}</small>` : ""}</div>`; }).join("")}</div>
          <p class="muted" style="margin-top:10px;font-size:13px">Medición del ${fdate(+fromIso(lastIb.d))}</p>` : '<p class="muted">Todavía no hay mediciones SECA.</p>'}</div></div>
      <div><h3>Mensajes <button class="btn sm" data-a="ver" data-v="mensajes">Escribir</button></h3>
        <div class="list glass">${msgs.map((m) => `<div class="row"><div class="t"><b>${esc(m.name || (m.role === "coach" ? "Coach" : "Atleta"))}</b><span style="white-space:normal">${esc(m.text)}</span></div><span class="dim num" style="font-size:12.5px">${sdate(m.at)}</span></div>`).join("") || '<div class="empty">Sin mensajes.</div>'}</div></div>
    </div>`;
}
function recientesPR() {
  const out = [], cat = catalogo(), ks = new Set(sesiones().flatMap((s) => Object.keys(s.log)));
  for (const k of ks) {
    const h = historial(k); let best = 0;
    h.forEach((p, i) => { if (i > 0 && p.top > best && p.at >= Date.now() - 14 * 864e5) { const x = p.sets.find((y) => +y.w === p.top); out.push({ name: cat[k]?.name || nombreEj(k), w: p.top, r: x?.r, unit: p.unit, at: p.at }); } best = Math.max(best, p.top); });
  }
  return out.sort((a, b) => b.at - a.at).slice(0, 6);
}

function sesionDetalle(s) {
  const notas = S.docs.note || {};
  return Object.entries(s.log).filter(([, l]) => l.some((x) => x.done)).map(([k, l]) => {
    const slot = Object.entries(s.swaps || {}).find(([, v]) => v === k)?.[0];
    const nota = notas[k]?.data?.t;
    return `<div class="exr"><div><b>${esc(nombreEj(k, s))}</b>${slot ? `<div class="dim" style="font-size:12.5px">en lugar de ${esc(nombreEj(slot, s))}</div>` : ""}</div>
      <div class="sets">${l.filter((x) => x.done).map((x) => `<span class="set ${x.warm ? "w" : ""} num">${x.warm ? "calent. " : ""}${fmt(+x.w || 0, 2)}×${x.r ?? "?"}${x.rir != null && x.rir !== "" ? ` <em>RIR ${x.rir}</em>` : ""}</span>`).join("")}</div>
      ${nota ? `<div class="n">Nota de la máquina: ${esc(nota)}</div>` : ""}</div>`;
  }).join("") + (s.note ? `<p class="muted" style="padding-top:8px">Comentario del atleta: ${esc(s.note)}</p>` : "");
}
function entrenosV() {
  const ss = sesiones();
  return `<h2>Entrenamientos</h2><p class="lead">${ss.length} sesiones. Toca una para ver cada serie con su peso, repeticiones y RIR.</p>
    <div class="grid" style="gap:10px">${ss.map((s) => `<details class="ses glass" data-ses="${s.id}" ${S.abiertos.has(s.id) ? "open" : ""}><summary class="row">${sesionFila(s)}</summary><div class="ses-body">${sesionDetalle(s)}</div></details>`).join("") || '<div class="empty glass">Sin entrenamientos todavía.</div>'}</div>`;
}

function spark(vals, W = 120, H = 34) {
  if (vals.length < 2) return "";
  const lo = Math.min(...vals), hi = Math.max(...vals), X = (i) => 3 + i * (W - 6) / (vals.length - 1), Y = (v) => hi === lo ? H / 2 : H - 3 - (v - lo) * (H - 6) / (hi - lo);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" style="width:${W}px" aria-hidden="true"><polyline points="${vals.map((v, i) => X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ")}" fill="none" stroke="var(--volt)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(vals.length - 1)}" cy="${Y(vals[vals.length - 1])}" r="3" fill="var(--blue)"/></svg>`;
}
function progresoV() {
  const cat = catalogo(), ks = [...new Set(sesiones().flatMap((s) => Object.keys(s.log)))].filter((k) => historial(k).length);
  ks.sort((a, b) => (cat[a]?.orden ?? 1e9) - (cat[b]?.orden ?? 1e9));
  const filas = ks.map((k) => { const h = historial(k), f = h[0], l = h[h.length - 1], u = l.unit;
    return `<tr><td><b>${esc(cat[k]?.name || nombreEj(k))}</b><div class="dim" style="font-size:12px">${esc(cat[k] ? (cat[k].alt ? "Alternativa · " : "") + cat[k].day.name : "Ya no está en la rutina")}</div></td>
      <td class="num">${h.length}</td><td class="num">${fmt(f.top, 2)} ${u}</td><td class="num">${fmt(l.top, 2)} ${u}</td><td class="num">${signo(l.top - f.top, 2)}</td>
      <td class="num">${fmt(Math.max(...h.map((p) => p.e1)))} ${u}</td><td class="num">${l.sets.map((x) => `${fmt(+x.w, 2)}×${x.r}`).join(" · ")}</td><td>${spark(h.slice(-10).map((p) => p.top))}</td></tr>`; }).join("");
  return `<h2>Progreso</h2><p class="lead">Peso máximo por sesión en cada ejercicio. El 1RM estimado usa la fórmula de Epley.</p>
    ${filas ? `<div class="tw glass"><table><thead><tr><th>Ejercicio</th><th>Sesiones</th><th>Primera</th><th>Última</th><th>Cambio</th><th>1RM est.</th><th>Última sesión</th><th></th></tr></thead><tbody>${filas}</tbody></table></div>` : '<div class="empty glass">Todavía no hay datos.</div>'}`;
}

function cuerpoV() {
  const pesos = vivos("body").map((d) => d.data).sort((a, b) => a.d < b.d ? 1 : -1);
  const ib = vivos("inbody").map((d) => d.data).sort((a, b) => a.d < b.d ? 1 : -1);
  const usados = INBODY.filter(([k]) => ib.some((x) => x[k] != null));
  const tablaIb = ib.length ? `<div class="tw glass"><table><thead><tr><th>Medida</th>${ib.map((x) => `<th>${sdate(+fromIso(x.d))}</th>`).join("")}${ib.length > 1 ? "<th>Cambio</th>" : ""}</tr></thead><tbody>
    ${usados.map(([k, n, u]) => `<tr><td>${n} <span class="dim">${u}</span></td>${ib.map((x) => `<td class="num">${fmt(x[k], 2)}</td>`).join("")}${ib.length > 1 ? `<td class="num">${ib[0][k] != null && ib[ib.length - 1][k] != null ? signo(ib[0][k] - ib[ib.length - 1][k], 2, !["mme", "mlg", "anguloFase", "aguaTotal", "ffmi", "brazoDer", "brazoIzq", "torso", "piernaDer", "piernaIzq"].includes(k)) : "–"}</td>` : ""}</tr>`).join("")}
    <tr><td>Reporte</td>${ib.map((x) => `<td>${x.archivo ? `<a href="${SRV}/api/archivos/${esc(x.archivo)}" target="_blank" rel="noopener">Abrir</a>` : "–"}</td>`).join("")}${ib.length > 1 ? "<td></td>" : ""}</tr>
    </tbody></table></div>${ib.some((x) => x.nota) ? `<div class="card glass" style="margin-top:10px">${ib.filter((x) => x.nota).map((x) => `<p><b>${sdate(+fromIso(x.d))}:</b> ${esc(x.nota)}</p>`).join("")}</div>` : ""}` : '<div class="empty glass">Todavía no hay mediciones SECA.</div>';
  return `<h2>Cuerpo</h2><p class="lead">Mediciones de composición corporal (SECA) y el peso semanal que registra tu atleta.</p>
    <h3>Composición corporal (SECA)</h3>${tablaIb}
    <h3>Peso y medidas semanales</h3>
    ${pesos.length ? `<div class="tw glass"><table><thead><tr><th>Fecha</th><th>Peso</th><th>Cintura</th><th>% grasa</th></tr></thead><tbody>${pesos.map((b) => `<tr><td>${fdate(+fromIso(b.d))}</td><td class="num">${b.w != null ? fmt(b.w) + " " + (b.unit || "kg") : "–"}</td><td class="num">${b.waist != null ? fmt(b.waist) + " cm" : "–"}</td><td class="num">${b.fat != null ? fmt(b.fat) + "%" : "–"}</td></tr>`).join("")}</tbody></table></div>` : '<div class="empty glass">Sin registros todavía.</div>'}`;
}

// ---------- routine editor ----------
function borrador() { if (!S.draft) S.draft = structuredClone(rutina()); return S.draft; }
const campo = (p, label, v, tipo = "text", extra = "") => `<label class="field">${label}<input class="in" data-p="${p}" type="${tipo}" value="${esc(v ?? "")}" ${extra}></label>`;
const area = (p, label, v, ph = "") => `<label class="field">${label}<textarea class="in" data-p="${p}" placeholder="${esc(ph)}">${esc(v ?? "")}</textarea></label>`;
function rutinaV() {
  const R = borrador(), di = Math.min(S.dayI, R.days.length - 1), d = R.days[di];
  const dias = R.days.map((x, i) => `<button class="day" data-a="dia" data-v="${i}" style="--c:var(--${x.plate})" aria-current="${i === di}"><span class="dot" style="--c:var(--${x.plate})"></span>${esc(x.name)} <span class="dim">${DOWS[x.dow]?.slice(0, 3) || ""}</span></button>`).join("")
    + `<button class="day" data-a="dia-nuevo">${I("plus")} Día</button>`;
  if (!d) return `<h2>Rutina</h2><div class="days">${dias}</div>`;
  const P = `days.${di}`;
  const ejercicios = d.ex.map((e, ei) => {
    const p = `${P}.ex.${ei}`, abierto = S.abiertos.has(e.k);
    return `<div class="exc glass">
      <div class="exc-h"><img src="${imgURL(e.img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="t"><b>${ei + 1}. ${esc(e.name)}</b><span>${esc(e.variant)} · ${esc(e.muscle)} · <span class="num">${e.sets} × ${e.reps[0]}${e.reps[1] !== e.reps[0] ? "–" + e.reps[1] : ""}</span> · descanso ${e.rest[0]}–${e.rest[1]} s</span>
          ${e.coachNote ? `<span style="display:block;color:var(--volt)">Tu nota: ${esc(e.coachNote)}</span>` : ""}</div></div>
      <div class="exc-tools">
        <button class="btn sm" data-a="editar" data-v="${e.k}">${I("edit")} ${abierto ? "Cerrar" : "Editar"}</button>
        <button class="ic" data-a="subir" data-v="${ei}" ${ei === 0 ? "disabled" : ""} aria-label="Subir">${I("up")}</button>
        <button class="ic" data-a="bajar" data-v="${ei}" ${ei === d.ex.length - 1 ? "disabled" : ""} aria-label="Bajar">${I("down")}</button>
        <select class="in" data-a="mover" data-v="${ei}" style="width:auto;min-height:36px;font-size:13.5px"><option value="">Mover a…</option>${R.days.map((x, i) => i === di ? "" : `<option value="${i}">${esc(x.name)}</option>`).join("")}</select>
        <button class="btn sm peligro" data-a="quitar" data-v="${ei}">Quitar</button>
      </div>
      ${abierto ? `<div class="grid" style="gap:10px">
        <div class="f3">${campo(p + ".name", "Nombre", e.name)}${campo(p + ".variant", "Variante", e.variant)}${campo(p + ".muscle", "Músculo", e.muscle)}</div>
        <div class="f3">${campo(p + ".sets", "Series", e.sets, "number", 'min="1" max="12"')}
          <label class="field">Repeticiones<div class="mini"><input class="in" data-p="${p}.reps.0" type="number" min="1" value="${e.reps[0]}"><span>a</span><input class="in" data-p="${p}.reps.1" type="number" min="1" value="${e.reps[1]}"></div></label>
          <label class="field">Descanso (s)<div class="mini"><input class="in" data-p="${p}.rest.0" type="number" min="15" step="5" value="${e.rest[0]}"><span>a</span><input class="in" data-p="${p}.rest.1" type="number" min="15" step="5" value="${e.rest[1]}"></div></label>
          <label class="field">Barra para la calculadora<select class="in" data-p="${p}.bar">${Object.entries(BARRAS).map(([k, n]) => `<option value="${k}" ${e.bar === k ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
        ${area(p + ".cue", "Técnica (se muestra en la app)", e.cue)}
        ${area(p + ".coachNote", "Tu nota para el atleta", e.coachNote, "Ej. esta semana sube 2.5 kg si llegas a 12 en todas")}
        <div class="f3">${campo(p + ".yt", "Búsqueda del video en YouTube", e.yt)}<div class="field">Foto<button class="btn" data-a="foto" data-v="${p}.img">${I("photo")} Cambiar foto</button></div></div>
        <div class="field">Alternativas (si la máquina está ocupada)
          <div class="alts">${(e.alts || []).map((a, ai) => `<div class="alt"><img src="${imgURL(a.img)}" alt="" onerror="this.style.visibility='hidden'"><div class="t"><input class="in" data-p="${p}.alts.${ai}.name" value="${esc(a.name)}" aria-label="Nombre de la alternativa"><span>${esc(a.variant || "")}</span></div>
            <button class="ic" data-a="foto" data-v="${p}.alts.${ai}.img" aria-label="Foto de la alternativa">${I("photo")}</button><button class="ic" data-a="alt-quitar" data-v="${ei}.${ai}" aria-label="Quitar alternativa">${I("x")}</button></div>`).join("")}
            <button class="btn sm" data-a="alt-nueva" data-v="${ei}" style="justify-self:start">${I("plus")} Agregar alternativa</button></div></div>
      </div>` : ""}
    </div>`;
  }).join("");
  return `<h2>Rutina</h2><p class="lead">Lo que cambies aquí le llega a la app de tu atleta al guardar.</p>
    <div class="days">${dias}</div>
    <div class="card glass" style="margin-top:12px"><div class="f3">${campo(P + ".name", "Nombre del día", d.name)}${campo(P + ".focus", "Enfoque", d.focus)}
      <label class="field">Día de la semana<select class="in" data-p="${P}.dow" data-num="1">${DOWS.map((n, i) => `<option value="${i}" ${d.dow === i ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      <label class="field">Color del disco<select class="in" data-p="${P}.plate">${Object.entries(COLORES).map(([k, n]) => `<option value="${k}" ${d.plate === k ? "selected" : ""}>${n} (${PLATES[k]})</option>`).join("")}</select></label></div>
      <div style="margin-top:10px"><button class="btn sm peligro" data-a="dia-quitar">Quitar este día</button></div></div>
    <h3>Ejercicios <small>${d.ex.length}</small></h3>
    <div class="grid" style="gap:10px">${ejercicios}<button class="btn pri" data-a="catalogo" style="justify-self:start">${I("plus")} Agregar ejercicio</button></div>
    <h3>Mensaje en la pantalla de inicio</h3>
    <div class="card glass">${area("message", "Lo ve arriba en la app", R.message, "Ej. Esta semana prioriza la técnica en sentadilla.")}</div>
    <h3>Indicaciones generales</h3>
    <div class="grid" style="gap:8px">${(R.coachTips || []).map((t, i) => `<div class="card glass" style="display:grid;grid-template-columns:1fr 1.4fr auto;gap:8px;align-items:end;padding:12px">${campo(`coachTips.${i}.t`, "Indicación", t.t)}${campo(`coachTips.${i}.s`, "Detalle", t.s)}<button class="ic" data-a="tip-quitar" data-v="${i}" aria-label="Quitar">${I("x")}</button></div>`).join("")}
      <button class="btn sm" data-a="tip-nuevo" style="justify-self:start">${I("plus")} Agregar indicación</button></div>`;
}
const savebar = () => `<div class="savebar glass"><span>Cambios sin guardar</span><button class="btn sm" data-a="descartar">Descartar</button><button class="btn sm pri" data-a="guardar">Guardar</button></div>`;
function ponerEn(obj, ruta, v) { const ps = ruta.split("."), last = ps.pop(); let o = obj; for (const p of ps) o = o[p]; o[last] = v; }
// first edit shows the save bar without re-rendering, so the field being typed in keeps focus
function marcar() { if (!S.dirty) { S.dirty = true; $("#app").insertAdjacentHTML("beforeend", savebar()); } }
function cambiaEstructura(fn) { fn(borrador()); S.dirty = true; render(); }

async function abrirFotos(ruta) {
  if (!S.imagenes) S.imagenes = (await api("/api/imagenes")).imagenes;
  const actual = ruta.split(".").reduce((o, p) => o?.[p], borrador());
  const m = $("#modal"); m.hidden = false;
  const pinta = (q = "") => {
    const lista = S.imagenes.filter((n) => n.includes(q.toLowerCase().trim().replace(/\s+/g, "-")));
    $(".pics", m).innerHTML = lista.map((n) => `<button class="pic" data-a="foto-elegir" data-v="${n}" aria-pressed="${n === actual}"><img src="${imgURL(n)}" alt="" loading="lazy"><span>${esc(n.replace(/-/g, " "))}</span></button>`).join("");
  };
  m.innerHTML = `<div class="sheet"><h3>Foto del ejercicio <button class="ic" data-a="cerrar" aria-label="Cerrar">${I("x")}</button></h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><input class="in" id="buscar" placeholder="Buscar (en inglés: press, squat, curl…)" style="flex:1;min-width:200px">
      <label class="btn">${I("photo")} Subir una foto<input type="file" id="subir" accept="image/jpeg,image/png" hidden></label></div>
    <div class="pics"></div></div>`;
  m.dataset.ruta = ruta; pinta();
  $("#buscar", m).addEventListener("input", (e) => pinta(e.target.value));
}

// Exercise library: pick one and it lands in the day with its sets, reps, rest, technique, video and alternatives.
const sinAcentos = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
async function abrirCatalogo() {
  if (!S.catalogo) S.catalogo = await fetch("catalogo.json").then((r) => r.json());
  const m = $("#modal"), C = S.catalogo, f = { q: "", musculo: "" };
  m.hidden = false;
  const pinta = () => {
    const dia = borrador().days[S.dayI], q = sinAcentos(f.q).trim(), ya = new Set(dia.ex.flatMap((e) => [e.k, e.img && "img:" + e.img]));
    const lista = C.ejercicios.filter((x) => (!f.musculo || x.muscle === f.musculo) && (!q || sinAcentos(`${x.name} ${x.variant} ${x.muscle}`).includes(q)));
    $(".chips", m).innerHTML = ["", ...C.musculos].map((x) => `<button class="chip" data-a="cat-musculo" data-v="${esc(x)}" aria-pressed="${f.musculo === x}">${x || "Todos"}</button>`).join("");
    $(".pics", m).innerHTML = lista.map((x) => {
      const esta = ya.has("x:" + x.k) || (x.img && ya.has("img:" + x.img));
      return `<button class="pic cat" data-a="cat-elegir" data-v="${esc(x.k)}" ${esta ? "disabled" : ""}>
        ${x.img ? `<img src="${imgURL(x.img)}" alt="" loading="lazy">` : `<span class="sinfoto">${I("photo")}<small>Sin foto</small></span>`}
        <b>${esc(x.name)}</b><span>${esc(x.variant)}</span><span class="num">${esc(x.muscle)} · ${x.sets} × ${x.reps[0]}–${x.reps[1]}${esta ? " · ya está" : ""}</span></button>`;
    }).join("") || '<p class="muted">Nada con esa búsqueda.</p>';
  };
  m.innerHTML = `<div class="sheet"><h3>Agregar a ${esc(borrador().days[S.dayI].name)} <button class="ic" data-a="cerrar" aria-label="Cerrar">${I("x")}</button></h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><input class="in" id="buscar-ej" placeholder="Buscar: press, remo, sentadilla, bíceps…" style="flex:1;min-width:200px" autofocus>
      <button class="btn" data-a="ej-nuevo">${I("plus")} En blanco</button></div>
    <div class="chips"></div><div class="pics"></div>
    <p class="muted" style="margin:0;font-size:12.5px">Llega con series, repeticiones, descanso, técnica, video y alternativas. Después puedes editar lo que quieras.</p></div>`;
  abrirCatalogo.pinta = pinta; abrirCatalogo.f = f; pinta();
  $("#buscar-ej", m).addEventListener("input", (e) => { f.q = e.target.value; pinta(); });
}
function agregarDelCatalogo(slug) {
  const C = S.catalogo, x = C.ejercicios.find((e) => e.k === slug); if (!x) return;
  const alt = (k) => { const a = C.ejercicios.find((e) => e.k === k); return a && { k: "alt:" + a.k, name: a.name, variant: a.variant, muscle: a.muscle, img: a.img, cue: a.cue, yt: a.yt }; };
  const ej = { k: "x:" + x.k, name: x.name, variant: x.variant, muscle: x.muscle, sets: x.sets, reps: [...x.reps], rest: [...x.rest], img: x.img,
    cue: x.cue, yt: x.yt, bar: x.bar, coachNote: "", alts: x.alts.slice(0, 3).map(alt).filter(Boolean) };
  cambiaEstructura((R) => R.days[S.dayI].ex.push(ej));
  aviso(`${x.name} agregado. Guarda para mandarlo a la app.`);
}

function mensajesV() {
  const ms = vivos("comment").map((d) => d.data).sort((a, b) => a.at - b.at);
  return `<h2>Mensajes</h2><p class="lead">Lo que escribas aquí le aparece a tu atleta en la app.</p>
    <div class="card glass"><div class="chat">${ms.map((m) => `<div class="msg ${m.role === S.user.role ? "yo" : ""}">${esc(m.text)}<small>${esc(m.name || "")} · ${fdate(m.at)} ${new Date(m.at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</small></div>`).join("") || '<p class="muted">Todavía no hay mensajes.</p>'}</div>
    <form class="composer" id="enviar"><textarea class="in" name="texto" placeholder="Escribe un mensaje…" required></textarea><button class="btn pri" type="submit">Enviar</button></form></div>`;
}

// ---------- events ----------
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-a]"); if (!b || b.tagName === "SELECT") return;
  const a = b.dataset.a, v = b.dataset.v;
  if (b.closest("summary")) return;
  try {
    switch (a) {
      case "modo": S.invitacion = S.invitacion == null ? "" : null; render(); break;
      case "ver": S.perfil = null; if (S.view === "rutina" && S.dirty && v !== "rutina" && !confirm("Tienes cambios sin guardar en la rutina. ¿Salir sin guardar?")) break;
        if (v !== "rutina") { S.draft = null; S.dirty = false; } S.view = v; render(); scrollTo(0, 0); break;
      case "abrir-ses": S.abiertos.add(v); S.view = "entrenos"; render(); document.querySelector(`[data-ses="${v}"]`)?.scrollIntoView({ block: "start" }); break;
      case "refrescar": await sincronizar(); if (!S.dirty) S.draft = null; render(); aviso("Actualizado"); break;
      case "salir": await api("/api/logout", { method: "POST" }).catch(() => {}); S.user = null; S.docs = {}; S.seq = 0; render(); break;
      case "dia": S.dayI = +v; render(); break;
      case "dia-nuevo": cambiaEstructura((R) => { R.days.push({ k: nuevoId("d"), dow: 4, dia: DOWS[4], name: "Nuevo día", focus: "", plate: "blue", ex: [] }); S.dayI = R.days.length - 1; }); break;
      case "dia-quitar": if (confirm("¿Quitar este día de la rutina? Los entrenamientos ya hechos se conservan.")) cambiaEstructura((R) => { R.days.splice(S.dayI, 1); S.dayI = 0; }); break;
      case "editar": S.abiertos.has(v) ? S.abiertos.delete(v) : S.abiertos.add(v); render(); break;
      case "subir": case "bajar": cambiaEstructura((R) => { const ex = R.days[S.dayI].ex, i = +v, j = a === "subir" ? i - 1 : i + 1; [ex[i], ex[j]] = [ex[j], ex[i]]; }); break;
      case "quitar": if (confirm("¿Quitar este ejercicio del día? Su historial se conserva.")) cambiaEstructura((R) => R.days[S.dayI].ex.splice(+v, 1)); break;
      case "ej-nuevo": $("#modal").hidden = true; $("#modal").innerHTML = ""; cambiaEstructura((R) => { const k = nuevoId("c"); R.days[S.dayI].ex.push({ k, name: "Ejercicio nuevo", variant: "", muscle: "", sets: 3, reps: [10, 12], rest: [60, 75], img: "", cue: "", yt: "", bar: "olimpica", coachNote: "", alts: [] }); S.abiertos.add(k); }); break;
      case "alt-nueva": cambiaEstructura((R) => { const e = R.days[S.dayI].ex[+v]; (e.alts ||= []).push({ k: nuevoId("alt:c"), name: "Alternativa", variant: "", muscle: e.muscle, img: "", cue: "", yt: "" }); }); break;
      case "alt-quitar": { const [ei, ai] = v.split(".").map(Number); cambiaEstructura((R) => R.days[S.dayI].ex[ei].alts.splice(ai, 1)); break; }
      case "tip-nuevo": cambiaEstructura((R) => (R.coachTips ||= []).push({ t: "", s: "" })); break;
      case "tip-quitar": cambiaEstructura((R) => R.coachTips.splice(+v, 1)); break;
      case "foto": await abrirFotos(v); break;
      case "catalogo": await abrirCatalogo(); break;
      case "cat-musculo": abrirCatalogo.f.musculo = v; abrirCatalogo.pinta(); break;
      case "cat-elegir": agregarDelCatalogo(v); abrirCatalogo.pinta(); break;
      case "foto-elegir": { const m = $("#modal"); ponerEn(borrador(), m.dataset.ruta, v); m.hidden = true; m.innerHTML = ""; S.dirty = true; render(); break; }
      case "cerrar": $("#modal").hidden = true; $("#modal").innerHTML = ""; break;
      case "descartar": S.draft = null; S.dirty = false; render(); break;
      case "guardar": { b.disabled = true; const R = borrador(); R.updatedAt = Date.now();
        R.days.forEach((d) => { d.dia = DOWS[d.dow]; d.ex.forEach((x) => { x.sets = Math.max(1, +x.sets || 1); x.reps = x.reps.map((n) => Math.max(1, +n || 1)); x.rest = x.rest.map((n) => Math.max(15, +n || 60)); if (x.reps[1] < x.reps[0]) x.reps[1] = x.reps[0]; if (x.rest[1] < x.rest[0]) x.rest[1] = x.rest[0]; }); });
        await guardarDocs([{ kind: "routine", id: "actual", data: R, updatedAt: R.updatedAt }]);
        S.draft = null; S.dirty = false; render(); aviso("Rutina guardada. Le llega a la app al sincronizar."); break; }
    }
  } catch (err) { aviso(err.message); if (err.status === 401) { S.user = null; render(); } }
});
document.addEventListener("input", (e) => {
  if (e.target.dataset?.perfil && S.perfil) { S.perfil[e.target.dataset.perfil] = e.target.value; return; }
  const p = e.target.dataset?.p; if (!p) return;
  const num = e.target.type === "number" || e.target.dataset.num;
  ponerEn(borrador(), p, num ? +e.target.value : e.target.value); marcar();
});
document.addEventListener("change", async (e) => {
  if (e.target.dataset?.p && e.target.tagName === "SELECT") { render(); return; }
  if (e.target.dataset?.a === "mover" && e.target.value !== "") {
    const to = +e.target.value, i = +e.target.dataset.v;
    cambiaEstructura((R) => { const [x] = R.days[S.dayI].ex.splice(i, 1); R.days[to].ex.push(x); });
    aviso("Ejercicio movido a " + borrador().days[to].name); return;
  }
  if (e.target.id === "foto-perfil") {
    const f = e.target.files?.[0]; if (!f) return;
    if (!/^image\/(jpeg|png)$/.test(f.type)) { aviso("Sube una foto JPG o PNG."); return; }
    try { const r = await api("/api/archivos", { method: "POST", body: f, headers: { "Content-Type": f.type, "X-Nombre": encodeURIComponent(f.name) } });
      S.perfil.photo = r.id; render();
    } catch (err) { aviso(err.message); }
    return;
  }
  if (e.target.id === "subir") {
    const f = e.target.files?.[0]; if (!f) return;
    try { const r = await api("/api/archivos", { method: "POST", body: f, headers: { "Content-Type": f.type, "X-Nombre": encodeURIComponent(f.name) } });
      const m = $("#modal"); ponerEn(borrador(), m.dataset.ruta, "file:" + r.id); m.hidden = true; m.innerHTML = ""; S.dirty = true; render();
    } catch (err) { aviso(err.message); }
  }
});
document.addEventListener("toggle", (e) => { const id = e.target.dataset?.ses; if (id) e.target.open ? S.abiertos.add(id) : S.abiertos.delete(id); }, true);
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, datos = Object.fromEntries(new FormData(f));
  try {
    if (f.id === "login" || f.id === "registro") {
      const r = await api(f.id === "login" ? "/api/login" : "/api/registro", { method: "POST", body: JSON.stringify({ ...datos, web: true }) });
      if (f.id === "registro") history.replaceState(null, "", location.pathname);
      S.invitacion = null; await arrancar();
    } else if (f.id === "perfil") {
      if (!S.perfil.photo) throw new Error("Sube una foto tuya para que tu atleta te reconozca.");
      const r = await api("/api/perfil", { method: "POST", body: JSON.stringify({ name: S.perfil.name, bio: S.perfil.bio, photo: S.perfil.photo }) });
      S.user = r.user; S.gente = S.gente.map((g) => g.id === r.user.id ? r.user : g); S.perfil = null;
      if (S.view === "perfil") S.view = "resumen";
      render(); aviso("Perfil guardado. Tu atleta lo ve en la app.");
    } else if (f.id === "enviar") {
      const texto = datos.texto.trim(); if (!texto) return;
      await guardarDocs([{ kind: "comment", id: nuevoId("m"), data: { text: texto, at: Date.now(), role: S.user.role, name: S.user.name }, updatedAt: Date.now() }]);
      render();
    }
  } catch (err) { const el = $("#err"); if (el) el.textContent = err.message; else aviso(err.message); }
});
addEventListener("beforeunload", (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ""; } });

async function arrancar() {
  const yo = await api("/api/yo");
  S.user = yo.user; S.gente = yo.gente;
  await sincronizar(); render();
}
(async () => {
  const m = /invitacion=([A-Za-z0-9-]+)/.exec(location.hash);
  if (m) S.invitacion = m[1];
  try { if (S.invitacion != null) throw 0; await arrancar(); } catch { S.user = null; render(); }
  setInterval(() => { if (S.user && !S.dirty && document.visibilityState === "visible" && !document.activeElement?.matches("input,textarea,select") && $("#modal").hidden) sincronizar().then(render).catch(() => {}); }, 60000);
})();
