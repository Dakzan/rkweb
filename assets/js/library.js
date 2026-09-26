/* ============================================
   WHITE HOLE — Library: Drag Carousel + Modal
   ============================================ */

(function () {
  'use strict';

  const track = document.getElementById('carouselTrack');
  const wrapper = document.getElementById('carouselWrapper');
  if (!track || !wrapper) return;

  // ---- Drag / Swipe ----
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let currentX = 0;
  let velX = 0;
  let lastX = 0;
  let lastTime = 0;
  let rafId = null;
  let momentum = false;

  function getX(e) {
    return e.touches ? e.touches[0].pageX : e.pageX;
  }

  function onStart(e) {
    isDown = true;
    momentum = false;
    if (rafId) cancelAnimationFrame(rafId);
    track.classList.remove('smooth');
    wrapper.classList.add('dragging');
    startX = getX(e);
    scrollLeft = currentX;
    lastX = startX;
    lastTime = performance.now();
    velX = 0;
  }

  function onMove(e) {
    if (!isDown) return;
    e.preventDefault();
    const x = getX(e);
    const walk = (x - startX) * 1.15;
    currentX = scrollLeft + walk;

    // clamp roughly
    const maxScroll = 0;
    const minScroll = -(track.scrollWidth - wrapper.clientWidth + 80);
    currentX = Math.min(maxScroll, Math.max(minScroll, currentX));

    track.style.transform = `translateX(${currentX}px)`;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
      velX = (x - lastX) / dt;
    }
    lastX = x;
    lastTime = now;
  }

  function onEnd() {
    if (!isDown) return;
    isDown = false;
    wrapper.classList.remove('dragging');
    // momentum
    momentum = true;
    track.classList.add('smooth');
    applyMomentum();
  }

  function applyMomentum() {
    if (!momentum) return;
    velX *= 0.95;
    currentX += velX * 16;

    const maxScroll = 0;
    const minScroll = -(track.scrollWidth - wrapper.clientWidth + 80);
    if (currentX > maxScroll) {
      currentX = maxScroll;
      velX = 0;
    } else if (currentX < minScroll) {
      currentX = minScroll;
      velX = 0;
    }

    track.style.transform = `translateX(${currentX}px)`;

    if (Math.abs(velX) > 0.05) {
      rafId = requestAnimationFrame(applyMomentum);
    } else {
      momentum = false;
    }
  }

  wrapper.addEventListener('mousedown', onStart);
  wrapper.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
  window.addEventListener('mouseleave', onEnd);

  // Prevent image drag
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // ---- Modal ----
  const overlay = document.getElementById('modalOverlay');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalTags = document.getElementById('modalTags');
  const modalClose = document.getElementById('modalClose');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const animeData = {
    bocchi: {
      title: 'Bocchi the Rock!',
      tags: ['Comedia', 'Música', 'Slice of Life', '2022']
    },
    fate: {
      title: 'Fate Series',
      tags: ['Acción', 'Fantasía', 'Sobrenatural', 'Franchise']
    },
    monogatari: {
      title: 'Monogatari Series',
      tags: ['Misterio', 'Sobrenatural', 'Drama', 'Franchise']
    },
    seraph: {
      title: 'Owari no Seraph',
      tags: ['Acción', 'Drama', 'Vampiros', '2015']
    },
    rezero: {
      title: 'Re:Zero kara Hajimeru Isekai Seikatsu',
      tags: ['Isekai', 'Drama', 'Fantasía', 'Suspense']
    },
    shana: {
      title: 'Shakugan no Shana',
      tags: ['Acción', 'Fantasía', 'Romance', '2005']
    },
    umamusume: {
      title: 'Uma Musume: Pretty Derby',
      tags: ['Deportes', 'Música', 'Comedia', '2021']
    }
  };

  function openModal(card) {
    const id = card.dataset.id;
    const data = animeData[id] || { title: card.dataset.title, tags: ['Anime'] };
    const img = card.querySelector('img');

    modalImg.src = img.src;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalTags.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (window.spawnBurst) {
      const rect = card.getBoundingClientRect();
      window.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    }
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  track.querySelectorAll('.anime-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // ignore if it was a drag
      if (Math.abs(velX) > 0.3 || Math.abs(currentX - scrollLeft) > 8) return;
      openModal(card);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Fake download
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.innerHTML = '<span>¡Próximamente!</span>';
      setTimeout(() => {
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span>Descargar</span>`;
      }, 1800);
    });
  });

  // ---- 3D Tilt on cards ----
  track.querySelectorAll('.anime-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('search-hidden')) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -12;
      const tiltY = (x - 0.5) * 12;
      card.style.transform = `translateY(-16px) scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---- Search filter ----
  const searchInput = document.getElementById('animeSearch');
  const searchClear = document.getElementById('searchClear');
  const searchCount = document.getElementById('searchCount');
  const cards = Array.from(track.querySelectorAll('.anime-card'));

  let emptyMsg = document.getElementById('carouselEmpty');
  if (!emptyMsg) {
    emptyMsg = document.createElement('div');
    emptyMsg.id = 'carouselEmpty';
    emptyMsg.className = 'carousel-empty';
    emptyMsg.textContent = 'No se encontraron animes con ese nombre.';
    wrapper.parentNode.insertBefore(emptyMsg, wrapper.nextSibling);
  }

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function applySearch() {
    const q = normalize(searchInput.value);
    let visible = 0;

    cards.forEach(card => {
      const title = normalize(card.dataset.title || card.querySelector('h3')?.textContent || '');
      const id = normalize(card.dataset.id || '');
      const match = !q || title.includes(q) || id.includes(q);
      card.classList.toggle('search-hidden', !match);
      if (match) visible++;
    });

    if (searchClear) searchClear.hidden = !q;
    if (searchCount) {
      if (q) {
        searchCount.textContent = visible === 0
          ? 'Sin resultados'
          : visible === 1
            ? '1 anime encontrado'
            : visible + ' animes encontrados';
        searchCount.classList.add('has-filter');
      } else {
        searchCount.textContent = '';
        searchCount.classList.remove('has-filter');
      }
    }

    emptyMsg.classList.toggle('visible', visible === 0 && q.length > 0);

    // reset carousel position after filter
    currentX = 0;
    track.style.transform = 'translateX(0)';
    velX = 0;
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        applySearch();
        searchInput.blur();
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }

})();
