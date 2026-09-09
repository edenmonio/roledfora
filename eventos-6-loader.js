(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const EVENT_FILES = ['./data/eventos-6.json','./data/eventos-7.json','./data/eventos-8.json','./data/eventos-9.json','./data/eventos-10.json','./data/eventos-11.json','./data/eventos-12.json','./data/eventos-13.json'];

  const CULTURAL_EXCEPTIONS = ['festa junina','sao joao','arraia','quermesse','folia de reis'];
  const DEVOTIONAL_TERMS = [
    'marcha para jesus','culto','missa','evangelizacao','encontro de oracao','grupo de oracao','vigilia',
    'culto de louvor','noite de louvor','momento de adoracao','congresso crist','conferencia crist',
    'congresso evangel','encontro evangel','retiro crist','retiro evangel','retiro catol','shalom para as nacoes'
  ];

  function itemText(item) {
    return norm([
      item?.nome,item?.descricao,item?.local,item?.fonte,item?.link,item?.ingresso,
      ...(Array.isArray(item?.tags) ? item.tags : [])
    ].filter(Boolean).join(' '));
  }

  function isDevotionalChristian(item) {
    const text = itemText(item);
    if (CULTURAL_EXCEPTIONS.some(term => text.includes(term))) return false;
    return DEVOTIONAL_TERMS.some(term => text.includes(term));
  }

  function applyCuration() {
    if (typeof state === 'undefined' || !Array.isArray(state.eventos)) return false;
    const filtered = state.eventos.filter(item => !isDevotionalChristian(item));
    const changed = filtered.length !== state.eventos.length;
    state.eventos = filtered;
    return changed;
  }

  async function fetchFile(path) {
    try {
      const response = await fetch(path, { cache:'no-store' });
      const data = response.ok ? await response.json() : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async function fetchEvents() {
    const chunks = await Promise.all(EVENT_FILES.map(fetchFile));
    return chunks.flat().filter(item => !isDevotionalChristian(item));
  }

  function mergeEvents(extra) {
    if (typeof state === 'undefined' || !Array.isArray(state.eventos)) return false;
    applyCuration();
    const ids = new Set(state.eventos.map(item => norm(item.id)).filter(Boolean));
    const signatures = new Set(state.eventos.map(item => `${norm(item.nome)}|${item.dataInicio || ''}|${norm(item.cidade)}`));

    extra.forEach(item => {
      if (isDevotionalChristian(item)) return;
      const id = norm(item.id);
      const signature = `${norm(item.nome)}|${item.dataInicio || ''}|${norm(item.cidade)}`;
      if ((id && ids.has(id)) || signatures.has(signature)) return;
      state.eventos.push(item);
      if (id) ids.add(id);
      signatures.add(signature);
    });
    applyCuration();
    return true;
  }

  function refresh() {
    try {
      if (typeof refreshCurrent === 'function') refreshCurrent();
      else if (document.body.dataset.page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      else if (document.body.dataset.page === 'novidades' && typeof renderNovidades === 'function') renderNovidades();
      else if (document.body.dataset.page === 'salvos' && typeof renderSalvos === 'function') renderSalvos();
    } catch {}
  }

  function curateAfterUpdate() {
    if (applyCuration()) refresh();
  }

  async function start() {
    const extra = await fetchEvents();

    let tries = 0;
    const apply = () => {
      if (typeof state !== 'undefined' && Array.isArray(state.eventos)) {
        mergeEvents(extra);
        refresh();
        document.dispatchEvent(new CustomEvent('roledfora:data-updated'));
        return;
      }
      if (tries++ < 100) setTimeout(apply, 80);
    };
    apply();
  }

  document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('roledfora:data-updated', curateAfterUpdate);
})();
