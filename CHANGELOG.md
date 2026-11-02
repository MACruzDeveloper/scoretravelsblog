# Changelog

Cambios de seguridad e infraestructura que empezaron como limitaciones conocidas: qué fallaba y cómo se resolvió. Las que siguen abiertas están en [Limitaciones conocidas](README.md#limitaciones-conocidas).

## 2026-11

### Rate limiting compartido entre instancias

- **Problema:** los contadores estaban en la memoria de cada instancia. En serverless las instancias se crean y destruyen según la carga, así que los intentos de login repartidos entre ellas rara vez llegaban al límite.
- **Solución:** login, registro, recuperación de contraseña y contacto cuentan en una colección de MongoDB con índice TTL. Cada intento es una única actualización atómica, de modo que las peticiones simultáneas no se pierden, y los contadores guardan un hash de la IP, no la IP. Si la base de datos falla, la petición continúa, porque esas rutas la necesitan igualmente.
- **Por qué no Redis:** MongoDB ya está en el proyecto y estas rutas reciben poco tráfico; un servicio más no aportaba nada a este volumen.

### Tiempo de respuesta de la recuperación de contraseña

- **Problema:** la respuesta era igual para cualquier email, pero con uno registrado se enviaba el correo antes de responder. Esa diferencia de tiempo permitía averiguar qué emails existen.
- **Solución:** primero se responde y después se busca al usuario y se envía el correo, con `waitUntil` para que la función de Vercel no se detenga antes de terminar.

### Sesiones que siguen a la base de datos

- **Problema:** las sesiones son JWT de 1 día con el rol dentro. Cambiar la contraseña, bajar de rol o borrar un usuario no afectaba a una sesión ya abierta.
- **Solución:** cada petición con sesión consulta al usuario. Si ya no existe, o cambió la contraseña después de iniciar la sesión, se rechaza, y el rol se lee de la base de datos.

### Credencial de la base de datos

- **Problema:** la app conectaba con un usuario `atlasAdmin`, con Atlas abierto a `0.0.0.0/0`. Una credencial filtrada daba control de toda la cuenta.
- **Solución:** usuario dedicado con `readWrite` solo sobre la base de la app.

### Copia de seguridad de las imágenes

- **Problema:** las imágenes subidas en producción están en Vercel Blob, fuera de `npm run backup`.
- **Solución:** `npm run backup:images` descarga las nuevas desde sus URL públicas, sin credenciales de la tienda.

### Base de datos de desarrollo

- **Problema:** local y producción compartían base de datos, así que una prueba en local cambiaba datos reales y las fotos se veían rotas en uno de los dos entornos.
- **Solución:** MongoDB local con `docker compose` y `npm run db:dev:copy`, que solo acepta un destino local.
