(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const FILES = ['./data/eventos-14.json','./data/eventos-15.json','./data/eventos-16.json','./data/eventos-17.json','./data/eventos-18.json','./data/eventos-19.json','./data/eventos-20.json'];
  const REPLACED_IDS = new Set(['ev-2026-encontro-artes-lago-oeste']);

  async function start() {
    let extra = [];
    try {
      const chunks = await Promise.all(FILES.map(async path => {
        const response = await fetch(path, { cache:'no-store' });
        return response.ok ? response.json() : [];
      }));
      extra = chunks.flat().filter(Boolean);
    } catch {}
    if (!Array.isArray(extra) || !extra.length) return;

    let tries = 0;
    const merge = () => {
      if (typeof state === 'undefined' || !Array.isArray(state.eventos)) {
        if (tries++ < 100) setTimeout(merge, 80);
        return;
      }

      state.eventos = state.eventos.filter(item => !REPLACED_IDS.has(item.id));
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

      try {
        if (typeof refreshCurrent === 'function') refreshCurrent();
      } catch {}
      document.dispatchEvent(new CustomEvent('roledfora:data-updated'));
    };
    merge();
  }

  document.addEventListener('DOMContentLoaded', start);
})();
