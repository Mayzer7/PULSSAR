const html = document.documentElement;
const body = document.body;
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


// Модальное окно для полноэкранного просмотра изображений товара

const modalGallery = document.getElementById('galleryModal');

if (modalGallery) {
  const mainImages = document.querySelectorAll('.main-images-swiper img');
  const modalWrap   = modalGallery.querySelector('.swiper-fullscreen .swiper-wrapper');
  const closeBtn    = modalGallery.querySelector('.modal-close');
  const overlay = modalGallery.querySelector('.fullscreen-overlay');
  let fullscreenSwiper;

  mainImages.forEach(img => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.appendChild(img.cloneNode());
    modalWrap.appendChild(slide);
  });

  function initFullscreenSwiper() {
    fullscreenSwiper = new Swiper('.swiper-fullscreen', {
      slidesPerView: 1,
      centeredSlides: true,

      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: false,
    });
  }

  mainImages.forEach((img, idx) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
    modalGallery.classList.add('open');
    html.classList.add('no-scroll');
    body.classList.add('no-scroll');

    if (!fullscreenSwiper) initFullscreenSwiper();
    fullscreenSwiper.slideToLoop(idx, 0); 
    });
  });

  function closeModal() {
    modalGallery.classList.remove('open');
    modalGallery.classList.add('closing'); 

    html.classList.remove('no-scroll');
    body.classList.remove('no-scroll');

    modalGallery.addEventListener('transitionend', onTransitionEnd);
  }

  function onTransitionEnd(e) {
    if (e.propertyName === 'opacity') {
      modalGallery.classList.remove('closing');
      modalGallery.removeEventListener('transitionend', onTransitionEnd);
    }
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
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

const productDescCards = document.querySelectorAll('.product-desc-card');

if (productDescCards.length) {
  // Вспомогательная функция плавного скролла
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

  // Инициализация высот при загрузке страницы
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

    // Функция открытия/закрытия карточки
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

    // Навешиваем на кнопку и на всю click-area
    btn.addEventListener('click', toggleCard);
    clickArea.addEventListener('click', toggleCard);
  });
}

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
    const formats = ['jpg','jpeg','png','pdf'];
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

    sendFormReview(formData);
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

addButtons.forEach(btn =>
  btn.addEventListener('click', () => {
    showSelectors();
    currentCount = 1;
    renderCount();
    addToCart(true, currentCount);
  })
);

minusButtons.forEach(btn =>
  btn.addEventListener('click', e => {
    e.stopPropagation();
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
    e.stopPropagation();
    currentCount++;
    renderCount();
    addToCart(true, currentCount);
  })
);



// Выбор количества товара добавленного в корзину

function setupAddToCart(container) {
  const addBtn      = container.querySelector('.add-to-cart-btn');
  const qtySelector = container.querySelector('.item-quantity-selector');
  const minusBtn    = qtySelector.querySelector('.minus');
  const plusBtn     = qtySelector.querySelector('.plus');
  const valueEl     = qtySelector.querySelector('.item-quantity-value');
  let currentCount  = parseInt(valueEl.textContent, 10) || 1;

  // клик «Добавить»
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

// запуск для всех блоков
document.querySelectorAll('.item-buttons').forEach(container => {
  // проверяем, что в контейнере есть нужная разметка
  if (container.querySelector('.add-to-cart-btn')
   && container.querySelector('.item-quantity-selector')) {
    setupAddToCart(container);
  }
});


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


document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header-test');
  let lastScrollY = window.pageYOffset;
  const threshold = 100;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY > lastScrollY && currentScrollY > threshold) {
      header.classList.add('scroll-down');
    }
    if (currentScrollY === 0) {
      header.classList.remove('scroll-down');
    }

    lastScrollY = currentScrollY;
  });
});