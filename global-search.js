(() => {
  if (document.body.dataset.page !== 'eventos') return;

  const n = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const escHtml = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const GROUPS = [
    ['bicho','bichos','animal','animais','cabra','cabras','cabrissima','zoologico','zoo','fazenda','fazendinha','rural','fauna'],
    ['quadrinho','quadrinhos','hq','hqs','gibi','gibis','comics','manga','mangas','gibiteca'],
    ['cinema','filme','filmes','audiovisual','sessao','sessoes'],
    ['musica','show','shows','concerto','festival musical','musica ao vivo'],
    ['lgbt','lgbtqia','lgbtqiapn','queer','drag','gay','lesbica','trans','bissexual','nao-binario'],
    ['natureza','mato','cerrado','trilha','trilhas','cachoeira','cachoeiras','parque','ecoturismo','ao ar livre'],
    ['cafe','cafes','cafeteria','cafeterias','coffee','padaria'],
    ['comida','comer','restaurante','restaurantes','gastronomia','almoco','jantar','lanche'],
    ['romantico','romantica','romance','date','casal','encontro'],
    ['crianca','criancas','infantil','familia','familias'],
    ['gratis','gratuito','gratuita','gratuitos','gratuitas','de graca'],
    ['arte','cultura','museu','museus','exposicao','exposicoes','galeria','galerias'],
    ['noite','noturno','balada','festa','festas','dj','djs'],
    ['feira','feiras','brecho','brechos','artesanato','economia criativa'],
    ['teatro','peca','pecas','palco','circo','danca','performance']
  ].map(group => group.map(n));

  const routeState = { items: [], promise: null };
  let activeKind = 'all';
  let renderVersion = 0;
  let inputTimer = null;

  const input = () => document.querySelector('#global-search-input');
  const clearButton = () => document.querySelector('#global-search-clear');
  const tabs = () => document.querySelector('#global-search-tabs');
  const globalSection = () => document.querySelector('.global-search-results-section');
  const globalGrid = () => document.querySelector('#global-search-results');
  const globalCount = () => document.querySelector('#global-search-count');
  const normalSection = () => document.querySelector('.search-results-section');

  function tokenFamily(token) {
    const clean = n(token);
    const found = GROUPS.find(group => group.includes(clean));
    if (found) return found;
    const generic = [clean];
    if (clean.length > 3) {
      if (clean.endsWith('s')) generic.push(clean.slice(0,-1));
      else generic.push(`${clean}s`);
    }
    return [...new Set(generic.filter(Boolean))];
  }

  function queryTokens(query) {
    return n(query).split(/\s+/).filter(token => token.length >= 2);
  }

  function fieldsFor(kind, item) {
    if (kind === 'route') {
      return {
        name: item.nome || '',
        tags: item.categoria || '',
        full: `${item.nome || ''} ${item.categoria || ''} ${item.descricao || ''}`
      };
    }

    const name = item.nome || item.titulo || '';
    const tags = Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || '');
    const full = [
      name,
      item.descricao,
      tags,
      item.categoria,
      item.cidade,
      item.ra,
      item.bairro,
      item.local,
      item.localNome,
      item.endereco,
      item.preco,
      item.horario,
      item.publico
    ].filter(Boolean).join(' ');

    return { name, tags, full };
  }

  function scoreItem(kind, item, query) {
    const words = queryTokens(query);
    if (!words.length) return 0;

    const fields = fieldsFor(kind, item);
    const name = n(fields.name);
    const tags = n(fields.tags);
    const full = n(fields.full);
    let score = 0;

    for (const word of words) {
      const family = tokenFamily(word);
      let best = 0;
      for (const term of family) {
        if (!term) continue;
        if (name.includes(term)) best = Math.max(best, 12);
        else if (tags.includes(term)) best = Math.max(best, 8);
        else if (full.includes(term)) best = Math.max(best, 4);
      }
      if (!best) return 0;
      score += best;
    }

    const whole = n(query);
    if (whole && name.includes(whole)) score += 18;
    return score;
  }

  function eventPassesFilters(event) {
    const local = document.querySelector('#local')?.value || 'qualquer';
    const data = document.querySelector('#data')?.value || 'qualquer';
    const valor = document.querySelector('#valor')?.value || 'qualquer';
    const horario = document.querySelector('#horario')?.value || 'qualquer';

    try {
      return (typeof cityMatches !== 'function' || cityMatches(event.cidade, local)) &&
        (typeof eventDateMatches !== 'function' || eventDateMatches(event, data)) &&
        (typeof priceMatches !== 'function' || priceMatches(event, valor)) &&
        (typeof timeMatches !== 'function' || timeMatches(event, horario));
    } catch {
      return true;
    }
  }

  async function loadRoutes() {
    if (routeState.items.length) return routeState.items;
    if (routeState.promise) return routeState.promise;

    routeState.promise = fetch('./roteiros.html', { cache:'no-store' })
      .then(response => response.ok ? response.text() : '')
      .then(html => {
        if (!html) return [];
        const doc = new DOMParser().parseFromString(html, 'text/html');
        routeState.items = [...doc.querySelectorAll('.route-card')].map((card, index) => ({
          id: `route-${index + 1}`,
          nome: card.querySelector('h3')?.textContent?.trim() || 'roteiro',
          categoria: card.querySelector('.card-kind')?.textContent?.trim() || 'roteiro',
          descricao: card.querySelector('.desc')?.textContent?.trim() || '',
          href: './roteiros.html'
        }));
        return routeState.items;
      })
      .catch(() => []);

    return routeState.promise;
  }

  function resultUrl(kind, item) {
    if (kind === 'route') return item.href || './roteiros.html';
    const name = item.nome || item.titulo || '';
    if (kind === 'place') return `./lugares.html?detalhe=${encodeURIComponent(name)}`;
    return `./index.html?detalhe=${encodeURIComponent(name)}`;
  }

  function resultMeta(kind, item) {
    if (kind === 'route') return item.categoria || '';
    const bits = [];
    if (item.cidade) bits.push(item.cidade);
    if (kind === 'place' && item.bairro) bits.push(item.bairro);
    if (kind === 'event' && item.local) bits.push(item.local);
    if (kind === 'event' && item.horario) bits.push(item.horario);
    return bits.join(' · ');
  }

  function kindLabel(kind) {
    if (kind === 'event') return 'evento';
    if (kind === 'place') return 'lugar';
    return 'roteiro';
  }

  function actionLabel(kind) {
    if (kind === 'event') return 'ver evento';
    if (kind === 'place') return 'ver lugar';
    return 'abrir roteiros';
  }

  function hitHtml(hit) {
    const item = hit.item;
    const title = item.nome || item.titulo || 'sem título';
    const desc = (item.descricao || '').trim();
    const shortDesc = desc.length > 230 ? `${desc.slice(0,227).trim()}…` : desc;
    const meta = resultMeta(hit.kind, item);
    const url = resultUrl(hit.kind, item);

    return `<article class="card global-hit">
      <span class="card-kind">${kindLabel(hit.kind)}</span>
      <h3><a href="${escHtml(url)}">${escHtml(title)}</a></h3>
      ${meta ? `<p class="global-hit-meta">${escHtml(meta)}</p>` : ''}
      ${shortDesc ? `<p class="desc">${escHtml(shortDesc)}</p>` : ''}
      <div class="actions"><a href="${escHtml(url)}">${actionLabel(hit.kind)}</a></div>
    </article>`;
  }

  function hasEventFilterSelection() {
    return ['#local','#data','#valor','#horario'].some(selector => {
      const select = document.querySelector(selector);
      return select && select.value && select.value !== 'qualquer';
    });
  }

  function hasOtherUrlFilters() {
    const params = new URLSearchParams(location.search);
    params.delete('q');
    params.delete('resultado');
    return params.toString().length > 0;
  }

  function restoreNormalResults() {
    const section = normalSection();
    if (!section) return;
    const shouldShow = hasEventFilterSelection() || hasOtherUrlFilters();
    section.hidden = !shouldShow;
    if (shouldShow) {
      try {
        state.visible = 18;
        if (typeof renderEventos === 'function') renderEventos();
      } catch {}
    }
  }

  function syncTabs() {
    document.querySelectorAll('.lookup-tab').forEach(button => {
      const active = button.dataset.kind === activeKind;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function syncUrl(query) {
    try {
      const url = new URL(location.href);
      if (query) {
        url.searchParams.set('q', query);
        if (activeKind !== 'all') url.searchParams.set('resultado', activeKind);
        else url.searchParams.delete('resultado');
      } else {
        url.searchParams.delete('q');
        url.searchParams.delete('resultado');
      }
      history.replaceState({}, '', url);
    } catch {}
  }

  async function renderSearch({ syncHistory = true } = {}) {
    const field = input();
    const section = globalSection();
    const grid = globalGrid();
    if (!field || !section || !grid) return;

    const query = field.value.trim();
    const clear = clearButton();
    const tabBar = tabs();
    if (clear) clear.hidden = !query;
    if (tabBar) tabBar.hidden = !query;

    if (!query) {
      section.hidden = true;
      if (normalSection()) restoreNormalResults();
      if (syncHistory) syncUrl('');
      return;
    }

    const version = ++renderVersion;
    if (normalSection()) normalSection().hidden = true;
    section.hidden = false;
    syncTabs();
    if (syncHistory) syncUrl(query);

    const routes = await loadRoutes();
    if (version !== renderVersion) return;

    const hits = [];
    const events = (typeof state !== 'undefined' && Array.isArray(state.eventos)) ? state.eventos : [];
    const places = (typeof state !== 'undefined' && Array.isArray(state.lugares)) ? state.lugares : [];

    events.forEach(item => {
      if (!eventPassesFilters(item)) return;
      const score = scoreItem('event', item, query);
      if (score) hits.push({ kind:'event', item, score });
    });

    places.forEach(item => {
      const score = scoreItem('place', item, query);
      if (score) hits.push({ kind:'place', item, score });
    });

    routes.forEach(item => {
      const score = scoreItem('route', item, query);
      if (score) hits.push({ kind:'route', item, score });
    });

    const filtered = hits
      .filter(hit => activeKind === 'all' || hit.kind === activeKind)
      .sort((a,b) => b.score - a.score || kindLabel(a.kind).localeCompare(kindLabel(b.kind), 'pt-BR'));

    const shown = filtered.slice(0, 36);
    grid.innerHTML = shown.length
      ? shown.map(hitHtml).join('')
      : '<div class="global-search-empty">não encontrei nada com essa busca. tenta outra palavra ou limpa algum filtro de evento.</div>';

    const count = globalCount();
    if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`;
  }

  function scheduleRender() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => renderSearch(), 90);
  }

  document.addEventListener('input', event => {
    if (event.target.matches('#global-search-input')) scheduleRender();
  });

  document.addEventListener('change', event => {
    if (!event.target.closest('.search-panel')) return;
    if (input()?.value.trim()) renderSearch();
  });

  document.addEventListener('click', event => {
    const tab = event.target.closest('.lookup-tab');
    if (tab) {
      event.preventDefault();
      activeKind = tab.dataset.kind || 'all';
      syncTabs();
      renderSearch();
      return;
    }

    const clear = event.target.closest('#global-search-clear');
    if (clear) {
      event.preventDefault();
      const field = input();
      if (field) {
        field.value = '';
        field.focus();
      }
      activeKind = 'all';
      syncTabs();
      renderSearch();
    }
  });

  document.addEventListener('roledfora:data-updated', () => {
    if (input()?.value.trim()) renderSearch({ syncHistory:false });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const requestedKind = params.get('resultado');
    if (['all','event','place','route'].includes(requestedKind)) activeKind = requestedKind;

    const field = input();
    if (field && query) field.value = query;
    syncTabs();
    if (query) setTimeout(() => renderSearch({ syncHistory:false }), 0);
  });
})();
