(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const PLACE_FILES = ['./data/lugares-12.json'];

  async function fetchFile(path) {
    try {
      const response = await fetch(path, { cache:'no-store' });
      const data = response.ok ? await response.json() : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async function fetchPlaces() {
    const chunks = await Promise.all(PLACE_FILES.map(fetchFile));
    return chunks.flat();
  }

  function mergePlaces(extra) {
    if (typeof state === 'undefined' || !Array.isArray(state.lugares)) return false;
    const ids = new Set(state.lugares.map(item => norm(item.id)).filter(Boolean));
    const signatures = new Set(state.lugares.map(item => `${norm(item.nome)}|${norm(item.cidade)}`));

    extra.forEach(item => {
      const id = norm(item.id);
      const signature = `${norm(item.nome)}|${norm(item.cidade)}`;
      if ((id && ids.has(id)) || signatures.has(signature)) return;
      state.lugares.push(item);
      if (id) ids.add(id);
      signatures.add(signature);
    });
    return true;
  }

  function refresh() {
    try {
      if (typeof refreshCurrent === 'function') refreshCurrent();
      else if (document.body.dataset.page === 'lugares' && typeof renderLugares === 'function') renderLugares();
      else if (document.body.dataset.page === 'novidades' && typeof renderNovidades === 'function') renderNovidades();
      else if (document.body.dataset.page === 'salvos' && typeof renderSalvos === 'function') renderSalvos();
    } catch {}
  }

  async function start() {
    const extra = await fetchPlaces();
    if (!extra.length) return;

    let tries = 0;
    const apply = () => {
      if (mergePlaces(extra)) {
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
