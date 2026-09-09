(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const ras = [
    ['brasilia','plano piloto'],
    ['gama','gama'],
    ['taguatinga','taguatinga'],
    ['brazlandia','brazlândia'],
    ['sobradinho','sobradinho'],
    ['planaltina-df','planaltina'],
    ['paranoa','paranoá'],
    ['nucleo bandeirante','núcleo bandeirante'],
    ['ceilandia','ceilândia'],
    ['guara','guará'],
    ['cruzeiro','cruzeiro'],
    ['samambaia','samambaia'],
    ['santa maria','santa maria'],
    ['sao sebastiao','são sebastião'],
    ['recanto das emas','recanto das emas'],
    ['lago sul','lago sul'],
    ['riacho fundo','riacho fundo'],
    ['lago norte','lago norte'],
    ['candangolandia','candangolândia'],
    ['aguas claras','águas claras'],
    ['riacho fundo ii','riacho fundo ii'],
    ['sudoeste/octogonal','sudoeste/octogonal'],
    ['varjao','varjão'],
    ['park way','park way'],
    ['scia/estrutural','scia/estrutural'],
    ['sobradinho ii','sobradinho ii'],
    ['jardim botanico','jardim botânico'],
    ['itapoa','itapoã'],
    ['sia','sia'],
    ['vicente pires','vicente pires'],
    ['fercal','fercal'],
    ['sol nascente/por do sol','sol nascente/pôr do sol'],
    ['arniqueira','arniqueira'],
    ['arapoanga','arapoanga'],
    ['agua quente','água quente'],
    ['ponte alta','ponte alta'],
    ['26 de setembro','26 de setembro']
  ];

  const entorno = [
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
  ];

  const raMap = new Map(ras);
  const entornoMap = new Map(entorno);
  const aliases = new Map([
    ['df','ra não informada'],
    ['planaltina','planaltina'],
    ['estrutural','scia/estrutural'],
    ['sol nascente','sol nascente/pôr do sol'],
    ['por do sol','sol nascente/pôr do sol'],
    ['lago oeste','sobradinho']
  ]);

  const option = (value,label) => {
    const el = document.createElement('option');
    el.value = value;
    el.textContent = label;
    return el;
  };

  function fillLocationSelect(select) {
    if (!select) return;
    const current = select.value;
    select.replaceChildren(option('qualquer','qualquer lugar'));

    const dfGroup = document.createElement('optgroup');
    dfGroup.label = 'distrito federal';
    dfGroup.append(option('df','todo o distrito federal'));
    [...ras].sort((a,b) => a[1].localeCompare(b[1],'pt-BR')).forEach(([value,label]) => dfGroup.append(option(value,label)));
    select.append(dfGroup);

    const entornoGroup = document.createElement('optgroup');
    entornoGroup.label = 'entorno';
    entornoGroup.append(option('entorno','todo o entorno'));
    [...entorno].sort((a,b) => a[1].localeCompare(b[1],'pt-BR')).forEach(([value,label]) => entornoGroup.append(option(value,label)));
    select.append(entornoGroup);

    const found = [...select.options].find(item => norm(item.value) === norm(current));
    if (found) select.value = found.value;
  }

  function isDfValue(value) {
    const v = norm(value);
    return raMap.has(v) || aliases.has(v);
  }

  function raLabel(value) {
    const v = norm(value);
    return raMap.get(v) || aliases.get(v) || value || '';
  }

  function locationMatches(city,value) {
    if (!value || value === 'qualquer') return true;
    const c = norm(city), v = norm(value);
    if (v === 'df') return isDfValue(c);
    if (v === 'entorno' || v === 'entorno-sul' || v === 'entorno-norte' || v === 'goias') return entornoMap.has(c);
    if (v === 'planaltina-df') return c === 'planaltina-df' || c === 'planaltina';
    if (v === 'scia/estrutural') return c === 'scia/estrutural' || c === 'estrutural';
    if (v === 'sol nascente/por do sol') return ['sol nascente/por do sol','sol nascente','por do sol'].includes(c);
    return c === v;
  }

  window.ROLED_LOCATIONS = { ras, entorno, fillLocationSelect, locationMatches, isDfValue, raLabel };

  try { window.isDfCity = city => isDfValue(city); } catch {}
  try {
    window.dfRaName = itemOrCity => {
      const item = typeof itemOrCity === 'object' ? itemOrCity : {cidade:itemOrCity};
      if (item?.ra) return item.ra;
      return raLabel(item?.cidade);
    };
  } catch {}
  try { window.cityMatches = locationMatches; } catch {}
  try { window.populateCitySelect = select => fillLocationSelect(select); } catch {}

  function syncAll() {
    fillLocationSelect(document.querySelector('#local'));
    fillLocationSelect(document.querySelector('#onde'));
    fillLocationSelect(document.querySelector('#prof-local'));
  }

  document.addEventListener('DOMContentLoaded',syncAll);
  document.addEventListener('roledfora:data-updated',syncAll);
})();
