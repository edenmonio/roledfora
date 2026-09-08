(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const STRONG_CAR_ACCESS = /carro facilita|carro recomendado|acesso de carro|acesso somente (?:por|de) carro|somente de carro|dificil acesso (?:por|de) transporte publico|sem transporte publico|nao ha transporte publico|transporte publico limitado|ultimo trecho sem onibus|trecho final sem transporte publico|acesso somente por estrada/;

  const VERIFIED_ADDRESSES = new Map([
    ['l-098-anexo-bz','saa quadra 2, nº 45, saan, brasília - df, 70632-200'],
    ['l-034-birosca-do-conic','sds, bloco e, loja 3, conic, brasília - df, 70300-970'],
    ['l-097-complexo-fora-do-eixo','saan quadra 1, brasília - df, 70632-100']
  ]);

  function enrichKnownAddress(item) {
    if (!item) return;
    const address = VERIFIED_ADDRESSES.get(item.id);
    if (address && !item.endereco) item.endereco = address;
  }

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
      .replace(/\b[oô]nibus\/(?:metr[oô])\s*\+\s*volta de app\b/gi,'dá para chegar de ônibus ou metrô; se sair tarde, a volta de app costuma ser mais prática')
      .replace(/\b[oô]nibus\s*\+\s*volta de app\b/gi,'dá para chegar de ônibus; se sair tarde, a volta de app costuma ser mais prática')
      .replace(/\b[oô]nibus\/(?:metr[oô])\s*\+\s*caminhada\b/gi,'dá para chegar de ônibus ou metrô; depois há um trecho a pé')
      .replace(/\b[oô]nibus\s*\+\s*caminhada\b/gi,'dá para chegar de ônibus; depois há um trecho a pé')
      .replace(/\b[oô]nibus\s*\+\s*app\b/gi,'dá para chegar de ônibus; app pode ajudar no trecho final')
      .replace(/\b[oô]nibus\/app conforme o local\b/gi,'o transporte muda conforme a unidade; confira a rota antes de sair')
      .replace(/\b[oô]nibus\/app(?: local)?\b/gi,'ônibus ou app')
      .replace(/\bmetr[oô]\/onibus\b/gi,'metrô ou ônibus')
      .replace(/\bmetr[oô]\/[oô]nibus\b/gi,'metrô ou ônibus')
      .replace(/\b(?:alguns?\s+)?carro facilita\b/gi,'')
      .replace(/\bcarro recomendado\b/gi,'')
      .replace(/\bacesso de carro\b/gi,'')
      .replace(/\bmais f[aá]cil de carro\b/gi,'')
      .replace(/\bpesquisar [oô]nibus\b/gi,'')
      .replace(/\s*;\s*/g,' · ')
      .replace(/(?:\s*·\s*){2,}/g,' · ')
      .replace(/^\s*·\s*|\s*·\s*$/g,'')
      .replace(/\s{2,}/g,' ')
      .trim();

    const parts = text.split(/\s*·\s*/).map(part => part.trim()).filter(Boolean);
    return [...new Set(parts)].join(' · ');
  }

  function polishCards() {
    let places = [];
    try { places = state?.lugares || []; } catch {}
    if (!places.length) return;

    document.querySelectorAll('.place-card').forEach(card => {
      const item = places.find(place => place.id === card.dataset.id);
      if (!item) return;
      enrichKnownAddress(item);
      enrichCarAccess(item);

      const meta = card.querySelector('.card-meta');
      if (meta && item.endereco) {
        let addressLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('🧭'));
        if (!addressLine) {
          addressLine = document.createElement('p');
          const locationLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('📍'));
          locationLine ? locationLine.insertAdjacentElement('afterend',addressLine) : meta.prepend(addressLine);
        }
        addressLine.textContent = `🧭 ${item.endereco}`;
      }

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
      state.lugares.forEach(item => {
        enrichKnownAddress(item);
        enrichCarAccess(item);
      });
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

  document.addEventListener('roledfora:data-updated',() => {
    enrichState();
    polishCards();
  });

  document.addEventListener('DOMContentLoaded',() => {
    enrichState();
    polishCards();
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
