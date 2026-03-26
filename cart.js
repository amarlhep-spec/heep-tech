document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    setupCartEvents();
});

function getRenderableCart() {
    return window.db && typeof db.getCart === 'function' ? db.getCart() : [];
}

function loadCartItems() {
    const cart = getRenderableCart();
    const container = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartTable = document.getElementById('cart-table');
    const cartFooter = document.getElementById('cart-footer');

    if (!container) {
        return;
    }

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartTable) cartTable.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'none';
        updateCartTotals(0);
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartTable) cartTable.style.display = 'table';
    if (cartFooter) cartFooter.style.display = 'block';

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item) => {
        const product = item.product || {};
        const price = Number(product.price || item.price || 0);
        const quantity = Number(item.quantity || 1);
        const image = product.images && product.images[0] ? product.images[0] : (item.image || 'images/placeholder.jpg');
        const itemTotal = price * quantity;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${image}"
                     alt="${escapeHtml(product.name || item.name || 'منتج')}"
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
            </td>
            <td>${escapeHtml(product.name || item.name || 'منتج غير معروف')}</td>
            <td>${price.toFixed(2)} SP</td>
            <td>
                <input type="number" min="1" value="${quantity}"
                       class="form-control" style="width: 80px;"
                       onchange="updateCartQuantity('${item.productId}', this.value)">
            </td>
            <td>${itemTotal.toFixed(2)} SP</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.productId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        container.appendChild(row);
    });

    updateCartTotals(subtotal);
}

function updateCartTotals(subtotal) {
    const shipping = subtotal > 0 ? 500 : 0;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' SP';
    if (shippingEl) shippingEl.textContent = shipping.toFixed(2) + ' SP';
    if (totalEl) totalEl.textContent = total.toFixed(2) + ' SP';

    localStorage.setItem('cartTotal', String(total));
}

function updateCartQuantity(productId, quantity) {
    const parsedQuantity = parseInt(quantity, 10);
    if (parsedQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    if (db.updateCartItem(productId, parsedQuantity)) {
        loadCartItems();
        showNotification('تم تحديث الكمية', 'success');
    } else {
        showNotification('تعذر تحديث الكمية', 'error');
    }
}

function removeFromCart(productId) {
    if (!confirm('هل تريد إزالة هذا المنتج من السلة؟')) {
        return;
    }

    if (db.removeFromCart(productId)) {
        loadCartItems();
        showNotification('تم إزالة المنتج من السلة', 'success');
    } else {
        showNotification('تعذر إزالة المنتج من السلة', 'error');
    }
}

function clearCart() {
    if (!confirm('هل تريد تفريغ السلة بالكامل؟')) {
        return;
    }

    if (db.clearCart()) {
        loadCartItems();
        showNotification('تم تفريغ السلة', 'success');
    } else {
        showNotification('تعذر تفريغ السلة', 'error');
    }
}

function proceedToCheckout() {
    const cart = db.getCartItems();
    if (cart.length === 0) {
        showNotification('السلة فارغة', 'error');
        return;
    }

    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = 'order-confirmation.html';
}

function setupCartEvents() {
    const clearBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (clearBtn) clearBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', proceedToCheckout);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;
