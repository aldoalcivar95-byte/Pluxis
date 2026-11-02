# Pluxis

**Vive experiencias que merecen ser recordadas.**

Pluxis es una aplicación web Full Stack para descubrir eventos, consultar actividades cercanas y gestionar reservas. La plataforma contempla dos perfiles principales: **cliente**, que explora y reserva eventos, y **organizador**, que publica y administra sus propios eventos.

Proyecto académico desarrollado con React, Flask y PostgreSQL.

## Demo online

- **Aplicación:** https://pluxis.onrender.com
- **API:** https://pluxis-api.onrender.com

### Cuentas de demostración

Estas credenciales están incluidas para facilitar la evaluación de los dos roles de la aplicación:

| Perfil | Correo electrónico | Contraseña |
|---|---|---|
| Organizador | `laura@eventify.com` | `123456` |
| Cliente | `carlos@eventify.com` | `123456` |

**Nota para la evaluación:** el registro público crea cuentas de cliente. Los permisos de organizador se asignan de forma controlada y no se seleccionan desde el formulario de registro. Las cuentas anteriores son las credenciales de demostración documentadas para probar ambos perfiles.

## Funcionalidades

### 1. Funcionalidades para clientes

- **Registro:** creación de una cuenta mediante nombre, correo electrónico y contraseña.
- **Inicio de sesión:** acceso mediante credenciales y autenticación basada en JWT.
- **Explorar eventos:** consulta del catálogo de eventos disponibles.
- **Consultar detalles:** visualización de la descripción, fecha, hora, ubicación, precio, aforo, categoría e imagen de cada evento.
- **Buscar eventos cercanos:** localización de eventos a partir de la ubicación del usuario o de una ubicación introducida manualmente. La búsqueda utiliza coordenadas y permite establecer un radio en kilómetros.
- **Reservar entradas:** selección de la cantidad de entradas para un evento, con validación de disponibilidad y aforo.
- **Mis reservas:** consulta del historial de reservas de la cuenta, con información del evento y del estado de cada reserva.
- **Cancelar reservas:** posibilidad de cancelar una reserva propia.
- **Recuperar contraseña:** solicitud de recuperación y restablecimiento mediante un token temporal.
- **Cerrar sesión:** finalización de la sesión y nueva autenticación cuando el token JWT expira.

### 2. Funcionalidades para organizadores

- **Acceso con rol de organizador:** las opciones de gestión están protegidas por permisos.
- **Crear eventos:** publicación de eventos indicando título, descripción, fecha, hora, ubicación, precio, capacidad, categoría e imagen.
- **Editar eventos propios:** actualización de los datos de los eventos creados por el organizador.
- **Eliminar eventos propios:** eliminación sujeta a las reglas de integridad; un evento con reservas asociadas no se puede eliminar.
- **Gestionar aforo:** control de la capacidad y de las plazas reservadas para evitar superar el límite disponible.
- **Consultar reservas asociadas:** acceso a la información necesaria para gestionar las reservas de los eventos propios.

### 3. Funcionalidades generales

- Interfaz adaptable a distintos tamaños de pantalla.
- Navegación entre páginas mediante React Router.
- Página de política de privacidad.
- Carga y almacenamiento de imágenes mediante Cloudinary.
- Geocodificación y búsqueda por proximidad mediante Geoapify.
- Envío de correos para recuperación de contraseña mediante SMTP, cuando el servicio de correo está configurado.
- API REST para comunicar el frontend con el backend.

## Tecnologías utilizadas

### Frontend

- React 18
- JavaScript ES6+
- Vite 4
- React Router DOM 6
- HTML5 y CSS3
- Bootstrap 5
- Font Awesome 6
- Fetch API
- PropTypes

### Backend

- Python 3.13
- Flask
- Flask-SQLAlchemy y SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-CORS
- Flask-Admin
- Flask-Swagger
- bcrypt
- Gunicorn

### Base de datos y servicios externos

| Tecnología / servicio | Uso |
|---|---|
| PostgreSQL | Persistencia de usuarios, categorías, eventos y reservas |
| Cloudinary | Almacenamiento de imágenes |
| Geoapify | Geocodificación y búsqueda de ubicaciones |
| SMTP (Gmail) | Envío de mensajes de recuperación de contraseña |
| Render | Despliegue de frontend, API y base de datos |

## Arquitectura y modelo de datos

Pluxis utiliza una arquitectura cliente-servidor:

- **Frontend:** aplicación React que consume la API.
- **Backend:** API REST construida con Flask.
- **Base de datos:** PostgreSQL, gestionada mediante SQLAlchemy y migraciones de Flask-Migrate.
- **Autenticación:** tokens JWT; las contraseñas se protegen mediante hash con bcrypt.
- **Servicios externos:** Cloudinary, Geoapify y servidor SMTP.

Las entidades principales son:

- **User:** nombre, correo electrónico, contraseña protegida, rol y estado de la cuenta.
- **Category:** categorías para clasificar eventos.
- **Event:** información del evento, ubicación, coordenadas, precio, capacidad, imagen, organizador y categoría.
- **Booking:** usuario, evento, cantidad de entradas, fecha de reserva y estado.

## Seguridad y control de acceso

- Los endpoints privados requieren un token JWT válido.
- Las contraseñas se almacenan mediante hash bcrypt, no en texto plano.
- El backend comprueba el rol del usuario para las operaciones de organizador.
- Un organizador solo puede modificar o eliminar sus propios eventos.
- Un cliente solo puede consultar o cancelar sus propias reservas.
- Se valida la disponibilidad antes de confirmar una reserva.
- La configuración sensible se gestiona mediante variables de entorno.
- CORS limita los orígenes autorizados para la API.

## Estructura del proyecto

```text
Pluxis/
├── frontend/
│   ├── src/
│   │   └── front/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       ├── utils/
│   │       ├── main.jsx
│   │       ├── routes.jsx
│   │       └── store.js
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── api/
│   │   ├── admin.py
│   │   ├── commands.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── utils.py
│   ├── front/
│   ├── app.py
│   └── wsgi.py
├── migrations/
├── scripts/
│   └── migrate_production_data.py
├── .env.example
├── Pipfile
├── Pipfile.lock
├── render.yaml
├── render_build.sh
└── README.md
```

> El directorio `frontend/` contiene la aplicación que se compila para el despliegue del sitio estático en Render. El código frontend también se mantiene en `src/front/` por la estructura original del proyecto.

## Instalación y ejecución local

### Requisitos

- Python 3.13
- Node.js 20 o superior
- npm
- Pipenv
- PostgreSQL

### 1. Clonar el repositorio

```bash
git clone https://github.com/aldoalcivar95-byte/Pluxis.git
cd Pluxis
```

### 2. Instalar dependencias

Desde la raíz del proyecto:

```bash
npm install
pipenv install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz tomando como referencia `.env.example`. Configurar, como mínimo, la conexión a PostgreSQL y la clave JWT. Para utilizar todas las integraciones también se deben configurar las credenciales de Cloudinary, Geoapify y SMTP.

### 4. Arrancar el backend

Desde la raíz del proyecto:

```bash
pipenv run python src/app.py
```

### 5. Arrancar el frontend

En una segunda terminal, desde la raíz del proyecto:

```bash
npm run start -- --host 0.0.0.0
```

### 6. Generar la versión de producción

```bash
npm run build
```

Vite genera los archivos compilados en `dist/`.

## Variables de entorno

### Backend

```env
DATABASE_URL=
JWT_SECRET_KEY=
FLASK_DEBUG=0

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEOAPIFY_API_KEY=
FRONTEND_URL=

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_DEFAULT_SENDER=
MAIL_USE_SSL=false
MAIL_USE_TLS=true
```

### Frontend

```env
VITE_BACKEND_URL=
```

`VITE_BACKEND_URL` debe contener la URL base del backend, sin añadir `/api`.

**Importante:** no subir el archivo `.env`, contraseñas, tokens ni claves privadas al repositorio.

## Despliegue

La configuración de despliegue está preparada para Render mediante `render.yaml` y `render_build.sh`.

- El frontend se construye con Vite y se publica desde `frontend/dist`.
- El backend se ejecuta con Gunicorn.
- La base de datos de producción utiliza PostgreSQL.
- Las variables de entorno deben configurarse también en el panel de Render; el archivo `.env` local no se copia automáticamente al entorno de producción.

## Autor

**Aldo Alcivar Ferrin**

Proyecto académico Full Stack.

**Pluxis — Vive experiencias que merecen ser recordadas.**
