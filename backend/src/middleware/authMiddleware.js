const jwt = require('jsonwebtoken');

// Verifica que la peticion traiga un token JWT valido
function protegerRuta(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nombre, email, rol }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

// Restringe el acceso a los roles indicados. Uso: permitirRoles('admin', 'medico')
function permitirRoles() {
  const rolesPermitidos = Array.prototype.slice.call(arguments);
  return function (req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (rolesPermitidos.indexOf(req.usuario.rol) === -1) {
      return res.status(403).json({ error: 'No tiene permisos para realizar esta accion' });
    }
    next();
  };
}

module.exports = { protegerRuta: protegerRuta, permitirRoles: permitirRoles };
