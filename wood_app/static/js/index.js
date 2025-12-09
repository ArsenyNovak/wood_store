/* ================================
   Helpers
================================ */

const q = (sel, root = document) => root.querySelector(sel);
const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmt = (num) => `${Number(num).toFixed(2)} р.`;

/* ================================
   DOM Elements
================================ */

const productsRoot = document.getElementById('products');
const cartCountEl = document.getElementById('cartCount');
const noProductsMessage = document.getElementById('no-products-message');
const paginationRoot = document.getElementById('pagination');

const productModal = document.getElementById('productModal');
const cartModal = document.getElementById('cartModal');

const productModalSlider = productModal?.querySelector('[data-slider]');
const productModalContent = productModal?.querySelector('[data-modal-content]');
const cartContainer = document.getElementById('cart');

const sentinel = document.getElementById('scroll-sentinel');

/* ================================
   State
================================ */

let allProducts = [];
let renderedCount = 0;
const batchSize = 8;

let cart = {};          // { product_id: quantity }
let cartDetails = {};   // { product_id: { product, quantity } }

let slider = {
  slides: [],
  index: 0
};

/* ================================
   Utils
================================ */

function truncate(text, n = 70) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) + '...' : text;
}

function isTelegramUser() {
  return !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
}

/* ================================
   Load products
================================ */

async function loadAllProducts() {
  const select = document.getElementById('category');
  const selected = select ? select.value : 'all';

  const url = new URL('/wood/applications/api/products', window.location.origin);
  if (selected !== 'all') url.searchParams.append('category', selected);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();

    const json = await res.json();
    allProducts = json.products || [];
    renderedCount = 0;
    productsRoot.innerHTML = '';

    renderNextBatch();
  } catch (err) {
    noProductsMessage.textContent = 'Ошибка загрузки товаров';
    noProductsMessage.style.display = 'block';
    productsRoot.style.display = 'none';
  }
}

/* Category change */
document.getElementById('category')?.addEventListener('change', loadAllProducts);
document.getElementById('category-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  loadAllProducts();
});

/* ================================
   Render product cards
================================ */

function createCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';

  const link = document.createElement('div');
  link.className = 'product-card__link';
  link.dataset.productId = product.product_id;

  const img = document.createElement('img');
  img.className = 'product-card__image';
  img.src = `/${product.images?.[0]?.url || ''}`;
  img.alt = product.title;

  const body = document.createElement('div');
  body.className = 'product-card__body';

  body.innerHTML = `
    <div class="product-card__title">${product.title}</div>
    <div class="product-card__category">${product.category?.title || ''}</div>
    <div class="product-card__price">${product.price} р.</div>
  `;

  const btn = document.createElement('button');
  btn.className = 'product-card__action btn btn--primary';
  btn.type = 'button';
  btn.dataset.id = product.product_id;
  btn.textContent = 'В корзину';
  if (cart[product.product_id]) {
    btn.classList.add('btn--disabled');
    btn.textContent = 'В корзине';
    btn.disabled = true;
  }

  link.appendChild(img);
  link.appendChild(body);
  card.appendChild(link);
  card.appendChild(btn);

  return card;
}

function createCartItem(p) {
  const { product_id, title, describe, images, price } = p;
  const quantity = cartDetails[product_id].quantity;

  const el = document.createElement('div');
  el.className = 'cart-modal__item';
  el.dataset.productId = product_id;

  // если товар уникальный — кнопки +/- не показывать
  let controlsHtml = '';

  if (!p.unique) {
    controlsHtml = `
      <button class="btn btn--primary cart-modal__btn--minus" data-id="${p.product_id}">-</button>
      <div class="cart-modal__count" data-id="${p.product_id}">${quantity}</div>
      <button class="btn btn--primary cart-modal__btn--plus" data-id="${p.product_id}">+</button>
    `;
  } else {
    controlsHtml = `
      <div class="cart-modal__count" data-id="${p.product_id}">1</div>
    `;
  }


  el.innerHTML = `
    <img class="cart-modal__thumb" src="/${images[0].url}" alt="${title}">
    <div class="cart-modal__info">
      <div class="cart-modal__title">${title}</div>
      <div class="cart-modal__desc">${truncate(describe, 80)}</div>
    </div>

    <div class="cart-modal__controls">
      ${controlsHtml}
    </div>

    <div class="cart-modal__total" data-id="${product_id}">
      ${fmt(price * quantity)}
    </div>
  `;


  cartContainer.appendChild(el);
}

function addCartSummary() {
  const summary = document.createElement('div');
  summary.className = 'cart-modal__summary';

  summary.innerHTML = `
    <div class="cart-modal__sum">Итого: <span id="cart-total-price">0 р.</span></div>
    <button class="cart-modal__checkout btn btn--primary" id="checkout-button">Оформить заказ</button>
  `;

  cartContainer.appendChild(summary);
}


function displayProducts(products) {
  productsRoot.innerHTML = '';

  if (!products.length) {
    noProductsMessage.style.display = 'block';
    productsRoot.style.display = 'none';
    return;
  }

  noProductsMessage.style.display = 'none';
  productsRoot.style.display = 'flex';

  const fragment = document.createDocumentFragment();
  products.forEach(p => fragment.appendChild(createCard(p)));
  productsRoot.appendChild(fragment);
}

/* ================================
   render next
================================ */

function renderNextBatch() {
  const batch = allProducts.slice(renderedCount, renderedCount + batchSize);
  if (!batch.length) return;

  const fragment = document.createDocumentFragment();
  batch.forEach(p => fragment.appendChild(createCard(p)));

  productsRoot.appendChild(fragment);
  renderedCount += batchSize;
}

/* ================================
   Product modal
================================ */

function openProductModal(product) {
  productModalSlider.innerHTML = '';
  slider.slides = [];

  product.images.forEach(img => {
    const el = document.createElement('img');
    el.className = 'product-modal__slide';
    el.src = `/${img.url}`;
    productModalSlider.appendChild(el);
    slider.slides.push(el);
  });

  slider.index = 0;
  updateSlider();

  productModalContent.innerHTML = `
    <h2 class="product-modal__title">${product.title}</h2>
    <div class="product-modal__desc">Описание: ${product.describe}</div>
    <div class="product-modal__price">Цена: ${product.price} р.</div>
    <button class="btn btn--primary product-modal__add" data-id="${product.product_id}">В корзину</button>
  `;

  const addBtn = q('.product-modal__add', productModal);

  if (cart[product.product_id]) {
    addBtn.textContent = 'В корзине';
    addBtn.disabled = true;
  } else {
    addBtn.onclick = () => {
      cart[product.product_id] = 1;
      updateCartBadge();
      addBtn.textContent = 'В корзине';
      addBtn.disabled = true;
      closeProductModal();
    };
  }

  productModal.showModal();
  document.body.classList.add('noscroll');
}

function updateSlider() {
  slider.slides.forEach((el, i) => {
    el.style.display = i === slider.index ? 'block' : 'none';
  });
}

function nextSlide() {
  slider.index = (slider.index + 1) % slider.slides.length;
  updateSlider();
}

function prevSlide() {
  slider.index = (slider.index - 1 + slider.slides.length) % slider.slides.length;
  updateSlider();
}

function closeProductModal() {
  productModal.close();
  document.body.classList.remove('noscroll');
}

/* modal controls */
productModal?.addEventListener('click', (e) => {
  if (e.target === productModal) closeProductModal();
});
q('.product-modal__close', productModal)?.addEventListener('click', closeProductModal);
q('.product-modal__btn--next', productModal)?.addEventListener('click', nextSlide);
q('.product-modal__btn--prev', productModal)?.addEventListener('click', prevSlide);

/* ================================
   Add to cart from product list
================================ */

productsRoot.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.product-card__action');
  if (addBtn) {
    const id = addBtn.dataset.id;

    // товар уже есть → не добавляем повторно
    if (cart[id]) return;

    cart[id] = 1;
    updateCartBadge();

    // обновляем кнопку (В корзине)
    addBtn.textContent = 'В корзине';
    addBtn.disabled = true;
    addBtn.classList.add('btn--disabled');

    return;
  }

  const link = e.target.closest('.product-card__link');
  if (link) {
    const id = link.dataset.productId;
    const product = allProducts.find(p => p.product_id == id);
    if (product) openProductModal(product);
  }
});

/* ================================
   Cart: load from server (Telegram)
================================ */

async function loadCartFromServer() {
  if (!isTelegramUser()) return;

  try {
    const user = Telegram.WebApp.initDataUnsafe.user;
    if (!user) return;

    const res = await fetch('/wood/applications/api/get_cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: user.id })
    });

    const json = await res.json();
    const serverCart = json.cart?.products || {};

    Object.assign(cart, serverCart);
    updateCartBadge();
  } catch (err) {
    console.warn('Cart load error:', err);
  }
}

/* ================================
   Cart modal assembly (uses unit prices!)
================================ */

async function showCartModal() {
  // --- очищаем старые товары ---
  cartContainer.querySelectorAll('.cart-modal__item').forEach(n => n.remove());

  // --- удаляем старый summary ---
  cartContainer.querySelector('.cart-modal__summary')?.remove();

  const emptyMsg = q('#no-products-in-cart', cartContainer);
  const ids = Object.keys(cart);

  // Если корзина пустая
  if (!ids.length) {
    emptyMsg.style.display = 'block';
    cartModal.showModal();
    document.body.classList.add('noscroll');
    return;
  }

  emptyMsg.style.display = 'none';

  // Загружаем товары
  const url = new URL('/wood/applications/api/cart-products', window.location.origin);
  url.searchParams.append('selected_products', ids);

  let products = [];
  try {
    const res = await fetch(url);
    products = (await res.json()).products || [];
  } catch (err) {
    console.error(err);
  }

  // Формируем cartDetails
  cartDetails = {};
  products.forEach(p => {
    cartDetails[p.product_id] = {
      product: p,
      quantity: cart[p.product_id] || 1
    };
  });

  // Рендерим товары
  products.forEach(p => createCartItem(p));

  // Добавляем summary (он всегда только 1)
  addCartSummary();

  // Вешаем события
  cartContainer.removeEventListener('click', onCartClick);
  cartContainer.addEventListener('click', onCartClick);

  q('#checkout-button', cartContainer)?.removeEventListener('click', onCheckout);
  q('#checkout-button', cartContainer)?.addEventListener('click', onCheckout);

  updateTotal();
  cartModal.showModal();
  document.body.classList.add('noscroll');
}


/* ================================
   Cart: update logic
================================ */

function onCartClick(e) {
  const plus = e.target.closest('.cart-modal__btn--plus');
  const minus = e.target.closest('.cart-modal__btn--minus');
  if (!plus && !minus) return;

  const id = (plus || minus).dataset.id;
  const item = cartDetails[id];

  // уникальный товар — нельзя менять количество
  if (item.product.unique) return;

  if (plus) item.quantity++;
  if (minus) item.quantity--;

  if (item.quantity <= 0) {
    delete cart[id];
    delete cartDetails[id];
    cartContainer.querySelector(`.cart-modal__item[data-product-id="${id}"]`)?.remove();
  } else {
    cart[id] = item.quantity;
    updateItemRow(id);
  }

  updateCartBadge();
  updateTotal();
}


function updateItemRow(id) {
  const item = cartDetails[id];
  const el = cartContainer.querySelector(`.cart-modal__item[data-product-id="${id}"]`);
  if (!el) return;

  el.querySelector('.cart-modal__count').textContent = item.quantity;
  el.querySelector('.cart-modal__total').textContent = fmt(item.product.price * item.quantity);
}

function updateTotal() {
  let sum = 0;
  Object.values(cartDetails).forEach(({ product, quantity }) => {
    sum += product.price * quantity;
  });
  q('#cart-total-price').textContent = fmt(sum);
}

/* ================================
   Close cart modal
================================ */

function closeCart() {
  cartContainer.removeEventListener('click', onCartClick);
  q('#checkout-button', cartContainer)?.removeEventListener('click', onCheckout);
  cartModal.close();
  document.body.classList.remove('noscroll');
}

cartModal?.addEventListener('click', (e) => {
  if (e.target === cartModal) closeCart();
});

q('.cart-modal__close', cartModal)?.addEventListener('click', closeCart);

function onCheckout() {
  alert('🎉 Заказ оформлен!');

  cart = {};
  cartDetails = {};

  updateCartBadge();
  closeCart();
}

function updateCartBadge() {
  cartCountEl.textContent = Object.keys(cart).length;
}

/* ================================
   Open cart
================================ */

q('.header__cart')?.addEventListener('click', showCartModal);

/* ================================
   endless loading products
================================ */

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    renderNextBatch();
  }
});

observer.observe(sentinel);

/* ================================
   Init
================================ */

async function init() {
  await loadAllProducts();
  await loadCartFromServer();
}

init();
