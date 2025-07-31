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

// 1) При загрузке страницы «развернём» те карточки, что уже имеют .open
document.addEventListener('DOMContentLoaded', () => {
  cards.forEach(card => {
    if (card.classList.contains('open')) {
      const info = card.querySelector('.product-desc-card-info');
      info.style.maxHeight = info.scrollHeight + 'px';
    }
  });
});

// 2) Обработчик клика (ваш существующий код)
cards.forEach(card => {
  const btn = card.querySelector('.product-desc-card-open-btn');
  const info = card.querySelector('.product-desc-card-info');

  btn.addEventListener('click', () => {
    const isOpen = card.classList.contains('open');

    // закрываем все
    cards.forEach(c => {
      c.classList.remove('open');
      c.querySelector('.product-desc-card-info').style.maxHeight = null;
    });

    // открываем текущую
    if (!isOpen) {
      card.classList.add('open');
      info.style.maxHeight = info.scrollHeight + 'px';
    }
  });
});
}