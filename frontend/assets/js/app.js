// Toggle de sidebar en móvil
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// El panel de notificaciones ahora lo maneja por completo
// ClinoAuth.iniciarNotificaciones() en api.js (trae datos reales del backend).
// Antes había aquí un segundo manejador de clic sobre el mismo botón, y los
// dos se pisaban entre sí: uno abría el panel y el otro lo cerraba en el
// mismo clic, por eso nunca se veía nada al presionar la campana.

// Tabs genéricos (Próximas/Historial, Favoritos/Todos, Resultados/Diagnósticos...)
document.querySelectorAll('.tabs').forEach((tabGroup) => {
  const tabs = tabGroup.querySelectorAll('.tab');
  const container = tabGroup.parentElement;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.getAttribute('data-tab');
      container.querySelectorAll('[data-tab-panel]').forEach((panel) => {
        panel.hidden = panel.getAttribute('data-tab-panel') !== key;
      });
    });
  });
});

// Segmented control (Presencial / Telemedicina)
document.querySelectorAll('.segmented').forEach((group) => {
  group.querySelectorAll('.segmented-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      group.querySelectorAll('.segmented-opt').forEach((o) => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });
});
