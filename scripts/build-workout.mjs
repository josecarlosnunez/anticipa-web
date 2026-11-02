// Publica /workout cifrada: nadie ve la rutina sin la contraseña.
//
//   node scripts/build-workout.mjs                  cifra workout/_privado/app.html → workout/index.html
//   node scripts/build-workout.mjs --nueva-clave    pide una contraseña nueva (los teléfonos la vuelven a pedir)
//   node scripts/build-workout.mjs --abrir          al revés: descifra workout/index.html → workout/_privado/app.html
//
// El código sin cifrar vive en workout/_privado/ (fuera de git, ver .gitignore). La primera vez pide la
// contraseña y guarda la llave derivada en workout/_privado/llave.json, para que las siguientes versiones
// se publiquen sin volver a escribirla y sin cerrar la sesión de los teléfonos (misma sal, IV nuevo).
// Si pierdes workout/_privado/, recupéralo con --abrir y tu contraseña.
//
// Para pruebas: WORKOUT_CLAVE (contraseña sin preguntar), WORKOUT_LLAVE (otro archivo de llave)
// y WORKOUT_SALIDA (otro archivo de salida).

import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { webcrypto as wc } from "node:crypto";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRIV = join(raiz, "workout/_privado");
const FUENTE = join(PRIV, "app.html");
const LLAVE = process.env.WORKOUT_LLAVE || join(PRIV, "llave.json");
const SALIDA = process.env.WORKOUT_SALIDA || join(raiz, "workout/index.html");
const PUERTA = join(raiz, "scripts/workout-gate.html");
const ITER = 600000;

const b64 = (u8) => Buffer.from(u8).toString("base64");
const deB64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

function pedirOculto(pregunta) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let mudo = false;
    rl._writeToOutput = (s) => { if (!mudo) process.stdout.write(s); }; // muestra la pregunta, no lo que se escribe
    rl.question(pregunta, (r) => { rl.close(); process.stdout.write("\n"); res(r.trim()); });
    mudo = true;
  });
}

async function clave(confirmar) {
  if (process.env.WORKOUT_CLAVE) return process.env.WORKOUT_CLAVE.trim();
  if (confirmar) console.log("\nElige la contraseña de anticipamx.com/workout (mínimo 8 caracteres).\nNo se ve mientras escribes: es normal. Escríbela y presiona Enter.\n");
  const c = await pedirOculto("Contraseña: ");
  if (!confirmar) return c;
  if (c.length < 8) throw new Error("Usa al menos 8 caracteres.");
  if ((await pedirOculto("Escríbela otra vez: ")) !== c) throw new Error("No coinciden.");
  return c;
}

async function derivar(c, sal) {
  const base = await wc.subtle.importKey("raw", new TextEncoder().encode(c), "PBKDF2", false, ["deriveKey"]);
  const k = await wc.subtle.deriveKey({ name: "PBKDF2", salt: sal, iterations: ITER, hash: "SHA-256" }, base,
    { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  return new Uint8Array(await wc.subtle.exportKey("raw", k));
}

const importar = (raw) => wc.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
const paquetePublicado = () => {
  if (!existsSync(SALIDA)) return null;
  const m = /<script id="paquete" type="application\/json">([^<]+)<\/script>/.exec(readFileSync(SALIDA, "utf8"));
  return m ? JSON.parse(m[1]) : null;
};

async function llaveGuardada({ nueva, para }) {
  if (!nueva && existsSync(LLAVE)) { const j = JSON.parse(readFileSync(LLAVE, "utf8")); return { sal: j.sal, raw: deB64(j.llave) }; }
  // Sin llave guardada: con la contraseña de siempre se reutiliza la sal publicada, así los teléfonos siguen dentro.
  const pub = !nueva && (para || paquetePublicado());
  const c = await clave(!pub);
  const sal = pub ? pub.salt : b64(wc.getRandomValues(new Uint8Array(16)));
  const raw = await derivar(c, deB64(sal));
  if (pub) {
    try { await wc.subtle.decrypt({ name: "AES-GCM", iv: deB64(pub.iv) }, await importar(raw), deB64(pub.datos)); }
    catch { throw new Error("Esa no es la contraseña de la versión publicada. Para cambiarla usa --nueva-clave."); }
  }
  mkdirSync(dirname(LLAVE), { recursive: true });
  writeFileSync(LLAVE, JSON.stringify({ sal, llave: b64(raw) }) + "\n");
  chmodSync(LLAVE, 0o600);
  return { sal, raw };
}

async function cifrar(nueva) {
  const html = readFileSync(FUENTE, "utf8");
  const { sal, raw } = await llaveGuardada({ nueva });
  const iv = wc.getRandomValues(new Uint8Array(12));
  const datos = new Uint8Array(await wc.subtle.encrypt({ name: "AES-GCM", iv }, await importar(raw), new TextEncoder().encode(html)));
  const paquete = JSON.stringify({ v: 1, iter: ITER, salt: sal, iv: b64(iv), datos: b64(datos) });
  writeFileSync(SALIDA, readFileSync(PUERTA, "utf8").replace("__PAQUETE__", () => paquete));
  console.log(`Listo: ${SALIDA.replace(raiz + "/", "")} (${Math.round(datos.length / 1024)} KB cifrados).`);
}

async function abrir() {
  const pub = paquetePublicado();
  if (!pub) throw new Error(`No encontré la app cifrada en ${SALIDA}.`);
  const { raw } = await llaveGuardada({ nueva: false, para: pub });
  const plano = await wc.subtle.decrypt({ name: "AES-GCM", iv: deB64(pub.iv) }, await importar(raw), deB64(pub.datos));
  mkdirSync(PRIV, { recursive: true });
  writeFileSync(FUENTE, Buffer.from(plano));
  console.log(`Listo: ${FUENTE.replace(raiz + "/", "")}`);
}

const args = process.argv.slice(2);
(args.includes("--abrir") ? abrir() : cifrar(args.includes("--nueva-clave"))).catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
