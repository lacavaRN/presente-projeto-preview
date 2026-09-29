/* CONTEÚDO EDITÁVEL: ajuste aqui os textos da travessia. */
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
