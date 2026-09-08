(() => {
  if (document.body.dataset.page !== 'eventos') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const tagsOf = item => new Set((item?.tags || []).map(norm));
  const SAFE_WOMEN = new Set(['seguro para mulheres','ambiente seguro para mulheres','espaco seguro para mulheres','safe space mulheres','safe space para mulheres']);
  const SAFE_LGBT = new Set(['seguro para lgbt','seguro para lgbtqia+','ambiente seguro lgbt','ambiente seguro para lgbtqia+','espaco seguro lgbt','espaco seguro para lgbtqia+','safe space lgbt','safe space lgbtqia+']);

  const hasExplicit = (tags,set) => [...tags].some(tag => set.has(tag));

  function characteristicMatch(item,value) {
    if (!value || value === 'qualquer') return true;
    const tags = tagsOf(item);

    if (value === 'acessivel') return tags.has('acessivel');
    if (value === 'alternativo') return tags.has('alternativo');
    if (value === 'ao-ar-livre') return tags.has('ao ar livre');
    if (value === 'bom-criancas') return tags.has('bom para criancas') || tags.has('kid friendly') || tags.has('infantil');
    if (value === 'dancante') return tags.has('dancante') || tags.has('balada');
    if (value === 'lgbtqia') return tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt');
    if (value === 'musica-vivo') return tags.has('musica ao vivo');
    if (value === 'familias') return tags.has('familia') || tags.has('familiar') || tags.has('para familias');
    if (value === 'tranquilo') return tags.has('tranquilo') || tags.has('calmo') || tags.has('relax');
    if (value === '18mais') return tags.has('18+') || tags.has('maiores de 18') || tags.has('adulto');
    if (value === 'universitario') return tags.has('universitario') || tags.has('universitaria');
    if (value === 'seguro-lgbt') return hasExplicit(tags,SAFE_LGBT);
    if (value === 'seguro-mulheres') return hasExplicit(tags,SAFE_WOMEN);
    return true;
  }

  function renderRoles() {
    try {
      const local = document.querySelector('#local')?.value || 'qualquer';
      const data = document.querySelector('#data')?.value || 'qualquer';
      const valor = document.querySelector('#valor')?.value || 'qualquer';
      const horario = document.querySelector('#horario')?.value || 'qualquer';
      const tipo = document.querySelector('#tipo')?.value || 'qualquer';
      const vibe = document.querySelector('#caracteristica')?.value || 'qualquer';
      const acolhimento = document.querySelector('#acolhimento')?.value || 'qualquer';
      const detail = new URLSearchParams(location.search).get('detalhe');

      const items = (state.eventos || []).filter(item =>
        (typeof cityMatches !== 'function' || cityMatches(item.cidade,local)) &&
        (typeof eventDateMatches !== 'function' || eventDateMatches(item,data)) &&
        (typeof priceMatches !== 'function' || priceMatches(item,valor)) &&
        (typeof timeMatches !== 'function' || timeMatches(item,horario)) &&
        (tipo === 'qualquer' || (typeof canonicalEventCategory === 'function' && canonicalEventCategory(item) === tipo)) &&
        characteristicMatch(item,vibe) &&
        characteristicMatch(item,acolhimento) &&
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
