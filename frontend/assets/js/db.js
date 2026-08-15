/**
 * ClinoSift - Capa de datos del prototipo.
 * Simula una base de datos real usando localStorage: el rol de cada usuario
 * queda fijado en el registro del "usuario" y NUNCA se elige en el login.
 * En una versión conectada al backend real, este archivo se reemplaza por
 * llamadas fetch() a /auth/login, /pacientes, /citas, etc.
 */
(function (global) {
  const DB_KEY = 'clinosift_db_v1';
  const SESSION_KEY = 'clinosift_session_v1';

  // Fecha de referencia de la demo (coincide con las citas semilla)
  const HOY_DEMO = '2026-08-05';

  function seed() {
    return {
      pacientes: [
        { id: 'p1', nombres: 'Juan Carlos', apellidos: 'Arteaga Mejia', documento: '1007120003', telefono: '+57 300 111 2233', email: 'juan.arteaga@correo.com', direccion: 'Calle 10 #5-20', ciudad: 'Ipiales, Nariño', fechaNacimiento: '1991-03-14', genero: 'Masculino' },
        { id: 'p2', nombres: 'Blanca Elena', apellidos: 'Bastidas Yaguapaz', documento: '1085909924', telefono: '+57 300 222 3344', email: 'blanca.bastidas@correo.com', direccion: 'Carrera 8 #12-33', ciudad: 'Ipiales, Nariño', fechaNacimiento: '1984-07-22', genero: 'Femenino' },
        { id: 'p3', nombres: 'Segundo Nicolas', apellidos: 'Rosero Hernandez', documento: '1197841209', telefono: '+57 300 333 4455', email: 'segundo.rosero@correo.com', direccion: 'Avenida 5 #20-10', ciudad: 'Ipiales, Nariño', fechaNacimiento: '1978-11-05', genero: 'Masculino' },
        { id: 'p4', nombres: 'Flor Alba', apellidos: 'Hernandez Chamorro', documento: '37007378', telefono: '+57 300 444 5566', email: 'flor.hernandez@correo.com', direccion: 'Cra 3 #8-14', ciudad: 'Ipiales, Nariño', fechaNacimiento: '1969-01-30', genero: 'Femenino' }
      ],
      medicos: [
        { id: 'm1', nombres: 'Oscar', apellidos: 'Cabrera Pino', documento: '104756007', especialidad: 'Medicina General', consultorio: '301', email: 'oscar.cabrera@clinosift.com' },
        { id: 'm2', nombres: 'Yesenia Yamiled', apellidos: 'Goyes Usama', documento: '1074002473', especialidad: 'Pediatría', consultorio: '205', email: 'yesenia.goyes@clinosift.com' }
      ],
      usuarios: [
        { id: 'u1', nombre: 'Administrador ClinoSift', documento: '0000000000', password: 'Admin123!', rol: 'admin', pacienteId: null, medicoId: null },
        { id: 'u2', nombre: 'Oscar Cabrera Pino', documento: '104756007', password: '104756007', rol: 'medico', pacienteId: null, medicoId: 'm1' },
        { id: 'u3', nombre: 'Yesenia Yamiled Goyes Usama', documento: '1074002473', password: '1074002473', rol: 'medico', pacienteId: null, medicoId: 'm2' },
        { id: 'u4', nombre: 'Juan Carlos Arteaga Mejia', documento: '1007120003', password: '1007120003', rol: 'paciente', pacienteId: 'p1', medicoId: null },
        { id: 'u5', nombre: 'Blanca Elena Bastidas Yaguapaz', documento: '1085909924', password: '1085909924', rol: 'paciente', pacienteId: 'p2', medicoId: null },
        { id: 'u6', nombre: 'Segundo Nicolas Rosero Hernandez', documento: '1197841209', password: '1197841209', rol: 'paciente', pacienteId: 'p3', medicoId: null },
        { id: 'u7', nombre: 'Flor Alba Hernandez Chamorro', documento: '37007378', password: '37007378', rol: 'paciente', pacienteId: 'p4', medicoId: null }
      ],
      citas: [
        { id: 'c1', pacienteId: 'p1', medicoId: 'm1', fecha: '2026-08-05', hora: '09:00', motivo: 'Control rutinario', estado: 'confirmada' },
        { id: 'c2', pacienteId: 'p3', medicoId: 'm1', fecha: '2026-08-05', hora: '11:30', motivo: 'Revisión', estado: 'pendiente' },
        { id: 'c3', pacienteId: 'p1', medicoId: 'm1', fecha: '2026-08-05', hora: '14:00', motivo: 'Entrega de resultados', estado: 'confirmada' },
        { id: 'c4', pacienteId: 'p3', medicoId: 'm1', fecha: '2026-08-05', hora: '15:30', motivo: 'Primera consulta', estado: 'confirmada' },
        { id: 'c5', pacienteId: 'p2', medicoId: 'm2', fecha: '2026-08-12', hora: '11:00', motivo: 'Valoración general', estado: 'pendiente' },
        { id: 'c6', pacienteId: 'p1', medicoId: 'm1', fecha: '2025-11-14', hora: '09:00', motivo: 'Consulta general', estado: 'completada' },
        { id: 'c7', pacienteId: 'p2', medicoId: 'm2', fecha: '2025-10-28', hora: '15:00', motivo: 'Primera consulta', estado: 'cancelada' }
      ]
    };
  }

  function load() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const inicial = seed();
      localStorage.setItem(DB_KEY, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(raw);
  }

  function save(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // ---------- Sesión ----------
  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(usuario) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      usuarioId: usuario.id, nombre: usuario.nombre, rol: usuario.rol,
      pacienteId: usuario.pacienteId, medicoId: usuario.medicoId
    }));
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  // ---------- Autenticación ----------
  // El rol viene siempre del registro de usuario en la "base de datos": nunca se elige aquí.
  function login(documento, password) {
    const db = load();
    const usuario = db.usuarios.find((u) => u.documento === documento && u.password === password);
    if (!usuario) return { ok: false, error: 'Documento o contraseña incorrectos' };
    setSession(usuario);
    return { ok: true, usuario };
  }

  // Registro público: siempre crea rol "paciente", sin excepción.
  function registrarPaciente({ nombres, apellidos, documento, email, password }) {
    const db = load();
    if (db.usuarios.some((u) => u.documento === documento)) {
      return { ok: false, error: 'Ya existe una cuenta con ese número de documento' };
    }
    const pacienteId = uid('p');
    db.pacientes.push({ id: pacienteId, nombres, apellidos, documento, telefono: '', email, direccion: '', ciudad: '', fechaNacimiento: '', genero: '' });
    const usuario = { id: uid('u'), nombre: nombres + ' ' + apellidos, documento, password, rol: 'paciente', pacienteId, medicoId: null };
    db.usuarios.push(usuario);
    save(db);
    setSession(usuario);
    return { ok: true, usuario };
  }

  // ---------- Consultas ----------
  function getPaciente(id) { return load().pacientes.find((p) => p.id === id) || null; }
  function getMedico(id) { return load().medicos.find((m) => m.id === id) || null; }

  function updatePaciente(id, cambios) {
    const db = load();
    const idx = db.pacientes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.pacientes[idx] = Object.assign({}, db.pacientes[idx], cambios);
    save(db);
    return db.pacientes[idx];
  }

  function citasConDetalle(citas, db) {
    return citas.map((c) => ({
      ...c,
      paciente: db.pacientes.find((p) => p.id === c.pacienteId),
      medico: db.medicos.find((m) => m.id === c.medicoId)
    }));
  }

  function getCitasPorPaciente(pacienteId) {
    const db = load();
    const citas = db.citas.filter((c) => c.pacienteId === pacienteId);
    return citasConDetalle(citas, db);
  }

  function getCitasPorMedico(medicoId) {
    const db = load();
    const citas = db.citas.filter((c) => c.medicoId === medicoId);
    return citasConDetalle(citas, db);
  }

  function getPacientesDeMedico(medicoId) {
    const db = load();
    const idsPacientes = [...new Set(db.citas.filter((c) => c.medicoId === medicoId).map((c) => c.pacienteId))];
    return idsPacientes.map((id) => db.pacientes.find((p) => p.id === id)).filter(Boolean);
  }

  function crearCita({ pacienteId, medicoId, fecha, hora, motivo }) {
    const db = load();
    const cruce = db.citas.find((c) => c.medicoId === medicoId && c.fecha === fecha && c.hora === hora && c.estado !== 'cancelada');
    if (cruce) return { ok: false, error: 'Ese médico ya tiene una cita programada en ese horario' };
    const nueva = { id: uid('c'), pacienteId, medicoId, fecha, hora, motivo, estado: 'pendiente' };
    db.citas.push(nueva);
    save(db);
    return { ok: true, cita: citasConDetalle([nueva], db)[0] };
  }

  function actualizarEstadoCita(citaId, estado) {
    const db = load();
    const idx = db.citas.findIndex((c) => c.id === citaId);
    if (idx === -1) return null;
    db.citas[idx].estado = estado;
    save(db);
    return db.citas[idx];
  }

  function reprogramarCita(citaId, fecha, hora) {
    const db = load();
    const idx = db.citas.findIndex((c) => c.id === citaId);
    if (idx === -1) return null;
    db.citas[idx].fecha = fecha;
    db.citas[idx].hora = hora;
    save(db);
    return db.citas[idx];
  }

  function iniciales(nombreCompleto) {
    return nombreCompleto.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }

  // Pinta nombre/rol/iniciales de la sesión activa en el sidebar y el topbar
  function pintarChrome() {
    const session = getSession();
    if (!session) return;
    document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = session.nombre; });
    document.querySelectorAll('[data-user-initials]').forEach((el) => { el.textContent = iniciales(session.nombre); });
    document.querySelectorAll('[data-user-role]').forEach((el) => {
      el.textContent = session.rol === 'medico' ? 'Médico' : session.rol === 'admin' ? 'Administrador' : 'Paciente';
    });
  }

  global.ClinoDB = {
    HOY_DEMO,
    getSession, setSession, logout, login, registrarPaciente,
    getPaciente, getMedico, updatePaciente,
    getCitasPorPaciente, getCitasPorMedico, getPacientesDeMedico,
    crearCita, actualizarEstadoCita, reprogramarCita,
    iniciales, pintarChrome
  };
})(window);
