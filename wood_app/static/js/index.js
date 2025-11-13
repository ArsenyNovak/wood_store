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
        <a href="#" class="card-link" aria-label="Открыть ${product.title}">
          <img src="/${product.images[0].url}" alt="${product.title}">
          <div class="card-body">
            <h3 class="card-title">${product.title}</h3>
            <div><span class="card-category">${product.category.title}</span></div>
            <h3 class="price">${product.price} р.</h3>
          </div>
        </a>
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

function updateDisplay() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = allProducts.slice(start, end);
    displayProducts(productsToShow);
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

