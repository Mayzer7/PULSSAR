// Доработка сайта

const swiperThumbs = document.querySelector(".swiper-thumbs");

if (swiperThumbs) {
    const mainSlides = document.querySelectorAll('.swiper-main .swiper-slide');
    const thumbsWrapper = document.querySelector('.swiper-thumbs .swiper-wrapper');

    mainSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.remove('swiper-slide-active', 'some-other-class');
        thumbsWrapper.appendChild(clone);
    });

    const thumbsSwiper = new Swiper('.swiper-thumbs', {
        spaceBetween: 11,
        slidesPerView: 4,
        watchSlidesProgress: true,
        freeMode: false,
        
    });

    const mainSwiper = new Swiper('.swiper-main', {
        spaceBetween: 10,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        thumbs: {
            swiper: thumbsSwiper,
        },
    });
}

// Добавить в избранное

function addToFavorite(productId) {
  console.log('Добавлен в избранное:', productId);
}

function deleteFavorite(productId) {
  console.log('Удалён из избранного:', productId);
}

function initFavoriteButtons() {
  const addToFavoritesBtn = document.querySelector('.add-to-favorites-btn');
  const addToFavoriteRelatedProductsBtn = document.querySelector('.add-to-favorite-related-products-btn');
  
  if (addToFavoritesBtn || addToFavoriteRelatedProductsBtn) {
    document.querySelectorAll('.add-to-favorite-related-products-btn, .add-to-favorites-btn')
    .forEach(btn => {
      const productId = btn.closest('[data-product-id]')?.dataset.productId;

      btn.addEventListener('click', () => {
        const isActive = btn.classList.toggle('active');

        if (isActive) {
          addToFavorite(productId);
        } else {
          deleteFavorite(productId);
        }
      });
    }); 
  }
}

initFavoriteButtons();

// Раскрытие карточек "Описание товара"

const productDescCard = document.querySelector('.product-desc-card');

if (productDescCard) {
    const cards = document.querySelectorAll('.product-desc-card');

    document.addEventListener('DOMContentLoaded', () => {
      cards.forEach(card => {
        if (card.classList.contains('open')) {
          const info = card.querySelector('.product-desc-card-info');
          info.style.maxHeight = info.scrollHeight + 'px';
        }
      });
    });

    cards.forEach(card => {
      const btn = card.querySelector('.product-desc-card-open-btn');
      const info = card.querySelector('.product-desc-card-info');

      btn.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');

        cards.forEach(c => {
          c.classList.remove('open');
          c.querySelector('.product-desc-card-info').style.maxHeight = null;
        });

        if (!isOpen) {
          card.classList.add('open');
          info.style.maxHeight = info.scrollHeight + 'px';
        }
    });
  });
}

// Раскрытие отзывов поболь

const productDescCardReviewTexts = document.querySelectorAll('.product-desc-card-review-texts');

if (productDescCardReviewTexts) {
  productDescCardReviewTexts.forEach(container => {
  const textEl = container.querySelector('.product-desc-card-review-text');
  const btn = container.querySelector('.product-desc-card-review-more-btn');
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


// Оценка в блоке "Оставить отзыв"

function sendStars() {
  const stars = document.querySelectorAll('.send-review-stars svg');

  if (stars) {
    let currentRating = 0; 

    const setFill = (rating) => {
      stars.forEach(star => {
        const val = parseInt(star.dataset.value, 10);
        if (val <= rating) {
          star.classList.add('filled');
        } else {
          star.classList.remove('filled');
        }
      });
    };

    stars.forEach(star => {
      star.addEventListener('mouseover', () => {
        const hoverValue = parseInt(star.dataset.value, 10);
        setFill(hoverValue);
      });

      star.addEventListener('mouseout', () => {
        setFill(currentRating);
      });

      star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.value, 10);
        console.log('Поставленный рейтинг:', currentRating);
      });
    });

    setFill(currentRating);
  }
}

sendStars();


// Функция переключения картинок при наведении в секции "С этим товаром покупают"

function initInteractiveCards() {
  const imageHoverCard = document.querySelector('.image-hover-card');

  if (imageHoverCard) {
    document.querySelectorAll('.image-hover-card').forEach(card => {
      const frames = Array.from(card.querySelectorAll('img'));
      const segments = Array.from(card.querySelectorAll('.segment'));
      const count = frames.length;

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
        320: { slidesPerView: 1, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      },
    });
  }
}

initRelatedProductsSwiper();
