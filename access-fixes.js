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
    return 'endereço a confirmar';
  }

  function friendlyAccess(raw,item) {
    let text = (raw || '').toString().trim();
    if (!text) return '';

    text = text
      .replace(/\b[oô]nibus\/(?:metr[oô])\s*\+\s*volta de app\b/gi,'ônibus ou metrô · volta de app se sair tarde')
      .replace(/\b[oô]nibus\s*\+\s*volta de app\b/gi,'ônibus · volta de app se sair tarde')
      .replace(/\b[oô]nibus\/(?:metr[oô])\s*\+\s*caminhada\b/gi,'ônibus ou metrô + trecho a pé')
      .replace(/\b[oô]nibus\s*\+\s*caminhada\b/gi,'ônibus + trecho a pé')
      .replace(/\b[oô]nibus\s*\+\s*app\b/gi,'ônibus + app no trecho final')
      .replace(/\b[oô]nibus\/app conforme o local\b/gi,'ônibus ou app, depende da unidade')
      .replace(/\b[oô]nibus\/app(?: local)?\b/gi,'ônibus ou app')
      .replace(/\bmetr[oô]\/[oô]nibus\b|\b[oô]nibus\/metr[oô]\b/gi,'metrô ou ônibus')
      .replace(/\b(?:alguns?\s+)?carro facilita\b/gi,'')
      .replace(/\bcarro recomendado\b/gi,'')
      .replace(/\bacesso de carro\b/gi,'')
      .replace(/\bmais f[aá]cil de carro\b/gi,'')
      .replace(/\bpesquisar [oô]nibus\b/gi,'')
      .replace(/\bconsultar acesso antes de sair\b/gi,'')
      .replace(/\bconfirmar acesso antes de sair\b/gi,'')
      .replace(/\bplanejar deslocamento\b/gi,'')
      .replace(/\s*;\s*/g,' · ')
      .replace(/(?:\s*·\s*){2,}/g,' · ')
      .replace(/^\s*·\s*|\s*·\s*$/g,'')
      .replace(/\s{2,}/g,' ')
      .trim();

    if (!text) return '';
    if (item?.endereco && norm(text) === norm(item.endereco)) return '';
    if (item?.cidade && norm(text) === norm(item.cidade)) return '';
    if (ADDRESS_HINT.test(text) && !TRANSPORT_HINT.test(norm(text))) return '';

    const parts = [...new Set(text.split(/\s*·\s*/).map(part => part.trim()).filter(Boolean))].slice(0,2);
    const compact = parts.join(' · ');
    return compact.length > 90 ? `${compact.slice(0,87).trim()}…` : compact;
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
      }

      const accessLine = [...card.querySelectorAll('.card-meta p')].find(p => p.textContent.trim().startsWith('🚏'));
      if (!accessLine) return;
      const label = friendlyAccess(item.acesso,item);
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
