# ScoreTravelsBlog

Blog de viajes donde la gente comparte y puntúa sus experiencias. Los usuarios registrados escriben experiencias, las comentan y las valoran de 1 a 5 estrellas; un administrador modera las experiencias nuevas antes de publicarlas. La web incluye también una página About que será el portfolio del autor (en construcción).

## Arquitectura

```
┌──────────────────────┐   /api (JSON, JWT)   ┌───────────────────────┐        ┌───────────────┐
│ client/              │ ───────────────────▶ │ server/               │ ─────▶ │ MongoDB Atlas │
│ React + Vite (SPA)   │                      │ Express 5 (MVC)       │        └───────────────┘
│ Zustand, react-router│ ◀─────────────────── │ zod, Mongoose, sharp  │ ─────▶ uploads/ (imágenes AVIF)
└──────────────────────┘ estáticos + /uploads └───────────────────────┘ ─────▶ SMTP (Brevo), Gemini
```

En producción el servidor sirve también el cliente compilado (`client/dist`) y las imágenes subidas, así que todo funciona en un único origen.

### Cliente (`client/`)

- React 18, TypeScript (strict null checks), Vite, Sass.
- `src/api/`: llamadas tipadas a la API REST; `src/store/`: stores de Zustand; `src/hooks/`: hooks compartidos de datos y formularios.
- Formularios con react-hook-form + zod (`src/schemas/`), con las mismas reglas que valida el servidor.
- Mapa con Leaflet / react-leaflet y mapas base de CARTO (sin clave usa OpenStreetMap).
- Zona `/admin`: cola de moderación, experiencias, categorías, usuarios, imágenes, comentarios y puntuaciones.

### Servidor (`server/`)

- Express 5 con rutas → controladores → servicios → modelos de Mongoose; todas las rutas cuelgan de `/api`.
- Validación de peticiones con zod (`utils/schemas.js`) y un gestor de errores central.
- Autenticación: JWT (HS256) en la cabecera `Authorization`, contraseñas con argon2, roles `user` y `admin`.
- Seguridad: helmet (CSP), lista blanca de CORS, rate limiting, comprobación de subidas (tipo, tamaño) y conversión a AVIF con sharp.
- Las experiencias tienen autor y estado de moderación (`pending`, `published`, `rejected`); el admin recibe un email con cada envío nuevo.
- SEO: el servidor escribe en `index.html` el título, la descripción y la imagen de cada experiencia (para las vistas previas en redes sociales) y genera `robots.txt` y `sitemap.xml`.
- La configuración se valida al arrancar (`config.js`), así que si falta una variable falla enseguida.

## Requisitos

- Node.js 22.12 o superior (ver `.nvmrc`) y npm 10+.
- Una base de datos MongoDB (Atlas o local).
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
| `CLIENT_DIST_DIR` | no | Cliente compilado que se sirve, `client/dist` por defecto |
| `SITE_URL` | no | Dirección pública (p. ej. `https://midominio.com`) para el sitemap y las vistas previas en redes; por defecto, el host de la petición |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO` | no | Emails del formulario de contacto y de moderación |
| `GEMINI_API_KEY` | no | Solo la usan los scripts de seed y backfill |

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
| `npm run rundev` | Cliente y servidor a la vez |
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
| `npm run seed` | Genera experiencias de prueba con Gemini (`npm run seed -- 10 --user=admin`) |
| `npm run scores:recalculate` | Recalcula la media de cada experiencia a partir de las puntuaciones |
| `npm run backfill:propose` / `npm run backfill:apply` | Propone con Gemini categorías y ciudades para experiencias antiguas y aplica la propuesta revisada |
| `npm run migrate:*` | Migraciones de datos puntuales, ya ejecutadas en producción |

## Tests y CI

- **Cliente:** Vitest + Testing Library, con MSW simulando la API.
- **Servidor:** node:test + supertest contra mongodb-memory-server; nunca se toca la base de datos real.
- **End-to-end:** Playwright prueba el cliente compilado contra la API y una base de datos en memoria (`client/e2e/`).
- **GitHub Actions** (`.github/workflows/ci.yml`) ejecuta lint, tipos, todas las suites de tests, el build y `npm audit` en cada push y pull request. Dependabot propone actualizaciones de dependencias cada semana.

## Despliegue

La app está pensada para un único servidor (p. ej. un droplet de DigitalOcean) detrás de nginx con HTTPS:

1. `npm ci` en las dos carpetas y `npm run build` en `client/`.
2. En `server/.env`, poner `NODE_ENV=production`, `TRUST_PROXY=1` y los `CORS_ORIGINS` de producción.
3. Arrancar `server/index.js` con un gestor de procesos (pm2 o systemd) y hacer que nginx redirija al puerto 3040.
4. No borrar `server/uploads/` al desplegar y hacer copia de seguridad junto con la base de datos.

Guía completa (HTTPS, nginx, systemd, copias de seguridad) en [`docs/deployment.md`](docs/deployment.md).

## Documentación

- [`PLAN_MEJORAS.md`](PLAN_MEJORAS.md): plan de mejoras y su progreso.
- [`docs/deployment.md`](docs/deployment.md): despliegue en un servidor con nginx y HTTPS.
- [`docs/travel-types.md`](docs/travel-types.md): ideas para las categorías de experiencias.
