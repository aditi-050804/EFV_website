const API_BASE = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('efv_user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Prefill user data if available
    document.getElementById('ship-email').value = user.email || '';
    document.getElementById('ship-name').value = user.name || '';

    let checkoutItems = [];
    const directCheckout = JSON.parse(localStorage.getItem('directCheckout'));
    const cart = JSON.parse(localStorage.getItem('efv_cart')) || [];

    if (directCheckout) {
        checkoutItems = Array.isArray(directCheckout) ? directCheckout : [directCheckout];
    } else {
        checkoutItems = cart;
    }

    if (checkoutItems.length === 0) {
        alert('No items to checkout.');
        window.location.href = 'marketplace.html';
        return;
    }

    renderSummary(checkoutItems);
    setupPlaceOrder(checkoutItems, user);
});

function renderSummary(items) {
    const list = document.getElementById('checkout-items-list');
    let subtotal = 0;

    list.innerHTML = items.map(item => {
        subtotal += item.price * item.quantity;
        // In modal we set pm-img src, but in items we might not have 'image'. 
        // We'll try to find a thumbnail or use a placeholder.
        const imgPath = item.thumbnail || 'img/vol1-cover.png';

        return `
            <div class="checkout-item">
                <img src="${imgPath}" alt="${item.name}" class="checkout-item-img" onerror="this.src='img/vol1-cover.png'">
                <div class="checkout-item-info">
                    <div class="checkout-item-title">${item.name}</div>
                    <div class="checkout-item-meta">${item.subtitle || ''} | Qty: ${item.quantity}</div>
                    <div class="checkout-item-price">₹${item.price}</div>
                </div>
                <div style="font-weight: 700; align-self: center;">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    }).join('');

    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${subtotal.toFixed(2)}`;
}

function showToast(msg) {
    const toast = document.getElementById('checkout-toast');
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

function setupPlaceOrder(items, user) {
    const btn = document.getElementById('place-order-btn');
    const form = document.getElementById('shipping-form');

    btn.addEventListener('click', async () => {
        // 1. Validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const phone = document.getElementById('ship-phone').value;
        const pincode = document.getElementById('ship-pincode').value;

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            alert('Please enter a valid 6-digit pincode.');
            return;
        }

        const address = {
            name: document.getElementById('ship-name').value,
            phone: phone,
            email: document.getElementById('ship-email').value,
            street: document.getElementById('ship-address').value,
            area: document.getElementById('ship-area').value,
            city: document.getElementById('ship-city').value,
            state: document.getElementById('ship-state').value,
            pincode: pincode,
            country: document.getElementById('ship-country').value
        };

        localStorage.setItem('shippingAddress', JSON.stringify(address));

        // 2. Create Order Object
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderId = 'EFV-' + Date.now() + Math.floor(Math.random() * 1000);

        const orderData = {
            orderId: orderId,
            userEmail: user.email,
            products: items,
            totalAmount: totalAmount,
            shippingAddress: address,
            paymentStatus: 'Pending',
            orderStatus: 'Awaiting Payment',
            orderDate: new Date().toISOString()
        };

        // Save to localStorage "orders"
        let allOrders = JSON.parse(localStorage.getItem('orders')) || [];
        allOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(allOrders));

        showToast('Order created! Initializing payment...');

        // 3. Open Razorpay
        await initRazorpay(orderData);
    });
}

async function initRazorpay(order) {
    const btn = document.getElementById('place-order-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> INITIALIZING...';

    try {
        const response = await fetch(`${API_BASE}/api/orders/razorpay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: order.totalAmount })
        });

        const rzpData = await response.json();
        if (!response.ok) throw new Error(rzpData.message || 'Payment init failed');

        const options = {
            key: 'rzp_live_SBFlInxBiRfOGd',
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: 'EFV™ Energy Frequency Vibration',
            description: 'Order ID: ' + order.orderId,
            order_id: rzpData.id,
            handler: async (resp) => {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> VERIFYING PAYMENT...';
                await verifyPayment(resp, order, rzpData);
            },
            prefill: {
                name: order.shippingAddress.name,
                email: order.shippingAddress.email,
                contact: order.shippingAddress.phone
            },
            theme: { color: "#FFD369" },
            modal: {
                ondismiss: () => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (e) {
        alert('Payment Error: ' + e.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function verifyPayment(rzpResp, localOrder, rzpData) {
    try {
        const res = await fetch(`${API_BASE}/api/orders/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: rzpResp.razorpay_order_id,
                razorpay_payment_id: rzpResp.razorpay_payment_id,
                razorpay_signature: rzpResp.razorpay_signature,
                customer: {
                    name: localOrder.shippingAddress.name,
                    email: localOrder.shippingAddress.email,
                    address: `${localOrder.shippingAddress.street}, ${localOrder.shippingAddress.area}, ${localOrder.shippingAddress.city}, ${localOrder.shippingAddress.pincode}`
                },
                items: localOrder.products.map(i => ({
                    productId: i.id,
                    quantity: i.quantity
                }))
            })
        });

        const verification = await res.json();

        if (res.ok) {
            // Success
            updateLocalOrderStatus(localOrder.orderId, 'Paid', 'Processing');

            // Clear cart if it was a cart checkout
            if (!localStorage.getItem('directCheckout')) {
                localStorage.removeItem('efv_cart');
            }
            localStorage.removeItem('directCheckout');

            alert('✅ Payment Successful! Your order is being processed.');
            window.location.href = 'profile.html?tab=orders';
        } else {
            throw new Error(verification.message || 'Verification Failed');
        }

    } catch (e) {
        alert('Verification Error: ' + e.message);
        updateLocalOrderStatus(localOrder.orderId, 'Failed', 'Payment Failed');
        location.reload();
    }
}

function updateLocalOrderStatus(orderId, paymentStatus, orderStatus) {
    let allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const idx = allOrders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
        allOrders[idx].paymentStatus = paymentStatus;
        allOrders[idx].orderStatus = orderStatus;
        localStorage.setItem('orders', JSON.stringify(allOrders));
    }
}
