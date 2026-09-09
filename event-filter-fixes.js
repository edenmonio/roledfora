(() => {
  const n = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const tags = item => new Set((item?.tags || []).map(n));
  const has = (set, values) => values.some(value => set.has(n(value)));

  function eventTypeMatches(item, value) {
    if (!value || value === 'qualquer') return true;
    const t = tags(item);
    const c = n(item.categoria);
    const text = n(`${item.nome || ''} ${item.descricao || ''} ${(item.tags || []).join(' ')}`);

    if (value === 'festival') return has(t,['festival','mostra']) || /festival|mostra/.test(text);
    if (value === 'show') return c === 'show' || has(t,['show','musica ao vivo','musica','mpb','rock','forro','samba','choro','rap','hip-hop','sertanejo']);
    if (value === 'festa') return c === 'festa' || has(t,['festa','balada','dj','djs','madrugada']) || /festa|balada/.test(text);
    if (value === 'cinema') return c === 'cinema' || has(t,['cinema','audiovisual','filme','curta','curtas']) || /cinema|audiovisual|sessao de filme|mostra de curtas/.test(text);
    if (value === 'teatro-circo') return c === 'teatro' || has(t,['teatro','circo','palhacaria','musical','danca','drag','performance']);
    if (value === 'exposicao') return c === 'exposicao' || has(t,['exposicao','museu','artes visuais']) || /exposicao|mostra de arte/.test(text);
    if (value === 'feira') return ['feira','brecho'].includes(c) || has(t,['feira','brecho','economia criativa','artesanato','bazares']);
    if (value === 'formacao') return ['workshop/curso','universitario'].includes(c) || has(t,['oficina','oficinas','workshop','curso','palestra','palestras','seminario','formacao']);
    if (value === 'gastronomia') return c === 'gastronomia' || has(t,['gastronomia','comida','cafe','degustacao','food trucks']);
    if (value === 'geek') return c === 'nerd/geek' || has(t,['nerd/geek','geek','games','rpg','quadrinhos','manga','cosplay','k-pop','tcg']);
    if (value === 'ao-ar-livre') return c === 'ao ar livre' || has(t,['ao ar livre','corrida','caminhada','trilha','ciclismo','natureza','esporte','skate','agua']);
    return true;
  }

  function eventVibeMatches(item, value) {
    if (!value || value === 'qualquer') return true;
    const t = tags(item);
    const text = n(`${item.nome || ''} ${item.descricao || ''} ${(item.tags || []).join(' ')}`);

    if (value === 'alternativo') return has(t,['alternativo','independente','underground','cultura independente','autoral']);
    if (value === 'lgbtqia') return has(t,['lgbtqia+','lgbtqiapn+','lgbt','drag','drag queen','drag king']);
    if (value === 'dancante') return has(t,['dancante','festa','balada','forro','samba','dj','djs']) || /pra dancar|para dancar/.test(text);
    if (value === 'cultura-popular') return has(t,['cultura popular','repente','cordel','forro','samba','mamulengo','capoeira','cultura nordestina']) || /cultura popular/.test(text);
    if (value === 'arte-cultura') return has(t,['arte','cultura','teatro','cinema','exposicao','danca','literatura','poesia','quadrinhos']);
    if (value === 'date') return has(t,['date','date diferente','bom para date']);
    if (value === 'sozinho') return has(t,['sozinho','solo','bom pra ir sozinho','bom para ir sozinho']) || ['cinema','exposicao'].includes(canonicalSafe(item));
    if (value === 'familias') return has(t,['para familias','familia','familiar','bom para criancas','infantil']);
    if (value === 'acessivel') return has(t,['acessivel','libras','audiodescricao','legendas descritivas']);
    if (value === 'musica-vivo') return has(t,['musica ao vivo','show','choro','samba','forro','mpb','rock']) || cIsShow(item);
    return true;
  }

  function canonicalSafe(item) {
    const c = n(item.categoria);
    if (c === 'cinema') return 'cinema';
    if (c === 'exposicao') return 'exposicao';
    return c;
  }

  function cIsShow(item) {
    return n(item.categoria) === 'show';
  }

  try {
    renderEventos = function() {
      const local = document.querySelector('#local')?.value || 'qualquer';
      const data = document.querySelector('#data')?.value || 'qualquer';
      const valor = document.querySelector('#valor')?.value || 'qualquer';
      const horario = document.querySelector('#horario')?.value || 'qualquer';
      const tipo = document.querySelector('#tipo')?.value || 'qualquer';
      const vibe = document.querySelector('#caracteristica')?.value || 'qualquer';
      const detail = new URLSearchParams(location.search).get('detalhe');
      const items = sortEvents(state.eventos.filter(event =>
        cityMatches(event.cidade, local) &&
        eventDateMatches(event, data) &&
        priceMatches(event, valor) &&
        timeMatches(event, horario) &&
        eventTypeMatches(event, tipo) &&
        eventVibeMatches(event, vibe) &&
        detailMatches(event, detail)
      ));
      renderList(items, 'event');
    };
  } catch {}

  document.addEventListener('DOMContentLoaded', () => {
    const vibe = new URLSearchParams(location.search).get('vibe');
    const select = document.querySelector('#caracteristica');
    if (vibe && select) {
      const match = [...select.options].find(option => n(option.value) === n(vibe));
      if (match) select.value = match.value;
    }
  });
})();
