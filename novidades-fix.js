(() => {
  const applyFix = () => {
    if (typeof renderNovidades !== 'function') return;
    try {
      renderNovidades = function(){
        const byAdded=(a,b)=>{const da=a.adicionadoEm||'0000-00-00',db=b.adicionadoEm||'0000-00-00';return db.localeCompare(da)||(a.dataInicio||'9999').localeCompare(b.dataInicio||'9999')||(a.nome||'').localeCompare(b.nome||'','pt-BR');};
        const upcoming=state.eventos.filter(e=>e.adicionadoEm&&dayFromISO(e.dataFim||e.dataInicio)>=localMidnight()).sort(byAdded).slice(0,18);
        const recentPlaces=[...state.lugares].filter(p=>p.adicionadoEm).sort(byAdded).slice(0,12);
        renderList(upcoming,'event','event-results','event-count');
        renderList(recentPlaces,'place','place-results','place-count');
      };
      if(document.body.dataset.page==='novidades') renderNovidades();
    } catch {}
  };
  document.addEventListener('DOMContentLoaded',applyFix);
  document.addEventListener('roledfora:data-updated',applyFix);
})();
