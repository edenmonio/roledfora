(() => {
  const page = document.body.dataset.page;
  if (!['eventos','lugares'].includes(page)) return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const resultsSection = () => document.querySelector('.search-results-section');
  const technicalCategory = () => document.querySelector(page === 'eventos' ? '#tipo' : '#categoria');
  const technicalFeature = () => document.querySelector(page === 'eventos' ? '#caracteristica' : '#vibe');
  const technicalSearchButton = () => document.querySelector('.search-button.technical-filter');
  const selectedCategories = new Set();
  const selectedFeatures = new Set();

  const ENTORNO_SUL = new Set(['valparaiso de goias','novo gama','cidade ocidental','luziania']);
  const ENTORNO_NORTE = new Set(['planaltina de goias','formosa','aguas lindas de goias','santo antonio do descoberto']);
  const SAFE_WOMEN = new Set(['seguro para mulheres','ambiente seguro para mulheres','espaco seguro para mulheres','safe space mulheres','safe space para mulheres']);
  const SAFE_LGBT = new Set(['seguro para lgbt','seguro para lgbtqia+','ambiente seguro lgbt','ambiente seguro para lgbtqia+','espaco seguro lgbt','espaco seguro para lgbtqia+','safe space lgbt','safe space lgbtqia+']);

  function rawTags(item) {
    return new Set((item?.tags || []).map(norm));
  }

  function inScope(item) {
    const city = norm(item?.cidade);
    if (ENTORNO_SUL.has(city) || ENTORNO_NORTE.has(city)) return true;
    try { return typeof isDfCity === 'function' && isDfCity(item.cidade); }
    catch { return false; }
  }

  function explicitSafety(item,set) {
    return [...rawTags(item)].some(tag => set.has(tag));
  }

  function featureMatches(item,value) {
    const tags = rawTags(item);
    const text = norm(`${item.acesso || ''} ${item.descricao || ''} ${(item.tags || []).join(' ')}`);

    if (value === 'acessivel') return tags.has('acessivel');
    if (value === 'aceita-pets') return tags.has('pet friendly') || tags.has('aceita pets');
    if (value === 'alternativo') return tags.has('alternativo');
    if (value === 'ao-ar-livre') return tags.has('ao ar livre');
    if (value === 'aventura') return ['aventura','trilha','trilhas','arvorismo','escalada','tirolesa'].some(tag => tags.has(tag));
    if (value === 'agua') return ['agua','cachoeira','cachoeiras','lago','pocos','aguas termais','parque aquatico'].some(tag => tags.has(tag));
    if (value === 'bom-criancas') return tags.has('bom para criancas') || tags.has('kid friendly') || tags.has('infantil');
    if (value === 'date') return tags.has('date') || tags.has('date diferente');
    if (value === 'sozinho') return tags.has('sozinho') || tags.has('solo') || tags.has('bom pra ir sozinho');
    if (value === 'lgbtqia') return tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt');
    if (value === 'familias') return tags.has('familia') || tags.has('familiar');
    if (value === 'musica-vivo') return tags.has('musica ao vivo');
    if (value === 'por-do-sol') return tags.has('por do sol');
    if (value === 'tranquilo') return tags.has('tranquilo') || tags.has('calmo') || tags.has('relax');
    if (value === 'estacionamento') return tags.has('estacionamento') || text.includes('estacionamento');
    if (value === 'opcao-vegana') return tags.has('opcao vegana') || tags.has('vegano') || tags.has('vegana');
    if (value === 'opcao-vegetariana') return tags.has('opcao vegetariana') || tags.has('vegetariano') || tags.has('vegetariana');
    if (value === 'seguro-mulheres') return explicitSafety(item,SAFE_WOMEN);
    if (value === 'seguro-lgbt') return explicitSafety(item,SAFE_LGBT);
    return true;
  }

  function urlValue(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function renderPlaces() {
    try {
      const local = document.querySelector('#onde')?.value || urlValue('cidade') || 'qualquer';
      const valor = document.querySelector('#preco')?.value || urlValue('preco') || 'qualquer';
      const urlCategory = urlValue('categoria');
      const urlFeature = urlValue('vibe');
      const detail = urlValue('detalhe');

      const categories = selectedCategories.size ? selectedCategories : (urlCategory ? new Set([urlCategory]) : new Set());
      const features = new Set(selectedFeatures);
      if (!selectedFeatures.size && urlFeature) features.add(urlFeature);

      const items = state.lugares.filter(item => {
        if (!inScope(item)) return false;
        if (typeof cityMatches === 'function' && !cityMatches(item.cidade,local)) return false;
        if (typeof priceMatches === 'function' && !priceMatches(item,valor)) return false;
        if (categories.size && !categories.has(canonicalPlaceCategory(item))) return false;
        if ([...features].some(feature => !featureMatches(item,feature))) return false;
        if (detail && typeof detailMatches === 'function' && !detailMatches(item,detail)) return false;
        return true;
      });

      renderList(items,'place');
    } catch (err) {
      console.warn('não foi possível atualizar os lugares',err);
    }
  }

  function renderCurrent() {
    try {
      if (page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      if (page === 'lugares') renderPlaces();
    } catch (err) {
      console.warn('não foi possível atualizar os resultados', err);
    }
  }

  function hasSelection() {
    const visible = [...document.querySelectorAll('.search-panel select:not(.technical-filter)')];
    const visibleSelected = visible.some(select => select.value && select.value !== 'qualquer');
    if (page === 'lugares') return visibleSelected || selectedCategories.size > 0 || selectedFeatures.size > 0;
    const categorySelected = technicalCategory()?.value && technicalCategory().value !== 'qualquer';
    const featureSelected = technicalFeature()?.value && technicalFeature().value !== 'qualquer';
    return Boolean(visibleSelected || categorySelected || featureSelected);
  }

  function hasUrlFilters() {
    return new URLSearchParams(location.search).toString().length > 0;
  }

  function showResults() {
    const section = resultsSection();
    if (section) section.hidden = false;
  }

  function hideResults() {
    const section = resultsSection();
    if (section) section.hidden = true;
  }

  function unlockLegacyGate() {
    const button = technicalSearchButton();
    if (button) button.click();
  }

  function refreshVisibilityAndResults() {
    if (hasSelection() || hasUrlFilters()) {
      unlockLegacyGate();
      showResults();
      renderCurrent();
    } else {
      hideResults();
    }
  }

  function clearCategoryChipState() {
    document.querySelectorAll('.category-chip.active').forEach(chip => chip.classList.remove('active'));
  }

  function selectEventChip(chip) {
    const category = technicalCategory();
    const feature = technicalFeature();
    if (!category || !feature) return;

    const wasActive = chip.classList.contains('active');
    clearCategoryChipState();
    category.value = 'qualquer';
    feature.value = 'qualquer';

    if (!wasActive) {
      if (chip.dataset.tag) feature.value = chip.dataset.tag;
      else if (chip.dataset.category) category.value = chip.dataset.category;
      chip.classList.add('active');
    }

    try { state.visible = 18; } catch {}
    refreshVisibilityAndResults();
  }

  function togglePlaceChip(chip) {
    const set = chip.dataset.filterKind === 'category' ? selectedCategories : selectedFeatures;
    const value = chip.dataset.value;
    if (!value) return;
    if (set.has(value)) {
      set.delete(value);
      chip.classList.remove('active');
      chip.setAttribute('aria-pressed','false');
    } else {
      set.add(value);
      chip.classList.add('active');
      chip.setAttribute('aria-pressed','true');
    }
    try { state.visible = 18; } catch {}
    refreshVisibilityAndResults();
  }

  document.addEventListener('change', event => {
    const select = event.target.closest('.search-panel select:not(.technical-filter)');
    if (!select) return;
    try { state.visible = 18; } catch {}
    refreshVisibilityAndResults();
  });

  document.addEventListener('click', event => {
    const placeChip = event.target.closest('.browse-filter-chip');
    if (placeChip && page === 'lugares') {
      event.preventDefault();
      event.stopPropagation();
      togglePlaceChip(placeChip);
      return;
    }

    const chip = event.target.closest('.category-chip');
    if (chip && page === 'eventos') {
      event.preventDefault();
      event.stopPropagation();
      selectEventChip(chip);
    }
  }, true);

  document.addEventListener('click', event => {
    if (page !== 'lugares') return;
    const more = event.target.closest('#show-more');
    if (!more) return;
    event.preventDefault();
    event.stopPropagation();
    try { state.visible += 18; } catch {}
    renderPlaces();
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.browse-filter-chip').forEach(chip => chip.setAttribute('aria-pressed','false'));
    if (hasUrlFilters()) {
      showResults();
      setTimeout(renderCurrent,0);
    } else {
      hideResults();
    }
  });
})();
