(() => {
  const page = document.body.dataset.page;
  if (!['eventos','lugares'].includes(page)) return;

  const resultsSection = () => document.querySelector('.search-results-section');
  const technicalCategory = () => document.querySelector(page === 'eventos' ? '#tipo' : '#categoria');
  const technicalFeature = () => document.querySelector(page === 'eventos' ? '#caracteristica' : '#vibe');
  const technicalSearchButton = () => document.querySelector('.search-button.technical-filter');

  function renderCurrent() {
    try {
      if (page === 'eventos' && typeof renderEventos === 'function') renderEventos();
      if (page === 'lugares' && typeof renderLugares === 'function') renderLugares();
    } catch (err) {
      console.warn('não foi possível atualizar os resultados', err);
    }
  }

  function hasSelection() {
    const visible = [...document.querySelectorAll('.search-panel select:not(.technical-filter)')];
    const visibleSelected = visible.some(select => select.value && select.value !== 'qualquer');
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
      if (chip.dataset.tag) feature.value = chip.dataset.tag;
      else if (chip.dataset.category) category.value = chip.dataset.category;
      chip.classList.add('active');
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
    const chip = event.target.closest('.category-chip');
    if (!chip) return;
    event.preventDefault();
    event.stopPropagation();
    selectChip(chip);
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    if (hasUrlFilters()) {
      showResults();
      renderCurrent();
    } else {
      hideResults();
    }
  });
})();
