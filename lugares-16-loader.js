(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const FILES = ['./data/lugares-16.json','./data/lugares-17.json','./data/lugares-18.json','./data/lugares-19.json'];

  function mergeTags(a, b) {
    return [...new Set([...(a || []), ...(b || [])])];
  }

  function enrich(existing, incoming) {
    const id = existing.id || incoming.id;
    const tags = mergeTags(existing.tags, incoming.tags);
    return { ...existing, ...incoming, id, tags };
  }

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
      if (typeof state === 'undefined' || !Array.isArray(state.lugares)) {
        if (tries++ < 100) setTimeout(merge, 80);
        return;
      }

      extra.forEach(item => {
        const idIndex = item.id ? state.lugares.findIndex(current => norm(current.id) === norm(item.id)) : -1;
        const signatureIndex = state.lugares.findIndex(current => norm(current.nome) === norm(item.nome) && norm(current.cidade) === norm(item.cidade));
        const index = idIndex >= 0 ? idIndex : signatureIndex;
        if (index >= 0) state.lugares[index] = enrich(state.lugares[index], item);
        else state.lugares.push(item);
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
