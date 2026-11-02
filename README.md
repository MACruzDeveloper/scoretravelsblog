# ScoreTravelsBlog

Blog de viajes donde la gente comparte y puntúa sus experiencias. Los usuarios registrados escriben experiencias sobre una ciudad, una isla, una región o un país entero, las comentan y las valoran de 1 a 5 estrellas; un administrador modera las experiencias nuevas antes de publicarlas. La web incluye también una página About con la trayectoria profesional del autor, en español e inglés.

## Arquitectura

```
┌──────────────────────┐   /api (JSON, JWT)   ┌───────────────────────┐        ┌───────────────┐
│ client/              │ ───────────────────▶ │ server/               │ ─────▶ │ MongoDB Atlas │
│ React + Vite (SPA)   │                      │ Express 5 (MVC)       │        └───────────────┘
│ Zustand, react-router│ ◀─────────────────── │ zod, Mongoose, sharp  │ ─────▶ uploads/ (imágenes AVIF)
└──────────────────────┘ estáticos + /uploads └───────────────────────┘ ─────▶ SMTP (Brevo), Gemini
```

En producción el servidor sirve también el cliente compilado (`client/dist`) y las imágenes subidas, así que todo funciona en un único origen.

### Servicios externos

| Servicio | Para qué | Desde |
| --- | --- | --- |
| [Photon](https://photon.komoot.io) (datos de OpenStreetMap) | Buscar el lugar de una experiencia mientras se escribe | Navegador (permitido en la CSP) y script de seed |
| CARTO / OpenStreetMap | Mapas base de Leaflet | Navegador |
| Brevo (SMTP) | Formulario de contacto y aviso de moderación al admin | Servidor |
| Vercel Blob | Imágenes subidas, cuando la app está desplegada en Vercel | Servidor |
| Gemini (Genkit) | Textos de ejemplo y clasificación de experiencias antiguas | Solo scripts (`seed`, `backfill`) |
| Wikimedia Commons | Fotos con licencia libre para las experiencias de ejemplo | Solo el script de seed |

### Cliente (`client/`)

- React 19, TypeScript (strict null checks), Vite, Sass.
- `src/api/`: llamadas tipadas a la API REST; `src/store/`: stores de Zustand; `src/hooks/`: hooks compartidos de datos y formularios.
- Formularios con react-hook-form + zod (`src/schemas/`), con las mismas reglas que valida el servidor.
- Mapa de la portada con Leaflet / react-leaflet y mapas base de CARTO (sin clave usa OpenStreetMap): las 5 mejores experiencias de cada continente, con una ventana con foto, título enlazado, lugar, estrellas y categoría. La rueda solo hace zoom con Ctrl/⌘ pulsado, para no secuestrar el scroll de la página.
- Listado y galería con buscador (título, contenido, categoría, lugar o país) y filtros por continente y país, que se calculan en el servidor.
- Lugares: al crear una experiencia se busca la ciudad, isla, región o país con Photon; las fotos que vienen de Wikimedia Commons muestran su autor y licencia.
- Página About (`/about`): una carretera con scroll horizontal propio que recorre los hitos de la carrera, con i18next (español por defecto e inglés) cargado solo en esa página.
- Zona `/admin`: cola de moderación, experiencias, categorías, usuarios, comentarios, puntuaciones e imágenes (por pestañas: carrusel de la portada, sin usar, en experiencias y todas).

### Servidor (`server/`)

- Express 5 con rutas → controladores → servicios → modelos de Mongoose; todas las rutas cuelgan de `/api`.
- Validación de peticiones con zod (`utils/schemas.js`) y un gestor de errores central.
- Autenticación: JWT (HS256) en la cabecera `Authorization`, contraseñas con argon2, roles `user` y `admin`.
- Seguridad: helmet (CSP), lista blanca de CORS, rate limiting, comprobación de subidas (tipo, tamaño) y conversión a AVIF con sharp.
- Las experiencias tienen autor y estado de moderación (`pending`, `published`, `rejected`); el admin recibe un email con cada envío nuevo.
- Cada experiencia apunta a un lugar (colección `cities`) de tipo `city` (ciudad, isla o región) o `country` (país entero), con país, continente y coordenadas.
- Endpoints de lectura para la portada y los filtros: `/api/experiences/facets` (categorías, continentes, países y años con experiencias), `/api/experiences/map` (las 5 mejores de cada continente) y `/api/experiences/timeline` (la mejor de cada año).
- SEO: el servidor escribe en `index.html` el título, la descripción y la imagen de cada experiencia (para las vistas previas en redes sociales) y genera `robots.txt` y `sitemap.xml`.
- Logs estructurados con pino: JSON en producción y texto legible en desarrollo. Cada petición lleva un ID (cabecera `X-Request-Id`, que también se devuelve en los errores 500) para encontrarla en los logs.
- La configuración se valida al arrancar (`config.js`), así que si falta una variable falla enseguida.

## Requisitos

- Node.js 22.22 o superior (ver `.nvmrc`; con nvm: `nvm install` y `nvm use` en la raíz) y npm 11.
- Una base de datos MongoDB (Atlas o local).
- Para `npm run backup`: [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/) (`mongodump`; en macOS, `brew install mongodb-database-tools`).
- Opcional: una [clave de CARTO](https://carto.com/basemaps/apikey), credenciales SMTP de Brevo y una [clave de Gemini](https://aistudio.google.com/apikey) (solo para los scripts de seed y backfill).

## Puesta en marcha

```bash
# 1. Instalar dependencias
cd server && npm install
cd ../client && npm install

# 2. Configurar variables de entorno
cp server/.env.template server/.env      # como mínimo ATLAS_URL y JWT_SECRET
cp client/.env.example client/.env.local # opcional: VITE_CARTO_API_KEY

# 3. Arrancar cliente y servidor a la vez (desde client/)
npm run rundev
```

El cliente queda en `http://localhost:5173` y la API en `http://localhost:3040/api`.

## Variables de entorno

### Servidor (`server/.env`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `ATLAS_URL` | sí | Cadena de conexión de MongoDB |
| `JWT_SECRET` | sí | Secreto para firmar las sesiones (mínimo 32 caracteres aleatorios) |
| `NODE_ENV` | no | `development` (por defecto), `production` o `test` |
| `PORT` | no | Puerto de la API, `3040` por defecto |
| `CORS_ORIGINS` | no | Orígenes permitidos, separados por comas |
| `TRUST_PROXY` | no | Número de proxies inversos delante de la app (p. ej. `1` detrás de nginx) |
| `UPLOADS_DIR` | no | Carpeta de imágenes subidas, `server/uploads/images` por defecto |
| `BLOB_STORE_URL`, `BLOB_READ_WRITE_TOKEN` | no | Tienda pública de Vercel Blob. Con `BLOB_STORE_URL`, las imágenes se guardan ahí en vez de en `UPLOADS_DIR`. El token solo también sirve para `npm run images:to-blob` |
| `CLIENT_DIST_DIR` | no | Cliente compilado que se sirve, `client/dist` por defecto |
| `LOG_LEVEL` | no | Nivel de log: `trace`, `debug`, `info` (por defecto), `warn`, `error`, `fatal` o `silent` |
| `SITE_URL` | no | Dirección pública (p. ej. `https://midominio.com`) para el sitemap y las vistas previas en redes; por defecto, el host de la petición |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO` | no | Emails del formulario de contacto y de moderación |
| `GEMINI_API_KEY` | no | Solo la usan los scripts de seed y backfill. El plan gratuito permite unas 20 peticiones al día por modelo; si `gemini-3.5-flash` está saturado, el seed reintenta con `gemini-3.5-flash-lite` |

### Cliente (`client/.env.local`)

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API. Vacía usa `http://localhost:3040` en desarrollo y el mismo origen en producción |
| `VITE_CARTO_API_KEY` | Clave de CARTO para el estilo claro del mapa |

## Scripts

### Cliente

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run rundev` | Cliente y servidor a la vez (Vite espera a que la API responda en `/api/health`) |
| `npm run build` | Comprobación de tipos y build de producción en `client/dist` |
| `npm run lint` / `npm run typecheck` | ESLint y comprobación de TypeScript |
| `npm test` / `npm run test:run` | Tests unitarios con Vitest (modo watch / una pasada) |
| `npm run test:e2e` | Tests end-to-end con Playwright (levanta su propio servidor con una base de datos en memoria) |

### Servidor

| Comando | Descripción |
| --- | --- |
| `npm start` / `npm run dev` | Arranca la API (en dev recarga con nodemon) |
| `npm test` | Tests de la API con node:test, supertest y MongoDB en memoria |
| `npm run lint` / `npm run format` | ESLint y Prettier |
| `npm run seed` | Genera experiencias de ejemplo: texto con Gemini, lugares con Photon y fotos de Wikimedia Commons (con su crédito), más usuarios ficticios, comentarios y votos. Por defecto 5 por continente (`npm run seed -- --per-continent=2 --continents=europe,asia`, o `--dry-run` para ver solo el texto) |
| `npm run seed:clear` | Cuenta el contenido creado por el seed; con `-- --yes` lo borra (experiencias, comentarios, votos, fotos, usuarios y lugares sin usar) |
| `npm run scores:recalculate` | Recalcula la media de cada experiencia a partir de las puntuaciones |
| `npm run backfill:propose` / `npm run backfill:apply` | Propone con Gemini categorías y ciudades para experiencias antiguas y aplica la propuesta revisada |
| `npm run images:to-blob` | Copia a Vercel Blob las imágenes de `UPLOADS_DIR` que aún no estén allí, sin borrar nada (con `-- --yes`; sin él solo las cuenta) |
| `npm run backup` | Copia de seguridad de la base de datos (`mongodump`) y las imágenes en `~/backups/scoretravelsblog` (o la carpeta que se le pase), guardando los últimos 14 días |
| `npm run migrate:*` | Migraciones de datos puntuales, ya ejecutadas en producción |

## Tests y CI

- **Cliente:** Vitest + Testing Library, con MSW simulando la API.
- **Servidor:** node:test + supertest contra mongodb-memory-server; nunca se toca la base de datos real.
- **End-to-end:** Playwright prueba el cliente compilado contra la API y una base de datos en memoria (`client/e2e/`).
- **GitHub Actions** (`.github/workflows/ci.yml`) ejecuta lint, tipos, todas las suites de tests, el build y `npm audit` en cada push y pull request. Dependabot propone actualizaciones de dependencias cada semana.

## Despliegue

### Vercel

El proyecto se despliega desde la raíz del repositorio con [`vercel.json`](vercel.json): región `fra1` (junto a la base de datos), `client/dist` en la CDN y el resto de peticiones, HTML incluido, a Express como una única función ([`api/index.js`](api/index.js)).

- El disco de las funciones es de solo lectura, así que las imágenes van a Vercel Blob. Sus URLs siguen siendo `/static/images/...`, que redirigen a la tienda.
- Una petición admite como máximo 4,5 MB: el navegador reduce las fotos grandes a 2000 px antes de subirlas.
- Variables: `ATLAS_URL`, `JWT_SECRET`, `TRUST_PROXY=1`, `SITE_URL`, `BLOB_STORE_URL`, `BLOB_READ_WRITE_TOKEN`, las de SMTP y `VITE_CARTO_API_KEY`.
- Vercel no tiene IPs fijas en el plan gratuito: Atlas debe permitir `0.0.0.0/0`.

### Servidor propio

También funciona en un único servidor (p. ej. un droplet de DigitalOcean) detrás de nginx con HTTPS:

1. `npm ci` en las dos carpetas y `npm run build` en `client/`.
2. En `server/.env`, poner `NODE_ENV=production`, `TRUST_PROXY=1` y los `CORS_ORIGINS` de producción.
3. Arrancar `server/index.js` con un gestor de procesos (pm2 o systemd) y hacer que nginx redirija al puerto 3040.
4. No borrar `server/uploads/` al desplegar y hacer copia de seguridad junto con la base de datos.

## Documentación

- [`PLAN_MEJORAS.md`](PLAN_MEJORAS.md): plan de mejoras y su progreso.
