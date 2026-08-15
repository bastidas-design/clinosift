/**
 * Helpers de presentación compartidos entre las páginas dinámicas.
 */
(function (global) {
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  function formatFecha(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    return `${d} ${MESES[m - 1]} ${y}`;
  }

  function formatHora(hora24) {
    const [h, m] = hora24.split(':').map(Number);
    const suf = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suf}`;
  }

  function badgeHTML(estado) {
    const map = {
      confirmada: ['Confirmada', 'badge-ok'],
      pendiente: ['Pendiente', 'badge-warn'],
      cancelada: ['Cancelada', 'badge-danger'],
      completada: ['Completada', 'badge-neutral']
    };
    const [label, cls] = map[estado] || ['—', 'badge-neutral'];
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function nombreCompleto(persona) {
    return persona ? (persona.nombres + ' ' + persona.apellidos) : 'Desconocido';
  }

  global.ClinoUI = { formatFecha, formatHora, badgeHTML, nombreCompleto };
})(window);
