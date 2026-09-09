(() => {
  if (document.body.dataset.page !== 'profissionais') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  let profissionais = new Map();

  function findItem(card) {
    const name = norm(card.querySelector('h3')?.textContent);
    return profissionais.get(name) || null;
  }

  function polishCard(card) {
    const meta = card.querySelector('.card-meta');
    if (!meta) return;

    const item = findItem(card);
    const lines = [...meta.querySelectorAll(':scope > p')];

    const genericService = lines.find(line => line.textContent.trim().startsWith('🛠️'));
    const existingSpecialties = lines.filter(line => line.dataset.profSpecialty === 'true');
    const online = lines.find(line => line.textContent.trim().startsWith('💻'));
    const location = lines.find(line => line.textContent.trim().startsWith('📍'));
    const contact = lines.find(line => line.textContent.trim().startsWith('📱'));

    existingSpecialties.slice(1).forEach(line => line.remove());

    let specialty = existingSpecialties[0] || null;
    if (item?.especialidade) {
      if (!specialty) {
        specialty = document.createElement('p');
        specialty.dataset.profSpecialty = 'true';
      }
      specialty.textContent = `${item.especialidadeEmoji || '👤'} ${item.especialidade.toLocaleLowerCase('pt-BR')}`;
      genericService?.remove();
    } else if (genericService) {
      specialty = genericService;
    }

    [specialty, online || location, online && location ? location : null, contact]
      .filter(Boolean)
      .forEach(line => meta.appendChild(line));

    card.querySelector('.actions')?.remove();
  }

  function polish() {
    document.querySelectorAll('.professional-card').forEach(polishCard);
  }

  async function loadData() {
    try {
      const response = await fetch('./data/profissionais.json', { cache:'no-store' });
      const data = response.ok ? await response.json() : [];
      profissionais = new Map((Array.isArray(data) ? data : []).map(item => [norm(item.nome), item]));
    } catch {
      profissionais = new Map();
    }
    polish();
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
    loadData();
    observer.observe(document.body, { childList:true, subtree:true });
  });
})();