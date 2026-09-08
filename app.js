const DATA = {
  lugares: [
    './data/lugares-1.json',
    './data/lugares-2.json',
    './data/lugares-3.json',
    './data/lugares-4.json',
    './data/lugares-5.json',
    './data/lugares-6.json'
  ],
  eventos: [
    './data/eventos-1.json',
    './data/eventos-2.json',
    './data/eventos-3.json'
  ]
};

const TAG_EMOJI = {
  'arte':'🎨','exposição':'🖼️','música':'🎵','música ao vivo':'🎵','show':'🎵','festa':'🎉','festival':'🎪','balada':'💃','dançante':'💃','madrugada':'🌙',
  'gastronomia':'🍴','comer':'🍴','café':'☕','doce':'🍰','padaria':'🥐','pizza':'🍕','hambúrguer':'🍔','sushi':'🍣','japonês':'🍣','vinho':'🍷','bar':'🍻',
  'lgbtqia+':'🌈','drag':'🌈','pet friendly':'🐾','ao ar livre':'🌿','natureza':'🌳','trilha':'🥾','trilhas':'🥾','cachoeira':'💦','cachoeiras':'💦','cerrado':'🌿',
  'cinema':'🎬','quadrinhos':'💬','games':'👾','nerd/geek':'👾','mangá':'📚','ilustração':'✏️','teatro':'🎭','comédia':'😂','stand-up':'😂','hipnose':'🌀',
  'oficina':'🧠','oficinas':'🧠','curso':'🧠','gratuito':'🆓','família':'👨‍👩‍👧','infantil':'🧸','acessível':'♿','acesso pavimentado':'♿',
  'date':'💞','date diferente':'💞','pôr do sol':'🌅','passeio':'🚶','vista':'👀','mirante':'👀','arquitetura':'🏙️','história':'🏛️','museu':'🏛️',
  'cultura':'🏛️','cultura popular':'🪗','compras':'🛍️','feira':'🛍️','alternativo':'✨','aventura':'🧗','arvorismo':'🧗','escalada':'🧗','tirolesa':'🧗',
  'parque':'🌳','lago':'💧','caminhada':'🚶','cidade histórica':'🏘️','viagem':'🚗','piseiro':'💃','forró':'🪗','pop':'🎧','rock':'🎸',
  'reggaeton':'💃','house':'🎧','eletrônica':'🎧','cultura japonesa':'🎐','economia criativa':'✨','design independente':'🧵',
  'clássico brasiliense':'⭐','clássico':'⭐','chapada':'⛰️','cidade':'🏘️','conhecer a cidade':'🧭','vila':'🏘️','parque aquático':'🏊',
  'água':'💦','cavernas':'🕳️','caverna':'🕳️','poços':'💧','goiás':'🌾','entorno':'📍','shopping':'🛍️','art déco':'🏛️','rpg':'🎲',
  "artist's alley":'🎨','tecnologia':'🤖','mpb':'🎵','restaurante':'🍽️'
};

const CATEGORY_EMOJI = {
  'festa':'🎉','show':'🎵','barzinho':'🍻','karaokê':'🎤','feira':'🛍️','brechó':'👕','exposição':'🖼️','cinema':'🎬','teatro':'🎭','lgbtqia+':'🌈',
  'gastronomia':'🍴','nerd/geek':'👾','ao ar livre':'🌿','workshop/curso':'🧠','universitário':'🎓','cultura e museus':'🏛️','parques e natureza':'🌳',
  'arquitetura':'🏙️','cafés':'☕','restaurantes':'🍽️','feiras e garimpo':'🛍️','noite':'🌙','experiências':'🎟️','bate-volta':'🚗','passeios locais':'📍',
  'cinemas':'🎬','teatros':'🎭','bares e noite':'🍻','cachoeiras':'💦','parques aquáticos':'🏊','cidades & chapada':'⛰️'
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
    categoria:'cinemas', emoji:'🎬',
    tags:['cinema','clássico brasiliense','cultura','arquitetura'],
    preco:'varia conforme sessão', precoFaixa:'nao-informado',
    descricao:'cinema histórico da asa sul e uma das principais referências do audiovisual brasiliense; recebe mostras, festivais e sessões comerciais.',
    fonte:'https://cinebrasilia.com/', verificadoEm:'2026-09-08', adicionadoEm:'2026-09-08'
  },
  'l-059-cine-drive-in': {
    categoria:'cinemas', emoji:'🚘',
    tags:['cinema','date diferente','clássico brasiliense','ao ar livre'],
    preco:'varia conforme sessão', precoFaixa:'nao-informado',
    descricao:'o clássico cine drive-in de brasília: filme visto do carro, com som sintonizado por rádio e programação própria.',
    fonte:'https://cinedrivein.com/', verificadoEm:'2026-09-08', adicionadoEm:'2026-09-08'
  },
  'l-170-rio-quente-hot-park': {
    categoria:'parques aquáticos', emoji:'🏊',
    tags:['parque aquático','águas termais','viagem','família']
  },
  'l-160-vila-de-sao-jorge': {
    categoria:'cidades & chapada', emoji:'⛰️',
    tags:['vila','chapada','cidade','natureza','viagem']
  },
  'l-159-alto-paraiso-de-goias': {
    categoria:'cidades & chapada', emoji:'⛰️',
    tags:['cidade','chapada','natureza','viagem']
  }
};

let state = { lugares: [], eventos: [], visible: 18, filtered: [] };

const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

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
    return {
      ...item,
      ...over,
      tags: [...new Set([...(item.tags || []), ...(over.tags || [])])]
    };
  });
}

function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return new Set(); }
}
function writeSet(key, set) { localStorage.setItem(key, JSON.stringify([...set])); }
function itemKey(kind, id) { return `${kind}:${id}`; }

function formatDateRange(item) {
  if (!item.dataInicio) return '';
  const f = iso => new Intl.DateTimeFormat('pt-BR', {
    day:'2-digit', month:'short', timeZone:'UTC'
  }).format(new Date(`${iso}T12:00:00Z`)).replace('.','');
  if (!item.dataFim || item.dataFim === item.dataInicio) return f(item.dataInicio);
  return `${f(item.dataInicio)} a ${f(item.dataFim)}`;
}

function tagChip(tag) {
  const emoji = TAG_EMOJI[norm(tag)] || '✨';
  return `<span class="tag-chip" title="${esc(tag)}"><span class="emoji">${emoji}</span><span class="tag-name">${esc(tag)}</span></span>`;
}

function feedbackButtons(kind, item) {
  const key = itemKey(kind, item.id);
  const likes = readSet('roledfora.likes');
  const dislikes = readSet('roledfora.dislikes');
  const saved = readSet('roledfora.saved');
  const want = readSet('roledfora.want');
  const visited = readSet('roledfora.visited');
  const isSaved = saved.has(key);
  const status = kind === 'place' ? `
    <button class="status-btn ${want.has(key)?'active':''}" data-action="want" data-key="${esc(key)}">📌 quero ir</button>
    <button class="status-btn ${visited.has(key)?'active':''}" data-action="visited" data-key="${esc(key)}">✅ já fui</button>` : '';
  return `
    <button class="save-btn ${isSaved?'active':''}" data-action="save" data-key="${esc(key)}" title="${isSaved?'remover dos salvos':'salvar'}" aria-label="${isSaved?'remover dos salvos':'salvar'}">⭐</button>
    ${status}
    <button class="feedback ${likes.has(key)?'active':''}" data-action="like" data-key="${esc(key)}">❤️ gostei</button>
    <button class="feedback ${dislikes.has(key)?'active':''}" data-action="dislike" data-key="${esc(key)}">👎 não gostei</button>`;
}

function eventCard(item) {
  const ticket = norm(item.ingresso);
  const source = item.link
    ? `<a class="primary-link" href="${esc(item.link)}" target="_blank" rel="noopener">${ticket.includes('compra') || ticket.includes('inscri') ? '🎟️ ingresso / inscrição' : '↗ fonte / detalhes'}</a>`
    : '';
  return `<article class="card event-card" data-id="${esc(item.id)}">
    <span class="card-kind">${item.emoji || CATEGORY_EMOJI[item.categoria] || '🎉'} ${esc(item.categoria)}</span>
    <h3>${esc(item.nome)}</h3>
    <div class="card-meta">
      <p>📅 ${esc(formatDateRange(item))}${item.horario ? ` · ${esc(item.horario)}` : ''}</p>
      <p>📍 ${esc(item.local || item.cidade)}${item.local && norm(item.local)!==norm(item.cidade) ? ` · ${esc(item.cidade)}`:''}</p>
      <p>💰 ${esc(item.preco || 'não informado')}</p>
      ${item.ingresso ? `<p>🎟️ ${esc(item.ingresso)}</p>` : ''}
    </div>
    ${item.descricao ? `<p class="desc">${esc(item.descricao)}</p>`:''}
    <div class="tags">${(item.tags||[]).map(tagChip).join('')}</div>
    <div class="source-note">verificado em ${esc(item.verificadoEm || 'data não informada')} · fonte: ${esc(item.fonte || 'não informada')}</div>
    <div class="actions">${source}${feedbackButtons('event', item)}</div>
  </article>`;
}

function placeCard(item) {
  const mapQuery = encodeURIComponent(`${item.nome}, ${item.cidade}`);
  const source = item.fonte ? `<a class="primary-link" href="${esc(item.fonte)}" target="_blank" rel="noopener">↗ fonte</a>` : '';
  const verified = item.verificadoEm ? `verificado em ${esc(item.verificadoEm)}` : 'informações de preço/horário ainda não conferidas';
  return `<article class="card place-card" data-id="${esc(item.id)}">
    <span class="card-kind">${item.emoji || CATEGORY_EMOJI[item.categoria] || '📍'} ${esc(item.categoria)}</span>
    <h3>${esc(item.nome)}</h3>
    <div class="card-meta">
      <p>📍 ${esc(item.cidade)}</p>
      <p>💰 ${esc(item.preco || 'não informado')}</p>
      ${item.acesso ? `<p>🚌 ${esc(item.acesso)}</p>`:''}
    </div>
    ${item.descricao ? `<p class="desc">${esc(item.descricao)}</p>`:''}
    <div class="tags">${(item.tags||[]).map(tagChip).join('')}</div>
    <div class="source-note">${verified}</div>
    <div class="actions">
      <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener">📍 abrir no mapa</a>
      ${source}${feedbackButtons('place', item)}
    </div>
  </article>`;
}

function renderList(items, kind, targetId='results', countId='result-count') {
  state.filtered = items;
  const target = document.querySelector(`#${targetId}`);
  const count = document.querySelector(`#${countId}`);
  if (count) count.textContent = `${items.length} ${items.length===1 ? 'resultado' : 'resultados'}`;
  if (!target) return;
  if (!items.length) {
    target.innerHTML = `<div class="empty-state">não achei nada com esses filtros ainda 😭 tenta abrir um pouquinho a busca.</div>`;
    const more = document.querySelector('#show-more');
    if (more && targetId==='results') more.hidden = true;
    return;
  }
  const slice = targetId==='results' ? items.slice(0, state.visible) : items;
  target.innerHTML = slice.map(kind==='event' ? eventCard : placeCard).join('');
  const more = document.querySelector('#show-more');
  if (more && targetId==='results') {
    more.hidden = slice.length >= items.length;
    more.textContent = `mostrar mais (${items.length-slice.length})`;
  }
}

function priceMatches(item, value) {
  if (!value || value==='qualquer') return true;
  const rank = {'gratis':0,'ate-20':1,'ate-50':2,'ate-100':3,'acima-100':4,'nao-informado':9};
  const r = rank[item.precoFaixa] ?? 9;
  if (value==='gratis') return r===0;
  if (value==='ate-20') return r<=1;
  if (value==='ate-50') return r<=2;
  if (value==='ate-100') return r<=3;
  if (value==='acima-100') return r===4;
  return true;
}

function cityMatches(city, value) {
  if (!value || value==='qualquer') return true;
  const c = norm(city);
  if (value==='df') return DF_CITIES.has(c);
  if (value==='entorno-sul') return ENTORNO_SUL.has(c);
  if (value==='entorno-norte') return ENTORNO_NORTE.has(c);
  if (value==='goias') return !DF_CITIES.has(c);
  return c===norm(value);
}

function placeCategoryMatches(item, value) {
  if (!value || value==='qualquer') return true;
  const category = norm(item.categoria);
  const tags = (item.tags || []).map(norm);
  const name = norm(item.nome);
  if (norm(value) === category) return true;
  if (value==='cinemas') return tags.includes('cinema') || name.includes('cine ');
  if (value==='teatros') return tags.includes('teatro') || name.includes('teatro');
  if (value==='bares-e-noite') return category==='noite' || tags.some(t=>['bar','balada','karaoke','música ao vivo','musica ao vivo','festa'].includes(t));
  if (value==='cachoeiras') return tags.some(t=>['cachoeira','cachoeiras'].includes(t)) || name.includes('cachoeira') || name.includes('salto do');
  if (value==='parques-aquaticos') return tags.includes('parque aquático') || tags.includes('parque aquatico') || name.includes('hot park') || name.includes('bali park');
  if (value==='cidades-chapada') return tags.some(t=>['chapada','cidade','cidade histórica','cidade historica','vila','conhecer a cidade'].includes(t));
  return false;
}

function timeMatches(item, value) {
  if (!value || value==='qualquer') return true;
  const hours = [...(item.horario || '').matchAll(/\b(\d{1,2})h/g)].map(m => Number(m[1]));
  const start = hours[0];
  if (value==='madrugada') return hours.some(h=>h<6) || (item.tags||[]).some(t=>norm(t)==='madrugada') || norm(item.horario).includes('madrugada');
  if (start===undefined) return false;
  if (value==='manha') return start<12;
  if (value==='tarde') return start>=12 && start<18;
  if (value==='noite') return start>=18 && start<24;
  return true;
}

function localMidnight(date=new Date()) { return new Date(date.getFullYear(),date.getMonth(),date.getDate()); }
function dayFromISO(iso) {
  if (!iso) return new Date(0);
  const [y,m,d]=iso.split('-').map(Number);
  return new Date(y,m-1,d);
}
function eventDateMatches(item, value) {
  if (!value || value==='qualquer') return true;
  const today = localMidnight();
  const start = dayFromISO(item.dataInicio);
  const end = dayFromISO(item.dataFim || item.dataInicio);
  const intersects = (a,b) => end>=a && start<=b;
  if (value==='hoje') return intersects(today,today);
  if (value==='amanha') { const d=new Date(today); d.setDate(d.getDate()+1); return intersects(d,d); }
  if (value==='7dias') { const d=new Date(today); d.setDate(d.getDate()+7); return intersects(today,d); }
  if (value==='mes') {
    const a=new Date(today.getFullYear(),today.getMonth(),1);
    const b=new Date(today.getFullYear(),today.getMonth()+1,0);
    return intersects(a,b);
  }
  if (value==='fim-semana') {
    const a=new Date(today);
    const delta=(6-a.getDay()+7)%7;
    a.setDate(a.getDate()+delta);
    const b=new Date(a); b.setDate(b.getDate()+1);
    return intersects(a,b);
  }
  return true;
}

function sortEvents(items) {
  return [...items].sort((a,b)=>(a.dataInicio||'9999').localeCompare(b.dataInicio||'9999') || a.nome.localeCompare(b.nome,'pt-BR'));
}

function populateCitySelect(select, items, groups=true) {
  if (!select) return;
  const current = select.value;
  const cities = [...new Set(items.map(x=>x.cidade).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const groupsHtml = groups
    ? '<option value="df">distrito federal</option><option value="entorno-sul">entorno sul</option><option value="entorno-norte">entorno norte</option><option value="goias">goiás / fora do df</option>'
    : '';
  select.innerHTML = `<option value="qualquer">qualquer lugar</option>${groupsHtml}${cities.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}`;
  if ([...select.options].some(o=>o.value===current)) select.value=current;
}

function renderEventos() {
  const local=document.querySelector('#local')?.value||'qualquer';
  const data=document.querySelector('#data')?.value||'qualquer';
  const valor=document.querySelector('#valor')?.value||'qualquer';
  const horario=document.querySelector('#horario')?.value||'qualquer';
  const tipo=document.querySelector('#tipo')?.value||'qualquer';
  const items=sortEvents(state.eventos.filter(e =>
    cityMatches(e.cidade,local) &&
    eventDateMatches(e,data) &&
    priceMatches(e,valor) &&
    timeMatches(e,horario) &&
    (tipo==='qualquer'||norm(e.categoria)===norm(tipo))
  ));
  renderList(items,'event');
}

function renderLugares() {
  const local=document.querySelector('#onde')?.value||'qualquer';
  const cat=document.querySelector('#categoria')?.value||'qualquer';
  const vibe=document.querySelector('#vibe')?.value||'qualquer';
  const valor=document.querySelector('#preco')?.value||'qualquer';
  const items=state.lugares.filter(p =>
    cityMatches(p.cidade,local) &&
    placeCategoryMatches(p,cat) &&
    (vibe==='qualquer'||(p.tags||[]).some(t=>norm(t)===norm(vibe))) &&
    priceMatches(p,valor)
  );
  renderList(items,'place');
}

function scoreItem(kind,item,likes,dislikes) {
  let score = kind==='event' ? 4 : 1;
  if (kind==='event') {
    const days=(dayFromISO(item.dataInicio)-localMidnight())/86400000;
    if (days>=0&&days<=7) score+=4;
  }
  const tokens=[norm(item.categoria),...(item.tags||[]).map(norm)];
  for (const key of likes) {
    const [k,id]=key.split(':');
    const source=k==='event'?state.eventos:state.lugares;
    const liked=source.find(x=>x.id===id);
    if(!liked) continue;
    const likedTokens=[norm(liked.categoria),...(liked.tags||[]).map(norm)];
    score += tokens.filter(t=>likedTokens.includes(t)).length*2;
  }
  if (dislikes.has(itemKey(kind,item.id))) score-=100;
  return score;
}

function renderIndicacoes() {
  const likes=readSet('roledfora.likes');
  const dislikes=readSet('roledfora.dislikes');
  const upcoming=state.eventos
    .filter(e=>dayFromISO(e.dataFim||e.dataInicio)>=localMidnight())
    .map(x=>({kind:'event',item:x}));
  const places=state.lugares.map(x=>({kind:'place',item:x}));
  const mixed=[...upcoming,...places]
    .sort((a,b)=>scoreItem(b.kind,b.item,likes,dislikes)-scoreItem(a.kind,a.item,likes,dislikes))
    .slice(0,24);
  const target=document.querySelector('#results');
  const count=document.querySelector('#result-count');
  if(count) count.textContent=`${mixed.length} sugestões`;
  if(target) target.innerHTML=mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join('');
}

function renderSavedGrid(set, targetId, countId) {
  const mixed=[];
  for(const key of set) {
    const [kind,id]=key.split(':');
    const source=kind==='event'?state.eventos:state.lugares;
    const item=source.find(x=>x.id===id);
    if(item) mixed.push({kind,item});
  }
  const target=document.querySelector(`#${targetId}`);
  const count=document.querySelector(`#${countId}`);
  if(count) count.textContent=`${mixed.length}`;
  if(!target) return;
  target.innerHTML=mixed.length
    ? mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join('')
    : '<div class="empty-state">nada por aqui ainda.</div>';
}

function renderSalvos() {
  const saved=readSet('roledfora.saved');
  const want=readSet('roledfora.want');
  const visited=readSet('roledfora.visited');
  const others=new Set([...saved].filter(k=>!want.has(k)&&!visited.has(k)));
  renderSavedGrid(want,'want-results','want-count');
  renderSavedGrid(visited,'visited-results','visited-count');
  renderSavedGrid(others,'saved-results','saved-count');
}

function renderNovidades() {
  const byAdded = (a,b) => {
    const da=a.adicionadoEm||a.verificadoEm||'0000-00-00';
    const db=b.adicionadoEm||b.verificadoEm||'0000-00-00';
    return db.localeCompare(da) || (a.dataInicio||'9999').localeCompare(b.dataInicio||'9999');
  };
  const upcoming=state.eventos
    .filter(e=>dayFromISO(e.dataFim||e.dataInicio)>=localMidnight())
    .sort(byAdded)
    .slice(0,18);
  const recentPlaces=[...state.lugares]
    .filter(p=>p.adicionadoEm||p.verificadoEm)
    .sort(byAdded)
    .slice(0,12);
  renderList(upcoming,'event','event-results','event-count');
  renderList(recentPlaces,'place','place-results','place-count');
}

function renderMapa() {
  const target=document.querySelector('#results');
  if(!target) return;
  const all=[...state.lugares.map(x=>({kind:'lugar',...x})),...state.eventos.map(x=>({kind:'evento',...x}))];
  const groups=[...new Set(all.map(x=>x.cidade).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  target.innerHTML=groups.map(city=>{
    const ps=state.lugares.filter(x=>x.cidade===city).length;
    const es=state.eventos.filter(x=>x.cidade===city).length;
    const q=encodeURIComponent(`${city}, DF/GO`);
    return `<article class="card compact-card">
      <span class="card-kind">📍 região</span>
      <h3>${esc(city)}</h3>
      <p>${ps} lugares · ${es} eventos na base</p>
      <div class="actions">
        <a href="./lugares.html?cidade=${encodeURIComponent(city)}">conhecer</a>
        <a href="./index.html?cidade=${encodeURIComponent(city)}">ver rolês</a>
        <a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">abrir mapa</a>
      </div>
    </article>`;
  }).join('');
  const count=document.querySelector('#result-count');
  if(count) count.textContent=`${groups.length} regiões/cidades`;
}

function bindFeedback() {
  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-action]');
    if(!btn) return;
    const action=btn.dataset.action;
    const key=btn.dataset.key;
    if(!key) return;

    const likes=readSet('roledfora.likes');
    const dislikes=readSet('roledfora.dislikes');
    const saved=readSet('roledfora.saved');
    const want=readSet('roledfora.want');
    const visited=readSet('roledfora.visited');

    if(action==='like') {
      likes.has(key)?likes.delete(key):likes.add(key);
      dislikes.delete(key);
    }
    if(action==='dislike') {
      dislikes.has(key)?dislikes.delete(key):dislikes.add(key);
      likes.delete(key);
    }
    if(action==='save') {
      if(saved.has(key)) {
        saved.delete(key);
        want.delete(key);
        visited.delete(key);
      } else {
        saved.add(key);
      }
    }
    if(action==='want') {
      if(want.has(key)) {
        want.delete(key);
      } else {
        want.add(key);
        visited.delete(key);
        saved.add(key);
      }
    }
    if(action==='visited') {
      if(visited.has(key)) {
        visited.delete(key);
      } else {
        visited.add(key);
        want.delete(key);
        saved.add(key);
      }
    }

    writeSet('roledfora.likes',likes);
    writeSet('roledfora.dislikes',dislikes);
    writeSet('roledfora.saved',saved);
    writeSet('roledfora.want',want);
    writeSet('roledfora.visited',visited);
    refreshCurrent();
  });
}

function applyQueryParam(selectId) {
  const city=new URLSearchParams(location.search).get('cidade');
  if(!city) return;
  const select=document.querySelector(selectId);
  if(select && [...select.options].some(o=>o.value===city)) select.value=city;
}

function bindFilters(page) {
  const search=document.querySelector('.search-button');
  if(search) search.addEventListener('click',()=>{
    state.visible=18;
    page==='eventos'?renderEventos():renderLugares();
  });
  document.querySelectorAll('.category-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const val=btn.dataset.category;
    const select=document.querySelector(page==='eventos'?'#tipo':'#categoria');
    if(select && val) {
      select.value=val;
      state.visible=18;
      page==='eventos'?renderEventos():renderLugares();
    }
  }));
  const more=document.querySelector('#show-more');
  if(more) more.addEventListener('click',()=>{
    state.visible+=18;
    page==='eventos'?renderEventos():renderLugares();
  });
}

function enhanceNav(page) {
  document.querySelectorAll('.utility-nav').forEach(nav=>{
    const saved=nav.querySelector('a[href="./salvos.html"]');
    if(saved) saved.textContent='⭐ salvos';
    let latest=nav.querySelector('a[href="./novidades.html"]');
    if(!latest) {
      latest=document.createElement('a');
      latest.href='./novidades.html';
      latest.textContent='✨ novidades';
      nav.prepend(latest);
    }
    nav.querySelectorAll('a').forEach(a=>a.classList.remove('auto-active'));
    if(page==='novidades') latest.classList.add('active','auto-active');
  });
}

function refreshCurrent() {
  const page=document.body.dataset.page;
  if(page==='eventos') renderEventos();
  else if(page==='lugares') renderLugares();
  else if(page==='indicacoes') renderIndicacoes();
  else if(page==='salvos') renderSalvos();
  else if(page==='mapa') renderMapa();
  else if(page==='novidades') renderNovidades();
}

async function init() {
  const page=document.body.dataset.page || '';
  enhanceNav(page);
  if(page==='roteiros') return;

  try {
    const [lugares,eventos]=await Promise.all([loadMany(DATA.lugares),loadMany(DATA.eventos)]);
    state.lugares=mergePlaceOverrides(lugares);
    state.eventos=eventos;

    if(page==='eventos') {
      populateCitySelect(document.querySelector('#local'),state.eventos,true);
      applyQueryParam('#local');
      bindFilters(page);
      renderEventos();
    }
    if(page==='lugares') {
      populateCitySelect(document.querySelector('#onde'),state.lugares,true);
      applyQueryParam('#onde');
      bindFilters(page);
      renderLugares();
    }
    if(page==='indicacoes') renderIndicacoes();
    if(page==='salvos') renderSalvos();
    if(page==='mapa') renderMapa();
    if(page==='novidades') renderNovidades();
  } catch(err) {
    console.error(err);
    document.querySelectorAll('.empty-state').forEach(target=>{
      target.textContent='não consegui carregar a base agora. tenta atualizar a página.';
    });
  }
}

bindFeedback();
init();