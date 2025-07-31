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

const addToFavoritesBtn = document.querySelector('.add-to-favorites-btn');

if (addToFavoritesBtn) {
    const button = addToFavoritesBtn;

    button.addEventListener('click', () => {
      const isActive = button.classList.toggle('active');
      
      if (isActive) {
        addToFavorite();
      } else {
        deleteFavorite();
      }
    });
}

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

// Раскрытие отзывов побольеш

const productDescCardReviewTexts = document.querySelectorAll('.product-desc-card-review-texts');

if (productDescCardReviewTexts) {
  productDescCardReviewTexts.forEach(container => {
    const textEl = container.querySelector('.product-desc-card-review-text');
    const btn = container.querySelector('.product-desc-card-review-more-btn');
    const label = btn.querySelector('.btn-label');
    const transitionDuration = 500;
    const fullHeight = textEl.scrollHeight;
    const collapsedHeight = textEl.getBoundingClientRect().height;

    if (fullHeight <= collapsedHeight + 1) {
      btn.style.display = 'none';
      return;
    }

    btn.addEventListener('click', () => {
      const isExpanded = !textEl.classList.contains('expanded');
      btn.classList.toggle('open', isExpanded);
      label.textContent = isExpanded ? 'Скрыть' : 'Читать весь отзыв';

      if (isExpanded) {
        textEl.classList.add('expanded');
        textEl.style.maxHeight = fullHeight + 'px';
        setTimeout(() => {
          textEl.style.maxHeight = 'none';
        }, transitionDuration);
      } else {
        textEl.style.maxHeight = fullHeight + 'px';
        void textEl.offsetHeight;
        textEl.style.maxHeight = collapsedHeight + 'px';

        setTimeout(() => {
          textEl.classList.remove('expanded');
        }, transitionDuration);
      }
    });
  });
}