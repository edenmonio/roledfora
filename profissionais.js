(() => {
  const norm = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const lower = value => (value ?? '').toString().toLocaleLowerCase('pt-BR');
  const esc = value => (value ?? '').toString().replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const AREAS = [
    ['arte-ilustracao','arte & ilustração'],['artesanato','artesanato'],['audiovisual','audiovisual'],['cabelo-barbearia','cabelo & barbearia'],['confeitaria-doces','confeitaria & doces'],['danca-coreografia','dança & coreografia'],['decoracao','decoração'],['design','design'],['dj','djs'],['drag-performance','drag & performance'],['estetica-beleza','estética & beleza'],['fotografia','fotografia'],['maquiagem','maquiagem'],['moda-customizacao','moda & customização'],['musica','música'],['nail-design','nail design'],['producao-eventos','produção de eventos'],['saude','saúde'],['social-media-conteudo','social media & conteúdo'],['som-iluminacao','som & iluminação'],['tatuagem-piercing','tatuagem & piercing'],['teatro-performance','teatro & performance'],['turismo-local','turismo local']
  ];

  const SERVICES = {
    'arte-ilustracao': [['ilustracao','ilustração'],['desenho','desenho'],['pintura','pintura'],['retrato','retrato'],['caricatura','caricatura'],['arte-digital','arte digital'],['mural-grafite','mural / grafite'],['encomendas','encomendas']],
    'artesanato': [['croche','crochê'],['trico','tricô'],['bordado','bordado'],['costura-criativa','costura criativa'],['ceramica','cerâmica'],['papelaria-artesanal','papelaria artesanal'],['bijuterias-acessorios','bijuterias & acessórios'],['personalizados','personalizados']],
    'audiovisual': [['filmagem','filmagem'],['videomaker','videomaker'],['edicao-video','edição de vídeo'],['motion-design','motion design'],['direcao','direção'],['roteiro','roteiro'],['captacao','captação'],['transmissao-ao-vivo','transmissão ao vivo']],
    'cabelo-barbearia': [['corte','corte'],['barbearia','barbearia'],['coloracao','coloração'],['trancas','tranças'],['penteado','penteado'],['cachos','cachos'],['alisamento','alisamento'],['tratamento-capilar','tratamento capilar']],
    'confeitaria-doces': [['bolos','bolos'],['doces','doces'],['brigadeiros','brigadeiros'],['sobremesas','sobremesas'],['kit-festa','kit festa'],['personalizados','personalizados'],['doces-veganos','doces veganos']],
    'danca-coreografia': [['aula-danca','aula de dança'],['coreografia','coreografia'],['performance','performance'],['danca-eventos','dança para eventos'],['preparacao-artistica','preparação artística']],
    'decoracao': [['decoracao-festas','decoração de festas'],['cenografia','cenografia'],['baloes','balões'],['flores','flores'],['montagem','montagem'],['decoracao-tematica','decoração temática']],
    'design': [['identidade-visual','identidade visual'],['logotipo','logotipo'],['design-grafico','design gráfico'],['editorial','editorial'],['social-media','social media'],['embalagem','embalagem'],['diagramacao','diagramação']],
    'dj': [['festa','festa'],['casamento','casamento'],['aniversario','aniversário'],['bar-balada','bar / balada'],['evento-corporativo','evento corporativo'],['set-tematico','set temático']],
    'drag-performance': [['show-drag','show drag'],['apresentacao','apresentação'],['performance','performance'],['mestre-cerimonias','mestre de cerimônias'],['presenca-evento','presença em evento']],
    'estetica-beleza': [['limpeza-pele','limpeza de pele'],['depilacao','depilação'],['sobrancelha','sobrancelha'],['cilios','cílios'],['massagem-estetica','massagem estética'],['procedimentos-faciais','procedimentos faciais']],
    'fotografia': [['ensaio-individual','ensaio individual'],['casal','casal'],['familia','família'],['eventos','eventos'],['shows','shows'],['produtos','produtos'],['gastronomia','gastronomia'],['retrato-profissional','retrato profissional']],
    'maquiagem': [['social','social'],['festa','festa'],['casamento','casamento'],['artistica','artística'],['drag','drag'],['audiovisual','audiovisual'],['caracterizacao','caracterização']],
    'moda-customizacao': [['costura','costura'],['ajustes','ajustes'],['figurino','figurino'],['customizacao','customização'],['styling','styling'],['criacao-pecas','criação de peças']],
    'musica': [['cantor','cantor(a)'],['banda','banda'],['instrumentista','instrumentista'],['voz-violao','voz e violão'],['musica-eventos','música para eventos'],['composicao','composição'],['producao-musical','produção musical']],
    'nail-design': [['manicure','manicure'],['pedicure','pedicure'],['alongamento','alongamento'],['nail-art','nail art'],['esmaltacao-gel','esmaltação em gel']],
    'producao-eventos': [['producao-geral','produção geral'],['cerimonial','cerimonial'],['planejamento','planejamento'],['recepcao','recepção'],['credenciamento','credenciamento'],['producao-cultural','produção cultural'],['producao-tecnica','produção técnica']],
    'saude': [['medicina','medicina'],['psicologia','psicologia'],['psiquiatria','psiquiatria'],['nutricao','nutrição'],['fisioterapia','fisioterapia'],['odontologia','odontologia'],['fonoaudiologia','fonoaudiologia'],['terapia-ocupacional','terapia ocupacional'],['enfermagem','enfermagem']],
    'social-media-conteudo': [['gestao-redes','gestão de redes'],['criacao-conteudo','criação de conteúdo'],['copywriting','copywriting'],['planejamento','planejamento'],['reels-video-curto','reels / vídeo curto'],['community-manager','community manager']],
    'som-iluminacao': [['sonorizacao','sonorização'],['iluminacao','iluminação'],['operacao-audio','operação de áudio'],['operacao-luz','operação de luz'],['aluguel-equipamento','aluguel de equipamento'],['montagem-tecnica','montagem técnica']],
    'tatuagem-piercing': [['tatuagem-autoral','tatuagem autoral'],['flash-tattoo','flash tattoo'],['cobertura','cobertura'],['fine-line','fine line'],['blackwork','blackwork'],['colorida','colorida'],['piercing','piercing']],
    'teatro-performance': [['atuacao','atuação'],['performance','performance'],['intervencao-artistica','intervenção artística'],['oficina','oficina'],['preparacao-elenco','preparação de elenco']],
    'turismo-local': [['guia','guia'],['passeio-guiado','passeio guiado'],['roteiro-cultural','roteiro cultural'],['roteiro-historico','roteiro histórico'],['ecoturismo','ecoturismo'],['trilha','trilha']]
  };

  const SPECIALTY_FALLBACK = {
    psicologia:['🧠','psicóloga'], medicina:['🩺','médico(a)'], psiquiatria:['🧩','psiquiatra'], nutricao:['🥗','nutricionista'], fisioterapia:['🦴','fisioterapeuta'], odontologia:['🦷','dentista'], fonoaudiologia:['🗣️','fonoaudiólogo(a)'], 'terapia-ocupacional':['🤲','terapeuta ocupacional'], enfermagem:['💉','enfermeiro(a)'],
    fotografia:['📷','fotógrafo(a)'], maquiagem:['💄','maquiador(a)'], musica:['🎵','músico(a)'], design:['🎨','designer'], dj:['🎧','dj'], tatuagem:['🖋️','tatuador(a)'], piercing:['💎','piercer']
  };

  let profissionais = [];

  function fillAreas() {
    const select = document.querySelector('#prof-tipo'); if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="qualquer">qualquer área</option>' + AREAS.map(([value,label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('');
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }

  function fillServices(area) {
    const select = document.querySelector('#prof-servico'); if (!select) return;
    if (!area || area === 'qualquer' || !SERVICES[area]) { select.disabled = true; select.innerHTML = '<option value="qualquer">escolha uma área primeiro</option>'; return; }
    const current = select.value; select.disabled = false;
    select.innerHTML = '<option value="qualquer">qualquer serviço</option>' + SERVICES[area].map(([value,label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('');
    if ([...select.options].some(option => option.value === current)) select.value = current; else select.value = 'qualquer';
  }

  function areaMatches(item,value) {
    if (!value || value === 'qualquer') return true;
    const itemType = norm(item.area || item.tipo || item.categoria); const selected = AREAS.find(([id]) => id === value);
    if (!selected) return itemType === norm(value); return itemType === norm(selected[0]) || itemType === norm(selected[1]);
  }

  function serviceMatches(item,value) {
    if (!value || value === 'qualquer') return true;
    const values = [...(Array.isArray(item.servicos) ? item.servicos : []),...(Array.isArray(item.services) ? item.services : []),item.servico,item.service].filter(Boolean).map(norm);
    const area = document.querySelector('#prof-tipo')?.value; const selected = SERVICES[area]?.find(([id]) => id === value);
    if (!selected) return values.includes(norm(value)); return values.includes(norm(selected[0])) || values.includes(norm(selected[1]));
  }

  function locationMatches(item,value) {
    if (!value || value === 'qualquer') return true; if (item.online) return true;
    if (window.ROLED_LOCATIONS?.locationMatches) return window.ROLED_LOCATIONS.locationMatches(item.cidade,value);
    return norm(item.cidade) === norm(value);
  }

  function areaLabel(item) {
    const raw = item.area || item.tipo || item.categoria; const area = AREAS.find(([id,label]) => norm(raw) === norm(id) || norm(raw) === norm(label));
    return lower(area?.[1] || raw || 'profissional');
  }

  function specialtyInfo(item) {
    if (item.especialidade) return [item.especialidadeEmoji || '👤', lower(item.especialidade)];
    const first = [...(Array.isArray(item.servicos) ? item.servicos : []), item.servico].filter(Boolean)[0];
    return SPECIALTY_FALLBACK[norm(first)] || ['👤','profissional'];
  }

  function card(item) {
    const [specialtyEmoji,specialty] = specialtyInfo(item);
    const physicalLocation = !item.online && item.cidade ? `${lower(item.cidade)}${item.uf ? ` · ${lower(item.uf)}` : ''}` : '';
    const link = item.link || item.instagram || item.site; const handle = lower(item.instagramHandle || ''); const contactLabel = handle || 'ver perfil / contato';
    return `<article class="card professional-card">
      <span class="card-kind">${esc(areaLabel(item))}</span>
      <h3>${esc(lower(item.nome))}</h3>
      <div class="card-meta">
        <p>${esc(specialtyEmoji)} ${esc(specialty)}</p>
        ${item.online ? '<p>💻 atendimento online</p>' : physicalLocation ? `<p>📍 ${esc(physicalLocation)}</p>` : ''}
        ${link ? `<p>📱 <a href="${esc(link)}" target="_blank" rel="noopener">${esc(contactLabel)}</a></p>` : ''}
      </div>
    </article>`;
  }

  function render() {
    const local = document.querySelector('#prof-local')?.value || 'qualquer', area = document.querySelector('#prof-tipo')?.value || 'qualquer', servico = document.querySelector('#prof-servico')?.value || 'qualquer';
    const section = document.querySelector('.search-results-section'), target = document.querySelector('#results'), count = document.querySelector('#result-count'); if (!section || !target || !count) return;
    const hasSelection = local !== 'qualquer' || area !== 'qualquer' || servico !== 'qualquer'; section.hidden = !hasSelection; if (!hasSelection) return;
    const items = profissionais.filter(item => locationMatches(item,local) && areaMatches(item,area) && serviceMatches(item,servico));
    count.textContent = `${items.length} ${items.length === 1 ? 'resultado' : 'resultados'}`;
    target.innerHTML = items.length ? items.map(card).join('') : '<div class="empty-state">ainda não tenho profissionais cadastrados com esses filtros. a base está sendo montada.</div>';
  }

  async function load() { try { const response = await fetch('./data/profissionais.json',{cache:'no-store'}); profissionais = response.ok ? await response.json() : []; if (!Array.isArray(profissionais)) profissionais = []; } catch { profissionais = []; } render(); }

  document.addEventListener('change',event => { const select = event.target.closest('.search-panel select'); if (!select) return; if (select.id === 'prof-tipo') fillServices(select.value); render(); });
  document.addEventListener('DOMContentLoaded',() => { fillAreas(); fillServices('qualquer'); window.ROLED_LOCATIONS?.fillLocationSelect(document.querySelector('#prof-local')); load(); });
})();