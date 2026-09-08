(() => {
  if (document.body.dataset.page !== 'eventos') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const tagsOf = item => new Set((item?.tags || []).map(norm));
  const SAFE_WOMEN = new Set(['seguro para mulheres','ambiente seguro para mulheres','espaco seguro para mulheres','safe space mulheres','safe space para mulheres']);
  const SAFE_LGBT = new Set(['seguro para lgbt','seguro para lgbtqia+','ambiente seguro lgbt','ambiente seguro para lgbtqia+','espaco seguro lgbt','espaco seguro para lgbtqia+','safe space lgbt','safe space lgbtqia+']);

  const hasExplicit = (tags,set) => [...tags].some(tag => set.has(tag));

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

  function characteristicMatch(item,value) {
    if (!value || value === 'qualquer') return true;
    const tags = tagsOf(item), access = norm(item?.acesso);

    if (value === 'acessivel') return tags.has('acessivel');
    if (value === 'aceita-pets') return tags.has('pet friendly') || tags.has('aceita pets');
    if (value === 'alternativo') return tags.has('alternativo');
    if (value === 'ao-ar-livre') return tags.has('ao ar livre');
    if (value === 'bom-criancas') return tags.has('bom para criancas') || tags.has('kid friendly') || tags.has('infantil');
    if (value === 'date') return tags.has('date') || tags.has('date diferente');
    if (value === 'sozinho') return tags.has('sozinho') || tags.has('solo') || tags.has('bom pra ir sozinho');
    if (value === 'lgbtqia') return tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt');
    if (value === 'familias') return tags.has('familia') || tags.has('familiar') || tags.has('para familias');
    if (value === 'tranquilo') return tags.has('tranquilo') || tags.has('calmo') || tags.has('relax');
    if (value === '18mais') return tags.has('18+') || tags.has('maiores de 18') || tags.has('adulto');
    if (value === 'estacionamento') return tags.has('estacionamento') || access.includes('estacionamento');
    if (value === 'metro-perto') return tags.has('metro perto') || tags.has('metro proximo') || /metro perto|metro proximo|perto do metro|estacao de metro/.test(access);
    if (value === 'onibus-perto') return tags.has('onibus perto') || /onibus perto|ponto de onibus|parada de onibus|\bonibus\b/.test(access);
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
      const estrutura = document.querySelector('#estrutura')?.value || 'qualquer';
      const detail = new URLSearchParams(location.search).get('detalhe');

      const items = (state.eventos || []).filter(item =>
        (typeof cityMatches !== 'function' || cityMatches(item.cidade,local)) &&
        (typeof eventDateMatches !== 'function' || eventDateMatches(item,data)) &&
        exactPriceMatch(item,valor) &&
        (typeof timeMatches !== 'function' || timeMatches(item,horario)) &&
        (tipo === 'qualquer' || (typeof canonicalEventCategory === 'function' && canonicalEventCategory(item) === tipo)) &&
        characteristicMatch(item,vibe) &&
        characteristicMatch(item,estrutura) &&
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
