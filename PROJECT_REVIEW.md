# Revisión general de ScoreTravelsBlog

Esta revisión cubre mejoras sugeridas en cliente y servidor, con foco en optimizaciones reales y seguridad.

## Cliente

### 1. Llamadas redundantes a `/admin/experiences`

Estos componentes hacen la misma petición de forma independiente:

- `client/src/components/experiences/LastExperiences.tsx`
- `client/src/components/experiences/BestExperiences.tsx`
- `client/src/components/Timeline.tsx`

Cada uno hace `dispatch(fetchExperiences())` en `useEffect(() => { ... }, [])`. Esto provoca múltiples peticiones idénticas y un uso ineficiente de la red.

### 2. Uso ineficiente de Redux

En esos componentes:

- se lee `selectedExperiences` desde Redux
- luego se copia el estado a estados locales (`setExperiences`, `setLoading`, `setError`)

Mejorar esto con:

- una única carga de datos en un componente padre o en el entry point de la Home
- uso directo de `selectedExperiences.experiences`
- derivación de `last`, `best`, `timeline` mediante `useMemo` o funciones puras

### 3. Mejorar el `Carousel`

En `client/src/components/Carousel.tsx`:

- `autoplay` está en `false`, por lo que el slideshow no avanza automáticamente
- no existe una transición de fade entre imágenes
- el cambio de slide es instantáneo y no hay efecto visual suave

Sugerencias:

- usar `opacity` + `transition` CSS o `react-transition-group`
- activar autoplay opcional con un `useEffect` controlado
- superponer imágenes para fade suave o usar clases de estado animadas
- mejorar la experiencia de usuario con controles de teclado/swipe en móvil

### 4. Centralizar fetch de imágenes

`Carousel` hace su propia petición a `/images/fetch_images`.

Si esta misma data se usa en otras partes, conviene moverla a un store compartido o un hook reutilizable para evitar lógica repetida.

### 5. Mejora de UX general

- Mostrar placeholders o skeletons en vez de un spinner estático
- Manejar errores de API con un mensaje consistente y no solo `console.log`
- Cachear resultados si la data no cambia con frecuencia

### 6. Código duplicado

Existe `client/src/components/_Carousel.tsx` además de `client/src/components/Carousel.tsx`.

Revisar si uno es obsoleto y eliminar duplicados para reducir confusión.

### 7. Optimización de utilidades compartidas

La lógica de ordenamiento y filtrado se repite en varios componentes.

Extraer helpers reutilizables para:

- ordenar experiencias
- filtrar por puntuación
- agrupar por año

### 8. Configuración de Axios

Usar un `axios.create()` con `baseURL` global evitará repetir `URL` en cada llamada.

Ejemplo:

```ts
const api = axios.create({ baseURL: URL })
```

Luego usar `api.get('/admin/experiences')`.

## Servidor

### 1. Rutas administrativas sin protección

En `server/routes/experiencesRoute.js` no hay middleware de autenticación.

Esto deja expuestas rutas sensibles:

- `GET /admin/experiences`
- `POST /admin/experiences/add`
- `POST /admin/experiences/delete`
- `POST /admin/experiences/update`
- `POST /admin/experiences/update_score`

Recomendación:

- añadir middleware `auth` en rutas admin
- verificar `Bearer` token
- retornar 401/403 cuando el token sea inválido

### 2. Mejora de autenticación

En `server/controllers/usersController.js`:

- `verify_token` usa `req.headers.authorization` directamente
- no comprueba el esquema `Bearer <token>`
- no hay middleware reutilizable de verificación

Mejoras:

- crear un middleware `auth.js`
- extraer la verificación JWT a una función reusable
- proteger rutas admin con ese middleware

### 3. Validación y respuestas HTTP adecuadas

En `server/controllers/experiencesController.js`:

- `addNewExperience`, `updateExperience`, `deleteExperience` no validan datos
- no devuelven códigos de estado HTTP estándar
- usan `res.send({ error })` sin `res.status(...)`

Mejorar con:

- validación con `validator`, `Joi` o `zod`
- `res.status(400).json({ error: '...' })`
- `res.status(500)` para fallos de servidor

### 4. Mejoras en Express y seguridad

En `server/index.js`:

- `app.use(cors())` abre CORS a todos los orígenes
- `mongoose.set('useCreateIndex', true)` está obsoleto
- `process.env.port` debería ser `process.env.PORT`
- se puede usar `express.json()` en lugar de `body-parser`

Recomendaciones:

- restringir CORS a tu frontend real
- usar `helmet` para cabeceras de seguridad
- usar `morgan` para logging de requests
- añadir manejo centralizado de errores

### 5. REST más estándar

Las rutas actuales usan `POST /delete` y `POST /update`.

Sugerencia de rutas más limpias:

- `GET /admin/experiences`
- `GET /admin/experiences/:id`
- `POST /admin/experiences`
- `PUT /admin/experiences/:id`
- `DELETE /admin/experiences/:id`
- `PATCH /admin/experiences/:id/score`

## Lista de mejoras sugeridas

### Cliente

1. Centralizar la carga de `experiences` y evitar peticiones duplicadas.
2. Eliminar `fetchExperiences()` en cada subcomponente.
3. Usar `useMemo`/hooks derivados para `LastExperiences`, `BestExperiences`, `Timeline`.
4. Mejorar el `Carousel` con transiciones fade y autoplay.
5. Extraer lógica de orden/agrupar a utilidades compartidas.
6. Revisar y eliminar componentes duplicados como `_Carousel.tsx`.
7. Usar un `axios` con `baseURL` global.
8. Normalizar el manejo de errores y estados de carga.
9. Rutas en vite config.

### Servidor

1. Proteger rutas admin con autenticación JWT.
2. Añadir middleware `Bearer` token reusable.
3. Validar y sanitizar los datos de entrada.
4. Devolver códigos HTTP adecuados.
5. Restringir CORS a orígenes permitidos.
6. Añadir `helmet`, `morgan` y manejo de errores centralizado.
7. Modernizar las rutas REST.
8. Actualizar la configuración de Mongo y Express obsoleta.

## Conclusión

- Hay mejoras claras en rendimiento y seguridad.
- Lo más urgente en cliente es evitar la llamada triple a `/admin/experiences`.
- Lo más urgente en servidor es endurecer la API administrativa y estandarizar respuestas.

Si quieres, puedo continuar implementando la primera mejora ahora: un único fetch de experiencias en Redux con subcomponentes consumiendo ese estado compartido.
