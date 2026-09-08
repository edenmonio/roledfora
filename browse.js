(() => {
  const page = document.body.dataset.page;
  if (!['eventos','lugares'].includes(page)) return;

  const resultsSection = () => document.querySelector('.search-results-section');
  const categorySelect = () => document.querySelector(page === 'eventos' ? '#tipo' : '#categoria');
  const featureSelect = () => document.querySelector(page === 'eventos' ? '#caracteristica' : '#vibe');

  function renderCurrent() {
    try {
      state.visible = 18;
      if (page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      if (page === 'lugares' && typeof renderLugares === 'function') renderLugares();
    } catch (err) {
      console.warn('não foi possível atualizar os resultados',err);
    }
  }

  function hasSelection() {
    const selects = [...document.querySelectorAll('.search-panel select')];
    return selects.some(select => select.value && select.value !== 'qualquer');
  }

  function hasUrlFilters() {
    return new URLSearchParams(location.search).toString().length > 0;
  }

  function syncResults() {
    const section = resultsSection();
    if (!section) return;
    if (hasSelection() || hasUrlFilters()) {
      section.hidden = false;
      renderCurrent();
    } else {
      section.hidden = true;
    }
  }

  function clearActiveChips() {
    document.querySelectorAll('.category-chip.active').forEach(chip => chip.classList.remove('active'));
  }

  function syncChipFromSelect() {
    clearActiveChips();
    const cat = categorySelect()?.value || 'qualquer';
    const feature = featureSelect()?.value || 'qualquer';
    document.querySelectorAll('.category-chip').forEach(chip => {
      const matchesFeature = page === 'eventos' && chip.dataset.tag && chip.dataset.tag === feature;
      const matchesCategory = !chip.dataset.tag && chip.dataset.category === cat;
      if (matchesFeature || matchesCategory) chip.classList.add('active');
    });
  }

  function selectChip(chip) {
    const category = categorySelect();
    const feature = featureSelect();
    if (!category) return;

    const wasActive = chip.classList.contains('active');
    clearActiveChips();

    if (page === 'lugares') {
      category.value = wasActive ? 'qualquer' : (chip.dataset.category || 'qualquer');
      if (!wasActive) chip.classList.add('active');
      syncResults();
      return;
    }

    if (!feature) return;
    if (wasActive) {
      category.value = 'qualquer';
      feature.value = 'qualquer';
    } else if (chip.dataset.tag) {
      category.value = 'qualquer';
      feature.value = chip.dataset.tag;
      chip.classList.add('active');
    } else if (chip.dataset.category) {
      category.value = chip.dataset.category;
      feature.value = 'qualquer';
      chip.classList.add('active');
    }
    syncResults();
  }

  document.addEventListener('change',event => {
    const select = event.target.closest('.search-panel select');
    if (!select) return;
    syncChipFromSelect();
    syncResults();
  });

  document.addEventListener('click',event => {
    const chip = event.target.closest('.category-chip');
    if (!chip) return;
    event.preventDefault();
    event.stopPropagation();
    selectChip(chip);
  },true);

  document.addEventListener('click',event => {
    const more = event.target.closest('#show-more');
    if (!more) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      state.visible += 18;
      if (page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      if (page === 'lugares' && typeof renderLugares === 'function') renderLugares();
    } catch {}
  },true);

  document.addEventListener('DOMContentLoaded',() => {
    syncChipFromSelect();
    const section = resultsSection();
    if (!section) return;
    if (hasUrlFilters()) {
      section.hidden = false;
      setTimeout(renderCurrent,0);
    } else {
      section.hidden = true;
    }
  });
})();
