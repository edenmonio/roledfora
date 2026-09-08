(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  function formatMoney(value) {
    return `r$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)}`;
  }

  function extractAmounts(text) {
    const values = [...text.matchAll(/r\$\s*(\d{1,5}(?:[.,]\d{1,2})?)/gi)]
      .map(match => Number(match[1].replace('.','').replace(',','.')))
      .filter(Number.isFinite);
    return [...new Set(values)].sort((a,b) => a - b);
  }

  function normalizedPrice(raw) {
    const text = (raw || '').replace(/^\s*💰\s*/, '').trim();
    const clean = norm(text);

    if (!text) return 'consultar valor';
    if (/gratis|gratuit|entrada livre|entrada franca/.test(clean)) return 'grátis';

    const amounts = extractAmounts(text);
    if (!amounts.length) {
      if (/consult|nao informado|a confirmar|depende|varia conforme|valores? conforme/.test(clean)) return 'consultar valor';
      return text;
    }

    if (amounts.length > 1) {
      return `${formatMoney(amounts[0])}–${formatMoney(amounts[amounts.length - 1]).replace(/^r\$\s*/,'')}`;
    }

    const value = formatMoney(amounts[0]);
    if (/cerca de|aprox|aproximad/.test(clean)) return `aprox. ${value}`;
    if (/a partir|antecipad|lote|taxa|demais valores|valores maiores|conforme categoria/.test(clean)) return `a partir de ${value}`;
    return value;
  }

  function apply() {
    document.querySelectorAll('.event-card .card-meta p, .place-card .card-meta p').forEach(line => {
      if (!line.textContent.trim().startsWith('💰')) return;
      const current = line.textContent.trim();
      const normalized = `💰 ${normalizedPrice(current)}`;
      if (current !== normalized) line.textContent = normalized;
    });
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  });

  document.addEventListener('DOMContentLoaded', () => {
    apply();
    observer.observe(document.body, { childList:true, subtree:true });
  });
})();
