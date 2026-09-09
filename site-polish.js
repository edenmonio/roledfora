(() => {
  function normalizeNav() {
    document.querySelectorAll('.main-nav').forEach(nav => {
      nav.querySelectorAll('a[href="./index.html"]').forEach(a => a.textContent = 'eventos');
      nav.querySelectorAll('a[href="./lugares.html"]').forEach(a => a.textContent = 'lugares');
    });

    const page = document.body.dataset.page;
    if (page === 'eventos') {
      document.title = 'roledfora — eventos';
      const heading = document.querySelector('.page-intro h2');
      if (heading) heading.textContent = 'eventos pra fazer';
    }
    if (page === 'lugares') {
      document.title = 'roledfora — lugares';
      const heading = document.querySelector('.page-intro h2');
      if (heading) heading.textContent = 'lugares pra conhecer';
    }
    if (page === 'novidades') {
      document.querySelectorAll('.section-title').forEach(title => {
        if (/últimos rolês/i.test(title.textContent)) title.textContent = '🔥 últimos eventos';
      });
    }

    document.querySelectorAll('.utility-nav').forEach(nav => {
      nav.querySelectorAll('a[href="./roteiros.html"]').forEach(a => a.textContent = '🧭 roteiros');
      let contact = nav.querySelector('a[href="./contato.html"]');
      if (!contact) {
        contact = document.createElement('a');
        contact.href = './contato.html';
        nav.append(contact);
      }
      contact.textContent = '💌 contato';
      if (page === 'contato') contact.classList.add('active');
    });
  }

  document.addEventListener('DOMContentLoaded',normalizeNav);
})();
