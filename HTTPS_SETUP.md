# Configuración HTTPS para ScoreTravelsBlog

Esta guía explica cómo habilitar HTTPS en tu servidor DigitalOcean usando tu droplet actual y un dominio propio.

## Requisitos

- Un dominio propio apuntando a tu IP `146.190.159.240`
- Acceso SSH al droplet
- Tu app Express corriendo en `http://127.0.0.1:3040`

> Nota: sin dominio propio no se puede obtener un certificado válido de Let’s Encrypt para una IP directa.

## Pasos

### 1. Apuntar el dominio al droplet

En el panel DNS de tu dominio, crea un registro `A` con:

- Nombre: `@` o tu dominio raíz `midominio.com`
- Valor: `146.190.159.240`
- También puedes crear un registro `A` para `www` si quieres usar `www.midominio.com`

### 2. Instalar nginx

En tu droplet, ejecuta:

```bash
sudo apt update
sudo apt install nginx -y
```

Verifica que nginx está activo:

```bash
sudo systemctl status nginx
```

### 3. Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 4. Crear la configuración de nginx

Crea un archivo de configuración para el sitio, por ejemplo:

- `nginx-scoretravelsblog.conf`

Este archivo ya está incluido en el repositorio y contiene el bloque de servidor necesario.

### 5. Habilitar el sitio en nginx

Si usas el archivo de configuración `nginx-scoretravelsblog.conf`, copia o enlaza el archivo en `/etc/nginx/sites-available` y habilítalo:

```bash
sudo cp /ruta/al/repositorio/nginx-scoretravelsblog.conf /etc/nginx/sites-available/scoretravelsblog
sudo ln -s /etc/nginx/sites-available/scoretravelsblog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Generar el certificado SSL con Certbot

Ejecuta el siguiente comando, reemplazando `midominio.com` con tu dominio real:

```bash
sudo certbot --nginx -d midominio.com -d www.midominio.com
```

Sigue las instrucciones y elige redirigir todo el tráfico HTTP a HTTPS cuando se te pregunte.

### 7. Verificar

- Accede a `https://midominio.com`
- Comprueba que el navegador muestra el candado verde
- Verifica que `http://midominio.com` redirige a HTTPS

## Archivo nginx de ejemplo

El archivo de configuración se incluye en `nginx-scoretravelsblog.conf`.

## Comando principal

```bash
sudo certbot --nginx -d midominio.com -d www.midominio.com
```

## Ajuste recomendado en Express

Para asegurar que Express detecte correctamente el protocolo cuando está detrás de nginx, añade esto en `server/index.js` justo antes de tus rutas:

```js
app.set('trust proxy', true);
```

## Ventajas de esta configuración

- Aprovechas tu droplet actual sin coste extra de App Platform
- Obtienes HTTPS válido con Let’s Encrypt
- El tráfico llega seguro al navegador y nginx actúa como proxy inverso hacia tu app Node/Express
