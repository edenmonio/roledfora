(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const rawTags = item => new Set((item.tags || []).map(norm));

  const TAGS = {
    festival:['festival','🎪'], cinema:['cinema','🎬'], teatro:['teatro','🎭'], exposicao:['exposição','🖼️'], drag:['drag','👑'],
    show:['show','🎤'], festa:['festa','🎉'], karaoke:['karaokê','🎤'], palestra:['palestra','🗣️'], oficina:['oficina','🛠️'],
    feira:['feira','🧺'], brecho:['brechó','👕'], corrida:['corrida','🏃'], games:['games','🎮'], rpg:['rpg','🎲'],
    cafe:['café','☕'], restaurante:['restaurante','🍽️'], cachoeira:['cachoeira','💦'], trilha:['trilha','🥾'], parqueAquatico:['parque aquático','🏊'],
    manha:['manhã','🌅'], tarde:['tarde','☀️'], noite:['noite','🌆'], madrugada:['madrugada','🌙'],
    acessivel:['acessível','♿'], pets:['aceita pets','🐾'], criancas:['bom para crianças','🧸'], vegana:['opção vegana','🌱'], vegetariana:['opção vegetariana','🥬'],
    familias:['para famílias','👨‍👩‍👧'], jovens:['jovens','🧑‍🎓'], maior18:['18+','🔞'], universitario:['universitário','🎓'], lgbt:['lgbtqia+','🌈'], maior60:['60+','👵'],
    date:['bom para date','💞'], sozinho:['bom para ir sozinho','👤'], tranquilo:['tranquilo','😌'], dancante:['dançante','💃'], alternativo:['alternativo','✨'],
    arLivre:['ao ar livre','🌿'], musicaVivo:['música ao vivo','🎵'], agua:['água','💦'], porSol:['pôr do sol','🌇'],
    metro:['metrô próximo','🚇'], bicicleta:['acesso de bicicleta','🚲'], estacionamento:['estacionamento','🅿️'], carro:['carro recomendado','🚗'],
    cultura:['cultura','🏛️'], musica:['música','🎵'], arte:['arte','🎨'], humor:['humor','😂'], quadrinhos:['quadrinhos','💬'], tecnologia:['tecnologia','🤖'],
    pop:['pop','🎧'], rock:['rock','🎸'], mpb:['mpb','🎵'], forro:['forró','🪗'], piseiro:['piseiro','💃'], arquitetura:['arquitetura','🏙️'],
    historia:['história','🏛️'], museu:['museu','🏛️'], parque:['parque','🌳'], compras:['compras','🛍️'], viagem:['viagem','🚗'], cerrado:['cerrado','🌿'], chapada:['chapada','⛰️'],
    df:['df','📍'], goias:['goiás','🌾'], entorno:['entorno','📍'], evento:['evento','📅'], lugar:['lugar','📌'], programacao:['programação','🗓️'], conhecer:['para conhecer','🧭'],
    roteiro:['roteiro','↝'], combinar:['combinar lugares','🧩'], dia:['planejar o dia','🗓️'],
    catFestas:['festas & noite','🎉'], catShows:['shows & música','🎵'], catCultura:['cultura & artes','🎭'], catFeiras:['feiras & brechós','🛍️'],
    catGastronomia:['gastronomia','🍴'], catGeek:['geek','👾'], catCursos:['cursos & atividades','🧠'], catArLivre:['ao ar livre','🌿'],
    catCulturaHistoria:['cultura & história','🏛️'], catNatureza:['natureza','🌳'], catArquitetura:['arquitetura & pontos turísticos','🏙️'], catComer:['comer','🍽️'],
    catBares:['bares & noite','🍸'], catCinemaTeatro:['cinema & teatro','🎬'], catFeirasCompras:['feiras & compras','🛍️'], catLazer:['lazer & experiências','🎟️'], catDestinos:['cidades & destinos','🏘️']
  };

  const ENTORNO_SUL = new Set(['valparaiso de goias','novo gama','cidade ocidental','luziania']);
  const ENTORNO_NORTE = new Set(['planaltina de goias','formosa','aguas lindas de goias','santo antonio do descoberto']);

  function add(out,id) {
    if (id && TAGS[id] && !out.includes(id)) out.push(id);
  }

  function subtypeTags(item,kind) {
    const tags = rawTags(item);
    const cat = norm(item.categoria);
    const text = norm(`${item.nome || ''} ${item.descricao || ''}`);
    const out = [];
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
      if (cat === 'cachoeiras' || tags.has('cachoeira') || tags.has('cachoeiras') || text.includes('cachoeira')) add(out,'cachoeira');
      if (tags.has('trilha') || tags.has('trilhas')) add(out,'trilha');
      if (cat === 'parques aquaticos' || tags.has('parque aquatico')) add(out,'parqueAquatico');
    }
    return out;
  }

  function timeTag(item) {
    const text = norm(`${item.horario || ''} ${(item.tags || []).join(' ')}`);
    if (/varios horarios|ao longo do dia|programacao diaria|atividades em varios horarios/.test(text)) return null;
    if (text.includes('madrugada')) return 'madrugada';
    const matches = [...(item.horario || '').matchAll(/\b(\d{1,2})(?::(\d{2}))?h/g)];
    if (!matches.length) return null;
    const hours = matches.map(m => Number(m[1]));
    if (hours.some(h => h < 6) && hours.some(h => h >= 18)) return 'madrugada';
    const h = hours[0];
    if (h < 6) return 'madrugada';
    if (h < 12) return 'manha';
    if (h < 18) return 'tarde';
    return 'noite';
  }

  function featureTags(item,kind) {
    const tags = rawTags(item);
    const text = norm(`${item.acesso || ''} ${item.descricao || ''} ${(item.tags || []).join(' ')}`);
    const out = [];
    if (kind === 'event') add(out,timeTag(item));

    if (tags.has('acessivel')) add(out,'acessivel');
    if (tags.has('pet friendly') || tags.has('aceita pets')) add(out,'pets');
    if (tags.has('bom para criancas') || tags.has('kid friendly')) add(out,'criancas');
    if (tags.has('opcao vegana') || tags.has('vegano') || tags.has('vegana')) add(out,'vegana');
    if (tags.has('opcao vegetariana') || tags.has('vegetariano') || tags.has('vegetariana')) add(out,'vegetariana');
    if (tags.has('familia') || tags.has('familiar')) add(out,'familias');
    if (tags.has('jovens') || tags.has('juventude')) add(out,'jovens');
    if (tags.has('18+') || text.includes('maiores de 18')) add(out,'maior18');
    if (tags.has('universitario') || tags.has('universitaria')) add(out,'universitario');
    if (tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt')) add(out,'lgbt');
    if (tags.has('60+') || tags.has('idosos')) add(out,'maior60');
    if (tags.has('date') || tags.has('date diferente')) add(out,'date');
    if (tags.has('sozinho') || tags.has('solo')) add(out,'sozinho');
    if (tags.has('tranquilo') || tags.has('calmo')) add(out,'tranquilo');
    if (tags.has('dancante') || tags.has('balada')) add(out,'dancante');
    if (tags.has('alternativo')) add(out,'alternativo');
    if (tags.has('ao ar livre')) add(out,'arLivre');
    if (tags.has('musica ao vivo')) add(out,'musicaVivo');
    if (['agua','cachoeira','cachoeiras','lago','pocos','aguas termais','parque aquatico'].some(t => tags.has(t))) add(out,'agua');
    if (tags.has('por do sol')) add(out,'porSol');

    if (kind === 'place') {
      if (/metro proximo|perto do metro/.test(text)) add(out,'metro');
      if (/bicicletario|ciclovia/.test(text)) add(out,'bicicleta');
      if (text.includes('estacionamento')) add(out,'estacionamento');
      if (/carro facilita|carro recomendado|acesso de carro/.test(text)) add(out,'carro');
    }
    return out;
  }

  function descriptorTags(item) {
    const tags = rawTags(item);
    const out = [];
    const mapping = [
      [['cultura'],'cultura'], [['musica'],'musica'], [['arte','ilustracao'],'arte'], [['humor','comedia','stand-up'],'humor'],
      [['quadrinhos','manga'],'quadrinhos'], [['tecnologia'],'tecnologia'], [['pop'],'pop'], [['rock'],'rock'], [['mpb'],'mpb'],
      [['forro'],'forro'], [['piseiro'],'piseiro'], [['arquitetura'],'arquitetura'], [['historia','cidade historica'],'historia'],
      [['museu'],'museu'], [['parque'],'parque'], [['compras','shopping'],'compras'], [['viagem'],'viagem'], [['cerrado'],'cerrado'], [['chapada'],'chapada']
    ];
    mapping.forEach(([values,id]) => { if (values.some(v => tags.has(v))) add(out,id); });
    return out;
  }

  function categoryFallback(item,kind) {
    const out = [];
    try {
      const id = categoryInfo(kind,item).id;
      const mapping = {
        'festas-noite':'catFestas','shows-musica':'catShows','cultura-artes':'catCultura','feiras-brechos':'catFeiras',
        'gastronomia':'catGastronomia','geek':'catGeek','cursos-atividades':'catCursos','ao-ar-livre':'catArLivre',
        'cultura-historia':'catCulturaHistoria','natureza':'catNatureza','arquitetura-turismo':'catArquitetura','comer':'catComer',
        'bares-noite':'catBares','cinema-teatro':'catCinemaTeatro','feiras-compras':'catFeirasCompras','lazer-experiencias':'catLazer','cidades-destinos':'catDestinos'
      };
      add(out,mapping[id]);
    } catch {}
    return out;
  }

  function regionTags(item) {
    const out = [];
    const city = norm(item.cidade);
    if (ENTORNO_SUL.has(city) || ENTORNO_NORTE.has(city)) add(out,'entorno');
    else {
      try {
        if (typeof isDfCity === 'function' && isDfCity(item.cidade)) add(out,'df');
        else add(out,'goias');
      } catch { add(out,'goias'); }
    }
    return out;
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

  function rebuildTags(card,item,kind) {
    const box = card.querySelector('.tags');
    if (!box) return;
    const ids = [];
    [
      ...subtypeTags(item,kind), ...featureTags(item,kind), ...descriptorTags(item),
      ...categoryFallback(item,kind), ...regionTags(item),
      ...(kind === 'event' ? ['evento','programacao'] : ['lugar','conhecer'])
    ].forEach(id => add(ids,id));
    while (ids.length < 4) add(ids,kind === 'event' ? 'evento' : 'lugar');
    box.replaceChildren(...ids.slice(0,4).map(chip));
    box.hidden = false;
  }

  function polishRouteCard(card) {
    if (card.dataset.routePolished === '1') return;
    let box = card.querySelector('.tags');
    if (!box) {
      box = document.createElement('div');
      box.className = 'tags';
      const actions = card.querySelector('.actions');
      if (actions) actions.insertAdjacentElement('beforebegin',box);
      else card.append(box);
    }
    const text = norm(card.textContent);
    const ids = [];
    if (text.includes('cinema')) add(ids,'cinema');
    if (text.includes('arquitetura')) add(ids,'arquitetura');
    if (text.includes('cultura')) add(ids,'cultura');
    if (text.includes('feira')) add(ids,'feira');
    if (text.includes('cachoeira')) { add(ids,'cachoeira'); add(ids,'agua'); add(ids,'trilha'); }
    if (text.includes('chapada')) { add(ids,'chapada'); add(ids,'viagem'); }
    if (text.includes('entorno')) add(ids,'entorno');
    add(ids,'roteiro'); add(ids,'combinar'); add(ids,'dia'); add(ids,'conhecer');
    box.replaceChildren(...ids.slice(0,4).map(chip));
    card.dataset.routePolished = '1';
  }

  function numericDate(iso) {
    if (!iso) return '';
    const [,m,d] = iso.split('-');
    return `${d}/${m}`;
  }

  function summarizeTime(value) {
    const raw = (value || '').trim();
    const text = norm(raw);
    if (!raw) return '';
    if (/varios horarios|ao longo do dia|programacao diaria|atividades em varios horarios/.test(text)) return 'vários horários';
    if (/consultar horario/.test(text)) return 'horário a confirmar';
    const found = [...raw.matchAll(/\b(\d{1,2}(?::\d{2})?h)\b/g)].map(m => m[1]);
    if (!found.length) return raw.length <= 28 ? raw : 'horário a confirmar';
    if (/a partir/.test(text)) return `a partir de ${found[0]}`;
    if (found.length >= 2 && /(as|ate|-)/.test(text)) return `${found[0]}–${found[1]}`;
    return found[0];
  }

  function normalizedEntry(item) {
    const ingresso = norm(item.ingresso);
    const preco = norm(item.preco);
    const text = `${ingresso} ${preco}`;
    const free = item.precoFaixa === 'gratis' || /gratuit|gratis|entrada livre|entrada franca/.test(text);
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
    const start = numericDate(item.dataInicio);
    const end = numericDate(item.dataFim || item.dataInicio);
    lines[0].textContent = `📅 ${start}${end && end !== start ? `–${end}` : ''}`;

    let timeLine = meta.querySelector('.time-detail');
    const time = summarizeTime(item.horario);
    if (time) {
      if (!timeLine) {
        timeLine = document.createElement('p');
        timeLine.className = 'time-detail';
        lines[0].insertAdjacentElement('afterend',timeLine);
      }
      timeLine.textContent = `🕐 ${time}`;
    } else if (timeLine) timeLine.remove();

    const entryLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('🎟️'));
    if (entryLine) entryLine.textContent = `🎟️ ${normalizedEntry(item)}`;
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
    localStorage.removeItem('roledfora.want');
    localStorage.removeItem('roledfora.visited');
    localStorage.removeItem('roledfora.likes');
    localStorage.removeItem('roledfora.dislikes');
  }

  function removeLegacyActions(card) {
    card.querySelectorAll('.feedback,.status-btn,.saved-status-row').forEach(el => el.remove());
  }

  function findItem(card,kind) {
    try {
      const source = kind === 'event' ? state.eventos : state.lugares;
      return source.find(item => item.id === card.dataset.id) || null;
    } catch { return null; }
  }

  function polishCard(card) {
    const kind = card.classList.contains('event-card') ? 'event' : card.classList.contains('place-card') ? 'place' : null;
    if (!kind) return;
    const item = findItem(card,kind);
    if (!item) return;
    if (card.dataset.polished !== '1') {
      rebuildTags(card,item,kind);
      if (kind === 'event') compactEventMeta(card,item);
      card.dataset.polished = '1';
    }
    removeLegacyActions(card);
  }

  function cleanNavigation() {
    document.querySelectorAll('.utility-nav a[href="./mapa.html"]').forEach(a => a.remove());
    document.querySelectorAll('a[href="./indicacoes.html"]').forEach(a => {
      a.href = './profissionais.html';
      a.textContent = 'profissionais';
      a.classList.remove('active');
    });
  }

  function optionNode(value,label) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    return o;
  }

  function groupNode(label,broadValue,broadLabel,items) {
    const group = document.createElement('optgroup');
    group.label = label;
    group.append(optionNode(broadValue,broadLabel));
    items.forEach(item => group.append(optionNode(item.value,item.label)));
    return group;
  }

  function organizeLocationSelect(select) {
    if (!select || select.dataset.locationOrganized === '1') return;
    const options = [...select.options];
    if (options.length < 3) return;

    const dfItems = options.filter(o => o.parentElement?.tagName === 'OPTGROUP' && norm(o.parentElement.label).includes('regioes administrativas'))
      .map(o => ({value:o.value,label:o.textContent}));
    const goItems = options.filter(o => o.parentElement?.tagName === 'OPTGROUP' && norm(o.parentElement.label).includes('municipios de goias'))
      .map(o => ({value:o.value,label:o.textContent}));
    if (!dfItems.length && !goItems.length) return;

    const current = select.value;
    const entornoSul = goItems.filter(o => ENTORNO_SUL.has(norm(o.value)));
    const entornoNorte = goItems.filter(o => ENTORNO_NORTE.has(norm(o.value)));
    const goias = goItems.filter(o => !ENTORNO_SUL.has(norm(o.value)) && !ENTORNO_NORTE.has(norm(o.value)));
    const sort = list => list.sort((a,b) => a.label.localeCompare(b.label,'pt-BR'));

    select.replaceChildren(optionNode('qualquer','qualquer lugar'));
    if (dfItems.length) select.append(groupNode('distrito federal — regiões administrativas','df','todo o distrito federal',sort(dfItems)));
    if (entornoSul.length) select.append(groupNode('entorno sul — go','entorno-sul','todo o entorno sul',sort(entornoSul)));
    if (entornoNorte.length) select.append(groupNode('entorno norte — go','entorno-norte','todo o entorno norte',sort(entornoNorte)));
    if (goias.length) select.append(groupNode('goiás — outros municípios','goias','todo goiás',sort(goias)));

    if ([...select.options].some(o => o.value === current)) select.value = current;
    select.dataset.locationOrganized = '1';
  }

  let resultsActivated = new URLSearchParams(location.search).toString().length > 0;

  function gateInitialResults() {
    const page = document.body.dataset.page;
    if (!['eventos','lugares'].includes(page) || resultsActivated) return;
    const target = document.querySelector('#results');
    if (!target) return;
    const message = page === 'eventos'
      ? 'escolha um filtro ou uma categoria pra descobrir os rolês.'
      : 'escolha um filtro ou uma categoria pra começar a explorar.';
    if (target.dataset.gated !== '1') {
      target.innerHTML = `<div class="empty-state">${message}</div>`;
      target.dataset.gated = '1';
    }
    const count = document.querySelector('#result-count');
    if (count) count.textContent = 'escolha um filtro';
    const more = document.querySelector('#show-more');
    if (more) more.hidden = true;
  }

  function activateResultsFromInteraction(event) {
    if (!event.target.closest('.search-button,.category-chip')) return;
    resultsActivated = true;
    const target = document.querySelector('#results');
    if (target) delete target.dataset.gated;
  }

  function apply() {
    cleanNavigation();
    organizeLocationSelect(document.querySelector('#local'));
    organizeLocationSelect(document.querySelector('#onde'));
    document.querySelectorAll('.event-card,.place-card').forEach(polishCard);
    document.querySelectorAll('.route-card').forEach(polishRouteCard);
    gateInitialResults();
  }

  let extraEventsStarted = false;
  async function loadExtraEvents() {
    const page = document.body.dataset.page;
    if (!['eventos','novidades','salvos'].includes(page) || extraEventsStarted) return;
    extraEventsStarted = true;
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
          const ids = new Set(state.eventos.map(item => item.id));
          const fresh = extra.filter(item => item && item.id && !ids.has(item.id));
          if (fresh.length) state.eventos.push(...fresh);
          if (typeof refreshCurrent === 'function') refreshCurrent();
          apply();
        } catch {
          if (tries++ < 80) setTimeout(mergeWhenReady,100);
        }
      };
      mergeWhenReady();
    } catch (err) {
      console.warn('não foi possível carregar os rolês extras',err);
    }
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  });

  document.addEventListener('click',activateResultsFromInteraction,true);
  document.addEventListener('DOMContentLoaded',() => {
    cleanupLegacyStorage();
    apply();
    loadExtraEvents();
    observer.observe(document.body,{childList:true,subtree:true});
    if (document.body.dataset.page === 'salvos') {
      setTimeout(() => { try { if (typeof refreshCurrent === 'function') refreshCurrent(); } catch {} },0);
    }
  });
})();
