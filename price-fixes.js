(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  function formatMoney(value) {
    return `r$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)}`;
  }

  function toNumber(value) {
    const n = Number((value || '').replace('.','').replace(',','.'));
    return Number.isFinite(n) ? n : null;
  }

  function amountMatches(text) {
    return [...text.matchAll(/r\$\s*(\d{1,5}(?:[.,]\d{1,2})?)/gi)]
      .map(match => ({ raw:match[0], value:toNumber(match[1]), index:match.index ?? 0 }))
      .filter(item => item.value !== null);
  }

  function extractAmounts(text) {
    return [...new Set(amountMatches(text).map(item => item.value))].sort((a,b) => a - b);
  }

  function labeledAmount(text, labelPattern) {
    const after = new RegExp(`r\\$\\s*(\\d{1,5}(?:[.,]\\d{1,2})?)\\s*(?:[^r$]{0,18})?${labelPattern}`,'i').exec(text);
    if (after) return toNumber(after[1]);
    const before = new RegExp(`${labelPattern}(?:[^r$]{0,18})?r\\$\\s*(\\d{1,5}(?:[.,]\\d{1,2})?)`,'i').exec(text);
    return before ? toNumber(before[1]) : null;
  }

  function preserveTicketLabels(text, clean) {
    if (/inteira|meia/.test(clean)) {
      const inteira = labeledAmount(text,'inteira');
      const meia = labeledAmount(text,'meia(?:-entrada)?');
      if (inteira !== null && meia !== null) return `${formatMoney(inteira)} inteira · ${formatMoney(meia)} meia`;
      if (inteira !== null) return `${formatMoney(inteira)} inteira`;
      if (meia !== null) return `${formatMoney(meia)} meia`;
    }

    if (/antecipad/.test(clean)) {
      const antecipado = labeledAmount(text,'antecipad[oa]');
      const naHora = labeledAmount(text,'na hora');
      const portaria = labeledAmount(text,'portaria');
      if (antecipado !== null && naHora !== null) return `${formatMoney(antecipado)} antecipado · ${formatMoney(naHora)} na hora`;
      if (antecipado !== null && portaria !== null) return `${formatMoney(antecipado)} antecipado · ${formatMoney(portaria)} portaria`;
      if (antecipado !== null && /portaria|na hora/.test(clean)) return `${formatMoney(antecipado)} antecipado · portaria a consultar`;
      if (antecipado !== null) return `${formatMoney(antecipado)} antecipado`;
    }

    return null;
  }

  function shorthandRange(text) {
    const match = /r\$\s*(\d{1,5}(?:[.,]\d{1,2})?)\s*[–—-]\s*(?:r\$\s*)?(\d{1,5}(?:[.,]\d{1,2})?)/i.exec(text);
    if (!match) return null;
    const first = toNumber(match[1]), second = toNumber(match[2]);
    if (first === null || second === null) return null;
    const low = Math.min(first,second), high = Math.max(first,second);
    return `${formatMoney(low)}–${formatMoney(high).replace(/^r\$\s*/,'')}`;
  }

  function normalizedPrice(raw) {
    const text = (raw || '').replace(/^\s*💰\s*/, '').trim();
    const clean = norm(text);

    if (!text) return 'consultar valor';
    if (/gratis|gratuit|entrada livre|entrada franca/.test(clean)) return 'grátis';

    const labeled = preserveTicketLabels(text, clean);
    if (labeled) return labeled;

    const shortRange = shorthandRange(text);
    if (shortRange) return shortRange;

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
    if (/a partir|lote|taxa|demais valores|valores maiores|conforme categoria/.test(clean)) return `a partir de ${value}`;
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
