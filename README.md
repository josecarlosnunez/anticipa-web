# anticipamx.com

Sitio público de **Anticipa**: la landing de servicios y el portafolio. Estático, sin dependencias que instalar.
Se publica con GitHub Pages desde la rama `main`.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html` | La página completa: estilos, animaciones y contenido en un solo archivo. |
| `portafolio/` | Portafolio: índice y una página por proyecto. Se genera, ver abajo. |
| `tarjeta/` | Tarjetas de presentación en línea (`/tarjeta/jose`, `/tarjeta/emilio`, `/tarjeta/alberto`): a donde apunta el QR de los pases de Apple Wallet. Guardan el contacto (vCard) y arman una junta para el calendario de quien escanea. Se generan desde `ProjectoAPP` con `npm run wallet:tarjetas`; no se editan a mano. Llevan `noindex`. |
| `scripts/build-portafolio.mjs` | Generador del portafolio y del `sitemap.xml`. Los proyectos son un arreglo al inicio del archivo. |
| `og.png` | Imagen 1200×630 que se ve al compartir el enlace en WhatsApp, LinkedIn o Slack. |
| `icono.svg`, `icono-512.png` | Favicon y icono para iOS, del paquete de marca oficial. |
| `CNAME` | Dominio propio (`anticipamx.com`). No borrar: GitHub Pages lo lee para servir el dominio. |
| `robots.txt`, `sitemap.xml` | Para buscadores. |
| `.nojekyll` | Le dice a GitHub Pages que sirva los archivos tal cual, sin procesarlos con Jekyll. |

## Cómo se ve en local

No hace falta servidor: abre `index.html` en el navegador. Para que las rutas absolutas
(`/icono.svg`, `/og.png`) resuelvan igual que en producción:

```bash
python3 -m http.server 4000
```

Y entra a http://localhost:4000.

## Portafolio

Las páginas de `portafolio/` salen de `scripts/build-portafolio.mjs`. Para agregar o editar un proyecto
se cambia su entrada en el arreglo `PROYECTOS`, se dejan sus imágenes en `portafolio/img/` y se corre:

```bash
node scripts/build-portafolio.mjs
```

`portafolio/portafolio.css` y `portafolio/portafolio.js` no se generan: se editan a mano.
`portafolio/constancia/app/` es una copia de `~/Tracker/index.html`, la app que se abre desde su caso.
Las tarjetas del portafolio en la página de inicio viven en la landing (repositorio
`anticipa-nomina-plasticos`, `docs/anticipa-servicios.html`); si cambia la lista de proyectos hay que
tocar ambos lados. Regla: en el portafolio no van nombres de clientes ni cifras de tratos.

## Cómo se publica un cambio

```bash
git add -A && git commit -m "Actualiza la landing" && git push
```

GitHub Pages reconstruye en menos de un minuto. Si el cambio no aparece, recarga sin caché
(Cmd+Shift+R).

## DNS

El dominio apunta a GitHub Pages con cuatro registros **A** en la raíz y un **CNAME** para `www`:

```
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
CNAME  www    josecarlosnunez.github.io.
```

Opcional, para IPv6, cuatro registros **AAAA** en la raíz: `2606:50c0:8000::153`,
`2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

## De dónde sale el diseño

El original vive en el repositorio `anticipa-nomina-plasticos`, en `docs/anticipa-servicios.html`,
como página autocontenida para publicar también como artifact. Este repositorio es la versión
para el dominio: mismo contenido más `<head>` completo, metadatos para compartir y favicon.
Si editas uno, copia el cambio al otro.

Tipografías: Barlow Condensed y Barlow (Google Fonts). Paleta y reglas de uso del logo en el
paquete de marca (`public/marca/LEEME.txt` del otro repositorio).
Movimiento: GSAP con ScrollTrigger y Lenis, cargados desde CDN.
