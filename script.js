(() => {
  const TOTAL = 24;
  const pagePath = n => `page-${String(n).padStart(2, '0')}.webp`;
  const $ = id => document.getElementById(id);

  const pagedReader = $('pagedReader');
  const scrollReader = $('scrollReader');
  const pageImage = $('pageImage');
  const pageLabel = $('pageLabel');
  const progress = $('progress');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const prevEdge = $('prevEdge');
  const nextEdge = $('nextEdge');
  const modeBtn = $('modeBtn');
  const fullBtn = $('fullBtn');
  const shareBtn = $('shareBtn');
  const thumbBtn = $('thumbBtn');
  const thumbDialog = $('thumbDialog');
  const closeThumbs = $('closeThumbs');
  const thumbGrid = $('thumbGrid');
  const scrollPages = $('scrollPages');
  const readAgainBtn = $('readAgainBtn');
  const toast = $('toast');
  let current = parsePageFromURL();
  let mode = localStorage.getItem('imam-reader-mode') || 'paged';
  let touchX = null, touchY = null;
  let toastTimer;

  function parsePageFromURL() {
    const m = location.hash.match(/page=(\d+)/i);
    return m ? Math.min(TOTAL, Math.max(1, Number(m[1]))) : 1;
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function updateURL() {
    history.replaceState(null, '', `#page=${current}`);
  }

  function preload(n) {
    if (n < 1 || n > TOTAL) return;
    const img = new Image();
    img.src = pagePath(n);
  }

  function renderPage(announce = false) {
    pageImage.src = pagePath(current);
    pageImage.alt = `Comic page ${current} of ${TOTAL}`;
    pageLabel.textContent = `Page ${current} / ${TOTAL}`;
    progress.value = current;
    prevBtn.disabled = current === 1;
    nextBtn.disabled = current === TOTAL;
    prevEdge.disabled = current === 1;
    nextEdge.disabled = current === TOTAL;
    updateURL();
    document.title = `ÏMAM — Page ${current} / ${TOTAL}`;
    document.querySelectorAll('.thumb').forEach((el, i) => el.classList.toggle('active', i + 1 === current));
    preload(current + 1); preload(current - 1); preload(current + 2);
    if (announce) showToast(`Page ${current}`);
  }

  function go(n, announce = false) {
    current = Math.min(TOTAL, Math.max(1, n));
    renderPage(announce);
  }

  function buildThumbs() {
    if (thumbGrid.children.length) return;
    for (let n = 1; n <= TOTAL; n++) {
      const b = document.createElement('button');
      b.className = 'thumb';
      b.setAttribute('aria-label', `Go to page ${n}`);
      const im = document.createElement('img');
      im.loading = 'lazy';
      im.src = pagePath(n);
      im.alt = '';
      const s = document.createElement('span');
      s.textContent = n;
      b.append(im, s);
      b.addEventListener('click', () => {
        setMode('paged');
        go(n);
        thumbDialog.close();
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
      thumbGrid.appendChild(b);
    }
    renderPage();
  }

  function buildScrollPages() {
    if (scrollPages.children.length) return;
    for (let n = 1; n <= TOTAL; n++) {
      const fig = document.createElement('figure');
      fig.className = 'scroll-page';
      fig.id = `scroll-page-${n}`;
      const im = document.createElement('img');
      im.loading = n < 3 ? 'eager' : 'lazy';
      im.src = pagePath(n);
      im.alt = `Comic page ${n} of ${TOTAL}`;
      fig.appendChild(im);
      scrollPages.appendChild(fig);
    }
  }

  function setMode(nextMode) {
    mode = nextMode;
    localStorage.setItem('imam-reader-mode', mode);
    const scroll = mode === 'scroll';
    pagedReader.hidden = scroll;
    scrollReader.hidden = !scroll;
    modeBtn.textContent = scroll ? '▣' : '↕';
    modeBtn.title = scroll ? 'Switch to page mode' : 'Switch to scroll mode';
    if (scroll) {
      buildScrollPages();
      requestAnimationFrame(() => {
        const el = $(`scroll-page-${current}`);
        if (el) el.scrollIntoView({block: 'start'});
      });
    } else {
      renderPage();
      window.scrollTo({top: 0});
    }
  }

  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));
  prevEdge.addEventListener('click', () => go(current - 1));
  nextEdge.addEventListener('click', () => go(current + 1));
  progress.addEventListener('input', e => go(Number(e.target.value)));

  document.addEventListener('keydown', e => {
    if (thumbDialog.open || mode !== 'paged') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') go(current + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(current - 1);
    if (e.key === 'Home') go(1);
    if (e.key === 'End') go(TOTAL);
  });

  const stage = $('pageStage');
  stage.addEventListener('touchstart', e => {
    const t = e.changedTouches[0]; touchX = t.clientX; touchY = t.clientY;
  }, {passive: true});
  stage.addEventListener('touchend', e => {
    if (touchX == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX, dy = t.clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      dx < 0 ? go(current + 1) : go(current - 1);
    }
    touchX = touchY = null;
  }, {passive: true});

  modeBtn.addEventListener('click', () => setMode(mode === 'paged' ? 'scroll' : 'paged'));
  thumbBtn.addEventListener('click', () => { buildThumbs(); thumbDialog.showModal(); });
  closeThumbs.addEventListener('click', () => thumbDialog.close());
  thumbDialog.addEventListener('click', e => { if (e.target === thumbDialog) thumbDialog.close(); });

  function setImmersive(on) {
    document.body.classList.toggle('immersive', on);
    fullBtn.textContent = on ? '×' : '⛶';
    fullBtn.title = on ? 'Exit fullscreen reader' : 'Fullscreen';
    fullBtn.setAttribute('aria-label', on ? 'Exit fullscreen reader' : 'Fullscreen');
    if (on) {
      // On mobile, scrolling a tiny amount encourages browser chrome to collapse.
      requestAnimationFrame(() => window.scrollTo(0, 1));
      showToast('Fullscreen reader on');
    }
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  fullBtn.addEventListener('click', async () => {
    // iPhone/iPad Safari does not reliably support the Fullscreen API for normal web pages.
    // Use our own immersive reader there. It also works as a fallback everywhere else.
    if (document.body.classList.contains('immersive')) {
      setImmersive(false);
      return;
    }

    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
      return;
    }

    if (!isIOS() && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        return;
      } catch {}
    }

    setImmersive(true);
  });

  document.addEventListener('fullscreenchange', () => {
    const on = !!document.fullscreenElement;
    if (!on && !document.body.classList.contains('immersive')) {
      fullBtn.textContent = '⛶';
      fullBtn.title = 'Fullscreen';
      fullBtn.setAttribute('aria-label', 'Fullscreen');
    } else if (on) {
      fullBtn.textContent = '×';
      fullBtn.title = 'Exit fullscreen';
      fullBtn.setAttribute('aria-label', 'Exit fullscreen');
    }
  });

  shareBtn.addEventListener('click', async () => {
    const data = { title: 'ÏMAM — Days Before Reincarnation', text: 'Read Issue One free online.', url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); showToast('Link copied.'); }
    } catch (err) {
      if (err?.name !== 'AbortError') showToast('Could not share the link.');
    }
  });

  readAgainBtn.addEventListener('click', () => { current = 1; setMode('paged'); go(1); });
  window.addEventListener('hashchange', () => { const n = parsePageFromURL(); if (n !== current) go(n); });

  setMode(mode);
  go(current);
})();
