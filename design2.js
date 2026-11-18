(function () {
  let activeGear = 'all';
  let visible = [...PORTFOLIO_PHOTOS];
  let index = 0;
  let gridActive = false;
  let whiteTheme = false;
  let wheelLock = false;

  const slideEl = document.querySelector('.fs-slide');
  const imgEl = document.getElementById('fs-img');
  const counterEl = document.getElementById('fs-counter');
  const titleEl = document.getElementById('fs-title');
  const metaEl = document.getElementById('fs-meta');

  const prevZone = document.getElementById('fs-prev-zone');
  const nextZone = document.getElementById('fs-next-zone');
  const prevBtn = document.getElementById('fs-prev-btn');
  const nextBtn = document.getElementById('fs-next-btn');
  const gridBtn = document.getElementById('fs-grid-btn');
  const themeBtn = document.getElementById('fs-theme-btn');

  const indexBtn = document.getElementById('fs-index-btn');
  const indexOverlay = document.getElementById('fs-index-overlay');
  const indexClose = document.getElementById('fs-index-close');
  const overlayCount = document.getElementById('fs-overlay-count');
  const thumbGrid = document.getElementById('fs-thumb-grid');

  function showSlide(i) {
    if (!visible.length) return;
    index = (i + visible.length) % visible.length;
    const p = visible[index];

    slideEl.classList.toggle('portrait', !p.wide);
    imgEl.src = p.src;
    imgEl.alt = p.title;
    counterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    titleEl.textContent = '';
    metaEl.textContent = p.meta;
  }

  function renderIndex() {
    overlayCount.textContent = visible.length;
    thumbGrid.innerHTML = visible
      .map(
        (p, i) => `
      <div class="fs-thumb" data-idx="${i}" tabindex="0" role="button" aria-label="${p.title}">
        <img src="${p.src}" alt="${p.title}" loading="lazy" />
      </div>
    `
      )
      .join('');

    thumbGrid.querySelectorAll('.fs-thumb').forEach((el) => {
      el.addEventListener('click', () => {
        showSlide(Number(el.dataset.idx));
        indexOverlay.classList.add('hidden');
      });
    });
  }

  function setGear(gear) {
    activeGear = gear;
    visible = PORTFOLIO_PHOTOS.filter((p) => gear === 'all' || p.gear === gear);
    document.querySelectorAll('[data-gear]').forEach((b) => {
      b.classList.toggle('active', b.dataset.gear === gear);
    });
    showSlide(0);
    renderIndex();
  }

  function toggleGrid() {
    gridActive = !gridActive;
    document.body.classList.toggle('d2-grid-active', gridActive);
    gridBtn.setAttribute('aria-pressed', String(gridActive));
  }

  function toggleTheme() {
    whiteTheme = !whiteTheme;
    document.body.classList.toggle('d2-white', whiteTheme);
    themeBtn.textContent = whiteTheme ? 'Black' : 'White';
  }

  prevZone.addEventListener('click', () => showSlide(index - 1));
  nextZone.addEventListener('click', () => showSlide(index + 1));
  prevBtn.addEventListener('click', () => showSlide(index - 1));
  nextBtn.addEventListener('click', () => showSlide(index + 1));
  gridBtn.addEventListener('click', toggleGrid);
  themeBtn.addEventListener('click', toggleTheme);

  document.querySelectorAll('[data-gear]').forEach((b) => {
    b.addEventListener('click', () => setGear(b.dataset.gear));
  });

  indexBtn.addEventListener('click', () => indexOverlay.classList.remove('hidden'));
  indexClose.addEventListener('click', () => indexOverlay.classList.add('hidden'));

  // Wheel / trackpad navigation when index is closed
  window.addEventListener(
    'wheel',
    (e) => {
      if (!indexOverlay.classList.contains('hidden')) return;
      if (wheelLock || Math.abs(e.deltaY) + Math.abs(e.deltaX) < 18) return;
      wheelLock = true;
      const forward = e.deltaY > 0 || e.deltaX > 0;
      showSlide(index + (forward ? 1 : -1));
      setTimeout(() => {
        wheelLock = false;
      }, 420);
    },
    { passive: true }
  );

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'g' || e.key === 'G') {
      toggleGrid();
    } else if (e.key === 'Escape' && !indexOverlay.classList.contains('hidden')) {
      indexOverlay.classList.add('hidden');
    } else if (indexOverlay.classList.contains('hidden')) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        showSlide(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        showSlide(index - 1);
      }
    }
  });

  showSlide(0);
  renderIndex();
})();
