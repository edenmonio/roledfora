(() => {
  const normalize = value => (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const EXTRA_TAG_EMOJI = {
    'sustentabilidade':'♻️',
    'ecologia':'🌱',
    'meio ambiente':'🌎',
    'aguas termais':'♨️',
    'rooftop':'🌇',
    'foto':'📸',
    'livros':'📚',
    'ocasiao':'🥂',
    'casual':'🙂',
    'frutos do mar':'🦐',
    'comida nordestina':'🌵',
    'turistando':'🧭',
    'religiao':'🕯️',
    'experiencia':'🎟️',
    'quadras':'🏀',
    'parquinho':'🛝',
    'skate':'🛹',
    'pontes':'🌉',
    'leitura':'📖',
    'arte urbana':'🧱',
    'morro':'⛰️',
    'panoramica':'🔭',
    'corrida':'🏃',
    'caminhada':'🚶',
    'artist alley':'🧑‍🎨',
    "artist's alley":'🧑‍🎨',
    'tecnologia':'🤖',
    'rpg':'🎲',
    'quadrinhos':'💬',
    'games':'🎮',
    'mpb':'🎙️',
    'pop':'🎧',
    'rock':'🎸',
    'forro':'🪗',
    'piseiro':'🕺',
    'eletronica':'🔊',
    'house':'🎛️',
    'reggaeton':'🔥',
    'festival':'🎪',
    'bar':'🍸',
    'cinema':'🎞️',
    'teatro':'🎭',
    'cidade historica':'🏘️',
    'chapada':'⛰️',
    'cerrado':'🌾',
    'parque aquatico':'🏊',
    'cachoeira':'💦',
    'cachoeiras':'🌊',
    'caverna':'🕳️',
    'cavernas':'🦇',
    'pocos':'💧',
    'lago':'🛶',
    'mirante':'🔭',
    'por do sol':'🌅',
    'date':'💞',
    'date diferente':'💘',
    'pet friendly':'🐾',
    'acessivel':'♿',
    'gratuito':'🆓',
    'familia':'👨‍👩‍👧',
    'infantil':'🧸',
    'classico brasiliense':'⭐',
    'classico':'🏆',
    'alternativo':'🌀',
    'design independente':'🧵',
    'economia criativa':'💡',
    'cultura japonesa':'🎐',
    'cultura popular':'🪗',
    'historia':'📜',
    'arquitetura':'📐',
    'museu':'🏛️',
    'arte':'🎨',
    'exposicao':'🖼️',
    'musica':'🎶',
    'musica ao vivo':'🎤',
    'festa':'🎉',
    'balada':'🪩',
    'madrugada':'🌙',
    'gastronomia':'🍽️',
    'comer':'😋',
    'cafe':'☕',
    'doce':'🧁',
    'padaria':'🥐',
    'pizza':'🍕',
    'hamburguer':'🍔',
    'sushi':'🍣',
    'japones':'🎎',
    'vinho':'🍷',
    'lgbtqia+':'🌈',
    'drag':'👑',
    'ao ar livre':'🌤️',
    'natureza':'🌳',
    'trilha':'🥾',
    'trilhas':'🥾',
    'oficina':'🛠️',
    'oficinas':'🛠️',
    'curso':'🧠',
    'passeio':'🚶',
    'vista':'👀',
    'compras':'🛍️',
    'feira':'🧺',
    'aventura':'🧗',
    'arvorismo':'🌲',
    'escalada':'🧗‍♀️',
    'tirolesa':'🪢',
    'parque':'🌳',
    'viagem':'🧳',
    'goias':'🌾',
    'entorno':'🗺️',
    'shopping':'🛍️',
    'art deco':'🏢',
    'restaurante':'🍴'
  };

  function sortSelect(select, keepFirst = true) {
    if (!select || select.options.length < 3) return;
    const options = [...select.options];
    const first = keepFirst ? options.shift() : null;
    const sorted = [...options].sort((a,b) => a.textContent.localeCompare(b.textContent, 'pt-BR', {sensitivity:'base'}));
    const current = select.value;
    const desired = [first, ...sorted].filter(Boolean);
    const same = desired.every((opt, i) => select.options[i] === opt);
    if (!same) {
      desired.forEach(opt => select.appendChild(opt));
      select.value = current;
    }
  }

  function cleanCardKind(cardKind) {
    if (!cardKind || cardKind.dataset.emojiCleaned) return;
    cardKind.textContent = cardKind.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    cardKind.dataset.emojiCleaned = '1';
  }

  function fixTagChip(chip) {
    if (!chip) return;
    const key = normalize(chip.getAttribute('title') || chip.querySelector('.tag-name')?.textContent);
    const emoji = EXTRA_TAG_EMOJI[key];
    if (emoji) {
      const target = chip.querySelector('.emoji');
      if (target) target.textContent = emoji;
    }
  }

  function applyFixes() {
    sortSelect(document.querySelector('#local'));
    sortSelect(document.querySelector('#onde'));
    sortSelect(document.querySelector('#tipo'));
    sortSelect(document.querySelector('#categoria'));
    document.querySelectorAll('.card-kind').forEach(cleanCardKind);
    document.querySelectorAll('.tag-chip').forEach(fixTagChip);
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyFixes();
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    applyFixes();
    observer.observe(document.body, {childList:true, subtree:true});
  });
})();
