(() => {
  if (document.body.dataset.page !== 'eventos') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const tagsOf = item => new Set((item?.tags || []).map(norm));

  function priceBucket(item) {
    const raw = `${item?.preco || ''} ${item?.ingresso || ''}`;
    const text = norm(raw);
    if (item?.precoFaixa === 'gratis' || /gratis|gratuit|entrada livre|entrada franca/.test(text)) return 'gratis';

    const values = [...raw.matchAll(/r\$\s*(\d{1,5}(?:[.,]\d{1,2})?)/gi)]
      .map(match => Number(match[1].replace('.','').replace(',','.')))
      .filter(Number.isFinite);
    if (!values.length) return 'nao-informado';

    const value = Math.min(...values);
    if (value <= 20) return 'ate-20';
    if (value <= 50) return 'ate-50';
    if (value <= 100) return 'ate-100';
    return 'acima-100';
  }

  function exactPriceMatch(item,value) {
    if (!value || value === 'qualquer') return true;
    return priceBucket(item) === value;
  }

  function typeMatch(item,value) {
    if (!value || value === 'qualquer') return true;
    const tags = tagsOf(item);
    if (value === 'lgbtqia') return tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt');
    if (value === 'alternativo') return tags.has('alternativo');
    try { return typeof canonicalEventCategory === 'function' && canonicalEventCategory(item) === value; }
    catch { return false; }
  }

  function renderRoles() {
    try {
      const local = document.querySelector('#local')?.value || 'qualquer';
      const data = document.querySelector('#data')?.value || 'qualquer';
      const valor = document.querySelector('#valor')?.value || 'qualquer';
      const horario = document.querySelector('#horario')?.value || 'qualquer';
      const tipo = document.querySelector('#tipo')?.value || 'qualquer';
      const detail = new URLSearchParams(location.search).get('detalhe');

      const items = (state.eventos || []).filter(item =>
        (typeof cityMatches !== 'function' || cityMatches(item.cidade,local)) &&
        (typeof eventDateMatches !== 'function' || eventDateMatches(item,data)) &&
        exactPriceMatch(item,valor) &&
        (typeof timeMatches !== 'function' || timeMatches(item,horario)) &&
        typeMatch(item,tipo) &&
        (typeof detailMatches !== 'function' || detailMatches(item,detail))
      );

      const sorted = typeof sortEvents === 'function' ? sortEvents(items) : items;
      if (typeof renderList === 'function') renderList(sorted,'event');
    } catch (err) {
      console.warn('não foi possível filtrar os rolês',err);
    }
  }

  try { renderEventos = renderRoles; } catch {}

  document.addEventListener('roledfora:data-updated',() => {
    try {
      if (document.querySelector('.search-results-section:not([hidden])')) renderRoles();
    } catch {}
  });
})();
