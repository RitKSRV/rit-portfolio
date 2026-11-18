(function () {
  const THEMES = ['d3-black', 'd3-olive', 'd3-navy'];
  let themeIdx = 0;
  let activeGear = 'all';
  let visible = [...PORTFOLIO_PHOTOS];
  let gridActive = false;
  let lbIndex = -1;

  const carouselEl = document.getElementById('d3-carousel');
  const sequenceEl = document.getElementById('d3-sequence');
  const clockEl = document.getElementById('d3-clock');
  const themeBtn = document.getElementById('d3-theme-btn');
  const gridBtn = document.getElementById('d3-grid-btn');

  const menuBtn = document.getElementById('d3-menu-btn');
  const menuOverlay = document.getElementById('d3-menu-overlay');
  const menuClose = document.getElementById('d3-menu-close');
  const menuInfo = document.getElementById('d3-menu-info');

  const lightbox = document.getElementById('d3-lightbox');
  const lbBg = document.getElementById('d3-lb-bg');
  const lbClose = document.getElementById('d3-lb-close');
  const lbGrid = document.getElementById('d3-lb-grid');
  const lbPrev = document.getElementById('d3-lb-prev');
  const lbNext = document.getElementById('d3-lb-next');
  const lbCount = document.getElementById('d3-lb-count');
  const lbImg = document.getElementById('d3-lb-img');
  const lbTitle = document.getElementById('d3-lb-title');
  const lbMeta = document.getElementById('d3-lb-meta');

  function updateClock() {
    const now = new Date();
    const t = now
      .toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      })
      .replace(' ', '')
      .toUpperCase();
    clockEl.textContent = `${t} (GMT+5:30) • IN`;
  }

  function render() {
    visible = PORTFOLIO_PHOTOS.filter((p) => activeGear === 'all' || p.gear === activeGear);

    // Hero horizontal carousel (first 12)
    carouselEl.innerHTML = visible
      .slice(0, 12)
      .map(
        (p, i) => `
      <div class="d3-strip-thumb" data-idx="${i}" tabindex="0" role="button" aria-label="${p.title}">
        <img src="${p.src}" alt="${p.title}" loading="lazy" />
        <div class="d3-golden-grid" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      </div>
    `
      )
      .join('');

    // Single-column centered plates
    sequenceEl.innerHTML = visible
      .map(
        (p, i) => `
      <article class="d3-plate" data-idx="${i}" tabindex="0" role="button" aria-label="${p.title}">
        <div class="d3-plate-box">
          <div class="d3-plate-inner">
            <img src="${p.src}" alt="${p.title}" loading="lazy" />
            <div class="d3-golden-grid" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>
        <div class="d3-plate-caption">
          <span class="meta">${p.id} · ${p.meta}</span>
        </div>
      </article>
    `
      )
      .join('');

    carouselEl.querySelectorAll('.d3-strip-thumb').forEach((el) => {
      el.addEventListener('click', () => openLightbox(Number(el.dataset.idx)));
    });
    sequenceEl.querySelectorAll('.d3-plate').forEach((el) => {
      el.addEventListener('click', () => openLightbox(Number(el.dataset.idx)));
    });
  }

  function setGear(gear) {
    activeGear = gear;
    document.querySelectorAll('.d3-filter').forEach((b) => {
      b.classList.toggle('active', b.dataset.gear === gear);
    });
    render();
  }

  function cycleTheme() {
    document.body.classList.remove(THEMES[themeIdx]);
    themeIdx = (themeIdx + 1) % THEMES.length;
    document.body.classList.add(THEMES[themeIdx]);
  }

  function toggleGrid() {
    gridActive = !gridActive;
    document.body.classList.toggle('d3-grid-active', gridActive);
    gridBtn.setAttribute('aria-pressed', String(gridActive));
    lbGrid.setAttribute('aria-pressed', String(gridActive));
  }

  function openLightbox(idx) {
    if (idx < 0 || idx >= visible.length) return;
    lbIndex = idx;
    const p = visible[idx];
    lbCount.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    lbImg.src = p.src;
    lbImg.alt = p.title;
    lbTitle.textContent = p.id;
    lbMeta.textContent = p.meta;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    lbIndex = -1;
  }

  function stepLightbox(delta) {
    if (!visible.length) return;
    openLightbox((lbIndex + delta + visible.length) % visible.length);
  }

  document.querySelectorAll('.d3-filter').forEach((b) => {
    b.addEventListener('click', () => setGear(b.dataset.gear));
  });

  document.querySelectorAll('[data-menu-filter]').forEach((a) => {
    a.addEventListener('click', () => {
      setGear(a.dataset.menuFilter);
      menuOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });

  menuInfo.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  });

  menuBtn.addEventListener('click', () => {
    menuOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  menuClose.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  });

  themeBtn.addEventListener('click', cycleTheme);
  gridBtn.addEventListener('click', toggleGrid);
  lbGrid.addEventListener('click', toggleGrid);
  lbClose.addEventListener('click', closeLightbox);
  lbBg.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => stepLightbox(-1));
  lbNext.addEventListener('click', () => stepLightbox(1));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'g' || e.key === 'G') {
      toggleGrid();
    } else if (e.key === 'Escape') {
      if (!lightbox.classList.contains('hidden')) closeLightbox();
      if (!menuOverlay.classList.contains('hidden')) {
        menuOverlay.classList.add('hidden');
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
