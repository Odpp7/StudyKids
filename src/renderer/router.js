function cargarPagina(nombre) {
  fetch(`pages/${nombre}.html`).then(r => r.text())
    .then(html => {
      document.getElementById('page-content').innerHTML = html;
      
      const oldScript = document.getElementById('page-script');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.src = `js/${nombre}.js`;
      script.id = 'page-script';
      script.defer = true;

      document.body.appendChild(script);
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
