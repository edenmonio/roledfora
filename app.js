const DATA = {
  lugares: ['./data/lugares-1.json','./data/lugares-2.json','./data/lugares-3.json','./data/lugares-4.json','./data/lugares-5.json'],
  eventos: ['./data/eventos-1.json','./data/eventos-2.json']
};

const TAG_EMOJI = {
  'arte':'🎨','exposição':'🖼️','música':'🎵','música ao vivo':'🎵','show':'🎵','festa':'🎉','balada':'💃','dançante':'💃','madrugada':'🌙',
  'gastronomia':'🍴','comer':'🍴','café':'☕','doce':'🍰','padaria':'🥐','pizza':'🍕','hambúrguer':'🍔','sushi':'🍣','japonês':'🍣','vinho':'🍷',
  'lgbtqia+':'🌈','drag':'🌈','pet friendly':'🐾','ao ar livre':'🌿','natureza':'🌳','trilha':'🥾','trilhas':'🥾','cachoeira':'💦','cachoeiras':'💦',
  'cinema':'🎬','quadrinhos':'💬','games':'👾','nerd/geek':'👾','mangá':'📚','ilustração':'✏️','teatro':'🎭','comédia':'😂','oficina':'🧠','oficinas':'🧠',
  'curso':'🧠','gratuito':'🆓','família':'👨‍👩‍👧','infantil':'🧸','acessível':'♿','acesso pavimentado':'♿','date':'💞','date diferente':'💞','pôr do sol':'🌅',
  'passeio':'🚶','vista':'👀','mirante':'👀','arquitetura':'🏙️','história':'🏛️','museu':'🏛️','cultura':'🏛️','cultura popular':'🪗','compras':'🛍️','feira':'🛍️',
  'alternativo':'✨','aventura':'🧗','arvorismo':'🧗','escalada':'🧗','tirolesa':'🧗','parque':'🌳','lago':'💧','caminhada':'🚶','cidade histórica':'🏘️','viagem':'🚗'
};

const CATEGORY_EMOJI = {
  'festa':'🎉','show':'🎵','barzinho':'🍻','karaokê':'🎤','feira':'🛍️','brechó':'👕','exposição':'🖼️','cinema':'🎬','teatro':'🎭','lgbtqia+':'🌈',
  'gastronomia':'🍴','nerd/geek':'👾','ao ar livre':'🌿','workshop/curso':'🧠','universitário':'🎓','cultura e museus':'🏛️','parques e natureza':'🌳',
  'arquitetura':'🏙️','cafés':'☕','restaurantes':'🍽️','feiras e garimpo':'🛍️','noite':'🌙','experiências':'🎟️','bate-volta':'🚗','passeios locais':'📍'
};

const DF_CITIES = new Set(['brasília','df','águas claras','brazlândia','ceilândia','gama','guará','lago oeste','planaltina-df','samambaia','santa maria','sobradinho','taguatinga','vicente pires']);
const ENTORNO_SUL = new Set(['valparaíso de goiás','novo gama','cidade ocidental','luziânia']);
const ENTORNO_NORTE = new Set(['planaltina de goiás','formosa','águas lindas de goiás','santo antônio do descoberto']);

let state = { lugares: [], eventos: [], visible: 18, filtered: [] };

const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

async function loadMany(paths) {
  const chunks = await Promise.all(paths.map(path => fetch(path).then(r => { if (!r.ok) throw new Error(path); return r.json(); })));
  return chunks.flat();
}

function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
}
function writeSet(key, set) { localStorage.setItem(key, JSON.stringify([...set])); }
function itemKey(kind, id) { return `${kind}:${id}`; }

function formatDateRange(item) {
  if (!item.dataInicio) return '';
  const f = iso => new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'}).format(new Date(`${iso}T12:00:00Z`)).replace('.','');
  if (!item.dataFim || item.dataFim === item.dataInicio) return f(item.dataInicio);
  return `${f(item.dataInicio)} a ${f(item.dataFim)}`;
}

function tagChip(tag) {
  const emoji = TAG_EMOJI[norm(tag)] || '•';
  return `<span class="tag-chip" title="${esc(tag)}"><span class="emoji">${emoji}</span><span class="tag-name">${esc(tag)}</span></span>`;
}

function feedbackButtons(kind, item) {
  const key = itemKey(kind, item.id);
  const likes = readSet('roledfora.likes');
  const dislikes = readSet('roledfora.dislikes');
  const saved = readSet('roledfora.saved');
  return `
    <button class="save-btn ${saved.has(key)?'active':''}" data-action="save" data-key="${esc(key)}">${saved.has(key)?'★ salvo':'☆ salvar'}</button>
    <button class="feedback ${likes.has(key)?'active':''}" data-action="like" data-key="${esc(key)}">❤️ gostei</button>
    <button class="feedback ${dislikes.has(key)?'active':''}" data-action="dislike" data-key="${esc(key)}">👎 não gostei</button>`;
}

function eventCard(item) {
  const source = item.link ? `<a class="primary-link" href="${esc(item.link)}" target="_blank" rel="noopener">${norm(item.ingresso).includes('compra') || norm(item.ingresso).includes('inscrição') ? '🎟️ ingresso / inscrição' : '↗ fonte oficial'}</a>` : '';
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
    <div class="card-meta"><p>📍 ${esc(item.cidade)}</p><p>💰 ${esc(item.preco || 'não informado')}</p>${item.acesso ? `<p>🚌 ${esc(item.acesso)}</p>`:''}</div>
    ${item.descricao ? `<p class="desc">${esc(item.descricao)}</p>`:''}
    <div class="tags">${(item.tags||[]).map(tagChip).join('')}</div>
    <div class="source-note">${verified}</div>
    <div class="actions">
      <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener">📍 abrir no mapa</a>
      ${source}${feedbackButtons('place', item)}
    </div>
  </article>`;
}

function renderList(items, kind) {
  state.filtered = items;
  const target = document.querySelector('#results');
  const count = document.querySelector('#result-count');
  if (count) count.textContent = `${items.length} ${items.length===1 ? 'resultado' : 'resultados'}`;
  if (!target) return;
  if (!items.length) {
    target.innerHTML = `<div class="empty-state">não achei nada com esses filtros ainda 😭 tenta abrir um pouquinho a busca.</div>`;
    const more = document.querySelector('#show-more'); if (more) more.hidden = true;
    return;
  }
  const slice = items.slice(0, state.visible);
  target.innerHTML = slice.map(kind==='event' ? eventCard : placeCard).join('');
  const more = document.querySelector('#show-more');
  if (more) { more.hidden = slice.length >= items.length; more.textContent = `mostrar mais (${items.length-slice.length})`; }
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
  return c===norm(value);
}

function parseHour(text) {
  const m = (text||'').match(/\b(\d{1,2})h/); return m ? Number(m[1]) : null;
}
function timeMatches(item, value) {
  if (!value || value==='qualquer') return true;
  const h = parseHour(item.horario); if (h===null) return false;
  if (value==='manha') return h<12;
  if (value==='tarde') return h>=12 && h<18;
  if (value==='noite') return h>=18 && h<24;
  if (value==='madrugada') return h<6 || norm(item.horario).includes('madrugada');
  return true;
}
function localMidnight(date=new Date()) { return new Date(date.getFullYear(),date.getMonth(),date.getDate()); }
function dayFromISO(iso) { const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d); }
function eventDateMatches(item, value) {
  if (!value || value==='qualquer') return true;
  const today = localMidnight();
  const start = dayFromISO(item.dataInicio); const end = dayFromISO(item.dataFim || item.dataInicio);
  const intersects = (a,b) => end>=a && start<=b;
  if (value==='hoje') return intersects(today,today);
  if (value==='amanha') { const d=new Date(today); d.setDate(d.getDate()+1); return intersects(d,d); }
  if (value==='7dias') { const d=new Date(today); d.setDate(d.getDate()+7); return intersects(today,d); }
  if (value==='mes') { const a=new Date(today.getFullYear(),today.getMonth(),1), b=new Date(today.getFullYear(),today.getMonth()+1,0); return intersects(a,b); }
  if (value==='fim-semana') {
    const a=new Date(today); const delta=(6-a.getDay()+7)%7; a.setDate(a.getDate()+delta); const b=new Date(a); b.setDate(b.getDate()+1); return intersects(a,b);
  }
  return true;
}

function sortEvents(items) { return [...items].sort((a,b)=>a.dataInicio.localeCompare(b.dataInicio) || a.nome.localeCompare(b.nome)); }

function populateCitySelect(select, items, groups=true) {
  if (!select) return;
  const current = select.value;
  const cities = [...new Set(items.map(x=>x.cidade).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  select.innerHTML = `<option value="qualquer">qualquer lugar</option>${groups?'<option value="df">distrito federal</option><option value="entorno-sul">entorno sul</option><option value="entorno-norte">entorno norte</option>':''}${cities.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}`;
  if ([...select.options].some(o=>o.value===current)) select.value=current;
}

function renderEventos() {
  state.visible = state.visible || 18;
  const local=document.querySelector('#local')?.value||'qualquer';
  const data=document.querySelector('#data')?.value||'qualquer';
  const valor=document.querySelector('#valor')?.value||'qualquer';
  const horario=document.querySelector('#horario')?.value||'qualquer';
  const tipo=document.querySelector('#tipo')?.value||'qualquer';
  const items=sortEvents(state.eventos.filter(e=>cityMatches(e.cidade,local)&&eventDateMatches(e,data)&&priceMatches(e,valor)&&timeMatches(e,horario)&&(tipo==='qualquer'||norm(e.categoria)===norm(tipo))));
  renderList(items,'event');
}

function renderLugares() {
  const local=document.querySelector('#onde')?.value||'qualquer';
  const cat=document.querySelector('#categoria')?.value||'qualquer';
  const vibe=document.querySelector('#vibe')?.value||'qualquer';
  const valor=document.querySelector('#preco')?.value||'qualquer';
  const items=state.lugares.filter(p=>cityMatches(p.cidade,local)&&(cat==='qualquer'||norm(p.categoria)===norm(cat))&&(vibe==='qualquer'||(p.tags||[]).some(t=>norm(t)===norm(vibe)))&&priceMatches(p,valor));
  renderList(items,'place');
}

function scoreItem(kind,item,likes,dislikes) {
  let score = kind==='event' ? 4 : 1;
  if (kind==='event') { const days=(dayFromISO(item.dataInicio)-localMidnight())/86400000; if (days>=0&&days<=7) score+=4; }
  const tokens=[norm(item.categoria),...(item.tags||[]).map(norm)];
  for (const key of likes) {
    const [k,id]=key.split(':'); const source=k==='event'?state.eventos:state.lugares; const liked=source.find(x=>x.id===id); if(!liked) continue;
    const likedTokens=[norm(liked.categoria),...(liked.tags||[]).map(norm)];
    score += tokens.filter(t=>likedTokens.includes(t)).length*2;
  }
  if (dislikes.has(itemKey(kind,item.id))) score-=100;
  return score;
}

function renderIndicacoes() {
  const likes=readSet('roledfora.likes'), dislikes=readSet('roledfora.dislikes');
  const upcoming=state.eventos.filter(e=>dayFromISO(e.dataFim||e.dataInicio)>=localMidnight()).map(x=>({kind:'event',item:x}));
  const places=state.lugares.map(x=>({kind:'place',item:x}));
  const mixed=[...upcoming,...places].sort((a,b)=>scoreItem(b.kind,b.item,likes,dislikes)-scoreItem(a.kind,a.item,likes,dislikes)).slice(0,24);
  const target=document.querySelector('#results'); const count=document.querySelector('#result-count');
  if(count) count.textContent=`${mixed.length} sugestões`;
  if(target) target.innerHTML=mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join('');
}

function renderSalvos() {
  const saved=readSet('roledfora.saved');
  const mixed=[];
  for(const key of saved){ const [kind,id]=key.split(':'); const item=(kind==='event'?state.eventos:state.lugares).find(x=>x.id===id); if(item) mixed.push({kind,item}); }
  const target=document.querySelector('#results'); const count=document.querySelector('#result-count');
  if(count) count.textContent=`${mixed.length} salvos`;
  if(!target) return;
  target.innerHTML=mixed.length?mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join(''):'<div class="empty-state">ainda não tem nada salvo. aperta ☆ salvar nos cards que eles aparecem aqui.</div>';
}

function renderMapa() {
  const target=document.querySelector('#results'); if(!target) return;
  const all=[...state.lugares.map(x=>({kind:'lugar',...x})),...state.eventos.map(x=>({kind:'evento',...x}))];
  const groups=[...new Set(all.map(x=>x.cidade))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  target.innerHTML=groups.map(city=>{
    const ps=state.lugares.filter(x=>x.cidade===city).length, es=state.eventos.filter(x=>x.cidade===city).length;
    const q=encodeURIComponent(city+', DF/GO');
    return `<article class="card compact-card"><span class="card-kind">📍 região</span><h3>${esc(city)}</h3><p>${ps} lugares · ${es} eventos na base</p><div class="actions"><a href="./lugares.html?cidade=${encodeURIComponent(city)}">conhecer</a><a href="./index.html?cidade=${encodeURIComponent(city)}">ver rolês</a><a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">abrir mapa</a></div></article>`;
  }).join('');
  const count=document.querySelector('#result-count'); if(count) count.textContent=`${groups.length} regiões/cidades`;
}

function bindFeedback() {
  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-action]'); if(!btn) return;
    const action=btn.dataset.action, key=btn.dataset.key;
    if(!key) return;
    const likes=readSet('roledfora.likes'), dislikes=readSet('roledfora.dislikes'), saved=readSet('roledfora.saved');
    if(action==='like'){ likes.has(key)?likes.delete(key):likes.add(key); dislikes.delete(key); writeSet('roledfora.likes',likes); writeSet('roledfora.dislikes',dislikes); }
    if(action==='dislike'){ dislikes.has(key)?dislikes.delete(key):dislikes.add(key); likes.delete(key); writeSet('roledfora.dislikes',dislikes); writeSet('roledfora.likes',likes); }
    if(action==='save'){ saved.has(key)?saved.delete(key):saved.add(key); writeSet('roledfora.saved',saved); }
    refreshCurrent();
  });
}

function applyQueryParam(selectId) {
  const city=new URLSearchParams(location.search).get('cidade'); if(!city) return;
  const select=document.querySelector(selectId); if(select && [...select.options].some(o=>o.value===city)) select.value=city;
}

function bindFilters(page) {
  const search=document.querySelector('.search-button'); if(search) search.addEventListener('click',()=>{state.visible=18; page==='eventos'?renderEventos():renderLugares();});
  document.querySelectorAll('.category-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const val=btn.dataset.category; const select=document.querySelector(page==='eventos'?'#tipo':'#categoria'); if(select && val){ select.value=val; state.visible=18; page==='eventos'?renderEventos():renderLugares(); }
  }));
  const more=document.querySelector('#show-more'); if(more) more.addEventListener('click',()=>{state.visible+=18; page==='eventos'?renderEventos():renderLugares();});
}

function refreshCurrent() {
  const page=document.body.dataset.page;
  if(page==='eventos') renderEventos();
  else if(page==='lugares') renderLugares();
  else if(page==='indicacoes') renderIndicacoes();
  else if(page==='salvos') renderSalvos();
  else if(page==='mapa') renderMapa();
}

async function init() {
  try {
    [state.lugares,state.eventos]=await Promise.all([loadMany(DATA.lugares),loadMany(DATA.eventos)]);
    const page=document.body.dataset.page;
    if(page==='eventos') { populateCitySelect(document.querySelector('#local'),state.eventos,true); applyQueryParam('#local'); bindFilters(page); renderEventos(); }
    if(page==='lugares') { populateCitySelect(document.querySelector('#onde'),state.lugares,true); applyQueryParam('#onde'); bindFilters(page); renderLugares(); }
    if(page==='indicacoes') renderIndicacoes();
    if(page==='salvos') renderSalvos();
    if(page==='mapa') renderMapa();
  } catch(err) {
    console.error(err); const target=document.querySelector('#results'); if(target) target.innerHTML='<div class="empty-state">não consegui carregar a base agora. tenta atualizar a página.</div>';
  }
}

bindFeedback();
init();
