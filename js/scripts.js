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
    const info = card.querySelector('.product-desc-card-info');
    info.style.maxHeight = null;

    if (card.classList.contains('open')) {
      info.style.maxHeight = info.scrollHeight + 'px';
    }
  });

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

      // Обновляем текст кнопки
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
        // принудительный reflow для анимации
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

// Отправка файла в форме "Оставить заявку"
function sendFile() {
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

// Отправка данных (заглушка)
function sendForm(data) {
  console.log('Данные формы:', data);
  clearReviewForm();
}

// Сброс формы и ошибок
function clearReviewForm() {
  const form = document.querySelector('.send-review-form');
  if (!form) return;

  form.reset();

  form.querySelectorAll('.send-review-stars svg').forEach(star =>
    star.classList.remove('filled')
  );

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
function ValidateGetRequestForm() {
  const form = document.querySelector('.send-review-form');
  if (!form) return;

  // Рейтинг
  const stars            = form.querySelectorAll('.send-review-stars svg');
  let currentRating      = 0;
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

  // Поля
  const nameField        = form.querySelector('input[type="text"]');
  const phoneField       = form.querySelector('input[type="tel"]');
  const phoneError       = form.querySelector('.phone-error');
  const reviewField      = form.querySelector('textarea');
  const politicsWrapper  = form.querySelector('.accept-politics');
  const politicsCheckbox = politicsWrapper.querySelector('input[type="checkbox"]');

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

    sendForm(formData);
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

// Запуск
sendFile();
ValidateGetRequestForm();