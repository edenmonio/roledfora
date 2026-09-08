(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const ENTORNO = new Set([
    'aguas lindas de goias','cidade ocidental','cocalzinho de goias','cristalina','formosa','luziania',
    'novo gama','padre bernardo','planaltina de goias','santo antonio do descoberto','valparaiso de goias'
  ]);

  function isDf(city) {
    try { return typeof isDfCity === 'function' && isDfCity(city); }
    catch { return false; }
  }

  function inScope(item) {
    return isDf(item?.cidade) || ENTORNO.has(norm(item?.cidade));
  }

  function cityMatch(city,value) {
    if (!value || value === 'qualquer') return true;
    const c = norm(city), v = norm(value);
    if (v === 'df') return isDf(city);
    if (v === 'entorno') return ENTORNO.has(c);
    return c === v;
  }

  function detailMatch(item,detail) {
    if (!detail) return true;
    try { return typeof detailMatches === 'function' ? detailMatches(item,detail) : true; }
    catch { return true; }
  }

  function priceBucket(item) {
    const raw = `${item?.preco || ''}`;
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

  function renderConhecer() {
    try {
      const local = document.querySelector('#onde')?.value || 'qualquer';
      const cat = document.querySelector('#categoria')?.value || 'qualquer';
      const preco = document.querySelector('#preco')?.value || 'qualquer';
      const detail = new URLSearchParams(location.search).get('detalhe');

      const items = (state.lugares || []).filter(item =>
        inScope(item) &&
        cityMatch(item.cidade,local) &&
        (cat === 'qualquer' || (typeof canonicalPlaceCategory === 'function' && canonicalPlaceCategory(item) === cat)) &&
        exactPriceMatch(item,preco) &&
        detailMatch(item,detail)
      );
      if (typeof renderList === 'function') renderList(items,'place');
    } catch (err) {
      console.warn('não foi possível filtrar os lugares',err);
    }
  }

  try { renderLugares = renderConhecer; } catch {}

  function patchKnownPlaces() {
    let places = [];
    try { places = state?.lugares || []; } catch {}
    if (!places.length) return false;

    const zoom = places.find(item => item.id === 'web-36-zoom-gay-bar' || norm(item.nome) === 'zoom gay bar brasilia');
    if (zoom) zoom.tags = [...new Set([...(zoom.tags || []),'18+'])];
    return true;
  }

  function isFree(item) {
    const text = norm(item?.preco);
    return item?.precoFaixa === 'gratis' || /gratis|gratuit|entrada livre|entrada franca/.test(text);
  }

  function findPlace(card) {
    try { return (state?.lugares || []).find(item => item.id === card.dataset.id) || null; }
    catch { return null; }
  }

  function polishCards() {
    document.querySelectorAll('.place-card').forEach(card => {
      const item = findPlace(card);

      card.querySelectorAll('.actions a').forEach(link => {
        if (norm(link.textContent).includes('fonte')) link.remove();
      });

      const priceLine = [...card.querySelectorAll('.card-meta p')].find(line => line.textContent.trim().startsWith('💰'));
      if (priceLine) {
        if (item && isFree(item)) priceLine.textContent = '💰 grátis';
        else priceLine.remove();
      }

      card.querySelectorAll('.tag-chip').forEach(chip => {
        if (norm(chip.title) === 'melhor ir de carro') chip.remove();
      });
    });
  }

  function patchWhenReady(tries=0) {
    if (patchKnownPlaces()) {
      try {
        if (document.querySelector('.search-results-section:not([hidden])')) renderConhecer();
      } catch {}
      polishCards();
      return;
    }
    if (tries < 100) setTimeout(() => patchWhenReady(tries + 1),80);
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
    patchKnownPlaces();
    try { renderConhecer(); } catch {}
    polishCards();
  });

  document.addEventListener('DOMContentLoaded',() => {
    patchWhenReady();
    polishCards();
    observer.observe(document.body,{childList:true,subtree:true});
  });
})();
