(() => {
  function normalizeNav() {
    document.querySelectorAll('.main-nav').forEach(nav => {
      nav.querySelectorAll('a[href="./index.html"]').forEach(a => a.textContent = 'eventos');
      nav.querySelectorAll('a[href="./lugares.html"]').forEach(a => a.textContent = 'lugares');
    });

    document.querySelectorAll('.utility-nav').forEach(nav => {
      nav.querySelectorAll('a[href="./roteiros.html"]').forEach(a => a.textContent = '🧭 roteiros');
      let contact = nav.querySelector('a[href="./contato.html"]');
      if (!contact) {
        contact = document.createElement('a');
        contact.href = './contato.html';
        nav.append(contact);
      }
      contact.textContent = '💌 contato';
      if (document.body.dataset.page === 'contato') contact.classList.add('active');
    });
  }

  document.addEventListener('DOMContentLoaded',normalizeNav);
})();
