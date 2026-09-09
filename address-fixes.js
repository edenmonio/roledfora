(() => {
  if (document.body.dataset.page !== 'lugares') return;

  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  // Endereços conferidos em fontes oficiais ou cadastros públicos de localização.
  // Quando não há endereço postal suficientemente preciso, o card fica sem a linha 🧭
  // e o botão do mapa continua pesquisando pelo nome + cidade.
  const ADDRESS_OVERRIDES = new Map([
    ['l-001-catedral-metropolitana-de-brasilia', 'esplanada dos ministérios, lote 12, brasília - df, 70050-000'],
    ['l-002-congresso-nacional', 'praça dos três poderes, zona cívico-administrativa, brasília - df, 70165-900'],
    ['l-010-biblioteca-nacional-de-brasilia', 'setor cultural sul, lote 2, edifício da biblioteca nacional, brasília - df, 70070-150'],
    ['l-019-ccbb-brasilia', 'sces trecho 2, lote 22, brasília - df, 70200-002'],
    ['l-034-birosca-do-conic', 'sds, bloco e, loja 3, conic, brasília - df, 70300-970'],
    ['l-037-campus-darcy-ribeiro-da-unb', 'campus universitário darcy ribeiro, asa norte, brasília - df, 70910-900'],
    ['l-042-cine-brasilia', 'entrequadra sul 106/107, asa sul, brasília - df, 70345-400'],
    ['l-052-espaco-lucio-costa', 'centro cultural três poderes, praça dos três poderes, brasília - df, 70297-400'],
    ['l-053-espaco-oscar-niemeyer', 'praça dos três poderes, eixo monumental, brasília - df, 70050-000'],
    ['l-054-casa-de-cha-da-praca-dos-tres-poderes', 'praça dos três poderes, brasília - df, 70100-000'],
    ['l-056-clube-do-choro', 'sdc, quadra 3, bloco g, eixo monumental, brasília - df, 70070-350'],
    ['l-059-cine-drive-in', 'srpn trecho 1, plano piloto, brasília - df, 70297-400'],
    ['l-062-caixa-cultural-brasilia', 'sbs quadra 4, bloco a, lotes 3/4, asa sul, brasília - df, 70092-900'],
    ['l-063-centro-cultural-tcu', 'sces trecho 3, lote 3, instituto serzedello corrêa, 1º subsolo, brasília - df, 70200-003'],
    ['l-098-anexo-bz', 'saa, quadra 2, saan, brasília - df, 70632-200'],
    ['l-103-casa-baco', 'casapark, sgcv sul, lote 22, loja 105, park sul, brasília - df, 71215-100'],
    ['l-115-baco-pizzaria', 'cls 408, bloco c, loja 35, asa sul, brasília - df, 70296-030'],
    ['l-121-bar-16-b-hotel', 'shn quadra 5, bloco j, lote l, asa norte, brasília - df, 70705-100'],
    ['l-133-adelia-padaria', 'shcgn 714/715, asa norte, brasília - df, 70761-650'],
    ['web-72-parque-ecologico-santa-maria', 'qc 3, bloco f, santa maria - df, 72537-560'],
    ['web-73-parque-ecologico-riacho-fundo', 'qs 8, conjunto 1c, riacho fundo i - df, 71820-821'],
    ['web-74-parque-pioneiros-candangolandia', 'qr 5, conjunto e, 42, candangolândia - df, 71725-500'],
    ['web-76-parque-ecologico-areal', 'qs 08, área especial, arniqueira - df, 72030-891'],
    ['web-77-parque-catetinho-park-way', 'lote 01 da pqs, setor habitacional catetinho, park way - df'],
    ['web-80-corrego-do-ouro-fercal', 'núcleo rural córrego do ouro, fercal - df, 73151-100'],
    ['web-82-parque-ecologico-paranoa', 'quadra 4, paranoá - df, 71573-214'],
    ['web-93-parque-lago-norte', 'shin ql 2, conjunto 1, portão 1, lago norte - df, 71510-015'],
    ['web-97-feira-riacho-fundo', 'área central 3, lotes 2 a 4, riacho fundo - df, 71805-406'],
    ['web-102-feira-santa-maria', 'qc 1, conjunto c, lote 44, santa maria - df'],
    ['web-104-rc-itapoa', 'quadra 61, área especial, entre os conjuntos d e e, condomínio dellago, itapoã - df'],
    ['web-105-rc-riacho-fundo-ii', 'qn 10, conjunto 1, lote 1, riacho fundo ii - df'],
    ['web-106-rc-recanto-emas', 'avenida recanto das emas, quadra 205, lote 1, recanto das emas - df'],
    ['web-107-rc-santa-maria', 'avenida alagados, área central, junto à administração regional, santa maria - df'],
    ['web-108-rc-sao-sebastiao', 'centro de múltiplas atividades, lote 2, são sebastião - df'],
    ['web-109-rc-sol-nascente-por-do-sol', 'quadra 105, conjunto o, área especial 1, trecho 2, sol nascente/pôr do sol - df'],
    ['web-110-rc-varjao', 'quadra 8, conjunto f, lote 1, varjão - df'],
    ['web-111-rc-estrutural', 'quadra 14, área especial, vila estrutural - df'],
    ['web-112-rc-sobradinho-ii', 'ar 13, área especial 8, quadra 3, sobradinho ii - df'],
    ['web-113-rc-paranoa', 'quadra 2, área especial, paranoá - df'],
    ['web-114-rc-arniqueira', 'qs 9, lote 3, areal, arniqueira - df']
  ]);

  const NON_POSTAL_BUT_PRECISE = new Map([
    ['web-78-parque-ponte-alta-gama', 'próximo à vila roriz, setor oeste, em frente à quadra 12, conjuntos a–d, setor sul, ponte alta - df'],
    ['web-87-parque-recanto-emas', 'chácara aldeia da paz, quadra 311, recanto das emas - df']
  ]);

  function looksGeneric(item) {
    const raw = (item?.endereco || '').toString().trim();
    if (!raw) return true;
    if (item?.enderecoTipo === 'referencia-de-busca') return true;

    const address = norm(raw);
    const city = norm(item?.cidade);
    const ra = norm(item?.ra);
    const trivial = new Set([
      city,
      `${city} df`, `${city} - df`, `${city} go`, `${city} - go`,
      ra,
      `${ra} df`, `${ra} - df`,
      'brasilia', 'brasilia df', 'brasilia - df',
      'distrito federal', 'df'
    ].filter(Boolean));
    if (trivial.has(address)) return true;

    const hasCep = /\b\d{5}-?\d{3}\b/.test(raw);
    const hasNumber = /\d/.test(raw);
    const hasAddressCue = /\b(quadra|qn|qs|qr|qc|qnm|qnn|qnp|qnl|qnr|qna|qnd|qne|qnf|qng|qnh|qni|qnj|qnk|qnl|qno|qnp|qnr|qns|qsa|qsb|qsc|qsd|qse|qsf|qsg|qsh|qsi|qsl|qsn|qso|qsp|qsr|qss|qst|qsu|qsv|qsw|sbs|sds|sces|shn|shin|shis|saa|saan|sgcv|sdc|setor|lote|conjunto|avenida|rua|rodovia|estrada|br-|df-|fazenda|núcleo rural|povoado|praça|eixo|esplanada|chácara|trevo|área especial|campus)\b/i.test(raw);
    return !hasCep && !hasNumber && !hasAddressCue;
  }

  function patchAddresses() {
    let places;
    try { places = state?.lugares; } catch { return false; }
    if (!Array.isArray(places) || !places.length) return false;

    // A antiga unidade foi recategorizada em 2025 como Estação Ecológica,
    // portanto não deve aparecer como parque recreativo no guia de lugares.
    state.lugares = places.filter(item => item.id !== 'web-96-corrego-onca-park-way');

    state.lugares.forEach(item => {
      const exact = ADDRESS_OVERRIDES.get(item.id);
      const precise = NON_POSTAL_BUT_PRECISE.get(item.id);
      if (exact) {
        item.endereco = exact;
        item.enderecoTipo = 'verificado';
        item.enderecoVerificadoEm = '2026-09-08';
        return;
      }
      if (precise) {
        item.endereco = precise;
        item.enderecoTipo = 'referencia-oficial';
        item.enderecoVerificadoEm = '2026-09-08';
        return;
      }
      if (looksGeneric(item)) {
        delete item.endereco;
        delete item.enderecoTipo;
      }
    });
    return true;
  }

  function refreshVisible() {
    try {
      if (document.querySelector('.search-results-section:not([hidden])') && typeof renderLugares === 'function') renderLugares();
    } catch {}
  }

  function patchWhenReady(tries=0) {
    if (patchAddresses()) {
      refreshVisible();
      return;
    }
    if (tries < 100) setTimeout(() => patchWhenReady(tries + 1), 80);
  }

  document.addEventListener('DOMContentLoaded', () => patchWhenReady());
  document.addEventListener('roledfora:data-updated', () => {
    patchAddresses();
    refreshVisible();
  });
})();
