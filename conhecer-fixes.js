(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const ENTORNO = new Set([
    'aguas lindas de goias','cidade ocidental','cocalzinho de goias','cristalina','formosa','luziania',
    'novo gama','padre bernardo','planaltina de goias','santo antonio do descoberto','valparaiso de goias'
  ]);
  const SAFE_WOMEN = new Set(['seguro para mulheres','ambiente seguro para mulheres','espaco seguro para mulheres','safe space mulheres','safe space para mulheres']);
  const SAFE_LGBT = new Set(['seguro para lgbt','seguro para lgbtqia+','ambiente seguro lgbt','ambiente seguro para lgbtqia+','espaco seguro lgbt','espaco seguro para lgbtqia+','safe space lgbt','safe space lgbtqia+']);
  const STRONG_CAR_ACCESS = /carro facilita|carro recomendado|acesso de carro|acesso somente (?:por|de) carro|somente de carro|dificil acesso (?:por|de) transporte publico|sem transporte publico|nao ha transporte publico|transporte publico limitado|ultimo trecho sem onibus|trecho final sem transporte publico|acesso somente por estrada/;

  const tagSet = item => new Set((item?.tags || []).map(norm));
  const hasExplicit = (tags,set) => [...tags].some(tag => set.has(tag));

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

  function characteristicMatch(item,value) {
    if (!value || value === 'qualquer') return true;
    const tags = tagSet(item), access = norm(item.acesso);

    if (value === 'acessivel') return tags.has('acessivel');
    if (value === 'aceita-pets') return tags.has('pet friendly') || tags.has('aceita pets');
    if (value === 'alternativo') return tags.has('alternativo');
    if (value === 'ao-ar-livre') return tags.has('ao ar livre');
    if (value === 'aventura') return ['aventura','trilha','trilhas','arvorismo','escalada','tirolesa'].some(tag => tags.has(tag));
    if (value === 'bicicleta') return /bicicletario|ciclovia/.test(access);
    if (value === 'bom-criancas') return tags.has('bom para criancas') || tags.has('kid friendly') || tags.has('infantil');
    if (value === 'date') return tags.has('date') || tags.has('date diferente');
    if (value === 'sozinho') return tags.has('sozinho') || tags.has('solo') || tags.has('bom pra ir sozinho');
    if (value === 'dancante') return tags.has('dancante') || tags.has('balada');
    if (value === 'estacionamento') return tags.has('estacionamento') || access.includes('estacionamento');
    if (value === 'lgbtqia') return tags.has('lgbtqia+') || tags.has('lgbtqiapn+') || tags.has('lgbt');
    if (value === 'carro-recomendado') return STRONG_CAR_ACCESS.test(access);
    if (value === 'metro-perto') return /metro proximo|perto do metro|proximo a(?:o)? metro/.test(access);
    if (value === 'musica-vivo') return tags.has('musica ao vivo');
    if (value === 'onibus-perto') return /onibus perto|ponto de onibus|parada de onibus|proximo a(?:o)? ponto de onibus/.test(access);
    if (value === 'opcao-vegana') return tags.has('opcao vegana') || tags.has('vegano') || tags.has('vegana');
    if (value === 'opcao-vegetariana') return tags.has('opcao vegetariana') || tags.has('vegetariano') || tags.has('vegetariana');
    if (value === 'familias') return tags.has('familia') || tags.has('familiar') || tags.has('para familias');
    if (value === 'seguro-lgbt') return hasExplicit(tags,SAFE_LGBT);
    if (value === 'seguro-mulheres') return hasExplicit(tags,SAFE_WOMEN);
    if (value === 'tranquilo') return tags.has('tranquilo') || tags.has('calmo') || tags.has('relax');
    if (value === '18mais') return tags.has('18+') || tags.has('maiores de 18') || tags.has('adulto');
    return true;
  }

  function detailMatch(item,detail) {
    if (!detail) return true;
    try { return typeof detailMatches === 'function' ? detailMatches(item,detail) : true; }
    catch { return true; }
  }

  function renderConhecer() {
    try {
      const local = document.querySelector('#onde')?.value || 'qualquer';
      const cat = document.querySelector('#categoria')?.value || 'qualquer';
      const vibe = document.querySelector('#vibe')?.value || 'qualquer';
      const estrutura = document.querySelector('#estrutura')?.value || 'qualquer';
      const valor = document.querySelector('#preco')?.value || 'qualquer';
      const detail = new URLSearchParams(location.search).get('detalhe');

      const items = (state.lugares || []).filter(item =>
        inScope(item) &&
        cityMatch(item.cidade,local) &&
        (cat === 'qualquer' || (typeof canonicalPlaceCategory === 'function' && canonicalPlaceCategory(item) === cat)) &&
        characteristicMatch(item,vibe) &&
        characteristicMatch(item,estrutura) &&
        (typeof priceMatches !== 'function' || priceMatches(item,valor)) &&
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
    if (zoom) {
      zoom.tags = [...new Set([...(zoom.tags || []),'18+'])];
    }
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
