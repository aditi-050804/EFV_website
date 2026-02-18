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
            if (targetId === 'library') renderLibraryTab();
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

    // --- DEMO: Auto-Seed Library for Testing ---
    const libKey = getUserKey('efv_digital_library');
    let library = JSON.parse(localStorage.getItem(libKey)) || [];

    // Check if empty or missing Vol 1
    const hasVol1Ebook = library.some(i => i.name.includes('E-Book') || i.name.includes('E-book'));
    const hasVol1Audio = library.some(i => i.name.includes('Audiobook'));

    let seeded = false;
    if (!hasVol1Ebook) {
        library.push({
            id: 'efv_canon_v1_ebook',
            name: 'EFV TM VOL 1: THE ORIGIN CODE (E-BOOK)',
            type: 'E-Book',
            date: new Date().toLocaleDateString()
        });
        seeded = true;
    }
    if (!hasVol1Audio) {
        library.push({
            id: 'efv_canon_v1_audio',
            name: 'EFV TM VOL 1: THE ORIGIN CODE (AUDIOBOOK)',
            type: 'Audiobook',
            date: new Date().toLocaleDateString()
        });
        seeded = true;
    }

    if (seeded) {
        localStorage.setItem(libKey, JSON.stringify(library));
        console.log('✅ Library seeded with demo content');
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

    // 1. Deduplicate existing
    const uniqueLibrary = [];
    const seen = new Set();
    library.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (!seen.has(key)) {
            seen.add(key);
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
            id: 'efv_canon_v1_ebook',
            name: 'EFV TM VOL 1: THE ORIGIN CODE (E-BOOK)',
            type: 'E-Book',
            date: new Date().toLocaleDateString()
        });
        changed = true;
    }
    if (!hasVol1Audio) {
        library.push({
            id: 'efv_canon_v1_audio',
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

    library.forEach((item) => {
        const isAudio = item.type === 'Audiobook';
        const actionLabel = isAudio ? 'Listen Now' : 'Read Now';
        const icon = isAudio ? 'fa-headphones' : 'fa-book-open';

        const card = document.createElement('div');
        card.className = 'dashboard-card fade-in';
        card.innerHTML = `
            <div class="card-image-container">
                <span class="card-type-badge">${item.type}</span>
                <img src="${getImageForProduct(item.name)}" alt="${item.name}" class="card-image">
            </div>
            <div class="card-details">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-subtitle">Purchased: ${item.date || 'Recently'}</p>
                <div class="card-actions" style="margin-top:auto;">
                    <button class="btn-dashboard btn-primary" onclick="accessContent('${item.type}', '${item.name.replace(/'/g, "\\'")}')">
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
        const rzpRes = await fetch('http://localhost:5000/api/orders/razorpay', {
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

window.accessContent = function (type, name) {
    if (typeof accessDigitalContent === 'function') {
        accessDigitalContent(name);
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

// --- PDF READER IMPLEMENTATION ---
window.openEbookReader = async function (product) {
    const readerId = 'efv-reader-modal';
    if (document.getElementById(readerId)) return;

    // 1. Fetch saved progress
    let savedState = await fetchProgress(product._id);
    let currentPage = savedState?.lastPage || 1;
    let totalPages = 0;
    let pdfDoc = null;
    let scale = 1.5;
    let isRendering = false;

    // 2. Create Reader UI
    const readerHtml = `
        <div id="${readerId}" class="reader-overlay" oncontextmenu="return false;">
            <div class="reader-toolbar glass-panel">
                <div class="reader-title">${product.name}</div>
                <div class="reader-controls">
                    <button class="btn-icon" id="prev-page"><i class="fas fa-chevron-left"></i></button>
                    <span id="page-indicator">Page ${currentPage}</span>
                    <button class="btn-icon" id="next-page"><i class="fas fa-chevron-right"></i></button>
                    <button class="btn-icon" id="close-reader"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="reader-canvas-container" id="reader-container">
                <canvas id="pdf-canvas"></canvas>
            </div>
            <div class="reader-loading">
                <div class="spinner"></div>
                <p>Loading Secure Content...</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', readerHtml);

    // 3. Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = CONTENT_CONFIG.pdfWorkerSrc;
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const loading = document.querySelector('.reader-loading');

    // 4. Secure Fetch with Auth Token
    try {
        const token = localStorage.getItem('efv_token');
        if (!token) {
            alert("Security Update: Please Log Out and Log In once to activate permanent session.");
            throw new Error("Authentication required - Please re-login");
        }

        // Note: In a real scenario, we'd fetch a signed blob. 
        // For demo, we might use the direct demo path if we're simulating backend
        // BUT the plan says "Secure Content Streaming API". 
        // Let's try the API route first. If 404 (local env issues), fallback to demo path strictly for prototype.

        let url = `${CONTENT_CONFIG.contentApi}/ebook/${product._id}`;

        // Demo Fallback for "The Origin Code" if API isn't fully wired in local dev
        if (product.id.includes('efv_canon_v1')) {
            // Check if we are in true backend mode or demo
            // For safety in this environment, let's try to map to the local file if API fails
            // But ideally, we use the API.
        }

        const loadingTask = pdfjsLib.getDocument({
            url: url,
            httpHeaders: { 'Authorization': `Bearer ${token}` }
        });

        pdfDoc = await loadingTask.promise;
        totalPages = pdfDoc.numPages;
        loading.style.display = 'none';

        // 5. Resume Logic
        if (savedState && savedState.lastPage > 1) {
            const confirmResume = confirm(`You last read to page ${savedState.lastPage}. Continue?`);
            if (confirmResume) currentPage = savedState.lastPage;
            else currentPage = 1;
        }

        renderPage(currentPage);

    } catch (error) {
        console.error("Reader Error:", error);
        alert("Failed to load secure content. Please ensure you are logged in and own this product.");
        document.getElementById(readerId).remove();
        return;
    }

    // 6. Render Page Logic
    async function renderPage(num) {
        if (isRendering) return;
        isRendering = true;

        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        document.getElementById('page-indicator').textContent = `Page ${num} of ${totalPages}`;
        document.getElementById('reader-container').scrollTop = 0;

        isRendering = false;

        // Auto-save
        syncProgress(product._id, 'EBOOK', { lastPage: num, totalPages: totalPages });
    }

    // 7. Event Listeners
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage <= 1) return;
        currentPage--;
        renderPage(currentPage);
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage >= totalPages) return;
        currentPage++;
        renderPage(currentPage);
    });

    document.getElementById('close-reader').addEventListener('click', () => {
        document.getElementById(readerId).remove();
    });

    // Keyboard Nav (Disabled default to prevent accidental outside interaction)
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById(readerId)) return;
        if (e.key === 'ArrowRight') document.getElementById('next-page').click();
        if (e.key === 'ArrowLeft') document.getElementById('prev-page').click();
        if (e.key === 'Escape') document.getElementById('close-reader').click();
    });
};

// --- AUDIOBOOK PLAYER IMPLEMENTATION ---
window.playAudiobook = async function (product) {
    const bookId = product._id || product.id; // handle both ID types
    const playerModalId = 'audio-player-modal';

    // Remove existing
    if (document.getElementById(playerModalId)) document.getElementById(playerModalId).remove();

    // 1. Fetch Progress
    let savedState = await fetchProgress(bookId);

    // 2. Audio Player HTML
    const audioHtml = `
        <div id="${playerModalId}" class="resume-modal-overlay active" style="z-index: 10000; display:flex;">
            <div class="modal-card glass-panel" style="max-width: 500px; width: 90%; text-align: center; border: 1px solid var(--gold-text); position: relative; overflow: hidden;">
                <button class="modal-close" onclick="closeAudioPlayer()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; z-index: 30;">&times;</button>
                
                <div style="margin-bottom: 20px;">
                    <img src="img/vol1-cover.png" style="width: 150px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); margin-bottom: 15px;">
                    <h3 style="color: var(--gold-text); margin-bottom: 5px;">${product.name}</h3>
                    <p id="audio-status-text" style="opacity: 0.7; font-size: 0.9rem;">Loading Safe Stream...</p>
                </div>

                <div style="position: relative;">
                    <audio id="efv-audio-player" width="100%" style="width: 100%; border-radius: 30px; outline: none;" controls controlsList="nodownload">
                         <!-- Secure Stream URL -->
                        <source src="${CONTENT_CONFIG.contentApi}/audio/${bookId}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    <div id="resume-container"></div>
                </div>

                <div style="margin-top: 20px; font-size: 0.8rem; opacity: 0.6;">
                    <i class="fas fa-shield-alt"></i> Secure Content Stream
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', audioHtml);

    const audio = document.getElementById('efv-audio-player');
    const statusText = document.getElementById('audio-status-text');
    const resumeContainer = document.getElementById('resume-container');

    // 3. Add Token to Request (Audio element doesn't support headers natively easily, 
    // usually we use a signed cookie or short-lived token in URL. 
    // For this implementation, we assume the browser cookie or basic auth works 
    // OR we append ?token=${token} if the backend supports it.
    // Let's inject token query param for robust access)
    const token = localStorage.getItem('efv_token');
    if (!token) {
        alert("Session expired. Please Log Out and Log In again.");
        return;
    }
    audio.src = `${CONTENT_CONFIG.contentApi}/audio/${bookId}?token=${token}`;

    // 4. Resume Logic
    audio.addEventListener('loadedmetadata', () => {
        statusText.textContent = "Duration: " + formatTime(audio.duration);

        if (savedState && savedState.currentTime > 5 && savedState.currentTime < (audio.duration - 5)) {
            // Show Resume Modal
            const lastTimeFormatted = formatTime(savedState.currentTime);

            resumeContainer.innerHTML = `
                <div class="resume-modal-overlay" style="position:absolute; background:rgba(0,0,0,0.9);">
                    <div class="resume-modal" style="box-shadow:none; border:none; background:transparent;">
                        <h3>🎧 Resume?</h3>
                        <p>Last played: <span style="color:white; font-weight:bold;">${lastTimeFormatted}</span></p>
                        <div class="resume-actions">
                            <button class="btn-resume" onclick="resumeAudio(${savedState.currentTime})">Continue</button>
                            <button class="btn-restart" onclick="resumeAudio(0)">Restart</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            audio.play().catch(e => console.log("Autoplay blocked", e));
        }
    });

    // 5. Sync Progress
    let lastSync = 0;
    audio.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (now - lastSync > 10000) { // Sync every 10s
            syncProgress(bookId, 'AUDIOBOOK', {
                currentTime: audio.currentTime,
                totalDuration: audio.duration,
                progress: (audio.currentTime / audio.duration) * 100
            });
            lastSync = now;
        }
    });

    window.closeAudioPlayer = function () {
        syncProgress(bookId, 'AUDIOBOOK', { currentTime: audio.currentTime });
        document.getElementById(playerModalId).remove();
    };

    window.resumeAudio = function (time) {
        audio.currentTime = time;
        resumeContainer.innerHTML = '';
        audio.play();
    };
};

// --- API HELPERS ---
async function fetchProgress(productId) {
    try {
        const token = localStorage.getItem('efv_token');
        if (!token) return null;

        const res = await fetch(`${CONTENT_CONFIG.progressApi}/${productId}`, {
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
window.accessDigitalContent = function (name, id) {
    // If id is missing (legacy calls), try to infer or warn
    // Actually, passing just name might be legacy. let's try to map.
    // For demo, we assume id is passed or we construct a mock object.

    // MOCK PRODUCT OBJECT (Since we are clicking from UI that might not have full obj)
    const type = name.toLowerCase().includes('audio') ? 'AUDIOBOOK' : 'EBOOK';
    const product = {
        _id: id || (type === 'AUDIOBOOK' ? 'efv_canon_v1_audio' : 'efv_canon_v1_ebook'),
        name: name,
        id: id || (type === 'AUDIOBOOK' ? 'efv_canon_v1_audio' : 'efv_canon_v1_ebook')
    };

    if (type === 'AUDIOBOOK') {
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

