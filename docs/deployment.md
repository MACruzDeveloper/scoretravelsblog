# Despliegue

Guía para publicar ScoreTravelsBlog en un único servidor Linux (p. ej. un droplet de DigitalOcean con Ubuntu) detrás de nginx y con HTTPS de Let's Encrypt.

```
Navegador ──HTTPS──▶ nginx (443) ──HTTP──▶ Express (127.0.0.1:3040) ──▶ MongoDB Atlas
                                            ├─ client/dist (SPA)
                                            └─ server/uploads (imágenes)
```

## Requisitos

- Un dominio propio con un registro DNS `A` (y `www` si se quiere) apuntando a la IP del servidor. Let's Encrypt no emite certificados para una IP.
- Acceso SSH al servidor.
- La IP del servidor añadida en *Network Access* de MongoDB Atlas.

## 1. Preparar el servidor

```bash
sudo apt update
sudo apt install -y git nginx certbot

# Node 22 con nvm (o NodeSource)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
```

## 2. Instalar la aplicación

```bash
git clone https://github.com/<usuario>/scoretravelsblog.git
cd scoretravelsblog
cd server && npm ci --omit=dev
cd ../client && npm ci && npm run build
```

Crear `server/.env` a partir de `server/.env.template` con, como mínimo:

```ini
NODE_ENV=production
ATLAS_URL=...
JWT_SECRET=...            # 64 caracteres aleatorios: openssl rand -hex 32
CORS_ORIGINS=https://midominio.com
SITE_URL=https://midominio.com
TRUST_PROXY=1             # una capa de proxy (nginx)
```

Y `client/.env.local` antes del build si se usa la clave de CARTO (`VITE_CARTO_API_KEY`). El cliente se compila con esa clave dentro, así que hay que añadir el dominio en la lista de dominios permitidos de la clave en CARTO.

## 3. Mantener Express en marcha con systemd

`/etc/systemd/system/scoretravelsblog.service`:

```ini
[Unit]
Description=ScoreTravelsBlog API
After=network.target

[Service]
User=<usuario>
WorkingDirectory=/home/<usuario>/scoretravelsblog/server
ExecStart=/home/<usuario>/.nvm/versions/node/<versión>/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now scoretravelsblog
journalctl -u scoretravelsblog -f   # logs
```

El servidor cierra las conexiones de forma ordenada al recibir `SIGTERM`, así que `systemctl restart` no corta peticiones a medias. pm2 también sirve si se prefiere.

## 4. Certificado HTTPS

Con nginx parado, certbot levanta su propio servidor en el puerto 80 para validar el dominio. Los *hooks* quedan guardados y se reutilizan en cada renovación automática:

```bash
sudo certbot certonly --standalone -d midominio.com -d www.midominio.com \
  --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
sudo certbot renew --dry-run   # comprobar que la renovación funciona
```

## 5. Configurar nginx

La configuración está en [`nginx-scoretravelsblog.conf`](nginx-scoretravelsblog.conf). Hay que cambiar `midominio.com` por el dominio real.

```bash
sudo cp docs/nginx-scoretravelsblog.conf /etc/nginx/sites-available/scoretravelsblog
sudo ln -s /etc/nginx/sites-available/scoretravelsblog /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Qué hace:

- Redirige HTTP a HTTPS y `www` al dominio sin `www`.
- Comprime con gzip el texto, JS, CSS, JSON y SVG (las imágenes AVIF ya van comprimidas).
- Caché por tipo de recurso:

  | Ruta | Caché | Motivo |
  | --- | --- | --- |
  | `/assets/` | 1 año, `immutable` | Los nombres de los archivos de Vite llevan un hash |
  | `/static/` | 30 días | Imágenes subidas y archivos de `client/public` |
  | `/api/` | `no-store` | Las respuestas dependen de la sesión |
  | resto (`index.html`) | `no-cache` | Cada despliegue se ve al momento |

- Las cabeceras de seguridad (CSP, HSTS…) las pone helmet en Express, no nginx.

## 6. Actualizar a una versión nueva

```bash
cd ~/scoretravelsblog
git pull
cd server && npm ci --omit=dev
cd ../client && npm ci && npm run build
sudo systemctl restart scoretravelsblog
```

Si el despliegue incluye una migración de datos (`npm run migrate:*`), hay que hacer copia de seguridad antes y ejecutarla una sola vez.

## 7. Copias de seguridad

Hay dos cosas que guardar: la base de datos y la carpeta de imágenes (`server/uploads`, o la ruta de `UPLOADS_DIR`). Las imágenes no están en git y el plan gratuito de Atlas no incluye copias automáticas.

El script [`server/scripts/backup.sh`](../server/scripts/backup.sh) hace las dos copias y borra las de más de 14 días (`KEEP_DAYS`). Lee `ATLAS_URL` y `UPLOADS_DIR` de `server/.env` y necesita `mongodb-database-tools`:

```bash
sudo apt install -y mongodb-database-tools   # o desde https://www.mongodb.com/try/download/database-tools
cd ~/scoretravelsblog/server && npm run backup   # copia a ~/backups/scoretravelsblog
```

Para hacerlo cada noche a las 3:00, con `crontab -e`:

```
0 3 * * * /home/<usuario>/scoretravelsblog/server/scripts/backup.sh >> /home/<usuario>/backups/backup.log 2>&1
```

Conviene copiar también la carpeta de copias fuera del servidor (p. ej. DigitalOcean Spaces con `rclone`). Para restaurar:

```bash
mongorestore --uri "$ATLAS_URL" --gzip --archive=db-<fecha>.gz --drop
tar xzf uploads-<fecha>.tgz -C ~/scoretravelsblog/server/uploads
```

## 8. Logs

El servidor escribe una línea JSON por petición y por error, que systemd guarda en el journal:

```bash
journalctl -u scoretravelsblog -f                          # en directo
journalctl -u scoretravelsblog --since today -p warning    # solo avisos y errores
journalctl -u scoretravelsblog | grep <request-id>         # una petición concreta
```

Los errores 500 devuelven al navegador un `requestId`, el mismo que la cabecera `X-Request-Id`, para encontrar el error completo en el log. Las cabeceras de autenticación y las contraseñas nunca se escriben. `LOG_LEVEL=debug` da más detalle.

## 9. Buscadores y redes sociales

- Dar de alta el dominio en [Google Search Console](https://search.google.com/search-console) y enviar `https://midominio.com/sitemap.xml`.
- Comprobar la vista previa de una experiencia con el [depurador de Facebook](https://developers.facebook.com/tools/debug/) o pegando el enlace en WhatsApp.

## 10. Comprobar el rendimiento

- [PageSpeed Insights](https://pagespeed.web.dev/) o Lighthouse en Chrome DevTools: objetivo LCP < 2,5 s y CLS < 0,1.
- En DevTools → Network, comprobar que `/assets/*` llega con `immutable`, que `index.html` llega con `no-cache` y que la respuesta va comprimida (`content-encoding: gzip`).
