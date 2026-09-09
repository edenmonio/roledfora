(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const ADDRESSES = new Map([
    ['l-003-praca-dos-tres-poderes','praça dos três poderes, plano piloto, brasília - df, 70100-000'],
    ['l-005-supremo-tribunal-federal','praça dos três poderes, s/n, brasília - df, 70175-900'],
    ['l-006-memorial-jk','eixo monumental, lado oeste, praça do cruzeiro, brasília - df, 70070-300'],
    ['l-009-museu-nacional-da-republica','setor cultural sul, lote 2, brasília - df, 70070-150'],
    ['l-011-igrejinha-nossa-senhora-de-fatima','eqs 307/308, asa sul, brasília - df, 70390-100'],
    ['l-017-zoologico-de-brasilia','avenida das nações, via l4 sul, s/n, asa sul, brasília - df, 70610-100'],
    ['l-038-infinu','crs 506, bloco a, loja 67, asa sul, brasília - df, 70350-515'],
    ['l-039-santuario-dom-bosco','seps 702, bloco b, asa sul, brasília - df, 70330-720'],
    ['l-048-museu-vivo-da-memoria-candanga','setor jk, lote d, núcleo bandeirante - df, 71739-020'],
    ['l-057-funarte-eixo-cultural-ibero-americano','eixo monumental, setor de divulgação cultural, lote 2, brasília - df, 70070-350'],
    ['l-058-teatro-nacional-claudio-santoro','setor cultural norte, scts, brasília - df, 70297-400'],
    ['l-060-museu-de-arte-de-brasilia-mab','shtn trecho 1, projeto orla polo 3, lote 5, brasília - df, 70800-200'],
    ['l-064-casa-do-cantador','setor n, quadra 32, área especial g, ceilândia - df, 72220-327'],
    ['l-073-praca-dos-orixas','sces trecho 2, acesso à l4 sul, asa sul, brasília - df, 70297-400'],
    ['l-076-feira-central-de-ceilandia','cnm 2, ceilândia centro, ceilândia - df, 72210-500'],
    ['l-095-lah-no-bar','cls 413, bloco a, asa sul, brasília - df, 70296-510'],
    ['l-109-trattoria-da-rosario','shis qi 17, loja 215, lago sul, brasília - df, 71645-000'],
    ['l-033-mangai-brasilia','sces, lote 2, asa sul, brasília - df, 70200-002']
  ]);

  function patch() {
    let places;
    try { places = state?.lugares; } catch { return false; }
    if (!Array.isArray(places) || !places.length) return false;
    places.forEach(item => {
      const address = ADDRESSES.get(item.id);
      if (!address) return;
      item.endereco = address;
      item.enderecoTipo = 'verificado';
      item.enderecoVerificadoEm = '2026-09-08';
    });
    return true;
  }

  function refresh() {
    try {
      if (document.querySelector('.search-results-section:not([hidden])') && typeof renderLugares === 'function') renderLugares();
    } catch {}
  }

  function start(tries=0) {
    if (patch()) { refresh(); return; }
    if (tries < 100) setTimeout(() => start(tries + 1), 80);
  }

  document.addEventListener('DOMContentLoaded', () => start());
  document.addEventListener('roledfora:data-updated', () => { patch(); refresh(); });
})();
