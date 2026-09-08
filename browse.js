(() => {
  const page = document.body.dataset.page;
  if (!['eventos','lugares'].includes(page)) return;

  const resultsSection = () => document.querySelector('.search-results-section');
  const renderCurrent = () => {
    try {
      if (page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      if (page === 'lugares' && typeof renderLugares === 'function') renderLugares();
    } catch (err) {
      console.warn('não foi possível atualizar os resultados', err);
    }
  };

  const technicalCategory = () => document.querySelector(page === 'eventos' ? '#tipo' : '#categoria');
  const technicalFeature = () => document.querySelector(page === 'eventos' ? '#caracteristica' : '#vibe');

  function hasVisibleFilter() {
    const visible = [...document.querySelectorAll('.search-panel select:not(.technical-filter)')];
    const visibleSelected = visible.some(select => select.value && select.value !== 'qualquer');
    const categorySelected = technicalCategory()?.value && technicalCategory().value !== 'qualquer';
    const featureSelected = technicalFeature()?.value && technicalFeature().value !== 'qualquer';
    return Boolean(visibleSelected || categorySelected || featureSelected);
  }

  function syncSection() {
    const section = resultsSection();
    if (!section) return;
    const fromUrl = new URLSearchParams(location.search).toString().length > 0;
    section.hidden = !(hasVisibleFilter() || fromUrl);
  }

  function clearChipState() {
    document.querySelectorAll('.category-chip.active').forEach(chip => chip.classList.remove('active'));
  }

  function selectChip(chip) {
    const category = technicalCategory();
    const feature = technicalFeature();
    if (!category || !feature) return;

    const wasActive = chip.classList.contains('active');
    clearChipState();
    category.value = 'qualquer';
    feature.value = 'qualquer';

    if (!wasActive) {
      const tag = chip.dataset.tag;
      const categoryValue = chip.dataset.category;
      if (tag) feature.value = tag;
      else if (categoryValue) category.value = categoryValue;
      chip.classList.add('active');
    }

    state.visible = 18;
    syncSection();
    renderCurrent();
  }

  document.addEventListener('change', event => {
    const select = event.target.closest('.search-panel select:not(.technical-filter)');
    if (!select) return;
    state.visible = 18;
    syncSection();
    renderCurrent();
  });

  document.addEventListener('click', event => {
    const chip = event.target.closest('.category-chip');
    if (!chip) return;
    event.preventDefault();
    event.stopPropagation();
    selectChip(chip);
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    syncSection();
    if (new URLSearchParams(location.search).toString().length > 0) renderCurrent();
  });
})();
