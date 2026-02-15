
// Product Data
const products = [
    {
        id: 1,
        name: "Elegant Floral Wedding Invitation",
        type: "Wedding",
        price: 28.00,
        image: "public/images/copper-card-1.jpg",
        description: "Beautiful copper wedding invitation with intricate floral corner etching. Perfect for elegant ceremonies. Features customizable text and date."
    },
    {
        id: 2,
        name: "Multi-Couple Celebration Plaque",
        type: "Wedding",
        price: 45.00,
        image: "public/images/copper-card-2.jpg",
        description: "Premium copper plaque featuring multiple couple names with decorative borders. Ideal for wedding seating displays or family celebrations."
    },
    {
        id: 3,
        name: "Classic Invitation Card Set",
        type: "Invitation",
        price: 22.00,
        image: "public/images/copper-card-3.jpg",
        description: "Traditional 'You're Invited' copper cards with elegant floral borders. Perfect for weddings, engagements, or formal events. Available in sets."
    },
    {
        id: 4,
        name: "Family Tree Wedding Plaque",
        type: "Wedding",
        price: 55.00,
        image: "public/images/copper-card-4.jpg",
        description: "Unique copper wedding invitation featuring family tree design with roses. Honors family heritage while celebrating new beginnings."
    },
    {
        id: 5,
        name: "Nature-Embossed Wedding Card",
        type: "Wedding",
        price: 32.00,
        image: "public/images/copper-card-5.jpg",
        description: "Stunning copper card with deep embossed nature patterns creating a wreath border. Modern yet timeless design for your special day."
    }
];

// Cart Logic
const Cart = {
    getCart: () => {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    saveCart: (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        Cart.updateCartCount();
    },

    addItem: (product) => {
        const cart = Cart.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        Cart.saveCart(cart);
        alert(`${product.name} added to cart!`);
    },

    removeItem: (productId) => {
        const cart = Cart.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        Cart.saveCart(updatedCart);
        // If on cart page, re-render
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
    },

    updateQuantity: (productId, change) => {
        const cart = Cart.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                Cart.removeItem(productId);
                return;
            }
            Cart.saveCart(cart);
            // If on cart page, re-render
            if (window.location.pathname.includes('cart.html')) {
                renderCartPage();
            }
        }
    },

    clearCart: () => {
        localStorage.removeItem('cart');
        Cart.updateCartCount();
    },

    getTotal: () => {
        const cart = Cart.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    },

    updateCartCount: () => {
        const count = Cart.getCart().reduce((sum, item) => sum + item.quantity, 0);
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            countElement.innerText = count;
        }
    }
};


// Page Renderers

function renderHomePage() {
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) {
        const featured = products.slice(0, 3);
        featuredContainer.innerHTML = featured.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <a href="product_detail.html?id=${product.id}" class="btn">View Details</a>
            </div>
        `).join('');
    }
}

function renderProductsPage() {
    const productsContainer = document.getElementById('products-grid');
    if (productsContainer) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <a href="product_detail.html?id=${product.id}" class="btn">View Details</a>
                    <button onclick="Cart.addItem(products.find(p => p.id === ${product.id}))" class="btn btn-secondary">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }
}

function renderProductDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const product = products.find(p => p.id === id);

    const container = document.getElementById('product-detail');
    if (container) {
        if (product) {
            container.innerHTML = `
                <div class="detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="detail-info">
                    <h1>${product.name}</h1>
                    <p class="type">${product.type}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="description">${product.description}</p>
                    <button onclick="Cart.addItem(products.find(p => p.id === ${product.id}))" class="btn btn-primary">Add to Cart</button>
                    <a href="products.html" class="back-link">← Back to Products</a>
                </div>
            `;
        } else {
            container.innerHTML = '<h2>Product not found</h2><a href="products.html">Return to shop</a>';
        }
    }
}

function renderCartPage() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-amount');

    if (cartContainer && cartTotal) {
        const cart = Cart.getCart();

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.innerText = '0.00';
            return;
        }

        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                   <h3>${item.name}</h3>
                   <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                   <button onclick="Cart.updateQuantity(${item.id}, -1)">-</button>
                   <span>${item.quantity}</span>
                   <button onclick="Cart.updateQuantity(${item.id}, 1)">+</button>
                   <button onclick="Cart.removeItem(${item.id})" class="remove-btn">Remove</button>
                </div>
            </div>
        `).join('');

        cartTotal.innerText = Cart.getTotal();
    }
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateCartCount(); // In header if we had one

    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
        renderHomePage();
    } else if (path.includes('products.html')) {
        renderProductsPage();
    } else if (path.includes('product_detail.html')) {
        renderProductDetailPage();
    } else if (path.includes('cart.html')) {
        renderCartPage();
    }
});
