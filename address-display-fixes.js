(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

  function shouldHide(text) {
    const value = norm(text.replace(/^🧭\s*/,''));
    if (!value) return true;
    if (/endereco a confirmar|localizacao a confirmar|a confirmar|nao informado|nao informada|consultar endereco|consultar localizacao/.test(value)) return true;
    return false;
  }

  function polish() {
    document.querySelectorAll('.place-card .card-meta p').forEach(line => {
      const text = line.textContent.trim();
      if (text.startsWith('🧭') && shouldHide(text)) line.remove();
    });
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      polish();
    });
  });

  document.addEventListener('DOMContentLoaded',() => {
    polish();
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
