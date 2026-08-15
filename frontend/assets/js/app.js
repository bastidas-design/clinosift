// Toggle de sidebar en móvil
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// Panel de notificaciones (dropdown compacto)
const notifBtn = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');
if (notifBtn && notifPanel) {
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = notifPanel.hasAttribute('hidden');
    if (isHidden) {
      notifPanel.removeAttribute('hidden');
      notifBtn.setAttribute('aria-expanded', 'true');
    } else {
      notifPanel.setAttribute('hidden', '');
      notifBtn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('click', (e) => {
    if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifPanel.setAttribute('hidden', '');
      notifBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

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
