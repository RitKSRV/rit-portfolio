(function () {
  const THEMES = [
    { cls: 'theme-white', label: 'Theme: Gallery White' },
    { cls: 'theme-black', label: 'Theme: Darkroom Black' },
    { cls: 'theme-olive', label: 'Theme: Olive Film' }
  ];

  let themeIdx = 0;
  let activeFilter = 'all';
  let gridActive = false;
  let visiblePhotos = [...PORTFOLIO_PHOTOS];
  let currentIndex = -1;

  const photoGrid = document.getElementById('photo-grid');
  const heroPlate = document.getElementById('hero-plate');
  const heroImg = document.getElementById('hero-img');
  const themeBtn = document.getElementById('theme-cycle-btn');
  const gridBtn = document.getElementById('grid-toggle-btn');
  const clockEl = document.getElementById('studio-clock');

  const infoOverlay = document.getElementById('info-overlay');
  const infoOpenBtn = document.getElementById('info-open-btn');
  const menuOpenBtn = document.getElementById('menu-open-btn');
  const infoCloseBtn = document.getElementById('info-close-btn');

  const lightbox = document.getElementById('lightbox');
  const lbBackdrop = document.getElementById('lb-backdrop');
  const lbCloseBtn = document.getElementById('lb-close-btn');
  const lbGridBtn = document.getElementById('lb-grid-btn');
  const lbLoadBtn = document.getElementById('lb-load-btn');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');
  const lbImg = document.getElementById('lb-img');
  const lbEmpty = document.getElementById('lb-empty');
  const lbEmptyNum = document.getElementById('lb-empty-num');
  const lbTitle = document.getElementById('lb-title');
  const lbMeta = document.getElementById('lb-meta');
  const fileInput = document.getElementById('local-file-input');

  function updateClock() {
    const now = new Date();
    const formatted = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    clockEl.textContent = `${formatted.toUpperCase()} · IST`;
  }

  function render() {
    visiblePhotos = PORTFOLIO_PHOTOS.filter((p) => activeFilter === 'all' || p.gear === activeFilter);

    const lead = visiblePhotos[0];
    const rest = visiblePhotos.slice(1);

    if (lead) {
      heroPlate.classList.remove('hidden');
      const heroSurface = heroPlate.querySelector('.plate-surface');
      heroSurface.className = `plate-surface ${lead.tone}`;
      heroPlate.style.maxWidth = lead.wide ? '' : '540px';
      heroPlate.style.margin = lead.wide ? '' : '0 auto 8px';
      heroSurface.style.aspectRatio = lead.wide ? '16 / 9' : '3 / 4';
      heroPlate.querySelector('.plate-index').textContent = lead.id;
      if (lead.src) {
        heroImg.src = lead.src;
        heroImg.alt = lead.title;
        heroImg.classList.remove('hidden');
      } else {
        heroImg.src = '';
        heroImg.classList.add('hidden');
      }
    } else {
      heroPlate.classList.add('hidden');
    }

    photoGrid.innerHTML = rest
      .map(
        (photo, idx) => `
      <article class="plate-tile ${photo.wide ? 'wide' : ''}" data-index="${idx + 1}" tabindex="0" role="button" aria-label="${photo.title}">
        <div class="plate-surface ${photo.tone}">
          ${photo.src ? `<img src="${photo.src}" alt="${photo.title}" loading="lazy" />` : ''}
          <span class="plate-index">${photo.id}</span>
          <div class="golden-grid" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </article>
    `
      )
      .join('');

    photoGrid.querySelectorAll('.plate-tile').forEach((tile) => {
      const open = () => openLightbox(Number(tile.dataset.index));
      tile.addEventListener('click', open);
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function setFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('.nav-link[data-filter]').forEach((link) => {
      link.classList.toggle('active', link.dataset.filter === filter);
    });
    render();
  }

  function cycleTheme() {
    document.body.classList.remove(THEMES[themeIdx].cls);
    themeIdx = (themeIdx + 1) % THEMES.length;
    document.body.classList.add(THEMES[themeIdx].cls);
    themeBtn.textContent = THEMES[themeIdx].label;
  }

  function toggleGrid() {
    gridActive = !gridActive;
    document.body.classList.toggle('grid-active', gridActive);
    gridBtn.setAttribute('aria-pressed', String(gridActive));
    lbGridBtn.setAttribute('aria-pressed', String(gridActive));
  }

  function openLightbox(idx) {
    if (idx < 0 || idx >= visiblePhotos.length) return;
    currentIndex = idx;
    const photo = visiblePhotos[idx];

    lbCounter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(visiblePhotos.length).padStart(2, '0')}`;
    lbEmptyNum.textContent = photo.id;
    lbTitle.textContent = `Plate ${photo.id}`;
    lbMeta.textContent = photo.meta;

    if (photo.src) {
      lbImg.src = photo.src;
      lbImg.alt = photo.title;
      lbImg.classList.remove('hidden');
      lbEmpty.classList.add('hidden');
    } else {
      lbImg.src = '';
      lbImg.classList.add('hidden');
      lbEmpty.classList.remove('hidden');
    }

    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function stepLightbox(delta) {
    if (visiblePhotos.length === 0) return;
    openLightbox((currentIndex + delta + visiblePhotos.length) % visiblePhotos.length);
  }

  // Event bindings
  heroPlate.addEventListener('click', () => openLightbox(0));
  heroPlate.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(0);
    }
  });

  document.querySelectorAll('.nav-link[data-filter]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setFilter(link.dataset.filter);
    });
  });

  document.querySelectorAll('.overlay-link[data-overlay-filter]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setFilter(link.dataset.overlayFilter);
      infoOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });

  infoOpenBtn.addEventListener('click', () => {
    infoOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  menuOpenBtn.addEventListener('click', () => {
    infoOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  infoCloseBtn.addEventListener('click', () => {
    infoOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  });

  themeBtn.addEventListener('click', cycleTheme);
  gridBtn.addEventListener('click', toggleGrid);
  lbGridBtn.addEventListener('click', toggleGrid);
  lbCloseBtn.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => stepLightbox(-1));
  lbNext.addEventListener('click', () => stepLightbox(1));

  lbLoadBtn.addEventListener('click', () => {
    if (currentIndex >= 0) fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || currentIndex < 0) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const target = visiblePhotos[currentIndex];
      if (target) {
        target.src = ev.target.result;
        render();
        openLightbox(currentIndex);
      }
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'g' || e.key === 'G') {
      toggleGrid();
    } else if (e.key === 'Escape') {
      if (!lightbox.classList.contains('hidden')) closeLightbox();
      if (!infoOverlay.classList.contains('hidden')) {
        infoOverlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    } else if (!lightbox.classList.contains('hidden')) {
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    }
  });

  updateClock();
  setInterval(updateClock, 30000);
  render();
})();
