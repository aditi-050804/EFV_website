// Integrated with global security.js
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
            if (targetId === 'cart') renderCartTab();
            if (targetId === 'orders') renderOrdersTab();
            if (targetId === 'library') {
                renderLibraryTab();
                syncLibraryWithBackend(); // Proactive Sync
            }
            if (targetId === 'admin') loadAdminProducts();
        });
    });

    // 4. Logout
    // 4. Logout (Sidebar & Settings)
    const logoutAction = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('efv_user');
            localStorage.removeItem('efv_token'); // Ensure token is also cleared
            sessionStorage.removeItem('adminLoggedIn');
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

    // Check for query param to open specific tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const targetTab = document.querySelector(`.nav-item[data-tab="${tabParam}"]`);
        if (targetTab) targetTab.click();
    }
});

function initializeDashboard(user) {
    document.getElementById('user-name-display').textContent = user.name;
    document.getElementById('settings-name').value = user.name;
    document.getElementById('settings-email').value = user.email;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);

    // Admin Check
    const isAdmin = user.role === 'admin' || user.email.toLowerCase() === 'admin@uwo24.com';
    if (isAdmin) {
        const adminBtn = document.getElementById('sidebar-admin-btn');
        if (adminBtn) adminBtn.classList.remove('hidden');
    }

    // --- REAL SYNC: Fetch Library from Backend ---
    syncLibraryWithBackend();
}

async function syncLibraryWithBackend() {
    const user = JSON.parse(localStorage.getItem('efv_user'));
    const token = localStorage.getItem('efv_token');
    if (!user || !token) return;

    try {
        const response = await fetch(`${API_BASE}/api/library/my-library`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            const libKey = getUserKey('efv_digital_library');
            const localLibrary = data.map(prod => ({
                productId: prod.productId || prod._id || prod.id,
                name: prod.title || prod.name,
                type: prod.type,
                thumbnail: prod.thumbnail,
                filePath: prod.filePath,
                date: prod.purchasedAt ? new Date(prod.purchasedAt).toLocaleDateString() : new Date().toLocaleDateString()
            }));
            localStorage.setItem(libKey, JSON.stringify(localLibrary));

            // Refresh Library UI
            renderLibraryTab();
            updateStats();
        }
    } catch (error) {
        console.error('Library sync error:', error);
    }
}

// --- DATA ACCESS HELPERS ---
function getUserKey(baseKey) {
    const user = JSON.parse(localStorage.getItem('efv_user'));
    if (!user || !user.email) return baseKey;
    // MATCH CART.JS LOGIC EXACTLY
    const cleanEmail = user.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${baseKey}_${cleanEmail}`;
}

// --- DEMO: Auto-Seed Library for Testing (with Dedupe) ---
function seedLibrary() {
    const libKey = getUserKey('efv_digital_library');
    let library = JSON.parse(localStorage.getItem(libKey)) || [];

    // 1. Deduplicate by ID
    const uniqueLibrary = [];
    const seen = new Set();
    library.forEach(item => {
        const id = item.productId || item.id || item._id;
        if (id && !seen.has(id)) {
            seen.add(id);
            uniqueLibrary.push(item);
        }
    });

    if (uniqueLibrary.length !== library.length) {
        console.log('🧹 Cleaned up duplicate library entries');
        library = uniqueLibrary;
    }

    // 2. Check for missing Vol 1 (Case Insensitive)
    const hasVol1Ebook = library.some(i => i.name.toLowerCase().includes('e-book'));
    const hasVol1Audio = library.some(i => i.name.toLowerCase().includes('audiobook'));

    let changed = false;
    if (!hasVol1Ebook) {
        library.push({
            id: 'efv_v1_ebook',
            name: 'EFV TM VOL 1: THE ORIGIN CODE (E-BOOK)',
            type: 'E-Book',
            date: new Date().toLocaleDateString()
        });
        changed = true;
    }
    if (!hasVol1Audio) {
        library.push({
            id: 'efv_v1_audiobook',
            name: 'EFV TM VOL 1: THE ORIGIN CODE (AUDIOBOOK)',
            type: 'Audiobook',
            date: new Date().toLocaleDateString()
        });
        changed = true;
    }

    if (changed || uniqueLibrary.length !== JSON.parse(localStorage.getItem(libKey))?.length) {
        localStorage.setItem(libKey, JSON.stringify(library));
        console.log('✅ Library updated/seeded');
    }
}

// --- TAB RENDERING: CART ---
function renderCartTab() {
    // Note: We use the GLOBAL 'efv_cart' for the main cart, but distinct keys for history/library.
    // Ideally, cart should also be user-specific, but the existing cart.js uses 'efv_cart'.
    // We will stick to 'efv_cart' for now but filter/process it here.
    const cart = JSON.parse(localStorage.getItem('efv_cart')) || [];
    const container = document.getElementById('dashboard-cart-list');
    const emptyState = document.getElementById('cart-empty-state');
    const badge = document.getElementById('sidebar-cart-count');

    // Update Badge
    badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.classList.toggle('hidden', cart.length === 0);

    container.innerHTML = '';

    if (cart.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    cart.forEach((item, index) => {
        const isHard = item.id.includes('hard');
        const isPaper = item.id.includes('paper');
        const isAudio = item.id.includes('audio');
        const isEbook = item.id.includes('ebook');

        let typeLabel = "Product";
        if (isHard) typeLabel = "Hardcover";
        else if (isPaper) typeLabel = "Paperback";
        else if (isAudio) typeLabel = "Audiobook";
        else if (isEbook) typeLabel = "E-Book";

        const card = document.createElement('div');
        card.className = 'dashboard-card fade-in';
        card.innerHTML = `
            <div class="card-image-container">
                <span class="card-type-badge">${typeLabel}</span>
                <img src="${getImageForProduct(item.name)}" alt="${item.name}" class="card-image">
            </div>
            <div class="card-details">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-subtitle">Edition: ${typeLabel}</p>
                <div class="card-meta">
                    <span class="card-qty">Qty: ${item.quantity}</span>
                    <span class="card-price">₹${item.price}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-dashboard btn-danger" onclick="removeFromCart(${index})">Remove</button>
                    <button class="btn-dashboard btn-primary" onclick="buyNowFromDashboard(${index})">
                        BUY NOW
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- TAB RENDERING: ORDERS ---
function renderOrdersTab() {
    const historyKey = getUserKey('efv_purchase_history');
    const orders = JSON.parse(localStorage.getItem(historyKey)) || [];
    const container = document.getElementById('dashboard-orders-list');
    const emptyState = document.getElementById('orders-empty-state');

    container.innerHTML = '';

    if (orders.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // Group items? The current history structure is flat items.
    // For a better "Orders" view, we simply list them as transactions. 
    // If the storage format is {name, price, quantity, date}, we use that.

    orders.slice().reverse().forEach((order, idx) => {
        const isDigital = order.name.includes('Audiobook') || order.name.includes('E-book') || order.name.includes('E-Book');
        const orderId = `ORD-${Date.now().toString().slice(-6)}-${idx}`;

        const card = document.createElement('div');
        card.className = 'order-card fade-in';
        card.innerHTML = `
            <img src="${getImageForProduct(order.name)}" alt="${order.name}" class="order-img">
            <div class="order-info">
                <div class="order-header">
                    <span class="order-id">#${orderId}</span>
                    <span class="order-date">${order.date || 'Recently'}</span>
                </div>
                <h3 class="order-title">${order.name} <span style="font-size:0.8em; opacity:0.6;">(x${order.quantity})</span></h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <span class="gold-text" style="font-weight:bold;">₹${(order.price * order.quantity).toFixed(2)}</span>
                    <span class="order-status status-paid">Paid & ${isDigital ? 'Delivered' : 'Processing'}</span>
                </div>
                <div style="margin-top: 15px;">
                    ${isDigital
                ? `<button class="btn-dashboard btn-secondary" style="padding:5px 15px; width:auto;" onclick="accessDigitalContent('${order.name}')">Access Now</button>`
                : `<button class="btn-dashboard btn-secondary" style="padding:5px 15px; width:auto;">Track Order</button>`
            }
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- TAB RENDERING: LIBRARY ---
function renderLibraryTab() {
    const libKey = getUserKey('efv_digital_library');
    const library = JSON.parse(localStorage.getItem(libKey)) || [];
    const container = document.getElementById('dashboard-library-list');
    const emptyState = document.getElementById('library-empty-state');

    container.innerHTML = '';

    if (library.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    library.forEach(async (item) => {
        const rawType = (item.type || '').toLowerCase();
        const isAudio = rawType.includes('audio');
        const actionLabel = isAudio ? 'Listen Now' : 'Read Now';
        const icon = isAudio ? 'fa-headphones' : 'fa-book-open';

        const prodId = item.productId || item.id || item._id;

        // Fetch progress for UI
        const progress = await fetchProgress(prodId);
        let progressHtml = '';
        if (progress) {
            const percent = progress.progress || 0;
            const lastActivity = isAudio ? `Last listened: ${formatTime(progress.currentTime)}` : `Last read: Page ${progress.lastPage || 1}`;
            progressHtml = `
                <div class="card-progress-container" style="margin-top:10px;">
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span>${lastActivity}</span>
                        <span>${Math.round(percent)}%</span>
                    </div>
                    <div style="height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: var(--gold-text); border-radius: 2px;"></div>
                    </div>
                </div>
            `;
        }

        const imgUrl = item.thumbnail
            ? (item.thumbnail.startsWith('http') || item.thumbnail.startsWith('img/')
                ? item.thumbnail
                : API_BASE + (item.thumbnail.startsWith('/') ? '' : '/') + item.thumbnail)
            : getImageForProduct(item.name || item.title);

        const card = document.createElement('div');
        card.className = 'dashboard-card fade-in';
        card.innerHTML = `
            <div class="card-image-container">
                <span class="card-type-badge">${item.type}</span>
                <img src="${imgUrl}" alt="${item.name}" class="card-image">
            </div>
            <div class="card-details">
                <h3 class="card-title">${item.name || item.title}</h3>
                <p class="card-subtitle">Purchased: ${item.date || 'Recently'}</p>
                ${progressHtml}
                <div class="card-actions" style="margin-top:auto; padding-top:10px;">
                    <button class="btn-dashboard btn-primary" onclick="accessContent('${item.type}', '${(item.name || item.title).replace(/'/g, "\\'")}', '${prodId}')">
                        <i class="fas ${icon}"></i> ${actionLabel}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateStats() {
    const historyKey = getUserKey('efv_purchase_history');
    const orders = JSON.parse(localStorage.getItem(historyKey)) || [];

    const libKey = getUserKey('efv_digital_library');
    const library = JSON.parse(localStorage.getItem(libKey)) || [];

    document.getElementById('stat-total-orders').textContent = orders.length;
    document.getElementById('stat-total-digital').textContent = library.length;

    const totalSpent = orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('stat-total-spent').textContent = '₹' + totalSpent.toFixed(0);
}

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
                        if (!library.some(l => l.name === item.name)) {
                            library.push({
                                id: item.id || Date.now(), // Fallback ID
                                name: item.name,
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
// Configuration
const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:5000';

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
        window.efvSecurity.applyWatermark(document.getElementById(readerId));
    }
    document.getElementById(readerId).classList.add('no-select');

    const container = document.getElementById('reader-container');
    const indicator = document.getElementById('page-indicator');
    const loading = document.querySelector('.reader-loading');

    // 3. Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = CONTENT_CONFIG.pdfWorkerSrc;

    try {
        const token = localStorage.getItem('efv_token');
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

    const token = localStorage.getItem('efv_token');

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

                    <audio id="efv-audio-player" style="width: 100%; filter: invert(1) hue-rotate(180deg);" controls controlsList="nodownload">
                        <source src="${CONTENT_CONFIG.contentApi}/audio/${bookId}?token=${token || ''}&t=${Date.now()}" type="audio/mpeg">
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
        const token = localStorage.getItem('efv_token');
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
        const token = localStorage.getItem('efv_token');
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

    const product = {
        _id: id || (isAudio ? 'efv_v1_audiobook' : 'efv_v1_ebook'),
        name: name,
        id: id || (isAudio ? 'efv_v1_audiobook' : 'efv_v1_ebook'),
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

window.switchAdminTab = function (tab) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(`admin-tab-${tab}`).style.display = 'block';

    // Update buttons
    document.getElementById('btn-admin-products').classList.remove('btn-gold');
    document.getElementById('btn-admin-products').classList.add('btn-secondary');
    document.getElementById('btn-admin-orders').classList.remove('btn-gold');
    document.getElementById('btn-admin-orders').classList.add('btn-secondary');

    document.getElementById(`btn-admin-${tab}`).classList.remove('btn-secondary');
    document.getElementById(`btn-admin-${tab}`).classList.add('btn-gold');

    if (tab === 'products') loadAdminProducts();
    if (tab === 'orders') loadAdminOrders();
};

window.loadAdminProducts = async function () {
    try {
        const token = localStorage.getItem('efv_token');
        const [productsRes, ordersRes] = await Promise.all([
            fetch(`${API_BASE}/api/products`),
            fetch(`${API_BASE}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const products = await productsRes.json();
        const orders = ordersRes.ok ? await ordersRes.json() : [];

        // Calculate stats
        const buyerCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!buyerCount[item.productId]) buyerCount[item.productId] = new Set();
                buyerCount[item.productId].add(order.customer.email);
            });
        });

        const revenue = orders.reduce((sum, o) => sum + (['Failed', 'Returned'].includes(o.status) ? 0 : o.totalAmount), 0);

        // Update Stats
        document.getElementById('admin-stat-total-products').textContent = products.length;
        document.getElementById('admin-stat-total-orders').textContent = orders.length;
        document.getElementById('admin-stat-revenue').textContent = '₹' + revenue.toLocaleString();

        // Render Table
        const tbody = document.getElementById('admin-product-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            products.forEach(p => {
                const buyers = buyerCount[p._id] ? buyerCount[p._id].size : 0;
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                tr.innerHTML = `
                    <td style="padding: 12px;"><img src="${p.thumbnail ? (p.thumbnail.startsWith('http') || p.thumbnail.startsWith('img/') ? p.thumbnail : API_BASE + '/' + p.thumbnail) : 'img/placeholder.png'}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                    <td style="padding: 12px;"><strong>${p.title}</strong><br><small style="opacity:0.6;">${p.subtitle || ''}</small></td>
                    <td style="padding: 12px;"><span class="badge" style="background: rgba(255,211,105,0.1); color: var(--gold-text);">${p.type}</span></td>
                    <td style="padding: 12px;">₹${p.price}</td>
                    <td style="padding: 12px;">${p.stock || '∞'}</td>
                    <td style="padding: 12px;"><i class="fas fa-users" style="margin-right:5px; opacity:0.5;"></i> ${buyers}</td>
                    <td style="padding: 12px;">
                        <button onclick="editProduct('${p._id}')" class="btn-icon" style="color: var(--gold-text); margin-right: 10px;"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteProduct('${p._id}')" class="btn-icon" style="color: #ff4d4d;"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Admin products load error", e);
    }
};

window.loadAdminOrders = async function () {
    try {
        const token = localStorage.getItem('efv_token');
        const response = await fetch(`${API_BASE}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await response.json();

        const tbody = document.getElementById('admin-order-table-body');
        const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Returned'];

        if (tbody) {
            tbody.innerHTML = '';
            orders.reverse().forEach(order => {
                const itemsStr = order.items.map(i => `${i.quantity}x ${i.title}`).join(', ');
                let statusSelect = `<select onchange="updateOrderStatus('${order._id}', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,211,105,0.3); padding: 4px; border-radius: 4px; font-size: 0.85rem;">`;
                statusOptions.forEach(opt => {
                    statusSelect += `<option value="${opt}" ${order.status === opt ? 'selected' : ''}>${opt}</option>`;
                });
                statusSelect += `</select>`;

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                tr.innerHTML = `
                    <td style="padding: 12px; font-family: monospace; font-size: 0.8rem; opacity:0.7;">#${order._id.slice(-6)}</td>
                    <td style="padding: 12px;">${order.customer.name}<br><small style="opacity:0.6;">${order.customer.email}</small></td>
                    <td style="padding: 12px;"><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemsStr}">${itemsStr}</div></td>
                    <td style="padding: 12px; font-weight:bold;">₹${order.totalAmount}</td>
                    <td style="padding: 12px;">${statusSelect}</td>
                    <td style="padding: 12px;">
                        <button class="btn btn-outline small" style="padding: 4px 8px;" onclick="alert('Order Items: \\n' + '${itemsStr}')">View</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Admin orders load error", e);
    }
};

window.updateOrderStatus = async function (id, status) {
    const note = prompt(`Updating order ${id} to ${status}. Add a note?`, `Status updated to ${status}`);
    if (note === null) return;

    try {
        const token = localStorage.getItem('efv_token');
        const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, note })
        });

        if (res.ok) loadAdminOrders();
        else alert('Failed to update status');
    } catch (e) {
        console.error(e);
        alert('Server error');
    }
};

window.openAddProductModal = function () {
    document.getElementById('admin-product-form').reset();
    document.getElementById('admin-prod-id').value = '';
    document.getElementById('admin-current-cover').textContent = '';
    document.getElementById('admin-current-ebook').textContent = '';
    document.getElementById('admin-current-audio').textContent = '';
    document.getElementById('admin-modal-title').textContent = 'Add New Book';
    document.getElementById('admin-product-modal').style.display = 'flex';
    toggleAdminFileFields();
};

window.closeProductModal = function () {
    document.getElementById('admin-product-modal').style.display = 'none';
};

window.toggleAdminFileFields = function () {
    const type = document.getElementById('admin-prod-type').value;
    document.getElementById('admin-field-ebook').style.display = type === 'EBOOK' ? 'block' : 'none';
    document.getElementById('admin-field-audio').style.display = type === 'AUDIOBOOK' ? 'block' : 'none';
};

window.editProduct = async function (id) {
    try {
        const response = await fetch(`${API_BASE}/api/products/${id}`);
        const p = await response.json();

        document.getElementById('admin-prod-id').value = p._id;
        document.getElementById('admin-prod-title').value = p.title;
        document.getElementById('admin-prod-type').value = p.type;
        document.getElementById('admin-prod-lang').value = p.language || 'English';
        document.getElementById('admin-prod-price').value = p.price;
        document.getElementById('admin-prod-volume').value = p.volume || 1;
        document.getElementById('admin-prod-desc').value = p.description || '';

        // Show current filenames with status badges
        const coverName = p.thumbnail ? p.thumbnail.split('/').pop() : 'None';
        const fileName = p.filePath ? p.filePath.split('/').pop() : 'None';

        const successBadge = '<span style="color: #2ecc71; font-weight: bold; margin-left:10px;"><i class="fas fa-check-circle"></i> Saved & Safe</span>';

        document.getElementById('admin-current-cover').innerHTML = p.thumbnail ? `Current: ${coverName} ${successBadge}` : '';

        const fileDisplay = p.filePath ? `Current: ${fileName} ${successBadge}` : '';

        if (p.type === 'EBOOK') {
            document.getElementById('admin-current-ebook').innerHTML = fileDisplay;
            document.getElementById('admin-current-audio').innerHTML = '';
        } else if (p.type === 'AUDIOBOOK') {
            let audioPreview = '';
            if (p.filePath) {
                const token = localStorage.getItem('efv_token');
                const audioUrl = `${API_BASE}/api/content/audio/${p._id}?token=${token}&t=${Date.now()}`;
                audioPreview = `<br><button type="button" class="btn btn-gold small" style="margin-top:5px; height: 32px; padding: 0 15px; width: auto;" onclick="window.open('${audioUrl}', '_blank')"><i class="fas fa-play"></i> Test Audio</button>`;
            }
            document.getElementById('admin-current-audio').innerHTML = fileDisplay + audioPreview;
            document.getElementById('admin-current-ebook').innerHTML = '';
        } else {
            document.getElementById('admin-current-ebook').textContent = '';
            document.getElementById('admin-current-audio').textContent = '';
        }

        document.getElementById('admin-modal-title').textContent = 'Edit Book';
        document.getElementById('admin-product-modal').style.display = 'flex';
        toggleAdminFileFields();
    } catch (e) {
        console.error("Fetch product error", e);
        alert('Failed to load product details');
    }
};

window.deleteProduct = async function (id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const token = localStorage.getItem('efv_token');
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadAdminProducts();
        else alert('Delete failed');
    } catch (e) {
        console.error(e);
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
            const token = localStorage.getItem('efv_token');
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
                type: document.getElementById('admin-prod-type').value,
                language: document.getElementById('admin-prod-lang').value || 'English',
                price: Number(document.getElementById('admin-prod-price').value),
                volume: Number(document.getElementById('admin-prod-volume').value) || 1,
                description: document.getElementById('admin-prod-desc').value,
                category: 'Digital'
            };

            if (uploadData.coverPath) productData.thumbnail = uploadData.coverPath;
            if (uploadData.ebookPath || uploadData.audioPath) productData.filePath = uploadData.ebookPath || uploadData.audioPath;

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
                loadAdminProducts();
                // PROACTIVE: Sync admin library so they see the new/updated book immediately
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
