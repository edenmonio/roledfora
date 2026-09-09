(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const DF_RAS = new Map([
    ['brasilia','plano piloto'],['gama','gama'],['taguatinga','taguatinga'],['brazlandia','brazlândia'],['sobradinho','sobradinho'],['planaltina-df','planaltina'],['paranoa','paranoá'],['nucleo bandeirante','núcleo bandeirante'],['ceilandia','ceilândia'],['guara','guará'],['cruzeiro','cruzeiro'],['samambaia','samambaia'],['santa maria','santa maria'],['sao sebastiao','são sebastião'],['recanto das emas','recanto das emas'],['lago sul','lago sul'],['riacho fundo','riacho fundo'],['lago norte','lago norte'],['candangolandia','candangolândia'],['aguas claras','águas claras'],['riacho fundo ii','riacho fundo ii'],['sudoeste/octogonal','sudoeste/octogonal'],['varjao','varjão'],['park way','park way'],['scia/estrutural','scia/estrutural'],['sobradinho ii','sobradinho ii'],['jardim botanico','jardim botânico'],['itapoa','itapoã'],['sia','sia'],['vicente pires','vicente pires'],['fercal','fercal'],['sol nascente/por do sol','sol nascente/pôr do sol'],['arniqueira','arniqueira'],['arapoanga','arapoanga'],['agua quente','água quente'],['ponte alta','ponte alta'],['26 de setembro','26 de setembro']
  ]);

  const DF_ALIASES = new Map([
    ['df','ra não informada'],['lago oeste','sobradinho'],['planaltina','planaltina'],['estrutural','scia/estrutural'],['sol nascente','sol nascente/pôr do sol'],['por do sol','sol nascente/pôr do sol']
  ]);

  const ENTORNO = new Map([
    ['aguas lindas de goias','águas lindas de goiás'],['cidade ocidental','cidade ocidental'],['cocalzinho de goias','cocalzinho de goiás'],['cristalina','cristalina'],['formosa','formosa'],['luziania','luziânia'],['novo gama','novo gama'],['padre bernardo','padre bernardo'],['planaltina de goias','planaltina de goiás'],['santo antonio do descoberto','santo antônio do descoberto'],['valparaiso de goias','valparaíso de goiás']
  ]);

  const cleanLink = value => norm((value || '').split('?')[0].replace(/\/$/,''));
  const cleanName = value => norm(value).replace(/\b2026\b/g,'').replace(/[:—–-]+/g,' ').replace(/\s+/g,' ').trim();
  const isDfValue = value => DF_RAS.has(norm(value)) || DF_ALIASES.has(norm(value));
  const raLabel = value => DF_RAS.get(norm(value)) || DF_ALIASES.get(norm(value)) || value || '';

  try { isDfCity = city => isDfValue(city); } catch {}
  try {
    dfRaName = itemOrCity => {
      const item = typeof itemOrCity === 'object' ? itemOrCity : {cidade:itemOrCity};
      if (item?.ra) return item.ra;
      return raLabel(item?.cidade);
    };
  } catch {}
  try {
    cityMatches = (city,value) => {
      if (!value || value === 'qualquer') return true;
      const c = norm(city), v = norm(value);
      if (v === 'df') return isDfValue(c);
      if (v === 'entorno' || v === 'entorno-sul' || v === 'entorno-norte' || v === 'goias') return ENTORNO.has(c);
      if (v === 'planaltina-df') return c === 'planaltina-df' || c === 'planaltina';
      if (v === 'scia/estrutural') return c === 'scia/estrutural' || c === 'estrutural';
      if (v === 'sol nascente/por do sol') return ['sol nascente/por do sol','sol nascente','por do sol'].includes(c);
      return c === v;
    };
  } catch {}

  function inScope(item) { return isDfValue(item?.cidade) || ENTORNO.has(norm(item?.cidade)); }
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
      ['l-034-birosca-do-conic',{tags:['lgbtqia+','seguro para lgbtqia+','música ao vivo','dançante'],descricao:'espaço cultural e casa de festas no conic com música brasileira, samba, hip-hop, funk e programação lgbtqia+.'}],
      ['l-026-beirute',{tags:['bar','lgbtqia+'],descricao:'bar e restaurante histórico de brasília, ligado à memória da cena lgbtqia+ da cidade e ainda citado em guias atuais como ponto gay-friendly.'}]
    ]);
    return (items || []).map(item => {
      const patch = patches.get(item.id);
      return patch ? {...item,...patch,tags:mergeTags(item.tags,patch.tags)} : {...item};
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
      const id = norm(item.id), link = cleanLink(item.link), signature = `${cleanName(item.nome)}|${item.dataInicio || ''}|${norm(item.cidade)}`;
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
    select.replaceChildren(option('qualquer','qualquer lugar'));
    const dfGroup = document.createElement('optgroup');
    dfGroup.label = 'distrito federal';
    dfGroup.append(option('df','todo o distrito federal'));
    [...DF_RAS.entries()].sort((a,b) => a[1].localeCompare(b[1],'pt-BR')).forEach(([value,label]) => dfGroup.append(option(value,label)));
    select.append(dfGroup);
    const entornoGroup = document.createElement('optgroup');
    entornoGroup.label = 'entorno';
    entornoGroup.append(option('entorno','todo o entorno'));
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
      const [places7,places8,places9,places10,places11,events5] = await Promise.all([
        fetchJson('./data/lugares-7.json').catch(() => []),
        fetchJson('./data/lugares-8.json').catch(() => []),
        fetchJson('./data/lugares-9.json').catch(() => []),
        fetchJson('./data/lugares-10.json').catch(() => []),
        fetchJson('./data/lugares-11.json').catch(() => []),
        fetchJson('./data/eventos-5.json').catch(() => [])
      ]);
      extraPlaces = [...places7,...places8,...places9,...places10,...places11];
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
