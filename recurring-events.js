(() => {
  const WEEKDAYS = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const DAY_MS = 86400000;
  const n = value => (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const isRecurring = item => item && (item.tipoRegistro === 'atividade-recorrente' || !!item.recorrencia);
  const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isoDay = iso => {
    if (!iso) return null;
    const [y,m,d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y,m-1,d);
  };

  function recurrenceStart(item) {
    return isoDay(item.recorrenciaInicio || item.dataInicio);
  }

  function recurrenceEnd(item) {
    return isoDay(item.recorrenciaFim);
  }

  function recurringOnDate(item, date) {
    if (!isRecurring(item)) return false;
    const day = startOfDay(date);
    const start = recurrenceStart(item);
    const end = recurrenceEnd(item);
    if (start && day < start) return false;
    if (end && day > end) return false;

    const mode = n(item.recorrencia || 'semanal');
    const days = Array.isArray(item.diasSemana) ? item.diasSemana.map(Number) : [];

    if (mode === 'semanal') {
      return !days.length || days.includes(day.getDay());
    }

    if (mode === 'quinzenal') {
      if (days.length && !days.includes(day.getDay())) return false;
      if (!start) return false;
      const weeks = Math.floor((startOfDay(day) - startOfDay(start)) / (7 * DAY_MS));
      return weeks >= 0 && weeks % 2 === 0;
    }

    if (mode === 'mensal') {
      const monthDays = Array.isArray(item.diasDoMes) ? item.diasDoMes.map(Number) : [];
      if (monthDays.length) return monthDays.includes(day.getDate());
      if (item.diaDoMes) return Number(item.diaDoMes) === day.getDate();
      return false;
    }

    return false;
  }

  function rangeHasOccurrence(item, from, to) {
    const start = startOfDay(from), end = startOfDay(to);
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate()+1)) {
      if (recurringOnDate(item, cursor)) return true;
    }
    return false;
  }

  function nextOccurrence(item, from = new Date(), horizonDays = 370) {
    if (!isRecurring(item)) return isoDay(item.dataInicio);
    const start = startOfDay(from);
    const hardEnd = recurrenceEnd(item);
    for (let i=0; i<=horizonDays; i++) {
      const day = new Date(start);
      day.setDate(start.getDate()+i);
      if (hardEnd && day > hardEnd) return null;
      if (recurringOnDate(item, day)) return day;
    }
    return null;
  }

  function recurrenceText(item) {
    if (item.recorrenciaTexto) return item.recorrenciaTexto;
    const mode = n(item.recorrencia);
    const days = Array.isArray(item.diasSemana) ? item.diasSemana.map(Number) : [];
    if (mode === 'semanal' && days.length === 1) return `toda ${WEEKDAYS[days[0]]}`;
    if (mode === 'semanal' && days.length > 1) return `toda semana · ${days.map(day => WEEKDAYS[day]).join(', ')}`;
    if (mode === 'quinzenal') return 'a cada duas semanas';
    if (mode === 'mensal') return 'todo mês';
    return 'atividade recorrente';
  }

  function recurrenceKind(item) {
    const mode = n(item.recorrencia);
    if (mode === 'semanal') return 'atividade semanal';
    if (mode === 'quinzenal') return 'atividade quinzenal';
    if (mode === 'mensal') return 'atividade mensal';
    return 'atividade recorrente';
  }

  function shortDate(date) {
    if (!date) return '';
    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const diff = Math.round((target - today) / DAY_MS);
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'amanhã';
    return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(target).replace('.','');
  }

  try {
    const baseDateMatches = eventDateMatches;
    eventDateMatches = function(item, value) {
      if (!isRecurring(item)) return baseDateMatches(item, value);
      const today = startOfDay(new Date());
      if (!value || value === 'qualquer') return !!nextOccurrence(item, today);
      if (value === 'hoje') return recurringOnDate(item, today);
      if (value === 'amanha') {
        const d = new Date(today); d.setDate(d.getDate()+1);
        return recurringOnDate(item, d);
      }
      if (value === '7dias') {
        const d = new Date(today); d.setDate(d.getDate()+7);
        return rangeHasOccurrence(item, today, d);
      }
      if (value === 'mes') {
        const a = new Date(today.getFullYear(),today.getMonth(),1);
        const b = new Date(today.getFullYear(),today.getMonth()+1,0);
        return rangeHasOccurrence(item, a, b);
      }
      if (value === 'fim-semana') {
        const a = new Date(today);
        a.setDate(a.getDate() + (6-a.getDay()+7)%7);
        const b = new Date(a); b.setDate(b.getDate()+1);
        return rangeHasOccurrence(item, a, b);
      }
      return true;
    };
  } catch {}

  try {
    sortEvents = function(items) {
      const today = startOfDay(new Date());
      const key = item => {
        if (isRecurring(item)) {
          const next = nextOccurrence(item, today);
          return next ? next.getTime() : Number.MAX_SAFE_INTEGER;
        }
        const date = isoDay(item.dataInicio);
        return date ? date.getTime() : Number.MAX_SAFE_INTEGER;
      };
      return [...items].sort((a,b) => key(a)-key(b) || (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    };
  } catch {}

  try {
    const baseEventCard = eventCard;
    eventCard = function(item) {
      if (!isRecurring(item)) return baseEventCard(item);
      const cat = categoryInfo('event',item);
      const ticket = n(item.ingresso);
      const source = item.link ? `<a class="primary-link" href="${esc(item.link)}" target="_blank" rel="noopener">${ticket.includes('compra')||ticket.includes('inscri')?'🎟️ ingresso / inscrição':'↗ fonte / detalhes'}</a>` : '';
      const next = nextOccurrence(item, new Date());
      const nextText = next ? ` · próxima: ${shortDate(next)}` : '';
      return `<article class="card event-card recurring" data-id="${esc(item.id)}">
        <span class="card-kind">${esc(cat.label)}</span><span class="recurrence-badge">↻ recorrente</span>
        <h3>${esc(item.nome)}</h3>
        <div class="card-meta">
          <p class="legacy-date" aria-hidden="true"></p>
          <div class="recurrence-date">📅 ${esc(recurrenceText(item))}${item.horario?` · ${esc(item.horario)}`:''}</div>
          <div class="recurrence-next">↻ ${esc(recurrenceKind(item))}${esc(nextText)}</div>
          <p>📍 ${esc(item.local||item.cidade)}${item.local&&n(item.local)!==n(item.cidade)?` · ${esc(item.cidade)}`:''}</p>
          <p>💰 ${esc(item.preco||'não informado')}</p>
          ${item.ingresso?`<p>🎟️ ${esc(item.ingresso)}</p>`:''}
        </div>
        ${item.descricao?`<p class="desc">${esc(item.descricao)}</p>`:''}
        <div class="tags">${tagsHtml(item,'event')}</div>
        <div class="source-note">programação verificada em ${esc(item.verificadoEm||'data não informada')} · fonte: ${esc(item.fonte||'não informada')}</div>
        <div class="actions">${source}${feedbackButtons('event',item)}</div>
      </article>`;
    };
  } catch {}

  try {
    renderNovidades = function() {
      const byAdded=(a,b)=>{const da=a.adicionadoEm||a.verificadoEm||'0000-00-00',db=b.adicionadoEm||b.verificadoEm||'0000-00-00';return db.localeCompare(da)||(a.dataInicio||'9999').localeCompare(b.dataInicio||'9999');};
      const upcoming=state.eventos.filter(e=>isRecurring(e)||dayFromISO(e.dataFim||e.dataInicio)>=localMidnight()).sort(byAdded).slice(0,18);
      const recentPlaces=[...state.lugares].filter(p=>p.adicionadoEm||p.verificadoEm).sort(byAdded).slice(0,12);
      renderList(upcoming,'event','event-results','event-count');renderList(recentPlaces,'place','place-results','place-count');
    };
  } catch {}

  try {
    const baseRenderIndicacoes = typeof renderIndicacoes === 'function' ? renderIndicacoes : null;
    if (baseRenderIndicacoes) {
      renderIndicacoes = function() {
        const likes=readSet('roledfora.likes'),dislikes=readSet('roledfora.dislikes');
        const upcoming=state.eventos.filter(e=>isRecurring(e)||dayFromISO(e.dataFim||e.dataInicio)>=localMidnight()).map(x=>({kind:'event',item:x}));
        const places=state.lugares.map(x=>({kind:'place',item:x}));
        const mixed=[...upcoming,...places].sort((a,b)=>scoreItem(b.kind,b.item,likes,dislikes)-scoreItem(a.kind,a.item,likes,dislikes)).slice(0,24);
        const target=document.querySelector('#results'),count=document.querySelector('#result-count');
        if(count)count.textContent=`${mixed.length} sugestões`;
        if(target)target.innerHTML=mixed.map(x=>x.kind==='event'?eventCard(x.item):placeCard(x.item)).join('');
      };
    }
  } catch {}

  window.roledforaRecurrence = { isRecurring, recurringOnDate, nextOccurrence, recurrenceText };
})();
