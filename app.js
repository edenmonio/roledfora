const DATA = {
  lugares: [
    './data/lugares-1.json','./data/lugares-2.json','./data/lugares-3.json',
    './data/lugares-4.json','./data/lugares-5.json','./data/lugares-6.json'
  ],
  eventos: ['./data/eventos-1.json','./data/eventos-2.json','./data/eventos-3.json']
};

const EVENT_CATEGORIES = {
  'festas-noite': { label:'festas & noite', emoji:'🎉' },
  'shows-musica': { label:'shows & música', emoji:'🎵' },
  'cultura-artes': { label:'cultura & artes', emoji:'🎭' },
  'feiras-brechos': { label:'feiras & brechós', emoji:'🛍️' },
  'gastronomia': { label:'gastronomia', emoji:'🍴' },
  'geek': { label:'geek', emoji:'👾' },
  'cursos-atividades': { label:'cursos & atividades', emoji:'🧠' },
  'ao-ar-livre': { label:'ao ar livre', emoji:'🌿' }
};

const PLACE_CATEGORIES = {
  'cultura-historia': { label:'cultura & história', emoji:'🏛️' },
  'natureza': { label:'natureza', emoji:'🌳' },
  'arquitetura-turismo': { label:'arquitetura & pontos turísticos', emoji:'🏙️' },
  'comer': { label:'comer', emoji:'🍽️' },
  'bares-noite': { label:'bares & noite', emoji:'🍸' },
  'cinema-teatro': { label:'cinema & teatro', emoji:'🎬' },
  'feiras-compras': { label:'feiras & compras', emoji:'🛍️' },
  'lazer-experiencias': { label:'lazer & experiências', emoji:'🎟️' },
  'cidades-destinos': { label:'cidades & destinos', emoji:'🏘️' }
};

const VISIBLE_TAGS = {
  'manha': { label:'manhã', emoji:'🌅', group:'horario' },
  'tarde': { label:'tarde', emoji:'☀️', group:'horario' },
  'noite': { label:'noite', emoji:'🌆', group:'horario' },
  'madrugada': { label:'madrugada', emoji:'🌙', group:'horario' },
  'gratuito': { label:'gratuito', emoji:'🆓', group:'entrada' },
  'pago': { label:'pago', emoji:'💳', group:'entrada' },
  'gratuito-reserva': { label:'gratuito com retirada/reserva', emoji:'🎟️', group:'entrada' },
  'inscricao': { label:'inscrição obrigatória', emoji:'📝', group:'entrada' },
  'cortesia': { label:'cortesia', emoji:'🎁', group:'entrada' },
  'contribuicao': { label:'contribuição voluntária', emoji:'💰', group:'entrada' },
  'acessivel': { label:'acessível', emoji:'♿', group:'estrutura' },
  'aceita-pets': { label:'aceita pets', emoji:'🐾', group:'estrutura' },
  'bom-criancas': { label:'bom para crianças', emoji:'🧸', group:'estrutura' },
  'opcao-vegana': { label:'opção vegana', emoji:'🌱', group:'estrutura' },
  'opcao-vegetariana': { label:'opção vegetariana', emoji:'🥬', group:'estrutura' },
  'metro-proximo': { label:'metrô próximo', emoji:'🚇', group:'acesso' },
  'bicicleta': { label:'acesso de bicicleta', emoji:'🚲', group:'acesso' },
  'estacionamento': { label:'estacionamento', emoji:'🅿️', group:'acesso' },
  'carro-recomendado': { label:'carro recomendado', emoji:'🚗', group:'acesso' },
  'estrada-terra': { label:'estrada de terra', emoji:'🛣️', group:'acesso' },
  'infantil': { label:'infantil', emoji:'🧒', group:'publico' },
  'familias': { label:'para famílias', emoji:'👨‍👩‍👧', group:'publico' },
  'jovens': { label:'jovens', emoji:'🧑‍🎓', group:'publico' },
  '18mais': { label:'18+', emoji:'🔞', group:'publico' },
  'universitario': { label:'universitário', emoji:'🎓', group:'publico' },
  'lgbtqia': { label:'lgbtqia+', emoji:'🌈', group:'publico' },
  '60mais': { label:'60+', emoji:'👵', group:'publico' },
  'date': { label:'bom para date', emoji:'💞', group:'vibe' },
  'sozinho': { label:'bom para ir sozinho', emoji:'👤', group:'vibe' },
  'tranquilo': { label:'tranquilo', emoji:'😌', group:'vibe' },
  'dancante': { label:'dançante', emoji:'💃', group:'vibe' },
  'alternativo': { label:'alternativo', emoji:'✨', group:'vibe' },
  'ao-ar-livre': { label:'ao ar livre', emoji:'🌿', group:'experiencia' },
  'musica-vivo': { label:'música ao vivo', emoji:'🎵', group:'experiencia' },
  'aventura': { label:'aventura / trilha', emoji:'🥾', group:'experiencia' },
  'agua': { label:'água', emoji:'💦', group:'experiencia' },
  'por-do-sol': { label:'pôr do sol', emoji:'🌇', group:'experiencia' }
};

const DF_CITIES = new Set([
  'brasilia','df','aguas claras','arniqueira','brazlandia','ceilandia','cruzeiro','gama','guara','itapoa','lago norte','lago sul','lago oeste',
  'nucleo bandeirante','paranoa','planaltina-df','recanto das emas','riacho fundo','samambaia','santa maria','sao sebastiao','sobradinho',
  'sudoeste/octogonal','taguatinga','vicente pires'
]);
const ENTORNO_SUL = new Set(['valparaiso de goias','novo gama','cidade ocidental','luziania']);
const ENTORNO_NORTE = new Set(['planaltina de goias','formosa','aguas lindas de goias','santo antonio do descoberto']);

const PLACE_OVERRIDES = {
  'l-042-cine-brasilia': {
    tags:['cinema','cultura','arquitetura'],
    bairro:'asa sul', ra:'plano piloto',
    endereco:'entrequadra sul 106/107, asa sul, brasília - df, 70345-400',
    preco:'varia conforme sessão', precoFaixa:'nao-informado',
    descricao:'cinema histórico da asa sul e uma das principais referências do audiovisual brasiliense; recebe mostras, festivais e sessões comerciais.',
    fonte:'https://cinebrasilia.com/', verificadoEm:'2026-09-08', adicionadoEm:'2026-09-08'
  },
  'l-059-cine-drive-in': {
    tags:['cinema','date diferente','ao ar livre'],
    bairro:'plano piloto', ra:'plano piloto',
    endereco:'srpn trecho 1, plano piloto, brasília - df, 70297-400',
    preco:'varia conforme sessão', precoFaixa:'nao-informado',
    descricao:'o cine drive-in de brasília: filme visto do carro, com som sintonizado por rádio e programação própria.',
    fonte:'https://cinedrivein.com/', verificadoEm:'2026-09-08', adicionadoEm:'2026-09-08'
  },
  'l-133-adelia-padaria': {
    bairro:'asa norte', ra:'plano piloto',
    endereco:'shcgn 714/715, asa norte, brasília - df, 70761-650'
  },
  'l-170-rio-quente-hot-park': { tags:['parque aquático','águas termais','viagem','família'] },
  'l-160-vila-de-sao-jorge': { tags:['vila','chapada','cidade','natureza','viagem'] },
  'l-159-alto-paraiso-de-goias': { tags:['cidade','chapada','natureza','viagem'] }
};

let state = { lugares: [], eventos: [], visible: 18, filtered: [] };

const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const hasAny = (set, values) => values.some(v => set.has(norm(v)));

async function loadMany(paths) {
  const chunks = await Promise.all(paths.map(path => fetch(path).then(r => {
    if (!r.ok) throw new Error(path);
    return r.json();
  })));
  return chunks.flat();
}

function mergePlaceOverrides(items) {
  return items.map(item => {
    const over = PLACE_OVERRIDES[item.id];
    if (!over) return item;
    return { ...item, ...over, tags:[...new Set([...(item.tags||[]),...(over.tags||[])])] };
  });
}

function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return new Set(); }
}
function writeSet(key, set) { localStorage.setItem(key, JSON.stringify([...set])); }
function itemKey(kind, id) { return `${kind}:${id}`; }

function categoryInfo(kind, item) {
  const id = kind === 'event' ? canonicalEventCategory(item) : canonicalPlaceCategory(item);
  const data = kind === 'event' ? EVENT_CATEGORIES[id] : PLACE_CATEGORIES[id];
  return { id, ...(data || { label:'outros', emoji:'📍' }) };
}

function canonicalEventCategory(item) {
  const c = norm(item.categoria);
  const tags = new Set((item.tags||[]).map(norm));
  const text = norm(`${item.nome||''} ${item.descricao||''}`);

  if (c==='ao ar livre' || hasAny(tags,['corrida','caminhada','ao ar livre','trilha','trilhas'])) return 'ao-ar-livre';
  if (c==='nerd/geek' || hasAny(tags,['nerd/geek','games','quadrinhos','rpg','mangá','tecnologia'])) return 'geek';
  if (c==='gastronomia' || hasAny(tags,['gastronomia','comer','restaurante','café'])) return 'gastronomia';
  if (c==='feira' || c==='brechó' || hasAny(tags,['feira','brechó','economia criativa','design independente'])) return 'feiras-brechos';
  if (c==='cinema' || c==='teatro' || c==='exposição' || hasAny(tags,['cinema','teatro','exposição','arte','ilustração'])) return 'cultura-artes';
  if (c==='show' || hasAny(tags,['show','música','música ao vivo','mpb','rock','pop','forró','piseiro','eletrônica','house'])) return 'shows-musica';
  if (c==='festa' || c==='barzinho' || c==='karaokê' || hasAny(tags,['festa','balada','dançante','karaokê','bar','madrugada'])) return 'festas-noite';
  if (c==='workshop/curso' || c==='universitário' || hasAny(tags,['workshop','oficina','oficinas','curso','palestra','palestras'])) return 'cursos-atividades';
  if (c==='lgbtqia+') {
    if (hasAny(tags,['festa','balada','dançante','bar'])) return 'festas-noite';
    if (hasAny(tags,['show','música','música ao vivo'])) return 'shows-musica';
    if (hasAny(tags,['feira','brechó'])) return 'feiras-brechos';
    if (hasAny(tags,['cinema','teatro','exposição','arte'])) return 'cultura-artes';
  }
  if (/corrida|caminhada|parque|trilha/.test(text)) return 'ao-ar-livre';
  return 'cursos-atividades';
}

function canonicalPlaceCategory(item) {
  const c = norm(item.categoria);
  const tags = new Set((item.tags||[]).map(norm));
  const name = norm(item.nome);

  if (['cinemas','teatros'].includes(c) || hasAny(tags,['cinema','teatro']) || name.includes('cine ') || name.includes('teatro')) return 'cinema-teatro';
  if (['cafés','restaurantes'].includes(c)) return 'comer';
  if (c==='noite' || c==='bares e noite' || hasAny(tags,['bar','balada','karaokê'])) return 'bares-noite';
  if (['cachoeiras','parques e natureza'].includes(c)) return 'natureza';
  if (c==='parques aquáticos' || c==='experiências') return 'lazer-experiencias';
  if (c==='arquitetura') return 'arquitetura-turismo';
  if (c==='cultura e museus') return 'cultura-historia';
  if (c==='bate-volta' || c==='cidades & chapada' || hasAny(tags,['cidade','cidade histórica','vila','chapada','conhecer a cidade'])) return 'cidades-destinos';
  if (c==='feiras e garimpo') {
    if (hasAny(tags,['comer','restaurante','café','padaria'])) return 'comer';
    return 'feiras-compras';
  }
  if (c==='passeios locais') {
    if (hasAny(tags,['natureza','parque','lago','trilha','cachoeira'])) return 'natureza';
    if (hasAny(tags,['arquitetura','turistando','mirante','vista'])) return 'arquitetura-turismo';
    return 'cultura-historia';
  }
  if (hasAny(tags,['shopping','compras','feira'])) return 'feiras-compras';
  if (hasAny(tags,['parque aquático','experiência','arvorismo','tirolesa','boliche'])) return 'lazer-experiencias';
  if (hasAny(tags,['cachoeira','cachoeiras','natureza','trilha','parque','lago','poços','caverna','cavernas'])) return 'natureza';
  if (hasAny(tags,['arquitetura','turistando','mirante'])) return 'arquitetura-turismo';
  if (hasAny(tags,['comer','café','doce','padaria','pizza','hambúrguer','sushi','vinho','restaurante'])) return 'comer';
  return 'cultura-historia';
}

function formatDateRange(item) {
  if (!item.dataInicio) return '';
  const f = iso => new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'})
    .format(new Date(`${iso}T12:00:00Z`)).replace('.','');
  if (!item.dataFim || item.dataFim===item.dataInicio) return f(item.dataInicio);
  return `${f(item.dataInicio)} a ${f(item.dataFim)}`;
}

function rawTagSet(item) { return new Set((item.tags||[]).map(norm)); }

function eventTimeTag(item) {
  const text = norm(`${item.horario||''} ${(item.tags||[]).join(' ')}`);
  if (text.includes('madrugada')) return 'madrugada';
  const hours = [...(item.horario||'').matchAll(/\b(\d{1,2})(?::\d{2})?h?/g)]
    .map(m=>Number(m[1])).filter(h=>h>=0&&h<=23);
  const start = hours[0];
  if (start===undefined) return null;
  if (start<6) return 'madrugada';
  if (start<12) return 'manha';
  if (start<18) return 'tarde';
  return 'noite';
}

function entryTag(item) {
  const text = norm(`${item.preco||''} ${item.ingresso||''}`);
  if (text.includes('cortesia')) return 'cortesia';
  if (text.includes('contribui')) return 'contribuicao';
  if (text.includes('inscri') && (text.includes('obrig') || text.includes('necess') || text.includes('gratuit'))) return 'inscricao';
  const free = item.precoFaixa==='gratis' || text.includes('gratuit') || text.includes('entrada franca') || /^r\$?\s*0([,.]00)?$/.test(text);
  if (free && /(retirada|retirar|reserva|reservar)/.test(text)) return 'gratuito-reserva';
  if (free) return 'gratuito';
  if (item.precoFaixa && item.precoFaixa!=='nao-informado') return 'pago';
  if (/r\$\s*\d|pago|ingresso.*compra|compra.*ingresso/.test(text)) return 'pago';
  return null;
}

function visibleTagIds(item, kind) {
  const tags = rawTagSet(item);
  const text = norm(`${item.nome||''} ${item.descricao||''} ${item.acesso||''} ${item.ingresso||''}`);
  const result = [];
  const add = id => { if (id && VISIBLE_TAGS[id] && !result.includes(id)) result.push(id); };

  if (kind==='event') { add(eventTimeTag(item)); add(entryTag(item)); }
  else if (item.precoFaixa==='gratis' || norm(item.preco).includes('gratuit')) add('gratuito');

  if (hasAny(tags,['acessível'])) add('acessivel');
  if (hasAny(tags,['pet friendly','aceita pets'])) add('aceita-pets');
  if (hasAny(tags,['bom para crianças','kid friendly'])) add('bom-criancas');
  if (hasAny(tags,['opção vegana','vegano','vegana'])) add('opcao-vegana');
  if (hasAny(tags,['opção vegetariana','vegetariano','vegetariana'])) add('opcao-vegetariana');

  if (/(metrô próximo|metro proximo|perto do metrô|perto do metro)/.test(text)) add('metro-proximo');
  if (/(bicicletário|bicicletario|ciclovia)/.test(text)) add('bicicleta');
  if (text.includes('estacionamento')) add('estacionamento');
  if (/(carro facilita|carro recomendado|acesso de carro)/.test(text)) add('carro-recomendado');
  if (text.includes('estrada de terra')) add('estrada-terra');

  if (hasAny(tags,['infantil','crianças','criança'])) add('infantil');
  if (hasAny(tags,['família','familias','familiar'])) add('familias');
  if (hasAny(tags,['jovens','juventude'])) add('jovens');
  if (hasAny(tags,['18+','maiores de 18','adulto']) || /\b18\+|maiores de 18/.test(text)) add('18mais');
  if (hasAny(tags,['universitário','universitaria','universitaria'])) add('universitario');
  if (hasAny(tags,['lgbtqia+','lgbt','lgbtqiapn+'])) add('lgbtqia');
  if (hasAny(tags,['60+','idosos','terceira idade'])) add('60mais');

  if (hasAny(tags,['date','date diferente','romântico','romantico'])) add('date');
  if (hasAny(tags,['sozinho','solo','bom pra ir sozinho'])) add('sozinho');
  if (hasAny(tags,['tranquilo','calmo','relax'])) add('tranquilo');
  if (hasAny(tags,['dançante','balada'])) add('dancante');
  if (hasAny(tags,['alternativo'])) add('alternativo');

  if (hasAny(tags,['ao ar livre'])) add('ao-ar-livre');
  if (hasAny(tags,['música ao vivo'])) add('musica-vivo');
  if (hasAny(tags,['aventura','trilha','trilhas','arvorismo','escalada','tirolesa'])) add('aventura');
  if (hasAny(tags,['água','cachoeira','cachoeiras','lago','poços','águas termais','parque aquático'])) add('agua');
  if (hasAny(tags,['pôr do sol'])) add('por-do-sol');

  return result.slice(0,4);
}

function tagChipById(id) {
  const tag = VISIBLE_TAGS[id];
  if (!tag) return '';
  return `<span class="tag-chip" title="${esc(tag.label)}"><span class="emoji">${tag.emoji}</span><span class="tag-name">${esc(tag.label)}</span></span>`;
}
function tagsHtml(item, kind) { return visibleTagIds(item,kind).map(tagChipById).join(''); }

function feedbackButtons(kind, item) {
  const key = itemKey(kind,item.id);
  const likes=readSet('roledfora.likes'), dislikes=readSet('roledfora.dislikes'), saved=readSet('roledfora.saved');
  const want=readSet('roledfora.want'), visited=readSet('roledfora.visited');
  const onSavedPage = document.body.dataset.page==='salvos';
  const status = kind==='place' && onSavedPage ? `
    <button class="status-btn ${want.has(key)?'active':''}" data-action="want" data-key="${esc(key)}">📌 quero ir</button>
    <button class="status-btn ${visited.has(key)?'active':''}" data-action="visited" data-key="${esc(key)}">✅ já fui</button>` : '';
  return `
    <button class="save-btn ${saved.has(key)?'active':''}" data-action="save" data-key="${esc(key)}" title="${saved.has(key)?'remover dos salvos':'salvar'}" aria-label="${saved.has(key)?'remover dos salvos':'salvar'}">⭐</button>
    ${status}
    <button class="feedback ${likes.has(key)?'active':''}" data-action="like" data-key="${esc(key)}" title="gostei" aria-label="gostei">❤️</button>
    <button class="feedback ${dislikes.has(key)?'active':''}" data-action="dislike" data-key="${esc(key)}" title="não gostei" aria-label="não gostei">👎</button>`;
}

function isDfCity(city) { return DF_CITIES.has(norm(city)); }
function dfRaName(itemOrCity) {
  const item = typeof itemOrCity==='object' ? itemOrCity : {cidade:itemOrCity};
  if (item.ra) return item.ra;
  const c = norm(item.cidade);
  if (c==='brasilia') return 'plano piloto';
  if (c==='df') return 'ra não informada';
  return item.cidade || '';
}
function locationLabel(item) {
  if (isDfCity(item.cidade)) {
    const ra = dfRaName(item);
    const bairro = item.bairro ? `${item.bairro} · ` : '';
    return `${bairro}${ra} · df`;
  }
  return `${item.cidade} · go`;
}
function mapQueryForPlace(item) { return item.endereco || `${item.nome}, ${item.cidade}`; }

function eventCard(item) {
  const cat = categoryInfo('event',item);
  const ticket = norm(item.ingresso);
  const source = item.link ? `<a class="primary-link" href="${esc(item.link)}" target="_blank" rel="noopener">${ticket.includes('compra')||ticket.includes('inscri')?'🎟️ ingresso / inscrição':'↗ fonte / detalhes'}</a>` : '';
  return `<article class="card event-card" data-id="${esc(item.id)}">
    <span class="card-kind">${esc(cat.label)}</span>
    <h3>${esc(item.nome)}</h3>
    <div class="card-meta">
      <p>📅 ${esc(formatDateRange(item))}${item.horario?` · ${esc(item.horario)}`:''}</p>
      <p>📍 ${esc(item.local||item.cidade)}${item.local&&norm(item.local)!==norm(item.cidade)?` · ${esc(item.cidade)}`:''}</p>
      <p>💰 ${esc(item.preco||'não informado')}</p>
      ${item.ingresso?`<p>🎟️ ${esc(item.ingresso)}</p>`:''}
    </div>
    ${item.descricao?`<p class="desc">${esc(item.descricao)}</p>`:''}
    <div class="tags">${tagsHtml(item,'event')}</div>
    <div class="source-note">verificado em ${esc(item.verificadoEm||'data não informada')} · fonte: ${esc(item.fonte||'não informada')}</div>
    <div class="actions">${source}${feedbackButtons('event',item)}</div>
  </article>`;
}

function placeCard(item) {
  const cat = categoryInfo('place',item);
  const source = item.fonte ? `<a class="primary-link" href="${esc(item.fonte)}" target="_blank" rel="noopener">↗ fonte</a>` : '';
  const verified = item.verificadoEm ? `verificado em ${esc(item.verificadoEm)}` : 'informações de preço/horário ainda não conferidas';
  const mapQuery = encodeURIComponent(mapQueryForPlace(item));
  return `<article class="card place-card" data-id="${esc(item.id)}">
    <span class="card-kind">${esc(cat.label)}</span>
    <h3>${esc(item.nome)}</h3>
    <div class="card-meta">
      <p>📍 ${esc(locationLabel(item))}</p>
      ${item.endereco?`<p>🧭 ${esc(item.endereco)}</p>`:''}
      <p>💰 ${esc(item.preco||'não informado')}</p>
      ${item.acesso?`<p>🚏 ${esc(item.acesso)}</p>`:''}
    </div>
    ${item.descricao?`<p class="desc">${esc(item.descricao)}</p>`:''}
    <div class="tags">${tagsHtml(item,'place')}</div>
    <div class="source-note">${verified}</div>
    <div class="actions">
      <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener">📍 abrir no mapa</a>
      ${source}${feedbackButtons('place',item)}
    </div>
  </article>`;
}

function renderList(items,kind,targetId='results',countId='result-count') {
  state.filtered=items;
  const target=document.querySelector(`#${targetId}`), count=document.querySelector(`#${countId}`);
  if(count) count.textContent=`${items.length} ${items.length===1?'resultado':'resultados'}`;
  if(!target) return;
  if(!items.length) {
    target.innerHTML='<div class="empty-state">não achei nada com esses filtros ainda 😭 tenta abrir um pouquinho a busca.</div>';
    const more=document.querySelector('#show-more'); if(more&&targetId==='results') more.hidden=true;
    return;
  }
  const slice=targetId==='results'?items.slice(0,state.visible):items;
  target.innerHTML=slice.map(kind==='event'?eventCard:placeCard).join('');
  const more=document.querySelector('#show-more');
  if(more&&targetId==='results') { more.hidden=slice.length>=items.length; more.textContent=`mostrar mais (${items.length-slice.length})`; }
}

function priceMatches(item,value) {
  if(!value||value==='qualquer') return true;
  const rank={'gratis':0,'ate-20':1,'ate-50':2,'ate-100':3,'acima-100':4,'nao-informado':9};
  const r=rank[item.precoFaixa]??9;
  if(value==='gratis') return r===0;
  if(value==='ate-20') return r<=1;
  if(value==='ate-50') return r<=2;
  if(value==='ate-100') return r<=3;
  if(value==='acima-100') return r===4;
  return true;
}

function cityMatches(city,value) {
  if(!value||value==='qualquer') return true;
  const c=norm(city);
  if(value==='df') return DF_CITIES.has(c);
  if(value==='entorno-sul') return ENTORNO_SUL.has(c);
  if(value==='entorno-norte') return ENTORNO_NORTE.has(c);
  if(value==='goias') return !DF_CITIES.has(c);
  return c===norm(value);
}

function timeMatches(item,value) {
  if(!value||value==='qualquer') return true;
  return eventTimeTag(item)===value;
}

function localMidnight(date=new Date()){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}
function dayFromISO(iso){if(!iso)return new Date(0);const[y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d);}
function eventDateMatches(item,value){
  if(!value||value==='qualquer') return true;
  const today=localMidnight(),start=dayFromISO(item.dataInicio),end=dayFromISO(item.dataFim||item.dataInicio),intersects=(a,b)=>end>=a&&start<=b;
  if(value==='hoje') return intersects(today,today);
  if(value==='amanha'){const d=new Date(today);d.setDate(d.getDate()+1);return intersects(d,d);}
  if(value==='7dias'){const d=new Date(today);d.setDate(d.getDate()+7);return intersects(today,d);}
  if(value==='mes'){const a=new Date(today.getFullYear(),today.getMonth(),1),b=new Date(today.getFullYear(),today.getMonth()+1,0);return intersects(a,b);}
  if(value==='fim-semana'){const a=new Date(today);a.setDate(a.getDate()+(6-a.getDay()+7)%7);const b=new Date(a);b.setDate(b.getDate()+1);return intersects(a,b);}
  return true;
}
function sortEvents(items){return [...items].sort((a,b)=>(a.dataInicio||'9999').localeCompare(b.dataInicio||'9999')||a.nome.localeCompare(b.nome,'pt-BR'));}

function option(value,label){return `<option value="${esc(value)}">${esc(label)}</option>`;}
function populateCitySelect(select,items,groups=true){
  if(!select)return;
  const current=select.value;
  const cities=[...new Set(items.map(x=>x.cidade).filter(Boolean))];
  const df=cities.filter(isDfCity).sort((a,b)=>dfRaName(a).localeCompare(dfRaName(b),'pt-BR'));
  const go=cities.filter(c=>!isDfCity(c)).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  let html='<option value="qualquer">qualquer lugar</option>';
  if(groups) html += '<option value="df">distrito federal</option><option value="entorno-sul">entorno sul</option><option value="entorno-norte">entorno norte</option><option value="goias">goiás / fora do df</option>';
  if(df.length) html += `<optgroup label="regiões administrativas do df">${df.map(c=>option(c,dfRaName(c))).join('')}</optgroup>`;
  if(go.length) html += `<optgroup label="municípios de goiás">${go.map(c=>option(c,c)).join('')}</optgroup>`;
  select.innerHTML=html;
  if([...select.options].some(o=>o.value===current)) select.value=current;
}

function detailMatches(item,detail){
  if(!detail)return true;
  const d=norm(detail),tags=(item.tags||[]).map(norm),text=norm(`${item.nome||''} ${item.categoria||''}`);
  if(d==='cinema')return tags.includes('cinema')||text.includes('cinema')||text.includes('cine ');
  if(d==='cachoeira')return tags.some(t=>['cachoeira','cachoeiras'].includes(t))||text.includes('cachoeira')||text.includes('salto do');
  if(d==='chapada')return tags.includes('chapada')||text.includes('chapada');
  return tags.includes(d)||text.includes(d);
}

function renderEventos(){
  const local=document.querySelector('#local')?.value||'qualquer',data=document.querySelector('#data')?.value||'qualquer',valor=document.querySelector('#valor')?.value||'qualquer',horario=document.querySelector('#horario')?.value||'qualquer',tipo=document.querySelector('#tipo')?.value||'qualquer',detail=new URLSearchParams(location.search).get('detalhe');
  const items=sortEvents(state.eventos.filter(e=>cityMatches(e.cidade,local)&&eventDateMatches(e,data)&&priceMatches(e,valor)&&timeMatches(e,horario)&&(tipo==='qualquer'||canonicalEventCategory(e)===tipo)&&detailMatches(e,detail)));
  renderList(items,'event');
}

function renderLugares(){
  const local=document.querySelector('#onde')?.value||'qualquer',cat=document.querySelector('#categoria')?.value||'qualquer',feature=document.querySelector('#vibe')?.value||'qualquer',valor=document.querySelector('#preco')?.value||'qualquer',detail=new URLSearchParams(location.search).get('detalhe');
  const items=state.lugares.filter(p=>cityMatches(p.cidade,local)&&(cat==='qualquer'||canonicalPlaceCategory(p)===cat)&&(feature==='qualquer'||visibleTagIds(p,'place').includes(feature))&&priceMatches(p,valor)&&detailMatches(p,detail));
  renderList(items,'place');
}

function scoreItem(kind,item,likes,dislikes){
  let score=kind==='event'?4:1;
  if(kind==='event'){const days=(dayFromISO(item.dataInicio)-localMidnight())/86400000;if(days>=0&&days<=7)score+=4;}
  const tokens=[categoryInfo(kind,item).id,...(item.tags||[]).map(norm),...visibleTagIds(item,kind)];
  for(const key of likes){const[k,id]=key.split(':'),source=k==='event'?state.eventos:state.lugares,liked=source.find(x=>x.id===id);if(!liked)continue;const likedTokens=[categoryInfo(k,liked).id,...(liked.tags||[]).map(norm),...visibleTagIds(liked,k)];score+=tokens.filter(t=>likedTokens.includes(t)).length*2;}
  if(dislikes.has(itemKey(kind,item.id)))score-=100;
  return score;
}
function renderIndicacoes(){
  const likes=readSet('roledfora.likes'),dislikes=readSet('roledfora.dislikes');
  const upcoming=state.eventos.filter(e=>dayFromISO(e.dataFim||e.dataInicio)>=localMidnight()).map(x=>({kind:'event',item:x}));
  const places=state.lugares.map(x=>({kind:'place',item:x}));
  const mixed=[...upcoming,...places].sort((a,b)=>scoreItem(b.kind,b.item,likes,dislikes)-scoreItem(a.kind,a.item,likes,dislikes)).slice(0,24);
  const target=document.querySelector('#results'),count=document.querySelector('#result-count');
  if(count)count.textContent=`${mixed.length} sugestões`;
  if(target)target.innerHTML=mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join('');
}

function renderSavedGrid(set,targetId,countId){
  const mixed=[];
  for(const key of set){const[kind,id]=key.split(':'),source=kind==='event'?state.eventos:state.lugares,item=source.find(x=>x.id===id);if(item)mixed.push({kind,item});}
  const target=document.querySelector(`#${targetId}`),count=document.querySelector(`#${countId}`);if(count)count.textContent=`${mixed.length}`;if(!target)return;
  target.innerHTML=mixed.length?mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join(''):'<div class="empty-state">nada por aqui ainda.</div>';
}
function renderSalvos(){
  const saved=readSet('roledfora.saved'),want=readSet('roledfora.want'),visited=readSet('roledfora.visited'),others=new Set([...saved].filter(k=>!want.has(k)&&!visited.has(k)));
  renderSavedGrid(want,'want-results','want-count');renderSavedGrid(visited,'visited-results','visited-count');renderSavedGrid(others,'saved-results','saved-count');
}

function renderNovidades(){
  const byAdded=(a,b)=>{const da=a.adicionadoEm||a.verificadoEm||'0000-00-00',db=b.adicionadoEm||b.verificadoEm||'0000-00-00';return db.localeCompare(da)||(a.dataInicio||'9999').localeCompare(b.dataInicio||'9999');};
  const upcoming=state.eventos.filter(e=>dayFromISO(e.dataFim||e.dataInicio)>=localMidnight()).sort(byAdded).slice(0,18);
  const recentPlaces=[...state.lugares].filter(p=>p.adicionadoEm||p.verificadoEm).sort(byAdded).slice(0,12);
  renderList(upcoming,'event','event-results','event-count');renderList(recentPlaces,'place','place-results','place-count');
}

function renderMapa(){
  const target=document.querySelector('#results');if(!target)return;
  const all=[...state.lugares.map(x=>({kind:'lugar',...x})),...state.eventos.map(x=>({kind:'evento',...x}))];
  const groups=new Map();
  for(const item of all){
    const df=isDfCity(item.cidade),key=df?`df:${norm(item.cidade)}`:`go:${norm(item.cidade)}`;
    if(!groups.has(key))groups.set(key,{df,city:item.cidade,label:df?dfRaName(item.cidade):item.cidade,items:[]});
    groups.get(key).items.push(item);
  }
  const sorted=[...groups.values()].sort((a,b)=>Number(b.df)-Number(a.df)||a.label.localeCompare(b.label,'pt-BR'));
  target.innerHTML=sorted.map(g=>{
    const ps=g.items.filter(x=>x.kind==='lugar').length,es=g.items.filter(x=>x.kind==='evento').length;
    const q=encodeURIComponent(g.df?`${g.label}, distrito federal`:`${g.city}, goiás`);
    return `<article class="card compact-card">
      <span class="card-kind">${g.df?'região administrativa · df':'município · go'}</span>
      <h3>${esc(g.label)}</h3>
      <p>${ps} lugares · ${es} eventos na base</p>
      <div class="actions"><a href="./lugares.html?cidade=${encodeURIComponent(g.city)}">conhecer</a><a href="./index.html?cidade=${encodeURIComponent(g.city)}">ver rolês</a><a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">abrir mapa</a></div>
    </article>`;
  }).join('');
  const count=document.querySelector('#result-count');if(count)count.textContent=`${sorted.length} regiões/municípios`;
}

function bindFeedback(){
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;const action=btn.dataset.action,key=btn.dataset.key;if(!key)return;
    const likes=readSet('roledfora.likes'),dislikes=readSet('roledfora.dislikes'),saved=readSet('roledfora.saved'),want=readSet('roledfora.want'),visited=readSet('roledfora.visited');
    if(action==='like'){likes.has(key)?likes.delete(key):likes.add(key);dislikes.delete(key);}
    if(action==='dislike'){dislikes.has(key)?dislikes.delete(key):dislikes.add(key);likes.delete(key);}
    if(action==='save'){if(saved.has(key)){saved.delete(key);want.delete(key);visited.delete(key);}else saved.add(key);}
    if(action==='want'){if(want.has(key))want.delete(key);else{want.add(key);visited.delete(key);saved.add(key);}}
    if(action==='visited'){if(visited.has(key))visited.delete(key);else{visited.add(key);want.delete(key);saved.add(key);}}
    writeSet('roledfora.likes',likes);writeSet('roledfora.dislikes',dislikes);writeSet('roledfora.saved',saved);writeSet('roledfora.want',want);writeSet('roledfora.visited',visited);refreshCurrent();
  });
}

function setSelectFromParam(selectId,param){
  const value=new URLSearchParams(location.search).get(param);if(!value)return;
  const select=document.querySelector(selectId);if(!select)return;
  const option=[...select.options].find(o=>norm(o.value)===norm(value));if(option)select.value=option.value;
}
function applyUrlFilters(page){
  if(page==='eventos'){setSelectFromParam('#local','cidade');setSelectFromParam('#tipo','tipo');setSelectFromParam('#data','data');setSelectFromParam('#horario','horario');setSelectFromParam('#valor','valor');}
  if(page==='lugares'){setSelectFromParam('#onde','cidade');setSelectFromParam('#categoria','categoria');setSelectFromParam('#vibe','vibe');setSelectFromParam('#preco','preco');}
}

function bindFilters(page){
  const search=document.querySelector('.search-button');if(search)search.addEventListener('click',()=>{state.visible=18;page==='eventos'?renderEventos():renderLugares();});
  document.querySelectorAll('.category-chip').forEach(btn=>btn.addEventListener('click',()=>{const val=btn.dataset.category,select=document.querySelector(page==='eventos'?'#tipo':'#categoria');if(select&&val){select.value=val;state.visible=18;page==='eventos'?renderEventos():renderLugares();}}));
  const more=document.querySelector('#show-more');if(more)more.addEventListener('click',()=>{state.visible+=18;page==='eventos'?renderEventos():renderLugares();});
}
function enhanceNav(page){
  document.querySelectorAll('.utility-nav').forEach(nav=>{
    const saved=nav.querySelector('a[href="./salvos.html"]');if(saved)saved.textContent='⭐ salvos';
    let latest=nav.querySelector('a[href="./novidades.html"]');if(!latest){latest=document.createElement('a');latest.href='./novidades.html';latest.textContent='✨ novidades';nav.prepend(latest);}nav.querySelectorAll('a').forEach(a=>a.classList.remove('auto-active'));if(page==='novidades')latest.classList.add('active','auto-active');
  });
}
function refreshCurrent(){const page=document.body.dataset.page;if(page==='eventos')renderEventos();else if(page==='lugares')renderLugares();else if(page==='indicacoes')renderIndicacoes();else if(page==='salvos')renderSalvos();else if(page==='mapa')renderMapa();else if(page==='novidades')renderNovidades();}

async function init(){
  const page=document.body.dataset.page||'';enhanceNav(page);if(page==='roteiros')return;
  try{
    const[lugares,eventos]=await Promise.all([loadMany(DATA.lugares),loadMany(DATA.eventos)]);state.lugares=mergePlaceOverrides(lugares);state.eventos=eventos;
    if(page==='eventos'){populateCitySelect(document.querySelector('#local'),state.eventos,true);applyUrlFilters(page);bindFilters(page);renderEventos();}
    if(page==='lugares'){populateCitySelect(document.querySelector('#onde'),state.lugares,true);applyUrlFilters(page);bindFilters(page);renderLugares();}
    if(page==='indicacoes')renderIndicacoes();if(page==='salvos')renderSalvos();if(page==='mapa')renderMapa();if(page==='novidades')renderNovidades();
  }catch(err){console.error(err);document.querySelectorAll('.empty-state').forEach(target=>target.textContent='não consegui carregar a base agora. tenta atualizar a página.');}
}

bindFeedback();
init();
