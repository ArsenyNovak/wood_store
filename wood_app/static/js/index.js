const productsRoot = document.getElementById('products');
const yearSpan = document.getElementById('year');
const cartCountEl = document.getElementById('cartCount');

yearSpan.textContent = new Date().getFullYear();


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

