console.log('Calendario cargado');

// Estado del calendario - EXPORTAR AL SCOPE GLOBAL
window.currentDate = new Date();
window.selectedDate = null;
window.reminders = [
  // Datos de ejemplo - en producción vendrían de una base de datos
  {
    id: 1,
    title: 'Cumpleaños de María Alejandra González',
    type: 'cumpleaños',
    date: '2025-01-15',
    time: '',
    description: '',
    repeat: true
  },
  {
    id: 2,
    title: 'Cumpleaños de Juan Carlos Ramírez',
    type: 'cumpleaños',
    date: '2025-01-20',
    time: '',
    description: '',
    repeat: true
  },
  {
    id: 3,
    title: 'Día de la Educación - Actividad Especial',
    type: 'evento',
    date: '2025-01-23',
    time: '10:00',
    description: 'Preparar materiales y decoración para celebración',
    repeat: false
  },
  {
    id: 4,
    title: 'Cumpleaños de Sofía Martínez',
    type: 'cumpleaños',
    date: '2025-01-25',
    time: '',
    description: '',
    repeat: true
  },
  {
    id: 5,
    title: 'Recordatorio: Pagos del mes',
    type: 'pago',
    date: '2025-01-31',
    time: '09:00',
    description: 'Verificar pagos pendientes del mes',
    repeat: false
  }
];

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Generar calendario - EXPORTAR AL SCOPE GLOBAL
window.generateCalendar = function() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Headers de días
  diasSemana.forEach(dia => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = dia;
    grid.appendChild(header);
  });
  
  const year = window.currentDate.getFullYear();
  const month = window.currentDate.getMonth();
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1).getDay();
  
  // Último día del mes
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  // Último día del mes anterior
  const prevLastDate = new Date(year, month, 0).getDate();
  
  // Días del mes anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement('div');
    day.className = 'calendar-day inactive';
    day.textContent = prevLastDate - i;
    grid.appendChild(day);
  }
  
  // Días del mes actual
  const today = new Date();
  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = i;
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    
    // Marcar día actual
    if (year === today.getFullYear() && 
        month === today.getMonth() && 
        i === today.getDate()) {
      day.classList.add('today');
    }
    
    // Marcar días con recordatorios
    const hasReminder = window.reminders.some(r => r.date === dateStr);
    if (hasReminder) {
      day.classList.add('has-reminder');
      const dot = document.createElement('span');
      dot.className = 'reminder-dot';
      day.appendChild(dot);
    }
    
    // Click en día
    day.addEventListener('click', () => {
      window.selectedDate = dateStr;
      window.filterRemindersByDate(dateStr);
      
      // Actualizar selección visual
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      if (!day.classList.contains('today')) {
        day.classList.add('selected');
      }
    });
    
    grid.appendChild(day);
  }
  
  // Días del mes siguiente
  const remainingDays = 42 - (firstDay + lastDate);
  for (let i = 1; i <= remainingDays; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day inactive';
    day.textContent = i;
    grid.appendChild(day);
  }
  
  // Actualizar título
  const title = document.getElementById('current-month');
  if (title) {
    title.textContent = `${meses[month]} ${year}`;
  }
}

// Renderizar lista de recordatorios - EXPORTAR AL SCOPE GLOBAL
window.renderReminders = function(filteredReminders = null) {
  const list = document.getElementById('reminders-list');
  const emptyState = document.getElementById('empty-state');
  
  if (!list || !emptyState) return;
  
  const remindersList = filteredReminders || window.reminders;
  
  if (remindersList.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  list.style.display = 'flex';
  emptyState.style.display = 'none';
  list.innerHTML = '';
  
  // Agrupar por fecha
  const grouped = {};
  remindersList.forEach(reminder => {
    if (!grouped[reminder.date]) {
      grouped[reminder.date] = [];
    }
    grouped[reminder.date].push(reminder);
  });
  
  // Ordenar fechas
  const sortedDates = Object.keys(grouped).sort();
  
  sortedDates.forEach(date => {
    const dateGroup = document.createElement('div');
    dateGroup.className = 'date-group';
    
    const header = document.createElement('div');
    header.className = 'date-group-header';
    
    const reminderDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reminderDate.getTime() === today.getTime()) {
      header.classList.add('today-header');
    }
    
    const badge = document.createElement('span');
    badge.className = 'date-badge';
    badge.textContent = reminderDate.getTime() === today.getTime() ? 'HOY' : 
                       reminderDate.getDate() + ' ' + meses[reminderDate.getMonth()].substring(0, 3).toUpperCase();
    
    const dateText = document.createElement('span');
    dateText.className = 'date-text';
    const diasSemanaFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    dateText.textContent = `${diasSemanaFull[reminderDate.getDay()]}, ${reminderDate.getDate()} de ${meses[reminderDate.getMonth()]}`;
    
    header.appendChild(badge);
    header.appendChild(dateText);
    dateGroup.appendChild(header);
    
    // Renderizar recordatorios de esta fecha
    grouped[date].forEach(reminder => {
      const item = createReminderElement(reminder);
      dateGroup.appendChild(item);
    });
    
    list.appendChild(dateGroup);
  });
  
  window.updateStats();
}

// Crear elemento de recordatorio - EXPORTAR AL SCOPE GLOBAL
window.createReminderElement = function(reminder) {
  const item = document.createElement('div');
  item.className = 'reminder-item';
  item.setAttribute('data-type', reminder.type);
  item.setAttribute('data-id', reminder.id);
  
  const iconClass = {
    'cumpleaños': 'birthday',
    'evento': 'event',
    'pago': 'payment',
    'otro': 'other'
  }[reminder.type];
  
  const iconEmoji = {
    'cumpleaños': '🎂',
    'evento': '🎉',
    'pago': '💰',
    'otro': '📌'
  }[reminder.type];
  
  item.innerHTML = `
    <div class="reminder-icon ${iconClass}">${iconEmoji}</div>
    <div class="reminder-content">
      <div class="reminder-title">${reminder.title}</div>
      <div class="reminder-meta">
        <span class="reminder-time">${reminder.time || 'Todo el día'}</span>
        <span class="reminder-category">${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}</span>
      </div>
      ${reminder.description ? `<div class="reminder-description">${reminder.description}</div>` : ''}
    </div>
    <div class="reminder-actions">
      <button class="action-btn btn-edit" data-id="${reminder.id}" title="Editar">✏️</button>
      <button class="action-btn btn-delete" data-id="${reminder.id}" title="Eliminar">🗑️</button>
    </div>
  `;
  
  return item;
}

// Filtrar por fecha - EXPORTAR AL SCOPE GLOBAL
window.filterRemindersByDate = function(date) {
  const filtered = window.reminders.filter(r => r.date === date);
  window.renderReminders(filtered.length > 0 ? filtered : null);
}

// Actualizar estadísticas - EXPORTAR AL SCOPE GLOBAL
window.updateStats = function() {
  const currentMonth = window.currentDate.getMonth();
  const currentYear = window.currentDate.getFullYear();
  
  const thisMonthReminders = window.reminders.filter(r => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const birthdays = thisMonthReminders.filter(r => r.type === 'cumpleaños').length;
  const events = thisMonthReminders.filter(r => r.type === 'evento').length;
  const payments = thisMonthReminders.filter(r => r.type === 'pago').length;
  
  const statBirthdays = document.getElementById('stat-birthdays');
  const statEvents = document.getElementById('stat-events');
  const statPayments = document.getElementById('stat-payments');
  const statTotal = document.getElementById('stat-total');
  
  if (statBirthdays) statBirthdays.textContent = birthdays;
  if (statEvents) statEvents.textContent = events;
  if (statPayments) statPayments.textContent = payments;
  if (statTotal) statTotal.textContent = window.reminders.length;
}

// Inicializar cuando se carga la página
setTimeout(() => {
  window.generateCalendar();
  window.renderReminders();
  window.updateStats();
}, 100);