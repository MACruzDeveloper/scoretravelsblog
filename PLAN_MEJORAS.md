# Plan de mejoras — ScoreTravelsBlog

> Revisión realizada el 2026-10-23 sobre `main` (commit `a918785` + cambios locales sin commitear).
> No se ha modificado código. Las referencias `archivo:línea` corresponden al estado actual.

---

## 0. Estado del README

La sección **"OPENCODE REVIEW"** del README está **mayormente desactualizada**. Desde entonces se han corregido:

| Hallazgo del README | Estado actual |
|---|---|
| Backend sin autenticación | ✅ Existe `server/middleware/auth.js` (`requireAuth` / `requireAdmin`) aplicado en rutas |
| Contraseñas en texto plano / `role` arbitrario en `/users/add` | ✅ argon2 + whitelist de rol |
| Hash de contraseña dentro del JWT | ✅ El payload ya solo lleva `_id, username, email, role` |
| `express.static(__dirname)` expone el servidor | ✅ Solo se sirve `client/dist` y `/static` |
| Path traversal en borrado de imágenes | ✅ `path.basename` + regex |
| `citiesController` sin importar `Experience` | ✅ Importado |
| `Score.tsx` enviando `NaN` | ✅ Ya filtra; **pero sigue habiendo un problema de diseño** (ver S-6) |
| `SearchForm` sin query, continentes América, `SearchPage` sin reaccionar | ✅ Corregidos |
| `postData` pierde headers, `JSON.parse` del token crashea | ✅ Corregidos (`withAuthHeaders`, `getToken`) |
| `findOneCategory` vacío, `login` sin `return`, `verify_token` sin `Bearer` | ✅ Corregidos |
| XSS en `experience.content` | ✅ DOMPurify |
| Regex de categorías sin acentos | ✅ `\p{L}` |

Además, el README tiene otros problemas: título "UI-FRONT", Node `16.17.0` (EOL; el proyecto ya corre en Node 22), comando `rundev` que no coincide con lo descrito, un "Sonnet 4.6" suelto, y la lista de "Tipos de viaje" mezclada con la documentación técnica. → Tarea en Fase 6.

Los documentos antiguos (`PROJECT_REVIEW.md`, `TESTING_PLAN.md`, `PERFORMANCE_OPTIMIZATION.md`, `HTTPS_SETUP.md`, `nginx-scoretravelsblog.conf`) se han movido a `_doc/`, que está en `.gitignore`.

---

## 1. Resultado de las herramientas

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` (client) | ✅ 0 errores — pero con `strictNullChecks: false` y `// @ts-nocheck` en `utils.js`, así que vale poco |
| `eslint` (client) | ❌ 82 problemas (30 errores, 52 warnings): `prefer-const`, `no-explicit-any` (~45), `exhaustive-deps` |
| `vitest run` (client) | ✅ 24 ficheros / 35 tests pasan (cobertura baja, carpetas de integración/e2e vacías) |
| Tests del servidor | ❌ No existen (`"test": "echo Error..."`) |
| `npm audit` client | ❌ 15 vulnerabilidades (2 críticas, 11 altas) — dompurify, lodash, react-router, shell-quote… |
| `npm audit` server | ❌ **91 vulnerabilidades (7 críticas, 17 altas)** — mongoose, jsonwebtoken, multer/dicer, validator, nodemailer, sharp, `file-system`→`utils-extend`… |

---

## 2. Hallazgos

Severidad: 🔴 crítico · 🟠 alto · 🟡 medio · 🟢 bajo/mejora. Entre corchetes la categoría OWASP Top 10 (2021) cuando aplica.

### 2.1 Seguridad

| ID | Sev. | Hallazgo | Dónde |
|---|---|---|---|
| S-1 | 🟢 ~~🔴~~ | **Credenciales de MongoDB Atlas en el historial de git** de un repositorio público (GitHub), junto a un `JWT_SECRET` trivial (commits `7a52b67`, `2da27f8`, `6910ab6`). **Mitigado (2026-10-23):** la contraseña actual de Atlas y el `JWT_SECRET` actual (64 caracteres) son distintos a los filtrados, y Atlas solo tiene un usuario de BD. En el historial siguen visibles el usuario y el host del cluster. La IP del droplet ya está en *Network Access*, pero se mantiene `0.0.0.0/0` para poder desarrollar desde cualquier IP; se quitará al final (Fase 6). Opcional: purgar el historial. [A02/A05] | historial git |
| S-2 | 🔴 | **DoS sin autenticar**: `POST /users/login` o `/users/register` con `{"email": {"$gt": ""}}` → `validator.isEmail()` lanza `TypeError` *fuera* del `try` → promesa rechazada no capturada por Express 4 → en Node ≥15 **el proceso se cae**. Verificado. [A04] | `usersController.js:12,34` |
| S-3 | 🔴 | **Inyección NoSQL** en `addNewCity`: el filtro `{ name, countryCode }` viene del body sin validar tipo; `{"name":{"$ne":null}}` + `upsert` sobrescribe una ciudad cualquiera. Cualquier usuario registrado puede hacerlo. Mongoose 5 no tiene `sanitizeFilter`. Verificado que el operador pasa. [A03] | `citiesController.js:41-45` |
| S-4 | 🟠 | **Registro abierto + permisos de `author` excesivos**: cualquiera puede registrarse y con `requireAuth` puede subir/borrar **cualquier** imagen, crear/modificar ciudades y cambiar el `score` de cualquier experiencia. [A01] | `imagesRoute.js:7-8,20`, `citiesRoute.js:9`, `experiencesRoute.js:11` |
| S-5 | 🟠 | **Suplantación de identidad**: `user` en comentarios, scores y experiencias se toma del body en vez de `req.user`. Se puede comentar/votar en nombre de otro. [A01/A08] | `commentsController.js:18`, `scoresController.js:18`, `experiencesController.js:55,120` |
| S-6 | 🟠 | **El score medio lo calcula el navegador** y lo envía a `/update_score` en cada visita (`Score.tsx:28-37`). Es manipulable y genera escrituras por cada vista. Además no hay límite de 1 voto por usuario/experiencia ni validación de rango 1-5 → *ballot stuffing*. [A04/A08] | `Score.tsx`, `scoresController.js`, `scoresModel.js` |
| S-7 | 🟠 | **Sin rate limiting**: `express-rate-limit` está instalado pero no se usa. Login (fuerza bruta), registro y `/emails/send_email` (spam/coste SMTP) quedan abiertos. [A07/A04] | `server/index.js` |
| S-8 | 🟠 | **La URL de producción apunta a HTTP plano sobre una IP** (aún no hay despliegue, pero cuando lo haya) (`http://146.190.159.240`): el JWT y las contraseñas viajan sin cifrar. `VITE_API_URL` existe en `server/utils/apiRoutes.ts` pero no se usa. [A02] | `client/src/config.js:5` |
| S-9 | 🟠 | **Dependencias con CVEs conocidos** (ver §2.4). [A06] | `package.json` ×2 |
| S-10 | 🟡 | **Enumeración de usuarios**: el login responde "Please provide a valid email" si no existe y "Invalid password" si existe. Todas las respuestas de error son `200 OK` con `ok:false`. [A07] | `usersController.js:38,48` |
| S-11 | 🟡 | **Fuga de email**: el contexto guarda `user = email` y se envía como autor de comentarios/votos → los emails de los usuarios se muestran públicamente en los comentarios. `findAllUsers` además devuelve los hashes (`User.find()` sin `.select('-password')`). [A01/A02] | `App.tsx:54`, `Experience.tsx:126`, `usersController.js:68` |
| S-12 | 🟡 | **JWT en `localStorage`** (robable con cualquier XSS), sin refresh ni revocación, `expiresIn: 1d`. No se fija `algorithms: ['HS256']` en `jwt.verify`. No se valida que `JWT_SECRET` exista al arrancar. [A07] | `App.tsx:73`, `middleware/auth.js:17` |
| S-13 | 🟡 | **Helmet con CSP desactivada** y `cors()` abierto a cualquier origen. [A05] | `server/index.js:9-14,41` |
| S-14 | 🟡 | **Validación de entrada inexistente o parcial** en servidor: sin límites de longitud (comentarios, contenido, título), sin tipos (`score`, `lat/lng`, `continent`), sin enum de `role` en `updateUser`, `findExperience` sin `isValidId` (CastError → 500). [A03/A04] | todos los controllers |
| S-15 | 🟡 | **Contact**: sin validación de servidor (email, longitud), `text` usa `name`/`email` sin sanear, sin captcha/honeypot; el checkbox "terms" no lleva a ningún texto legal (RGPD). | `emailsController.js`, `Contact.tsx` |
| S-16 | 🟡 | **Subida de imágenes**: nombre de fichero basado en `originalname` (espacios, puntos, acentos) → luego el regex de borrado `^[\w-]+\.avif$` **impide borrar** esas imágenes. Se guarda `pathname` absoluto del servidor en BD. Las imágenes se escriben en `client/public/images` (se versionan en git y acoplan server↔client). No se borra la imagen al borrar una experiencia. | `imagesController.js:15-31,52` |
| S-17 | 🟡 | **Logging**: `morgan('dev')` siempre (incluida producción), errores tragados sin log en casi todos los `catch`; no hay trazabilidad de acciones admin. [A09] | `server/index.js:18`, controllers |
| S-18 | 🟢 | `.env.template` está en `.gitignore` pero versionado; `port` se lee de `process.env.port` (minúscula) **antes** de `dotenv.config()`. | `.gitignore`, `server/index.js:3-4` |
| S-19 | 🟢 | Nominatim se llama desde el navegador con un `User-Agent` (cabecera prohibida, se ignora) → incumple su política de uso; sin `AbortController` (resultados obsoletos). Mejor proxy en servidor con caché. | `CitySearch.tsx:41-44` |

### 2.2 Bugs funcionales

| ID | Sev. | Hallazgo | Dónde |
|---|---|---|---|
| B-1 | 🟠 | `About.tsx` captura **globalmente** `ArrowUp/Down/Left/Right`, `KeyA`, `KeyD` con `preventDefault` cuando la sección es visible → no se puede escribir "a"/"d" en el buscador del header ni hacer scroll con teclado. | `About.tsx:115-135` |
| B-2 | 🟠 | `await done.populate('city')` en Mongoose 5 **no** devuelve promesa (necesita `.execPopulate()`), así que la experiencia creada vuelve sin ciudad poblada. | `experiencesController.js:65` |
| B-3 | 🟠 | `updateExperience`: `findById` fuera del `try` → rechazo no capturado (mismo efecto que S-2 si la BD falla). | `experiencesController.js:86` |
| B-4 | 🟡 | Integridad referencial: `category` se guarda por **nombre** (`String`, `ref` inútil) → renombrar una categoría rompe las experiencias; borrar categoría no comprueba uso. `scores.experience` y `comments.experience` son `String`, no `ObjectId`. Borrar experiencia deja huérfanos comentarios, scores e imágenes. `deleteCity` existe pero no tiene ruta. | models, controllers |
| B-5 | 🟡 | Comentar sin sesión: el POST devuelve 401 y la UI no muestra nada (solo `console.log`). El textarea no se limpia (no es controlado). | `Experience.tsx:121-144,193` |
| B-6 | 🟡 | `SearchPageContinent`: `!loading && expsFiltered` siempre es truthy (array) → muestra cabecera "Results for…" y "No Results" a la vez; antes del primer fetch hay *flash* de "No Results". | `SearchPageContinent.tsx:29,56` |
| B-7 | 🟡 | Stores Zustand: `hasFetched` sin guardia de "en curso" → dos componentes montando a la vez lanzan dos peticiones. `fetchCities` no acepta `force`. | `store/*.ts` |
| B-8 | 🟡 | `ImageUpload`: `accept` incluye GIF pero el servidor lo rechaza; límite 5 MB en cliente vs 10 MB en servidor. La fila de edición de `Images.tsx` muestra un uploader que **crea** otra imagen en vez de reemplazar. | `ImageUpload.tsx:118`, `utils.js:19`, `Images.tsx:179` |
| B-9 | 🟡 | `AdminLayout` deja entrar si existe *cualquier* token (aunque sea inválido, hasta que responda `verify_token`) y no comprueba rol → un `author` ve todo el panel admin y recibe 403 en cada acción. | `AdminLayout.tsx:43` |
| B-10 | 🟡 | `Register` hace login con un 2º request y espera 2 s artificiales; lo mismo en `Login`. El registro debería devolver directamente el token. | `Register.tsx:30-51`, `Login.tsx:41` |
| B-11 | 🟡 | `index.html` precarga fuentes desde `/src/assets/fonts/...` → 404 en producción (en `dist` no existe `/src`). | `client/index.html:11-12` |
| B-12 | 🟡 | `nginx-scoretravelsblog.conf`: los `location` de regex para `.js/.css/imágenes/fuentes` **no tienen `proxy_pass`** → nginx los busca en su `root` y devuelve 404; `/admin/api/` no existe; el bloque de Google Fonts no tiene sentido (un `location` no puede casar con otra URL); `proxy_cache_valid` sin `proxy_cache`; `Cache-Control: public` en API. | `_doc/nginx-scoretravelsblog.conf` |
| B-13 | 🟢 | `AdminLayout` y `About` usan `setTimeout` sin limpiar al desmontar. Carousel: la variable `slideStop` funciona al revés de lo que dice su nombre. | `AdminLayout.tsx:17`, `About.tsx:104`, `Carousel.tsx:124` |
| B-14 | 🟢 | `robots.txt` con typo (`User=agent`) y fuera de `public/` (no se sirve); `sitemap.txt` vacío. | `client/robots.txt` |
| B-15 | ✅ ~~🟠~~ | **Rutas del cliente y de la API colisionan**: `/admin/experiences`, `/admin/categories`, etc. son páginas de React *y* endpoints GET del API. Con el build servido por Express, recargar `/admin/experiences` en el navegador devuelve el JSON del API en lugar de la página. Se resuelve con el prefijo `/api` (A-2, Fase 3). | `server/index.js`, `App.tsx` |

### 2.3 Arquitectura y code smells

| ID | Hallazgo |
|---|---|
| A-1 | **"MVC" incompleto**: los controllers acceden directamente a Mongoose y mezclan validación, lógica de negocio y respuesta HTTP. Falta capa de **servicios** y capa de **validación** (zod/Joi/express-validator). La "V" es la SPA React, lo cual está bien, pero conviene documentarlo como API REST + SPA. |
| A-2 | **API no RESTful**: `POST /delete`, `POST /update`, endpoints públicos bajo `/admin/*`, `GET /images/fetch_images`, `/emails/send_email`. Propuesta: `GET/POST /api/experiences`, `GET/PATCH/DELETE /api/experiences/:id`, etc., con prefijo `/api` (simplifica también nginx). |
| A-3 | **Sin paginación ni filtros en servidor**: el cliente descarga **todas** las experiencias, **todos** los comentarios y **todos** los scores para filtrar en memoria (`Experience.tsx:96-114`, búsquedas). No escala. → `GET /api/experiences/:id/comments`, `GET /api/experiences?search=&continent=&page=`. |
| A-4 | **Score desnormalizado y calculado en cliente** (ver S-6). Mejor: calcular `avgScore`/`scoreCount` en servidor al crear/borrar voto (o aggregation), índice único `{experience, user}`. |
| A-5 | **Modelo de datos inconsistente**: usuarios referenciados por string (email/username) en vez de `ObjectId`; sin `timestamps`; sin índices en campos de búsqueda; modelo `usersModels.js` (plural raro). |
| A-6 | **Estilo inconsistente** en servidor: clases singleton en minúscula vs funciones sueltas, `;` sí/no, tabs/espacios, `res.send` vs `res.json`, `{error}` vs `{ok,message}`. Sin ESLint/Prettier en server. |
| A-7 | **Arranque frágil**: si Mongo no conecta, el servidor sigue arrancado; no hay validación de variables de entorno, ni *graceful shutdown*, ni `/health`. Express 4 no captura errores async → falta wrapper `asyncHandler` o migrar a Express 5. |
| A-8 | **Cliente**: 7 rutas `/admin/*` repetidas envolviendo `AdminLayout` → usar rutas anidadas + `<Outlet/>`; `PrivateRoute.tsx` y `_Image.tsx` muertos; `useGlobalContext` con `any`; mezcla de `.js` y `.ts` (`utils.js` con `@ts-nocheck`, `config.js`); `strictNullChecks: false`. |
| A-9 | **Patrón tabla + CRUD duplicado** en Categories / Users / Images / Comments / Scores / Experiences (sort, edición inline, mensajes). → hook `useCrudTable` + `useSort`. Los 4 stores Zustand son casi idénticos → factoría `createResourceStore`. |
| A-10 | Sin capa de cliente API tipada: cada componente arma `${URL}/admin/...`. `server/utils/apiRoutes.ts` es código de cliente (usa `import.meta.env`) perdido en el servidor. |
| A-11 | Manejo de errores en UI: decenas de `catch { console.log }` sin feedback al usuario; `{error}` renderizado crudo. |
| A-12 | **Artefactos en git**: `client/dist` (116 ficheros, 19 MB), `client/public/images` (16 MB, subidas de usuarios) y `.DS_Store` versionados. El pack ya pesa ~9 MB. |
| A-13 | **CI/CD roto**: `deploy.ml` (extensión incorrecta, nunca se ejecuta; `needs: test` apunta a otro workflow; despliega a Vercel cuando el resto del proyecto asume droplet + nginx). `ci.yml` solo ejecuta `App.test.jsx`, levanta un Mongo que nadie usa, no hace lint/build/tests del server. |
| A-14 | Mezcla de idiomas: UI en inglés, About y comentarios de código en español. Decidir idioma o añadir i18n (útil para portfolio). |
| A-15 | `genkit/index.js`: `model: ai.model` probablemente `undefined` (usa el default por casualidad); el seed no valida que la categoría devuelta exista. |

### 2.4 Dependencias

**Servidor**

| Paquete | Actual | Acción |
|---|---|---|
| `mongoose` | 5.13 (EOL, CVE crítico) | Migrar a 8.x (cambia `useCreateIndex`, `execPopulate`, `strictQuery`; activar `sanitizeFilter`) |
| `jsonwebtoken` | 8.5.1 (CVE) | 9.x + `algorithms` explícito |
| `multer` | 1.4.4 (CVE vía `dicer`) | 2.x |
| `validator` | 12.2 (ReDoS) | 13.15+ o sustituir por zod |
| `nodemailer` | 6.9 (ReDoS) | última |
| `argon2` | 0.27 | 0.4x (prebuilds para Node 22) |
| `sharp` | 0.35.2 (libheif) | 0.35.5+ |
| `dotenv` | 8 | 16+ o `node --env-file` |
| `express` | 4 | 4.22.3 ahora; plan de migración a 5 (captura errores async) |
| `body-parser` | — | **Eliminar** (usar `express.json()`) |
| `file-system` | — | **Eliminar** (sin uso, abandonado, arrastra `utils-extend` con prototype pollution crítico) |
| `path` (npm) | — | **Eliminar** (es un módulo nativo) |
| `nodemon` | en `dependencies` y `start` | Mover a `devDependencies`; `start: node index.js`, `dev: nodemon` |
| `@genkit-ai/express` | — | No se usa → eliminar o mover a script |

**Cliente**

| Paquete | Acción |
|---|---|
| `dompurify` (crítico), `lodash`, `react-router-dom` (alto), `moment` | `npm audit fix` inmediato |
| `vite` 4 / `vitest` 1 / `@vitejs/plugin-react` 4 | Subir a vite 6-8 / vitest 3+ (en bloque) |
| `eslint` 8 + `@typescript-eslint` 5 | ESLint 9 flat config + typescript-eslint 8 |
| `react` 18.2 | 18.3 ya; React 19 cuando el resto esté al día |
| `moment` + `react-moment` | Sustituir por `Intl.DateTimeFormat` o `date-fns` (ahorra ~70 KB) |
| `lodash` | Solo se usa `sortBy` y `chunk` → funciones nativas / `lodash-es` |
| `nodemon`, `concurrently`, `wait-on` en `dependencies` | Mover a `devDependencies` (nodemon sobra en client) |
| `@types/lodash` en `dependencies`, `@types/jest` con vitest, `@types/react-helmet` con `react-helmet-async`, `prop-types`, `sass-loader` (es de webpack), `trig-js` (solo hay `.d.ts`) | Limpiar |
| `react-helmet-async` en `devDependencies` | Moverlo a `dependencies` (se usa en runtime) |

### 2.5 Validación de formularios (cliente)

| Formulario | Problemas |
|---|---|
| Login | `type="text"` para email; sin `required`/`autocomplete="email"`/`current-password`; sin `<label>` (accesibilidad). |
| Register | Sin reglas de contraseña (longitud mínima, confirmación en vivo), sin validar username, sin `autocomplete="new-password"`; tampoco en servidor. |
| Contact | Regex de email propia (mejor `type=email` + validación servidor); sin `maxLength`; checkbox de términos sin enlace a política; sin protección anti-spam. |
| Comentario | Sin `maxLength`, sin trim, textarea no controlado, sin estado de envío ni aviso si no hay sesión. |
| Add/Edit Experience | Sin validar categoría ni ciudad obligatorias (se puede crear con `city: null`), `maxLength` solo en contenido; no hay feedback de error. |
| Categories / Users | Validación solo en cliente; servidor acepta cualquier cosa. |

**Recomendación**: un esquema **zod compartido** (paquete `shared/` o duplicado ligero) usado por el cliente (con `react-hook-form` + `@hookform/resolvers/zod`) y por el servidor (middleware `validate(schema)`).

### 2.6 Mejoras (no son bugs)

- **Rendimiento**: lazy-load de todo `/admin` y de Leaflet (`React.lazy` + `Suspense`); paginación/infinite scroll; imágenes responsive con varios tamaños generados por sharp (`srcset`); el vídeo `home.mp4` en `dist` → servir versión comprimida + `poster`.
- **SEO** (importante para blog y portfolio): SPA sin SSR → meta por página con `react-helmet-async` (título, description, Open Graph por experiencia), `sitemap.xml` generado, `robots.txt` en `public/`. Valorar a medio plazo **Astro/Next** o prerender para las páginas públicas.
- **Accesibilidad**: labels en formularios, foco visible, `prefers-reduced-motion` en el About/carousel, contraste, `alt` reales.
- **UX**: estados vacíos/errores homogéneos, toasts, confirmación antes de borrar en admin, página 404 propia.
- **Portfolio (About)**: separar contenido a un JSON/MD o a BD para editarlo sin tocar código; sección de proyectos; enlace a CV; el chat IA del TODO puede reutilizar Genkit en un endpoint `/api/chat` con rate limit y prompt restringido.
- **Observabilidad**: logger estructurado (pino), `/health`, Sentry o similar.
- **DX**: Prettier + ESLint en ambos paquetes, Husky + lint-staged, `.nvmrc` (Node 22 LTS), `docker-compose` con Mongo local para desarrollo y tests, monorepo con npm workspaces.

---

## 3. Plan por fases

Cada fase deja el proyecto funcionando. Las estimaciones son orientativas para una persona.

### Fase 0 — Contención inmediata (½ día) 🔴

- [x] ~~Rotar la contraseña del usuario de MongoDB Atlas~~ — ya era distinta a la filtrada; un único usuario de BD. (S-1)
- [x] ~~Rotar `JWT_SECRET`~~ — el actual es distinto al filtrado (64 caracteres).
- [x] IP del droplet añadida a *Network Access* en Atlas. Quitar `0.0.0.0/0` queda pospuesto a la Fase 6. (S-1)
- [ ] (Opcional) Purgar el historial con `git filter-repo` / BFG. Reescribe la historia y obliga a un force-push.
- [x] `register`/`login`/`addNewUser` validan que los campos sean strings no vacíos antes de `validator.isEmail` → ya no se cae el servidor. (S-2)
- [x] `process.on('unhandledRejection')` con log como red de seguridad temporal (la petición afectada se queda colgada; se arregla de verdad en Fase 3 con `asyncHandler`/Express 5).
- [x] `npm audit fix` en client y server (sin `--force`). Server: 91 → 75 (7 → 2 críticas). Client (producción): 15 → 7 (2 → 0 críticas). El resto requiere cambios de versión mayor → Fase 2.
- [x] Desinstalados `file-system`, `path`, `body-parser` del server (`express.json()` / `express.urlencoded()` en su lugar).

### Fase 1 — Seguridad (2-4 días) 🔴🟠

- [x] Validación zod en todas las rutas del servidor (`middleware/validate.js`, `utils/schemas.js`). Los campos desconocidos se descartan, así que el cliente no puede colar `user` o `role`. (S-3, S-14)
- [x] Identidad **siempre** desde `req.user` en comentarios, votos y experiencias; se guarda `userId` y se muestra `username`. `userId` no se expone en las respuestas. (S-5, S-11)
- [x] Migración `scripts/migrate-user-refs.js --apply` ejecutada en Atlas (2026-10-23): emails de comentarios y votos antiguos sustituidos por el nombre de usuario. (S-11)
- [x] Permisos: imágenes y ciudades → `requireAdmin`; endpoint `update_score` eliminado. (S-4)
- [x] Rol `author` renombrado a `user` (registrados que solo comentan y votan). Script `scripts/migrate-roles.js` para los usuarios existentes. (S-4)
- [x] `scripts/migrate-roles.js --apply` ejecutado en Atlas. (S-4)
- [x] Score en servidor: un voto por usuario y experiencia (índice único parcial `{experience, userId}`; votar otra vez actualiza), entero 1-5, media recalculada en `services/scoreService.js`. `Score.tsx` solo muestra. El admin ya no puede fijar el score a mano. (S-6, A-4)
- [x] `express-rate-limit`: login 10/15 min, registro 5/h, contacto 5/h, comentarios y votos 60/15 min, global 1000/15 min. (S-7)
- [x] `URL` del cliente desde `VITE_API_URL` (por defecto, el mismo origen); `trust proxy` configurable con `TRUST_PROXY`. (S-8)
- [ ] HTTPS real con dominio + certbot cuando haya despliegue (ver `_doc/HTTPS_SETUP.md`) y activar `upgradeInsecureRequests` en la CSP. (S-8)
- [x] Mensaje genérico de login, códigos HTTP correctos (400/401/403/404/409) y los formularios de login/registro muestran el error del servidor. (S-10)
- [x] `select('-password')` en usuarios. Un admin no puede borrarse ni quitarse el rol a sí mismo. (S-11)
- [x] `jwt.verify` con `algorithms: ['HS256']`; el servidor no arranca sin `JWT_SECRET` o `ATLAS_URL`. (S-12)
- [ ] **Pospuesto** hasta tener HTTPS: cookie `httpOnly; Secure; SameSite=Strict` en lugar de `localStorage` (requiere protección CSRF). (S-12)
- [x] CORS con lista de orígenes (`CORS_ORIGINS`) y CSP activa en Helmet. (S-13)
- [x] Contact: validación en servidor, longitudes, honeypot (`website`). (S-15)
- [x] Página `/privacy` (en inglés) enlazada desde el checkbox de contacto (ahora obligatorio), el registro y el footer. (S-15)
- [x] Imágenes: nombre generado, solo se guarda `filename`, carpeta `server/uploads/images` fuera de git (configurable con `UPLOADS_DIR`), errores de multer como 400, borrado tolerante a ficheros ausentes, 404 real para `/static` inexistente. (S-16)
- [x] Al borrar o editar una experiencia se eliminan las imágenes que ya no usa ninguna otra experiencia y que no están marcadas como *featured* (`services/imageService.js`). Borrar desde la biblioteca una imagen en uso devuelve 409. (S-16)
- [x] Logging: `morgan('combined')` en producción y `console.error` en los `catch` de los controladores. (S-17)

### Fase 2 — Actualización de dependencias (2-3 días) 🟠

- [x] Server: mongoose 5 → 9, jsonwebtoken 9, multer 2, nodemailer 10, argon2 0.45, sharp 0.35.5, dotenv 18, express 4.22.3, helmet/cors/morgan/rate-limit al día. Código adaptado (`returnDocument`, sin `execPopulate` ni opciones de conexión obsoletas, ObjectId validado con regex).
- [x] Server: eliminados `validator` y `@genkit-ai/express` (sin uso); `genkit` y `nodemon` pasan a `devDependencies`; scripts `start` (node), `dev` (nodemon), `migrate:*`.
- [x] Server: `npm audit --omit=dev` → **0 vulnerabilidades**. Las que quedan en desarrollo vienen de `genkit` (OpenTelemetry, sin arreglo publicado) y de `nodemon`.
- [x] Client: React 18.3, react-router 7, dompurify, react-icons 5, zustand, leaflet al día. Vite 4 → 8 (Rolldown, `codeSplitting` por grupos), vitest 1 → 5, testing-library 16, jest-dom 7, msw 2.15, TypeScript 5.9, ESLint 9 (flat config) + typescript-eslint 8.
- [x] Client: eliminados `moment`, `react-moment`, `lodash`, `trig-js`, `prop-types`, `sass-loader`, `@types/jest`, `@types/react-helmet`, `wait-on`, `nodemon`; sustituidos por `utils/collections.ts`, `utils/format.ts` y `<FormattedDate>` (con tests).
- [x] Client: `npm audit` → **0 vulnerabilidades**. ESLint: 0 errores (antes 30), 49 avisos (casi todos `any`).
- [x] `.nvmrc` (22.12) y `engines` en ambos `package.json`; CI usa `.nvmrc`.
- [ ] Actualizar Node local a la última 22.x LTS (o 24): `jsdom` 28 necesita Node > 22.12, por eso está fijado en 26.
- [ ] React 19 + react-leaflet 5 (cuando haya tiempo para probar el mapa a fondo).
- [ ] Migrar Sass de `@import` y funciones globales a `@use`/módulos (los avisos están silenciados en `vite.config.ts`).
- [ ] Activar las reglas del React Compiler de `eslint-plugin-react-hooks` 7 cuando se aborde la Fase 4.
- [x] Regresiones tras la actualización, corregidas: fuentes Catamaran sin empaquetar (rutas `url()` con alias `@/assets/fonts`), dos reglas reordenadas por Sass (declaraciones antes de los `@include`), `build.cssTarget` para que Lightning CSS mantenga sintaxis compatible con Safari 14+.
- [x] Mapa: CARTO exige ahora API key (gratuita). Se lee de `VITE_CARTO_API_KEY` en `client/.env.local`; sin clave se usa OpenStreetMap estándar. Documentado en `client/.env.example`.
- [ ] Al desplegar: restringir la API key de CARTO al dominio en su panel.

### Fase 3 — Arquitectura del backend (4-6 días) 🟡

- [x] Express 4 → 5 (captura los errores de los handlers `async`). Errores HTTP (`utils/httpErrors.js`: `badRequest`, `notFound`, `conflict`…) y manejador central (`middleware/errorHandler.js`) que además traduce duplicados (409), ids inválidos y validaciones de Mongoose (400). Controladores reescritos como funciones sin `try/catch` repetidos. Capas: `routes` (validación zod) → `controllers` → `services` (consultas, votos, imágenes) → `models`.
- [x] API REST bajo `/api` (`routes/index.js`) con verbos correctos: `GET/POST /api/<recurso>`, `GET/PATCH/DELETE /api/<recurso>/:id`, `/api/auth/{register,login,me}`, `/api/contact`. El id va en la URL y se valida; las imágenes se borran por id (el nombre de fichero sale de la BD). Rutas `/api` desconocidas → 404 JSON. Resuelve B-15. (A-2)
- [x] Paginación, búsqueda y filtros en servidor: `GET /api/experiences?page&limit&search&category&city&continent&minScore&year&month&hasImage&sort` → `{ items, total, page, limit, pages }`; `/api/experiences/facets` (opciones de los filtros), `/api/experiences/timeline` (mejor por año, en una agregación) y `/api/experiences/:id/comments`. Índices en `date`, `score`, `category`, `city`. (A-3)
- [x] Cliente: cada pantalla pide solo lo que muestra (`api/experiences.ts` + `useApiQuery`, que descarta respuestas obsoletas y comparte peticiones iguales en curso). La galería carga más páginas con "Show more"; la búsqueda y la búsqueda por continente paginan en el servidor (`SearchResults`). Los stores de Zustand quedan solo para el admin.
- [x] Las experiencias guardan `votes` (número de votos) junto a `score`; la página de detalle ya no descarga todos los votos. `GET /api/comments` y `GET /api/scores` (listas completas) pasan a ser solo de admin.
- [x] `npm run scores:recalculate -- --apply` ejecutado (32 experiencias con votos).
- [x] Bug previo: el enlace "Oceania" buscaba `australia` y nunca devolvía resultados.
- [ ] Admin: paginar y ordenar las tablas en el servidor (hoy el admin descarga todas las páginas con `listAllExperiences`).
- [x] Modelo de datos (B-4, A-5):
  - Comentarios y votos referencian la experiencia con `ObjectId`; al borrar una experiencia se borran sus comentarios y votos.
  - Categorías: se mantienen por nombre en las experiencias (menos invasivo y compatible con el script de limpieza), pero con integridad: nombre único sin distinguir mayúsculas, renombrar actualiza las experiencias, no se puede borrar una categoría en uso (409) y al guardar una experiencia la categoría debe existir (se guarda con su grafía oficial).
  - `timestamps` (`createdAt`/`updatedAt`) en todos los modelos.
  - Índices sincronizados con los modelos: fuera el índice antiguo `cities.name_1` (impedía ciudades homónimas en países distintos) y creado el índice único de `username`, que nunca se había llegado a crear.
- [x] `npm run migrate:data-model -- --apply` ejecutado en Atlas.
- [ ] Mañana: `npm run backfill:propose`, revisar el JSON y `npm run backfill:apply` (categorías antiguas y ciudades).
- [x] Rutas `PATCH`/`DELETE /api/cities/:id` (el borrado comprueba que ninguna experiencia use la ciudad).
- [x] Conexión a Mongo antes de `listen` (si falla, el proceso termina con un mensaje claro), `GET /api/health`, *graceful shutdown* con SIGTERM/SIGINT. (A-7)
- [x] `config.js`: única lectura de `process.env`, validada con zod al arrancar (el servidor no arranca e indica qué variable falla). (A-7)
- [x] B-2 y B-3 corregidos en la Fase 1; `apiRoutes.ts` eliminado (el cliente usa `API` de `config.js`). (A-10)
- [x] ESLint 9 + Prettier en el servidor (`npm run lint`, `npm run format`); todo el código formateado y sin avisos. (A-6)

### Fase 4 — Frontend: bugs, refactor y formularios (4-6 días) 🟡

- [x] Bugs B-5, B-6 y B-8 (resueltos en fases anteriores), B-9 (el admin espera a verificar la sesión y solo lo ven los admins; el enlace "Admin" del menú también), B-10 (el registro devuelve la sesión; sin esperas artificiales de 2 s; tras el login, admin → `/admin`, resto → `/`), B-11 (fuera las precargas de fuentes a `/src`), B-13 (`setTimeout` del admin con limpieza; variable del carrusel renombrada).
- [ ] B-7 (peticiones duplicadas en los stores): con la factoría de stores.
- [ ] B-1 (teclado del About): **al final, junto con el resto de la página About**.
- [x] Rutas del admin anidadas con `<Outlet/>`; todas las páginas salvo la Home se cargan bajo demanda (`React.lazy`): el JS inicial de la app pasa de 104 KB a 46 KB. (A-8)
- [ ] Cliente API tipado (`api/experiences.ts`…) con `VITE_API_URL`; migrar `utils.js`/`config.js` a TS; activar `strictNullChecks`; arreglar los 82 problemas de ESLint. (A-8, A-10)
- [ ] Factoría de stores y hook `useCrudTable`. (A-9)
- [ ] Formularios con `react-hook-form` + zod; labels, `autocomplete`, mensajes de error visibles (§2.5).
- [ ] Manejo de errores unificado (toast/Msgbox) en vez de `console.log`. (A-11)
- [x] Código muerto eliminado: `PrivateRoute.tsx`, `_Image.tsx`, `admin/Admin.tsx` (los comentarios de axios ya se quitaron en la Fase 1).
- [x] Página de Experience: imagen por defecto (`thumb.png`, la misma que `Card`) cuando la experiencia no tiene imágenes, con test.
- [x] Biblioteca de imágenes: más recientes primero por defecto y sin columna de dimensiones.

### Funcionalidad — Experiencias de usuarios con moderación ✅

Corrige una decisión de la Fase 1 (crear experiencias había quedado solo para el admin): cualquier usuario registrado publica sus experiencias, y el admin las revisa.

- [x] Estado de cada experiencia: `pending`, `published` o `rejected` (con motivo opcional que ve el autor). Lo que crea un usuario entra pendiente; lo del admin se publica directamente.
- [x] Editar una experiencia publicada siendo usuario la devuelve a revisión (deja de verse hasta aprobarla).
- [x] Solo lo publicado aparece en las páginas públicas (listados, Home, mapa, timeline, filtros); una pendiente o rechazada solo la ven su autor y el admin. Votar y comentar solo sobre publicadas.
- [x] Propiedad por `userId`: cada usuario edita y borra solo las suyas (`403` si no); el admin, todas.
- [x] API: `GET /api/experiences?scope=mine` (las tuyas) y `?scope=all&status=pending` (admin), `PATCH /api/experiences/:id/review` (admin). Los usuarios pueden subir imágenes y dar de alta ciudades; la biblioteca de imágenes sigue siendo del admin.
- [x] Email al admin (`SMTP_TO`) cada vez que una experiencia queda pendiente (`services/mailer.js`; si falla el envío, la petición no falla).
- [x] Panel: el usuario ve "My experiences"; el admin, además, "Moderation" con el número de pendientes, y el resto de secciones (protegidas también por ruta con `RequireAdmin`). Columna de estado en la tabla y aviso en la página de una experiencia no publicada.
- [x] Comentarios sin moderación previa (el admin puede borrarlos).
- [x] Migración aplicada en Atlas: las experiencias existentes quedan publicadas.
- [ ] Más adelante: avisar por email al autor cuando se aprueba o rechaza su experiencia.
- [x] Registro: reglas de usuario y contraseña visibles bajo el formulario; botón para mostrar u ocultar la contraseña (`PasswordInput`, también en el login).

### Fase 5 — Tests y CI/CD (3-4 días) 🟡

- [ ] Server: Vitest/Jest + Supertest + `mongodb-memory-server`. Cubrir primero auth, permisos por rol, validación (casos de inyección y del crash S-2), scores.
- [ ] Client: completar integración (flujos login, comentar, votar, CRUD admin) con MSW; e2e con Playwright para 3-4 flujos críticos.
- [ ] `ci.yml`: lint + typecheck + test + build de client **y** server; `npm audit --audit-level=high`; Dependabot/Renovate.
- [ ] Deploy (ahora mismo no hay ningún entorno desplegado): decidir **una** estrategia (droplet+nginx vs Vercel+API aparte). Arreglar o borrar `deploy.ml`. Corregir `_doc/nginx-scoretravelsblog.conf` (B-12): servir `dist` directamente desde nginx (`root` + `try_files $uri /index.html`) y proxy solo `/api` y `/uploads`.
- [x] `client/dist` fuera del repo y en `.gitignore`. (A-12)
- [ ] Sacar del repo las imágenes subidas (`client/public/images`) cuando se mueva la carpeta de uploads (S-16).

### Fase 6 — Producto, portfolio y documentación (continuo) 🟢

- [ ] Reescribir README: descripción, arquitectura (diagrama client/server/Mongo), requisitos (Node 22), variables de entorno, scripts reales, despliegue. Mover la lista de "tipos de viaje" a `docs/` o al modelo de categorías.
- [ ] Revisar lo aprovechable de `_doc/` (HTTPS, rendimiento, testing) e incorporarlo a una carpeta `docs/` actualizada.
- [ ] SEO: meta y Open Graph por experiencia, sitemap, robots; valorar prerender/SSR.
- [ ] Accesibilidad y `prefers-reduced-motion`.
- [ ] About/portfolio: contenido externo (JSON/MD/BD), proyectos, CV, decidir idioma o i18n (A-14).
- [ ] Chat IA sobre tu experiencia (Genkit) con rate limit, límites de tokens y prompt acotado.
- [ ] Observabilidad (pino, Sentry) y backups de Mongo.
- [ ] **Quitar `0.0.0.0/0` de *Network Access* en Atlas** (S-1). Antes hay que montar un Mongo local para desarrollo (`docker-compose`) o usar un cluster de desarrollo aparte, para no tener que actualizar la IP doméstica cada vez.

---

## 4. Orden recomendado si hay poco tiempo

1. Fase 0 completa (arreglar el crash, auditoría y limpieza de dependencias; revisar Network Access en Atlas).
2. S-3, S-4, S-5, S-6, S-7 de la Fase 1.
3. Actualizar mongoose / jsonwebtoken / multer (Fase 2).
4. HTTPS (S-8).
5. Tests de servidor para fijar todo lo anterior antes de refactorizar.
