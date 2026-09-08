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
    metro:['metrô próximo','🚇'], bicicleta:['acesso de bicicleta','🚲'], estacionamento:['estacionamento','🅿️'], carro:['carro recomendado','🚗']
  };

  function add(out,id) {
    if (TAGS[id] && !out.includes(id)) out.push(id);
  }

  function subtypeTags(item, kind) {
    const tags = rawTags(item);
    const cat = norm(item.categoria);
    const text = norm(`${item.nome || ''} ${item.descricao || ''}`);
    const out = [];
    const has = (...values) => values.some(v => tags.has(norm(v)) || cat === norm(v));

    if (has('festival') || text.includes('festival')) add(out,'festival');
    if (has('cinema') || text.includes('cinema')) add(out,'cinema');
    if (has('teatro') || text.includes('teatro')) add(out,'teatro');
    if (has('drag') || text.includes('drag')) add(out,'drag');
    if (has('exposição') || text.includes('exposição')) add(out,'exposicao');
    if (cat === 'show' || tags.has('show')) add(out,'show');
    if (cat === 'festa' || tags.has('festa') || tags.has('balada')) add(out,'festa');
    if (cat === 'karaokê' || tags.has('karaokê')) add(out,'karaoke');
    if (tags.has('palestra') || tags.has('palestras') || text.includes('palestra')) add(out,'palestra');
    if (tags.has('oficina') || tags.has('oficinas') || text.includes('oficina')) add(out,'oficina');
    if (cat === 'feira' || tags.has('feira')) add(out,'feira');
    if (cat === 'brechó' || tags.has('brechó')) add(out,'brecho');
    if (tags.has('corrida') || text.includes('corrida')) add(out,'corrida');
    if (tags.has('games') || tags.has('nerd/geek')) add(out,'games');
    if (tags.has('rpg')) add(out,'rpg');

    if (kind === 'place') {
      if (cat === 'cafés' || tags.has('café')) add(out,'cafe');
      if (cat === 'restaurantes' || tags.has('restaurante')) add(out,'restaurante');
      if (cat === 'cachoeiras' || tags.has('cachoeira') || tags.has('cachoeiras') || text.includes('cachoeira')) add(out,'cachoeira');
      if (tags.has('trilha') || tags.has('trilhas')) add(out,'trilha');
      if (cat === 'parques aquáticos' || tags.has('parque aquático')) add(out,'parqueAquatico');
    }
    return out;
  }

  function timeTag(item) {
    const text = norm(`${item.horario || ''} ${(item.tags || []).join(' ')}`);
    if (/varios horarios|vários horários|ao longo do dia|programacao diaria|programação diária/.test(text)) return null;
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

  function featureTags(item, kind) {
    const tags = rawTags(item);
    const text = norm(`${item.acesso || ''} ${item.descricao || ''} ${(item.tags || []).join(' ')}`);
    const out = [];
    if (kind === 'event') add(out,timeTag(item));

    if (tags.has('acessível')) add(out,'acessivel');
    if (tags.has('pet friendly') || tags.has('aceita pets')) add(out,'pets');
    if (tags.has('bom para crianças') || tags.has('kid friendly')) add(out,'criancas');
    if (tags.has('opção vegana') || tags.has('vegano') || tags.has('vegana')) add(out,'vegana');
    if (tags.has('opção vegetariana') || tags.has('vegetariano') || tags.has('vegetariana')) add(out,'vegetariana');
    if (tags.has('família') || tags.has('familiar')) add(out,'familias');
    if (tags.has('jovens') || tags.has('juventude')) add(out,'jovens');
    if (tags.has('18+') || text.includes('maiores de 18')) add(out,'maior18');
    if (tags.has('universitário') || tags.has('universitaria')) add(out,'universitario');
    if (tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt')) add(out,'lgbt');
    if (tags.has('60+') || tags.has('idosos')) add(out,'maior60');
    if (tags.has('date') || tags.has('date diferente')) add(out,'date');
    if (tags.has('sozinho') || tags.has('solo')) add(out,'sozinho');
    if (tags.has('tranquilo') || tags.has('calmo')) add(out,'tranquilo');
    if (tags.has('dançante') || tags.has('balada')) add(out,'dancante');
    if (tags.has('alternativo')) add(out,'alternativo');
    if (tags.has('ao ar livre')) add(out,'arLivre');
    if (tags.has('música ao vivo')) add(out,'musicaVivo');
    if (['água','cachoeira','cachoeiras','lago','poços','águas termais','parque aquático'].some(t => tags.has(norm(t)))) add(out,'agua');
    if (tags.has('pôr do sol')) add(out,'porSol');

    if (kind === 'place') {
      if (/metro proximo|metrô próximo|perto do metro|perto do metrô/.test(text)) add(out,'metro');
      if (/bicicletario|bicicletário|ciclovia/.test(text)) add(out,'bicicleta');
      if (text.includes('estacionamento')) add(out,'estacionamento');
      if (/carro facilita|carro recomendado|acesso de carro/.test(text)) add(out,'carro');
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
    [...subtypeTags(item,kind), ...featureTags(item,kind)].forEach(id => {
      if (id && !ids.includes(id)) ids.push(id);
    });
    const selected = ids.slice(0,4);
    box.replaceChildren(...selected.map(chip));
    box.hidden = selected.length === 0;
  }

  function numericDate(iso) {
    if (!iso) return '';
    const [y,m,d] = iso.split('-');
    return `${d}/${m}`;
  }

  function summarizeTime(value) {
    const raw = (value || '').trim();
    const text = norm(raw);
    if (!raw) return '';
    if (/varios horarios|vários horários|ao longo do dia|programacao diaria|programação diária|atividades em varios horarios|atividades em vários horários/.test(text)) return 'vários horários';
    if (/consultar horario|consultar horário/.test(text)) return 'horário a confirmar';
    const found = [...raw.matchAll(/\b(\d{1,2}(?::\d{2})?h)\b/g)].map(m => m[1]);
    if (!found.length) return raw.length <= 28 ? raw : 'horário a confirmar';
    if (/a partir/.test(text)) return `a partir de ${found[0]}`;
    if (found.length >= 2 && /(as|às|ate|até|-)/.test(text)) return `${found[0]}–${found[1]}`;
    return found[0];
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
    } else if (timeLine) {
      timeLine.remove();
    }
  }

  function compactEventAction(card,item) {
    const link = card.querySelector('.actions .primary-link');
    if (!link) return;
    const ticket = norm(item.ingresso);
    if (ticket.includes('inscri')) link.textContent = '📝 inscrição';
    else if (ticket.includes('compra') || ticket.includes('ingresso') || ticket.includes('venda') || ticket.includes('retirada')) link.textContent = '🎟️ ingresso';
    else link.textContent = '↗ detalhes';
  }

  function readSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  }

  function ensureSavedStatus(card) {
    const actions = card.querySelector('.actions');
    const save = actions?.querySelector('.save-btn[data-key]');
    if (!actions || !save) return;

    const key = save.dataset.key;
    const saved = readSet('roledfora.saved');
    const want = readSet('roledfora.want');
    const visited = readSet('roledfora.visited');
    const inFavorites = saved.has(key) || want.has(key) || visited.has(key);

    actions.querySelectorAll('.status-btn').forEach(btn => btn.remove());

    let row = card.querySelector('.saved-status-row');
    if (!inFavorites) {
      if (row) row.remove();
      return;
    }

    if (!row) {
      row = document.createElement('div');
      row.className = 'saved-status-row';
      actions.insertAdjacentElement('afterend',row);
    }

    row.innerHTML = `
      <button class="status-btn ${want.has(key) ? 'active' : ''}" data-action="want" data-key="${key}">📌 quero ir</button>
      <button class="status-btn ${visited.has(key) ? 'active' : ''}" data-action="visited" data-key="${key}">✅ já fui</button>`;
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
      if (kind === 'event') {
        compactEventMeta(card,item);
        compactEventAction(card,item);
      }
      card.dataset.polished = '1';
    }

    ensureSavedStatus(card);
  }

  function apply() {
    document.querySelectorAll('.event-card,.place-card').forEach(polishCard);
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

  document.addEventListener('DOMContentLoaded',() => {
    apply();
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
