function cargarPagina(nombre) {
  fetch(`pages/${nombre}.html`).then(r => r.text())
    .then(html => {
      document.getElementById('page-content').innerHTML = html;
      
      // ✅ Remover script anterior completamente
      const oldScript = document.getElementById('page-script');
      if (oldScript) {
        oldScript.remove();
      }

      // ✅ Pequeño delay para asegurar limpieza
      setTimeout(() => {
        const script = document.createElement('script');
        script.src = `js/${nombre}.js?t=${Date.now()}`; // ✅ Cache busting
        script.id = 'page-script';
        script.type = 'module'; // ✅ Importante: usar módulos
        
        document.body.appendChild(script);
      }, 50);
    });
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => {
    const page = item.dataset.page;
    localStorage.setItem('paginaActual', page);
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    cargarPagina(page);
  };
});

const paginaGuardada = localStorage.getItem('paginaActual') || 'estudiantes';

document.querySelectorAll('.nav-item').forEach(item => {
  if (item.dataset.page === paginaGuardada) {
    item.classList.add('active');
  } else {
    item.classList.remove('active');
  }
});

cargarPagina(paginaGuardada);