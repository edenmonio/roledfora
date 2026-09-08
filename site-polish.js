(() => {
  function normalizeNav() {
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
