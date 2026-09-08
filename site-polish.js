(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const rawTags = item => new Set((item?.tags || []).map(norm));

  const TAGS = {
    festival:['festival','🎪'], cinema:['cinema','🎬'], teatro:['teatro','🎭'], exposicao:['exposição','🖼️'], drag:['drag','👑'],
    show:['show','🎤'], festa:['festa','🎉'], karaoke:['karaokê','🎤'], palestra:['palestra','🗣️'], oficina:['oficina','🛠️'],
    feira:['feira','🧺'], brecho:['brechó','👕'], corrida:['corrida','🏃'], games:['games','🎮'], rpg:['rpg','🎲'],
    cafe:['café','☕'], restaurante:['restaurante','🍽️'], cachoeira:['cachoeira','💦'], trilha:['trilha','🥾'], parqueAquatico:['parque aquático','🏊'],

    manha:['manhã','🌅'], tarde:['tarde','☀️'], noite:['noite','🌆'], madrugada:['madrugada','🌙'],
    acessivel:['acessível','♿'], pets:['aceita pets','🐾'], criancas:['bom para crianças','🧸'], vegana:['opção vegana','🌱'], vegetariana:['opção vegetariana','🥬'],
    familias:['para famílias','👨‍👩‍👧'], maior18:['18+','🔞'], universitario:['universitário','🎓'], lgbt:['lgbtqia+','🌈'], maior60:['60+','👵'],
    seguroMulheres:['seguro para mulheres','🛡️'], seguroLgbt:['seguro para lgbtqia+','🌈'],
    date:['bom para date','💞'], sozinho:['bom para ir sozinho','👤'], tranquilo:['tranquilo','😌'], dancante:['dançante','💃'], alternativo:['alternativo','✨'],
    arLivre:['ao ar livre','🌿'], musicaVivo:['música ao vivo','🎵'], agua:['água','💦'], porSol:['pôr do sol','🌇'],
    metro:['metrô próximo','🚇'], bicicleta:['bicicletário / ciclovia','🚲'], estacionamento:['estacionamento','🅿️'],

    cultura:['cultura','🏛️'], musica:['música','🎵'], arte:['arte','🎨'], humor:['humor','😂'], quadrinhos:['quadrinhos','💬'], tecnologia:['tecnologia','🤖'],
    pop:['pop','🎧'], rock:['rock','🎸'], mpb:['mpb','🎵'], forro:['forró','🪗'], piseiro:['piseiro','💃'], arquitetura:['arquitetura','🏙️'],
    historia:['história','🏛️'], museu:['museu','🏛️'], parque:['parque','🌳'], compras:['compras','🛍️'], cerrado:['cerrado','🌿'],

    vidaNoturna:['vida noturna','🌃'], lazer:['lazer','🎟️'], experiencia:['experiência','✨'], criativo:['criativo','🎨'],
    gastronomia:['gastronomia','🍴'], comida:['comida','🍽️'], geek:['geek','👾'], culturaPop:['cultura pop','🕹️'],
    atividade:['atividade','🧠'], aprendizado:['aprendizado','📚'], passeio:['passeio','🚶'], natureza:['natureza','🌳'],
    patrimonio:['patrimônio','🏛️'], pontoTuristico:['ponto turístico','📸'], bar:['bar','🍸'], encontro:['encontro','👥'], destino:['destino','🧭']
  };

  const SAFE_WOMEN = new Set(['seguro para mulheres','ambiente seguro para mulheres','espaco seguro para mulheres','safe space mulheres','safe space para mulheres']);
  const SAFE_LGBT = new Set(['seguro para lgbt','seguro para lgbtqia+','ambiente seguro lgbt','ambiente seguro para lgbtqia+','espaco seguro lgbt','espaco seguro para lgbtqia+','safe space lgbt','safe space lgbtqia+']);

  const add = (out,id) => { if (id && TAGS[id] && !out.includes(id)) out.push(id); };
  const hasExplicit = (item,set) => [...rawTags(item)].some(tag => set.has(tag));

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
    const tags = rawTags(item), text = norm(`${item.acesso || ''} ${(item.tags || []).join(' ')}`), out = [];
    if (kind === 'event') add(out,timeTag(item));
    if (tags.has('acessivel')) add(out,'acessivel');
    if (tags.has('pet friendly') || tags.has('aceita pets')) add(out,'pets');
    if (tags.has('bom para criancas') || tags.has('kid friendly')) add(out,'criancas');
    if (tags.has('opcao vegana') || tags.has('vegano') || tags.has('vegana')) add(out,'vegana');
    if (tags.has('opcao vegetariana') || tags.has('vegetariano') || tags.has('vegetariana')) add(out,'vegetariana');
    if (tags.has('familia') || tags.has('familiar')) add(out,'familias');
    if (tags.has('18+') || tags.has('maiores de 18')) add(out,'maior18');
    if (tags.has('universitario') || tags.has('universitaria')) add(out,'universitario');
    if (tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt')) add(out,'lgbt');
    if (tags.has('60+') || tags.has('idosos')) add(out,'maior60');
    if (hasExplicit(item,SAFE_WOMEN)) add(out,'seguroMulheres');
    if (hasExplicit(item,SAFE_LGBT)) add(out,'seguroLgbt');
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
    }
    return out;
  }

  function descriptorTags(item) {
    const tags = rawTags(item), out = [];
    const mapping = [
      [['cultura'],'cultura'], [['musica'],'musica'], [['arte','ilustracao'],'arte'], [['humor','comedia','stand-up'],'humor'],
      [['quadrinhos','manga'],'quadrinhos'], [['tecnologia'],'tecnologia'], [['pop'],'pop'], [['rock'],'rock'], [['mpb'],'mpb'],
      [['forro'],'forro'], [['piseiro'],'piseiro'], [['arquitetura'],'arquitetura'], [['historia','cidade historica'],'historia'],
      [['museu'],'museu'], [['parque'],'parque'], [['compras','shopping'],'compras'], [['cerrado'],'cerrado']
    ];
    mapping.forEach(([values,id]) => { if (values.some(v => tags.has(v))) add(out,id); });
    return out;
  }

  function canonicalCategory(kind,item) {
    try { return kind === 'event' ? canonicalEventCategory(item) : canonicalPlaceCategory(item); }
    catch { return ''; }
  }

  function semanticFallbacks(kind,item) {
    const cat = canonicalCategory(kind,item);
    const eventMap = {
      'festas-noite':['vidaNoturna','lazer','festa','musica'],
      'shows-musica':['show','musica','cultura','lazer'],
      'cultura-artes':['cultura','arte','lazer','experiencia'],
      'feiras-brechos':['feira','compras','criativo','lazer'],
      'gastronomia':['gastronomia','comida','experiencia','lazer'],
      'geek':['geek','culturaPop','lazer','criativo'],
      'cursos-atividades':['atividade','aprendizado','experiencia','cultura'],
      'ao-ar-livre':['arLivre','passeio','atividade','lazer']
    };
    const placeMap = {
      'cultura-historia':['cultura','historia','patrimonio','passeio'],
      'natureza':['natureza','arLivre','passeio','lazer'],
      'arquitetura-turismo':['arquitetura','pontoTuristico','passeio','cultura'],
      'comer':['gastronomia','comida','experiencia','passeio'],
      'bares-noite':['bar','vidaNoturna','lazer','encontro'],
      'cinema-teatro':['cultura','arte','lazer','experiencia'],
      'feiras-compras':['feira','compras','passeio','lazer'],
      'lazer-experiencias':['lazer','experiencia','atividade','passeio'],
      'cidades-destinos':['destino','passeio','cultura','historia']
    };
    return (kind === 'event' ? eventMap[cat] : placeMap[cat]) || (kind === 'event' ? ['cultura','lazer','experiencia','atividade'] : ['passeio','lazer','experiencia','cultura']);
  }

  function meaningfulTagIds(item,kind) {
    const ids = [];
    [...subtypeTags(item,kind), ...featureTags(item,kind), ...descriptorTags(item), ...semanticFallbacks(kind,item)].forEach(id => add(ids,id));
    return ids.slice(0,4);
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

  function polishCard(card) {
    const kind = card.classList.contains('event-card') ? 'event' : card.classList.contains('place-card') ? 'place' : null;
    if (!kind) return;
    const item = findItem(card,kind);
    const box = card.querySelector('.tags');
    if (!item || !box) return;
    const ids = meaningfulTagIds(item,kind), signature = `${kind}:${ids.join('|')}`;
    if (card.dataset.meaningfulTags === signature) return;
    box.replaceChildren(...ids.map(chip));
    box.hidden = false;
    card.dataset.meaningfulTags = signature;
  }

  function routeTagIds(card) {
    const text = norm(card.textContent), ids = [];
    if (text.includes('cinema')) add(ids,'cinema');
    if (text.includes('arquitetura')) add(ids,'arquitetura');
    if (text.includes('cultura')) add(ids,'cultura');
    if (text.includes('feira')) { add(ids,'feira'); add(ids,'compras'); }
    if (text.includes('cachoeira')) { add(ids,'cachoeira'); add(ids,'trilha'); add(ids,'agua'); add(ids,'natureza'); }
    if (text.includes('parque')) { add(ids,'parque'); add(ids,'arLivre'); }
    if (text.includes('comida')) add(ids,'gastronomia');
    if (text.includes('festa')) add(ids,'festa');
    if (text.includes('natureza')) add(ids,'natureza');
    ['passeio','lazer','experiencia','cultura'].forEach(id => add(ids,id));
    return ids.slice(0,4);
  }

  function polishRoute(card) {
    const box = card.querySelector('.tags') || (() => {
      const el = document.createElement('div');
      el.className = 'tags';
      const actions = card.querySelector('.actions');
      actions ? actions.insertAdjacentElement('beforebegin',el) : card.append(el);
      return el;
    })();
    const ids = routeTagIds(card), signature = ids.join('|');
    if (card.dataset.meaningfulTags === signature) return;
    box.replaceChildren(...ids.map(chip));
    card.dataset.meaningfulTags = signature;
  }

  function ensureContactNav() {
    document.querySelectorAll('.utility-nav').forEach(nav => {
      let link = nav.querySelector('a[href="./contato.html"]');
      if (!link) {
        link = document.createElement('a');
        link.href = './contato.html';
        link.textContent = '✉ contato';
        nav.append(link);
      }
      if (document.body.dataset.page === 'contato') link.classList.add('active');
    });
  }

  function apply() {
    ensureContactNav();
    document.querySelectorAll('.event-card,.place-card').forEach(polishCard);
    document.querySelectorAll('.route-card').forEach(polishRoute);
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  });

  document.addEventListener('DOMContentLoaded',() => {
    apply();
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
