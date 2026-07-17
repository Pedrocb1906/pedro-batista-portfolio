const body = document.body;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const toast = document.querySelector('.toast');

menuButton?.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
    dialogImage.alt = button.querySelector('img')?.alt || button.dataset.caption || 'Portfolio visual';
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
      title: 'Pedro Batista | Football Executive',
      text: 'Explore Pedro Batista’s executive football portfolio.',
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Portfolio link copied');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Use your browser menu to share this page');
    }
  });
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
