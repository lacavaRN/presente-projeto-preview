/* CONTEÚDO EDITÁVEL: troque aqui textos, datas e fotos (src) */
const MEM = [
  { t: 'Pôr do sol', m: 'Arte da abertura', c: 'O navio indo embora com o sol atrás.', n: 'Troque por uma foto de vocês.', a: 'Navio ao pôr do sol', bg: 'var(--scene) 55% 55%/cover no-repeat' },
  { t: 'Robin', m: 'Arqueologia e boas conversas', c: 'Ilhas, livros e boas conversas.', n: 'Calma por fora, curiosa por dentro.', a: 'Nico Robin', bg: 'var(--robin) 70% 28%/175% no-repeat' },
  { t: 'Corazón', m: 'Silêncio e caos', c: 'Capuz vermelho e um coração no pijama.', n: 'Tropeça em tudo, acerta no que importa.', a: 'Corazón', bg: 'var(--cora) 80% 22%/170% no-repeat' },
  { t: 'Os dois no convés', m: 'Uma tarde qualquer', c: 'Uma cena que cabe numa polaroid.', n: 'Espaço para uma anotação sua.', a: 'Robin e Corazón no convés ao pôr do sol', bg: 'var(--scene) 50% 50%/cover no-repeat' },
  { t: 'Ilha da caveira', m: 'Primeira parada do mapa', c: 'Com chapéu de palha e tudo.', n: 'Espaço para uma anotação sua.', a: 'Ilha em forma de caveira com chapéu de palha', bg: 'var(--isl1) center/86% no-repeat,linear-gradient(#cfeaf4,#4f9dbb)' },
  { t: 'Ilha do porto', m: 'Segunda parada do mapa', c: 'Um porto que nunca dorme.', n: 'Espaço para uma anotação sua.', a: 'Ilha com porto e uma grande árvore', bg: 'var(--isl2) center/90% no-repeat,linear-gradient(#cfeaf4,#4f9dbb)' }
];

const NOTES = [
  ['Sua curiosidade torna tudo mais interessante.', 'Você pergunta o que ninguém pensou em perguntar.'],
  ['Você transforma dias comuns em boas histórias.', 'Até fila de mercado vira capítulo.'],
  ['Sua presença deixa tudo mais leve.', 'Sem esforço nenhum, o que é suspeito.'],
  ['Você sempre me inspira a querer viver mais aventuras.', 'Culpa sua se eu comprar uma bússola.']
];

const ISL = [
  ['Ilha da Primeira Memória', 'Começou meio sem querer. Por isso mesmo ficou bom.'],
  ['Ilha das Risadas', 'Aqui moram as piadas que só a gente entende.'],
  ['Ilha dos Planos Malucos', 'Metade não vai acontecer. A outra metade a gente descobre.'],
  ['Ilha do "E se..."', 'E se a gente simplesmente fosse? A pergunta fica no mapa.']
];

const $ = (selector, root = document) => root.querySelector(selector);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

const toast = (message) => {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('on'), 2200);
};

/* Revelação ao rolar */
const revealItems = document.querySelectorAll('.rv');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('in'));
}

/* Progresso da página + bússola */
const compassSvg = $('#cs');
let scrollTick = 0;
let compassClicks = 0;

addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = requestAnimationFrame(() => {
    scrollTick = 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    $('#bar').style.transform = `scaleX(${Math.min(1, scrollY / maxScroll)})`;

    if (!reduceMotion) {
      compassSvg.style.setProperty('--scroll-rot', `${scrollY * 0.08}deg`);
    }
  });
}, { passive: true });

$('#compass').addEventListener('click', () => {
  compassClicks += 1;
  compassSvg.style.setProperty('--click-rot', `${compassClicks * 72}deg`);

  if (compassClicks % 5 === 0) {
    toast('O norte é onde você está.');
  }
});

/* Lembranças */
const modal = $('#md');
let lastMemoryButton = null;

MEM.forEach((memory) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pol';
  button.setAttribute('aria-label', `Abrir memória: ${memory.t}`);

  const photo = document.createElement('div');
  photo.className = 'ph';
  photo.setAttribute('role', 'img');
  photo.setAttribute('aria-label', memory.a);
  photo.style.background = memory.bg;

  const caption = document.createElement('span');
  caption.className = 'cap';
  caption.textContent = memory.t;

  button.append(photo, caption);
  button.addEventListener('click', () => {
    lastMemoryButton = button;

    const modalPhoto = $('#mp');
    modalPhoto.style.background = memory.bg;
    modalPhoto.setAttribute('role', 'img');
    modalPhoto.setAttribute('aria-label', memory.a);
    $('#mt').textContent = memory.t;
    $('#mm').textContent = memory.m;
    $('#mc').textContent = memory.c;
    $('#mn').textContent = memory.n;

    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  });

  $('#grid').append(button);
});

$('#mx').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});
modal.addEventListener('close', () => lastMemoryButton?.focus());

/* Notas */
NOTES.forEach(([summary, detail]) => {
  const item = document.createElement('li');
  const note = document.createElement('button');
  note.type = 'button';
  note.className = 'note';
  note.setAttribute('aria-expanded', 'false');

  const summaryElement = document.createElement('span');
  summaryElement.textContent = summary;

  const detailElement = document.createElement('span');
  detailElement.className = 'more';
  detailElement.textContent = detail;

  note.append(summaryElement, detailElement);
  note.addEventListener('click', () => {
    const expanded = note.getAttribute('aria-expanded') === 'true';
    note.setAttribute('aria-expanded', String(!expanded));
  });

  item.append(note);
  $('#notes').append(item);
});

$('#heart').addEventListener('click', () => toast('(silêncio)'));

/* Mapa e travessia */
const route = $('#route');
const routeLength = route.getTotalLength();
const sampleCount = 240;
const routePoints = [];

for (let index = 0; index <= sampleCount; index += 1) {
  const point = route.getPointAtLength((routeLength * index) / sampleCount);
  routePoints.push([point.x, point.y]);
}

const islandFractions = [0, 0.34, 0.68, 1];
const boat = $('#boat');
const map = $('#map');
const card = $('#card');
const pins = [];
const islandListButtons = [];
let progress = 0;
let currentIsland = -1;
let dragging = false;
let sailTimer = 0;

const pointAt = (fraction) => route.getPointAtLength(routeLength * fraction);

ISL.forEach((island, index) => {
  const point = pointAt(islandFractions[index]);

  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'pin';
  pin.dataset.k = String(index);
  pin.style.left = `${point.x / 4}%`;
  pin.style.top = `${point.y / 5}%`;
  pin.setAttribute('aria-label', island[0]);

  const icon = document.createElement('i');
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = island[0];
  pin.append(icon, label);
  pin.addEventListener('click', () => go(islandFractions[index]));
  map.append(pin);
  pins.push(pin);

  const item = document.createElement('li');
  const listButton = document.createElement('button');
  listButton.type = 'button';
  listButton.textContent = island[0];
  listButton.addEventListener('click', () => go(islandFractions[index]));
  item.append(listButton);
  $('#list').append(item);
  islandListButtons.push(listButton);
});

function showIsland(index) {
  if (index === currentIsland) return;
  currentIsland = index;

  card.children[0].textContent = ISL[index][0];
  card.children[1].textContent = ISL[index][1];

  pins.forEach((pin, pinIndex) => pin.classList.toggle('on', pinIndex === index));
  islandListButtons.forEach((button, buttonIndex) => {
    if (buttonIndex === index) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function setProgress(value) {
  progress = Math.max(0, Math.min(1, value));
  const point = pointAt(progress);

  boat.style.left = `${point.x / 4}%`;
  boat.style.top = `${point.y / 5}%`;
  $('#prog').style.strokeDashoffset = String(1 - progress);

  let islandIndex = 0;
  islandFractions.forEach((fraction, index) => {
    if (progress >= fraction - 0.02) islandIndex = index;
  });

  showIsland(islandIndex);
  $('#done').hidden = progress < 0.98;
  if (progress > 0.02) boat.classList.add('moved');
}

function go(fraction) {
  clearTimeout(sailTimer);
  boat.classList.add('sail');
  setProgress(fraction);
  sailTimer = setTimeout(() => boat.classList.remove('sail'), reduceMotion ? 0 : 850);
}

boat.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  dragging = true;
  clearTimeout(sailTimer);
  boat.classList.remove('sail');
  boat.setPointerCapture(event.pointerId);
  boat.style.cursor = 'grabbing';
});

const stopDragging = (event) => {
  dragging = false;
  boat.style.cursor = '';
  if (event?.pointerId !== undefined && boat.hasPointerCapture?.(event.pointerId)) {
    boat.releasePointerCapture(event.pointerId);
  }
};

boat.addEventListener('pointerup', stopDragging);
boat.addEventListener('pointercancel', stopDragging);

boat.addEventListener('pointermove', (event) => {
  if (!dragging) return;

  const rect = map.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 400;
  const y = ((event.clientY - rect.top) / rect.height) * 500;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index <= sampleCount; index += 1) {
    const dx = routePoints[index][0] - x;
    const dy = routePoints[index][1] - y;
    const distance = (dx * dx) + (dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  setProgress(closestIndex / sampleCount);
});

boat.addEventListener('keydown', (event) => {
  const deltas = {
    ArrowRight: 0.03,
    ArrowDown: 0.03,
    ArrowLeft: -0.03,
    ArrowUp: -0.03
  };

  if (event.key in deltas) {
    event.preventDefault();
    setProgress(progress + deltas[event.key]);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    setProgress(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    setProgress(1);
  }
});

setProgress(0);

/* Envelope */
const envelope = $('#env');
const openButton = $('#open');

openButton.addEventListener('click', () => {
  const isOpen = envelope.classList.toggle('open');
  $('#final').classList.toggle('show', isOpen);
  openButton.setAttribute('aria-expanded', String(isOpen));
  openButton.textContent = isOpen ? 'Fechar envelope' : 'Abrir surpresa';

  if (isOpen && !reduceMotion) {
    const surprise = $('#surp');
    for (let index = 0; index < 16; index += 1) {
      const petal = document.createElement('span');
      petal.className = 'pt';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--dx', `${(Math.random() * 80) - 40}px`);
      petal.style.animationDelay = `${Math.random() * 1.5}s`;
      surprise.append(petal);
      setTimeout(() => petal.remove(), 6000);
    }
  }

  if (!isOpen && openButton.dataset.reopened) {
    toast('De novo? Tudo bem.');
  }
  openButton.dataset.reopened = '1';
});
