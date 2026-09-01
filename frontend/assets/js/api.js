(function (global) { const API_BASE = 'http://localhost:4000/api'; const SESSION_KEY = 'clinosift_session_v1'; const TOKEN_KEY = 'clinosift_token_v1'; function guardarSesion(usuario, token, pacienteId, medicoId) { localStorage.setItem( SESSION_KEY, JSON.stringify({ usuarioId: usuario._id || usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, tipoDocumento: usuario.tipoDocumento, documento: usuario.documento, pacienteId: pacienteId || null, medicoId: medicoId || null }) ); localStorage.setItem(TOKEN_KEY, token); } function getToken() { return localStorage.getItem(TOKEN_KEY); } function getSession() { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } async function login(tipoDocumento, documento, password) { try { const response = await fetch(API_BASE + '/usuarios/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipoDocumento, documento, password }) }); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'Documento o contraseña incorrectos' }; } let pacienteId = null; let medicoId = null; if (data.usuario.rol === 'paciente') { const pacientesResponse = await fetch(API_BASE + '/pacientes', { headers: { Authorization: 'Bearer ' + data.token } }); const pacientes = await pacientesResponse.json(); if (pacientesResponse.ok && Array.isArray(pacientes)) { const paciente = pacientes.find(function (p) { return String(p.documento) === String(data.usuario.documento); }); if (paciente) { pacienteId = paciente._id; } } } if (data.usuario.rol === 'medico') { const medicosResponse = await fetch(API_BASE + '/medicos', { headers: { Authorization: 'Bearer ' + data.token } }); const medicos = await medicosResponse.json(); if (medicosResponse.ok && Array.isArray(medicos)) { const medico = medicos.find(function (m) { return String(m.email).toLowerCase() === String(data.usuario.email).toLowerCase(); }); if (medico) { medicoId = medico._id; } } } guardarSesion( data.usuario, data.token, pacienteId, medicoId ); return { ok: true, usuario: data.usuario }; } catch (error) { console.error(error); return { ok: false, error: 'No se pudo completar el inicio de sesión. Verifique que el backend esté funcionando.' }; } } async function registrar(datos) { try { const response = await fetch(API_BASE + '/usuarios/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: (datos.nombres + ' ' + datos.apellidos).trim(), tipoDocumento: datos.tipoDocumento, documento: datos.documento, email: datos.email, password: datos.password }) }); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'No se pudo completar el registro' }; } guardarSesion( data.usuario, data.token, data.paciente ? data.paciente._id : null, null ); return { ok: true, usuario: data.usuario, paciente: data.paciente }; } catch (error) { console.error(error); return { ok: false, error: 'No se pudo completar el registro. Verifique que el backend esté funcionando.' }; } } async function obtenerPaciente(id) { const response = await fetch( API_BASE + '/pacientes/' + id, { headers: { Authorization: 'Bearer ' + getToken() } } ); const data = await response.json(); if (!response.ok) { throw new Error( data.error || 'No se pudo obtener el paciente' ); } return data; } async function obtenerPacientes() { const response = await fetch( API_BASE + '/pacientes', { headers: { Authorization: 'Bearer ' + getToken() } } ); const data = await response.json(); if (!response.ok) { throw new Error( data.error || 'No se pudieron obtener los pacientes' ); } return data; } async function actualizarPaciente(id, datos) { const response = await fetch( API_BASE + '/pacientes/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify(datos) } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'No se pudo actualizar el paciente' }; } return { ok: true, paciente: data }; } async function obtenerMedicos() { const response = await fetch( API_BASE + '/medicos', { headers: { Authorization: 'Bearer ' + getToken() } } ); const data = await response.json(); if (!response.ok) { throw new Error( data.error || 'No se pudieron obtener los médicos' ); } return data; } async function obtenerCitas() { const response = await fetch( API_BASE + '/citas', { headers: { Authorization: 'Bearer ' + getToken() } } ); const data = await response.json(); if (!response.ok) { throw new Error( data.error || 'No se pudieron obtener las citas' ); } return data; } async function crearCita(datos) { const response = await fetch( API_BASE + '/citas', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify({ paciente: datos.paciente, medico: datos.medico, fecha: datos.fecha, hora: datos.hora, motivo: datos.motivo, estado: datos.estado || 'pendiente' }) } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'No se pudo crear la cita' }; } return { ok: true, cita: data }; } function iniciales(nombre) { return (nombre || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join(''); } async function solicitarRecuperacion(tipoDocumento, documento) { const response = await fetch( API_BASE + '/usuarios/olvide-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipoDocumento: tipoDocumento, documento: documento }) } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: (data.errores && data.errores[0] && data.errores[0].msg) || data.error || 'No se pudo procesar la solicitud' }; } return { ok: true, mensaje: data.mensaje }; } async function restablecerPassword(token, passwordNueva) { const response = await fetch( API_BASE + '/usuarios/restablecer-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token, passwordNueva: passwordNueva }) } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: (data.errores && data.errores[0] && data.errores[0].msg) || data.error || 'No se pudo restablecer la contraseña' }; } return { ok: true, mensaje: data.mensaje }; } function pintarChrome() { const session = getSession(); if (!session) return; document.querySelectorAll('[data-user-name]').forEach(function (el) { el.textContent = session.nombre; }); document.querySelectorAll('[data-user-initials]').forEach(function (el) { el.textContent = iniciales(session.nombre); }); document.querySelectorAll('[data-user-role]').forEach(function (el) { el.textContent = session.rol === 'medico' ? 'Médico' : session.rol === 'admin' ? 'Administrador' : 'Paciente'; }); } async function actualizarCita(id, datos) { const response = await fetch( API_BASE + '/citas/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify(datos) } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'No se pudo actualizar la cita' }; } return { ok: true, cita: data }; } async function eliminarCita(id) { const response = await fetch( API_BASE + '/citas/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + getToken() } } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'No se pudo eliminar la cita' }; } return { ok: true, mensaje: data.mensaje }; } async function cambiarPassword(passwordActual, passwordNueva) { const response = await fetch( API_BASE + '/usuarios/me/password', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }, body: JSON.stringify({ passwordActual: passwordActual, passwordNueva: passwordNueva }) } ); const data = await response.json(); if (!response.ok) { return { ok: false, error: data.error || 'No se pudo cambiar la contraseña' }; } return { ok: true, mensaje: data.mensaje }; }
async function obtenerNotificaciones() {
  const response = await fetch(API_BASE + '/notificaciones', { headers: { Authorization: 'Bearer ' + getToken() } });
  const data = await response.json();
  if (!response.ok) { throw new Error(data.error || 'No se pudieron obtener las notificaciones'); }
  return data;
}

async function marcarNotificacionLeida(id) {
  const response = await fetch(API_BASE + '/notificaciones/' + id + '/leer', { method: 'PUT', headers: { Authorization: 'Bearer ' + getToken() } });
  const data = await response.json();
  if (!response.ok) { return { ok: false, error: data.error || 'No se pudo marcar como leida' }; }
  return { ok: true, notificacion: data };
}

async function marcarTodasNotificacionesLeidas() {
  const response = await fetch(API_BASE + '/notificaciones/leer-todas', { method: 'PUT', headers: { Authorization: 'Bearer ' + getToken() } });
  const data = await response.json();
  if (!response.ok) { return { ok: false, error: data.error || 'No se pudo marcar como leidas' }; }
  return { ok: true };
}

var ICONOS_NOTIF = { cita_creada: 'info', cita_confirmada: 'ok', cita_completada: 'ok', cita_cancelada: 'warn', general: 'info' };

function iniciarNotificaciones() {
  var btn = document.getElementById('notifBtn');
  var panel = document.getElementById('notifPanel');
  if (!btn || !panel) return;

  var dot = btn.querySelector('.notif-dot');
  var marcarTodasLink = panel.querySelector('.notif-mark');

  panel.querySelectorAll('.notif-item').forEach(function (el) { el.remove(); });

  var vacioMsg = document.createElement('p');
  vacioMsg.className = 'notif-empty';
  vacioMsg.textContent = 'No tienes notificaciones.';
  vacioMsg.hidden = true;
  panel.appendChild(vacioMsg);

  function pintar(notificaciones, noLeidas) {
    panel.querySelectorAll('.notif-item').forEach(function (el) { el.remove(); });

    if (dot) {
      if (noLeidas > 0) {
        dot.textContent = noLeidas > 9 ? '9+' : String(noLeidas);
        dot.hidden = false;
      } else {
        dot.hidden = true;
      }
    }

    vacioMsg.hidden = notificaciones.length > 0;

    notificaciones.forEach(function (n) {
      var item = document.createElement('div');
      item.className = 'notif-item' + (n.leida ? '' : ' notif-item-unread');
      var claseIcono = ICONOS_NOTIF[n.tipo] || 'info';
      item.innerHTML =
        '<span class="notif-ic notif-ic-' + claseIcono + '">' +
          '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="6.5"/></svg>' +
        '</span>' +
        '<div>' +
          '<p>' + n.titulo + '</p>' +
          '<span>' + n.mensaje + '</span>' +
        '</div>';
      if (!n.leida) {
        item.addEventListener('click', async function () {
          await marcarNotificacionLeida(n._id);
          cargar();
        });
      }
      panel.insertBefore(item, vacioMsg);
    });
  }

  async function cargar() {
    try {
      var data = await obtenerNotificaciones();
      pintar(data.notificaciones, data.noLeidas);
    } catch (error) {
      console.error(error);
    }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var iban_a_abrir = panel.hidden;
    panel.hidden = !iban_a_abrir;
    btn.setAttribute('aria-expanded', String(iban_a_abrir));
    if (iban_a_abrir) cargar();
  });

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  if (marcarTodasLink) {
    marcarTodasLink.addEventListener('click', async function (e) {
      e.preventDefault();
      await marcarTodasNotificacionesLeidas();
      cargar();
    });
  }

  cargar();
}
 function logout() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(TOKEN_KEY); } global.ClinoAuth = { login: login, registrar: registrar, logout: logout, getToken: getToken, getSession: getSession, obtenerPaciente: obtenerPaciente, obtenerPacientes: obtenerPacientes, actualizarPaciente: actualizarPaciente, obtenerMedicos: obtenerMedicos, obtenerCitas: obtenerCitas, crearCita: crearCita, actualizarCita: actualizarCita, eliminarCita: eliminarCita, cambiarPassword: cambiarPassword, solicitarRecuperacion: solicitarRecuperacion, restablecerPassword: restablecerPassword, obtenerNotificaciones: obtenerNotificaciones, marcarNotificacionLeida: marcarNotificacionLeida, marcarTodasNotificacionesLeidas: marcarTodasNotificacionesLeidas, iniciarNotificaciones: iniciarNotificaciones, iniciales: iniciales, pintarChrome: pintarChrome, API_BASE: API_BASE }; })(window);