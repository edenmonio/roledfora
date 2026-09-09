(() => {
  if (document.body.dataset.page !== 'novidades') return;

  const lower = value => (value ?? '').toString().toLocaleLowerCase('pt-BR');
  const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function locationLabel(item) {
    if (item.localizacaoLabel) return lower(item.localizacaoLabel);
    if (item.online) return 'atendimento online';
    const locations = [...(Array.isArray(item.cidades) ? item.cidades : []), item.cidade].filter(Boolean).map(lower);
    if (item.atendeDf) locations.unshift('df');
    return [...new Set(locations)].join(' e ');
  }

  function card(item) {
    const link = item.link || item.instagram || item.site;
    const handle = lower(item.instagramHandle || 'ver perfil / contato');
    const location = locationLabel(item);
    return `<article class="card professional-card">
      <span class="card-kind">${esc(lower(item.area || 'profissional'))}</span>
      <h3>${esc(lower(item.nome))}</h3>
      <div class="card-meta">
        ${item.especialidade ? `<p>${esc(item.especialidadeEmoji || '👤')} ${esc(lower(item.especialidade))}</p>` : ''}
        ${item.online ? '<p>💻 atendimento online</p>' : location ? `<p>📍 ${esc(location)}</p>` : ''}
        ${link ? `<p>📱 <a href="${esc(link)}" target="_blank" rel="noopener">${esc(handle)}</a></p>` : ''}
      </div>
      ${item.descricao ? `<p class="desc">${esc(lower(item.descricao))}</p>` : ''}
    </article>`;
  }

  async function load() {
    let items = [];
    try {
      const response = await fetch('./data/profissionais.json', { cache:'no-store' });
      items = response.ok ? await response.json() : [];
    } catch {}
    if (!Array.isArray(items)) items = [];
    items = items.filter(item => item.adicionadoEm).sort((a,b) => (b.adicionadoEm || '').localeCompare(a.adicionadoEm || '')).slice(0,12);
    if (!items.length) return;

    const section = document.createElement('section');
    section.className = 'fresh-block';
    section.innerHTML = `<div class="results-head"><h2 class="section-title">🧰 profissionais recém-adicionados</h2><span class="result-count">${items.length} ${items.length === 1 ? 'profissional' : 'profissionais'}</span></div><div class="cards-grid">${items.map(card).join('')}</div>`;
    document.querySelector('main.container')?.appendChild(section);
  }

  document.addEventListener('DOMContentLoaded', load);
})();