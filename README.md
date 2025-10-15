# 💡 Servidor de lanzamiento de pruebas externas para Moodle mediante LTI

Este proyecto, desarrollado con Node.js, actúa como un servidor de lanzamiento (Launch Server) compatible con LTI (Learning Tools Interoperability), permitiendo la integración de actividades externas en Moodle dentro de la plataforma Virtual Pregrado UFPS.

Su función principal es ofrecer un servicio POST de lanzamiento (Launch Endpoint) que Moodle consume para iniciar sesiones de evaluación externa y recibir calificaciones de actividades desarrolladas fuera del entorno de Moodle o en herramientas como H5P.

Además, el servidor incorpora un módulo de evaluación automática de código, que utiliza modelos de lenguaje (actualmente Gemini de Google) para analizar y calificar las respuestas enviadas por los estudiantes.

# Índice
- [💡 Servidor de lanzamiento de pruebas externas para Moodle mediante LTI](#-Servidor-de-lanzamiento-de-pruebas-externas-para-Moodle-mediante-LTI)
  - [Tecnologías Principales](#Tecnologías-Principales)
  - [Instalación y configuración](#Instalación-y-configuración)
    - [Requisitos previos](#Requisitos-previos)
    - [1. Clonar el repositorio](#1-Clonar-el-repositorio)
    - [2. Instalar dependencias](#2-Instalar-dependencias)
    - [3. Configuración de variables de entorno](#3-Configuración-de-variables-de-entorno)
    - [4. Iniciar proyecto](#4-Iniciar-proyecto)
  - [Estructura del proyecto](#Estructura-del-proyecto)
  - [Endpoints](#Endpoints)
    - [POST /api/launch/{:id}](#POST-apilaunchid)
    - [POST /api/calificar](#POST-apicalificar)
    - [POST /api/calificar_moodle](#POST-apicalificar_moodle)
    - [POST /api/tiempo_restante](#POST-apitiempo_restante)

## Tecnologías Principales

- Node.js — entorno de ejecución principal.
- Express.js — framework para el servidor HTTP.
- LTI 1.0/1.1 — protocolo de interoperabilidad educativa.
- Gemini (Google) — modelo de lenguaje usado en el módulo de evaluación.
- JWT (JSON Web Token) — sistema para la generación y validación de tokens encriptados, usado para el manejo seguro de datos privados de sesión con Moodle.
- pnpm — gestor de paquetes eficiente para entornos Node.js, alternativo a npm.

## Instalación y configuración

### Requisitos previos
- Node.js versión 18 o superior (probado hasta la versión 22).
- pnpm versión 9 o superior.
- Acceso a un entorno Moodle compatible con LTI 1.0 / 1.1 (no probado con LTI 1.3).
- Token de acceso para la API de un modelo de lenguaje — actualmente configurado para Gemini (Google), aunque potencialmente compatible con GPT o DeepSeek.
- Un servicio externo de evaluación capaz de generar calificaciones y manejar el token de sesión recibido durante el proceso de launch.

### 1. Clonar el repositorio 
```cmd
git clone https://github.com/joferrer/pruebaMoodle.git
```
### 2. Instalar dependencias
```cmd
pnpm i
```
### 3. Configuración de variables de entorno
Crea un archivo llamado .env en la raíz del proyecto y define las siguientes variables de entorno:

```bash
CONSUMER_KEY=tu-clave
CONSUMER_SECRET=tu-secreto
JWT_SECRET=tu-clave-secreta
DEEPSEEK_API_KEY=TU_TOKEN_DE_API
GEMINI_API_KEY=TU_TOKEN_DE_API
CHISPA_SIMULATOR_URL=URL_SERVICIO_EXTERNO
CODE_EVALUATOR_URL=OTRO_URL_SERVICIO_EXTERNO_SI_TIENES_MAS
```
> [!WARNING]
> El software solo reconoce las variables de entorno listadas anteriormente.
Si deseas configurar servicios adicionales o agregar nuevas variables, debes modificar el manejador de variables ubicado en:
src/envs/variables.ts

### 4. Iniciar proyecto

#### Modo desarrollo 💻
Para inciar el proyecto en modo desarrollo solo tienes que ejecutar el script:
```bash
pnpm run dev
```

#### Modo producción ⚙️
>[!WARNING]
> Actualmente el archivo .env se utiliza tanto en desarrollo como en producción.
Si necesitas usar variables diferentes en producción, deberás modificar manualmente el archivo .env o implementar un sistema de variables separado.

Para inicar le proyecto en modo prod ejecuta los siguientes scripts:
```bash
pnpm run build
pnpm run start
```

## Estructura del proyecto

```pgsql
📦 prueba-moodle
 ┣ 📂 src
 ┃ ┣ 📂 envs
 ┃ ┣ 📂 helper
 ┃ ┣ 📂 iamodel
 ┃ ┣ 📂 moodle
 ┃ ┣ 📂 routes
 ┃ ┣ 📂 server
 ┃ ┣ 📂 types
 ┃ ┗ index.ts
 ┣ 📄 .env
 ┣ 📄 package.json
 ┣ 📄 README.md
 ┗ 📄 tsconfing.json

```
Breve descripción de las carpetas:
- envs/ — manejador de las variables de entorno. Verifica su existencia, las valida y las exporta para su uso en todo el proyecto.
- helper/ — gestiona la creación, validación y expiración de JSON Web Tokens (JWT).
- iamodel/ — controla todo lo relacionado con la configuración de prompts y la interacción con los modelos de lenguaje.
- moodle/ — maneja los datos de LTI: los extrae, valida y establece la conexión con Moodle para registrar calificaciones.
- routes/ — define los endpoints del servidor. Actualmente incluye los servicios del evaluador, el proceso de lanzamiento y el registro de calificaciones (el endpoint final se encuentra en /moodle).
- server/ — configura y despliega el servidor Express.
- types/ — contiene las interfaces TypeScript utilizadas para las variables de entorno, los datos LTI, las respuestas de los modelos de lenguaje y otras estructuras del sistema.
  
## Endpoints

### POST /api/launch/{:id}

#### Descripción:
Endpoint principal que Moodle invoca al iniciar una actividad externa. El parámetro :id corresponde al identificador de la prueba que se desea lanzar.

Actualmente existen dos tipos de pruebas, por lo que no se ha implementado un manejador general de tipos; sin embargo, el servidor debe reconocer el identificador recibido y redirigir al estudiante hacia la URL correspondiente a la prueba referenciada.

#### Flujo general:

1. Moodle realiza una solicitud POST al endpoint /launch/:id.
2. El servidor identifica la prueba según el parámetro :id.
3. Se valida la información LTI y el contexto del lanzamiento. Los datos LTI son enviados por moodle en el body.
4. Se genera un JWT con los datos de sesión de Moodle, el cual identifica al estudiante que inicia la prueba.
5. El usuario es redirigido a la URL externa asociada a la prueba y con el token generado.

#### Resultado/respuesta:

✅ Si el launch se realiza correctamente:
```
redired to : {url_prueba}?token={jwt_sesion_moodle}
```
❌ Si ocurre un error: (status:401)
```
LTI Launch inválido
```

#### Diagrama del flujo para mejor entendimiento.
<img width="870" height="572" alt="diagrama de lanzamiento de la prueba" src="https://github.com/user-attachments/assets/29b71c98-0ff5-4f6f-8294-0fbbeb1a3f3b" />


### POST /api/calificar

#### Descripción:
Endpoint invocado por el evaluador de código para recibir y procesar una calificación generada mediante un modelo de lenguaje.

#### Flujo general:
1. Se recibe la idPrueba y el código fuente que debe evaluarse.
2. El servidor identifica el prompt correspondiente a la prueba según su idPrueba.
3. Se envía el código al modelo de lenguaje (actualmente Gemini).
4. Se recibe la respuesta del modelo y se devuelve un JSON con la calificación y los comentarios generados.
5. En caso de error, se retorna un objeto JSON con la descripción del fallo.

#### Petición

```http
POST http://localhost:3000/api/calificar HTTP/1.1
content-type: application/json
{
    "idPrueba": "id que identifica la prueba",
    "codigo": "codigo a evaluar"
}
```

#### Resultado/respuesta:

✅ Si la evaluación se realiza correctamente:

```json
{
    "calificacion": 0,
    "comentario": "No sé qué hace esto, pero definitivamente no lo que debería."
}
```
❌ Si ocurre un error:
```json
{
    "error": "Error al generar respuesta del modelo",
    "details": "Descripción detallada del error"
}
```

### POST /api/calificar_moodle

#### Descripción:
Endpoint utilizado para enviar la calificación final a Moodle.
La calificación debe estar expresada en una escala de 0 a 1, donde 0 representa la nota mínima y 1 la nota máxima.

#### Flujo general:
1. Se valida el cuerpo de la solicitud, asegurando la presencia del token y la nota.
2. Se valida que el token sea un jwt válido.
3. Se envía la calificación al servicio de Moodle correspondiente.
4. El servidor devuelve una respuesta en formato JSON indicando si la operación fue exitosa o si ocurrió un error durante el proceso.

#### Petición

```http
POST http://localhost:3000/api/calificar_moodle HTTP/1.1
content-type: application/json
{
    "token": "JWT de sección de moodle generado al hacer el launch",
    "nota": 1
}
```

#### Resultado/respuesta:

✅ Si la calificación se registra correctamente:

```json
{
    "success": true,
    "message": "Calificación enviada exitosamente",
    "usuario": "ltiData.user_name",
    "nota": 1
}
```
❌ Si ocurre un error:
```json
{
    "error": "Error al generar respuesta del modelo",
    "err": "Descripción detallada del error"
}
```

### POST /api/tiempo_restante
#### Descripción
Endpoint utilizado para obtener el tiempo restante de validez de un token.

#### Flujo general
1. Se valida el token recibido en la solicitud.
2. Se verifica su fecha de expiración y se calcula el tiempo restante.
3. El servidor devuelve la duración restante en segundos, o un mensaje de error si el token no es válido o ha expirado.

Resultado/respuest
#### Petición

```http
POST http://localhost:3000/api/tiempo_restante HTTP/1.1
content-type: application/json
{
    "token": "JWT válido con tiempo de expiración",
}
```

#### Resultado/respuesta:

✅ Si es un token válido:

```json
{
    "tiempoRestante":"tiempo restante en segundos"
}
```
❌ Si ocurre un error:
```json
{
    "error": "No se pudo determinar la duración restante del token, es posible que el token sea inválido"
}
```
