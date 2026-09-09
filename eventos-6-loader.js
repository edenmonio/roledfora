(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const EVENT_FILES = ['./data/eventos-6.json','./data/eventos-7.json','./data/eventos-8.json','./data/eventos-9.json','./data/eventos-10.json','./data/eventos-11.json','./data/eventos-12.json'];

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
    return chunks.flat();
  }

  function mergeEvents(extra) {
    if (typeof state === 'undefined' || !Array.isArray(state.eventos)) return false;
    const ids = new Set(state.eventos.map(item => norm(item.id)).filter(Boolean));
    const signatures = new Set(state.eventos.map(item => `${norm(item.nome)}|${item.dataInicio || ''}|${norm(item.cidade)}`));

    extra.forEach(item => {
      const id = norm(item.id);
      const signature = `${norm(item.nome)}|${item.dataInicio || ''}|${norm(item.cidade)}`;
      if ((id && ids.has(id)) || signatures.has(signature)) return;
      state.eventos.push(item);
      if (id) ids.add(id);
      signatures.add(signature);
    });
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

  async function start() {
    const extra = await fetchEvents();
    if (!extra.length) return;

    let tries = 0;
    const apply = () => {
      if (mergeEvents(extra)) {
        refresh();
        document.dispatchEvent(new CustomEvent('roledfora:data-updated'));
        return;
      }
      if (tries++ < 100) setTimeout(apply, 80);
    };
    apply();
  }

  document.addEventListener('DOMContentLoaded', start);
})();