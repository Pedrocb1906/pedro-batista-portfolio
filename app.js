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

document.querySelectorAll('.youtube-launch').forEach((button) => {
  button.addEventListener('click', () => {
    const videoId = button.dataset.youtube;
    const start = Number.parseInt(button.dataset.start || '0', 10);
    if (!videoId) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?start=${start}&autoplay=1&rel=0`;
    iframe.title = button.getAttribute('aria-label') || 'YouTube interview';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    button.replaceWith(iframe);
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
