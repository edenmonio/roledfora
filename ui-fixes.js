(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const rawTags = item => new Set((item?.tags || []).map(norm));

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
  const ENTORNO_SUL = new Set(['valparaiso de goias','novo gama','cidade ocidental','luziania','cristalina']);
  const ENTORNO_NORTE = new Set(['planaltina de goias','formosa','aguas lindas de goias','santo antonio do descoberto','cocalzinho de goias','padre bernardo']);

  const SAFE_WOMEN = new Set(['seguro para mulheres','ambiente seguro para mulheres','espaco seguro para mulheres','safe space mulheres','safe space para mulheres']);
  const SAFE_LGBT = new Set(['seguro para lgbt','seguro para lgbtqia+','ambiente seguro lgbt','ambiente seguro para lgbtqia+','espaco seguro lgbt','espaco seguro para lgbtqia+','safe space lgbt','safe space lgbtqia+']);

  const TAGS = {
    festival:['festival','🎪'], cinema:['cinema','🎬'], teatro:['teatro','🎭'], exposicao:['exposição','🖼️'], drag:['drag','👑'],
    show:['show','🎤'], festa:['festa','🎉'], karaoke:['karaokê','🎙️'], palestra:['palestra','🗣️'], oficina:['oficina','🛠️'],
    feira:['feira','🧺'], brecho:['brechó','👕'], corrida:['corrida','🏃'], games:['games','🎮'], rpg:['rpg','🎲'],
    cafe:['café','☕'], restaurante:['restaurante','🍽️'], museu:['museu','🏺'], parque:['parque','🌳'], bar:['bar','🍸'],
    cachoeira:['cachoeira','💦'], trilha:['trilha','🥾'], parqueAquatico:['parque aquático','🏊'],

    alternativo:['alternativo','✨'], lgbt:['lgbtqia+','🌈'], date:['bom para date','💞'], sozinho:['bom para ir sozinho','👤'],
    tranquilo:['tranquilo','😌'], dancante:['dançante','💃'], criancas:['bom para crianças','🧸'], familias:['para famílias','👨‍👩‍👧'],
    maior18:['18+','🔞'], universitario:['universitário','🎓'], maior60:['60+','👵'],

    arLivre:['ao ar livre','🌿'], musicaVivo:['música ao vivo','🎶'],

    acessivel:['acessível','♿'], pets:['aceita pets','🐾'], onibus:['ônibus perto','🚌'], metro:['metrô perto','🚇'],
    bicicleta:['bicicletário / ciclovia','🚲'], estacionamento:['estacionamento','🅿️'], carro:['melhor ir de carro','🚗'],
    vegana:['opção vegana','🌱'], vegetariana:['opção vegetariana','🥬'],

    seguroMulheres:['seguro para mulheres','🛡️'], seguroLgbt:['seguro para lgbtqia+','🏳️‍🌈'],

    cultura:['cultura','🏛️'], musica:['música','🎵'], arte:['arte','🎨'], humor:['humor','😂'], quadrinhos:['quadrinhos','💬'],
    tecnologia:['tecnologia','🤖'], pop:['pop','🎧'], rock:['rock','🎸'], mpb:['mpb','🎼'], forro:['forró','🪗'],
    piseiro:['piseiro','👢'], arquitetura:['arquitetura','🏙️'], historia:['história','📜'], compras:['compras','🛍️'], cerrado:['cerrado','🌾']
  };

  const add = (out,id) => { if (id && TAGS[id] && !out.includes(id)) out.push(id); };
  const hasExplicit = (item,set) => [...rawTags(item)].some(tag => set.has(tag));

  function isDf(itemOrCity) {
    const city = typeof itemOrCity === 'object' ? itemOrCity?.cidade : itemOrCity;
    try { return typeof isDfCity === 'function' && isDfCity(city); }
    catch { return false; }
  }

  function isInScope(item) {
    const city = norm(item?.cidade);
    return isDf(item) || ENTORNO.has(city);
  }

  function subtypeTags(item,kind) {
    const tags = rawTags(item), cat = norm(item.categoria), text = norm(`${item.nome || ''} ${item.descricao || ''}`), out = [];
    const has = (...values) => values.some(v => tags.has(norm(v)) || cat === norm(v));

    if (has('festival') || text.includes('festival')) add(out,'festival');
    if (has('cinema') || text.includes('cinema')) add(out,'cinema');
    if (has('teatro') || text.includes('teatro')) add(out,'teatro');
    if (has('drag') || text.includes('drag')) add(out,'drag');
    if (has('exposição') || text.includes('exposicao')) add(out,'exposicao');
    if (cat === 'show' || tags.has('show')) add(out,'show');
    if (cat === 'festa' || tags.has('festa') || tags.has('balada')) add(out,'festa');
    if (cat === 'karaoke' || tags.has('karaoke')) add(out,'karaoke');
    if (tags.has('palestra') || tags.has('palestras') || text.includes('palestra')) add(out,'palestra');
    if (tags.has('oficina') || tags.has('oficinas') || text.includes('oficina')) add(out,'oficina');
    if (cat === 'feira' || tags.has('feira')) add(out,'feira');
    if (cat === 'brecho' || tags.has('brecho')) add(out,'brecho');
    if (tags.has('corrida') || text.includes('corrida')) add(out,'corrida');
    if (tags.has('games') || tags.has('nerd/geek')) add(out,'games');
    if (tags.has('rpg')) add(out,'rpg');

    if (kind === 'place') {
      if (cat === 'cafes' || tags.has('cafe')) add(out,'cafe');
      if (cat === 'restaurantes' || tags.has('restaurante')) add(out,'restaurante');
      if (tags.has('museu') || text.includes('museu')) add(out,'museu');
      if (tags.has('parque') || text.includes('parque')) add(out,'parque');
      if (tags.has('bar') || /\bbar\b/.test(text)) add(out,'bar');
      if (cat === 'cachoeiras' || tags.has('cachoeira') || tags.has('cachoeiras') || text.includes('cachoeira')) add(out,'cachoeira');
      if (tags.has('trilha') || tags.has('trilhas')) add(out,'trilha');
      if (cat === 'parques aquaticos' || tags.has('parque aquatico')) add(out,'parqueAquatico');
    }
    return out;
  }

  function featureTags(item) {
    const tags = rawTags(item), access = norm(item.acesso), out = [];

    if (tags.has('acessivel')) add(out,'acessivel');
    if (tags.has('pet friendly') || tags.has('aceita pets')) add(out,'pets');
    if (tags.has('bom para criancas') || tags.has('kid friendly') || tags.has('infantil')) add(out,'criancas');
    if (tags.has('opcao vegana') || tags.has('vegano') || tags.has('vegana')) add(out,'vegana');
    if (tags.has('opcao vegetariana') || tags.has('vegetariano') || tags.has('vegetariana')) add(out,'vegetariana');
    if (tags.has('familia') || tags.has('familiar')) add(out,'familias');
    if (tags.has('18+') || tags.has('maiores de 18')) add(out,'maior18');
    if (tags.has('universitario') || tags.has('universitaria')) add(out,'universitario');
    if (tags.has('60+') || tags.has('idosos')) add(out,'maior60');
    if (tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt')) add(out,'lgbt');
    if (hasExplicit(item,SAFE_WOMEN)) add(out,'seguroMulheres');
    if (hasExplicit(item,SAFE_LGBT)) add(out,'seguroLgbt');
    if (tags.has('date') || tags.has('date diferente')) add(out,'date');
    if (tags.has('sozinho') || tags.has('solo') || tags.has('bom pra ir sozinho')) add(out,'sozinho');
    if (tags.has('tranquilo') || tags.has('calmo') || tags.has('relax')) add(out,'tranquilo');
    if (tags.has('dancante') || tags.has('balada')) add(out,'dancante');
    if (tags.has('alternativo')) add(out,'alternativo');
    if (tags.has('ao ar livre')) add(out,'arLivre');
    if (tags.has('musica ao vivo')) add(out,'musicaVivo');

    if (/onibus perto|ponto de onibus|parada de onibus|proximo a(?:o)? ponto de onibus/.test(access)) add(out,'onibus');
    if (/metro proximo|perto do metro|proximo a(?:o)? metro/.test(access)) add(out,'metro');
    if (/bicicletario|ciclovia/.test(access)) add(out,'bicicleta');
    if (access.includes('estacionamento')) add(out,'estacionamento');
    if (/carro facilita|carro recomendado|acesso de carro/.test(access)) add(out,'carro');

    return out;
  }

  function themeTags(item) {
    const tags = rawTags(item), out = [];
    const mapping = [
      [['cultura'],'cultura'], [['musica'],'musica'], [['arte','ilustracao'],'arte'], [['humor','comedia','stand-up'],'humor'],
      [['quadrinhos','manga'],'quadrinhos'], [['tecnologia'],'tecnologia'], [['pop'],'pop'], [['rock'],'rock'], [['mpb'],'mpb'],
      [['forro'],'forro'], [['piseiro'],'piseiro'], [['arquitetura'],'arquitetura'], [['historia','cidade historica'],'historia'],
      [['compras','shopping'],'compras'], [['cerrado'],'cerrado']
    ];
    mapping.forEach(([values,id]) => { if (values.some(v => tags.has(v))) add(out,id); });
    return out;
  }

  function visibleTagIds(item,kind) {
    const out = [];
    [...subtypeTags(item,kind),...featureTags(item),...themeTags(item)].forEach(id => add(out,id));
    return out.slice(0,4);
  }

  function chip(id) {
    const [label,emoji] = TAGS[id];
    const span = document.createElement('span');
    span.className = 'tag-chip';
    span.tabIndex = 0;
    span.title = label;
    span.setAttribute('aria-label',label);
    span.innerHTML = `<span class="emoji">${emoji}</span><span class="tag-name">${label}</span>`;
    return span;
  }

  function findItem(card,kind) {
    try {
      const source = kind === 'event' ? state.eventos : state.lugares;
      return source.find(item => item.id === card.dataset.id) || null;
    } catch { return null; }
  }

  function numericDate(iso) {
    if (!iso) return '';
    const [,m,d] = iso.split('-');
    return `${d}/${m}`;
  }

  function summarizeTime(value) {
    const raw = (value || '').trim(), text = norm(raw);
    if (!raw) return '';
    if (/varios horarios|ao longo do dia|programacao diaria|atividades em varios horarios/.test(text)) return 'vários horários';
    if (/consultar horario|horarios a divulgar/.test(text)) return 'horário a confirmar';
    const found = [...raw.matchAll(/\b(\d{1,2}h(?:\d{2})?|\d{1,2}:\d{2}h)\b/g)].map(m => m[1].replace(/(\d{1,2}):(\d{2})h/,'$1h$2'));
    if (!found.length) return raw.length <= 30 ? raw : 'horário a confirmar';
    if (/a partir/.test(text)) return `a partir de ${found[0]}`;
    if (found.length >= 2 && /(as|ate|às|até|-|–)/.test(text)) return `${found[0]}–${found[1]}`;
    return found[0];
  }

  function isFree(item) {
    const text = norm(`${item.preco || ''} ${item.ingresso || ''}`);
    return item.precoFaixa === 'gratis' || /gratuit|gratis|entrada livre|entrada franca/.test(text);
  }

  function normalizedEntry(item) {
    const ingresso = norm(item.ingresso), text = `${ingresso} ${norm(item.preco)}`, free = isFree(item);
    const paid = (item.precoFaixa && !['gratis','nao-informado'].includes(item.precoFaixa)) || /\bcompra\b|\bvenda\b|pago/.test(ingresso);
    if (/contribui/.test(text)) return 'contribuição voluntária';
    if (free && /retirada|retirar|reserva|reservar/.test(ingresso)) return 'grátis · retirada obrigatória';
    if (free && /inscri/.test(ingresso)) return 'grátis · inscrição obrigatória';
    if (free) return 'grátis';
    if (paid) return 'pago';
    return 'consultar condições';
  }

  function compactEventMeta(card,item) {
    const meta = card.querySelector('.card-meta');
    if (!meta) return;
    const lines = meta.querySelectorAll('p');
    if (!lines.length) return;
    const start = numericDate(item.dataInicio), end = numericDate(item.dataFim || item.dataInicio);
    lines[0].textContent = `📅 ${start}${end && end !== start ? `–${end}` : ''}`;

    const time = summarizeTime(item.horario);
    let timeLine = meta.querySelector('.time-detail');
    if (time) {
      if (!timeLine) {
        timeLine = document.createElement('p');
        timeLine.className = 'time-detail';
        lines[0].insertAdjacentElement('afterend',timeLine);
      }
      timeLine.textContent = `🕐 ${time}`;
    } else if (timeLine) timeLine.remove();

    const moneyLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('💰'));
    let entryLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('🎟️'));
    if (!entryLine) {
      entryLine = document.createElement('p');
      moneyLine ? moneyLine.insertAdjacentElement('afterend',entryLine) : meta.append(entryLine);
    }
    entryLine.textContent = `🎟️ ${normalizedEntry(item)}`;
    if (isFree(item) && moneyLine) moneyLine.remove();
  }

  function compactPlaceLocation(card,item) {
    const city = norm(item.cidade);
    if (!ENTORNO.has(city)) return;
    const line = [...card.querySelectorAll('.card-meta p')].find(p => p.textContent.trim().startsWith('📍'));
    if (!line) return;
    const bairro = item.bairro ? `${item.bairro} · ` : '';
    line.textContent = `📍 ${bairro}${ENTORNO.get(city)} · entorno`;
  }

  function removeLegacyActions(card) {
    card.querySelectorAll('.feedback,.status-btn,.saved-status-row').forEach(el => el.remove());
  }

  function polishCard(card) {
    const kind = card.classList.contains('event-card') ? 'event' : card.classList.contains('place-card') ? 'place' : null;
    if (!kind) return;
    const item = findItem(card,kind);
    if (!item) return;
    const box = card.querySelector('.tags');
    if (box) {
      const ids = visibleTagIds(item,kind), signature = ids.join('|');
      if (card.dataset.officialTags !== signature) {
        box.replaceChildren(...ids.map(chip));
        box.hidden = ids.length === 0;
        card.dataset.officialTags = signature;
      }
    }
    if (kind === 'event') compactEventMeta(card,item);
    if (kind === 'place') compactPlaceLocation(card,item);
    removeLegacyActions(card);
  }

  function polishRouteCard(card) {
    const text = norm(card.textContent), ids = [];
    if (text.includes('cinema')) add(ids,'cinema');
    if (text.includes('arquitetura')) add(ids,'arquitetura');
    if (text.includes('cultura')) add(ids,'cultura');
    if (text.includes('feira')) add(ids,'feira');
    if (text.includes('cachoeira')) add(ids,'cachoeira');
    if (text.includes('trilha')) add(ids,'trilha');
    if (text.includes('parque')) add(ids,'parque');
    const box = card.querySelector('.tags') || (() => {
      const el = document.createElement('div'); el.className = 'tags';
      const actions = card.querySelector('.actions'); actions ? actions.insertAdjacentElement('beforebegin',el) : card.append(el); return el;
    })();
    box.replaceChildren(...ids.slice(0,4).map(chip));
    box.hidden = ids.length === 0;
  }

  function readSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  }
  function writeSet(key,set) { localStorage.setItem(key,JSON.stringify([...set])); }
  function cleanupLegacyStorage() {
    const saved = readSet('roledfora.saved');
    [...readSet('roledfora.want'),...readSet('roledfora.visited')].forEach(key => saved.add(key));
    writeSet('roledfora.saved',saved);
    ['roledfora.want','roledfora.visited','roledfora.likes','roledfora.dislikes'].forEach(key => localStorage.removeItem(key));
  }

  function cleanNavigation() {
    document.querySelectorAll('.utility-nav a[href="./mapa.html"]').forEach(a => a.remove());
    document.querySelectorAll('a[href="./indicacoes.html"]').forEach(a => { a.href='./profissionais.html'; a.textContent='profissionais'; });
    document.querySelectorAll('.utility-nav a[href="./roteiros.html"]').forEach(a => a.textContent='🧭 roteiros');
    document.querySelectorAll('.utility-nav a[href="./contato.html"]').forEach(a => a.textContent='💌 contato');
  }

  function optionNode(value,label) {
    const o = document.createElement('option'); o.value = value; o.textContent = label; return o;
  }

  function populateLocationSelect(select,items) {
    if (!select) return;
    const current = select.value;
    const cities = [...new Set((items || []).map(item => item.cidade).filter(Boolean))];
    const df = cities.filter(city => isDf(city)).map(city => {
      let label = city;
      try { label = typeof dfRaName === 'function' ? dfRaName(city) : city; } catch {}
      return {value:city,label};
    }).sort((a,b) => a.label.localeCompare(b.label,'pt-BR'));

    select.replaceChildren(optionNode('qualquer','qualquer lugar'));

    const dfGroup = document.createElement('optgroup');
    dfGroup.label = 'distrito federal';
    dfGroup.append(optionNode('df','todo o distrito federal'));
    df.forEach(item => dfGroup.append(optionNode(item.value,item.label)));
    select.append(dfGroup);

    const entornoGroup = document.createElement('optgroup');
    entornoGroup.label = 'entorno';
    entornoGroup.append(optionNode('entorno','todo o entorno'));
    [...ENTORNO.entries()].sort((a,b) => a[1].localeCompare(b[1],'pt-BR')).forEach(([value,label]) => entornoGroup.append(optionNode(value,label)));
    select.append(entornoGroup);

    if ([...select.options].some(o => norm(o.value) === norm(current))) {
      const match = [...select.options].find(o => norm(o.value) === norm(current));
      if (match) select.value = match.value;
    }
  }

  function cityMatchesOfficial(city,value) {
    if (!value || value === 'qualquer') return true;
    const c = norm(city), v = norm(value);
    if (v === 'df') return isDf(city);
    if (v === 'entorno') return ENTORNO.has(c);
    if (v === 'entorno-sul') return ENTORNO_SUL.has(c);
    if (v === 'entorno-norte') return ENTORNO_NORTE.has(c);
    return c === v;
  }

  function characteristicMatches(item,value) {
    if (!value || value === 'qualquer') return true;
    const tags = rawTags(item), access = norm(item.acesso);
    if (value === 'acessivel') return tags.has('acessivel');
    if (value === 'aceita-pets') return tags.has('pet friendly') || tags.has('aceita pets');
    if (value === 'alternativo') return tags.has('alternativo');
    if (value === 'ao-ar-livre') return tags.has('ao ar livre');
    if (value === 'aventura') return ['aventura','trilha','trilhas','arvorismo','escalada','tirolesa'].some(tag => tags.has(tag));
    if (value === 'bicicleta') return /bicicletario|ciclovia/.test(access);
    if (value === 'bom-criancas') return tags.has('bom para criancas') || tags.has('kid friendly') || tags.has('infantil');
    if (value === 'date') return tags.has('date') || tags.has('date diferente');
    if (value === 'sozinho') return tags.has('sozinho') || tags.has('solo') || tags.has('bom pra ir sozinho');
    if (value === 'estacionamento') return tags.has('estacionamento') || access.includes('estacionamento');
    if (value === 'lgbtqia') return tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt');
    if (value === 'carro-recomendado') return /carro facilita|carro recomendado|acesso de carro/.test(access);
    if (value === 'metro-perto') return /metro proximo|perto do metro|proximo a(?:o)? metro/.test(access);
    if (value === 'musica-vivo') return tags.has('musica ao vivo');
    if (value === 'onibus-perto') return /onibus perto|ponto de onibus|parada de onibus|proximo a(?:o)? ponto de onibus/.test(access);
    if (value === 'opcao-vegana') return tags.has('opcao vegana') || tags.has('vegano') || tags.has('vegana');
    if (value === 'opcao-vegetariana') return tags.has('opcao vegetariana') || tags.has('vegetariano') || tags.has('vegetariana');
    if (value === 'familias') return tags.has('familia') || tags.has('familiar');
    if (value === 'seguro-lgbt') return hasExplicit(item,SAFE_LGBT);
    if (value === 'seguro-mulheres') return hasExplicit(item,SAFE_WOMEN);
    if (value === 'tranquilo') return tags.has('tranquilo') || tags.has('calmo') || tags.has('relax');
    if (value === 'universitario') return tags.has('universitario') || tags.has('universitaria');
    if (value === '18mais') return tags.has('18+') || tags.has('maiores de 18');
    if (value === 'dancante') return tags.has('dancante') || tags.has('balada');
    return true;
  }

  function canonicalName(item) {
    return norm(item?.nome).replace(/\b2026\b/g,'').replace(/[:—–-]+/g,' ').replace(/\s+/g,' ').trim();
  }
  function cleanLink(link) {
    return norm((link || '').split('?')[0].replace(/\/$/,''));
  }
  function dedupeEvents(items) {
    const seenLinks = new Set(), seenSignatures = new Set();
    return (items || []).filter(item => {
      const link = cleanLink(item.link);
      const signature = `${canonicalName(item)}|${item.dataInicio || ''}|${norm(item.cidade)}`;
      if ((link && seenLinks.has(link)) || seenSignatures.has(signature)) return false;
      if (link) seenLinks.add(link);
      seenSignatures.add(signature);
      return true;
    });
  }

  function installOverrides() {
    try { cityMatches = cityMatchesOfficial; } catch {}
    try {
      renderEventos = function() {
        const local=document.querySelector('#local')?.value||'qualquer', data=document.querySelector('#data')?.value||'qualquer', valor=document.querySelector('#valor')?.value||'qualquer', horario=document.querySelector('#horario')?.value||'qualquer', tipo=document.querySelector('#tipo')?.value||'qualquer', feature=document.querySelector('#caracteristica')?.value||'qualquer', detail=new URLSearchParams(location.search).get('detalhe');
        const items=sortEvents(state.eventos.filter(e=>isInScope(e)&&cityMatchesOfficial(e.cidade,local)&&eventDateMatches(e,data)&&priceMatches(e,valor)&&timeMatches(e,horario)&&(tipo==='qualquer'||canonicalEventCategory(e)===tipo)&&characteristicMatches(e,feature)&&detailMatches(e,detail)));
        renderList(items,'event');
      };
    } catch {}
    try {
      renderLugares = function() {
        const local=document.querySelector('#onde')?.value||'qualquer', cat=document.querySelector('#categoria')?.value||'qualquer', feature=document.querySelector('#vibe')?.value||'qualquer', valor=document.querySelector('#preco')?.value||'qualquer', detail=new URLSearchParams(location.search).get('detalhe');
        const items=state.lugares.filter(p=>isInScope(p)&&cityMatchesOfficial(p.cidade,local)&&(cat==='qualquer'||canonicalPlaceCategory(p)===cat)&&characteristicMatches(p,feature)&&priceMatches(p,valor)&&detailMatches(p,detail));
        renderList(items,'place');
      };
    } catch {}
    try { renderSalvos = function() { renderSavedGrid(readSet('roledfora.saved'),'saved-results','saved-count'); }; } catch {}
  }

  function syncLocationSelects() {
    try {
      const page = document.body.dataset.page;
      if (page === 'eventos') populateLocationSelect(document.querySelector('#local'),state.eventos);
      if (page === 'lugares') populateLocationSelect(document.querySelector('#onde'),state.lugares);
    } catch {}
  }

  let scoped = false;
  function scopeStateWhenReady(tries=0) {
    try {
      if (typeof state === 'undefined' || (!state.lugares?.length && !state.eventos?.length)) {
        if (tries < 100) setTimeout(() => scopeStateWhenReady(tries+1),80);
        return;
      }
      if (!scoped) {
        state.lugares = state.lugares.filter(isInScope);
        state.eventos = dedupeEvents(state.eventos.filter(isInScope));
        scoped = true;
        syncLocationSelects();
        if (typeof refreshCurrent === 'function') refreshCurrent();
      }
      apply();
    } catch { if (tries < 100) setTimeout(() => scopeStateWhenReady(tries+1),80); }
  }

  let extraStarted = false;
  async function loadExtraEvents() {
    const page = document.body.dataset.page;
    if (!['eventos','novidades','salvos'].includes(page) || extraStarted) return;
    extraStarted = true;
    try {
      const response = await fetch('./data/eventos-4.json',{cache:'no-store'});
      if (!response.ok) throw new Error('eventos-4');
      const extra = await response.json();
      let tries = 0;
      const mergeWhenReady = () => {
        try {
          if (typeof state === 'undefined' || !Array.isArray(state.eventos)) {
            if (tries++ < 80) setTimeout(mergeWhenReady,100);
            return;
          }
          state.eventos = dedupeEvents([...state.eventos,...extra.filter(isInScope)]);
          syncLocationSelects();
          if (typeof refreshCurrent === 'function') refreshCurrent();
          apply();
        } catch { if (tries++ < 80) setTimeout(mergeWhenReady,100); }
      };
      mergeWhenReady();
    } catch (err) { console.warn('não foi possível carregar os rolês extras',err); }
  }

  function gateInitialResults() {
    const page = document.body.dataset.page;
    if (!['eventos','lugares'].includes(page)) return;
    if (new URLSearchParams(location.search).toString()) return;
    const section = document.querySelector('.search-results-section');
    if (section && ![...document.querySelectorAll('.search-panel select')].some(s => s.value && s.value !== 'qualquer')) section.hidden = true;
  }

  function apply() {
    cleanNavigation();
    document.querySelectorAll('.event-card,.place-card').forEach(polishCard);
    document.querySelectorAll('.route-card').forEach(polishRouteCard);
    gateInitialResults();
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  });

  installOverrides();
  document.addEventListener('DOMContentLoaded',() => {
    cleanupLegacyStorage();
    apply();
    scopeStateWhenReady();
    loadExtraEvents();
    observer.observe(document.body,{childList:true,subtree:true});
    if (document.body.dataset.page === 'salvos') setTimeout(() => { try { if (typeof refreshCurrent === 'function') refreshCurrent(); } catch {} },0);
  });
})();
