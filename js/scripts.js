// Доработка сайта

// Тестовая шапка

const headerTest = document.querySelector('.header-test');

if (headerTest) {
  let lastScrollY = window.pageYOffset;
  const threshold = 100;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY > lastScrollY && currentScrollY > threshold) {
      headerTest.classList.add('scroll-down');
    }
    if (currentScrollY === 0) {
      headerTest.classList.remove('scroll-down');
    }

    lastScrollY = currentScrollY;
  });
}


// Слайдер товара

const thumbsSwiper = new Swiper('.swiper-thumbs', {
  spaceBetween: 11,
  slidesPerView: 4,
  watchSlidesProgress: true,
  freeMode: false,
});

const mainSwiper = new Swiper('.swiper-main', {
  spaceBetween: 10,
  pagination: { el: '.swiper-pagination', clickable: true },
  thumbs: { swiper: thumbsSwiper },
});

window.productThumbsSwiper = thumbsSwiper;
window.productMainSwiper = mainSwiper;

  let lastUserInteractionAt = 0;
  const USER_INTERACTION_WINDOW = 900; 

  function markUserInteraction() {
    lastUserInteractionAt = (performance && performance.now) ? performance.now() : Date.now();
  }
  function wasRecentlyUserInitiated() {
    const now = (performance && performance.now) ? performance.now() : Date.now();
    return (now - lastUserInteractionAt) <= USER_INTERACTION_WINDOW;
  }

  const html = document.documentElement;
  const body = document.body;
  const modalGallery = document.getElementById('galleryModal');

  document.addEventListener('DOMContentLoaded', async function () {
    const swiperThumbsEl = document.querySelector(".swiper-thumbs");
    if (!swiperThumbsEl) return;

    const mainSlides = Array.from(document.querySelectorAll('.swiper-main .swiper-slide'));
    const thumbsWrapper = document.querySelector('.swiper-thumbs .swiper-wrapper');

    thumbsWrapper.innerHTML = '';

    function captureFrameFromVideoSrc(src, time = 0.05, timeout = 5000) {
      return new Promise((resolve, reject) => {
        if (!src) return reject(new Error('no video src'));
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.preload = 'metadata';
        vid.muted = true;
        vid.playsInline = true;
        vid.src = src;

        let settled = false;
        const cleanup = () => {
          try { vid.src = ''; } catch (e) {}
          vid.remove();
        };

        const onError = () => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error('video load error'));
        };

        const drawFrame = () => {
          if (settled) return;
          try {
            const w = vid.videoWidth;
            const h = vid.videoHeight;
            if (!w || !h) throw new Error('no video dimensions');
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(vid, 0, 0, w, h);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            settled = true;
            cleanup();
            resolve(dataURL);
          } catch (err) {
            settled = true;
            cleanup();
            reject(err);
          }
        };

        const onLoadedData = () => {
          try {
            const seekTo = Math.min(time, (vid.duration && vid.duration / 2) || time);
            vid.currentTime = seekTo;
          } catch (e) {
            drawFrame();
          }
        };
        const onSeeked = () => { drawFrame(); };

        const t = setTimeout(() => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error('timeout capturing frame'));
        }, timeout);

        vid.addEventListener('loadeddata', onLoadedData, { once: true });
        vid.addEventListener('seeked', onSeeked, { once: true });
        vid.addEventListener('error', onError, { once: true });

        vid.style.display = 'none';
        document.body.appendChild(vid);
      });
    }

    const thumbGenerationPromises = [];

    mainSlides.forEach((slide, index) => {
      const thumbSlide = document.createElement('div');
      thumbSlide.className = 'swiper-slide';

      const videoEl = slide.querySelector('video');
      const imgEl = slide.querySelector('img');

      if (videoEl) {
        const posterAttr = videoEl.getAttribute('poster');
        const videoSrc = videoEl.currentSrc || videoEl.src;

        thumbSlide.innerHTML = `
          <div class="thumb-media" aria-hidden="false">
            <img src="img/product/video-poster.jpg" alt="video thumb">
            <span class="thumb-play-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">
                <circle cx="32" cy="32" r="28" fill="rgba(0,0,0,0.56)"/>
                <polygon points="24,20 24,44 48,32" fill="#ffffff"/>
              </svg>
            </span>
          </div>
        `;
        thumbSlide.dataset.type = 'video';

        if (posterAttr) {
          const img = thumbSlide.querySelector('img');
          if (img) img.src = posterAttr;
        } else if (videoSrc) {
          const p = captureFrameFromVideoSrc(videoSrc, 0.05, 5000)
            .then(dataUrl => {
              const img = thumbSlide.querySelector('img');
              if (img) img.src = dataUrl;
            })
            .catch(err => {
              console.warn('Thumbnail generation failed for', videoSrc, err);
            });
          thumbGenerationPromises.push(p);
        }
      } else if (imgEl) {
        thumbSlide.innerHTML = `<div class="thumb-media"><img src="${imgEl.src}" alt=""></div>`;
      } else {
        thumbSlide.innerHTML = `<div class="thumb-media"><img src="img/product/placeholder.jpg" alt=""></div>`;
      }

      thumbsWrapper.appendChild(thumbSlide);
    });

    try {
      await Promise.race([
        Promise.all(thumbGenerationPromises),
        new Promise((res) => setTimeout(res, 3000))
      ]);
    } catch (e) {
      console.warn('Some thumbnails generation failed or timed out', e);
    }


    // Логика с переключением комплектации

    window.gotoMainImageByUrl = async function(urlOrArray, options = {}) {
      const { speed = 600, addIfMissing = true } = options;
      if (!window.productMainSwiper || !window.productThumbsSwiper) {
        console.warn('productMainSwiper or productThumbsSwiper not found yet');
        return false;
      }

      let url = Array.isArray(urlOrArray) ? (urlOrArray[0] || '') : (urlOrArray || '');
      if (!url) return false;

      function normalize(u){
        try {
          return u.split('?')[0].trim().toLowerCase();
        } catch (e) { return String(u).toLowerCase(); }
      }
      function fileName(u){
        const parts = normalize(u).split('/');
        return parts[parts.length-1] || '';
      }

      const targetFull = normalize(url);
      const targetName = fileName(url);

      const mainSwiper = window.productMainSwiper;
      const thumbsSwiper = window.productThumbsSwiper;

      const slideEls = Array.from(document.querySelectorAll('.swiper-main .swiper-slide'));

      let foundIndex = -1;
      for (let i = 0; i < slideEls.length; i++) {
        const s = slideEls[i];
        const img = s.querySelector('img');
        const video = s.querySelector('video');

        if (img && img.src) {
          const srcNorm = normalize(img.src);
          if (srcNorm === targetFull || srcNorm.includes(targetFull) || targetFull.includes(srcNorm) || srcNorm.endsWith(targetName) || targetName && srcNorm.includes(targetName)) {
            const idx = Array.from(mainSwiper.slides).indexOf(s);
            if (idx >= 0) { foundIndex = idx; break; }
          }
        }

        if (video) {
          const poster = video.getAttribute('poster') || '';
          const vsrc = video.currentSrc || video.src || '';
          const posterNorm = normalize(poster);
          const vsrcNorm = normalize(vsrc);
          if ((posterNorm && (posterNorm === targetFull || posterNorm.includes(targetName))) ||
              (vsrcNorm && (vsrcNorm === targetFull || vsrcNorm.includes(targetName)))) {
            const idx = Array.from(mainSwiper.slides).indexOf(s);
            if (idx >= 0) { foundIndex = idx; break; }
          }
        }
      }

      if (foundIndex >= 0) {
        try { if (typeof markUserInteraction === 'function') markUserInteraction(); } catch(e){}
        mainSwiper.slideTo(foundIndex, speed);
        try { thumbsSwiper.slideTo(foundIndex, Math.max(speed/2, 300)); } catch(e){}
        return true;
      }

      if (!addIfMissing) return false;

      try {
        const mainWrap = document.querySelector('.swiper-wrapper.main-images-swiper');
        const thumbsWrapper = document.querySelector('.swiper-thumbs .swiper-wrapper');
        const modalWrap = document.querySelector('#galleryModal .swiper-fullscreen .swiper-wrapper');

        const newMainSlide = document.createElement('div');
        newMainSlide.className = 'swiper-slide';
        newMainSlide.innerHTML = `<img src="${url}" alt="">`;
        if (mainWrap) {
          mainWrap.appendChild(newMainSlide);
        }

        const newThumb = document.createElement('div');
        newThumb.className = 'swiper-slide';
        newThumb.innerHTML = `<div class="thumb-media"><img src="${url}" alt=""></div>`;
        if (thumbsWrapper) thumbsWrapper.appendChild(newThumb);

        if (modalWrap) {
          const modalSlide = document.createElement('div');
          modalSlide.className = 'swiper-slide';
          const cloneImg = document.createElement('img');
          cloneImg.src = url;
          modalSlide.appendChild(cloneImg);

          const newIndex = (mainSwiper.slides && mainSwiper.slides.length) ? mainSwiper.slides.length : -1;

          const insertBeforeEl = modalWrap.children[newIndex] || null;
          if (insertBeforeEl) modalWrap.insertBefore(modalSlide, insertBeforeEl);
          else modalWrap.appendChild(modalSlide);
        }

        try { thumbsSwiper.update(); } catch(e) {}
        try { mainSwiper.update(); } catch(e) {}
        try { if (typeof fullscreenSwiper !== 'undefined' && fullscreenSwiper) fullscreenSwiper.update(); } catch(e) {}

        const newIndex = mainSwiper.slides.length - 1;

        try {
          const imgInNew = newMainSlide.querySelector('img') || newMainSlide;
          if (imgInNew) {
            imgInNew.style.cursor = 'pointer';
            imgInNew.addEventListener('click', (ev) => {
              ev.preventDefault();
              markUserInteraction();
              pauseAllVideosInDocument();
              openModal(newIndex);
            });
          }
        } catch(e) {}

        try { if (typeof markUserInteraction === 'function') markUserInteraction(); } catch(e){}
        mainSwiper.slideTo(newIndex, speed);
        try { thumbsSwiper.slideTo(newIndex, Math.max(speed/2, 300)); } catch(e){}
        return true;
      } catch (err) {
        console.error('Не удалось добавить/переключиться на новый слайд', err);
        return false;
      }
    };

    function pauseAllVideos() {
      document.querySelectorAll('.swiper-main video').forEach(v => {
        try { v.pause(); } catch (e) {}
      });
    }

    function ensureUnmuteButton(slideEl, videoEl) {
      let btn = slideEl.querySelector('.main-unmute-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'main-unmute-btn';
        btn.type = 'button';
        btn.textContent = 'Включить звук';
        slideEl.style.position = 'relative';
        slideEl.appendChild(btn);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            videoEl.muted = false;
            videoEl.play().catch(()=>{});
            btn.style.display = 'none';
          } catch (err) {}
        });
      }
      return btn;
    }

    mainSwiper.on('touchStart', function () { markUserInteraction(); });

    const thumbSlides = Array.from(thumbsWrapper.querySelectorAll('.swiper-slide'));
    thumbSlides.forEach((thumb, idx) => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        markUserInteraction();
        mainSwiper.slideTo(idx);
        const targetSlide = mainSlides[idx];
        const targetVideo = targetSlide ? targetSlide.querySelector('video') : null;
        if (targetVideo) {
          try {
            targetVideo.muted = false;
            targetVideo.play().catch(()=>{});
          } catch(e) {}
        }
      });
    });

    mainSlides.forEach((slide) => {
      const video = slide.querySelector('video');
      if (!video) return;

      if (getComputedStyle(slide).position === 'static') {
        slide.style.position = 'relative';
      }

      let pointerDown = false;
      let startX = 0;
      let startY = 0;
      const SWIPE_THRESHOLD = 30;

      const onPointerDown = (ev) => {
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        pointerDown = true;
        startX = ev.clientX;
        startY = ev.clientY;
        markUserInteraction();
        try { ev.target.setPointerCapture(ev.pointerId); } catch(e) {}
      };

      const onPointerMove = (ev) => {
        if (!pointerDown) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          pointerDown = false;
          try { ev.target.releasePointerCapture(ev.pointerId); } catch(e) {}
          pauseAllVideos();
          if (dx < 0) mainSwiper.slideNext();
          else mainSwiper.slidePrev();
        }
      };

      const onPointerUp = (ev) => {
        pointerDown = false;
        try { ev.target.releasePointerCapture(ev.pointerId); } catch(e) {}
      };

      video.addEventListener('pointerdown', onPointerDown, { passive: true });
      video.addEventListener('pointermove', onPointerMove, { passive: true });
      video.addEventListener('pointerup', onPointerUp, { passive: true });
      video.addEventListener('pointercancel', onPointerUp, { passive: true });
      video.addEventListener('click', () => { markUserInteraction(); });
    });

    mainSwiper.on('slideChangeTransitionEnd', () => {
      document.querySelectorAll('.main-unmute-btn').forEach(b => b.style.display = 'none');
      pauseAllVideos();

      const slideEl = mainSwiper.slides[mainSwiper.activeIndex];
      if (!slideEl) return;
      const video = slideEl.querySelector('video');
      if (!video) return;

      if (wasRecentlyUserInitiated()) {
        video.muted = false;
        video.play().then(()=>{}).catch(() => {
          video.muted = true;
          video.play().catch(()=>{});
          const btn = ensureUnmuteButton(slideEl, video);
          btn.style.display = 'inline-block';
        });
      } else {
        video.muted = true;
        video.play().catch(()=>{});
      }
    });

    setTimeout(() => mainSwiper.emit('slideChangeTransitionEnd'), 60);

    // Модальное окно для просмотра товара
    if (!modalGallery) return; 
    const mainWrap = document.querySelector('.swiper-wrapper.main-images-swiper');
    const modalWrap = modalGallery.querySelector('.swiper-fullscreen .swiper-wrapper');
    const closeBtn = modalGallery.querySelector('.modal-close');
    const overlay = modalGallery.querySelector('.fullscreen-overlay');

    modalWrap.innerHTML = '';

    function pauseAllVideosInDocument() {
      document.querySelectorAll('video').forEach(v => {
        try { v.pause(); } catch(e) {}
      });
    }

    function ensureModalUnmuteButton(slideEl, videoEl) {
      let btn = slideEl.querySelector('.main-unmute-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'main-unmute-btn';
        btn.type = 'button';
        btn.textContent = 'Включить звук';
        slideEl.appendChild(btn);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            videoEl.muted = false;
            videoEl.play().catch(()=>{});
            btn.style.display = 'none';
          } catch (err) {}
        });
      }
      return btn;
    }

    const modalSourceSlides = Array.from(mainWrap ? mainWrap.querySelectorAll('.swiper-slide') : []);
    modalSourceSlides.forEach((origSlide) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';

      const video = origSlide.querySelector('video');
      const img = origSlide.querySelector('img');

      if (video) {
        const v = document.createElement('video');
        v.className = 'modal-video';
        v.src = video.currentSrc || video.src;
        v.preload = 'metadata';
        v.playsInline = true;
        v.controls = true;
        v.setAttribute('playsinline', '');
        slide.appendChild(v);
      } else if (img) {
        const cloneImg = img.cloneNode(true);
        cloneImg.removeAttribute('width');
        cloneImg.removeAttribute('height');
        slide.appendChild(cloneImg);
      } else {
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        slide.appendChild(placeholder);
      }

      modalWrap.appendChild(slide);
    });

    let fullscreenSwiper = null;

    function initFullscreenSwiper() {
      if (fullscreenSwiper) return;

      fullscreenSwiper = new Swiper('.swiper-fullscreen', {
        slidesPerView: 1,
        centeredSlides: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        loop: false,
      });

      fullscreenSwiper.on('touchStart', () => { markUserInteraction(); });

      const nextBtn = modalGallery.querySelector('.swiper-button-next');
      const prevBtn = modalGallery.querySelector('.swiper-button-prev');
      [nextBtn, prevBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', () => { markUserInteraction(); });
      });

      const swiperEl = modalGallery.querySelector('.swiper-fullscreen');
      if (swiperEl) {
        swiperEl.addEventListener('pointerdown', (ev) => {
          if (ev.pointerType === 'mouse' && ev.button !== 0) return;
          markUserInteraction();
        }, { passive: true });
      }

      document.addEventListener('keydown', (ev) => {
        if (!modalGallery.classList.contains('open')) return;
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
          markUserInteraction();
        }
      });

      const modalVideoNodes = modalWrap.querySelectorAll('video.modal-video');
      modalVideoNodes.forEach((videoEl) => {
        let pointerDown = false;
        let startX = 0, startY = 0;
        const SWIPE_THRESHOLD = 30;

        const onPointerDown = (ev) => {
          if (ev.pointerType === 'mouse' && ev.button !== 0) return;
          pointerDown = true;
          startX = ev.clientX;
          startY = ev.clientY;
          markUserInteraction();
          try { ev.target.setPointerCapture(ev.pointerId); } catch(e) {}
        };
        const onPointerMove = (ev) => {
          if (!pointerDown) return;
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            pointerDown = false;
            try { ev.target.releasePointerCapture(ev.pointerId); } catch(e) {}
            if (dx < 0) fullscreenSwiper.slideNext();
            else fullscreenSwiper.slidePrev();
          }
        };
        const onPointerUp = (ev) => {
          pointerDown = false;
          try { ev.target.releasePointerCapture(ev.pointerId); } catch(e) {}
        };

        videoEl.addEventListener('pointerdown', onPointerDown, { passive: true });
        videoEl.addEventListener('pointermove', onPointerMove, { passive: true });
        videoEl.addEventListener('pointerup', onPointerUp, { passive: true });
        videoEl.addEventListener('pointercancel', onPointerUp, { passive: true });
        videoEl.addEventListener('click', () => { markUserInteraction(); });
      });

      fullscreenSwiper.on('slideChangeTransitionEnd', () => {
        modalWrap.querySelectorAll('.main-unmute-btn').forEach(b => b.style.display = 'none');
        modalWrap.querySelectorAll('video.modal-video').forEach(v => { try { v.pause(); } catch(e) {} });

        const activeIndex = fullscreenSwiper.activeIndex;
        const activeSlide = modalWrap.children[activeIndex];
        if (!activeSlide) return;
        const videoEl = activeSlide.querySelector('video.modal-video');
        if (!videoEl) return;

        if (wasRecentlyUserInitiated()) {
          videoEl.muted = false;
          videoEl.play().then(()=>{}).catch(() => {
            videoEl.muted = true;
            videoEl.play().catch(()=>{});
            const btn = ensureModalUnmuteButton(activeSlide, videoEl);
            btn.style.display = 'inline-block';
          });
        } else {
          videoEl.muted = true;
          videoEl.play().catch(()=>{});
        }
      });
    }

    function openModal(atIndex) {
      pauseAllVideosInDocument();
      modalGallery.classList.add('open');
      html.classList.add('no-scroll');
      body.classList.add('no-scroll');

      if (!fullscreenSwiper) initFullscreenSwiper();

      markUserInteraction();

      fullscreenSwiper.slideTo(atIndex, 0);

      try {
        const activeSlide = modalWrap.children[atIndex];
        if (!activeSlide) return;
        const videoEl = activeSlide.querySelector('video.modal-video');
        if (!videoEl) return;

        videoEl.muted = false;
        const playPromise = videoEl.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(() => {
            videoEl.muted = true;
            videoEl.play().catch(()=>{});
            const btn = ensureModalUnmuteButton(activeSlide, videoEl);
            btn.style.display = 'inline-block';
          });
        }
      } catch (e) {
      }
    }

    function closeModal() {
      modalGallery.classList.remove('open');
      modalGallery.classList.add('closing');

      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');

      modalWrap.querySelectorAll('video.modal-video').forEach(v => { try { v.pause(); } catch(e) {} });
      pauseAllVideosInDocument();

      modalGallery.addEventListener('transitionend', function onEnd(e) {
        if (e.propertyName === 'opacity') {
          modalGallery.classList.remove('closing');
          modalGallery.removeEventListener('transitionend', onEnd);
        }
      });
    }

    mainSlides.forEach((origSlide, idx) => {
      const clickTarget = origSlide.querySelector('img') || origSlide;
      if (!clickTarget) return;
      clickTarget.style.cursor = 'pointer';
      clickTarget.addEventListener('click', (e) => {
        e.preventDefault();
        markUserInteraction();
        openModal(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Просмотр изображений отзывов в модалке 
    const reviewImages = Array.from(document.querySelectorAll('.product-desc-card-review-images img'));

    if (reviewImages.length > 0) {
      const reviewStartIndex = modalWrap.children.length;

      reviewImages.forEach((origImg, i) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        const cloneImg = origImg.cloneNode(true);
        cloneImg.removeAttribute('width');
        cloneImg.removeAttribute('height');
        cloneImg.style.maxWidth = '100%';
        cloneImg.style.height = 'auto';
        cloneImg.style.display = 'block';
        cloneImg.style.margin = '0 auto';

        slide.appendChild(cloneImg);
        modalWrap.appendChild(slide);

        const modalIndex = reviewStartIndex + i;
        origImg.dataset.modalIndex = modalIndex;

        origImg.style.cursor = 'pointer';

        origImg.addEventListener('click', (ev) => {
          ev.preventDefault();
          markUserInteraction();
          pauseAllVideosInDocument();
          openModal(modalIndex);
        });
      });
    }
});

























// Добавить в избранное

function addToFavorite(productId) {
  console.log('Добавлен в избранное:', productId);
}

function deleteFavorite(productId) {
  console.log('Удалён из избранного:', productId);
}

document.addEventListener('click', function(event) {
  const btn = event.target.closest(
    '.add-to-favorites-btn, .add-to-favorite-related-products-btn, .favorite-btn'
  );

  if (!btn) return;

  event.preventDefault();
  event.stopPropagation();

  const container = btn.closest('[data-product-id]');
  if (!container) {
    console.warn('Кнопка без data-product-id:', btn);
    return;
  }
  const productId = container.dataset.productId;

  const isActive = btn.classList.toggle('active');

  btn.setAttribute('aria-pressed', String(isActive));

  if (isActive) {
    addToFavorite(productId);
    const icon = btn.querySelector('svg');
    if (icon) icon.classList.add('filled');
  } else {
    deleteFavorite(productId);
    const icon = btn.querySelector('svg');
    if (icon) icon.classList.remove('filled');
  }
});

const favoriteBtn = document.querySelector('.favorite-btn');

if (favoriteBtn) {
  favoriteBtn.addEventListener('click', function () {
    const icon = this.querySelector('.favorite-btn-icon');
    icon.classList.toggle('filled');
  });
}


// Выбрать комплектацию

function selectConfiguration() {
  const cards = document.querySelectorAll('.select-configuration-card');

  if (cards) {
    cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      console.log('Выбрана комплектация:', card.dataset.id);
    });
   });
  }
}

selectConfiguration();

// Раскрытие карточек "Описание товара"

const productDescCards = document.querySelectorAll('.product-desc-card');

if (productDescCards.length) {
  function smoothScrollTo(card) {
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetY = card.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
    if (window.innerWidth < 768) {
      window.scrollTo(0, targetY);
      return;
    }
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const duration = 500;
    let startTime = null;
    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(progress);
      window.scrollTo(0, startY + distance * eased);
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', () => {
    productDescCards.forEach(card => {
      const info = card.querySelector('.product-desc-card-info');
      info.style.maxHeight = card.classList.contains('open')
        ? info.scrollHeight + 'px'
        : null;
    });
  });

  productDescCards.forEach(card => {
    const btn = card.querySelector('.product-desc-card-open-btn');
    const clickArea = card.querySelector('.click-area');
    const info = card.querySelector('.product-desc-card-info');

    function toggleCard() {
      const isOpen = card.classList.contains('open');
      productDescCards.forEach(c => {
        c.classList.remove('open');
        c.querySelector('.product-desc-card-info').style.maxHeight = null;
      });
      if (!isOpen) {
        card.classList.add('open');
        info.style.maxHeight = info.scrollHeight + 'px';
        info.addEventListener('transitionend', function onEnd(e) {
          if (e.propertyName === 'max-height') {
            smoothScrollTo(card);
            info.removeEventListener('transitionend', onEnd);
          }
        });
      }
    }

    btn.addEventListener('click', toggleCard);
    clickArea.addEventListener('click', toggleCard);
  });
}

// Cкрытие кнопки читать весь отзыв

document.addEventListener("DOMContentLoaded", () => {
  const reviews = document.querySelectorAll(".product-desc-card-review-texts");

  if (!reviews.length) return;

  reviews.forEach(review => {
    const textEl = review.querySelector(".product-desc-card-review-text");
    const btn = review.querySelector(".product-desc-card-review-more-btn");

    if (!textEl || !btn) return;

    const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight);
    const maxVisibleHeight = lineHeight * 3; 

    if (textEl.scrollHeight <= maxVisibleHeight) {
      btn.style.display = "none";
    }
  });
});

// Раскрытие отзывов побольше

const productDescCardReviewTexts = document.querySelectorAll('.product-desc-card-review-texts');

if (productDescCardReviewTexts) {
  productDescCardReviewTexts.forEach(container => {
    const textEl = container.querySelector('.product-desc-card-review-text');
    const btn = container.querySelector('.product-desc-card-review-more-btn');
    const label = btn.querySelector('.btn-label');
    const cardInfo = container.closest('.product-desc-card-info');

    const ro = new ResizeObserver(() => {
      if (cardInfo) {
        cardInfo.style.maxHeight = cardInfo.scrollHeight + 'px';
      }
    });
    ro.observe(textEl);

    btn.addEventListener('click', () => {
      const isExpanding = !textEl.classList.contains('expanded');
      btn.classList.toggle('open', isExpanding);

      label.textContent = isExpanding ? 'Скрыть' : 'Читать весь отзыв';

      if (isExpanding) {
        textEl.classList.add('expanded');
        textEl.style.maxHeight = textEl.scrollHeight + 'px';
        setTimeout(() => textEl.style.maxHeight = 'none', 0);
      } else {
        const fullH = textEl.scrollHeight;
        const lineH = parseFloat(getComputedStyle(textEl).lineHeight);
        const collapsedH = lineH * 3;
        textEl.style.maxHeight = fullH + 'px';
        void textEl.offsetHeight;
        textEl.style.maxHeight = collapsedH + 'px';
        setTimeout(() => textEl.classList.remove('expanded'), 0);
      }
    });
  });
}

// Функция переключения картинок при наведении в секции "С этим товаром покупают"

function initInteractiveCards() {
  document.querySelectorAll('.image-hover-card').forEach(card => {
    const frames = Array.from(card.querySelectorAll('.image-container img'));

    const segments = Array.from(card.querySelectorAll('.progress-bar .segment'));
    const count = frames.length;

    if (count === 0) return;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      let idx = Math.floor(relX * count);
      idx = Math.max(0, Math.min(count - 1, idx));

      frames.forEach((img, i) => {
        img.style.opacity = (i === idx ? '1' : '0');
      });

      segments.forEach((seg, i) => {
        seg.classList.toggle('active', i === idx);
      });
    });

    card.addEventListener('mouseleave', () => {
      frames.forEach((img, i) => {
        img.style.opacity = (i === 0 ? '1' : '0');
      });
      segments.forEach((seg, i) => {
        seg.classList.toggle('active', i === 0);
      });
    });
  });
}

initInteractiveCards();

function initRelatedProductsSwiper() {
  const relatedProductsSwiper = document.querySelector('.related-products-swiper');

  if (relatedProductsSwiper) {
    const swiper = new Swiper('.related-products-swiper', {
      slidesPerView: 3,
      spaceBetween: 40,
      slidesPerGroup: 1,
      loop: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1.05,
          spaceBetween: 10
        },
        549: { 
          slidesPerView: 1.5, 
          spaceBetween: 10 
        },
        769: { 
          slidesPerView: 2.1, 
          spaceBetween: 10
        },
        801: { 
          slidesPerView: 2.1, 
          spaceBetween: 20 
        },
        1141: { 
          slidesPerView: 3, 
          spaceBetween: 40 
        },
        1141: { 
          slidesPerView: 3, 
          spaceBetween: 40 
        },
        1751: { 
          slidesPerView: 3, 
          spaceBetween: 40 
        },
      },
    });
  }
}

initRelatedProductsSwiper();


function getDigits(str) {
  return str.replace(/\D/g, '');
}

// Валдиация номера телефона
function validatePhoneNumber(phone) {
  const digits = getDigits(phone);
  if (digits.startsWith('7') || digits.startsWith('8')) {
    return digits.length === 11;
  }
  return digits.length === 10;
}

const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
  let value = getDigits(phoneInput.value);

  if (e.inputType === 'deleteContentBackward' && value.length <= 1) {
    phoneInput.value = '';
    return;
  }

  let prefix = '';
  if (value.startsWith('8')) {
    prefix = '8 ';
    value = value.slice(1);
  } else if (value.startsWith('7')) {
    prefix = '+7 ';
    value = value.slice(1);
  }

  value = value.slice(0, 10);

  let formatted = '';
  if (value.length > 0) formatted += `(${value.slice(0, 3)}`;
  if (value.length >= 4) formatted += `) ${value.slice(3, 6)}`;
  if (value.length >= 7) formatted += `-${value.slice(6, 8)}`;
  if (value.length >= 9) formatted += `-${value.slice(8, 10)}`;

  const cursorPos = phoneInput.selectionStart;
  const oldLen = phoneInput.value.length;

  phoneInput.value = prefix + formatted;

  const newLen = phoneInput.value.length;
  phoneInput.setSelectionRange(
    cursorPos + (newLen - oldLen),
    cursorPos + (newLen - oldLen)
  );
});
}

// Отправка файла в форме "Оставить заявку"
function sendFile() {
  const input   = document.getElementById('file-input');

  if (input) {
    const formats = ['jpg', 'jpeg', 'png', 'webp'];
    const btn     = document.getElementById('file-btn');
    const infoWr  = document.getElementById('file-info');
    const nameEl  = infoWr.querySelector('.file-name');
    const remove  = document.getElementById('file-remove');
    const wrapper = document.querySelector('.file-upload-wrapper');

    btn.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
      if (!input.files.length) return;

      const file = input.files[0];
      const ext  = file.name.split('.').pop().toLowerCase();

      if (!formats.includes(ext)) {
        alert('Неподдерживаемый формат: ' + ext);
        input.value = '';
        return;
      }

      const base = file.name.slice(0, 5);
      nameEl.textContent = `${base}.${ext}`;

      wrapper.classList.add('has-file');
      infoWr.style.display = 'flex';
    });

    remove.addEventListener('click', () => {
      input.value = '';
      wrapper.classList.remove('has-file');
      infoWr.style.display = 'none';
      nameEl.textContent = '';
    });
  }
}

// Отправка данных (заглушка)
function sendFormReview(data) {
  console.log('Отзыв:', data);
  clearReviewForm();
}

// Сброс формы и ошибок
function clearReviewForm() {
  const form = document.querySelector('.send-review-form');
  if (!form) return;

  form.reset();

  const stars = form.querySelectorAll('.send-review-stars svg');

  stars.forEach(star => star.classList.remove('filled'));

  stars.forEach(star => star.classList.add('filled'));

  currentRating = 5;

  form.querySelectorAll('.error').forEach(el =>
    el.classList.remove('error')
  );

  const infoWr  = document.getElementById('file-info');
  const wrapper = document.querySelector('.file-upload-wrapper');
  const nameEl  = wrapper.querySelector('.file-name');

  if (infoWr)  infoWr.style.display = 'none';
  if (wrapper) wrapper.classList.remove('has-file');
  if (nameEl)  nameEl.textContent = '';
}

// Валидация формы
function ValidateReviewForm() {
  const form = document.querySelector('.send-review-form');
  if (!form) return;

  // Рейтинг
  const stars            = form.querySelectorAll('.send-review-stars svg');
  let currentRating      = 5;
  const setFill = rating => {
    stars.forEach(star => {
      star.classList.toggle('filled', parseInt(star.dataset.value, 10) <= rating);
    });
  };

  setFill(currentRating);

  stars.forEach(star => {
    const val = parseInt(star.dataset.value, 10);
    star.addEventListener('mouseover', () => setFill(val));
    star.addEventListener('mouseout',  () => setFill(currentRating));
    star.addEventListener('click',    () => {
      currentRating = val;
      setFill(currentRating);
    });
  });

  // Поля
  const nameField        = form.querySelector('input[type="text"]');
  const phoneField       = form.querySelector('input[type="tel"]');
  const phoneError       = form.querySelector('.phone-error');
  const reviewField      = form.querySelector('textarea');
  const politicsWrapper  = form.querySelector('.accept-politics');
  const politicsCheckbox = politicsWrapper.querySelector('input[type="checkbox"]');
  let reviewBtnTimeout = null;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    let isValid = true;

    // Имя
    if (!nameField.value.trim()) {
      nameField.classList.add('error');
      isValid = false;
    } else {
      nameField.classList.remove('error');
    }

    // Телефон (если что-то введено)
    const phoneVal = phoneField.value.trim();
    if (phoneVal) {
      if (!validatePhoneNumber(phoneVal)) {
        phoneField.classList.add('error');
        phoneError.classList.add('show');
        isValid = false;
      } else {
        phoneField.classList.remove('error');
        phoneError.classList.remove('show');
      }
    } else {
      phoneField.classList.remove('error');
      phoneError.classList.remove('show');
    }

    // Отзыв
    if (!reviewField.value.trim()) {
      reviewField.classList.add('error');
      isValid = false;
    } else {
      reviewField.classList.remove('error');
    }

    // Политика
    if (!politicsCheckbox.checked) {
      politicsWrapper.classList.add('error');
      isValid = false;
    } else {
      politicsWrapper.classList.remove('error');
    }

    if (!isValid) return;

    // Сбор данных
    const formData = {
      name:    nameField.value.trim(),
      phone:   phoneVal || null,
      review:  reviewField.value.trim(),
      rating:  currentRating,
      accept:  politicsCheckbox.checked,
      file:    document.getElementById('file-input').files[0]?.name || null
    };

    const btn = form.querySelector('.send-review-btn');
    if (!btn) {
      console.warn('Кнопка отправки не найдена');
      sendFormReview(formData);
      return;
    }

    if (!btn.querySelector('.btn-label.default')) {
      const orig = btn.textContent.trim() || 'Отправить';
      btn.innerHTML = `<span class="btn-label default">${orig}</span><span class="btn-label sent">Ваш отзыв отправлен</span>`;
    }

    if (btn.classList.contains('sent')) {
      console.log('Кнопка уже в состоянии sent — игнорируем');
      return;
    }

    console.log('Switch to sent state');
    btn.classList.add('sent');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');

    sendFormReview(formData);

    if (reviewBtnTimeout) {
      clearTimeout(reviewBtnTimeout);
    }

    reviewBtnTimeout = setTimeout(() => {
      console.log('Reverting button to normal state');
      btn.classList.remove('sent');
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
      reviewBtnTimeout = null;
    }, 5000);
  });

  // Сброс ошибок при вводе
  nameField.addEventListener('input', () => {
    if (nameField.classList.contains('error') && nameField.value.trim()) {
      nameField.classList.remove('error');
    }
  });
  phoneField.addEventListener('input', () => {
    if (phoneField.classList.contains('error')) {
      if (validatePhoneNumber(phoneField.value) || !phoneField.value.trim()) {
        phoneField.classList.remove('error');
        phoneError.classList.remove('show');
      }
    }
  });
  reviewField.addEventListener('input', () => {
    if (reviewField.classList.contains('error') && reviewField.value.trim()) {
      reviewField.classList.remove('error');
    }
  });
  politicsCheckbox.addEventListener('change', () => {
    if (politicsCheckbox.checked) {
      politicsWrapper.classList.remove('error');
    }
  });
}

sendFile();
ValidateReviewForm();















// Добавление товара в корзину

function addToCart(isAdded, quantity) {
  const result = { isAdded, quantity };
  console.log(result);
  return result;
}

const addButtons    = document.querySelectorAll('.js-add-btn');
const qtySelectors  = document.querySelectorAll('.js-qty-selector');
const minusButtons  = document.querySelectorAll('.js-minus');
const plusButtons   = document.querySelectorAll('.js-plus');
const qtyValues     = document.querySelectorAll('.js-qty-value');
let isAdding = false;

let currentCount = 1;

function showSelectors() {
  addButtons.forEach(btn => btn.style.display = 'none');
  qtySelectors.forEach(sel => {
    sel.style.display = 'inline-flex';
    setTimeout(() => sel.classList.add('show'), 10);
  });
}

function hideSelectors() {
  qtySelectors.forEach(sel => sel.classList.remove('show'));
  setTimeout(() => {
    qtySelectors.forEach(sel => sel.style.display = 'none');
    addButtons.forEach(btn => btn.style.display = 'inline-block');
  }, 300);
}

function renderCount() {
  qtyValues.forEach(val => val.textContent = currentCount);
}

function isOutOfStock(el) {
  const container = el.closest('.js-item-buttons');
  if (!container) return false;
  const addBtn = container.querySelector('.js-add-btn');
  return !!(addBtn && addBtn.classList.contains('order-btn-dissabled'));
}

function isElementVisible(el) {
  if (!el) return false;
  if (!el.getClientRects().length) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
  return true;
}

let lastQtyChangeTime = 0;
const QTY_DEBOUNCE_MS = 200; 

addButtons.forEach(btn => {
  if (btn.classList.contains('order-btn-dissabled')) {
    try {
      btn.disabled = true;
    } catch (e) {}
    btn.setAttribute('aria-disabled', 'true');
  }
});

addButtons.forEach(btn =>
  btn.addEventListener('click', function handler(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const clicked = e.currentTarget;
    if (isOutOfStock(clicked)) return;

    showSelectors();
    currentCount = 1;
    renderCount();
    addToCart(true, currentCount);
  })
);


minusButtons.forEach(btn =>
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (!isElementVisible(btn)) return;
    if (isOutOfStock(btn)) return;

    const now = Date.now();
    if (now - lastQtyChangeTime < QTY_DEBOUNCE_MS) return;
    lastQtyChangeTime = now;

    if (currentCount <= 1) {
      addToCart(false, 0);
      hideSelectors();
      currentCount = 1;
    } else {
      currentCount--;
      addToCart(true, currentCount);
    }
    renderCount();
  })
);

plusButtons.forEach(btn =>
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (!isElementVisible(btn)) return;
    if (isOutOfStock(btn)) return;

    const now = Date.now();
    if (now - lastQtyChangeTime < QTY_DEBOUNCE_MS) return;
    lastQtyChangeTime = now;

    currentCount++;
    renderCount();
    addToCart(true, currentCount);
  })
);


// Скрипты для корзины

function removeFromCart(productId) {
  console.log(`Удаляем товар с ID = ${productId}`);
}
function restoreToCart(productId) {
  console.log(`Восстанавливаем товар с ID = ${productId}`);
}

function editCart(itemId, quantity) {
  console.log(`CartId ${itemId}: count = ${quantity}`);
}

// Анимации
function fadeOut(el, duration = 400, callback) {
  el.style.transition = `opacity ${duration}ms`;
  el.style.opacity = 0;
  el.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'opacity') {
      el.style.display = 'none';
      el.removeEventListener('transitionend', handler);
      callback && callback();
    }
  });
}

function fadeIn(el, duration = 400, callback) {
  el.style.display = '';
  el.style.transition = `opacity ${duration}ms`;
  el.style.opacity = 0;
  requestAnimationFrame(() => el.style.opacity = 1);
    el.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity') {
        el.removeEventListener('transitionend', handler);
        callback && callback();
      }
    });
}

// Удаление товара в корзине
document.addEventListener('DOMContentLoaded', () => {
  const bannerTemplate = document.getElementById('remove-banner-template')?.content;
  const cartContainer = document.querySelector('.cart-container');
  const clearBtn = document.getElementById('clear-cart-btn');
  const selectAllCheckbox = document.getElementById('select-all');

  if (!bannerTemplate || !cartContainer || !clearBtn || !selectAllCheckbox) return;

  function clearErrorHighlighting() {
  cartContainer.querySelectorAll('.custom-checkbox.error').forEach(el => {
    el.classList.remove('error');
  });
}

  cartContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-checkbox') || e.target.id === 'select-all') {
      clearErrorHighlighting();
    }
  });

  clearBtn.addEventListener('click', () => {
    const allItems = Array.from(cartContainer.querySelectorAll('.cart-item')).filter(item => !item.dataset.deleted);
  const selectedCheckboxes = allItems
    .map(item => ({
      item,
      checkbox: item.querySelector('.item-checkbox')
    }))
    .filter(({ checkbox }) => checkbox && checkbox.checked);

  const selectAllChecked = selectAllCheckbox.checked;

  if (!selectAllChecked && selectedCheckboxes.length === 0) {
  allItems.forEach(item => {
    const wrapper = item.querySelector('.custom-checkbox');
    if (wrapper) wrapper.classList.add('error');
  });

  const selectAllWrapper = document.querySelector('.cart-choice-all-button .custom-checkbox');
  if (selectAllWrapper) {
    selectAllWrapper.classList.add('error');
  }

  return;
}

    const itemsToDelete = selectAllChecked
      ? allItems
      : selectedCheckboxes.map(({ item }) => item);

    itemsToDelete.forEach(item => {
      if (item.dataset.deleted) return;

      item.dataset.deleted = "true";
      const productId = item.dataset.itemId;
      removeFromCart(productId);

      const title = item.querySelector('.cart-item-name').textContent.trim();
      const clone = bannerTemplate.cloneNode(true);
      const bannerEl = clone.querySelector('.cart-item-remove-banner');
      bannerEl.querySelector('span').textContent = `«${title}»`;

      fadeOut(item, 400, () => {
        item.insertAdjacentElement('afterend', bannerEl);
        fadeIn(bannerEl, 400);
      });
    });

    selectAllCheckbox.checked = false;
  });

  cartContainer.addEventListener('click', e => {
    if (e.target.closest('.delete-cart-item-btn')) {
      const item = e.target.closest('.cart-item');
      if (!item || item.dataset.deleted) return;

      item.dataset.deleted = "true";
      const productId = item.dataset.itemId;
      removeFromCart(productId);

      const title = item.querySelector('.cart-item-name').textContent.trim();
      const clone = bannerTemplate.cloneNode(true);
      const bannerEl = clone.querySelector('.cart-item-remove-banner');
      bannerEl.querySelector('span').textContent = `«${title}»`;

      fadeOut(item, 400, () => {
        item.insertAdjacentElement('afterend', bannerEl);
        fadeIn(bannerEl, 400);
      });
    }

    // Восстановить товар
    if (e.target.closest('.recover-item-btn')) {
      const banner = e.target.closest('.cart-item-remove-banner');
      const item = banner.previousElementSibling;
      if (!item) return;

      delete item.dataset.deleted;
      const productId = item.dataset.itemId;
      restoreToCart(productId);

      fadeOut(banner, 400, () => {
        banner.remove();
        fadeIn(item, 400);
      });
    }

    // Скрыть баннер
    if (e.target.closest('.hide-banner-item-btn')) {
      const banner = e.target.closest('.cart-item-remove-banner');
      fadeOut(banner, 400, () => banner.remove());
    }
  });

  // Изменение количества
  document.querySelectorAll('.cart-item').forEach(cartItem => {
    const itemId = cartItem.getAttribute('data-item-id');
    const minusBtn = cartItem.querySelector('.quantity-btn-cart-minus');
    const plusBtn = cartItem.querySelector('.quantity-btn-cart-plus');
    const valueEl = cartItem.querySelector('.quantity-value');

    let quantity = parseInt(valueEl.textContent, 10) || 1;

    minusBtn.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        valueEl.textContent = quantity;
        editCart(itemId, quantity);
      }
    });

    plusBtn.addEventListener('click', () => {
      quantity++;
      valueEl.textContent = quantity;
      editCart(itemId, quantity);
    });
  });
});



// Выбор количества товара добавленного в корзину

function setupAddToCart(container) {
  const addBtn      = container.querySelector('.add-to-cart-btn');
  const qtySelector = container.querySelector('.item-quantity-selector');
  const minusBtn    = qtySelector.querySelector('.minus');
  const plusBtn     = qtySelector.querySelector('.plus');
  const valueEl     = qtySelector.querySelector('.item-quantity-value');
  let currentCount  = parseInt(valueEl.textContent, 10) || 1;

  addBtn.addEventListener('click', () => {
    addBtn.style.display      = 'none';
    qtySelector.style.display = 'inline-flex';
    setTimeout(() => qtySelector.classList.add('show'), 10);
    addToCart(true, currentCount);
  });

  function reset() {
    qtySelector.classList.remove('show');
    setTimeout(() => {
      qtySelector.style.display = 'none';
      addBtn.style.display      = 'inline-block';
      addToCart(false, 0);
      currentCount = 1;
      valueEl.textContent = currentCount;
    }, 300);
  }

  minusBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (currentCount === 1) {
      reset();
    } else {
      currentCount--;
      valueEl.textContent = currentCount;
      addToCart(true, currentCount);
    }
  });

  plusBtn.addEventListener('click', e => {
    e.stopPropagation();
    currentCount++;
    valueEl.textContent = currentCount;
    addToCart(true, currentCount);
  });
}

document.querySelectorAll('.item-buttons').forEach(container => {
  if (container.querySelector('.add-to-cart-btn')
   && container.querySelector('.item-quantity-selector')) {
    setupAddToCart(container);
  }
});


// Регулировка количества товара в корзине

function setupCartQuantity() {
  const cart = document.querySelector('.cart');

  if (cart) {
    document.querySelectorAll('.quantity-selector').forEach(selector => {
      const minusBtn = selector.querySelector('.minus');
      const plusBtn  = selector.querySelector('.plus');
      const valueEl  = selector.querySelector('.quantity-value');
      let count = parseInt(valueEl.textContent, 10) || 1;

      function update(newCount) {
        count = newCount;
        valueEl.textContent = count;
      }

      minusBtn.addEventListener('click', e => {
        e.preventDefault();
        if (count > 1) {
          update(count - 1);
        } 
      });

      plusBtn.addEventListener('click', e => {
        e.preventDefault();
        update(count + 1);
      });
    });
  }
}

setupCartQuantity();


// Промокод

const promo = document.querySelector('.promo-code');
let promoValid = false;

if (promo) {
  const input    = promo.querySelector('input');
  const btnApply = promo.querySelector('.promo-code-btn');
  const btnClear = promo.querySelector('.promo-code-clear');
  const errorEl  = document.querySelector('.promo-code-error');

  function updateButtonVisibility() {
    const hasText = input.value.trim().length > 0;
    btnApply.classList.toggle('visible', hasText);
    if (!hasText) {
      btnClear.classList.remove('visible');
      hideError();
    }
  }

  input.addEventListener('input', updateButtonVisibility);

  btnApply.addEventListener('click', (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (!code) return;

    btnApply.classList.remove('visible');
    btnClear.classList.add('visible');

    const isValid = checkPromoCode(code);
    promoValid = isValid;

    if (!isValid) {
      showError("Промокод не найден");
    } else {
      hideError();
      console.log("Промокод принят:", code);
    }
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    btnClear.classList.remove('visible');
    btnApply.classList.remove('visible');
    hideError();
    input.focus();
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    errorEl.style.maxHeight = `${errorEl.scrollHeight}px`;
  }

  function hideError() {
    errorEl.classList.remove('visible');
    errorEl.style.maxHeight = '0';
  }

  // Для бекенда
  function checkPromoCode(code) {
    return code === 'ПРОМОКОД10';
  }
}

// Выбрать всё

const btnSelectAll = document.querySelector('.cart-choice-all-button');

if (btnSelectAll) {
  const selectAll = document.getElementById('select-all');
  const items = document.querySelectorAll('.item-checkbox');

  selectAll.addEventListener('change', () => {
    items.forEach(cb => cb.checked = selectAll.checked);
  });

  items.forEach(cb => {
    cb.addEventListener('change', () => {
      const allChecked = Array.from(items).every(i => i.checked);
      selectAll.checked = allChecked;
    });
  });
}

// Описание способа доставки

const deliveryMethodsText = document.querySelector('.delivery-methods-text');

if (deliveryMethodsText) {
  const radios = document.querySelectorAll('input[name="delivery-method"]');
  const contents = {
    self: document.querySelector('.delivery-content-self'),
    delivery: document.querySelector('.delivery-content-delivery')
  };
  const addressBlock = document.querySelector('.delivery-address');

  function updateDeliveryContent() {
    const chosen = document.querySelector('input[name="delivery-method"]:checked').value;

    Object.values(contents).forEach(el => el.classList.remove('active'));
    contents[chosen].classList.add('active');

    // Если выбран способ самовывоз — скрываем блок с адресом
    if (chosen === 'self') {
      addressBlock.style.maxHeight = `${addressBlock.scrollHeight}px`; 

      requestAnimationFrame(() => {
        addressBlock.style.maxHeight = '0';
        addressBlock.classList.remove('visible');
      });
    } else {
      addressBlock.classList.add('visible');
      const height = addressBlock.scrollHeight;
      addressBlock.style.maxHeight = '0';
      requestAnimationFrame(() => {
        addressBlock.style.maxHeight = `${height}px`;
      });
    }
  }

  addressBlock.addEventListener('transitionend', e => {
    if (e.propertyName === 'max-height' && addressBlock.classList.contains('visible')) {
      addressBlock.style.maxHeight = 'none';
    }
  });

  updateDeliveryContent();

  radios.forEach(radio => radio.addEventListener('change', updateDeliveryContent));
}


// Форма для оформления заказа

function sendOrderForm(data) {
  console.log('Данные заказа:', data);

  const form = document.querySelector('.cart-form');
  if (form) form.reset();
}

function validateOrderForm() {
  const form = document.querySelector('.cart-form');
  if (!form) return;

  const inputs         = form.querySelectorAll('.cart-form-input');
  const nameField      = inputs[0];
  const phoneField     = inputs[1];
  const emailField     = inputs[2];
  const cityField      = inputs[3];
  const addressField   = inputs[4];
  const commentField   = inputs[5];
  const phoneError     = form.querySelector('.phone-error');
  const acceptWrapper  = form.querySelector('.accept-politics');
  const acceptCheckbox = acceptWrapper.querySelector('input[type="checkbox"]');
  const promoInput     = document.querySelector('.promo-code input');

  phoneField.addEventListener('input', () => {
    const raw = phoneField.value.trim();
    if (
      phoneField.classList.contains('error') &&
      (validatePhoneNumber(raw) || raw === '')
    ) {
      phoneField.classList.remove('error');
      phoneError.classList.remove('show');
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    // сброс всех прошлых ошибок
    inputs.forEach(i => i.classList.remove('error'));
    acceptWrapper.classList.remove('error');
    phoneError.classList.remove('show');

    // имя
    if (!nameField.value.trim()) {
      nameField.classList.add('error');
      isValid = false;
    }

    // телефон
    const rawPhone = phoneField.value.trim();
    if (!rawPhone) {
      phoneField.classList.add('error');
      isValid = false;
    } else if (!validatePhoneNumber(rawPhone)) {
      phoneField.classList.add('error');
      phoneError.classList.add('show');
      isValid = false;
    }

    // email
    if (!emailField.value.trim()) {
      emailField.classList.add('error');
      isValid = false;
    }

    // чекбокс соглашения
    if (!acceptCheckbox.checked) {
      acceptWrapper.classList.add('error');
      isValid = false;
    }

    // если доставка проверяем адрес
    const deliveryMethod = form.querySelector('input[name="delivery-method"]:checked')?.value;
    if (deliveryMethod === 'delivery') {
      if (!addressField.value.trim()) {
        addressField.classList.add('error');
        isValid = false;
      }
    }

    if (!isValid) return;

    const data = {
      name:           nameField.value.trim(),
      phone:          rawPhone,
      email:          emailField.value.trim(),
      person:         form.querySelector('input[name="person-type"]:checked')?.value,
      deliveryMethod: deliveryMethod,
      city:           deliveryMethod === 'delivery' ? cityField.value.trim() : null,
      address:        deliveryMethod === 'delivery' ? addressField.value.trim() : null,
      comment:        commentField.value.trim(),
      promo:          promoValid ? promoInput.value.trim() : null,
      accept:         acceptCheckbox.checked
    };
    sendOrderForm(data);
    clearOrderForm();
  });

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('error') && input.value.trim()) {
        input.classList.remove('error');
      }
    });
  });
  acceptCheckbox.addEventListener('change', () => {
    if (acceptCheckbox.checked) {
      acceptWrapper.classList.remove('error');
    }
  });
}

function clearOrderForm() {
  const form = document.querySelector('.cart-form');
  if (!form) return;

  form.reset();

  form.querySelectorAll('.cart-form-input').forEach(input => input.classList.remove('error'));
  const acceptWrapper = form.querySelector('.accept-politics');
  if (acceptWrapper) acceptWrapper.classList.remove('error');

  // Очистка промокода
  const promoInput = document.querySelector('.promo-code input');
  if (promoInput) {
    promoInput.value = '';
    const promoBtnClear = document.querySelector('.promo-code-clear');
    const promoBtnApply = document.querySelector('.promo-code-btn');
    const promoError = document.querySelector('.promo-code-error');
    promoBtnClear?.classList.remove('visible');
    promoBtnApply?.classList.remove('visible');
    promoError?.classList.remove('visible');
    promoError.style.maxHeight = '0';
  }
}

validateOrderForm();

// Переход при нажатии на рейтинг товара к якорной ссылке отзывов

document.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#reviews') {
    setTimeout(() => openCardAndScroll('#reviews'), 100);
  }

  document.querySelectorAll('a[href="#reviews"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      history.pushState(null, '', '#reviews');
      openCardAndScroll('#reviews');
    });
  });

  window.addEventListener('hashchange', () => {
    if (location.hash === '#reviews') {
      openCardAndScroll('#reviews');
    }
  });
});

function smoothScrollTo(element, duration = 600) {
  const startY = window.pageYOffset;
  const endY = element.getBoundingClientRect().top + startY;
  const diff = endY - startY;
  let start;

  function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const t = Math.min(time / duration, 1);
    const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
    window.scrollTo(0, startY + diff * eased);
    if (time < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function openCardAndScroll(id) {
  const head = document.querySelector(id);
  const card = head && head.closest('.product-desc-card');
  if (!card) return;

  document.querySelectorAll('.product-desc-card.open').forEach(openCard => {
    if (openCard !== card) {
      openCard.classList.remove('open');
      const info = openCard.querySelector('.product-desc-card-info');
      if (info) info.style.maxHeight = null;
    }
  });

  const info = card.querySelector('.product-desc-card-info');

  if (card.classList.contains('open')) {
    smoothScrollTo(card, 800);
    return;
  }

  card.classList.add('open');
  info.style.maxHeight = info.scrollHeight + 'px';

  const onTransitionEnd = e => {
    if (e.propertyName === 'max-height') {
      smoothScrollTo(card, 800);
      info.removeEventListener('transitionend', onTransitionEnd);
    }
  };
  info.addEventListener('transitionend', onTransitionEnd);
}



// Появление нижнего баннера с ценой при скролле

document.addEventListener('DOMContentLoaded', () => {
  const buyButtonsBlock = document.querySelector('.js-item-buttons');
  const relatedSection  = document.querySelector('.js-related-products');
  const banner          = document.querySelector('.fixed-product-info');
  const footer          = document.querySelector('footer');

  if (!buyButtonsBlock || !relatedSection || !banner || !footer) return;

  let isBuyButtonsVisible = true;
  let isRelatedVisible = false;
  let isFooterVisible = false;

  const updateBannerVisibility = () => {
    if (!isBuyButtonsVisible && !isRelatedVisible && !isFooterVisible) {
      banner.classList.add('visible');
    } else {
      banner.classList.remove('visible');
    }
  };

  const buyButtonsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isBuyButtonsVisible = entry.isIntersecting;
      updateBannerVisibility();
    });
  }, { threshold: 0 });

  const relatedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isRelatedVisible = entry.isIntersecting;
      updateBannerVisibility();
    });
  }, {
    root: null,
    rootMargin: `0px 0px -${banner.offsetHeight}px 0px`,
    threshold: 0,
  });

  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isFooterVisible = entry.isIntersecting;
      updateBannerVisibility();
    });
  }, {
    root: null,
    rootMargin: `0px 0px -${banner.offsetHeight}px 0px`,
    threshold: 0,
  });

  buyButtonsObserver.observe(buyButtonsBlock);
  relatedObserver.observe(relatedSection);
  footerObserver.observe(footer);
});


// Предотвращаем переход по ссылке товара, который не в наличии

document.addEventListener('click', function(e) {
  const target = e.target.closest('.order-btn-dissabled');

  if (target) {
    e.preventDefault(); 
    e.stopPropagation(); 
  }
});