const productsRoot = document.getElementById('products');
const yearSpan = document.getElementById('year');
const cartCountEl = document.getElementById('cartCount');

let allProducts = [];
const productsPerPage = 5;
let currentPage = 1;

async function loadAllProducts() {
    const select = document.getElementById('category');
    const selectedCategory = select.value;  // Получаем текущий выбор

    const url = new URL('/wood/applications/api/products', window.location.origin);

    if (selectedCategory && selectedCategory !== 'all') {
        url.searchParams.append('category', selectedCategory);
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Ошибка загрузки");
      const data = await response.json();
      allProducts = data.products;
      updateDisplay();
    } catch (e) {
      document.getElementById('no-products-message').textContent = 'Ошибка загрузки товаров';
      document.getElementById('no-products-message').classList.remove('no_products');
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    const noProductsMessage = document.getElementById('no-products-message');

    container.innerHTML = "";
    if (!products || products.length === 0) {
      noProductsMessage.style.display = "block";
      container.style.display = "none";
      return;
    }
    noProductsMessage.style.display = "none";
    container.style.display = "flex";

    products.forEach(product => {
      const article = document.createElement('article');
      article.className = 'card';
      article.innerHTML = `
        <div class="card-link" id="product_${product.product_id}">
          <img src="/${product.images[0].url}" alt="${product.title}">
          <div class="card-body">
            <h3 class="card-title">${product.title}</h3>
            <div><span class="card-category">${product.category.title}</span></div>
            <h3 class="price">${product.price} р.</h3>
          </div>
        </div>
        <button class="btn-cart" data-id="${product.id}">
          ${product.count ? "В корзину" : "Заказать"}
        </button>
      `;
      container.appendChild(article);
    });
}

function setupPagination(totalProducts) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalProducts / productsPerPage);
    if (totalPages <= 1) {
      paginationContainer.style.display = "none";
      return;
    }
    paginationContainer.style.display = "block";

    const prevButton = document.createElement('button');
    prevButton.textContent = "«";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        updateDisplay();
      }
    };
    paginationContainer.appendChild(prevButton);

    for(let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === currentPage) btn.classList.add('active');
      btn.onclick = () => {
        currentPage = i;
        updateDisplay();
      };
      paginationContainer.appendChild(btn);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = "»";
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay();
      }
    };
    paginationContainer.appendChild(nextButton);
}

// Modal

const productModal = document.querySelector('.modal__products');
const modalCloseButton = document.querySelector('.modal__close-button');

function populateModal(product) {
  const imageContainerSlider = document.querySelector('.modal__slider');
  imageContainerSlider.innerHTML = '';
  for (let i = 0; i < product.images.length; i += 1) {
    const image = document.createElement('img');
    image.src = '/' + product.images[i].url
    image.classList.add('modal__image');
    imageContainerSlider.appendChild(image);
  }

  const modalContent = document.querySelector('.modal__content-container');
  modalContent.innerHTML = `
          <div class="modal__content">
            <h2 class="center_text">${product.title}</h2>
            <h3 class="modal__product-describe">Описание: ${product.describe}</h3>
            <h2 class="modal__product-price">Цена: ${product.price} р.</h2>
          </div>
        <button class="modal__btn-cart" data-id="${product.id}">
          ${product.count ? "В корзину" : "Заказать"}
        </button>
      `;


  const slider = document.querySelector('.modal__slider');
  const prevButton = document.querySelector('.modal__prev-button');
  const nextButton = document.querySelector('.modal__next-button');
  const slides = Array.from(slider.querySelectorAll('img'));
  const slideCount = slides.length;
  let slideIndex = 0;

  // Устанавливаем обработчики событий для кнопок
  prevButton.addEventListener('click', showPreviousSlide);
  nextButton.addEventListener('click', showNextSlide);

  // Функция для показа предыдущего слайда
  function showPreviousSlide() {
    slideIndex = (slideIndex - 1 + slideCount) % slideCount;
    updateSlider();
  }

  // Функция для показа следующего слайда
  function showNextSlide() {
    slideIndex = (slideIndex + 1) % slideCount;
    updateSlider();
  }

  // Функция для обновления отображения слайдера
  function updateSlider() {
    slides.forEach((slide, index) => {
      if (index === slideIndex) {
        slide.style.display = 'block';
      } else {
        slide.style.display = 'none';
      }
    });
  }

    // Инициализация слайдера
  updateSlider();

  modalCloseButton.addEventListener('click', () => {
    productModal.close();
  });

  productModal.addEventListener('click', (event) => {
    if (
      event.clientX < productModal.getBoundingClientRect().left ||
      event.clientX > productModal.getBoundingClientRect().right ||
      event.clientY < productModal.getBoundingClientRect().top ||
      event.clientY > productModal.getBoundingClientRect().bottom
    ) {
      productModal.close();
      documentBody.classList.remove('noscroll');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && productModal.open) {
      documentBody.classList.remove('noscroll');
    }
  });
}

function addProductItemClickListeners(products) {
  const ProductItems = document.querySelectorAll('.card-link');

  ProductItems.forEach((item) => {
    item.addEventListener('click', () => {
      const product = products.find((element) => element.product_id == item.id.split("_")[1]);
      populateModal(product);
      productModal.showModal();
      documentBody.classList.add('noscroll');
    });
  });
}

function updateDisplay() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = allProducts.slice(start, end);
    displayProducts(productsToShow);
    addProductItemClickListeners(productsToShow)
    setupPagination(allProducts.length);
}

loadAllProducts();

yearSpan.textContent = new Date().getFullYear();

// timer

//document.addEventListener('DOMContentLoaded', function() {
//
//    const deadline = new Date("2026-01-01T00:00:00.000+00:00");
//
//    function countdownTimer() {
//      const diff = deadline - new Date();
//
//      const days = Math.floor(diff / 1000 / 60 / 60 / 24);
//      const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
//      const minutes = Math.floor(diff / 1000 / 60) % 60;
//      const seconds = Math.floor(diff / 1000) % 60;
//
//      $days.textContent = days;
//      $hours.textContent = hours;
//      $minutes.textContent = minutes;
//      $seconds.textContent = seconds;
//
//    }
//
//    const $days = document.querySelector('.timer__days');
//    const $hours = document.querySelector('.timer__hours');
//    const $minutes = document.querySelector('.timer__minutes');
//    const $seconds = document.querySelector('.timer__seconds');
//
//    countdownTimer();
//
//    timerId = setInterval(countdownTimer, 1000);
//  });
//productsRoot.addEventListener('click', (e) => {
//  const btn = e.target.closest('.btn-cart');
//  if(!btn) return;
//  const id = btn.getAttribute('data-id');
//  if(!id) return;
//  addToCart(id);
//});
//
//function addToCart(id){
//  const cart = JSON.parse(localStorage.getItem('wc_cart') || '[]');
//  cart.push(id);
//  localStorage.setItem('wc_cart', JSON.stringify(cart));
//  updateCartCount();
//  alert('Добавлено в корзину');
//}
//
//function updateCartCount(){
//  const cart = JSON.parse(localStorage.getItem('wc_cart') || '[]');
//  if(cartCountEl) cartCountEl.textContent = cart.length;
//}
//updateCartCount();

