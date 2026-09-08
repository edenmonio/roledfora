(() => {
  const normalize = value => (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const EXTRA_TAG_EMOJI = {
    'sustentabilidade':'♻️',
    'ecologia':'🌱',
    'meio ambiente':'🌎',
    'aguas termais':'♨️',
    'rooftop':'🌇',
    'foto':'📸',
    'livros':'📚',
    'ocasiao':'🥂',
    'casual':'🙂',
    'frutos do mar':'🦐',
    'comida nordestina':'🌵',
    'turistando':'🧭',
    'religiao':'🕯️',
    'experiencia':'🎟️',
    'quadras':'🏀',
    'parquinho':'🛝',
    'skate':'🛹',
    'pontes':'🌉',
    'leitura':'📖',
    'arte urbana':'🧱',
    'morro':'⛰️',
    'panoramica':'🔭',
    'corrida':'🏃',
    'caminhada':'🚶',
    'artist alley':'🧑‍🎨',
    "artist's alley":'🧑‍🎨',
    'tecnologia':'🤖',
    'rpg':'🎲',
    'quadrinhos':'💬',
    'games':'🎮',
    'mpb':'🎙️',
    'pop':'🎧',
    'rock':'🎸',
    'forro':'🪗',
    'piseiro':'🕺',
    'eletronica':'🔊',
    'house':'🎛️',
    'reggaeton':'🔥',
    'festival':'🎪',
    'bar':'🍸',
    'cinema':'🎞️',
    'teatro':'🎭',
    'cidade historica':'🏘️',
    'chapada':'⛰️',
    'cerrado':'🌾',
    'parque aquatico':'🏊',
    'cachoeira':'💦',
    'cachoeiras':'🌊',
    'caverna':'🕳️',
    'cavernas':'🦇',
    'pocos':'💧',
    'lago':'🛶',
    'mirante':'🔭',
    'por do sol':'🌅',
    'date':'💞',
    'date diferente':'💘',
    'pet friendly':'🐾',
    'acessivel':'♿',
    'gratuito':'🆓',
    'familia':'👨‍👩‍👧',
    'infantil':'🧸',
    'classico brasiliense':'⭐',
    'classico':'🏆',
    'alternativo':'🌀',
    'design independente':'🧵',
    'economia criativa':'💡',
    'cultura japonesa':'🎐',
    'cultura popular':'🪗',
    'historia':'📜',
    'arquitetura':'📐',
    'museu':'🏛️',
    'arte':'🎨',
    'exposicao':'🖼️',
    'musica':'🎶',
    'musica ao vivo':'🎤',
    'festa':'🎉',
    'balada':'🪩',
    'madrugada':'🌙',
    'gastronomia':'🍽️',
    'comer':'😋',
    'cafe':'☕',
    'doce':'🧁',
    'padaria':'🥐',
    'pizza':'🍕',
    'hamburguer':'🍔',
    'sushi':'🍣',
    'japones':'🎎',
    'vinho':'🍷',
    'lgbtqia+':'🌈',
    'drag':'👑',
    'ao ar livre':'🌤️',
    'natureza':'🌳',
    'trilha':'🥾',
    'trilhas':'🥾',
    'oficina':'🛠️',
    'oficinas':'🛠️',
    'curso':'🧠',
    'passeio':'🚶',
    'vista':'👀',
    'compras':'🛍️',
    'feira':'🧺',
    'aventura':'🧗',
    'arvorismo':'🌲',
    'escalada':'🧗‍♀️',
    'tirolesa':'🪢',
    'parque':'🌳',
    'viagem':'🧳',
    'goias':'🌾',
    'entorno':'🗺️',
    'shopping':'🛍️',
    'art deco':'🏢',
    'restaurante':'🍴'
  };

  // os dados mais antigos da lista pessoal vieram só com a cidade.
  // quando bairro/endereço forem confirmados, entram aqui ou direto nos jsons.
  const LOCATION_OVERRIDES = {
    'l-042-cine-brasilia': {
      bairro:'asa sul',
      endereco:'entrequadra sul 106/107, asa sul, brasília - df, 70345-400'
    },
    'l-059-cine-drive-in': {
      bairro:'plano piloto',
      endereco:'srpn trecho 1, plano piloto, brasília - df, 70297-400'
    },
    'l-133-adelia-padaria': {
      bairro:'asa norte',
      endereco:'shcgn 714/715, asa norte, brasília - df, 70761-650'
    }
  };

  function sortSelect(select, keepFirst = true) {
    if (!select || select.options.length < 3) return;
    const options = [...select.options];
    const first = keepFirst ? options.shift() : null;
    const sorted = [...options].sort((a,b) => a.textContent.localeCompare(b.textContent, 'pt-BR', {sensitivity:'base'}));
    const current = select.value;
    const desired = [first, ...sorted].filter(Boolean);
    const same = desired.every((opt, i) => select.options[i] === opt);
    if (!same) {
      desired.forEach(opt => select.appendChild(opt));
      select.value = current;
    }
  }

  function cleanCardKind(cardKind) {
    if (!cardKind || cardKind.dataset.emojiCleaned) return;
    cardKind.textContent = cardKind.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    cardKind.dataset.emojiCleaned = '1';
  }

  function fixTagChip(chip) {
    if (!chip) return;
    const key = normalize(chip.getAttribute('title') || chip.querySelector('.tag-name')?.textContent);
    const emoji = EXTRA_TAG_EMOJI[key];
    if (emoji) {
      const target = chip.querySelector('.emoji');
      if (target) target.textContent = emoji;
    }
  }

  function cleanPersonalActions(card) {
    if (!card) return;
    const onSavedPage = document.body.dataset.page === 'salvos';
    if (!onSavedPage) card.querySelectorAll('.status-btn').forEach(btn => btn.remove());

    card.querySelectorAll('.feedback').forEach(btn => {
      const action = btn.dataset.action;
      if (action === 'like') {
        btn.textContent = '❤️';
        btn.title = 'gostei';
        btn.setAttribute('aria-label','gostei');
      }
      if (action === 'dislike') {
        btn.textContent = '👎';
        btn.title = 'não gostei';
        btn.setAttribute('aria-label','não gostei');
      }
    });
  }

  function findPlace(id) {
    try { return state?.lugares?.find(item => item.id === id) || null; }
    catch { return null; }
  }

  function enrichPlaceLocation(card) {
    if (!card || card.dataset.locationEnriched) return;
    const item = findPlace(card.dataset.id);
    if (!item) return;
    const extra = LOCATION_OVERRIDES[item.id] || {};
    const bairro = extra.bairro || item.bairro || item.regiao || '';
    const endereco = extra.endereco || item.endereco || '';
    const meta = card.querySelector('.card-meta');
    const firstLine = meta?.querySelector('p');

    if (firstLine && bairro) {
      firstLine.textContent = `📍 ${bairro} · ${item.cidade}`;
    }

    if (meta && endereco) {
      let detail = meta.querySelector('.address-detail');
      if (!detail) {
        detail = document.createElement('p');
        detail.className = 'address-detail';
        meta.insertBefore(detail, firstLine?.nextSibling || meta.firstChild);
      }
      detail.textContent = `🧭 ${endereco}`;
    }

    if (endereco) {
      const mapLink = [...card.querySelectorAll('.actions a')].find(a => normalize(a.textContent).includes('abrir no mapa'));
      if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    }

    card.dataset.locationEnriched = '1';
  }

  function setSelectFromParam(selectId, paramName) {
    const value = new URLSearchParams(location.search).get(paramName);
    if (!value) return false;
    const select = document.querySelector(selectId);
    if (!select || select.options.length < 2) return false;
    const option = [...select.options].find(opt => normalize(opt.value) === normalize(value));
    if (!option || select.value === option.value) return false;
    select.value = option.value;
    return true;
  }

  function applyUrlFilters() {
    const body = document.body;
    if (!body || body.dataset.urlFiltersApplied === '1') return;
    const page = body.dataset.page;
    const params = new URLSearchParams(location.search);
    if (![...params.keys()].length) {
      body.dataset.urlFiltersApplied = '1';
      return;
    }

    const mainSelect = document.querySelector(page === 'eventos' ? '#local' : page === 'lugares' ? '#onde' : '');
    if (!mainSelect || mainSelect.options.length < 2) return;

    let changed = false;
    if (page === 'eventos') {
      changed = setSelectFromParam('#local','cidade') || changed;
      changed = setSelectFromParam('#tipo','tipo') || changed;
      changed = setSelectFromParam('#data','data') || changed;
      changed = setSelectFromParam('#horario','horario') || changed;
      changed = setSelectFromParam('#valor','valor') || changed;
    }
    if (page === 'lugares') {
      changed = setSelectFromParam('#onde','cidade') || changed;
      changed = setSelectFromParam('#categoria','categoria') || changed;
      changed = setSelectFromParam('#vibe','vibe') || changed;
      changed = setSelectFromParam('#preco','preco') || changed;
    }

    body.dataset.urlFiltersApplied = '1';
    if (changed) {
      requestAnimationFrame(() => {
        try {
          if (page === 'eventos') renderEventos();
          if (page === 'lugares') renderLugares();
        } catch {}
      });
    }
  }

  function applyFixes() {
    sortSelect(document.querySelector('#local'));
    sortSelect(document.querySelector('#onde'));
    sortSelect(document.querySelector('#tipo'));
    sortSelect(document.querySelector('#categoria'));
    document.querySelectorAll('.card-kind').forEach(cleanCardKind);
    document.querySelectorAll('.tag-chip').forEach(fixTagChip);
    document.querySelectorAll('.card').forEach(cleanPersonalActions);
    document.querySelectorAll('.place-card').forEach(enrichPlaceLocation);
    applyUrlFilters();
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyFixes();
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    applyFixes();
    observer.observe(document.body, {childList:true, subtree:true});
  });
})();
