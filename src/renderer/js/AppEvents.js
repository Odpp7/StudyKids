console.log('Eventos globales cargados');

const pageContent = document.getElementById('page-content');

pageContent.addEventListener('click', (e) => {

  /* ===================== PAGOS ===================== */

  if (e.target.closest('#btn-new-payment')) {
    alert('Registrar nuevo pago');
  }

  if (e.target.closest('.btn-pay')) {
    const row = e.target.closest('tr');
    const name = row.querySelector('.student-info div').textContent;
    const month = row.children[1].textContent;
    alert(`Registrar pago de ${name} (${month})`);
  }

  if (e.target.closest('.btn-receipt')) {
    const row = e.target.closest('tr');
    const name = row.querySelector('.student-info div').textContent;
    alert(`Ver comprobante de ${name}`);
  }

  if (e.target.closest('.btn-print')) {
    const row = e.target.closest('tr');
    const name = row.querySelector('.student-info div').textContent;
    alert(`Imprimir recibo de ${name}`);
  }

  if (e.target.closest('.btn-remind')) {
    const row = e.target.closest('tr');
    const name = row.querySelector('.student-info div').textContent;
    alert(`Enviar recordatorio a ${name}`);
  }

  /* ===================== REPORTES ===================== */

  if (e.target.closest('#btn-export-report')) {
    alert('Exportando reporte PDF');
  }

  if (e.target.closest('#btn-detailed-report')) {
    alert('Mostrando reporte detallado');
  }

  /* ===================== PADRES ===================== */

  if (e.target.closest('#btn-new-parent')) {
    alert('Funcionalidad: Registrar nuevo representante\n\nFormulario incluiría:\n• Nombre completo\n• Relación con estudiante\n• Teléfono y WhatsApp\n• Email\n• Dirección');
  }

  if (e.target.closest('#btn-send-mass-message')) {
    if (confirm('¿Enviar mensaje masivo a todos los representantes?')) {
      alert('Mensaje masivo enviado ✅\n\n42 representantes notificados');
    }
  }

  if (e.target.closest('#btn-payment-reminder')) {
    const pendingCount = 3;
    if (confirm(`¿Enviar recordatorio de pago a ${pendingCount} representantes con pagos pendientes?`)) {
      alert(`Recordatorios enviados ✅\n\n${pendingCount} mensajes enviados`);
    }
  }

  if (e.target.closest('#btn-monthly-report')) {
    if (confirm('¿Enviar reporte mensual de progreso a todos los representantes?')) {
      alert('Reportes mensuales enviados ✅\n\n42 reportes enviados por email y WhatsApp');
    }
  }

  if (e.target.closest('#btn-export-contacts')) {
    alert('Exportando lista de contactos...\n\nArchivo CSV descargado ✅');
  }

  if (e.target.closest('.btn-whatsapp')) {
    const row = e.target.closest('tr');
    const parentName = row.querySelector('.parent-name').textContent;
    const phone = row.querySelector('.contact-info span').textContent;
    alert(`Abriendo WhatsApp...\n\nContacto: ${parentName}\nTeléfono: ${phone}`);
  }

  if (e.target.closest('.btn-email')) {
    const row = e.target.closest('tr');
    const parentName = row.querySelector('.parent-name').textContent;
    const email = row.children[3].textContent;
    alert(`Componiendo email...\n\nPara: ${parentName}\nEmail: ${email}`);
  }

  if (e.target.closest('.btn-call')) {
    const row = e.target.closest('tr');
    const parentName = row.querySelector('.parent-name').textContent;
    const phone = row.querySelector('.contact-info span').textContent;
    alert(`Llamando a...\n\nContacto: ${parentName}\nTeléfono: ${phone}`);
  }

  if (e.target.closest('.btn-view') && document.querySelector('#parents-table')) {
    const row = e.target.closest('tr');
    const parentName = row.querySelector('.parent-name').textContent;
    const students = Array.from(row.querySelectorAll('.student-tag')).map(tag => tag.textContent).join(', ');
    alert(`Perfil de: ${parentName}\n\nEstudiantes a cargo:\n${students}`);
  }

  if (e.target.closest('.filter-btn') && document.querySelector('#parents-table')) {
    const filterBtn = e.target.closest('.filter-btn');
    const filter = filterBtn.dataset.filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');
    
    const rows = document.querySelectorAll('#parents-tbody tr');
    rows.forEach(row => {
      if (filter === 'todos') {
        row.style.display = '';
      } else if (filter === 'whatsapp') {
        row.style.display = row.querySelector('.contact-badge.whatsapp') ? '' : 'none';
      } else if (filter === 'email') {
        const hasEmail = row.children[3].textContent !== '-';
        row.style.display = hasEmail ? '' : 'none';
      } else if (filter === 'pendiente') {
        const hasEmail = row.children[3].textContent === '-';
        row.style.display = hasEmail ? '' : 'none';
      }
    });
  }

  /* ===================== CALENDARIO ===================== */

  // Navegación del calendario
  if (e.target.closest('#prev-month')) {
    if (window.currentDate) {
      window.currentDate.setMonth(window.currentDate.getMonth() - 1);
      if (window.generateCalendar) window.generateCalendar();
      if (window.renderReminders) window.renderReminders();
    }
  }

  if (e.target.closest('#next-month')) {
    if (window.currentDate) {
      window.currentDate.setMonth(window.currentDate.getMonth() + 1);
      if (window.generateCalendar) window.generateCalendar();
      if (window.renderReminders) window.renderReminders();
    }
  }

  if (e.target.closest('#btn-today')) {
    if (window.currentDate) {
      window.currentDate = new Date();
      if (window.generateCalendar) window.generateCalendar();
      if (window.renderReminders) window.renderReminders();
    }
  }

  // Nuevo recordatorio
  if (e.target.closest('#btn-new-reminder')) {
    const modal = document.getElementById('reminder-modal');
    const form = document.getElementById('reminder-form');
    const title = document.getElementById('modal-title');
    
    if (modal && form && title) {
      form.reset();
      document.getElementById('reminder-id').value = '';
      title.textContent = 'Nuevo Recordatorio';
      
      // Establecer fecha de hoy por defecto
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('reminder-date').value = today;
      
      modal.style.display = 'flex';
    }
  }

  // Cerrar modal
  if (e.target.closest('#modal-close') || e.target.closest('#btn-cancel')) {
    const modal = document.getElementById('reminder-modal');
    if (modal) modal.style.display = 'none';
  }

  // Cerrar modal al hacer click en overlay
  if (e.target.classList.contains('modal-overlay')) {
    const modal = document.getElementById('reminder-modal');
    if (modal) modal.style.display = 'none';
  }

  // Editar recordatorio
  if (e.target.closest('.btn-edit') && document.querySelector('#calendar-grid')) {
    const btn = e.target.closest('.btn-edit');
    const id = parseInt(btn.dataset.id);
    
    if (window.reminders) {
      const reminder = window.reminders.find(r => r.id === id);
      
      if (reminder) {
        const modal = document.getElementById('reminder-modal');
        const title = document.getElementById('modal-title');
        
        if (modal && title) {
          document.getElementById('reminder-id').value = reminder.id;
          document.getElementById('reminder-title').value = reminder.title;
          document.getElementById('reminder-type').value = reminder.type;
          document.getElementById('reminder-date').value = reminder.date;
          document.getElementById('reminder-time').value = reminder.time || '';
          document.getElementById('reminder-description').value = reminder.description || '';
          document.getElementById('reminder-repeat').checked = reminder.repeat || false;
          
          title.textContent = 'Editar Recordatorio';
          modal.style.display = 'flex';
        }
      }
    }
  }

  // Eliminar recordatorio
  if (e.target.closest('.btn-delete') && document.querySelector('#calendar-grid')) {
    const btn = e.target.closest('.btn-delete');
    const id = parseInt(btn.dataset.id);
    
    if (window.reminders) {
      const reminder = window.reminders.find(r => r.id === id);
      
      if (reminder && confirm(`¿Eliminar el recordatorio "${reminder.title}"?`)) {
        window.reminders = window.reminders.filter(r => r.id !== id);
        
        if (window.generateCalendar) window.generateCalendar();
        if (window.renderReminders) window.renderReminders();
        
        alert('Recordatorio eliminado ✅');
      }
    }
  }

  // Filtros de recordatorios
  if (e.target.closest('.filter-btn') && document.querySelector('#calendar-grid')) {
    const filterBtn = e.target.closest('.filter-btn');
    const type = filterBtn.dataset.type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');
    
    if (window.reminders && window.renderReminders) {
      if (type === 'todos') {
        window.selectedDate = null;
        window.renderReminders();
      } else {
        const filtered = window.reminders.filter(r => r.type === type);
        window.renderReminders(filtered);
      }
    }
  }

});

/* ===================== FORMULARIOS ===================== */

pageContent.addEventListener('submit', (e) => {
  // Guardar recordatorio
  if (e.target.id === 'reminder-form') {
    e.preventDefault();
    
    const id = document.getElementById('reminder-id').value;
    const title = document.getElementById('reminder-title').value;
    const type = document.getElementById('reminder-type').value;
    const date = document.getElementById('reminder-date').value;
    const time = document.getElementById('reminder-time').value;
    const description = document.getElementById('reminder-description').value;
    const repeat = document.getElementById('reminder-repeat').checked;
    
    if (window.reminders) {
      if (id) {
        // Editar existente
        const index = window.reminders.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
          window.reminders[index] = {
            ...window.reminders[index],
            title,
            type,
            date,
            time,
            description,
            repeat
          };
          alert('Recordatorio actualizado ✅');
        }
      } else {
        // Crear nuevo
        const newId = Math.max(...window.reminders.map(r => r.id), 0) + 1;
        window.reminders.push({
          id: newId,
          title,
          type,
          date,
          time,
          description,
          repeat
        });
        alert('Recordatorio creado ✅');
      }
      
      if (window.generateCalendar) window.generateCalendar();
      if (window.renderReminders) window.renderReminders();
      
      const modal = document.getElementById('reminder-modal');
      if (modal) modal.style.display = 'none';
    }
  }
});

/* ===================== CAMBIOS ===================== */

pageContent.addEventListener('change', (e) => {
  if (e.target.id === 'report-period') {
    console.log('Periodo cambiado:', e.target.value);
  }
});

/* ===================== BÚSQUEDA ===================== */

pageContent.addEventListener('input', (e) => {
  if (e.target.id === 'search-parents') {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#parents-tbody tr');
    
    rows.forEach(row => {
      const parentName = row.querySelector('.parent-name').textContent.toLowerCase();
      const students = Array.from(row.querySelectorAll('.student-tag'))
        .map(tag => tag.textContent.toLowerCase())
        .join(' ');
      const phone = row.querySelector('.contact-info span').textContent.toLowerCase();
      
      const matches = parentName.includes(searchTerm) || 
                     students.includes(searchTerm) || 
                     phone.includes(searchTerm);
      
      row.style.display = matches ? '' : 'none';
    });
  }
});