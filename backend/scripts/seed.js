// Script de datos de prueba para ClinoSift.
// Ejecutar con: npm run seed  (equivalente a: node scripts/seed.js)

require('dotenv').config();
const mongoose = require('mongoose');
const conectarDB = require('../src/config/db');

const Usuario = require('../src/models/Usuario');
const Paciente = require('../src/models/Paciente');
const Medico = require('../src/models/Medico');
const Cita = require('../src/models/Cita');

async function limpiarColecciones() {
  await Promise.all([
    Usuario.deleteMany({}),
    Paciente.deleteMany({}),
    Medico.deleteMany({}),
    Cita.deleteMany({})
  ]);
  console.log('Colecciones limpiadas.');
}

async function seed() {
  await conectarDB();
  await limpiarColecciones();

  // --- Usuarios (la contraseña se encripta automaticamente via pre-save) ---
  const usuarios = await Usuario.create([
    { nombre: 'Administrador ClinoSift', email: 'admin@clinosift.com', password: 'Admin123!', rol: 'admin' },
    { nombre: 'Juan Carlos Arteaga', email: 'juan.arteaga@correo.com', password: 'Paciente123!', rol: 'paciente' }
  ]);
  console.log(usuarios.length + ' usuarios creados.');

  // --- Pacientes ---
  const pacientes = await Paciente.create([
    { nombre: 'Juan Carlos Arteaga Mejia', documento: '1007120003', edad: 34, telefono: '3001112233', direccion: 'Calle 10 #5-20' },
    { nombre: 'Blanca Elena Bastidas Yaguapaz', documento: '1085909924', edad: 41, telefono: '3002223344', direccion: 'Carrera 8 #12-33' }
  ]);
  console.log(pacientes.length + ' pacientes creados.');

  // --- Medicos ---
  const medicos = await Medico.create([
    { nombre: 'Oscar Cabrera Pino', especialidad: 'Medicina general', telefono: '3105556677', email: 'oscar.cabrera@clinosift.com' },
    { nombre: 'Yesenia Yamiled Goyes Usama', especialidad: 'Pediatria', telefono: '3106667788', email: 'yesenia.goyes@clinosift.com' }
  ]);
  console.log(medicos.length + ' medicos creados.');

  // --- Citas (usando referencias reales a pacientes y medicos ya creados) ---
  const citas = await Cita.create([
    { paciente: pacientes[0]._id, medico: medicos[0]._id, fecha: '2026-08-05', hora: '09:30', estado: 'confirmada' },
    { paciente: pacientes[1]._id, medico: medicos[1]._id, fecha: '2026-08-06', hora: '11:00', estado: 'pendiente' }
  ]);
  console.log(citas.length + ' citas creadas.');

  console.log('\n--- Credenciales de prueba ---');
  console.log('Admin:    admin@clinosift.com / Admin123!');
  console.log('Paciente: juan.arteaga@correo.com / Paciente123!');

  await mongoose.disconnect();
  console.log('\nSeed completado. Conexion cerrada.');
}

seed().catch(function (error) {
  console.error('Error ejecutando el seed:', error);
  process.exit(1);
});
