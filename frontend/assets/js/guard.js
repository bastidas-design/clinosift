/**
 * Se incluye en <head> de cada página protegida, después de db.js.
 * Requiere que exista window.CLINO_REQUIRED_ROLE definido antes de este script.
 * Si no hay sesión, o la sesión es de otro rol, redirige — el usuario nunca
 * elige a qué panel entrar, eso lo decide el registro guardado en la "BD".
 */
(function () {
  const session = window.ClinoDB.getSession();
  const required = window.CLINO_REQUIRED_ROLE;

  if (!session) {
    window.location.replace('../login.html');
    return;
  }
  if (required && session.rol !== required) {
    window.location.replace(session.rol === 'medico' ? '../medico/dashboard.html' : '../paciente/dashboard.html');
  }
})();
