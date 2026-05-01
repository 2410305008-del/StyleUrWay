/* ===================================================
   StyleUrWay - Main JavaScript
   =================================================== */

// ========== GLOBAL STATE ==========
let cart = JSON.parse(localStorage.getItem('suw-cart') || '[]');
let wishlist = new Set(JSON.parse(localStorage.getItem('suw-wishlist') || '[]'));

// ========== PRELOADER ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader')?.classList.add('hidden');
    }, 1400);
});

// ========== NAVBAR ==========
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (navbar) {
        navbar.classList.toggle('scrolled', scrolled > 60);
    }
    // Back to top button
    const backBtn = document.querySelector('.back-to-top');
    if (backBtn) backBtn.classList.toggle('visible', scrolled > 400);
    lastScroll = scrolled;
});

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileNav?.classList.toggle('open');
    });
    // Close mobile nav on link click
    mobileNav?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('open');
        });
    });
}

// Highlight active nav link
function setActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
        const href = a.getAttribute('href');
        a.classList.toggle('active', href === current);
    });
}
setActiveNav();

// ========== CART ==========
function saveCart() {
    localStorage.setItem('suw-cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const badge = document.querySelector('.cart-badge');
    const total = cart.reduce((s, i) => s + i.qty, 0);
    if (badge) {
        badge.textContent = total;
        if (total > 0) { badge.style.display = 'flex'; badge.classList.add('bounce'); setTimeout(() => badge.classList.remove('bounce'), 400); }
        else { badge.style.display = 'none'; }
    }
    renderCartItems();
}

function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    showToast(`✓ ${product.name} added to cart`);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    showToast('Item removed from cart');
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) cart = cart.filter(i => i.id !== id);
    saveCart();
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛍️</div>
        <p>Your cart is empty</p>
        <a href="shop.html" class="btn btn-primary" style="margin-top:8px">Shop Now</a>
      </div>`;
        if (subtotalEl) subtotalEl.textContent = '₹0';
        return;
    }

    container.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="cart-item-img">
        ${item.img
            ? `<img src="${item.img}" alt="${item.name}">`
            : `<div class="cart-item-img-placeholder" style="background:${item.color || 'linear-gradient(135deg,#8B2252,#c9608a)'};">${item.icon || '👗'}</div>`}
      </div>
      <div class="cart-item-details">
        <div class="cart-item-category">${item.category}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1); renderCartItems();">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1); renderCartItems();">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
}

// Cart Sidebar Toggle
document.querySelector('.cart-toggle')?.addEventListener('click', openCart);
document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
document.querySelector('.cart-close')?.addEventListener('click', closeCart);

function openCart() {
    document.querySelector('.cart-overlay')?.classList.add('open');
    document.querySelector('.cart-sidebar')?.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeCart() {
    document.querySelector('.cart-overlay')?.classList.remove('open');
    document.querySelector('.cart-sidebar')?.classList.remove('open');
    document.body.style.overflow = '';
}

// ========== WISHLIST ==========
function toggleWishlist(id, btn) {
    if (wishlist.has(id)) {
        wishlist.delete(id);
        btn.classList.remove('liked');
        btn.textContent = '♡';
        showToast('Removed from wishlist');
    } else {
        wishlist.add(id);
        btn.classList.add('liked');
        btn.textContent = '♥';
        showToast('Added to wishlist ♥');
    }
    localStorage.setItem('suw-wishlist', JSON.stringify([...wishlist]));
}

// ========== TOAST ==========
function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-icon">✦</span> ${msg}`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== SCROLL ANIMATIONS ==========
const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('animated');
            animObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

// ========== PRODUCT FILTER (Homepage Featured) ==========
const filterTabs = document.querySelectorAll('.filter-tab');
if (filterTabs.length > 0) {
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            document.querySelectorAll('.product-card').forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// ========== COUNTER ANIMATION ==========
function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const update = () => {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            animateCounter(el, parseInt(el.dataset.target), 1800);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ========== NEWSLETTER ==========
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    if (email) {
        showToast('🎉 Thank you for subscribing!');
        e.target.reset();
    }
});

// ========== BACK TO TOP ==========
document.querySelector('.back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== CONTACT FORM ==========
document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✉️ Message sent! We\'ll get back to you soon.');
    e.target.reset();
});

// ========== SHOP PAGE FILTER ==========
const shopFilters = document.querySelectorAll('.shop-filter-btn');
const shopSortSelect = document.getElementById('shopSort');

function applyShopFilters() {
    const selectedCats = [...document.querySelectorAll('.shop-filter-btn.active')].map(b => b.dataset.cat);
    const priceMax = parseInt(document.getElementById('priceRange')?.value || 99999);

    document.querySelectorAll('.shop-product-card').forEach(card => {
        const cat = card.dataset.category;
        const price = parseInt(card.dataset.price);
        const catMatch = selectedCats.length === 0 || selectedCats.includes(cat);
        const priceMatch = price <= priceMax;
        card.style.display = (catMatch && priceMatch) ? '' : 'none';
    });

    const visible = document.querySelectorAll('.shop-product-card:not([style*="display: none"])').length;
    const resultEl = document.getElementById('resultsCount');
    if (resultEl) resultEl.textContent = `${visible} products found`;
}

shopFilters.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        applyShopFilters();
    });
});

document.getElementById('priceRange')?.addEventListener('input', (e) => {
    const label = document.getElementById('priceMaxLabel');
    if (label) label.textContent = '₹' + parseInt(e.target.value).toLocaleString('en-IN');
    applyShopFilters();
});

// ========== INIT ==========
window.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    renderCartItems();
});
