// Integrated with global security.js
console.log("📂 profile.js: Loading Version 1.2 (Harden)...");

const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:5000';

// User Data Isolation Helpers
function getUserKey(baseKey) {
    const user = JSON.parse(localStorage.getItem('efv_user'));
    if (!user || !user.email) return baseKey;
    // Clean email to use as key part (remove special chars)
    const cleanEmail = user.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${baseKey}_${cleanEmail}`;
}


// --- MODAL & GLOBAL FUNCTIONS (TOP LEVEL FOR RELIABILITY) ---
window.openAddProductModal = function () {
    console.log("📦 Emergency Call: openAddProductModal");
    const modal = document.getElementById('admin-product-modal');
    const form = document.getElementById('admin-product-form');
    if (!modal || !form) return alert("Error: Product Modal not found in DOM");

    form.reset();
    document.getElementById('admin-prod-id').value = '';
    document.getElementById('admin-prod-volume').value = '';
    const coverDisplay = document.getElementById('admin-current-cover');
    const ebookDisplay = document.getElementById('admin-current-ebook');
    const audioDisplay = document.getElementById('admin-current-audio');
    if (coverDisplay) coverDisplay.textContent = '';
    if (ebookDisplay) ebookDisplay.textContent = '';
    if (audioDisplay) audioDisplay.textContent = '';

    document.getElementById('admin-modal-title').textContent = 'Add New Book';
    modal.classList.add('active');
    modal.style.display = 'flex'; // Double insurance
    if (typeof toggleAdminFileFields === 'function') toggleAdminFileFields();
};

window.closeProductModal = function () {
    const modal = document.getElementById('admin-product-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.toggleAdminFileFields = function () {
    const typeEl = document.getElementById('admin-prod-type');
    const ebookField = document.getElementById('admin-field-ebook');
    const audioField = document.getElementById('admin-field-audio');
    if (!typeEl || !ebookField || !audioField) return;

    const type = typeEl.value;
    ebookField.style.display = type === 'EBOOK' ? 'block' : 'none';
    audioField.style.display = type === 'AUDIOBOOK' ? 'block' : 'none';

    // Clear the non-active file input to prevent accidental uploads/overwrites
    if (type === 'EBOOK') {
        document.getElementById('admin-file-audio').value = '';
    } else if (type === 'AUDIOBOOK') {
        document.getElementById('admin-file-ebook').value = '';
    }
};

window.editProduct = async function (id) {
    console.log("✏️ Emergency Call: editProduct", id);
    const modal = document.getElementById('admin-product-modal');
    if (!modal) return alert("Error: Modal not found");

    try {
        const response = await fetch(`${API_BASE}/api/products/${id}`);
        const p = await response.json();

        document.getElementById('admin-prod-id').value = p._id;
        document.getElementById('admin-prod-title').value = p.title;
        document.getElementById('admin-prod-author').value = p.author || '';
        document.getElementById('admin-prod-type').value = p.type;
        document.getElementById('admin-prod-lang').value = p.language || 'Hindi';
        document.getElementById('admin-prod-volume').value = p.volume || '';
        document.getElementById('admin-prod-price').value = p.price;
        document.getElementById('admin-prod-discount-price').value = p.discountPrice || '';
        document.getElementById('admin-prod-stock').value = p.stock || 100;
        document.getElementById('admin-prod-weight').value = p.weight || '';
        document.getElementById('admin-prod-length').value = p.length || '';
        document.getElementById('admin-prod-width').value = p.breadth || '';
        document.getElementById('admin-prod-height').value = p.height || '';
        document.getElementById('admin-prod-duration').value = p.duration || '';
        document.getElementById('admin-prod-desc').value = p.description || '';

        // File displays
        const successBadge = '<span style="color: #2ecc71; font-weight: bold; margin-left:10px;"><i class="fas fa-check-circle"></i> Saved</span>';
        if (p.thumbnail) {
            document.getElementById('admin-current-cover').innerHTML = `Current: ${p.thumbnail.split('/').pop()} ${successBadge}`;
        }

        // Clear previous current displays
        document.getElementById('admin-current-ebook').innerHTML = '';
        document.getElementById('admin-current-audio').innerHTML = '';

        if (p.type === 'EBOOK' && p.filePath) {
            document.getElementById('admin-current-ebook').innerHTML = `Current E-Book: ${p.filePath.split('/').pop()} ${successBadge}`;
        } else if (p.type === 'AUDIOBOOK' && p.filePath) {
            document.getElementById('admin-current-audio').innerHTML = `Current Audiobook: ${p.filePath.split('/').pop()} ${successBadge}`;
        }

        document.getElementById('admin-modal-title').textContent = 'Edit Book';
        modal.classList.add('active');
        modal.style.display = 'flex';
        window.toggleAdminFileFields();
    } catch (e) {
        console.error(e);
        alert("Failed to load product details");
    }
};

window.deleteProduct = async function (id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            window.loadAdminProductsFull();
            window.updateAdminStats();
        } else alert('Delete failed');
    } catch (e) {
        console.error(e);
    }
};

window.updateAdminStats = async function () {
    try {
        const token = localStorage.getItem('authToken');
        const [productsRes, ordersRes] = await Promise.all([
            fetch(`${API_BASE}/api/products`),
            fetch(`${API_BASE}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const products = await productsRes.json();
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const revenue = orders.reduce((sum, o) => sum + (['Failed', 'Returned', 'Cancelled'].includes(o.status) ? 0 : o.totalAmount), 0);

        const totalProdEl = document.getElementById('admin-stat-total-products');
        const totalOrderEl = document.getElementById('admin-stat-total-orders');
        const revenueEl = document.getElementById('admin-stat-revenue');

        if (totalProdEl) totalProdEl.textContent = products.length;
        if (totalOrderEl) totalOrderEl.textContent = orders.length;
        if (revenueEl) revenueEl.textContent = '₹' + revenue.toLocaleString();
    } catch (e) { console.error(e); }
};

window.loadAdminProductsFull = async function () {
    try {
        console.log("🔄 Loading full product list...");
        const res = await fetch(`${API_BASE}/api/products`);
        allAdminProducts = await res.json();
        window.filterAdminProducts();
    } catch (e) { console.error("Load products error:", e); }
};

window.addEventListener('efv-security-violation', () => {
    // Destroy "decrypted buffers" (clear canvases)
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check - Redirect if not logged in
    const user = JSON.parse(localStorage.getItem('efv_user'));

    if (!user) {
        window.location.href = 'marketplace.html';
        return;
    }

    // 2. Initialize Dashboard
    initializeDashboard(user);

    // 3. Tab Logic
    const tabs = document.querySelectorAll('.nav-item[data-tab]');
    const sections = document.querySelectorAll('.content-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activate Clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Refresh specific data on tab switch
            if (targetId === 'admin') updateAdminStats();
            if (targetId === 'library') syncLibraryWithBackend();
            if (targetId === 'notifications') renderNotificationsTab();
            if (targetId === 'admin-orders') loadAdminOrdersFull();
            if (targetId === 'admin-products') loadAdminProductsFull();
            if (targetId === 'admin-customers') loadAdminCustomers();
            if (targetId === 'admin-payments') loadAdminPayments();
            if (targetId === 'admin-shipments') loadAdminShipments();
            if (targetId === 'admin-coupons') loadAdminCoupons();
            if (targetId === 'admin-reports') loadAdminReports();
        });
    });

    // 4. Logout
    // 4. Logout (Sidebar & Settings)
    const logoutAction = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('efv_user');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('adminLoggedIn');
            // Clear base keys to prevent data leakage to next anonymous user
            localStorage.removeItem('efv_digital_library');
            localStorage.removeItem('efv_purchase_history');
            localStorage.removeItem('efv_cart');
            window.location.href = 'index.html';
        }
    };

    const sidebarLogout = document.getElementById('dashboard-logout-btn');
    const settingsLogout = document.getElementById('settings-logout-btn');

    if (sidebarLogout) sidebarLogout.addEventListener('click', logoutAction);
    if (settingsLogout) settingsLogout.addEventListener('click', logoutAction);

    // 5. Initial Render
    renderCartTab();
    renderOrdersTab();
    renderLibraryTab();
    updateStats();
    if (typeof updateAuthNavbar === 'function') updateAuthNavbar();

    // Check for query param to open specific tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        switchTab(tabParam);
    }
});

// GLOBAL UI HELPERS
window.switchTab = function (tabId) {
    const tabBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (tabBtn) {
        // Trigger click if listener is attached
        tabBtn.click();
    } else {
        // Fallback manual switch
        document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        const section = document.getElementById(tabId);
        if (section) section.classList.add('active');

        // Load data
        if (tabId === 'admin') updateAdminStats();
        if (tabId === 'admin-orders') loadAdminOrdersFull();
        if (tabId === 'admin-products') loadAdminProductsFull();
    }
};

async function initializeDashboard(user) {
    document.getElementById('user-name-display').textContent = user.name;
    document.getElementById('settings-name').value = user.name;
    document.getElementById('settings-email').value = user.email;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);

    // Admin Check & Sidebar Customization
    const isAdmin = user.role === 'admin' || user.email.toLowerCase() === 'admin@uwo24.com';

    if (isAdmin) {
        // Hide Shopping Features for Admin
        const shoppingTabs = ['cart', 'orders', 'wishlist', 'notifications'];
        shoppingTabs.forEach(tabId => {
            const btn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
            if (btn) btn.classList.add('hidden');
        });

        const backToShop = document.getElementById('nav-back-to-shop');
        if (backToShop) {
            backToShop.classList.remove('hidden');
            const span = backToShop.querySelector('span');
            if (span) span.textContent = 'View Shop';
        }

        // Toggle Dashboard Overview Content for Admin
        const userStats = document.getElementById('user-stats-grid');
        const adminStats = document.getElementById('admin-stats-grid');
        const userPersonal = document.getElementById('user-personal-grid');
        const userSecondary = document.getElementById('user-secondary-grid');

        if (userStats) userStats.classList.add('hidden');
        if (adminStats) adminStats.classList.remove('hidden');
        if (userPersonal) userPersonal.classList.add('hidden');
        if (userSecondary) userSecondary.classList.add('hidden');

        // Show Admin/Management Features
        const adminBtn = document.getElementById('sidebar-admin-btn');
        if (adminBtn) adminBtn.classList.remove('hidden');
        document.querySelectorAll('.admin-nav').forEach(btn => btn.classList.remove('hidden'));

        // Load Admin Stats immediately
        if (typeof updateAdminStats === 'function') updateAdminStats();

        console.log("🛠️ Admin View Applied: Shopping features and Back to Shop hidden.");
    } else {
        // Normal User - Ensure shopping features are visible and admin hidden
        const shoppingTabs = ['cart', 'orders', 'wishlist', 'notifications'];
        shoppingTabs.forEach(tabId => {
            const btn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
            if (btn) btn.classList.remove('hidden');
        });

        const backToShop = document.getElementById('nav-back-to-shop');
        if (backToShop) {
            backToShop.classList.remove('hidden');
            const span = backToShop.querySelector('span');
            if (span) span.textContent = 'Back to Shop';
        }

        // Restore User Dashboard Overview
        const userStats = document.getElementById('user-stats-grid');
        const adminStats = document.getElementById('admin-stats-grid');
        const userPersonal = document.getElementById('user-personal-grid');
        const userSecondary = document.getElementById('user-secondary-grid');

        if (userStats) userStats.classList.remove('hidden');
        if (adminStats) adminStats.classList.add('hidden');
        if (userPersonal) userPersonal.classList.remove('hidden');
        if (userSecondary) userSecondary.classList.remove('hidden');

        const adminBtn = document.getElementById('sidebar-admin-btn');
        if (adminBtn) adminBtn.classList.add('hidden');
        document.querySelectorAll('.admin-nav').forEach(btn => btn.classList.add('hidden'));
    }

    // --- PROFESIONAL SYNC ---
    await fetchProfileData();
    syncLibraryWithBackend();
}

window.fetchProfileData = async function () {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profile = await res.json();

        if (res.ok) {
            window.currentUserProfile = profile;
            renderWishlistTab();
            renderNotificationsTab();
            renderSavedAddresses();
            updateDashboardOverview();
            updateStats();
        }
    } catch (e) {
        console.error("Profile fetch error:", e);
    }
}

function updateDashboardOverview() {
    const profile = window.currentUserProfile;
    if (!profile) return;

    // 1. Last Order Overview
    const lastOrderContent = document.getElementById('last-order-content');
    renderLastOrderOverview(lastOrderContent);

    // 2. Continue Reading/Listening
    updateReadingProgressShortcuts();

    // 3. Active Shipments
    renderActiveShipments();

    // 4. Newest Addition
    renderNewestAddition();
}

async function renderLastOrderOverview(container) {
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();
        if (orders && orders.length > 0) {
            const last = orders[0];
            const date = new Date(last.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h3 style="margin:0; font-size:1.1rem;">${last.orderId}</h3>
                        <p style="margin:2px 0; font-size:0.8rem; opacity:0.6;">${date} • ₹${last.totalAmount}</p>
                    </div>
                    <span class="status-badge ${getStatusClass(last.status)}">${last.status}</span>
                </div>
                <button class="btn btn-outline small" style="margin-top:10px; width:100%; border-color:rgba(255,255,255,0.1);" onclick="viewOrderDetail('${last._id}')">View Details</button>
            `;
        }
    } catch (e) { }
}

async function updateReadingProgressShortcuts() {
    const libKey = getUserKey('efv_digital_library');
    const library = JSON.parse(localStorage.getItem(libKey)) || [];

    const readingContent = document.getElementById('continue-reading-content');
    const listeningContent = document.getElementById('continue-listening-content');

    let bestReader = null;
    let bestListener = null;

    for (const item of library) {
        const prog = await fetchProgress(item.productId || item.id);
        if (prog) {
            if (item.type === 'E-Book' || item.type === 'EBOOK') {
                if (!bestReader || prog.updatedAt > bestReader.prog.updatedAt) bestReader = { item, prog };
            } else if (item.type === 'Audiobook' || item.type === 'AUDIOBOOK') {
                if (!bestListener || prog.updatedAt > bestListener.prog.updatedAt) bestListener = { item, prog };
            }
        }
    }

    if (bestReader) {
        readingContent.innerHTML = `
            <div style="display:flex; gap:12px; align-items:center;">
                <img src="${bestReader.item.thumbnail}" style="width:40px; height:55px; object-fit:cover; border-radius:4px;">
                <div>
                    <h3 style="margin:0; font-size:1rem;">${bestReader.item.name || bestReader.item.title}</h3>
                    <div style="height:3px; width:100px; background:rgba(255,255,255,0.1); margin-top:5px; border-radius:3px;">
                        <div style="height:100%; width:${bestReader.prog.progress}%; background:var(--gold-text); border-radius:3px;"></div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('continue-reading-card').onclick = () => accessContent(bestReader.item.type, bestReader.item.name || bestReader.item.title, bestReader.item.productId || bestReader.item.id);
    }

    if (bestListener) {
        listeningContent.innerHTML = `
            <div style="display:flex; gap:12px; align-items:center;">
                <img src="${bestListener.item.thumbnail}" style="width:40px; height:55px; object-fit:cover; border-radius:4px;">
                <div>
                    <h3 style="margin:0; font-size:1rem;">${bestListener.item.name || bestListener.item.title}</h3>
                    <p style="margin:0; font-size:0.75rem; color:var(--gold-text);">${Math.round(bestListener.prog.progress)}% Complete</p>
                </div>
            </div>
        `;
        document.getElementById('continue-listening-card').onclick = () => accessContent(bestListener.item.type, bestListener.item.name || bestListener.item.title, bestListener.item.productId || bestListener.item.id);
    }
}

function getStatusClass(status) {
    if (['Delivered', 'Completed', 'Processing'].includes(status)) return 'green-badge';
    if (['Shipped', 'Paid'].includes(status)) return 'gold-badge';
    if (['Cancelled', 'Failed', 'Payment Failed'].includes(status)) return 'red-badge';
    if (['Awaiting Payment'].includes(status)) return 'gold-badge';
    return '';
}

window.syncLibraryWithBackend = async function () {
    const user = JSON.parse(localStorage.getItem('efv_user'));
    const token = localStorage.getItem('authToken');
    if (!user || !token) return;

    try {
        const response = await fetch(`${API_BASE}/api/library/my-library`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            const libKey = getUserKey('efv_digital_library');

            // IMPORTANT: Clear localStorage and replace with clean backend data.
            // This prevents stale items (with 'id' field) from mixing with fresh
            // backend items (with 'productId' field) causing duplicates.
            localStorage.removeItem(libKey);

            const localLibrary = data.map(prod => ({
                id: prod.productId || prod._id || prod.id,        // keep 'id' field for cart.js compatibility
                productId: prod.productId || prod._id || prod.id, // keep 'productId' for profile.js
                name: prod.title || prod.name,
                title: prod.title || prod.name,
                type: prod.type,
                thumbnail: prod.thumbnail,
                filePath: prod.filePath,
                language: prod.language || '',
                subtitle: prod.subtitle || '',
                date: prod.purchasedAt ? new Date(prod.purchasedAt).toLocaleDateString() : new Date().toLocaleDateString()
            }));
            localStorage.setItem(libKey, JSON.stringify(localLibrary));

            renderLibraryTab(localLibrary);
            updateStats();
        }
    } catch (error) { console.error('Library sync error:', error); }
}


// --- TAB RENDERING: NOTIFICATIONS ---
function renderNotificationsTab() {
    const profile = window.currentUserProfile;
    const container = document.getElementById('notifications-list');
    const emptyState = document.getElementById('notifications-empty-state');
    const badge = document.getElementById('unread-notifications-count');

    if (!profile || !profile.notifications || profile.notifications.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        badge.classList.add('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    const unreadCount = profile.notifications.filter(n => !n.isRead).length;
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    container.innerHTML = profile.notifications.map(note => {
        const icon = getNotificationIcon(note.type);
        return `
            <div class="notification-item ${note.isRead ? '' : 'unread'}" onclick="markNotificationRead('${note._id}')">
                <div class="notification-icon ${note.type.toLowerCase()}">${icon}</div>
                <div class="notification-body">
                    <h5>${note.title}</h5>
                    <p>${note.message}</p>
                    <span class="notification-time">${new Date(note.createdAt).toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getNotificationIcon(type) {
    switch (type) {
        case 'Order': return '<i class="fas fa-shopping-bag"></i>';
        case 'Shipment': return '<i class="fas fa-truck"></i>';
        case 'Digital': return '<i class="fas fa-cloud-download-alt"></i>';
        default: return '<i class="fas fa-bell"></i>';
    }
}

window.markNotificationRead = async function (id) {
    const token = localStorage.getItem('authToken');
    await fetch(`${API_BASE}/api/users/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProfileData();
}

window.markAllNotificationsRead = async function () {
    const token = localStorage.getItem('authToken');
    await fetch(`${API_BASE}/api/users/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProfileData();
}

// --- TAB RENDERING: ADDRESSES ---
function renderSavedAddresses() {
    const profile = window.currentUserProfile;
    const container = document.getElementById('saved-addresses-grid');
    if (!profile || !profile.savedAddresses) return;

    if (profile.savedAddresses.length === 0) {
        container.innerHTML = `
            <div class="address-card glass-panel" style="grid-column: span 2; padding: 20px; text-align: center; border: 1px dashed rgba(255,255,255,0.1);">
                <p class="fade-text">No saved addresses found.</p>
            </div>`;
        return;
    }

    container.innerHTML = profile.savedAddresses.map(addr => `
        <div class="address-card glass-panel ${addr.isDefault ? 'default' : ''}">
            <h5>${addr.label} ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}</h5>
            <p class="address-text">
                <strong>${addr.fullName}</strong><br>
                ${addr.fullAddress}<br>
                ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                Phone: ${addr.phone}
            </p>
            <div class="address-actions">
                <button class="btn btn-outline small" onclick="openAddressModal('${addr._id}')">Edit</button>
                <button class="btn btn-danger small" style="background:transparent; border-color:transparent;" onclick="deleteAddress('${addr._id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// --- TAB RENDERING: ORDERS ---
async function renderOrdersTab() {
    const token = localStorage.getItem('authToken');
    const container = document.getElementById('dashboard-orders-list');
    const emptyState = document.getElementById('orders-empty-state');
    if (!container) return;

    let backendOrders = [];
    try {
        const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) backendOrders = await res.json();
    } catch (e) { console.error('Error fetching backend orders:', e); }

    // Get Local Orders
    const localOrders = JSON.parse(localStorage.getItem('orders')) || [];

    // Merge and deduplicate by Order ID (backend takes precedence)
    const allOrdersMap = new Map();
    localOrders.forEach(o => allOrdersMap.set(o.orderId, o));
    backendOrders.forEach(o => {
        // Map backend fields to match our display if needed
        allOrdersMap.set(o.orderId, {
            orderId: o.orderId,
            orderDate: o.createdAt,
            totalAmount: o.totalAmount,
            orderStatus: o.status,
            paymentStatus: o.paymentStatus || (o.status === 'Processing' ? 'Paid' : 'Pending'),
            products: o.items || []
        });
    });

    const combinedOrders = Array.from(allOrdersMap.values()).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    container.innerHTML = '';
    if (combinedOrders.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    container.innerHTML = combinedOrders.map(order => {
        const date = new Date(order.orderDate).toLocaleDateString();
        const itemsList = order.products.map(p => p.name || p.title).join(', ');

        return `
            <div class="order-card fade-in" style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:25px; border-radius:15px; margin-bottom:20px;">
                <div class="order-header" style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <div>
                        <span class="order-id" style="font-family:'Cinzel'; color:var(--gold-energy); font-weight:700;">#${order.orderId}</span>
                        <div class="order-date" style="font-size:0.8rem; opacity:0.6; margin-top:5px;">${date}</div>
                    </div>
                    <div style="text-align:right;">
                        <span class="status-badge ${getStatusClass(order.orderStatus)}">${order.orderStatus}</span>
                        <div style="font-size:0.75rem; opacity:0.8; margin-top:5px; color:${order.paymentStatus === 'Paid' ? '#2ecc71' : (order.paymentStatus === 'Failed' ? '#ff4d4d' : '#f1c40f')}">
                            Payment: ${order.paymentStatus}
                        </div>
                    </div>
                </div>
                <div class="order-products" style="border-bottom:1px solid var(--glass-border); padding-bottom:15px; margin-bottom:15px;">
                    <h4 style="margin:0 0 5px 0; font-size:1rem;">Items:</h4>
                    <p style="margin:0; font-size:0.9rem; opacity:0.8;">${itemsList}</p>
                </div>
                <div class="order-footer" style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="order-total">
                        <span style="opacity:0.6; font-size:0.9rem;">Total Amount:</span>
                        <span style="font-weight:800; color:var(--gold-energy); font-size:1.1rem; margin-left:10px;">₹${order.totalAmount}</span>
                    </div>
                    ${order.id || order._id ? `<button class="btn btn-outline small" style="width:auto; padding:5px 15px;" onclick="viewOrderDetail('${order.id || order._id}')">Track Order</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// --- TAB RENDERING: LIBRARY ---
// --- TAB RENDERING: LIBRARY ---
function renderLibraryTab(directData = null) {
    const libKey = getUserKey('efv_digital_library');
    let library = directData || JSON.parse(localStorage.getItem(libKey)) || [];

    // Deduplicate Library Items - normalize all items first so different key formats
    // ('id' from cart.js vs 'productId' from backend) all map to the same canonical key.
    const uniqueMap = new Map();
    library = library
        .map(item => {
            const prodId = (item.productId || item.id || item._id || '').toString();
            const title = (item.name || item.title || '').trim();
            const type = (item.type || '').split(' ')[0].split('-')[0].toLowerCase(); // Normalized type prefix (e-book -> e, audiobook -> a)

            return {
                ...item,
                productId: prodId,
                id: prodId,
                title: title,
                name: title,
                // Create a truly unique key: Name + Simplified Type
                // This prevents "Dummy ID" and "Real ID" versions of the same book from co-existing
                uniqueContentKey: `${title}_${type}_${item.language || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '_')
            };
        })
        .filter(item => {
            if (!item.productId && !item.uniqueContentKey) return false;

            // Deduplicate by Content Key (Name + Type) - most reliable
            const key = item.uniqueContentKey;
            if (uniqueMap.has(key)) return false;
            uniqueMap.set(key, true);
            return true;
        });

    const container = document.getElementById('dashboard-library-list');
    const emptyState = document.getElementById('library-empty-state');

    if (library.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // Fetch all progress data in parallel first to avoid overlapping appends
    Promise.all(library.map(async (item) => {
        const prodId = item.productId || item.id || item._id;
        const progress = await fetchProgress(prodId);

        const rawType = (item.type || '').toLowerCase();
        const isAudio = rawType.includes('audio');
        const actionLabel = isAudio ? 'Listen Now' : 'Read Now';
        const icon = isAudio ? 'fa-headphones' : 'fa-book-open';

        let progressHtml = '';
        if (progress) {
            const percent = progress.progress || 0;
            progressHtml = `
                <div class="card-progress-container" style="margin-top:10px;">
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span>${Math.round(percent)}% Complete</span>
                    </div>
                    <div style="height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: var(--gold-text); border-radius: 2px;"></div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="dashboard-card fade-in">
                <div class="card-image-container">
                    <span class="card-type-badge">${item.type}</span>
                    <img src="${item.thumbnail}" alt="${item.name}" class="card-image">
                </div>
                <div class="card-details">
                    ${item.language ? `<span style="display:inline-block; background: rgba(212,175,55,0.15); border: 1px solid var(--gold-energy); color: var(--gold-energy); padding: 1px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-bottom: 5px; text-transform: uppercase;">${item.language} Edition</span>` : ''}
                    <h3 class="card-title">${item.name || item.title}</h3>
                    <p class="card-subtitle">Purchased: ${item.date || 'Recently'}</p>
                    ${progressHtml}
                    <div class="card-actions" style="margin-top:auto; padding-top:10px;">
                        <button class="btn-dashboard btn-primary" onclick="accessContent('${item.type}', '${(item.name || item.title).replace(/'/g, "\\'")}', '${prodId}')">
                            <i class="fas ${icon}"></i> ${actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    })).then(cardsHtml => {
        container.innerHTML = cardsHtml.join('');
    });
}

function updateStats() {
    const profile = window.currentUserProfile;
    if (!profile) return;

    const libKey = getUserKey('efv_digital_library');
    const library = JSON.parse(localStorage.getItem(libKey)) || [];

    document.getElementById('stat-total-digital').textContent = library.length;

    const token = localStorage.getItem('authToken');
    fetch(`${API_BASE}/api/orders/my-orders`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(orders => {
            document.getElementById('stat-total-orders').textContent = orders.length;
            const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
            document.getElementById('stat-total-spent').textContent = '₹' + totalSpent.toLocaleString();
        });
}

// --- TAB RENDERING: CART ---
// --- TAB RENDERING: CART ---
window.renderCartTab = function () {
    const cart = JSON.parse(localStorage.getItem('efv_cart')) || [];
    const container = document.getElementById('dashboard-cart-list');
    const emptyState = document.getElementById('cart-empty-state');
    const badge = document.getElementById('sidebar-cart-count');

    if (badge) {
        // Only count PHYSICAL items
        const physicalItems = cart.filter(item => !item.id.includes('audio') && !item.id.includes('ebook'));
        const count = physicalItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }

    if (!container || !emptyState) return;

    // Filter for display as well
    const displayItems = cart.filter(item => !item.id.includes('audio') && !item.id.includes('ebook'));

    if (displayItems.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = displayItems.map((item, index) => `
        <div class="dashboard-card fade-in">
            <div class="card-details">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-subtitle">${item.type || 'Product'}</p>
                <div class="card-meta">
                    <span class="card-price">₹${item.price} x ${item.quantity || 1}</span>
                    <span class="gold-text" style="margin-left:auto; font-weight:bold;">₹${item.price * (item.quantity || 1)}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-dashboard btn-danger" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                    <button class="btn-dashboard btn-primary" onclick="buyNowFromDashboard(${index})">Checkout</button>
                </div>
            </div>
        </div>
    `).join('');
};

// --- ACTIONS ---

window.removeFromCart = function (index) {
    let cart = JSON.parse(localStorage.getItem('efv_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('efv_cart', JSON.stringify(cart));
    renderCartTab();
    // Dispatch event so main nav cart count functionality updates if we were on same page
    // (though we are on isolated dashboard page, so it doesn't matter much)
};

window.buyNowFromDashboard = function (index) {
    let cart = JSON.parse(localStorage.getItem('efv_cart')) || [];
    const item = cart[index];

    if (!item) return;

    // Trigger Razorpay logic
    // We can reuse the checkoutOrder function from cart.js IF we import it,
    // OR we can replicate the simplified flow here since we already have the item.

    // For simplicity and robustness in this isolated page, we'll emulate the checkout flow
    // directly here or assume a global checkout function exists.

    // Actually, create a tailored checkout for dashboard that accepts a single item
    initiateDashboardCheckout([item], true, index);
};

async function initiateDashboardCheckout(items, isSingleItemMode, cartIndexToRemove) {
    const user = JSON.parse(localStorage.getItem('efv_user'));
    const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Basic Razorpay options since we don't have the full backend integration setup in this file
    // Ideally we call the same backend endpoints

    try {
        // Create Order
        const rzpRes = await fetch(`${API_BASE}/api/orders/razorpay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
        });
        const rzpOrderData = await rzpRes.json();

        if (!rzpRes.ok) throw new Error(rzpOrderData.message || 'Payment init failed');

        const options = {
            key: 'rzp_live_SBFlInxBiRfOGd',
            amount: rzpOrderData.amount,
            currency: rzpOrderData.currency,
            name: 'EFV Dashboard Checkout',
            description: 'Order from Dashboard',
            order_id: rzpOrderData.id,
            prefill: { name: user.name, email: user.email },
            theme: { color: '#FFD369' },
            handler: async function (response) {
                // Verification (Simulated for UI flow speed, or call backend)
                // Assuming success for UX demo flow

                // 1. Move to Orders
                const historyKey = getUserKey('efv_purchase_history');
                let history = JSON.parse(localStorage.getItem(historyKey)) || [];

                items.forEach(item => {
                    // Check if exists? Orders are usually unique transactions, but we stack qty
                    history.push({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        date: new Date().toLocaleDateString()
                    });
                });
                localStorage.setItem(historyKey, JSON.stringify(history));

                // 2. Add to Library if Digital
                const libKey = getUserKey('efv_digital_library');
                let library = JSON.parse(localStorage.getItem(libKey)) || [];

                items.forEach(item => {
                    const isAudio = item.name.toLowerCase().includes('audiobook');
                    const isEbook = item.name.toLowerCase().includes('e-book') || item.name.toLowerCase().includes('ebook');

                    if (isAudio || isEbook) {
                        // Check duplicates
                        const key = `${item.name}_${item.language || ''}`.toLowerCase();
                        if (!library.some(l => `${l.name}_${l.language || ''}`.toLowerCase() === key)) {
                            library.push({
                                id: item.id || Date.now(), // Fallback ID
                                name: item.name,
                                language: item.language || '',
                                subtitle: item.subtitle || '',
                                type: isAudio ? 'Audiobook' : 'E-Book',
                                date: new Date().toLocaleDateString()
                            });
                        }
                    }
                });
                localStorage.setItem(libKey, JSON.stringify(library));

                // 3. Remove from Cart
                if (isSingleItemMode && cartIndexToRemove !== undefined) {
                    removeFromCart(cartIndexToRemove);
                }

                // 4. Update UI
                alert('Payment Successful! Item moved to Orders/Library.');
                renderCartTab();
                renderOrdersTab();
                renderLibraryTab();
                updateStats();

                // Switch to Orders Tab
                document.querySelector('.nav-item[data-tab="orders"]').click();
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (e) {
        alert('Payment Initialization Failed: ' + e.message);
    }
}

window.accessContent = function (type, name, id) {
    console.log(`📂 Accessing Content | Requested Type: ${type} | Name: ${name} | ID: ${id}`);
    if (typeof accessDigitalContent === 'function') {
        accessDigitalContent(name, id, type); // Pass type
    } else {
        console.error("Secure Content System not loaded");
        alert("System update in progress. Please refresh.");
    }
};

// --- SECURE DIGITAL CONTENT SYSTEM ---

// Configuration
const CONTENT_CONFIG = {
    pdfWorkerSrc: 'js/pdfjs/pdf.worker.min.js',
    contentApi: `${API_BASE}/api/content`,
    progressApi: `${API_BASE}/api/progress`
};

// --- PDF READER IMPLEMENTATION (Vertical Scroll) ---
window.openEbookReader = async function (product) {
    const readerId = 'efv-reader-modal';
    if (document.getElementById(readerId)) return;

    // 1. Fetch saved progress
    let savedState = await fetchProgress(product._id);
    let lastLoadedPage = savedState?.lastPage || 1;
    let totalPages = 0;
    let pdfDoc = null;
    let scale = 1.5;

    // 2. Create Reader UI
    const readerHtml = `
        <div id="${readerId}" class="reader-overlay" oncontextmenu="return false;">
            <div class="reader-toolbar glass-panel">
                <div class="reader-title">${product.name}</div>
                <div class="reader-controls">
                    <span id="page-indicator">Scroll to Read</span>
                    <button class="btn-icon" id="close-reader" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="reader-canvas-container" id="reader-container">
                <!-- Pages will be injected here -->
            </div>
            <div class="reader-loading">
                <div class="reader-spinner"></div>
                <p>Loading Secure Content...</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', readerHtml);
    if (window.efvSecurity) {
        window.efvSecurity.isTampered = false;
        window.efvSecurity.enable(); // Actively start protection
        window.efvSecurity.applyWatermark(document.getElementById(readerId));
    }
    document.getElementById(readerId).classList.add('no-select');

    const container = document.getElementById('reader-container');
    const indicator = document.getElementById('page-indicator');
    const loading = document.querySelector('.reader-loading');

    // 3. Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = CONTENT_CONFIG.pdfWorkerSrc;

    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Please re-login");

        const effectiveId = product._id || product.id;
        let url = `${CONTENT_CONFIG.contentApi}/ebook/${effectiveId}?token=${token}&t=${Date.now()}`;

        const loadingTask = pdfjsLib.getDocument({
            url: `${url}&pdfjs_cache_buster=${Date.now()}`,
            httpHeaders: { 'Authorization': `Bearer ${token}` }
        });

        pdfDoc = await loadingTask.promise;
        totalPages = pdfDoc.numPages;
        loading.style.display = 'none';

        // 4. Create Page Wrappers
        for (let i = 1; i <= totalPages; i++) {
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'pdf-page-wrapper';
            pageWrapper.dataset.pageNumber = i;
            pageWrapper.id = `page-${i}`;

            const canvas = document.createElement('canvas');
            pageWrapper.appendChild(canvas);
            container.appendChild(pageWrapper);
        }

        // 5. Intersection Observer for Lazy Rendering & Progress tracking
        const observerOptions = {
            root: container,
            threshold: [0.1, 0.5] // Track multiple points
        };

        const pageObserver = new IntersectionObserver((entries) => {
            // Find the page that is most visible
            const visiblePages = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visiblePages.length > 0) {
                const entry = visiblePages[0];
                const pageNum = parseInt(entry.target.dataset.pageNumber);

                renderPageToCanvas(pageNum);

                // Update indicator if high confidence
                if (entry.intersectionRatio > 0.4 || visiblePages.length === 1) {
                    indicator.textContent = `Page ${pageNum} of ${totalPages}`;

                    // Debounced sync to avoid spamming server
                    if (window._syncTimeout) clearTimeout(window._syncTimeout);
                    window._syncTimeout = setTimeout(() => {
                        const calculatedProgress = (pageNum / totalPages) * 100;
                        syncProgress(product._id, 'EBOOK', {
                            lastPage: pageNum,
                            totalPages: totalPages,
                            progress: calculatedProgress
                        });
                    }, 1000);
                }
            }
        }, observerOptions);

        // Observe all page wrappers
        document.querySelectorAll('.pdf-page-wrapper').forEach(wrapper => {
            pageObserver.observe(wrapper);
        });

        // 6. Resume to last page if requested (Custom Professional Modal)
        if (lastLoadedPage > 1) {
            const resumeModalHtml = `
            <div id="ebook-resume-overlay" class="resume-modal-overlay active">
                <div class="resume-modal">
                    <i class="fas fa-book-open"></i>
                    <h3>Continue Reading?</h3>
                    <p>You previously read up to <span style="color:white; font-weight:bold;">Page ${lastLoadedPage}</span>.<br>Continue from where you left off?</p>
                    <div class="resume-actions">
                        <button id="btn-ebook-resume" class="btn-resume-primary">
                            <i class="fas fa-bookmark"></i> Continue from Page ${lastLoadedPage}
                        </button>
                        <button id="btn-ebook-restart" class="btn-resume-secondary">
                            <i class="fas fa-redo"></i> Start from Beginning
                        </button>
                    </div>
                </div>
            </div>
        `;
            document.getElementById(readerId).insertAdjacentHTML('beforeend', resumeModalHtml);

            document.getElementById('btn-ebook-resume').addEventListener('click', () => {
                document.getElementById('ebook-resume-overlay').remove();
                setTimeout(() => {
                    const targetPage = document.getElementById(`page-${lastLoadedPage}`);
                    if (targetPage) targetPage.scrollIntoView();
                }, 500);
            });

            document.getElementById('btn-ebook-restart').addEventListener('click', () => {
                document.getElementById('ebook-resume-overlay').remove();
                container.scrollTop = 0;
                syncProgress(product._id, 'EBOOK', { lastPage: 1, totalPages: totalPages });
            });
        }

    } catch (error) {
        console.error("Reader Error:", error);
        alert("Failed to load PDF. Please ensure you are logged in.");
        document.getElementById(readerId).remove();
        return;
    }

    async function renderPageToCanvas(num) {
        const wrapper = document.getElementById(`page-${num}`);
        const canvas = wrapper.querySelector('canvas');
        if (wrapper.dataset.rendered === 'true') return;

        try {
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: scale });
            const ctx = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            wrapper.dataset.rendered = 'true';
        } catch (err) {
            console.error(`Page ${num} rendering failed`, err);
        }
    }

    // 7. Event Listeners
    document.getElementById('close-reader').addEventListener('click', () => {
        document.getElementById(readerId).remove();
        if (window.efvSecurity) window.efvSecurity.disable(); // Stop protection when closing
        // Refresh library tab to show new progress
        renderLibraryTab();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById(readerId)) {
            document.getElementById(readerId).remove();
        }
    });
};

// --- AUDIOBOOK PLAYER IMPLEMENTATION (Resume Support) ---
window.playAudiobook = async function (product) {
    const bookId = product._id || product.id;
    const playerModalId = 'audio-player-modal';
    const resumeModalId = 'audio-resume-modal';

    // Remove existing players
    if (document.getElementById(playerModalId)) document.getElementById(playerModalId).remove();

    const token = localStorage.getItem('authToken');

    // 1. Fetch saved progress (API or LocalStorage)
    let savedState = await fetchProgress(bookId);
    if (!savedState) {
        const local = localStorage.getItem(`audiobook_${bookId}_progress`);
        if (local) savedState = JSON.parse(local);
    }

    // 2. Main Player UI
    const audioHtml = `
        <div id="${playerModalId}" class="reader-overlay">
            <div class="reader-toolbar glass-panel">
                <div class="reader-title"><i class="fas fa-headphones"></i> ${product.name}</div>
                <button class="btn-icon" onclick="closeAudioPlayer()" title="Close"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="reader-canvas-container" style="justify-content: center; align-items: center;">
                <div class="dashboard-card" style="max-width: 400px; padding: 40px; text-align: center; background: rgba(255,255,255,0.02);">
                    <img src="${getImageForProduct(product.name)}" style="width: 200px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 30px;">
                    <h2 style="color: var(--gold-text); margin-bottom: 20px;">${product.name}</h2>
                    
                    <div id="audio-progress-info" style="margin-bottom: 20px; font-size: 0.9rem; opacity: 0.8;">
                        <div class="reader-spinner" id="audio-loader" style="width: 30px; height: 30px;"></div>
                        <p id="audio-status-text">Synchronizing Stream...</p>
                    </div>

                    <audio id="efv-audio-player" 
                        src="${CONTENT_CONFIG.contentApi}/audio/${bookId}?token=${token || ''}&t=${Date.now()}"
                        style="width: 100%; filter: invert(1) hue-rotate(180deg);" 
                        controls controlsList="nodownload">
                    </audio>

                    <p style="margin-top: 30px; font-size: 0.8rem; opacity: 0.4;">
                        <i class="fas fa-lock"></i> Encrypted Content Stream
                    </p>
                </div>
            </div>

            <!-- Professional Resume Modal overlay -->
            <div id="${resumeModalId}" class="resume-modal-overlay">
                <div class="resume-modal">
                    <i class="fas fa-headphones"></i>
                    <h3>Continue Listening?</h3>
                    <p>You previously listened up to <span id="resume-time-display" style="color:white; font-weight:bold;">0:00</span>.<br>Continue from where you left off?</p>
                    <div class="resume-actions">
                        <button id="btn-audio-resume" class="btn-resume-primary">
                            <i class="fas fa-play"></i> Continue from <span id="resume-btn-time">0:00</span>
                        </button>
                        <button id="btn-audio-restart" class="btn-resume-secondary">
                            <i class="fas fa-redo"></i> Start from Beginning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', audioHtml);
    if (window.efvSecurity) {
        window.efvSecurity.isTampered = false;
        window.efvSecurity.enable(); // Actively start protection
        window.efvSecurity.applyWatermark(document.getElementById(playerModalId));
    }
    document.getElementById(playerModalId).classList.add('no-select');
    document.body.classList.add('modal-open');

    const audio = document.getElementById('efv-audio-player');
    const statusText = document.getElementById('audio-status-text');
    const loader = document.getElementById('audio-loader');
    const resumeOverlay = document.getElementById(resumeModalId);

    let saveInterval = null;

    // 3. Save Logic helper
    const saveProgress = () => {
        if (audio.currentTime < 1) return;

        const progressData = {
            currentTime: audio.currentTime,
            totalDuration: audio.duration || 0,
            progress: (audio.currentTime / (audio.duration || 1)) * 100
        };

        console.log(`💾 Progress Saving | ${formatTime(audio.currentTime)} | ${progressData.progress.toFixed(1)}%`);

        // Clear if finished (> 95%)
        if (progressData.progress > 95) {
            console.log("🏁 Audiobook finished, resetting progress.");
            if (token) syncProgress(bookId, 'AUDIOBOOK', { currentTime: 0, progress: 0 });
            localStorage.removeItem(`audiobook_${bookId}_progress`);
            return;
        }

        // Save to Local
        localStorage.setItem(`audiobook_${bookId}_progress`, JSON.stringify(progressData));

        // Save to Backend if logged in
        if (token) {
            syncProgress(bookId, 'AUDIOBOOK', progressData);
        }
    };

    // 4. Initialization & Meta
    audio.addEventListener('loadedmetadata', () => {
        loader.style.display = 'none';
        statusText.textContent = "Ready: " + formatTime(audio.duration);

        console.log("🔍 Syncing saved progress:", savedState);

        // Check if worth resuming (>1s and <95%)
        if (savedState && savedState.currentTime > 1) {
            const hasFinished = (savedState.currentTime / audio.duration) > 0.95;
            if (!hasFinished) {
                console.log(`🎯 Found resume point at ${formatTime(savedState.currentTime)}`);
                document.getElementById('resume-time-display').textContent = formatTime(savedState.currentTime);
                document.getElementById('resume-btn-time').textContent = formatTime(savedState.currentTime);
                resumeOverlay.classList.add('active');
            } else {
                audio.play().catch(() => { });
            }
        } else {
            audio.play().catch(() => { });
        }
    });

    // 5. Playback Listeners
    audio.addEventListener('play', () => {
        saveInterval = setInterval(saveProgress, 5000);
    });

    audio.addEventListener('pause', () => {
        if (saveInterval) clearInterval(saveInterval);
        saveProgress();
    });

    // 6. Resume Modal Actions
    document.getElementById('btn-audio-resume').addEventListener('click', () => {
        audio.currentTime = savedState.currentTime;
        resumeOverlay.classList.remove('active');
        audio.play();
    });

    document.getElementById('btn-audio-restart').addEventListener('click', () => {
        audio.currentTime = 0;
        resumeOverlay.classList.remove('active');
        localStorage.removeItem(`audiobook_${bookId}_progress`);
        audio.play();
    });

    window.closeAudioPlayer = function () {
        saveProgress();
        if (saveInterval) clearInterval(saveInterval);
        document.getElementById(playerModalId).remove();
        document.body.classList.remove('modal-open');
        if (window.efvSecurity) window.efvSecurity.disable(); // Stop protection when closing
        // Refresh library tab to show new progress
        renderLibraryTab();
    };

    // Global save on close
    window.addEventListener('beforeunload', saveProgress);
    window.addEventListener('pagehide', saveProgress);
};

// --- API HELPERS ---
async function fetchProgress(productId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        // Add timestamp to prevent caching
        const res = await fetch(`${CONTENT_CONFIG.progressApi}/${productId}?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        return json.found ? json.data : null;
    } catch (e) {
        console.error("Progress fetch error", e);
        return null;
    }
}

async function syncProgress(productId, type, data) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        await fetch(`${CONTENT_CONFIG.progressApi}/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, ...data })
        });
    } catch (e) {
        console.error("Progress sync error", e);
    }
}

// FORMAT HELPER
function formatTime(seconds) {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// MAIN ENTRY POINT
window.accessDigitalContent = function (name, id, type) {
    console.log(`🚀 Dispatching Content Request | Name: ${name} | ID: ${id} | Type: ${type}`);

    // Determine type from parameter or fallback
    const resolvedType = (type || (name.toLowerCase().includes('audio') ? 'Audiobook' : 'E-Book')).toLowerCase();

    // Normalize type string to match player expectations
    const isAudio = resolvedType.includes('audio');

    if (!id) {
        console.error("❌ Cannot access content: Missing Product ID");
        alert("Content data is outdated. Please click 'Sync Library' button above.");
        return;
    }

    const product = {
        _id: id,
        name: name,
        id: id,
        type: isAudio ? 'AUDIOBOOK' : 'EBOOK'
    };

    console.log(`✅ Final Product Resolved:`, product);

    if (isAudio) {
        playAudiobook(product);
    } else {
        openEbookReader(product);
    }
};

// Helper for images
function getImageForProduct(name) {
    if (name.includes('VOL 1')) return 'img/vol1-cover.png';
    if (name.includes('VOL 2')) return 'img/vol 2.png';
    return 'img/vol1-cover.png';
}


// --- ADMIN PORTAL LOGIC ---

// --- NEW ADMIN MANAGEMENT FUNCTIONS ---
let allAdminProducts = [];

window.updateAdminStats = async function () {
    try {
        const token = localStorage.getItem('authToken');
        const [productsRes, ordersRes] = await Promise.all([
            fetch(`${API_BASE}/api/products`),
            fetch(`${API_BASE}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const products = await productsRes.json();
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const revenue = orders.reduce((sum, o) => sum + (['Failed', 'Returned', 'Cancelled'].includes(o.status) ? 0 : o.totalAmount), 0);

        const totalProdEl = document.getElementById('admin-stat-total-products');
        const totalOrderEl = document.getElementById('admin-stat-total-orders');
        const revenueEl = document.getElementById('admin-stat-revenue');

        if (totalProdEl) totalProdEl.textContent = products.length;
        if (totalOrderEl) totalOrderEl.textContent = orders.length;
        if (revenueEl) revenueEl.textContent = '₹' + revenue.toLocaleString();
    } catch (e) { console.error(e); }
};

window.loadAdminOrdersFull = async function () {
    const tbody = document.getElementById('admin-orders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">Loading orders...</td></tr>';

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();

        tbody.innerHTML = '';
        orders.reverse().forEach(o => {
            const date = new Date(o.createdAt).toLocaleDateString();
            const items = o.items.map(i => `${i.quantity}x ${i.title}`).join(', ');
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding: 12px; font-family: monospace;">#${o._id.slice(-6)}</td>
                <td style="padding: 12px;">${date}</td>
                <td style="padding: 12px;">${o.customer.name}<br><small style="opacity:0.6;">${o.customer.phone || 'N/A'}</small></td>
                <td style="padding: 12px;"><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${items}</div></td>
                <td style="padding: 12px; font-weight:bold;">₹${o.totalAmount}</td>
                <td style="padding: 12px;"><span class="badge ${o.paymentStatus === 'Paid' ? 'green' : 'gold'}">${o.paymentStatus}</span></td>
                <td style="padding: 12px;">
                    <select onchange="updateOrderStatus('${o._id}', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,211,105,0.3); padding: 4px; border-radius: 4px; font-size: 0.8rem;">
                        ${['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Failed'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td style="padding: 12px;">
                    <button class="btn btn-outline small" onclick="alert('Order Details:\\n\\nAddress: ${o.customer.address}\\nCourier: Pending\\nApayID: ${o.razorpayPaymentId || 'N/A'}')">View</button>
                    <button class="btn-icon" style="color: #ff4d4d; margin-left:10px;"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
};

window.filterAdminProducts = function () {
    const searchEl = document.getElementById('admin-product-search');
    const typeEl = document.getElementById('admin-product-filter-type');
    const stockEl = document.getElementById('admin-product-filter-stock');

    if (!searchEl || !typeEl || !stockEl) return;

    const searchTerm = searchEl.value.toLowerCase();
    const typeFilter = typeEl.value;
    const stockFilter = stockEl.value;

    let filtered = allAdminProducts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm) || (p.author && p.author.toLowerCase().includes(searchTerm));

        let matchesType = true;
        if (typeFilter === 'physical') {
            matchesType = ['HARDCOVER', 'PAPERBACK'].includes(p.type);
        } else if (typeFilter !== 'all') {
            matchesType = p.type === typeFilter;
        }

        let matchesStock = true;
        if (stockFilter === 'instock') {
            matchesStock = (p.stock || 0) > 0;
        } else if (stockFilter === 'outofstock') {
            matchesStock = (p.stock || 0) <= 0;
        }

        return matchesSearch && matchesType && matchesStock;
    });

    // --- SERIES SORTING LOGIC ---
    const typeOrder = { 'HARDCOVER': 1, 'PAPERBACK': 2, 'AUDIOBOOK': 3, 'EBOOK': 4 };
    const langOrder = { 'Hindi': 1, 'English': 2 };

    filtered.sort((a, b) => {
        // Helper to get volume
        const getVol = (p) => {
            if (p.volume) return parseInt(p.volume);
            const match = (p.title || '').match(/VOL\s*(\d+)/i);
            return match ? parseInt(match[1]) : 99;
        };

        // 1. Volume Sort (Numerical)
        const volA = getVol(a);
        const volB = getVol(b);
        if (volA !== volB) return volA - volB;

        // 2. Language Sort (Hindi first)
        const langA = langOrder[a.language] || 3;
        const langB = langOrder[b.language] || 3;
        if (langA !== langB) return langA - langB;

        // 3. Format Type Sort (HC -> PB -> Audio -> Ebook)
        const orderA = typeOrder[a.type] || 99;
        const orderB = typeOrder[b.type] || 99;
        return orderA - orderB;
    });

    window.renderAdminProducts(filtered);
};

window.renderAdminProducts = function (products) {
    const tbody = document.getElementById('admin-product-table-body-full');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; opacity:0.5;">No products found matching filters.</td></tr>';
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

        // Dynamic Thumbnail Resolver
        let thumbUrl = 'img/placeholder.png';
        if (p.thumbnail) {
            if (p.thumbnail.startsWith('http')) {
                thumbUrl = p.thumbnail;
            } else if (p.thumbnail.startsWith('img/')) {
                // Shared frontend images
                thumbUrl = p.thumbnail;
            } else {
                // Backend uploads
                thumbUrl = `${API_BASE}/${p.thumbnail}`;
            }
        }

        tr.innerHTML = `
            <td style="padding: 12px;"><img src="${thumbUrl}" style="width: 45px; height: 65px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);"></td>
            <td style="padding: 12px;">
                <div style="font-weight: 600; color: white;">${p.title}</div>
                <div style="font-size: 0.8rem; opacity: 0.6; margin-top: 2px;">${p.author || 'EFV Author'}</div>
            </td>
            <td style="padding: 12px;"><span class="badge" style="background: rgba(255,211,105,0.1); color: var(--gold-text); font-size: 0.75rem;">${p.type}</span></td>
            <td style="padding: 12px;"><strong>₹${p.price}</strong>${p.discountPrice ? `<br><small style="text-decoration: line-through; opacity: 0.5;">₹${p.discountPrice}</small>` : ''}</td>
            <td style="padding: 12px;">
                ${(p.type === 'EBOOK' || p.type === 'AUDIOBOOK') ?
                (p.filePath ?
                    `<div style="display:flex; flex-direction:column; gap:4px;">
                            <span style="color: #2ecc71; font-size: 0.75rem;"><i class="fas fa-check-circle"></i> OK</span>
                            <button onclick="window.editProduct('${p._id}')" style="background:none; border:none; color:var(--gold-text); font-size:0.7rem; cursor:pointer; padding:0; text-align:left; text-decoration:underline;">Update File</button>
                        </div>` :
                    `<div style="display:flex; flex-direction:column; gap:4px;">
                            <span style="color: #ff4d4d; font-size: 0.75rem;"><i class="fas fa-exclamation-triangle"></i> Missing</span>
                            <button onclick="window.editProduct('${p._id}')" class="btn btn-gold small" style="padding: 2px 8px; font-size: 0.65rem; width:auto;">Upload Now</button>
                        </div>`)
                : '<span style="opacity: 0.3; font-size: 0.75rem;">N/A (Physical)</span>'}
            </td>
            <td style="padding: 12px;">
                <span style="color: ${(p.stock || 0) <= 0 ? '#ff4d4d' : 'inherit'}">
                    ${p.stock || 0}
                </span>
                <br><small style="opacity:0.5;">qty</small>
            </td>
            <td style="padding: 12px;">
                <div style="display: flex; gap: 5px;">
                    <button onclick="window.editProduct('${p._id}')" class="btn-icon" style="color: var(--gold-text);" title="Edit Product"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteProduct('${p._id}')" class="btn-icon" style="color: #ff4d4d;" title="Delete Product"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.loadAdminCustomers = async function () {
    const tbody = document.getElementById('admin-customers-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Fetching customers...</td></tr>';

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();

        tbody.innerHTML = '';
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding: 12px;">${u.name}</td>
                <td style="padding: 12px;">${u.email}</td>
                <td style="padding: 12px;">${u.phone || 'N/A'}</td>
                <td style="padding: 12px;">-</td>
                <td style="padding: 12px;">-</td>
                <td style="padding: 12px;"><button class="btn btn-outline small">Profile</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
};

window.loadAdminPayments = async function () {
    const tbody = document.getElementById('admin-payments-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; opacity:0.5;">No payment records found yet.</td></tr>';
};

window.loadAdminShipments = async function () {
    const tbody = document.getElementById('admin-shipments-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; opacity:0.5;">No active shipments. Ready for Shiprocket integration.</td></tr>';
};

window.loadAdminCoupons = async function () {
    const tbody = document.getElementById('admin-coupons-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; opacity:0.5;">No coupons created yet.</td></tr>';
};

window.loadAdminReports = function () {
    console.log("Analytics view loaded with dummy charts.");
};

window.updateOrderStatus = async function (id, status) {
    const note = prompt(`Updating order ${id} to ${status}. Add a note?`, `Status updated to ${status}`);
    if (note === null) return;

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, note })
        });

        if (res.ok) {
            if (document.getElementById('admin-orders').classList.contains('active')) loadAdminOrdersFull();
            updateAdminStats();
        } else alert('Failed to update status');
    } catch (e) {
        console.error(e);
        alert('Server error');
    }
};

// Handle Product Form Submission
if (document.getElementById('admin-product-form')) {
    document.getElementById('admin-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Processing...';
        btn.disabled = true;

        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();

            const cover = document.getElementById('admin-file-cover').files[0];
            const ebook = document.getElementById('admin-file-ebook').files[0];
            const audio = document.getElementById('admin-file-audio').files[0];

            if (cover) formData.append('cover', cover);
            if (ebook) formData.append('ebook', ebook);
            if (audio) formData.append('audio', audio);

            let uploadData = {};
            if (cover || ebook || audio) {
                const uploadRes = await fetch(`${API_BASE}/api/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const result = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error(result.message || 'File upload failed');
                }
                if (result.paths) uploadData = result.paths;
            }

            const productId = document.getElementById('admin-prod-id').value;
            const isEdit = !!productId;

            const productData = {
                title: document.getElementById('admin-prod-title').value,
                author: document.getElementById('admin-prod-author').value,
                type: document.getElementById('admin-prod-type').value,
                language: document.getElementById('admin-prod-lang').value || 'Hindi',
                volume: document.getElementById('admin-prod-volume').value || '',
                price: Number(document.getElementById('admin-prod-price').value),
                discountPrice: Number(document.getElementById('admin-prod-discount-price').value) || null,
                stock: Number(document.getElementById('admin-prod-stock').value) || 0,
                weight: Number(document.getElementById('admin-prod-weight').value) || 0,
                length: Number(document.getElementById('admin-prod-length').value) || 0,
                breadth: Number(document.getElementById('admin-prod-width').value) || 0,
                height: Number(document.getElementById('admin-prod-height').value) || 0,
                duration: document.getElementById('admin-prod-duration').value || '',
                description: document.getElementById('admin-prod-desc').value,
                category: 'Digital'
            };

            if (uploadData.coverPath) productData.thumbnail = uploadData.coverPath;

            // Fixed: Only assign filePath based on the actual selected product type
            if (productData.type === 'EBOOK' && uploadData.ebookPath) {
                productData.filePath = uploadData.ebookPath;
            } else if (productData.type === 'AUDIOBOOK' && uploadData.audioPath) {
                productData.filePath = uploadData.audioPath;
            }

            const url = isEdit ? `${API_BASE}/api/products/${productId}` : `${API_BASE}/api/products`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                closeProductModal();
                loadAdminProductsFull(); // Refresh full list
                updateAdminStats(); // Refresh dashboard stats
                if (typeof syncLibraryWithBackend === 'function') syncLibraryWithBackend();
            } else {
                const err = await res.json();
                alert(err.message || 'Error saving product');
            }
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// --- MISSING DASHBOARD FUNCTIONS ---

window.viewOrderDetail = async function (id) {
    const modal = document.getElementById('order-detail-modal');
    if (!modal) return;

    try {
        const res = await fetch(`${API_BASE}/api/orders/track/${id}`);
        const order = await res.json();
        if (!res.ok) throw new Error(order.message);

        document.getElementById('modal-order-id').textContent = `#${order.orderId}`;
        document.getElementById('modal-order-date').textContent = `Placed on: ${new Date(order.createdAt).toLocaleDateString()}`;
        document.getElementById('modal-subtotal').textContent = `₹${order.totalAmount}`; // Simple for now
        document.getElementById('modal-total').textContent = `₹${order.totalAmount}`;
        document.getElementById('modal-payment-method').textContent = order.paymentMethod;
        document.getElementById('modal-payment-status').textContent = order.paymentStatus;

        // Items
        const itemsContainer = document.getElementById('modal-order-items');
        itemsContainer.innerHTML = order.items.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;">
                <div>
                    <h4 style="margin:0; font-size:0.95rem;">${item.title}</h4>
                    <p style="margin:0; font-size:0.8rem; opacity:0.6;">${item.type} (x${item.quantity})</p>
                </div>
                <span class="gold-text" style="font-weight:bold;">₹${item.price}</span>
            </div>
        `).join('');

        // Address
        const addr = order.customer;
        document.getElementById('modal-shipping-address').innerHTML = `
            ${addr.name}<br>
            ${addr.address}<br>
            Phone: ${addr.phone}
        `;

        // Timeline
        const timeline = document.getElementById('modal-order-timeline');
        const steps = ['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const currentIdx = steps.indexOf(order.status);

        timeline.innerHTML = steps.map((s, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;
            const hist = order.timeline.find(t => t.status === s);
            return `
                <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                    <h5>${s}</h5>
                    <p>${hist ? new Date(hist.timestamp).toLocaleString() : (isCompleted ? 'Completed' : 'Upcoming')}</p>
                </div>
            `;
        }).join('');

        modal.style.display = 'flex';
        modal.classList.add('active');
    } catch (e) { alert("Error loading order: " + e.message); }
}

window.closeOrderDetailModal = () => {
    document.getElementById('order-detail-modal').style.display = 'none';
};

// Address Management
window.openAddressModal = function (id = null) {
    const modal = document.getElementById('address-modal');
    const form = document.getElementById('address-form');
    const title = document.getElementById('address-modal-title');

    form.reset();
    document.getElementById('address-id').value = id || '';

    if (id) {
        title.textContent = 'Edit Address';
        const addr = window.currentUserProfile.savedAddresses.find(a => a._id === id);
        if (addr) {
            document.getElementById('addr-name').value = addr.fullName;
            document.getElementById('addr-phone').value = addr.phone;
            document.getElementById('addr-pincode').value = addr.pincode;
            document.getElementById('addr-state').value = addr.state;
            document.getElementById('addr-city').value = addr.city;
            document.getElementById('addr-full').value = addr.fullAddress;
            document.getElementById('addr-landmark').value = addr.landmark || '';
            document.getElementById('addr-default').checked = addr.isDefault;
        }
    } else {
        title.textContent = 'Add New Address';
    }

    modal.style.display = 'flex';
};

window.closeAddressModal = () => document.getElementById('address-modal').style.display = 'none';

if (document.getElementById('address-form')) {
    document.getElementById('address-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const id = document.getElementById('address-id').value;
        const data = {
            fullName: document.getElementById('addr-name').value,
            phone: document.getElementById('addr-phone').value,
            pincode: document.getElementById('addr-pincode').value,
            state: document.getElementById('addr-state').value,
            city: document.getElementById('addr-city').value,
            fullAddress: document.getElementById('addr-full').value,
            landmark: document.getElementById('addr-landmark').value,
            isDefault: document.getElementById('addr-default').checked,
            label: 'Saved' // Or add another field
        };

        const url = id ? `${API_BASE}/api/users/address/${id}` : `${API_BASE}/api/users/address`;
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        closeAddressModal();
        fetchProfileData();
    });
}

window.deleteAddress = async function (id) {
    if (!confirm("Are you sure?")) return;
    const token = localStorage.getItem('authToken');
    await fetch(`${API_BASE}/api/users/address/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProfileData();
}

function renderActiveShipments() {
    const token = localStorage.getItem('authToken');
    const container = document.getElementById('active-shipments-list');

    fetch(`${API_BASE}/api/orders/my-orders`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(orders => {
            const active = orders.filter(o => ['Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status));
            if (active.length === 0) {
                container.innerHTML = '<p class="fade-text">No active shipments.</p>';
            } else {
                container.innerHTML = active.slice(0, 2).map(o => `
                    <div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span style="font-size:0.9rem; font-weight:600;">${o.orderId}</span>
                            <span class="status-badge ${getStatusClass(o.status)}">${o.status}</span>
                        </div>
                        <p style="margin:0; font-size:0.75rem; opacity:0.5;">Est. Delivery: ${new Date(Date.now() + 86400000 * 3).toLocaleDateString()}</p>
                    </div>
                `).join('');
            }
        });
}

function renderNewestAddition() {
    const libKey = getUserKey('efv_digital_library');
    const library = JSON.parse(localStorage.getItem(libKey)) || [];
    const container = document.getElementById('newest-addition-content');

    if (library.length === 0) {
        container.innerHTML = '<p class="fade-text">Empty library.</p>';
        return;
    }

    const newest = library[library.length - 1];
    container.innerHTML = `
        <div style="display:flex; gap:15px; align-items:center;">
            <img src="${newest.thumbnail}" style="width:50px; height:70px; object-fit:cover; border-radius:4px; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
            <div>
                <h4 style="margin:0; font-size:1rem;">${newest.name || newest.title}</h4>
                <p style="margin:2px 0; font-size:0.8rem; opacity:0.5;">${newest.type}</p>
                <button class="btn btn-gold small" style="margin-top:5px; height:30px;" onclick="accessContent('${newest.type}', '${(newest.name || newest.title).replace(/'/g, "\\'")}', '${newest.productId || newest.id}')">Access</button>
            </div>
        </div>
    `;
}

// Security Settings logic
if (document.getElementById('security-settings-form')) {
    // This is optional if user added it in HTML. Let's add it to Account Settings tab.
}

// Profile Save
if (document.getElementById('settings-profile-form')) {
    document.getElementById('settings-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const data = {
            name: document.getElementById('settings-name').value,
            // phone can be added here
        };
        const res = await fetch(`${API_BASE}/api/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            alert("Profile updated successfully");
            fetchProfileData();
        }
    });
}

