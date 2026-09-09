(() => {
  if (document.body.dataset.page !== 'profissionais') return;

  function polishCard(card) {
    const meta = card.querySelector('.card-meta');
    if (!meta) return;

    const lines = [...meta.querySelectorAll(':scope > p')];
    const service = lines.find(line => line.textContent.trim().startsWith('🛠️'));
    const online = lines.find(line => line.textContent.trim().startsWith('💻'));
    const location = lines.find(line => line.textContent.trim().startsWith('📍'));
    const contact = lines.find(line => line.textContent.trim().startsWith('📱'));

    [service, online || location, online && location ? location : null, contact]
      .filter(Boolean)
      .forEach(line => meta.appendChild(line));

    card.querySelector('.actions')?.remove();
  }

  function polish() {
    document.querySelectorAll('.professional-card').forEach(polishCard);
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

  document.addEventListener('DOMContentLoaded', () => {
    polish();
    observer.observe(document.body, { childList:true, subtree:true });
  });
})();
