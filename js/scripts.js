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

// Выбрать комплектацию

function selectConfiguration() {
  const cards = document.querySelectorAll('.select-configuration-card');

  if (cards) {
      cards.forEach((card, index) => {
      card.dataset.id = index + 1;

      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));

        card.classList.add('active');

        console.log('Выбрана карточка:', card.dataset.id);
      });
    });
  }
}

selectConfiguration();

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

    // Сначала сворачиваем все
    cards.forEach(c => {
      c.classList.remove('open');
      c.querySelector('.product-desc-card-info').style.maxHeight = null;
    });

    // Если карточка была закрыта — открываем и скроллим к ней
    if (!isOpen) {
      card.classList.add('open');
      info.style.maxHeight = info.scrollHeight + 'px';

      // Плавно скроллим карточку в верхнюю часть окна
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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



// Отправка файла в форме "Оставить заявку"

const getRequestForm = document.querySelector('.send-review-form');

function sendFile() {
  if (getRequestForm) {
    const formats = ['jpg','jpeg','png','pdf'];
    const input   = document.getElementById('file-input');
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

sendFile();


function sendForm(data) {
  // Здесь будет отправка на бэкенд, а пока — просто в консоль:
  console.log('Отправляем данные формы:', data);
  clearReviewForm();
}

function clearReviewForm() {
  const form = document.querySelector('.send-review-form');
  if (!form) return;

  if (form) {
    form.reset();

    const stars = form.querySelectorAll('.send-review-stars svg');
    stars.forEach(star => star.classList.remove('filled'));

    const nameField = form.querySelector('input[type="text"]');
    const reviewField = form.querySelector('textarea');
    const politicsWrapper = form.querySelector('.accept-politics');

    nameField.classList.remove('error');
    reviewField.classList.remove('error');
    politicsWrapper.classList.remove('error');

    // Сброс файла
    const fileInput   = document.getElementById('file-input');
    const fileNameEl  = document.querySelector('.file-name');
    const fileInfoWr  = document.getElementById('file-info');
    const fileWrapper = document.querySelector('.file-upload-wrapper');

    if (fileInput) fileInput.value = '';
    if (fileNameEl) fileNameEl.textContent = '';
    if (fileInfoWr) fileInfoWr.style.display = 'none';
    if (fileWrapper) fileWrapper.classList.remove('has-file');
  }
}

function ValidateGetRequestForm() {
  const form = document.querySelector('.send-review-form');

  if (!form) return;

  if (form) {
    const stars            = form.querySelectorAll('.send-review-stars svg');
    let currentRating      = 0;

    const nameField        = form.querySelector('input[type="text"]');
    const phoneField       = form.querySelector('input[type="tel"]');
    const reviewField      = form.querySelector('textarea');
    const fileInput        = form.querySelector('#file-input');
    const politicsWrapper  = form.querySelector('.accept-politics');
    const politicsCheckbox = politicsWrapper.querySelector('input[type="checkbox"]');

    // Выставление рейтинга звёзд
    const setFill = rating => {
      stars.forEach(star => {
        star.classList.toggle('filled', parseInt(star.dataset.value, 10) <= rating);
      });
    };

    stars.forEach(star => {
      const val = parseInt(star.dataset.value, 10);

      star.addEventListener('mouseover', () => setFill(val));
      star.addEventListener('mouseout',  () => setFill(currentRating));
      star.addEventListener('click',    () => {
        currentRating = val;
        setFill(currentRating);
      });
    });

    // Валидация 
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      let isValid = true;

      // имя
      if (!nameField.value.trim()) {
        nameField.classList.add('error');
        isValid = false;
      } else {
        nameField.classList.remove('error');
      }

      // отзыв
      if (!reviewField.value.trim()) {
        reviewField.classList.add('error');
        isValid = false;
      } else {
        reviewField.classList.remove('error');
      }

      // чекбокс
      if (!politicsCheckbox.checked) {
        politicsWrapper.classList.add('error');
        isValid = false;
      } else {
        politicsWrapper.classList.remove('error');
      }

      if (!isValid) return;

      // сбор данных, включая рейтинг
      const formData = {
        name:    nameField.value.trim(),
        phone:   phoneField.value.trim() || null,
        review:  reviewField.value.trim(),
        rating:  currentRating,           
        accept:  politicsCheckbox.checked,
        file:    fileInput.files[0]?.name || null
      };

      sendForm(formData);
    });

    // Сброс ошибок при вводе/смене 
    nameField.addEventListener('input', () => {
      if (nameField.classList.contains('error') && nameField.value.trim()) {
        nameField.classList.remove('error');
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
}


ValidateGetRequestForm();