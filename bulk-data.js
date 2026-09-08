(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const ENTORNO = new Map([
    ['aguas lindas de goias','águas lindas de goiás'],
    ['cidade ocidental','cidade ocidental'],
    ['cocalzinho de goias','cocalzinho de goiás'],
    ['cristalina','cristalina'],
    ['formosa','formosa'],
    ['luziania','luziânia'],
    ['novo gama','novo gama'],
    ['padre bernardo','padre bernardo'],
    ['planaltina de goias','planaltina de goiás'],
    ['santo antonio do descoberto','santo antônio do descoberto'],
    ['valparaiso de goias','valparaíso de goiás']
  ]);

  const cleanLink = value => norm((value || '').split('?')[0].replace(/\/$/,''));
  const cleanName = value => norm(value).replace(/\b2026\b/g,'').replace(/[:—–-]+/g,' ').replace(/\s+/g,' ').trim();

  function inScope(item) {
    try { if (typeof isDfCity === 'function' && isDfCity(item?.cidade)) return true; } catch {}
    return ENTORNO.has(norm(item?.cidade));
  }

  function mergeTags(base=[], extra=[]) {
    const seen = new Set(), out = [];
    [...base,...extra].forEach(tag => {
      const key = norm(tag);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(tag);
    });
    return out;
  }

  function enrichKnownPlaces(items) {
    const patches = new Map([
      ['l-034-birosca-do-conic', {
        tags:['lgbtqia+','seguro para lgbtqia+','música ao vivo','dançante'],
        descricao:'espaço cultural e casa de festas no conic com música brasileira, samba, hip-hop, funk e programação lgbtqia+.'
      }],
      ['l-026-beirute', {
        tags:['bar','lgbtqia+'],
        descricao:'bar e restaurante histórico de brasília, ligado à memória da cena lgbtqia+ da cidade e ainda citado em guias atuais como ponto gay-friendly.'
      }]
    ]);
    return (items || []).map(item => {
      const patch = patches.get(item.id);
      if (!patch) return item;
      return {...item,...patch,tags:mergeTags(item.tags,patch.tags)};
    });
  }

  function dedupePlaces(items) {
    const ids = new Set(), signatures = new Set();
    return (items || []).filter(item => {
      if (!inScope(item)) return false;
      const id = norm(item.id), signature = `${cleanName(item.nome)}|${norm(item.cidade)}`;
      if ((id && ids.has(id)) || signatures.has(signature)) return false;
      if (id) ids.add(id);
      signatures.add(signature);
      return true;
    });
  }

  function dedupeEvents(items) {
    const ids = new Set(), links = new Set(), signatures = new Set();
    return (items || []).filter(item => {
      if (!inScope(item)) return false;
      const id = norm(item.id), link = cleanLink(item.link);
      const signature = `${cleanName(item.nome)}|${item.dataInicio || ''}|${norm(item.cidade)}`;
      if ((id && ids.has(id)) || (link && links.has(link)) || signatures.has(signature)) return false;
      if (id) ids.add(id);
      if (link) links.add(link);
      signatures.add(signature);
      return true;
    });
  }

  async function fetchJson(path) {
    const response = await fetch(path,{cache:'no-store'});
    if (!response.ok) throw new Error(path);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  function option(value,label) {
    const el = document.createElement('option');
    el.value = value;
    el.textContent = label;
    return el;
  }

  function syncLocationSelect() {
    const page = document.body.dataset.page;
    const select = page === 'eventos' ? document.querySelector('#local') : page === 'lugares' ? document.querySelector('#onde') : null;
    if (!select) return;
    const current = select.value;
    const source = page === 'eventos' ? state.eventos : state.lugares;
    const cities = [...new Set((source || []).map(item => item.cidade).filter(Boolean))];
    const df = cities.filter(city => {
      try { return typeof isDfCity === 'function' && isDfCity(city); } catch { return false; }
    }).map(city => {
      let label = city;
      try { if (typeof dfRaName === 'function') label = dfRaName(city); } catch {}
      return {value:city,label};
    }).sort((a,b) => a.label.localeCompare(b.label,'pt-BR'));

    select.replaceChildren(option('qualquer','qualquer lugar'));
    const dfGroup = document.createElement('optgroup');
    dfGroup.label = 'distrito federal';
    dfGroup.append(option('df','todo o distrito federal'));
    df.forEach(item => dfGroup.append(option(item.value,item.label)));
    select.append(dfGroup);

    const entornoGroup = document.createElement('optgroup');
    entornoGroup.label = 'entorno';
    [...ENTORNO.entries()].sort((a,b) => a[1].localeCompare(b[1],'pt-BR')).forEach(([value,label]) => entornoGroup.append(option(value,label)));
    select.append(entornoGroup);

    const found = [...select.options].find(item => norm(item.value) === norm(current));
    if (found) select.value = found.value;
  }

  function refresh() {
    try {
      if (typeof refreshCurrent === 'function') refreshCurrent();
      else if (document.body.dataset.page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      else if (document.body.dataset.page === 'lugares' && typeof renderLugares === 'function') renderLugares();
      else if (document.body.dataset.page === 'novidades' && typeof renderNovidades === 'function') renderNovidades();
      else if (document.body.dataset.page === 'salvos' && typeof renderSalvos === 'function') renderSalvos();
    } catch (err) { console.warn('não foi possível atualizar os dados extras',err); }
  }

  async function start() {
    const page = document.body.dataset.page;
    if (!['eventos','lugares','novidades','salvos'].includes(page)) return;
    let extraPlaces = [], extraEvents = [];
    try {
      const [places7,places8,events5] = await Promise.all([
        fetchJson('./data/lugares-7.json').catch(() => []),
        fetchJson('./data/lugares-8.json').catch(() => []),
        fetchJson('./data/eventos-5.json').catch(() => [])
      ]);
      extraPlaces = [...places7,...places8];
      extraEvents = events5;
    } catch {}

    let tries = 0;
    const mergeWhenReady = () => {
      try {
        if (typeof state === 'undefined' || !Array.isArray(state.lugares) || !Array.isArray(state.eventos) || !state.lugares.length || !state.eventos.length) {
          if (tries++ < 100) setTimeout(mergeWhenReady,80);
          return;
        }
        state.lugares = dedupePlaces(enrichKnownPlaces([...state.lugares,...extraPlaces]));
        state.eventos = dedupeEvents([...state.eventos,...extraEvents]);
        syncLocationSelect();
        refresh();
        document.dispatchEvent(new CustomEvent('roledfora:data-updated'));
      } catch (err) {
        if (tries++ < 100) setTimeout(mergeWhenReady,80);
        else console.warn('não foi possível juntar os dados extras',err);
      }
    };
    mergeWhenReady();
  }

  document.addEventListener('DOMContentLoaded',start);
})();
