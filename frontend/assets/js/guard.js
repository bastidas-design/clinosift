(function () {
  const session = window.ClinoAuth.getSession();
  const required = window.CLINO_REQUIRED_ROLE;

  if (!session) {
    window.location.replace('../login.html');
    return;
  }

  if (required && session.rol !== required) {
    if (session.rol === 'medico') {
      window.location.replace('../medico/dashboard.html');
    } else if (session.rol === 'paciente') {
      window.location.replace('../paciente/dashboard.html');
    } else {
      window.location.replace('../login.html');
    }
  }
})();