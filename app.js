const body = document.body;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const toast = document.querySelector('.toast');

const i18n = window.portfolioI18n || { pt: {}, meta: {} };
const originalText = new Map();
const originalAttributes = new Map();
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
let currentTextNode;

while ((currentTextNode = textWalker.nextNode())) {
  if (currentTextNode.nodeValue.trim()) originalText.set(currentTextNode, currentTextNode.nodeValue);
}

document.querySelectorAll('[aria-label], [alt], [title], [data-caption]').forEach((element) => {
  const values = {};
  ['aria-label', 'alt', 'title', 'data-caption'].forEach((attribute) => {
    if (element.hasAttribute(attribute)) values[attribute] = element.getAttribute(attribute);
  });
  originalAttributes.set(element, values);
});

let currentLanguage = 'en';

function translationFor(value, language) {
  return language === 'pt' ? (i18n.pt[value] || value) : value;
}

function applyLanguage(language) {
  currentLanguage = language === 'pt' ? 'pt' : 'en';
  document.documentElement.lang = currentLanguage === 'pt' ? 'pt-PT' : 'en';

  originalText.forEach((value, node) => {
    const trimmed = value.trim();
    node.nodeValue = value.replace(trimmed, translationFor(trimmed, currentLanguage));
  });

  originalAttributes.forEach((values, element) => {
    Object.entries(values).forEach(([attribute, value]) => {
      element.setAttribute(attribute, translationFor(value, currentLanguage));
    });
  });

  const meta = i18n.meta[currentLanguage];
  if (meta) {
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.ogDescription);
  }

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.language === currentLanguage));
  });

  try { localStorage.setItem('pedro-portfolio-language', currentLanguage); } catch (error) { /* Session-only preference. */ }
}

document.querySelectorAll('[data-language]').forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.language));
});

try {
  applyLanguage(localStorage.getItem('pedro-portfolio-language') || 'en');
} catch (error) {
  applyLanguage('en');
}

menuButton?.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', translationFor(open ? 'Close menu' : 'Open menu', currentLanguage));
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelector('[data-back-to-top]')?.addEventListener('click', (event) => {
  event.preventDefault();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  history.replaceState(null, '', `${location.pathname}${location.search}#home`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px' });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.project-card').forEach((card) => {
      card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter);
    });
  });
});

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((otherVideo) => {
      if (otherVideo !== video) otherVideo.pause();
    });
  });
});

const dialog = document.querySelector('.lightbox');
const dialogImage = dialog?.querySelector('.lightbox-stage img');
const caption = dialog?.querySelector('.lightbox-caption');
const resetButton = dialog?.querySelector('[data-zoom-reset]');
let zoom = 1;

function setZoom(nextZoom) {
  zoom = Math.min(3, Math.max(.5, nextZoom));
  if (dialogImage) dialogImage.style.width = `${Math.round(zoom * 100)}%`;
  if (resetButton) resetButton.textContent = `${Math.round(zoom * 100)}%`;
}

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!dialog || !dialogImage || !caption) return;
    dialogImage.src = button.dataset.lightbox;
    dialogImage.alt = button.querySelector('img')?.alt || button.dataset.caption || translationFor('Portfolio visual', currentLanguage);
    caption.textContent = button.dataset.caption || '';
    setZoom(1);
    dialog.showModal();
    body.classList.add('lightbox-open');
  });
});

function closeLightbox() {
  dialog?.close();
  body.classList.remove('lightbox-open');
  if (dialogImage) dialogImage.src = '';
}

dialog?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
dialog?.querySelector('[data-zoom-in]')?.addEventListener('click', () => setZoom(zoom + .25));
dialog?.querySelector('[data-zoom-out]')?.addEventListener('click', () => setZoom(zoom - .25));
resetButton?.addEventListener('click', () => setZoom(1));
dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
dialog?.addEventListener('close', () => body.classList.remove('lightbox-open'));

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

document.querySelectorAll('[data-share]').forEach((button) => {
  button.addEventListener('click', async () => {
    const data = {
      title: i18n.meta[currentLanguage]?.title || 'Pedro Batista | Football Executive',
      text: currentLanguage === 'pt' ? 'Conheça o portefólio executivo de futebol de Pedro Batista.' : 'Explore Pedro Batista’s executive football portfolio.',
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        showToast(currentLanguage === 'pt' ? 'Ligação do portefólio copiada' : 'Portfolio link copied');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast(currentLanguage === 'pt' ? 'Utilize o menu do navegador para partilhar esta página' : 'Use your browser menu to share this page');
    }
  });
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
