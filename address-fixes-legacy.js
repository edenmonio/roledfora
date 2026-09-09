(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const ADDRESSES = new Map([
    ['l-003-praca-dos-tres-poderes','praça dos três poderes, plano piloto, brasília - df, 70100-000'],
    ['l-005-supremo-tribunal-federal','praça dos três poderes, s/n, brasília - df, 70175-900'],
    ['l-006-memorial-jk','eixo monumental, lado oeste, praça do cruzeiro, brasília - df, 70070-300'],
    ['l-009-museu-nacional-da-republica','setor cultural sul, lote 2, brasília - df, 70070-150'],
    ['l-011-igrejinha-nossa-senhora-de-fatima','eqs 307/308, asa sul, brasília - df, 70390-100'],
    ['l-017-zoologico-de-brasilia','avenida das nações, via l4 sul, s/n, asa sul, brasília - df, 70610-100'],
    ['l-033-mangai-brasilia','sces, lote 2, asa sul, brasília - df, 70200-002'],
    ['l-038-infinu','crs 506, bloco a, loja 67, asa sul, brasília - df, 70350-515'],
    ['l-039-santuario-dom-bosco','seps 702, bloco b, asa sul, brasília - df, 70330-720'],
    ['l-048-museu-vivo-da-memoria-candanga','setor jk, lote d, núcleo bandeirante - df, 71739-020'],
    ['l-057-funarte-eixo-cultural-ibero-americano','eixo monumental, setor de divulgação cultural, lote 2, brasília - df, 70070-350'],
    ['l-058-teatro-nacional-claudio-santoro','setor cultural norte, scts, brasília - df, 70297-400'],
    ['l-060-museu-de-arte-de-brasilia-mab','shtn trecho 1, projeto orla polo 3, lote 5, brasília - df, 70800-200'],
    ['l-064-casa-do-cantador','setor n, quadra 32, área especial g, ceilândia - df, 72220-327'],
    ['l-067-parque-ecologico-de-aguas-claras','avenida parque águas claras, águas claras - df, 71906-500'],
    ['l-068-taguaparque','df-001, pistão norte, taguaparque, taguatinga - df, 72121-000'],
    ['l-070-parque-tres-meninas','qr 611, samambaia norte, samambaia - df'],
    ['l-073-praca-dos-orixas','sces trecho 2, acesso à l4 sul, asa sul, brasília - df, 70297-400'],
    ['l-075-feira-do-guara','qe 23, área especial, guará ii - df, 71015-000'],
    ['l-076-feira-central-de-ceilandia','cnm 2, ceilândia centro, ceilândia - df, 72210-500'],
    ['l-077-feira-permanente-de-taguatinga','qnm 38, área especial 1, taguatinga - df, 72145-800'],
    ['l-078-mercado-do-produtor-de-vicente-pires','rua 4a, área especial 5, feira do produtor, vicente pires - df, 72006-253'],
    ['l-095-lah-no-bar','cls 413, bloco a, asa sul, brasília - df, 70296-510'],
    ['l-109-trattoria-da-rosario','shis qi 17, loja 215, lago sul, brasília - df, 71645-000'],

    ['web-01-usina-parque-bandeirinha','go-430, km 6, zona rural, formosa - go'],
    ['web-03-parque-ecobocaina','br-010, km 25, entrada da rampa de voo livre, formosa - go, 72800-000'],
    ['web-04-cachoeira-do-jk-ecoturismo','br-020, zona rural, formosa - go'],
    ['web-05-adventure-eco-park','avenida circular, chácara 03, parque laguna, formosa - go, 73814-001'],
    ['web-14-complexo-cultural-de-samambaia','quadra 301, conjunto 5, lote 1, samambaia sul - df, 72305-970'],
    ['web-15-parque-ecologico-ezechias-heringer','gleba 1, guará ii - df, 71025-020'],
    ['web-20-cineflix-shopping-sul','br-040, km 12, shopping sul, parque esplanada iii, valparaíso de goiás - go, 72876-902'],
    ['web-21-multicine-aguas-lindas','alameda santa luzia, mansões centro-oeste, águas lindas de goiás - go, 72915-705'],
    ['web-22-teatro-dos-bancarios','eqs 314/315, asa sul, brasília - df, 70383-400'],
    ['web-25-teatro-nacional-martins-pena','setor cultural norte, teatro nacional cláudio santoro, brasília - df, 70297-400'],
    ['web-26-bali-park','avenida principal, loteamento fechado bali marina, luziânia - go, 72859-899'],
    ['web-28-cachoeira-jk','br-020, zona rural, formosa - go'],
    ['web-29-chapada-indaia-ecoparque','área rural, planaltina de goiás - go, 73801-220'],
    ['web-30-ecobocaina','br-010, km 25, entrada da rampa de voo livre, formosa - go, 72800-000'],

    ['l-092-dom-marv','quadra 12, nº 28, lojas 1a/1b/3a/3b/5a/5b, parque esplanada iii, valparaíso de goiás - go, 72876-312'],
    ['l-031-figueiredo-cozinha-e-bar','etapa a, quadra 7, nº 10, valparaíso de goiás - go, 72876-021'],
    ['l-029-panificadora-padre-cicero','rua e, 1c, parque rio branco, valparaíso de goiás - go, 72870-019'],
    ['l-090-praianos-restaurante','rua vinte e nove, nº 54, parque esplanada iii, valparaíso de goiás - go, 72876-354'],
    ['l-091-sertao-mar','rua 113, jardim céu azul, valparaíso de goiás - go, 72871-113'],
    ['l-093-recanto-colonial','chácara 14, setor de chácaras, mansões santa maria, valparaíso de goiás - go, 72870-000']
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
