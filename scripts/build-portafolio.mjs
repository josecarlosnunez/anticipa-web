// Genera el portafolio de anticipamx.com: /portafolio/ y una página por proyecto.
//
//   node scripts/build-portafolio.mjs
//
// Los proyectos viven en el arreglo PROYECTOS. Agregar uno es agregar una entrada y sus
// imágenes en portafolio/img/. El estilo y el movimiento están en portafolio/portafolio.css
// y portafolio/portafolio.js, que no se generan: se editan a mano. Cada página lleva además su
// imagen para compartir (WhatsApp, LinkedIn) en portafolio/img/og-<slug>.jpg, de 1200×630.
//
// Regla de la casa: aquí no van nombres de clientes ni cifras de tratos concretos.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOMINIO = "https://anticipamx.com";
const CORREO = "hola@anticipamx.com";

const correo = (asunto) => `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}`;

export const PROYECTOS = [
  {
    slug: "tika-pay",
    nombre: "Tika-Pay",
    tipo: "Producto propio",
    sector: "Pagos para restaurantes",
    estado: "En producción",
    anio: "2026",
    linea: "La cuenta del restaurante, resuelta con un QR.",
    resumen:
      "El comensal escanea, ve su cuenta y paga desde su celular: todo, solo lo suyo o en partes iguales. Sin terminal, sin renta y sin esperar al mesero.",
    plataformas: "Web app para comensal, mesero, cocina y administración",
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind 4", "SQLite", "Stripe", "PayPal", "Mercado Pago", "Railway"],
    acciones: [{ texto: "Ver tika-pay.com", href: "https://tika-pay.com", externo: true }],
    problema:
      "Pedir la cuenta es el momento más lento de un restaurante: esperar al mesero, esperar la terminal, dividir entre seis y volver a pasar tarjetas. La mesa se queda ocupada y nadie está contento.",
    solucion:
      "Un sistema completo que cabe en un código QR. El mesero levanta la orden desde una tablet, la cocina la recibe en vivo y cada comensal paga desde su teléfono con Apple Pay, Google Pay o tarjeta. El restaurante ve sus ventas del día sin instalar nada.",
    funciones: [
      ["Tres formas de pagar", "Cuenta completa, solo mis platillos o partes iguales entre N personas, con propina guiada."],
      ["QR permanente por mesa", "El comensal ordena desde su celular, todo se suma a la cuenta abierta y puede pedirla sin mesero."],
      ["Pantalla de cocina", "Las comandas llegan en vivo con estados pendiente, preparando y listo."],
      ["Recibo y factura", "Recibo digital por WhatsApp o correo y solicitud de CFDI desde el mismo recibo."],
      ["Panel del restaurante", "Ventas del día, platillos más pedidos, ticket promedio y editor de menú."],
      ["Tres pasarelas", "Stripe, PayPal y Mercado Pago. Sin llaves configuradas, todo corre en modo demostración."],
    ],
    decisiones: [
      ["Dividir nunca multiplica la comisión", "La comisión de servicio se calcula por cuenta, no por pago. Seis personas pagando por separado cuestan lo mismo que una."],
      ["Las pruebas cubren el dinero", "Comisiones, aritmética de partes, aislamiento por restaurante e idempotencia de pagos se prueban contra una base real en cada cambio, sin simulacros."],
      ["El personal es invisible para el público", "Quien llega por el QR no puede encontrar las pantallas de mesero ni de administración: para esa persona no existen."],
    ],
    portada: "portada-tika-pay.jpg",
    galeria: { tipo: "mixta", escritorio: ["tika-todo.jpg", "tika-precio.jpg"], movil: ["tika-m.jpg"] },
  },
  {
    slug: "jamz-godinez",
    nombre: "Jamz Godinez",
    tipo: "Producto propio",
    sector: "Comunidad y música",
    estado: "En App Store",
    anio: "2026",
    linea: "El club de música de la oficina.",
    resumen:
      "Una comunidad que vota el disco de la semana, lo escucha al mismo tiempo desde su escritorio, lo reseña y consigue boletos entre sí.",
    plataformas: "Web, iOS en App Store y Android con Capacitor",
    stack: ["Python", "Flask", "SQLite", "Capacitor", "Spotify API", "WhatsApp", "Notificaciones push", "Railway"],
    acciones: [
      { texto: "Ver en App Store", href: "https://apps.apple.com/mx/app/jamz-godinez/id6779859453", externo: true },
      { texto: "jamzgodinez.com", href: "https://www.jamzgodinez.com", externo: true, linea: true },
    ],
    problema:
      "Empezó como un grupo de WhatsApp donde la oficina votaba un disco al día. Funcionaba, pero todo era manual: armar la votación, contar, publicar al ganador, compartir el enlace. Y lo que se decía de cada disco se perdía en el chat.",
    solucion:
      "Una app con identidad propia que convierte ese ritual en producto: la votación se arma sola, el disco ganador suena en sincronía, las reseñas se quedan y la comunidad tiene perfil, rachas y eventos.",
    funciones: [
      ["Votación semanal", "La banda sugiere discos y da like. Los más pedidos entran a votación con arte generado para cada ronda."],
      ["Escucha sincronizada", "El disco ganador suena en un Jam de Spotify: cada quien desde su cubículo, todos al mismo tiempo."],
      ["Listening Rooms", "Cuartos de escucha con portada, chat en vivo y reacciones."],
      ["Reseñas y calificaciones", "Cada disco guarda lo que dijo la comunidad. El mejor reseñado de la semana sube a portada."],
      ["Eventos y boletos", "Compra y venta de boletos entre miembros con pago protegido: el dinero queda en custodia."],
      ["Automatización en WhatsApp", "Votación, recordatorio y ganador se publican solos en el grupo, a su hora."],
    ],
    decisiones: [
      ["Una sola base de código, tres plataformas", "La misma aplicación web se empaqueta para iOS y Android. Una mejora llega a todos el mismo día."],
      ["El grupo de WhatsApp no se reemplaza", "La app se integra al canal donde la comunidad ya vive, en lugar de pedirle que se mude."],
      ["Aprobada por Apple", "Pasó la revisión del App Store con notificaciones push, cuentas de usuario y pagos entre miembros."],
    ],
    portada: "portada-jamz-godinez.jpg",
    galeria: { tipo: "carteles", movil: ["jamz-1.jpg", "jamz-2.jpg", "jamz-3.jpg", "jamz-4.jpg", "jamz-5.jpg", "jamz-6.jpg"] },
  },
  {
    slug: "adelanta",
    nombre: "Adelanta",
    tipo: "Sistema para cliente",
    sector: "Manufactura · Recursos Humanos",
    estado: "En implementación",
    anio: "2026",
    linea: "Adelantos de nómina desde el celular.",
    resumen:
      "El colaborador simula, solicita y firma su adelanto desde el teléfono. La empresa define la política de crédito, autoriza y cierra la corrida de nómina sin una sola hoja de cálculo.",
    plataformas: "Web, app instalable, iOS y Android",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Capacitor", "PWA", "PDF", "DigitalOcean"],
    acciones: [{ texto: "Pedir una demo", href: correo("Quiero ver la demo de Adelanta") }],
    problema:
      "Muchas empresas ya prestan a sus empleados, pero lo controlan en Excel: quién debe, cuánto se le descuenta, qué quincena va. Nadie sabe el saldo real, los descuentos se olvidan y cada autorización es una cadena de mensajes.",
    solucion:
      "Anticipa Nómina, hecha marca propia para un fabricante mexicano con personal administrativo y de planta. Un motor de crédito auditable, tres roles con permisos reales y un flujo completo: simulador, solicitud, autorización, firma, entrega en caja y descuento por nómina.",
    funciones: [
      ["Simulador en tiempo real", "Monto y plazo con sliders: cuánto se descuenta, con cuánto se queda y cuánto cuesta en total, sin letras chiquitas."],
      ["Firma del convenio", "El colaborador firma con el dedo. Sin firma, el adelanto no entra a la corrida. El convenio queda en PDF con folio y evidencia."],
      ["Política de crédito", "Tasa, comisión, plazos, topes y antigüedad mínima, con vista previa en vivo del efecto de cada cambio."],
      ["Roles y grupos", "Dirección ve todo, cada responsable solo su grupo y cada empleado solo lo suyo. Nómina semanal o quincenal según el grupo."],
      ["Corrida de nómina", "Cierre por grupo y fecha de pago, lista de caja en PDF y CSV, e historial de cierres que no se puede repetir."],
      ["Indicadores", "Capital colocado, por recuperar, intereses cobrados y solicitudes pendientes, al día."],
    ],
    decisiones: [
      ["Aritmética que se puede auditar", "Cuota francesa sobre saldo insoluto, reprogramación al omitir una cuota y liquidación anticipada prorrateada por días. Documentada para que contabilidad la verifique."],
      ["Reglas antes que pantallas", "Si la cuota rebasa el tope de preautorización, la solicitud sube sola a Dirección. Nadie tiene que acordarse de la regla."],
      ["Una marca para el cliente", "Nombre, identidad y dominio propios. El colaborador ve una prestación de su empresa, no el software de un tercero."],
    ],
    portada: "portada-adelanta.jpg",
    galeria: { tipo: "escritorio", escritorio: ["adel-sim.jpg", "adel-jef.jpg", "adel-panel.jpg"] },
    nota: "Pantallas de la simulación comercial, con datos de ejemplo.",
  },
  {
    slug: "lab2go",
    nombre: "LAB2GO",
    tipo: "Concepto y prototipo",
    sector: "Salud · Laboratorios clínicos",
    estado: "Propuesta bajo confidencialidad",
    anio: "2026",
    linea: "El laboratorio en el bolsillo de cada paciente.",
    resumen:
      "Prototipo navegable de una app para pacientes de una red de laboratorios con cobertura nacional: citas, resultados, pagos y factura en un solo lugar.",
    plataformas: "Prototipo web de una app para iPhone",
    stack: ["React", "TypeScript", "Tailwind", "Prototipo interactivo"],
    acciones: [{ texto: "Pedir acceso", href: correo("Quiero ver el prototipo de LAB2GO") }],
    problema:
      "Hacerse un estudio todavía significa llamar para preguntar, formarse sin saber cuánto falta, regresar por un sobre y pedir la factura por correo. El laboratorio atiende lo mismo por cinco canales distintos.",
    solucion:
      "Antes de escribir una línea de la app real, construimos la propuesta como simulación: un teléfono en pantalla que se puede tocar, con el recorrido completo del paciente y módulos opcionales que se encienden para ver cómo cambia el producto.",
    funciones: [
      ["Citas", "En sucursal o a domicilio, con indicaciones de preparación y el mejor horario según la afluencia."],
      ["Resultados", "Aviso cuando están listos, descarga en PDF, historial por estudio y envío por WhatsApp al médico."],
      ["Pago y factura", "Pago en línea con Apple Pay o tarjeta y factura desde la misma app."],
      ["Sucursales", "Las más cercanas, con nivel de fila en vivo para decidir a cuál ir."],
      ["Módulos opcionales", "Asistente con IA que explica los resultados, turno virtual, seguimiento en vivo y panel para directivos."],
      ["Propuesta protegida", "Acceso con registro y aceptación de términos de confidencialidad antes de ver el documento."],
    ],
    decisiones: [
      ["Vender con un prototipo, no con diapositivas", "El cliente toca la app antes de aprobarla. Las objeciones aparecen en la primera junta y no en la semana diez."],
      ["Alcance que se arma a la vista", "Cada módulo opcional se prende y se apaga en la simulación, así la conversación de alcance y precio es concreta."],
      ["Confidencial por diseño", "La propuesta vive detrás de un acuerdo de confidencialidad. Por eso aquí no aparece el nombre del cliente."],
    ],
    portada: "portada-lab2go.jpg",
    galeria: { tipo: "movil", movil: ["lab-1.jpg", "lab-2.jpg", "lab-3.jpg", "lab-4.jpg"] },
    nota: "Pantallas del prototipo, con datos de ejemplo.",
  },
  {
    slug: "constancia",
    nombre: "Constancia",
    tipo: "Herramienta interna",
    sector: "Productividad personal",
    estado: "En uso diario",
    anio: "2026",
    linea: "Un tracker de hábitos que cabe en un archivo.",
    resumen:
      "Registro diario, matriz semanal y doce meses de historia. Sin cuenta, sin nube y sin servidor: los datos nunca salen del dispositivo.",
    plataformas: "Navegador y app nativa para Mac",
    stack: ["HTML", "CSS", "JavaScript sin dependencias", "Swift", "WebKit"],
    acciones: [{ texto: "Abrir la app", href: "/portafolio/constancia/app/" }],
    problema:
      "Las apps de hábitos piden cuenta, suscripción y notificaciones, y a cambio se quedan con tus datos. Queríamos lo contrario: abrir, marcar y cerrar.",
    solucion:
      "Una aplicación completa en un solo archivo HTML. Se abre en cualquier navegador, guarda en el propio dispositivo y se empaqueta como app de Mac con un envoltorio mínimo en Swift. Es también nuestra prueba de cuánto se puede hacer sin infraestructura.",
    funciones: [
      ["Hoy", "Canales del día con metas por conteo o por marca, rachas y aviso de la racha en riesgo."],
      ["Semana", "Matriz de siete días para marcar o corregir días pasados de un vistazo."],
      ["Año", "Mapa de calor de doce meses por canal, índice de cumplimiento y mejor día de la semana."],
      ["Tareas y ánimo", "Pendientes del día y registro de ánimo junto a los hábitos."],
      ["Exportar e importar", "Todo el historial sale y entra como un archivo. El respaldo es tuyo."],
      ["Claro y oscuro", "Interfaz tipográfica, densa y rápida, en ambos temas."],
    ],
    decisiones: [
      ["Cero dependencias", "Ni frameworks ni librerías ni llamadas a la red. Pesa menos que una fotografía y abre al instante."],
      ["Una fuente, dos destinos", "El mismo archivo se sirve en el navegador y se compila como app de escritorio con un solo comando."],
      ["Privado de verdad", "Sin servidor no hay nada que filtrar. La versión publicada aquí arranca con datos de ejemplo en tu navegador."],
    ],
    portada: "portada-constancia.jpg",
    galeria: { tipo: "mixta", escritorio: ["const-hoy.jpg", "const-semana.jpg", "const-ano.jpg"], movil: ["const-m.jpg"] },
  },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (i) => String(i + 1).padStart(2, "0");
const FLECHA = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8"/></svg>`;
const LOGO = `<svg viewBox="0 0 620 160" role="img" aria-label="Anticipa"><text x="0" y="127" font-family="Barlow Condensed, Barlow, Arial, sans-serif" font-weight="800" font-size="140" letter-spacing="5.6" fill="currentColor"><tspan fill="var(--logo-acento)">A</tspan>NT<tspan fill="var(--logo-acento)">I</tspan>CIPA</text><circle cx="592" cy="115" r="12" fill="var(--logo-acento)"></circle></svg>`;

function documento({ ruta, titulo, desc, imagen, cuerpo, datos }) {
  const url = `${DOMINIO}${ruta}`;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0b1219">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Anticipa">
<meta property="og:locale" content="es_MX">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${DOMINIO}${imagen}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(titulo)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titulo)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${DOMINIO}${imagen}">

<link rel="icon" href="/icono.svg" type="image/svg+xml">
<link rel="icon" href="/icono-512.png" sizes="512x512" type="image/png">
<link rel="apple-touch-icon" href="/icono-512.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/portafolio/portafolio.css">
<script>document.documentElement.classList.add("js")</script>
<script type="application/ld+json">
${JSON.stringify(datos, null, 2)}
</script>
</head>
<body>
<header class="barra">
  <div class="env">
    <a href="/" class="barra__logo" aria-label="Anticipa, inicio">${LOGO}</a>
    <nav class="barra__menu" aria-label="Sitio">
      <a href="/portafolio/"${ruta === "/portafolio/" ? ' aria-current="page"' : ""}>Portafolio</a>
      <a href="/#servicios">Servicios</a>
      <a href="/#metodo">Método</a>
      <a href="/#contacto">Contacto</a>
    </nav>
  </div>
</header>
${cuerpo}
<footer class="cierre papel">
  <div class="env">
    <p class="mono cierre__ceja">¿Tienes algo parecido en mente?</p>
    <h2>Hable<span class="ac">mos.</span></h2>
    <div class="cierre__fila">
      <p>Con una llamada de treinta minutos sabemos si podemos ayudarte y por dónde conviene empezar.</p>
      <a class="cierre__correo" href="${correo("Quiero platicar con Anticipa")}">${CORREO}</a>
    </div>
    <div class="pie mono">
      <a href="/" class="pie__logo" aria-label="Anticipa, inicio">${LOGO}</a>
      <span>Software · IA · Operación digital · México · 2026</span>
    </div>
  </div>
</footer>
<script src="/portafolio/portafolio.js" defer></script>
</body>
</html>
`;
}

function boton(a) {
  const attrs = a.externo ? ' target="_blank" rel="noopener"' : "";
  return `<a class="btn${a.linea ? " btn--linea" : ""}" href="${esc(a.href)}"${attrs}>${esc(a.texto)} ${FLECHA}</a>`;
}

function galeria(p) {
  const g = p.galeria;
  const alt = (i) => `${p.nombre}, pantalla ${i + 1}`;
  const esc_ = (g.escritorio ?? []).map(
    (f, i) => `<figure class="toma toma--esc rv"><img src="/portafolio/img/${f}" alt="${esc(alt(i))}" width="1600" height="1000" loading="lazy" decoding="async"></figure>`,
  );
  const clase = g.tipo === "carteles" ? "toma--cartel" : "toma--tel";
  const mov = (g.movil ?? []).map(
    (f, i) => `<figure class="toma ${clase} rv"><img src="/portafolio/img/${f}" alt="${esc(alt(i + esc_.length))}" loading="lazy" decoding="async"></figure>`,
  );
  return `${esc_.length ? `<div class="tomas tomas--esc">${esc_.join("")}</div>` : ""}
      ${mov.length ? `<div class="tomas tomas--mov" data-n="${mov.length}">${mov.join("")}</div>` : ""}
      ${p.nota ? `<p class="mono tomas__nota">${esc(p.nota)}</p>` : ""}`;
}

function paginaCaso(p, i) {
  const sig = PROYECTOS[(i + 1) % PROYECTOS.length];
  const cuerpo = `<main>
  <section class="caso-hero">
    <div class="env">
      <p class="mono miga"><a href="/portafolio/">Portafolio</a> <span aria-hidden="true">/</span> ${num(i)} <span aria-hidden="true">/</span> ${esc(p.tipo)}</p>
      <h1>${esc(p.nombre)}<span class="ac">.</span></h1>
      <div class="caso-hero__pie">
        <div>
          <p class="caso-hero__linea">${esc(p.linea)}</p>
          <p class="caso-hero__lead">${esc(p.resumen)}</p>
        </div>
        <div class="caso-hero__cta">${p.acciones.map(boton).join("")}</div>
      </div>
    </div>
    <div class="env"><figure class="portada rv"><img src="/portafolio/img/${p.portada}" alt="${esc(p.nombre)}: vista general del producto" width="1600" height="1000" fetchpriority="high"></figure></div>
  </section>

  <section class="papel ficha">
    <div class="env ficha__grid">
      <dl class="tabla rv">
        <div><dt>Tipo</dt><dd>${esc(p.tipo)}</dd></div>
        <div><dt>Sector</dt><dd>${esc(p.sector)}</dd></div>
        <div><dt>Estado</dt><dd><i class="pulso" aria-hidden="true"></i>${esc(p.estado)}</dd></div>
        <div><dt>Plataformas</dt><dd>${esc(p.plataformas)}</dd></div>
        <div><dt>Año</dt><dd>${esc(p.anio)}</dd></div>
        <div><dt>Stack</dt><dd class="chips">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</dd></div>
      </dl>
      <div class="relato">
        <div class="rv"><h2 class="mono">El problema</h2><p>${esc(p.problema)}</p></div>
        <div class="rv"><h2 class="mono">Lo que construimos</h2><p>${esc(p.solucion)}</p></div>
      </div>
    </div>
  </section>

  <section class="hace">
    <div class="env">
      <div class="seccion__cab"><p class="mono">Qué hace</p><h2>Lo que ya <span class="ac">funciona.</span></h2></div>
      <ol class="hace__grid">
        ${p.funciones.map(([t, d], k) => `<li class="rv"><span class="mono">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("\n        ")}
      </ol>
    </div>
  </section>

  <section class="papel pantallas">
    <div class="env">
      <div class="seccion__cab"><p class="mono">Pantallas</p><h2>Así se <span class="ac">ve.</span></h2></div>
      ${galeria(p)}
    </div>
  </section>

  <section class="decisiones">
    <div class="env">
      <div class="seccion__cab"><p class="mono">Criterio</p><h2>Decisiones que <span class="ac">importan.</span></h2></div>
      <div class="decisiones__lista">
        ${p.decisiones.map(([t, d], k) => `<article class="rv"><span class="n">${num(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("\n        ")}
      </div>
      <div class="decisiones__cta rv">${p.acciones.map(boton).join("")}</div>
    </div>
  </section>

  <a class="siguiente" href="/portafolio/${sig.slug}/">
    <div class="env">
      <p class="mono">Siguiente proyecto</p>
      <p class="siguiente__nombre">${esc(sig.nombre)} ${FLECHA}</p>
      <p class="siguiente__linea">${esc(sig.linea)}</p>
    </div>
  </a>
</main>`;

  return documento({
    ruta: `/portafolio/${p.slug}/`,
    titulo: `${p.nombre} · ${p.linea.replace(/\.$/, "")} · Anticipa`,
    desc: p.resumen,
    imagen: `/portafolio/img/og-${p.slug}.jpg`,
    cuerpo,
    datos: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: p.nombre,
      headline: p.linea,
      description: p.resumen,
      url: `${DOMINIO}/portafolio/${p.slug}/`,
      image: `${DOMINIO}/portafolio/img/${p.portada}`,
      creator: { "@type": "Organization", name: "Anticipa", url: `${DOMINIO}/` },
    },
  });
}

function paginaIndice() {
  const cuerpo = `<main>
  <section class="indice-hero">
    <div class="env">
      <p class="mono miga"><a href="/">Anticipa</a> <span aria-hidden="true">/</span> Portafolio</p>
      <h1>Porta<span class="ac">folio.</span></h1>
      <div class="indice-hero__pie">
        <p class="caso-hero__lead">Algunos de nuestros proyectos más destacados: productos propios, sistemas para clientes y prototipos. Todos diseñados, construidos y puestos a funcionar por el mismo equipo con el que vas a hablar.</p>
        <p class="mono indice-hero__cuenta">[ Selección destacada ]</p>
      </div>
    </div>
  </section>

  <section class="lista">
    <div class="env">
      ${PROYECTOS.map(
        (p, i) => `<a class="fila rv" href="/portafolio/${p.slug}/">
        <figure class="fila__img"><img src="/portafolio/img/${p.portada}" alt="" width="1600" height="1000" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>
        <div class="fila__txt">
          <p class="mono"><b>${num(i)}</b> ${esc(p.tipo)} · ${esc(p.sector)}</p>
          <h2>${esc(p.nombre)}</h2>
          <p class="fila__linea">${esc(p.linea)}</p>
          <p class="fila__res">${esc(p.resumen)}</p>
          <p class="mono fila__pie"><span><i class="pulso" aria-hidden="true"></i>${esc(p.estado)}</span><span class="fila__ir">Ver el caso ${FLECHA}</span></p>
        </div>
      </a>`,
      ).join("\n      ")}
    </div>
  </section>
</main>`;

  return documento({
    ruta: "/portafolio/",
    titulo: "Portafolio · Anticipa",
    desc: "Proyectos de Anticipa: pagos para restaurantes, adelantos de nómina, apps de comunidad, salud y herramientas internas. Software a la medida hecho en México.",
    imagen: "/portafolio/img/og-portafolio.jpg",
    cuerpo,
    datos: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Portafolio de Anticipa",
      url: `${DOMINIO}/portafolio/`,
      hasPart: PROYECTOS.map((p) => ({ "@type": "CreativeWork", name: p.nombre, url: `${DOMINIO}/portafolio/${p.slug}/` })),
    },
  });
}

function escribir(ruta, contenido) {
  const destino = join(raiz, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido);
  console.log(`${ruta} · ${contenido.length.toLocaleString("es-MX")} bytes`);
}

escribir("portafolio/index.html", paginaIndice());
PROYECTOS.forEach((p, i) => escribir(`portafolio/${p.slug}/index.html`, paginaCaso(p, i)));

const hoy = new Date().toISOString().slice(0, 10);
const rutas = ["/", "/portafolio/", ...PROYECTOS.map((p) => `/portafolio/${p.slug}/`)];
escribir(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas.map((r) => `  <url><loc>${DOMINIO}${r}</loc><lastmod>${hoy}</lastmod></url>`).join("\n")}
</urlset>
`,
);
