const mongoose = require('mongoose');

async function conectarDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Falta la variable de entorno MONGO_URI');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conexion = await mongoose.connect(uri);
    console.log('MongoDB conectado: ' + conexion.connection.name);
  } catch (error) {
    console.error('Error al conectar a MongoDB: ' + error.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', function () {
  console.warn('MongoDB desconectado');
});

module.exports = conectarDB;
