(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  async function start() {
    let extra = [];
    try {
      const response = await fetch('./data/eventos-14.json', { cache:'no-store' });
      if (response.ok) extra = await response.json();
    } catch {}
    if (!Array.isArray(extra) || !extra.length) return;

    let tries = 0;
    const merge = () => {
      if (typeof state === 'undefined' || !Array.isArray(state.eventos)) {
        if (tries++ < 100) setTimeout(merge, 80);
        return;
      }

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
