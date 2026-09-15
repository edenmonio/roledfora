(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const canon = value => norm(value).replace(/^\d+\s*(º|ª|o|a)?\s*/, '').replace(/\s+/g, ' ').trim();
  const key = item => `${canon(item?.nome)}|${item?.dataInicio || ''}|${norm(item?.cidade)}`;
  const FILES = ['./data/eventos-14.json','./data/eventos-15.json','./data/eventos-16.json','./data/eventos-17.json','./data/eventos-18.json','./data/eventos-19.json','./data/eventos-20.json','./data/eventos-auto.json','./data/eventos-auto-2026-09-11.json','./data/eventos-auto-2026-09-12.json','./data/eventos-auto-2026-09-13.json','./data/eventos-auto-2026-09-14.json','./data/eventos-auto-2026-09-14-varredura.json','./data/eventos-auto-2026-09-14-atualizacao.json'];
  const REPLACED_IDS = new Set(['ev-2026-encontro-artes-lago-oeste']);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const current = item => { const end = item?.dataFim || item?.dataInicio; return !end || end >= today(); };
  async function start() {
    let extra = [];
    try {
      extra = (await Promise.all(FILES.map(async path => { const r = await fetch(path, { cache:'no-store' }); return r.ok ? r.json() : []; }))).flat().filter(Boolean);
    } catch {}
    let tries = 0;
    const merge = () => {
      if (typeof state === 'undefined' || !Array.isArray(state.eventos)) { if (tries++ < 100) setTimeout(merge, 80); return; }
      const map = new Map();
      const add = item => {
        if (!item || !current(item)) return;
        const k = key(item);
        const old = map.get(k);
        if (!old || (item.adicionadoEm || '') > (old.adicionadoEm || '')) map.set(k, item);
      };
      state.eventos.filter(item => !REPLACED_IDS.has(item.id) && current(item)).forEach(add);
      extra.forEach(add);
      state.eventos = Array.from(map.values());
      try { if (typeof refreshCurrent === 'function') refreshCurrent(); } catch {}
      document.dispatchEvent(new CustomEvent('roledfora:data-updated'));
    };
    merge();
  }
  document.addEventListener('DOMContentLoaded', start);
})();
