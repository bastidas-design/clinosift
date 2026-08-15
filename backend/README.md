# ClinoSift Backend - Node.js + Express + MongoDB

Backend completo del sistema de gestión médica ClinoSift.

---

## 1. Estructura del proyecto

```
clinosift-backend-mongo/
├── src/
│   ├── config/
│   │   └── db.js                  # Conexion a MongoDB (usa MONGO_URI)
│   ├── models/
│   │   ├── Usuario.js             # nombre, email, password (bcrypt), rol
│   │   ├── Paciente.js            # nombre, documento, edad, telefono, direccion
│   │   ├── Medico.js              # nombre, especialidad, telefono, email
│   │   └── Cita.js                # paciente(ref), medico(ref), fecha, hora, estado
│   ├── controllers/
│   │   ├── authController.js      # registrar, login, perfil
│   │   ├── usuarioController.js   # CRUD de usuarios (admin)
│   │   ├── pacienteController.js  # CRUD de pacientes
│   │   ├── medicoController.js    # CRUD de medicos
│   │   └── citaController.js      # CRUD de citas
│   ├── routes/
│   │   ├── usuarioRoutes.js       # /api/usuarios (incluye /register y /login)
│   │   ├── pacienteRoutes.js      # /api/pacientes
│   │   ├── medicoRoutes.js        # /api/medicos
│   │   └── citaRoutes.js          # /api/citas
│   └── middleware/
│       ├── authMiddleware.js      # protegerRuta (JWT), permitirRoles (roles)
│       └── errorMiddleware.js     # manejo centralizado de errores
├── scripts/
│   └── seed.js                    # datos de prueba
├── server.js
├── package.json
└── .env.example
```

---

## 2. Instalación y ejecución

```bash
cp .env.example .env
# Edita .env: ajusta MONGO_URI si usas Atlas o un puerto/base distinta

npm install
npm run seed      # limpia las colecciones e inserta datos de prueba
npm run dev        # modo desarrollo (recarga automatica con --watch)
# o
npm start          # modo normal
```

El servidor queda disponible en `http://localhost:4000`.

---

## 3. Modelos (colecciones) y ejemplos de documentos JSON

### `usuarios`
| Campo | Tipo | Detalle |
|---|---|---|
| `nombre` | String | Obligatorio |
| `email` | String | Único, obligatorio |
| `password` | String | Se encripta automáticamente con bcrypt antes de guardar |
| `rol` | String enum | `admin`, `medico`, `paciente` |

```json
{
  "_id": "66b1f2a1c9d3e4f5a6b70001",
  "nombre": "Administrador ClinoSift",
  "email": "admin@clinosift.com",
  "rol": "admin",
  "createdAt": "2026-07-29T10:00:00.000Z",
  "updatedAt": "2026-07-29T10:00:00.000Z"
}
```
(El campo `password` nunca se devuelve en las respuestas de la API.)

### `pacientes`
| Campo | Tipo | Detalle |
|---|---|---|
| `nombre` | String | Obligatorio |
| `documento` | String | Único, obligatorio |
| `edad` | Number | Obligatorio, 0–120 |
| `telefono` | String | Opcional |
| `direccion` | String | Opcional |

```json
{
  "_id": "66b1f2a1c9d3e4f5a6b70101",
  "nombre": "Juan Carlos Arteaga Mejia",
  "documento": "1007120003",
  "edad": 34,
  "telefono": "3001112233",
  "direccion": "Calle 10 #5-20",
  "createdAt": "2026-07-29T10:00:00.000Z",
  "updatedAt": "2026-07-29T10:00:00.000Z"
}
```

### `medicos`
| Campo | Tipo | Detalle |
|---|---|---|
| `nombre` | String | Obligatorio |
| `especialidad` | String | Obligatorio |
| `telefono` | String | Opcional |
| `email` | String | Opcional |

```json
{
  "_id": "66b1f2a1c9d3e4f5a6b70201",
  "nombre": "Oscar Cabrera Pino",
  "especialidad": "Medicina general",
  "telefono": "3105556677",
  "email": "oscar.cabrera@clinosift.com",
  "createdAt": "2026-07-29T10:00:00.000Z",
  "updatedAt": "2026-07-29T10:00:00.000Z"
}
```

### `citas`
| Campo | Tipo | Detalle |
|---|---|---|
| `paciente` | ObjectId | Referencia a `pacientes._id` |
| `medico` | ObjectId | Referencia a `medicos._id` |
| `fecha` | String | Formato `YYYY-MM-DD` |
| `hora` | String | Formato `HH:MM` |
| `estado` | String enum | `pendiente`, `confirmada`, `cancelada` |

```json
{
  "_id": "66b1f2a1c9d3e4f5a6b70301",
  "paciente": "66b1f2a1c9d3e4f5a6b70101",
  "medico": "66b1f2a1c9d3e4f5a6b70201",
  "fecha": "2026-08-05",
  "hora": "09:30",
  "estado": "confirmada",
  "createdAt": "2026-07-29T10:00:00.000Z",
  "updatedAt": "2026-07-29T10:00:00.000Z"
}
```

### Cómo se relacionan y fluyen los datos
```
usuarios  ──(login)──►  emite JWT con { id, nombre, email, rol }
                                        │
citas.paciente  ──►  pacientes._id      │  el middleware protegerRuta
citas.medico    ──►  medicos._id        │  valida ese JWT en cada request
                                        ▼
             permitirRoles('admin', 'medico', ...) filtra por rol
```
Cuando se pide una cita (`GET /api/citas`), el controlador usa
`.populate('paciente')` y `.populate('medico')`, que en MongoDB equivale a
un `$lookup`: reemplaza el ObjectId por el documento completo (o los campos
seleccionados) del paciente y del médico relacionados.

---

## 4. Rutas de la API

```
POST   /api/usuarios/register     (publica)
POST   /api/usuarios/login        (publica)
GET    /api/usuarios/me           (requiere token)
GET    /api/usuarios              (solo admin)
GET    /api/usuarios/:id          (solo admin)
PUT    /api/usuarios/:id          (solo admin)
DELETE /api/usuarios/:id          (solo admin)

GET    /api/pacientes             (requiere token)
GET    /api/pacientes/:id
POST   /api/pacientes             (admin, medico)
PUT    /api/pacientes/:id         (admin, medico)
DELETE /api/pacientes/:id         (solo admin)

GET    /api/medicos                (requiere token)
GET    /api/medicos/:id
POST   /api/medicos                (solo admin)
PUT    /api/medicos/:id            (solo admin)
DELETE /api/medicos/:id            (solo admin)

GET    /api/citas                  (requiere token)
GET    /api/citas/:id
POST   /api/citas                  (requiere token)
PUT    /api/citas/:id              (requiere token)
DELETE /api/citas/:id              (requiere token)
```

---

## 5. Prueba con Postman / Thunder Client

**1. Login**
```
POST http://localhost:4000/api/usuarios/login
Content-Type: application/json

{
  "email": "admin@clinosift.com",
  "password": "Admin123!"
}
```
Respuesta esperada (200):
```json
{
  "usuario": { "_id": "...", "nombre": "Administrador ClinoSift", "email": "admin@clinosift.com", "rol": "admin" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. Usar el token en las siguientes peticiones**
```
GET http://localhost:4000/api/pacientes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3. Crear un paciente**
```
POST http://localhost:4000/api/pacientes
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "nombre": "Flor Alba Hernandez Chamorro",
  "documento": "37007378",
  "edad": 55,
  "telefono": "3004445566",
  "direccion": "Cra 3 #8-14"
}
```

**4. Crear una cita** (usa los `_id` reales devueltos por `/api/pacientes` y `/api/medicos`)
```
POST http://localhost:4000/api/citas
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "paciente": "ID_DEL_PACIENTE",
  "medico": "ID_DEL_MEDICO",
  "fecha": "2026-08-10",
  "hora": "10:00",
  "estado": "pendiente"
}
```

Comando equivalente con curl:
```bash
curl -X POST http://localhost:4000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinosift.com","password":"Admin123!"}'
```

---

## 6. Guía de prueba con MongoDB Compass

1. Conéctate a `mongodb://127.0.0.1:27017` (o tu URI de Atlas).
2. Abre la base de datos `clinosift`.
3. **Qué debe verse:** 4 colecciones — `usuarios`, `pacientes`, `medicos`, `citas`.
4. Entra a `pacientes` → pestaña Documents → deben aparecer los pacientes creados por el seed (o los que hayas insertado vía API).
5. Entra a `citas` → cada documento debe mostrar `paciente` y `medico` como un ObjectId (string tipo `66b1f2a1c9d3e4f5a6b70101`) — eso confirma que la referencia quedó bien guardada.
6. Usa el filtro `{ "estado": "pendiente" }` en `citas` para ver solo las citas pendientes.
7. Prueba "Add Data → Insert Document" en `medicos`, luego edítalo y bórralo, para verificar que el CRUD manual también funciona directo en Compass.

---

## 7. Guía de prueba con Mongo Shell (mongosh)

```bash
mongosh "mongodb://127.0.0.1:27017/clinosift"
```

```js
use clinosift

// find()
db.pacientes.find({})
db.citas.find({ estado: "confirmada" })

// findOne()
db.usuarios.findOne({ email: "admin@clinosift.com" })
db.medicos.findOne({ especialidad: "Pediatria" })

// updateOne()
db.pacientes.updateOne(
  { documento: "1007120003" },
  { $set: { telefono: "3009998877" } }
)

// deleteOne()
db.citas.deleteOne({ estado: "cancelada" })

// Relacion entre colecciones (equivalente a JOIN)
db.citas.aggregate([
  { $lookup: { from: "pacientes", localField: "paciente", foreignField: "_id", as: "datosPaciente" } },
  { $lookup: { from: "medicos", localField: "medico", foreignField: "_id", as: "datosMedico" } }
])
```

---

## 8. Notas importantes

- La contraseña se encripta con `bcrypt` automáticamente en un hook
  `pre('save')` del modelo `Usuario` — nunca se guarda ni se devuelve en
  texto plano.
- El middleware `protegerRuta` valida el JWT en cada ruta protegida;
  `permitirRoles('admin', 'medico')` restringe por rol encima de eso.
- El middleware `errorMiddleware.js` centraliza los errores de Mongoose
  (validación, duplicados por índice único, ObjectId inválido) en
  respuestas JSON consistentes.
- Antes de crear una cita, el controlador verifica que el médico no tenga
  ya una cita activa en la misma fecha/hora (evita choques de agenda).
