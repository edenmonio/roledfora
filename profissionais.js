(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const TYPES = [
    ['arte-ilustracao','arte & ilustração'],
    ['artesanato','artesanato'],
    ['audiovisual','audiovisual'],
    ['cabelo','cabelo'],
    ['dj','djs'],
    ['drag-performance','drag & performance'],
    ['fotografia','fotografia'],
    ['maquiagem','maquiagem'],
    ['moda-customizacao','moda & customização'],
    ['musica','música'],
    ['producao-eventos','produção de eventos'],
    ['tatuagem-piercing','tatuagem & piercing'],
    ['turismo-local','turismo local']
  ];

  let profissionais = [];

  function fillTypes() {
    const select = document.querySelector('#prof-tipo');
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="qualquer">qualquer tipo</option>' + TYPES
      .map(([value,label]) => `<option value="${esc(value)}">${esc(label)}</option>`)
      .join('');
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }

  function typeMatches(item,value) {
    if (!value || value === 'qualquer') return true;
    const itemType = norm(item.tipo || item.categoria);
    const selected = TYPES.find(([id]) => id === value);
    if (!selected) return itemType === norm(value);
    return itemType === norm(selected[0]) || itemType === norm(selected[1]);
  }

  function locationMatches(item,value) {
    if (!value || value === 'qualquer') return true;
    if (window.ROLED_LOCATIONS?.locationMatches) return window.ROLED_LOCATIONS.locationMatches(item.cidade,value);
    return norm(item.cidade) === norm(value);
  }

  function card(item) {
    const type = TYPES.find(([id,label]) => norm(item.tipo || item.categoria) === norm(id) || norm(item.tipo || item.categoria) === norm(label));
    const typeLabel = type?.[1] || item.tipo || item.categoria || 'profissional';
    const location = item.cidade ? `${item.cidade}${item.uf ? ` · ${item.uf}` : ''}` : 'local não informado';
    const link = item.link || item.instagram || item.site;
    return `<article class="card professional-card">
      <span class="card-kind">${esc(typeLabel)}</span>
      <h3>${esc(item.nome)}</h3>
      <div class="card-meta"><p>${esc(location)}</p></div>
      ${item.descricao ? `<p class="desc">${esc(item.descricao)}</p>` : ''}
      ${link ? `<div class="actions"><a href="${esc(link)}" target="_blank" rel="noopener">ver perfil / contato</a></div>` : ''}
    </article>`;
  }

  function render() {
    const local = document.querySelector('#prof-local')?.value || 'qualquer';
    const tipo = document.querySelector('#prof-tipo')?.value || 'qualquer';
    const section = document.querySelector('.search-results-section');
    const target = document.querySelector('#results');
    const count = document.querySelector('#result-count');
    if (!section || !target || !count) return;

    const hasSelection = local !== 'qualquer' || tipo !== 'qualquer';
    section.hidden = !hasSelection;
    if (!hasSelection) return;

    const items = profissionais.filter(item => locationMatches(item,local) && typeMatches(item,tipo));
    count.textContent = `${items.length} ${items.length === 1 ? 'resultado' : 'resultados'}`;
    target.innerHTML = items.length
      ? items.map(card).join('')
      : '<div class="empty-state">ainda não tenho profissionais cadastrados com esses filtros. a base está sendo montada.</div>';
  }

  async function load() {
    try {
      const response = await fetch('./data/profissionais.json',{cache:'no-store'});
      profissionais = response.ok ? await response.json() : [];
      if (!Array.isArray(profissionais)) profissionais = [];
    } catch {
      profissionais = [];
    }
    render();
  }

  document.addEventListener('change',event => {
    if (!event.target.closest('.search-panel select')) return;
    render();
  });

  document.addEventListener('DOMContentLoaded',() => {
    fillTypes();
    window.ROLED_LOCATIONS?.fillLocationSelect(document.querySelector('#prof-local'));
    load();
  });
})();
