const express = require('express');
const cors = require('cors');
require('dotenv').config();

const conectarDB = require('./src/config/db');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const pacienteRoutes = require('./src/routes/pacienteRoutes');
const medicoRoutes = require('./src/routes/medicoRoutes');
const citaRoutes = require('./src/routes/citaRoutes');
const manejadorErrores = require('./src/middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', function (req, res) {
  res.json({ estado: 'ok', servicio: 'ClinoSift API', hora: new Date().toISOString() });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/citas', citaRoutes);

app.use(function (req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(manejadorErrores);

const PORT = process.env.PORT || 4000;

conectarDB().then(function () {
  app.listen(PORT, function () {
    console.log('ClinoSift API corriendo en http://localhost:' + PORT);
  });
});
