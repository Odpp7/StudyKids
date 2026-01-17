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
    document.querySelectorAll('.nav-item').forEach(navitem => navitem.classList.remove('active'));
    item.classList.add('active');
    cargarPagina(item.dataset.page);
  };
});

cargarPagina('estudiantes');