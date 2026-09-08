(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const STRONG_CAR_ACCESS = /carro facilita|carro recomendado|acesso de carro|acesso somente (?:por|de) carro|somente de carro|dificil acesso (?:por|de) transporte publico|sem transporte publico|nao ha transporte publico|transporte publico limitado|ultimo trecho sem onibus|trecho final sem transporte publico|acesso somente por estrada/;

  function enrichCarAccess(item) {
    if (!item || !item.acesso) return;
    const access = norm(item.acesso);
    if (!STRONG_CAR_ACCESS.test(access)) return;
    if (!/carro recomendado/.test(access)) item.acesso = `${item.acesso}; carro recomendado`;
  }

  function friendlyAccess(raw) {
    let text = (raw || '').toString().trim();
    if (!text) return '';

    text = text
      .replace(/\b(?:alguns?\s+)?carro facilita\b/gi,'mais fácil de carro')
      .replace(/\bcarro recomendado\b/gi,'melhor ir de carro')
      .replace(/\bacesso de carro\b/gi,'acesso por carro')
      .replace(/\bpesquisar ônibus\b/gi,'')
      .replace(/\bônibus\/app(?: local| conforme o local)?\b/gi,'ônibus ou app')
      .replace(/\bmetrô\/ônibus\b/gi,'metrô ou ônibus')
      .replace(/\s*;\s*/g,' · ')
      .replace(/(?:\s*·\s*){2,}/g,' · ')
      .replace(/^\s*·\s*|\s*·\s*$/g,'')
      .replace(/\s{2,}/g,' ')
      .trim();

    const parts = text.split(/\s*·\s*/).filter(Boolean);
    return [...new Set(parts.map(part => part.trim()))].join(' · ');
  }

  function polishCards() {
    let places = [];
    try { places = state?.lugares || []; } catch {}
    if (!places.length) return;

    document.querySelectorAll('.place-card').forEach(card => {
      const item = places.find(place => place.id === card.dataset.id);
      if (!item) return;
      enrichCarAccess(item);

      const accessLine = [...card.querySelectorAll('.card-meta p')].find(p => p.textContent.trim().startsWith('🚏'));
      if (!accessLine) return;
      const label = friendlyAccess(item.acesso);
      if (!label) accessLine.remove();
      else accessLine.textContent = `🚏 ${label}`;
    });
  }

  function enrichState(tries=0) {
    try {
      if (typeof state === 'undefined' || !Array.isArray(state.lugares) || !state.lugares.length) {
        if (tries < 100) setTimeout(() => enrichState(tries + 1),80);
        return;
      }
      state.lugares.forEach(enrichCarAccess);
      try { if (typeof renderLugares === 'function' && document.querySelector('.search-results-section:not([hidden])')) renderLugares(); } catch {}
      polishCards();
    } catch {
      if (tries < 100) setTimeout(() => enrichState(tries + 1),80);
    }
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      polishCards();
    });
  });

  document.addEventListener('DOMContentLoaded',() => {
    enrichState();
    polishCards();
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
