(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const VERIFIED_ADDRESSES = new Map([
    ['l-098-anexo-bz','saa quadra 2, nº 45, saan, brasília - df, 70632-200'],
    ['l-034-birosca-do-conic','sds, bloco e, loja 3, conic, brasília - df, 70300-970'],
    ['l-097-complexo-fora-do-eixo','saan quadra 1, brasília - df, 70632-100']
  ]);

  const ADDRESS_HINT = /\b(?:rua|avenida|av\.?|quadra|qnn|cnn|saan|scrn|cls|sds|setor|shopping|rodovia|br-?\d+|lote|trecho|eqs|shtn|bloco)\b/i;
  const TRANSPORT_HINT = /onibus|metro|app|caminhada|carro|transporte publico|ponto|parada|estacao/;

  function enrichKnownAddress(item) {
    if (!item) return;
    const address = VERIFIED_ADDRESSES.get(item.id);
    if (address && !item.endereco) item.endereco = address;

    if (!item.endereco && item.acesso) {
      const access = norm(item.acesso);
      if (ADDRESS_HINT.test(item.acesso) && !TRANSPORT_HINT.test(access) && !/consultar|confirmar|planejar|agendamento/.test(access)) {
        item.endereco = item.acesso;
      }
    }
  }

  function addressLabel(item) {
    if (item?.endereco) return item.endereco;
    if (item?.bairro && item?.cidade) return `${item.bairro}, ${item.cidade}`;
    if (item?.cidade) return `endereço a confirmar · ${item.cidade}`;
    return 'endereço a confirmar';
  }

  function transportLabels(raw) {
    const text = norm(raw);
    if (!text) return [];

    const labels = [];
    const bus = /onibus perto|ponto de onibus|parada de onibus|onibus\s*\+|onibus\s*\/|\/\s*onibus/.test(text);
    const metro = /metro perto|metro proximo|perto do metro|estacao de metro|metro\s*\+|metro\s*\/|\/\s*metro/.test(text);

    if (bus) labels.push('🚌 ônibus perto');
    if (metro) labels.push('🚇 metrô perto');
    return labels;
  }

  function polishCards() {
    let places = [];
    try { places = state?.lugares || []; } catch {}
    if (!places.length) return;

    document.querySelectorAll('.place-card').forEach(card => {
      const item = places.find(place => place.id === card.dataset.id);
      if (!item) return;
      enrichKnownAddress(item);

      const meta = card.querySelector('.card-meta');
      if (meta) {
        let addressLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('🧭'));
        if (!addressLine) {
          addressLine = document.createElement('p');
          const locationLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('📍'));
          locationLine ? locationLine.insertAdjacentElement('afterend',addressLine) : meta.prepend(addressLine);
        }
        addressLine.textContent = `🧭 ${addressLabel(item)}`;

        let accessLine = [...meta.querySelectorAll('p')].find(p => p.textContent.trim().startsWith('🚏') || p.textContent.trim().startsWith('🚌') || p.textContent.trim().startsWith('🚇'));
        const labels = transportLabels(item.acesso);
        if (labels.length) {
          if (!accessLine) {
            accessLine = document.createElement('p');
            addressLine.insertAdjacentElement('afterend',accessLine);
          }
          accessLine.textContent = labels.join(' · ');
        } else if (accessLine) {
          accessLine.remove();
        }
      }

      card.querySelectorAll('.tag-chip').forEach(chip => {
        if (norm(chip.title) === 'melhor ir de carro') chip.remove();
      });
    });
  }

  function enrichState(tries=0) {
    try {
      if (typeof state === 'undefined' || !Array.isArray(state.lugares) || !state.lugares.length) {
        if (tries < 100) setTimeout(() => enrichState(tries + 1),80);
        return;
      }
      state.lugares.forEach(enrichKnownAddress);
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
