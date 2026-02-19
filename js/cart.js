/**
 * EFV Cart JS - Shopping Logic
 */
console.log("EFV Cart JS Loaded - Version: 22.0 - Forced Cache Refresh");

document.addEventListener('DOMContentLoaded', () => {
    // Inject Premium Auth CSS
    if (!document.getElementById('auth-premium-style')) {
        const link = document.createElement('link');
        link.id = 'auth-premium-style';
        link.rel = 'stylesheet';
        link.href = 'css/auth-premium.css';
        document.head.appendChild(link);
    }

    // Inject Auth Toast
    if (!document.getElementById('auth-toast')) {
        const toast = document.createElement('div');
        toast.id = 'auth-toast';
        document.body.appendChild(toast);
    }
    // Inject Cart HTML if not present
    if (!document.getElementById('cart-panel')) {
        const cartHTML = `
    <!-- Cart Modal -->
    <div class="cart-backdrop"></div>
    <div id="cart-panel">
        <div class="cart-header">
            <h3>Your <span class="gold-text">Cart</span></h3>
            <div class="close-cart" style="cursor: pointer; font-size: 1.5rem;">&times;</div>
        </div>
        <div class="cart-items" id="cart-items-container" style="flex: 1; overflow-y: auto;">
            <!-- Items injected by JS -->
            <p style="text-align: center; margin-top: 50px; opacity: 0.5;">Your cart is empty.</p>
        </div>
        <div class="cart-total">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span>Total:</span>
                <span class="gold-text" id="cart-total-price">₹0.00</span>
            </div>
            <button class="btn btn-gold" id="checkout-btn" style="width: 100%; margin-bottom: 15px;">Checkout Now</button>
            <div class="auth-options" style="display: flex; gap: 10px;">
                <button class="btn btn-outline" id="cart-login-btn" style="flex: 1; font-size: 0.9rem; padding: 10px;">Login</button>
                <button class="btn btn-outline" id="cart-signup-btn" style="flex: 1; font-size: 0.9rem; padding: 10px;">Sign Up</button>
            </div>
        </div>

        <!-- User Profile View (Hidden by default) -->
        <div id="user-profile-view" style="display: none; padding: 20px; color: var(--gold-light);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: rgba(255, 211, 105, 0.1); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gold-energy);">
                    <i class="fas fa-user" style="font-size: 2rem; color: var(--gold-energy);"></i>
                </div>
                <h3 style="color: var(--gold-energy);">John Doe</h3>
                <p style="font-size: 0.9rem; opacity: 0.7;">john.doe@example.com</p>
            </div>
            <h4 style="border-bottom: 1px solid rgba(255, 211, 105, 0.2); padding-bottom: 10px; margin-bottom: 15px;">Purchase History</h4>
            <div id="purchase-history-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto;">
                <p style="text-align: center; opacity: 0.5; font-size: 0.85rem; margin-top: 20px;">No purchase history found.</p>
            </div>
            <button class="btn btn-outline" id="logout-btn" style="width: 100%; margin-top: 20px;">Logout</button>
        </div>
    </div>

    <!-- Premium Auth Modal -->
    <div class="auth-premium-overlay" id="auth-modal">
        <div class="auth-premium-card">
            <div class="auth-premium-close" id="close-auth-modal" title="Press ESC to close"><i class="fas fa-times"></i></div>
            
            <h2 class="auth-premium-title">Welcome to EFV™</h2>

            <div class="auth-premium-tabs">
                <div class="auth-tab-item active" data-auth-tab="login">Login</div>
                <div class="auth-tab-item" data-auth-tab="signup">Create Account</div>
            </div>

            <!-- Login Form -->
            <form id="login-form" class="auth-premium-form active">
                <div class="input-group">
                    <label class="auth-label">Email Address</label>
                    <div class="input-wrapper">
                        <input type="email" id="login-email" class="auth-input" placeholder="Enter your email" required>
                        <i class="fas fa-envelope input-icon"></i>
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="auth-label">Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required>
                        <i class="fas fa-lock input-icon"></i>
                        <i class="fas fa-eye password-toggle"></i>
                    </div>
                </div>
                
                <div class="auth-extras">
                    <label>
                        <input type="checkbox" id="remember-me">
                        <span>Remember me</span>
                    </label>
                    <a href="#" class="forgot-link">Forgot Password?</a>
                </div>

                <div id="login-general-error" class="error-message" style="margin-bottom:16px; text-align:center; font-weight:600;"></div>
                
                <button type="submit" class="auth-btn">
                    <span>Login Securely</span>
                    <div class="loader"></div>
                </button>
            </form>

            <!-- Sign Up Form -->
            <form id="signup-form" class="auth-premium-form">
                <div class="input-group">
                    <label class="auth-label">Full Name</label>
                    <div class="input-wrapper">
                        <input type="text" id="signup-name" class="auth-input" placeholder="John Doe" required>
                        <i class="fas fa-user input-icon"></i>
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="auth-label">Email Address</label>
                    <div class="input-wrapper">
                        <input type="email" id="signup-email" class="auth-input" placeholder="email@example.com" required>
                        <i class="fas fa-envelope input-icon"></i>
                    </div>
                    <div class="error-message" id="signup-email-error">Please enter a valid email</div>
                </div>
                
                <div class="input-group">
                    <label class="auth-label">Phone Number</label>
                    <div class="input-wrapper">
                        <input type="tel" id="signup-phone" class="auth-input" placeholder="10-digit number" required maxlength="10">
                        <i class="fas fa-phone input-icon"></i>
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="auth-label">Create Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="signup-password" class="auth-input" placeholder="••••••••" required>
                        <i class="fas fa-lock input-icon"></i>
                        <i class="fas fa-eye password-toggle"></i>
                    </div>
                    <div class="helper-text">Minimum 6 characters</div>
                </div>
                
                <div class="strength-indicator"><div class="strength-bar"></div></div>
                
                <div class="input-group" style="margin-top: 5px;">
                    <label class="auth-label">Verify Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="signup-confirm-password" class="auth-input" placeholder="••••••••" required>
                        <i class="fas fa-check-circle input-icon"></i>
                    </div>
                    <div class="error-message" id="signup-match-error">Passwords do not match</div>
                </div>
                
                <div id="signup-general-error" class="error-message" style="margin:12px 0; text-align:center; font-weight:600;"></div>

                <button type="submit" class="auth-btn" id="signup-submit-btn">
                    <span>Create Account</span>
                    <div class="loader"></div>
                </button>
            </form>
            <!-- Forgot Password Flow -->
            <div id="forgot-password-flow" style="display: none;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div class="auth-premium-back" id="back-to-login">
                        <i class="fas fa-arrow-left"></i> Back
                    </div>
                    <div style="flex: 1; text-align: center; font-size: 1rem; font-weight: 600; color: #fff; font-family: 'Cinzel', serif;" id="forgot-flow-title">Forgot Password</div>
                    <div style="width: 50px;"></div>
                </div>
                <!-- Step Indicator -->
                <div class="fp-step-indicator">
                    <div class="fp-step-dot active" id="fp-dot-1"></div>
                    <div class="fp-step-dot" id="fp-dot-2"></div>
                    <div class="fp-step-dot" id="fp-dot-3"></div>
                </div>

                <!-- Step 1: Send OTP -->
                <form id="forgot-email-form" class="auth-premium-form active">
                    <p style="text-align: center; margin-bottom: 20px; opacity: 0.8; font-size: 0.9rem;">Enter your email to receive a 6-digit verification code.</p>
                    <div class="input-group">
                        <label class="auth-label">Email Address</label>
                        <div class="input-wrapper">
                            <input type="email" id="forgot-email" class="auth-input" placeholder="Enter your email" required>
                            <i class="fas fa-envelope input-icon"></i>
                        </div>
                    </div>
                    <div id="forgot-email-error" class="error-message" style="margin-bottom: 20px; text-align: center;"></div>
                    <button type="submit" class="auth-btn">
                        <span>Send Code</span>
                        <div class="loader"></div>
                    </button>
                </form>

                <!-- Step 2: Verify OTP -->
                <form id="forgot-otp-form" class="auth-premium-form">
                    <p style="text-align: center; margin-bottom: 20px; opacity: 0.8; font-size: 0.9rem;">Enter the 6-digit code sent to your email.</p>
                    <div class="input-group">
                        <label class="auth-label">Verification Code</label>
                        <div class="input-wrapper">
                            <input type="text" id="forgot-otp" class="auth-input" placeholder="123456" maxlength="6" required style="letter-spacing: 5px; text-align: center; font-size: 1.5rem;">
                            <i class="fas fa-shield-alt input-icon"></i>
                        </div>
                    </div>
                    <div id="forgot-otp-error" class="error-message" style="margin-bottom: 20px; text-align: center;"></div>
                    <button type="submit" class="auth-btn">
                        <span>Verify Code</span>
                        <div class="loader"></div>
                    </button>
                    <p style="text-align: center; margin-top: 15px; font-size: 0.85rem;">
                        Didn't get it? <a href="#" id="resend-otp-btn" style="color: var(--gold-energy); text-decoration: none;">Resend</a>
                    </p>
                </form>

                <!-- Step 3: New Password -->
                <form id="forgot-reset-form" class="auth-premium-form">
                    <p style="text-align: center; margin-bottom: 20px; opacity: 0.8; font-size: 0.9rem;">Create a new secure password.</p>
                    <div class="input-group">
                        <label class="auth-label">New Password</label>
                        <div class="input-wrapper">
                            <input type="password" id="forgot-new-password" class="auth-input" placeholder="••••••••" required>
                            <i class="fas fa-lock input-icon"></i>
                            <i class="fas fa-eye password-toggle"></i>
                        </div>
                    </div>
                    <div class="input-group">
                        <label class="auth-label">Confirm New Password</label>
                        <div class="input-wrapper">
                            <input type="password" id="forgot-confirm-password" class="auth-input" placeholder="••••••••" required>
                            <i class="fas fa-check-circle input-icon"></i>
                        </div>
                    </div>
                    <div id="forgot-reset-error" class="error-message" style="margin-bottom: 20px; text-align: center;"></div>
                    <button type="submit" class="auth-btn">
                        <span>Reset Password</span>
                        <div class="loader"></div>
                    </button>
                </form>
                
                <!-- Success Message -->
                <div id="forgot-success-view" style="display: none; text-align: center; padding: 20px 0;">
                    <div style="font-size: 4rem; color: #10b981; margin-bottom: 20px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 style="color: #fff; margin-bottom: 15px; font-family: 'Cinzel', serif;">Password Reset!</h3>
                    <p style="opacity: 0.8; margin-bottom: 25px;">Your password has been updated successfully.</p>
                    <button class="auth-btn" id="finish-reset-btn">Login Now</button>
                </div>
            </div>
        </div>
    </div>`;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    // Inject Product Detail Modal HTML if not present
    if (!document.getElementById('product-detail-modal')) {
        const productModalHTML = `
        <div class="product-modal-overlay" id="product-detail-modal">
            <div class="product-modal-card">
                <div class="pm-close">&times;</div>
                <div class="pm-left">
                    <div class="pm-image-container">
                        <img src="" alt="Product Cover" id="pm-img">
                    </div>
                    <div class="pm-main-actions">
                        <button class="pm-btn pm-btn-cart" id="pm-add-to-cart"><i class="fas fa-shopping-cart"></i> ADD TO CART</button>
                        <button class="pm-btn pm-btn-buy" id="pm-buy-now"><i class="fas fa-bolt"></i> BUY NOW</button>
                    </div>
                </div>
                <div class="pm-right">
                    <div class="pm-title-section">
                        <h2 class="pm-title" id="pm-title">EFV™ VOL 1: THE ORIGIN CODE™</h2>
                        <span class="pm-edition" id="pm-edition">Hardcover Edition</span>
                        <div class="pm-rating">
                            <span>4.8 ★</span>
                            <span style="opacity: 0.5;">2,450 Reviews</span>
                        </div>
                        <div class="pm-price-row">
                            <span class="pm-price" id="pm-price">₹499</span>
                            <span class="pm-mrp" id="pm-mrp">₹999</span>
                            <span class="pm-discount">50% off</span>
                        </div>
                    </div>

                    <div class="pm-quantity-section" style="margin: 20px 0; padding: 15px; background: rgba(255, 211, 105, 0.05); border-radius: 10px; border: 1px solid rgba(255, 211, 105, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span style="font-weight: 600; color: var(--gold-energy);">Select Quantity:</span>
                            <div class="pm-quantity-controls" style="display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 5px 15px; border-radius: 20px; border: 1px solid rgba(255,211,105,0.3);">
                                <button id="pm-qty-minus" style="background:none; border:none; color:var(--gold-energy); cursor:pointer; font-size:1.2rem; padding:0 5px;"><i class="fas fa-minus"></i></button>
                                <span id="pm-qty-value" style="font-size:1.1rem; font-weight:700; min-width:20px; text-align:center;">1</span>
                                <button id="pm-qty-plus" style="background:none; border:none; color:var(--gold-energy); cursor:pointer; font-size:1.2rem; padding:0 5px;"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="opacity: 0.7; font-size: 0.9rem;">Subtotal:</span>
                            <span id="pm-subtotal" style="font-size: 1.3rem; font-weight: 800; color: var(--gold-energy);">₹499</span>
                        </div>
                    </div>

                    <div class="pm-collection-intro">
                        <h3>The EFV™ Collection</h3>
                        <p>Discover the transformative power of Energy, Frequency, and Vibration. Each volume in this sacred series is designed to align your consciousness with the universal code of existence.</p>
                    </div>

                    <div class="pm-tabs">
                        <div class="pm-tab-headers">
                            <button class="pm-tab-btn active" data-tab="specs">Specifications</button>
                            <button class="pm-tab-btn" data-tab="desc">Description</button>
                            <button class="pm-tab-btn" data-tab="mfr">Manufacturer info</button>
                        </div>
                        <div class="pm-tab-content active" id="tab-specs">
                            <table class="pm-specs-table" id="pm-specs-body">
                                <!-- Dynamic rows -->
                            </table>
                        </div>
                        <div class="pm-tab-content" id="tab-desc">
                            <p id="pm-desc-text"></p>
                        </div>
                        <div class="pm-tab-content" id="tab-mfr">
                            <div class="pm-mfr-list">
                                <div class="pm-mfr-item">
                                    <span class="pm-mfr-label">Generic Name</span>
                                    <span class="pm-mfr-value" id="pm-generic-name">Books</span>
                                </div>
                                <div class="pm-mfr-item">
                                    <span class="pm-mfr-label">Country of Origin</span>
                                    <span class="pm-mfr-value" id="pm-origin-text">India</span>
                                </div>
                                <div class="pm-mfr-item">
                                    <span class="pm-mfr-label">Name and address of the Manufacturer</span>
                                    <span class="pm-mfr-value" id="pm-mfr-full"></span>
                                </div>
                                <div class="pm-mfr-item">
                                    <span class="pm-mfr-label">Name and address of the Packer</span>
                                    <span class="pm-mfr-value" id="pm-packer-full"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', productModalHTML);
    }

    let cart = JSON.parse(localStorage.getItem('efv_cart')) || [];

    // User Data Isolation Helpers
    function getUserKey(baseKey) {
        const user = JSON.parse(localStorage.getItem('efv_user'));
        if (!user || !user.email) return baseKey;
        const cleanEmail = user.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return `${baseKey}_${cleanEmail}`;
    }
    window.getUserKey = getUserKey;


    const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'http://localhost:5000';

    async function syncLibraryWithBackend() {
        const user = JSON.parse(localStorage.getItem('efv_user'));
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/api/library/my-library`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const libKey = getUserKey('efv_digital_library');

                const localLibrary = data.map(prod => ({
                    id: (prod.productId || prod._id || '').toString(),
                    productId: (prod.productId || prod._id || '').toString(),
                    name: prod.title,
                    title: prod.title,
                    language: prod.language || '',
                    subtitle: prod.subtitle || '',
                    type: prod.type,
                    thumbnail: prod.thumbnail,
                    filePath: prod.filePath,
                    date: prod.purchasedAt ? new Date(prod.purchasedAt).toLocaleDateString() : new Date().toLocaleDateString()
                }));

                // Update only if data is valid array
                if (Array.isArray(localLibrary)) {
                    localStorage.setItem(libKey, JSON.stringify(localLibrary));
                }

                if (typeof updateLibraryDisplay === 'function') updateLibraryDisplay();
                if (typeof updateMarketplaceButtons === 'function') updateMarketplaceButtons();
            }
        } catch (error) {
            console.error('Library sync error:', error);
        }
    }
    window.syncLibraryWithBackend = syncLibraryWithBackend;

    // Update Marketplace buttons to reflect library state
    function updateMarketplaceButtons() {
        const libKey = getUserKey('efv_digital_library');
        const library = JSON.parse(localStorage.getItem(libKey)) || [];

        document.querySelectorAll('.product-card').forEach(card => {
            const id = card.getAttribute('data-id');
            const btn = card.querySelector('.add-to-cart');

            if (btn && (id.includes('audio') || id.includes('ebook'))) {
                // Robust check: matches raw ID or normalized (removal of _en suffix)
                const isOwned = library.some(item => {
                    const libId = (item.id || item.productId || '').toString();
                    return libId === id;
                });

                if (isOwned) {
                    btn.textContent = '✓ In Library';
                    btn.style.background = '#10b981';
                    btn.style.color = 'black';
                    btn.style.fontWeight = '700';
                    btn.disabled = false;
                } else {
                    const isDigital = id.includes('audio') || id.includes('ebook');
                    btn.textContent = isDigital ? 'Purchase Now' : 'Add to Cart';
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.fontWeight = '';
                    btn.disabled = false;
                }
            }
        });
    }
    window.updateMarketplaceButtons = updateMarketplaceButtons;
    // Select via ID (if updated) or Class for standard items
    const cartToggle = document.getElementById('cart-toggle') || document.querySelector('.cart-icon');
    const cartPanel = document.getElementById('cart-panel');
    const cartBackdrop = document.querySelector('.cart-backdrop');
    const closeCart = document.querySelector('.close-cart');
    const cartCount = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotalDisplay = document.getElementById('cart-total-price');

    function updateCartUI() {
        // Update Count
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        // Update List
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align: center; margin-top: 50px; opacity: 0.5;">Your cart is empty.</p>';
            cartTotalDisplay.textContent = '₹0.00';
        } else {
            cartContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info" style="flex: 1;">
                        <h4 style="margin-bottom: 5px;">${item.name}</h4>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="gold-text">₹${item.price} x ${item.quantity}</span>
                            <button class="remove-item" data-id="${item.id}" 
                                style="background: none; border: none; color: #ff6b6b; cursor: pointer; padding: 0; font-size: 0.9rem; display: flex; align-items: center;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            cartTotalDisplay.textContent = `₹${total.toFixed(2)}`;
        }

        // --- AUTH STATE UI UPDATES ---
        const user = JSON.parse(localStorage.getItem('efv_user'));
        const authOptions = document.querySelector('.auth-options');
        const checkoutBtn = document.getElementById('checkout-btn');
        const userProfileView = document.getElementById('user-profile-view');

        if (user) {
            if (authOptions) authOptions.style.display = 'none';
            if (checkoutBtn) checkoutBtn.style.display = 'block';

            // Show Profile View in side-cart
            if (userProfileView) {
                userProfileView.style.display = 'block';
                const nameDisplay = userProfileView.querySelector('h3');
                const emailDisplay = userProfileView.querySelector('p');
                if (nameDisplay) nameDisplay.textContent = user.name;
                if (emailDisplay) emailDisplay.textContent = user.email;
            }
        } else {
            if (authOptions) authOptions.style.display = 'flex';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            if (userProfileView) userProfileView.style.display = 'none';
        }

        localStorage.setItem('efv_cart', JSON.stringify(cart));

        // Add Remove listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);
                updateCartUI();
            });
        });
    }

    // Open Product Modal
    window.openProductModal = function openProductModal(productId, card) {
        const modal = document.getElementById('product-detail-modal');
        const data = window.EFV_Products[productId] || {
            title: card.getAttribute('data-name'),
            edition: card.querySelector('.pm-edition')?.textContent || card.querySelector('span[style*="color: var(--gold-energy)"]')?.textContent || "Special Edition",
            description: card.querySelector('p')?.textContent || "Premium EFV volume content.",
            specs: { "Product Form": "Book" },
            manufacturer: "EFV Intelligence",
            countryOfOrigin: "India"
        };

        // Populate Image
        const img = card.querySelector('img').src;
        document.getElementById('pm-img').src = img;

        // Populate Text
        document.getElementById('pm-title').textContent = data.title;
        document.getElementById('pm-edition').textContent = data.edition;
        document.getElementById('pm-price').textContent = `₹${card.getAttribute('data-price')}`;
        document.getElementById('pm-mrp').textContent = `₹${Math.round(card.getAttribute('data-price') * 2)}`;
        document.getElementById('pm-desc-text').textContent = data.description;

        // Reset Quantity and Subtotal
        const qtyValue = document.getElementById('pm-qty-value');
        const subtotal = document.getElementById('pm-subtotal');
        if (qtyValue) qtyValue.textContent = '1';
        if (subtotal) subtotal.textContent = `₹${card.getAttribute('data-price')}`;

        // Populate Mfr Info detailed
        document.getElementById('pm-generic-name').textContent = data.genericName || "Books";
        document.getElementById('pm-origin-text').textContent = data.countryOfOrigin || "India";
        document.getElementById('pm-mfr-full').textContent = `${data.mfrName || ''}, ${data.mfrAddress || ''}`;
        document.getElementById('pm-packer-full').textContent = `${data.packerName || ''}, ${data.packerAddress || ''}`;

        // Populate Specs
        const specsBody = document.getElementById('pm-specs-body');
        specsBody.innerHTML = Object.entries(data.specs).map(([label, value]) => `
            <tr>
                <td class="pm-spec-label">${label}</td>
                <td class="pm-spec-value">${value}</td>
            </tr>
        `).join('') + `
            <tr>
                <td class="pm-spec-label">Generic Name</td>
                <td class="pm-spec-value">Books</td>
            </tr>
        `;

        // Store current product ID on buttons
        const addBtn = document.getElementById('pm-add-to-cart');
        const buyBtn = document.getElementById('pm-buy-now');
        addBtn.setAttribute('data-target-id', productId);
        buyBtn.setAttribute('data-target-id', productId);

        // Reset Tabs
        document.querySelectorAll('.pm-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.pm-tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.pm-tab-btn[data-tab="specs"]').classList.add('active');
        document.getElementById('tab-specs').classList.add('active');

        // Show Modal
        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // NUCLEAR RESET: Clear all filters globally
        document.documentElement.style.filter = 'none';
        document.body.style.filter = 'none';

        const forceClear = () => {
            const card = document.querySelector('.product-modal-card');
            const overlay = document.querySelector('.product-modal-overlay');
            if (card) {
                card.style.setProperty('filter', 'none', 'important');
                card.style.setProperty('backdrop-filter', 'none', 'important');
            }
            if (overlay) {
                overlay.style.setProperty('backdrop-filter', 'none', 'important');
            }
        };

        // Run immediately and after short delays to catch transition end
        forceClear();
        setTimeout(forceClear, 50);
        setTimeout(forceClear, 300);
        setTimeout(forceClear, 600);

        // Multi-Action Delegation (Tabs + Buttons)
        if (modal && !modal.hasAttribute('data-listeners-init')) {
            modal.addEventListener('click', (e) => {
                // 1. Tab Switching
                const tabBtn = e.target.closest('.pm-tab-btn');
                if (tabBtn) {
                    const tabId = tabBtn.getAttribute('data-tab');
                    modal.querySelectorAll('.pm-tab-btn').forEach(b => b.classList.remove('active'));
                    modal.querySelectorAll('.pm-tab-content').forEach(c => c.classList.remove('active'));
                    tabBtn.classList.add('active');
                    const content = modal.querySelector(`#tab-${tabId}`);
                    if (content) content.classList.add('active');
                    return;
                }

                // 2. Add to Cart (Internal)
                const actionBtn = e.target.closest('#pm-add-to-cart');
                if (actionBtn) {
                    const id = actionBtn.getAttribute('data-target-id');
                    const card = document.querySelector(`.product-card[data-id="${id}"]`);
                    const qty = parseInt(document.getElementById('pm-qty-value')?.textContent) || 1;
                    if (card) {
                        processAddToCart(id, card, false, qty);
                        modal.classList.remove('active');
                        document.body.classList.remove('modal-open');
                    }
                    return;
                }

                // 3. Buy Now (Internal)
                const buyBtnAction = e.target.closest('#pm-buy-now');
                if (buyBtnAction) {
                    const id = buyBtnAction.getAttribute('data-target-id');
                    const card = document.querySelector(`.product-card[data-id="${id}"]`);
                    const qty = parseInt(document.getElementById('pm-qty-value')?.textContent) || 1;
                    if (card) {
                        showTermsAndConditions(() => {
                            const name = card.getAttribute('data-name');
                            const price = parseFloat(card.getAttribute('data-price'));
                            const item = {
                                id,
                                name,
                                price,
                                quantity: qty,
                                language: card.getAttribute('data-language') || '',
                                subtitle: card.getAttribute('data-subtitle') || ''
                            };

                            modal.classList.remove('active');
                            document.body.classList.remove('modal-open');
                            // Directly checkout with ONLY this item
                            checkoutOrder([item]);
                        });
                    }
                    return;
                }

                // New logic: Quantity Controls
                const minusBtn = e.target.closest('#pm-qty-minus');
                const plusBtn = e.target.closest('#pm-qty-plus');

                if (minusBtn || plusBtn) {
                    const qtyElem = document.getElementById('pm-qty-value');
                    const subtotalElem = document.getElementById('pm-subtotal');
                    const price = parseFloat(document.getElementById('pm-price').textContent.replace('₹', '')) || 0;
                    let currentQty = parseInt(qtyElem.textContent) || 1;

                    if (minusBtn && currentQty > 1) currentQty--;
                    if (plusBtn) currentQty++;

                    qtyElem.textContent = currentQty;
                    subtotalElem.textContent = `₹${(price * currentQty).toFixed(2)}`;
                    return;
                }

                // 4. Close Modal
                const closeBtn = e.target.closest('.pm-close') || e.target === modal;
                if (closeBtn) {
                    modal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                    return;
                }
            });
            modal.setAttribute('data-listeners-init', 'true');
        }
    }

    // --- Terms & Conditions Logic ---
    function showTermsAndConditions(onAccept) {
        let tcOverlay = document.getElementById('tc-modal');
        if (!tcOverlay) {
            const tcHTML = `
            <div class="tc-modal-overlay" id="tc-modal">
                <div class="tc-card">
                    <div class="tc-close">&times;</div>
                    <h2 class="tc-title"><i class="fas fa-file-contract" style="margin-right:15px;"></i>Terms & Conditions</h2>
                    <div class="tc-content">
                        <p style="text-align:center; font-style:italic; border-bottom:1px solid var(--glass-border); padding-bottom:15px; margin-bottom:20px;">Last Updated: 13/02/2026</p>
                        
                        <p>Welcome to EFV. By purchasing “EFV” (Energy–Frequency–Vibration) book from our website, you agree to the following terms:</p>

                        <strong>1. Product Information</strong>
                        <p>We sell physical copies (Hardcover / Paperback) and digital formats (E-book / Audiobook) of EFV.</p>

                        <strong>2. Pricing & Payments</strong>
                        <p>• All prices are listed in INR.<br>• Payments are processed securely via Razorpay.<br>• We reserve the right to change prices.</p>

                        <strong>3. Order Confirmation</strong>
                        <p>• You will receive an email confirmation after successful payment.<br>• Orders are processed within 2-3 working days.</p>

                        <strong>4. Shipping & Delivery (For Physical Books)</strong>
                        <p>• Delivery timelines: Depends on delivery location.<br>• Delays due to courier or external factors may happen.<br>• Incorrect shipping details provided by the customer are the customer’s responsibility.</p>

                        <strong>5. Refund & Cancellation</strong>
                        <p>• Physical books: Refunds allowed only if product is damaged on delivery, opening video required. (proof required within 48 hours).<br>• Digital products (E-book / Audiobook): Non-refundable once delivered.<br>• Refund processing time: 5–7 business days.</p>

                        <strong>6. Intellectual Property</strong>
                        <p>All content of EFV is protected by copyright. Unauthorized reproduction, distribution, or sharing (especially digital formats) is strictly prohibited.</p>

                        <strong>7. Governing Law</strong>
                        <p>These terms are governed by the laws of India.</p>

                        <strong>8. Contact Information</strong>
                        <p>For support or queries:<br>Email: admin@uwo24.com<br>Company Name: Unified Web Options and Services Private Limited<br>Project: EFV- Energy Frequency Vibration</p>
                    </div>
                    <div class="tc-footer">
                        <label class="tc-checkbox-container">
                            <input type="checkbox" id="tc-accept-check">
                            <span class="tc-checkmark"></span>
                            I agree to the Terms & Conditions
                        </label>
                        <button class="tc-btn" id="tc-proceed-btn" disabled>PROCEED TO PAYMENT</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', tcHTML);
            tcOverlay = document.getElementById('tc-modal');
        }

        const checkbox = tcOverlay.querySelector('#tc-accept-check');
        const proceedBtn = tcOverlay.querySelector('#tc-proceed-btn');
        const closeBtn = tcOverlay.querySelector('.tc-close');

        checkbox.checked = false;
        proceedBtn.disabled = true;

        tcOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const handleCheck = () => {
            proceedBtn.disabled = !checkbox.checked;
        };

        const handleProceed = () => {
            tcOverlay.classList.remove('active');
            document.body.style.overflow = '';
            proceedBtn.removeEventListener('click', handleProceed);
            checkbox.removeEventListener('change', handleCheck);
            if (onAccept) onAccept();
        };

        const handleClose = () => {
            tcOverlay.classList.remove('active');
            document.body.style.overflow = '';
            proceedBtn.removeEventListener('click', handleProceed);
            checkbox.removeEventListener('change', handleCheck);
        };

        checkbox.addEventListener('change', handleCheck);
        proceedBtn.addEventListener('click', handleProceed);
        closeBtn.addEventListener('click', handleClose);
    }

    // --- QR Payment Modal Logic ---


    // Helper for actual cart addition logic
    async function processAddToCart(id, card, triggerModal = true, customQty = 1, directCheckout = false) {
        if (triggerModal) {
            openProductModal(id, card);
            return;
        }

        const name = card.getAttribute('data-name');
        const price = parseFloat(card.getAttribute('data-price'));
        const language = card.getAttribute('data-language') || '';
        const subtitle = card.getAttribute('data-subtitle') || '';
        const isDigitalProduct = id.includes('audio') || id.includes('ebook');

        const quantityToAdd = parseInt(customQty) || 1;

        if (isDigitalProduct) {
            // TESTING MODE: Direct Update to Library (Bypassing Cart/Payment for Testing)
            const libKey = getUserKey('efv_digital_library');
            let library = JSON.parse(localStorage.getItem(libKey)) || [];

            // IMPORTANT: Only check by ID — audiobook and ebook of same volume share the same name/title.
            // Name-based check would falsely report ebook as owned when only audiobook is owned.
            const alreadyOwned = library.some(item =>
                item.id === id || item.productId === id
            );

            if (!alreadyOwned) {
                const user = JSON.parse(localStorage.getItem('efv_user'));
                const token = localStorage.getItem('authToken');

                // ⚠️ KEY FIX: Call backend FIRST and AWAIT it, then redirect.
                // Previously, the confirm+redirect happened BEFORE the backend call finished,
                // causing a race condition where the library page loaded before the item was saved.

                if (user && token) {
                    // Show loading state
                    const purchasingMsg = `Purchasing "${name}"... Please wait.`;
                    console.log('🛒 Starting backend purchase...');

                    try {
                        const response = await fetch(`${API_BASE}/api/orders/test-digital`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                productId: id,
                                price: price,
                                name: name,
                                type: id.includes('audio') ? 'AUDIOBOOK' : 'EBOOK'
                            })
                        });
                        const data = await response.json();

                        if (data.success) {
                            console.log('✅ Digital Test Purchase Success (backend saved):', data);

                            // Now add to localStorage (backend is already saved)
                            library.push({
                                id: id,
                                productId: id,
                                name: name,
                                title: name,
                                language: language,
                                subtitle: subtitle,
                                type: id.includes('audio') ? 'Audiobook' : 'E-Book',
                                thumbnail: card.querySelector('img') ? card.querySelector('img').src : 'img/vol1-cover.png',
                                date: new Date().toLocaleDateString()
                            });
                            localStorage.setItem(libKey, JSON.stringify(library));

                            // Add to purchase history
                            const historyKey = getUserKey('efv_purchase_history');
                            let history = JSON.parse(localStorage.getItem(historyKey)) || [];
                            history.push({ name, price, quantity: 1, date: new Date().toLocaleDateString() });
                            localStorage.setItem(historyKey, JSON.stringify(history));

                            // NOW redirect (backend is saved, so library page will have the item)
                            if (confirm(`✅ "${name}" purchased successfully!\n\nGo to My Library now?`)) {
                                document.location.href = 'profile.html?tab=library';
                            }
                        } else {
                            console.warn('⚠️ Backend purchase failed:', data.message);
                            alert(`Purchase failed: ${data.message}\n\nPlease try again or contact support.`);
                        }
                    } catch (err) {
                        console.error('Backend purchase error:', err);
                        // Fallback: save locally and show warning
                        library.push({
                            id: id, productId: id, name, title: name,
                            type: id.includes('audio') ? 'Audiobook' : 'E-Book',
                            thumbnail: card.querySelector('img') ? card.querySelector('img').src : 'img/vol1-cover.png',
                            date: new Date().toLocaleDateString()
                        });
                        localStorage.setItem(libKey, JSON.stringify(library));
                        if (confirm(`"${name}" added to Library (offline mode).\nNote: May not sync across devices.\n\nGo to My Library?`)) {
                            document.location.href = 'profile.html?tab=library';
                        }
                    }
                } else {
                    // Not logged in — save locally and prompt login
                    library.push({
                        id: id, productId: id, name, title: name,
                        type: id.includes('audio') ? 'Audiobook' : 'E-Book',
                        thumbnail: card.querySelector('img') ? card.querySelector('img').src : 'img/vol1-cover.png',
                        date: new Date().toLocaleDateString()
                    });
                    localStorage.setItem(libKey, JSON.stringify(library));
                    if (confirm(`"${name}" added to Library!\n\nGo to My Library now?`)) {
                        document.location.href = 'profile.html?tab=library';
                    }
                }

            } else {
                if (confirm(`You already own "${name}".\n\nGo to Library?`)) {
                    document.location.href = 'profile.html?tab=library';
                }
            }

            // 3. Update UI
            if (typeof updateLibraryDisplay === 'function') updateLibraryDisplay();
            if (typeof updateMarketplaceButtons === 'function') updateMarketplaceButtons();

            // 3. Do NOT open cart, stay on page or reflect state
            return;
        } else {
            // Physical
            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.quantity += quantityToAdd;
            } else {
                cart.push({ id, name, price, quantity: quantityToAdd, type: 'PHYSICAL' });
            }
            localStorage.setItem('efv_cart', JSON.stringify(cart));
            updateCartUI();

            // Show Standard Cart for physical (ensure profile is hidden)
            toggleUserProfile(false);
            toggleCart(true);
        }
    }

    // Outer "Add to Cart" listener (Global Delegation)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (!btn || btn.classList.contains('pm-btn')) return; // Ignore modal buttons here

        const card = btn.closest('.product-card');
        if (card) {
            const id = card.getAttribute('data-id');
            const isDigital = id.includes('audio') || id.includes('ebook');

            if (isDigital) {
                // Instant Access for Digital - Direct Checkout
                processAddToCart(id, card, false, 1, true);
            } else {
                // Standard Flow for Physical
                openProductModal(id, card);
            }
        }
    });

    function toggleCart(show) {
        if (show) {
            cartPanel.classList.add('active');
            if (cartBackdrop) cartBackdrop.classList.add('active');
            document.body.classList.add('modal-open');
        } else {
            cartPanel.classList.remove('active');
            if (cartBackdrop) cartBackdrop.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // Panel Toggle
    if (cartToggle) {
        cartToggle.addEventListener('click', (e) => {
            e.preventDefault();

            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem('efv_user'));
            if (user) {
                // Redirect to Dashboard
                window.location.href = 'profile.html';
                return;
            }

            const isActive = cartPanel.classList.contains('active');
            toggleCart(!isActive);
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => toggleCart(false));
    }

    if (cartBackdrop) {
        cartBackdrop.addEventListener('click', () => toggleCart(false));
    }

    // Auth Logic
    const checkoutBtn = document.getElementById('checkout-btn');
    const loginBtn = document.getElementById('cart-login-btn');
    const signupBtn = document.getElementById('cart-signup-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Views
    const cartTotalSection = document.querySelector('.cart-total');
    const cartItemsSection = document.getElementById('cart-items-container');
    const userProfileView = document.getElementById('user-profile-view');

    function openAuthModal(mode = 'login') {
        if (!authModal) return;

        // Hide cart when opening auth modal
        toggleCart(false);

        authModal.classList.add('active');
        document.body.classList.add('modal-open');
        if (mode === 'login') {
            switchTab('login');
        } else {
            switchTab('signup');
        }
    }

    function closeAuth() {
        if (authModal) {
            authModal.classList.remove('active');
            if (!cartPanel.classList.contains('active')) {
                document.body.classList.remove('modal-open');
            }
        }
    }

    function switchTab(mode) {
        // Update tab items — uses data-auth-tab attribute (new HTML structure)
        document.querySelectorAll('.auth-tab-item').forEach(t => {
            t.classList.toggle('active', t.dataset.authTab === mode);
        });
        // Update forms — show matching form, hide others
        document.querySelectorAll('.auth-premium-form').forEach(f => {
            f.classList.remove('active');
            f.style.display = 'none';
        });
        const activeForm = document.getElementById(`${mode}-form`);
        if (activeForm) {
            activeForm.classList.add('active');
            activeForm.style.display = 'flex';
        }
    }




    // Update Library Display Helper
    function updateLibraryDisplay(playingName = null) {
        const libraryList = document.getElementById('my-library-list');
        if (!libraryList) return;

        const libKey = getUserKey('efv_digital_library');
        const library = JSON.parse(localStorage.getItem(libKey)) || [];
        if (library.length > 0) {
            libraryList.innerHTML = library.map(item => {
                const isPlaying = item.name === playingName;
                const isPaused = isPlaying && currentAudio && currentAudio.paused;

                const isAudio = item.type === 'Audiobook';
                const progressInfo = (item.type === 'E-book' && item.progress) ?
                    `<span style="margin-left: 10px; padding: 2px 6px; background: rgba(255,211,105,0.2); border-radius: 4px; color: var(--gold-energy); font-size: 0.7rem;">Page ${item.progress}</span>` : '';

                // Audiobook specific progress
                let lastListenedText = '';
                let progressBar = '';
                if (isAudio && item.lastPlayedTime) {
                    const mins = Math.floor(item.lastPlayedTime / 60);
                    const secs = Math.floor(item.lastPlayedTime % 60);
                    lastListenedText = `<div style="font-size: 0.75rem; color: var(--gold-energy); margin-top: 4px; opacity: 0.8;">
                        <i class="fas fa-history" style="font-size: 0.7rem; margin-right: 4px;"></i> Last listened: ${mins} min ${secs} sec
                    </div>`;

                    const percent = Math.min((item.lastPlayedTime / (item.totalDuration || 1)) * 100, 100);
                    progressBar = `
                        <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; overflow: hidden;">
                            <div style="width: ${percent}%; height: 100%; background: var(--gold-energy); box-shadow: 0 0 10px var(--gold-energy);"></div>
                        </div>
                    `;
                }

                const imgUrl = item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : (window.API_BASE || 'http://localhost:5000') + (item.thumbnail.startsWith('/') ? '' : '/') + item.thumbnail) : 'img/placeholder.png';

                return `
                <div style="background: rgba(255, 211, 105, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 211, 105, 0.1); display: flex; gap: 15px; align-items: center; transition: all 0.3s; margin-bottom: 10px;">
                    <div style="width: 60px; height: 85px; flex-shrink: 0; position: relative;">
                        <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        <div style="position: absolute; top: -5px; right: -5px; width: 22px; height: 22px; background: var(--gold-energy); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: black; font-size: 0.7rem;">
                            <i class="fas ${isAudio ? 'fa-headphones' : 'fa-book'}"></i>
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1; min-width: 0;">
                                <h4 style="margin: 0; font-size: 1rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h4>
                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                    <span style="font-size: 0.7rem; padding: 2px 6px; background: rgba(255,211,105,0.1); border: 1px solid rgba(255,211,105,0.2); border-radius: 4px; color: var(--gold-energy); text-transform: uppercase; font-weight: 700;">${item.type}</span>
                                    <span style="font-size: 0.7rem; opacity: 0.5;">Purchased: ${item.date}</span>
                                </div>
                                ${progressInfo}
                                ${lastListenedText}
                            </div>
                            <div style="margin-left: 10px;">
                                <button onclick="window.accessContent('${item.type}', '${item.name.replace(/'/g, "\\'")}')" 
                                        style="background: ${isPlaying ? (isPaused ? 'var(--gold-energy)' : '#ff6b6b') : 'var(--gold-energy)'}; color: black; border: none; padding: 8px 15px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${isAudio ? (isPlaying ? (isPaused ? '<i class="fas fa-play"></i> RESUME' : '<i class="fas fa-pause"></i> PAUSE') : '<i class="fas fa-play"></i> LISTEN NOW') : (item.progress ? '<i class="fas fa-book-open"></i> RESUME READ' : '<i class="fas fa-book-open"></i> READ NOW')}
                                </button>
                            </div>
                        </div>
                        ${progressBar}
                    </div>
                </div>
            `}).join('');
        } else {
            libraryList.innerHTML = '<p style="font-size: 0.8rem; opacity: 0.5; text-align: center;">No digital products yet.</p>';
        }
    }

    function updateHistoryDisplay() {
        const historyList = document.getElementById('purchase-history-list');
        if (!historyList) return;

        const historyKey = getUserKey('efv_purchase_history');
        const history = JSON.parse(localStorage.getItem(historyKey)) || [];
        if (history.length > 0) {
            historyList.innerHTML = history.map(h => `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem;">${h.name} ${h.quantity > 1 ? `x ${h.quantity}` : ''}</span>
                    <span class="gold-text">₹${(h.price * h.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        } else {
            historyList.innerHTML = '<p style="font-size: 0.8rem; opacity: 0.5; text-align: center;">No purchase history.</p>';
        }
    }

    // --- UNIVERSAL SECURITY ENGINE ---
    let currentAudio = null;
    let currentPlayingName = null;
    let isSecurityActive = false;
    let globalFocusTracker = null;

    // Global Security Style Injection
    if (!document.getElementById('efv-security-styles')) {
        const style = document.createElement('style');
        style.id = 'efv-security-styles';
        style.innerHTML = `
            .global-security-alert {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: #dc2626; color: white; padding: 40px 60px; border-radius: 20px;
                font-weight: 900; z-index: 20000; text-align: center; display: none;
                box-shadow: 0 0 200px rgba(220, 38, 38, 1); border: 8px solid white;
                text-transform: uppercase; letter-spacing: 3px; font-family: 'Cinzel', serif;
                animation: securityShake 0.1s ease-in-out infinite alternate;
            }
            @keyframes securityShake { from { transform: translate(-50.5%, -50%); } to { transform: translate(-49.5%, -50%); } }
            .content-lockout { filter: none !important; opacity: 0.1 !important; pointer-events: none !important; }
        `;
        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', `
            <div id="global-security-lock" class="global-security-alert">
                <i class="fas fa-biohazard" style="font-size: 5rem; display: block; margin-bottom: 20px;"></i>
                🚨 SECURE LOCK ACTIVE 🚨<br>
                <span style="font-size: 1.2rem; margin-top: 15px; display: block;">CAPTURE ATTEMPT DETECTED</span>
                <span style="font-size: 0.8rem; font-weight: 400; opacity: 0.8; margin-top: 20px; display: block;">Access suspended. Please return to active window to unlock.</span>
            </div>
        `);
    }

    const triggerGlobalLock = () => {
        if (!isSecurityActive) return;

        // 1. Pause Audio
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            updateLibraryDisplay(currentPlayingName);
        }

        // 2. Blackout PDF
        const pdfCard = document.getElementById('pdf-content-card');
        if (pdfCard) pdfCard.classList.add('blackout');

        // 3. Show Global Alert
        document.getElementById('global-security-lock').style.display = 'block';
    };

    const releaseGlobalLock = () => {
        document.getElementById('global-security-lock').style.display = 'none';
        const pdfCard = document.getElementById('pdf-content-card');
        if (pdfCard) pdfCard.classList.remove('blackout');
    };

    const globalSecurityBlur = () => triggerGlobalLock();
    const globalSecurityFocus = () => releaseGlobalLock();

    const globalPreventShortcuts = (e) => {
        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const isWinKey = e.key === 'Meta' || e.keyCode === 91 || e.keyCode === 92;

        // Block Ctrl+Shift+R (Screen record), Win+Shift+S, PrintScreen, etc.
        if (
            isWinKey || e.key === 'PrintScreen' || e.key === 'F12' ||
            (isCtrlOrMeta && e.shiftKey && (e.key === 'R' || e.key === 'r' || e.key === 'S' || e.key === 's' || e.key === 'I' || e.key === 'i')) ||
            (isCtrlOrMeta && (e.key === 'U' || e.key === 'u' || e.key === 'P' || e.key === 'p' || e.key === 'S' || e.key === 's'))
        ) {
            // Allow F12 for debugging if needed, but shield might trigger
            if (e.key === 'F12') {
                // For now, allow F12 without lock so user can see console
                return;
            }

            e.preventDefault();
            triggerGlobalLock();
            // Alert removed to be less intrusive
        }
    };

    const activateSecurityShield = () => {
        if (isSecurityActive) return;
        isSecurityActive = true;

        window.addEventListener('blur', globalSecurityBlur);
        window.addEventListener('focus', globalSecurityFocus);
        document.addEventListener('keydown', globalPreventShortcuts, true);
        document.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('mouseleave', globalSecurityBlur);
        window.addEventListener('mouseenter', globalSecurityFocus);

        // High frequency focus polling - DISABLED for better UX during testing/reading
        // globalFocusTracker = setInterval(() => {
        //     if (!document.hasFocus()) triggerGlobalLock();
        // }, 150);
    };

    const deactivateSecurityShield = () => {
        isSecurityActive = false;
        clearInterval(globalFocusTracker);
        window.removeEventListener('blur', globalSecurityBlur);
        window.removeEventListener('focus', globalSecurityFocus);
        document.removeEventListener('keydown', globalPreventShortcuts, true);
        window.removeEventListener('mouseleave', globalSecurityBlur);
        window.removeEventListener('mouseenter', globalSecurityFocus);
        releaseGlobalLock();
    };

    window.accessContent = function (type, name) {
        if (type === 'Audiobook') {
            // Handle same item toggle
            if (currentPlayingName === name && currentAudio) {
                if (!currentAudio.paused) {
                    currentAudio.pause();
                    updateLibraryDisplay(name);
                } else {
                    currentAudio.play();
                    updateLibraryDisplay(name);
                }
                return;
            }

            // Stop any existing audio if it's a different item
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            const launchAudio = (startTime = 0) => {
                const audioPath = 'assets/videos/efv-audio.mp3';
                try {
                    console.log("Attempting to play audio (MP3):", audioPath, "at", startTime);
                    currentAudio = new Audio(audioPath);
                    currentPlayingName = name;

                    currentAudio.onloadedmetadata = () => {
                        if (startTime > 0) currentAudio.currentTime = startTime;
                        currentAudio.play().then(() => {
                            updateLibraryDisplay(name);
                        }).catch(e => console.error('Audio Play Error:', e));
                    };

                    // Progress Tracking (Continuous 1s local, 5s backend)
                    let lastLocalSave = 0;
                    let lastCloudSave = 0;
                    currentAudio.ontimeupdate = () => {
                        const now = currentAudio.currentTime;

                        // 1. Local update every ~1 second for smooth UI
                        if (Math.abs(now - lastLocalSave) >= 1) {
                            lastLocalSave = now;
                            window.saveAudioProgress(name, now, currentAudio.duration, false, false); // false for syncCloud
                        }

                        // 2. Cloud update every ~5 seconds
                        if (Math.abs(now - lastCloudSave) >= 5) {
                            lastCloudSave = now;
                            window.saveAudioProgress(name, now, currentAudio.duration, false, true); // true for syncCloud
                        }
                    };

                    currentAudio.onpause = () => {
                        window.saveAudioProgress(name, currentAudio.currentTime, currentAudio.duration);
                        updateLibraryDisplay(name);
                    };

                    currentAudio.onended = () => {
                        window.saveAudioProgress(name, 0, currentAudio.duration, true);
                        currentPlayingName = null;
                        currentAudio = null;
                        updateLibraryDisplay(null);
                    };

                } catch (e) {
                    alert('⚠️ Error initializing audio: ' + e.message);
                }
            };

            const fetchAudioCloudProgress = async () => {
                const libKey = getUserKey('efv_digital_library');
                const library = JSON.parse(localStorage.getItem(libKey)) || [];
                const item = library.find(i => i.name === name);
                let localTime = (item && item.lastPlayedTime) ? parseFloat(item.lastPlayedTime) : 0;

                const user = JSON.parse(localStorage.getItem('efv_user'));
                if (user && user.email && item && item.id) {
                    try {
                        const demoToken = btoa(user.email);
                        const res = await fetch(`http://localhost:5000/api/demo/progress/${item.id}`, {
                            headers: { 'Authorization': `Bearer ${demoToken}` }
                        });
                        const data = await res.json();
                        if (data && data.progress && parseFloat(data.progress) > localTime) {
                            return parseFloat(data.progress);
                        }
                    } catch (e) {
                        console.warn('Audio cloud progress fetch failed', e);
                    }
                }
                return localTime;
            };

            fetchAudioCloudProgress().then(finalTime => {
                if (finalTime > 10) {
                    // Logic for resume modal handled via showResumeOption
                    const mins = Math.floor(finalTime / 60);
                    const secs = Math.floor(finalTime % 60);
                    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

                    showResumeOption(name, timeStr,
                        () => launchAudio(finalTime),
                        () => launchAudio(0)
                    );
                } else {
                    launchAudio(0);
                }
            });
        } else {
            // E-Book Logic (Secure Viewer)
            console.log("Accessing content type:", type, "Name:", name);

            // Get saved progress (Local - Default)
            const libKey = getUserKey('efv_digital_library');
            const library = JSON.parse(localStorage.getItem(libKey)) || [];
            const item = library.find(i => i.name === name);
            let savedPage = (item && item.progress) ? parseInt(item.progress) : 1;

            // PDF Loading Strategy:
            // 1. Try Base64 data first (Works on file:// and http://)
            // 2. Fallback to file path (Works on http://, fails on file://)
            let pdfSource = 'js/pdfjs/efv-checklist.pdf';

            if (typeof EFV_PDF_DATA !== 'undefined') {
                console.log("✅ Using Base64 PDF Data (Bypasses CORS/Protocol issues)");
                pdfSource = EFV_PDF_DATA;
            } else {
                // Smart path resolution fallback
                if (window.location.protocol === 'file:') {
                    pdfSource = 'js/pdfjs/efv-checklist.pdf';
                } else {
                    pdfSource = '/js/pdfjs/efv-checklist.pdf';
                }
            }

            console.log("Attempting to open PDF with source length:", pdfSource.length > 100 ? "Base64 Data" : pdfSource);

            const launchViewer = (page) => {
                toggleCart(false); // Auto-close
                if (typeof openPdfViewer === 'function') {
                    openPdfViewer(pdfSource, name, page);
                } else {
                    console.error("openPdfViewer function not found!");
                    alert("Error: Internal viewer missing. Please reload the page.");
                }
            };

            // Async Fetch from Backend (if online & logged in)
            const fetchCloudProgress = async () => {
                const user = JSON.parse(localStorage.getItem('efv_user'));
                if (user && user.email) {
                    try {
                        const demoToken = btoa(user.email);
                        // Use Item ID if available
                        const productId = item ? item.id : null;

                        if (productId) {
                            const res = await fetch(`http://localhost:5000/api/demo/progress/${productId}`, {
                                headers: { 'Authorization': `Bearer ${demoToken}` }
                            });
                            const data = await res.json();
                            if (data && data.progress && data.progress > savedPage) {
                                console.log(`☁️ Cloud progress found: Page ${data.progress} (Local: ${savedPage})`);
                                return parseInt(data.progress);
                            }
                        }
                    } catch (e) {
                        console.warn('Cloud progress fetch failed, using local.', e);
                    }
                }
                return savedPage;
            };

            // Execute Launch
            fetchCloudProgress().then(finalPage => {
                if (finalPage > 1) {
                    // Resume Option
                    if (typeof showResumeOption === 'function') {
                        showResumeOption(name, finalPage,
                            () => launchViewer(finalPage),
                            () => launchViewer(1)
                        );
                    } else {
                        // Fallback
                        if (confirm(`Resume "${name}" from page ${finalPage}? Click Cancel to start over.`)) {
                            launchViewer(finalPage);
                        } else {
                            launchViewer(1);
                        }
                    }
                } else {
                    // First time or page 1 -> Direct Open
                    launchViewer(1);
                }
            });
        }
    };

    window.saveAudioProgress = async function (bookName, time, duration, forceReset = false, syncCloud = true) {
        const libKey = getUserKey('efv_digital_library');
        const library = JSON.parse(localStorage.getItem(libKey)) || [];
        const index = library.findIndex(i => i.name === bookName);

        if (index !== -1) {
            const isDone = forceReset || (duration > 0 && time / duration >= 0.95);
            const finalTime = isDone ? 0 : time;

            library[index].lastPlayedTime = finalTime;
            library[index].totalDuration = duration;
            localStorage.setItem(libKey, JSON.stringify(library));

            // Only update UI if we are on the profile page or sidebar is open
            // This is fast so we can call it frequently
            updateLibraryDisplay(currentPlayingName);

            if (!syncCloud) return;

            const user = JSON.parse(localStorage.getItem('efv_user'));
            if (user && user.email && library[index].id) {
                try {
                    const demoToken = btoa(user.email);
                    await fetch('http://localhost:5000/api/demo/progress', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${demoToken}`
                        },
                        body: JSON.stringify({
                            productId: library[index].id,
                            progress: finalTime,
                            total: duration
                        })
                    });
                } catch (e) {
                    console.warn('Audio sync failed', e);
                }
            }
        }
    };

    window.saveEbookProgress = async function (bookName, page) {
        // 1. Local Storage Update (Immediate Feedback)
        const libKey = getUserKey('efv_digital_library');
        const library = JSON.parse(localStorage.getItem(libKey)) || [];
        const index = library.findIndex(i => i.name === bookName);

        if (index !== -1) {
            library[index].progress = page;
            localStorage.setItem(libKey, JSON.stringify(library));
            updateLibraryDisplay();
        }

        // 2. Backend Sync (Silent)
        const user = JSON.parse(localStorage.getItem('efv_user'));
        if (user && user.email) {
            try {
                // Use Name as ID for now or find the ID map
                // In demo.js we use productId, but frontend only has name easily available in this context
                // We'll try to find the ID from the library object
                let productId = null;
                if (index !== -1 && library[index].id) {
                    productId = library[index].id;
                } else {
                    // Fallback map if needed, or send name as ID (backend needs to handle it)
                    // For now, we assume library has ID
                }

                if (productId) {
                    const demoToken = btoa(user.email);
                    console.log(`📤 Syncing to backend: ${productId} -> Page ${page}`);
                    const res = await fetch('http://localhost:5000/api/demo/progress', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${demoToken}`
                        },
                        body: JSON.stringify({
                            productId: productId,
                            progress: page,
                            total: 0
                        })
                    });
                    const data = await res.json();
                    console.log('✅ Backend Response:', data);
                }
            } catch (error) {
                console.warn('❌ Backend progress sync failed:', error);
            }
        }

        // 3. UI Feedback
        const btn = document.getElementById('save-bookmark-btn');
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Saved';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
            }, 2000);
        }
    };

    // Secure PDF Viewer (In-App)
    function openPdfViewer(url, title, startPage = 1) {
        console.log("PDF Viewer requested for:", url);

        // Remove existing viewer if any
        const existing = document.getElementById('pdf-viewer-modal');
        if (existing) existing.remove();

        // Inject Styles if not present
        if (!document.getElementById('pdf-viewer-styles')) {
            const style = document.createElement('style');
            style.id = 'pdf-viewer-styles';
            style.innerHTML = `
                #pdf-viewer-modal {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.95); z-index: 20000; display: flex;
                    align-items: center; justify-content: center;
                    animation: fadeIn 0.3s ease-out;
                }
                .pdf-card {
                    width: 95%; height: 95%; background: #111; border: 1px solid #ffd700;
                    border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 0 0 50px rgba(0,0,0,0.8); position: relative;
                }
                .pdf-close-btn {
                    position: absolute; top: 15px; right: 15px; width: 40px; height: 40px;
                    background: rgba(255,0,0,0.2); border: 1px solid red; border-radius: 50%;
                    color: white; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; z-index: 100; font-size: 1.2rem; transition: all 0.3s;
                }
                .pdf-close-btn:hover {
                    background: rgba(255,0,0,0.5); transform: scale(1.1);
                }
                #pdf-viewer-container { 
                    flex: 1; width: 100%; height: 100%; 
                    user-select: none; -webkit-user-select: none; -moz-user-select: none;
                }
                #pdf-viewer-container::-webkit-scrollbar {
                    width: 8px;
                }
                #pdf-viewer-container::-webkit-scrollbar-track {
                    background: #222;
                }
                #pdf-viewer-container::-webkit-scrollbar-thumb {
                    background: var(--gold-energy);
                    border-radius: 4px;
                }
                .pdf-page-canvas {
                    display: block;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    border-radius: 4px;
                    max-width: 100%;
                    height: auto;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    pointer-events: none; /* Prevent right-click on canvas */
                }
                #pdf-sync-status.active {
                    opacity: 1 !important;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                /* Security Notice */
                .pdf-security-notice {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid rgba(255, 0, 0, 0.3);
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    color: #ff6b6b;
                    opacity: 0.6;
                    pointer-events: none;
                    z-index: 50;
                }
            `;
            document.head.appendChild(style);
        }

        // Enhanced Viewer HTML with Controls
        const viewerHTML = `
            <div id="pdf-viewer-modal">
                <div class="pdf-card">
                    <button id="close-pdf-viewer" class="pdf-close-btn"><i class="fas fa-times"></i></button>
                    <div style="padding: 10px; text-align: center; color: #ffd700; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin:0;">${title}</h3>
                        <div id="pdf-controls-area" style="display: flex; gap: 10px; align-items: center;">
                            <span style="font-size: 0.9rem; opacity: 0.8;">Page <span id="current-page-num">1</span></span>
                            <button id="save-bookmark-btn" style="background: var(--gold-energy); color: black; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
                                <i class="fas fa-bookmark"></i> Save Progress
                            </button>
                            <span id="pdf-sync-status" style="color: #10b981; font-size: 0.8rem; opacity: 0; transition: opacity 0.3s;">✓ Saved</span>
                        </div>
                    </div>
                    <div id="pdf-main-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ffd700; text-align: center; z-index: 10;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>Loading Secure Content...</p>
                    </div>
                    <div id="pdf-viewer-container" style="position: relative; background: #1a1a1a; overflow-y: auto; flex: 1; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <!-- PDF pages will be rendered here as canvases -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', viewerHTML);

        const modal = document.getElementById('pdf-viewer-modal');

        // Close Handler
        const cleanup = () => {
            if (modal) modal.remove();
            deactivateSecurityShield();
        };

        document.getElementById('close-pdf-viewer').onclick = cleanup;
        modal.onclick = (e) => { if (e.target === modal) cleanup(); };

        // Manual Bookmark Save
        const bookmarkBtn = document.getElementById('save-bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.onclick = () => {
                const currentPageNum = document.getElementById('current-page-num');
                if (currentPageNum) {
                    const page = parseInt(currentPageNum.textContent) || 1;
                    window.saveEbookProgress(title, page);
                }
            };
        }

        activateSecurityShield();

        // INTERNAL FALLBACK FUNCTION - Now using PDF.js instead of iframe
        const fallbackToIframe = (pdfUrl) => {
            // Don't use iframe anymore - use PDF.js for security
            if (window.pdfjsLib) {
                startPdfRendering(pdfUrl, title, startPage);
            } else {
                const container = document.getElementById('pdf-viewer-container');
                container.innerHTML = `
                    <div style="color: #ef4444; text-align: center; padding: 50px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h3>PDF Library Not Loaded</h3>
                        <p>Please refresh the page to load the secure viewer.</p>
                    </div>
                `;
            }
        };

        // ALWAYS use PDF.js for security (no iframe)
        console.log('🔍 PDF Viewer Debug:');
        console.log('  - PDF.js Library loaded:', !!window.pdfjsLib);
        console.log('  - PDF URL:', url);
        console.log('  - Start Page:', startPage);

        if (window.pdfjsLib) {
            console.log('✅ Starting PDF.js rendering...');
            startPdfRendering(url, title, startPage);
        } else {
            console.error('❌ PDF.js library NOT loaded!');
            // Fallback if PDF.js didn't load
            const container = document.getElementById('pdf-viewer-container');
            container.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 50px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>PDF Library Not Loaded</h3>
                    <p>Please refresh the page (Ctrl+R) and try again.</p>
                    <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 20px;">If issue persists, check browser console (F12) for errors.</p>
                </div>
            `;
            // Retry after delay
            setTimeout(() => {
                if (window.pdfjsLib) {
                    console.log('✅ PDF.js loaded after retry');
                    startPdfRendering(url, title, startPage);
                } else {
                    console.error('❌ PDF.js still not loaded after retry');
                }
            }, 1000);
        }
    }

    function startPdfRendering(url, title, startPage) {
        console.log('📄 startPdfRendering called with:', { url, title, startPage });

        const pdflib = window.pdfjsLib;
        if (!pdflib) {
            console.error('❌ PDF.js library not available in startPdfRendering');
            return;
        }

        pdflib.GlobalWorkerOptions.workerSrc = 'js/pdfjs/pdf.worker.min.js';
        console.log('✅ PDF.js worker configured');

        const container = document.getElementById('pdf-viewer-container');
        const loader = document.getElementById('pdf-main-loader');
        const pageNumDisplay = document.getElementById('current-page-num');
        const syncStatus = document.getElementById('pdf-sync-status');

        console.log('📦 Loading PDF from:', url);
        const loadingTask = pdflib.getDocument(url);

        loadingTask.promise.then(pdf => {
            console.log('✅ PDF loaded successfully! Pages:', pdf.numPages);
            if (loader) loader.style.display = 'none';
            const numPages = pdf.numPages;
            let pageHeights = new Array(numPages).fill(0);
            let cumulativeHeights = [0];
            let pagesLoaded = 0;

            // 1. Pre-create canvases to preserve order
            for (let i = 1; i <= numPages; i++) {
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                canvas.id = `pdf-page-${i}`;
                canvas.style.marginBottom = '20px';
                container.appendChild(canvas);

                pdf.getPage(i).then(page => {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    page.render(renderContext).promise.then(() => {
                        console.log(`✅ Page ${i} rendered`);
                        pageHeights[i - 1] = canvas.offsetHeight + 20;
                        pagesLoaded++;

                        // Only proceed with height-dependent logic when ALL pages are ready
                        if (pagesLoaded === numPages) {
                            console.log('✅ All pages rendered. Calculating offsets...');
                            cumulativeHeights = [0];
                            for (let j = 0; j < numPages; j++) {
                                cumulativeHeights[j + 1] = cumulativeHeights[j] + pageHeights[j];
                            }

                            // Initial scroll to startPage
                            if (startPage > 1 && startPage <= numPages) {
                                container.scrollTop = cumulativeHeights[startPage - 1];
                            }
                            console.log('✅ PDF Viewer fully initialized.');
                        }
                    }).catch(err => console.error(`❌ Render Error Pg ${i}:`, err));
                }).catch(err => console.error(`❌ Load Error Pg ${i}:`, err));
            }

            // 2. Real-time Auto-page detection logic
            let saveTimeout;
            container.addEventListener('scroll', () => {
                const scrollTop = container.scrollTop;
                const canvases = container.querySelectorAll('.pdf-page-canvas');
                let detectedPage = 1;

                // Identify page based on scroll position
                canvases.forEach((cv, idx) => {
                    // offsetTop is relative to container since container has padding/scroll
                    if (scrollTop >= (cv.offsetTop - container.offsetTop - 200)) {
                        detectedPage = idx + 1;
                    }
                });

                if (detectedPage !== parseInt(pageNumDisplay.textContent)) {
                    if (pageNumDisplay) pageNumDisplay.textContent = detectedPage;
                }

                // Debounced Auto-Save
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    console.log(`⏱ Debounced save triggered for Pg ${detectedPage}`);
                    if (syncStatus) syncStatus.classList.add('active');
                    window.saveEbookProgress(title, detectedPage);
                    setTimeout(() => {
                        if (syncStatus) syncStatus.classList.remove('active');
                    }, 1500);
                }, 1500);
            });

        }).catch(err => {
            console.error('❌ PDF Load Error:', err);
            console.error('   Error name:', err.name);
            console.error('   Error message:', err.message);
            console.error('   Attempted URL:', url);

            if (loader) {
                loader.innerHTML = `
                    <div style="color:#ef4444; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h3>Error Loading PDF</h3>
                        <p>${err.message}</p>
                        <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 20px;">
                            Path: ${url}
                        </p>
                        <button onclick="location.reload()" style="margin-top: 20px; background: var(--gold-energy); color: black; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Refresh Page
                        </button>
                    </div>
                `;
            }
        });
    }

    // Toggle User Profile View (Redirect to Dashboard)
    function toggleUserProfile(show) {
        if (show) {
            window.location.href = 'profile.html';
        }
    }

    function loadRazorpayScript() {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    // Event Listeners
    async function checkoutOrder(itemsOverride = null) {
        const user = JSON.parse(localStorage.getItem('efv_user'));
        if (!user) {
            alert('Please login to proceed to checkout');
            openAuthModal('login');
            return;
        }

        if (itemsOverride) {
            // "Buy Now" path: Use only the specific item
            localStorage.setItem('directCheckout', JSON.stringify(itemsOverride));
        } else {
            // "Cart" path: Ensure we use the current cart
            localStorage.removeItem('directCheckout');
        }

        // Redirect to professional checkout flow
        window.location.href = 'checkout.html';
    }

    // Helper to simulate token check or basic validation
    function applySecurityToken(email) {
        return email ? btoa(email) : null;
    }

    // Update Event Listener
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('efv_user'));
            if (user) {
                showTermsAndConditions(() => {
                    checkoutOrder();
                });
            } else {
                openAuthModal('signup');
            }
        });
    }
    if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
    // --- Premium Auth Helpers ---
    window.showToast = function (message) {
        const toast = document.getElementById('auth-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 3000);
    };

    window.openAuthModal = function (tab = 'login') {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;
        modal.classList.add('active');
        switchTab(tab);
    };

    window.closeAuth = function () {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('active');
    };

    function switchTab(tab) {
        // Update tabs
        document.querySelectorAll('.auth-tab-item').forEach(t => {
            t.classList.toggle('active', t.dataset.authTab === tab);
        });

        // Update forms
        document.querySelectorAll('.auth-premium-form').forEach(f => {
            f.classList.remove('active');
            f.style.display = 'none';
        });

        const activeForm = document.getElementById(`${tab}-form`);
        if (activeForm) {
            activeForm.classList.add('active');
            activeForm.style.display = 'flex';
        }
    }

    // Modal Events
    if (closeAuthModal) closeAuthModal.onclick = closeAuth;

    document.querySelectorAll('.auth-tab-item').forEach(tab => {
        tab.onclick = () => switchTab(tab.dataset.authTab);
    });

    // Password Toggle
    document.querySelectorAll('.password-toggle').forEach(eye => {
        eye.onclick = () => {
            const input = eye.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                eye.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                eye.classList.replace('fa-eye-slash', 'fa-eye');
            }
        };
    });

    // Strength Checker
    const signupPass = document.getElementById('signup-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthContainer = document.querySelector('.strength-indicator');

    if (signupPass) {
        signupPass.oninput = () => {
            const val = signupPass.value;
            if (!val) {
                strengthContainer.style.display = 'none';
                return;
            }
            strengthContainer.style.display = 'block';

            let strength = 0;
            if (val.length >= 6) strength++;
            if (val.match(/[A-Z]/) && val.match(/[0-9]/)) strength++;
            if (val.match(/[^A-Za-z0-9]/)) strength++;

            strengthBar.className = 'strength-bar';
            if (strength === 1) strengthBar.classList.add('weak');
            else if (strength === 2) strengthBar.classList.add('medium');
            else if (strength === 3) strengthBar.classList.add('strong');
        };
    }

    // Real-time Validation
    function validateEmail(email) {
        return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }

    const signupEmail = document.getElementById('signup-email');
    if (signupEmail) {
        signupEmail.onblur = function () {
            const group = this.closest('.input-group');
            const err = group ? group.querySelector('.error-message') : null;
            if (err) {
                if (!validateEmail(this.value)) err.style.display = 'block';
                else err.style.display = 'none';
            }
        };
    }

    const signupPhone = document.getElementById('signup-phone');
    if (signupPhone) {
        signupPhone.onblur = function () {
            const group = this.closest('.input-group');
            const err = group ? group.querySelector('.error-message') : null;
            if (err) {
                if (this.value && this.value.length !== 10) err.style.display = 'block';
                else err.style.display = 'none';
            }
        };
    }

    const signupConfirm = document.getElementById('signup-confirm-password');
    if (signupConfirm) {
        signupConfirm.oninput = function () {
            const group = this.closest('.input-group');
            const err = group ? group.querySelector('.error-message') : null;
            if (err) {
                if (this.value !== signupPass.value) err.style.display = 'block';
                else err.style.display = 'none';
            }
        };
    }

    // Close on ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAuth();
    });

    // Close on Click Outside
    const authOverlay = document.getElementById('auth-modal');
    if (authOverlay) {
        authOverlay.onclick = (e) => {
            if (e.target === authOverlay) closeAuth();
        };
    }

    // Simulate Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailEl = document.getElementById('login-email');
            const passwordEl = document.getElementById('login-password');
            if (!emailEl || !passwordEl) return;
            const email = emailEl.value.trim().toLowerCase();
            const password = passwordEl.value.trim();
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            // UI Feedback
            const btnText = submitBtn.querySelector('span');
            const loader = submitBtn.querySelector('.loader');
            const genError = document.getElementById('login-general-error');

            if (btnText) btnText.style.display = 'none';
            if (loader) loader.style.display = 'block';
            if (genError) genError.style.display = 'none';
            submitBtn.disabled = true;

            try {
                // Admin Credentials Check (API Auth for real token)
                if (email === 'admin@uwo24.com' && password === 'uwo@1234') {
                    const adminRes = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const adminData = await adminRes.json();

                    if (adminRes.ok) {
                        localStorage.setItem('authToken', adminData.token);
                        localStorage.setItem('efv_user', JSON.stringify({
                            name: adminData.name,
                            email: adminData.email,
                            role: adminData.role,
                            _id: adminData._id
                        }));
                        sessionStorage.setItem('adminLoggedIn', 'true');

                        if (window.updateAdminNavbar) window.updateAdminNavbar();
                        closeAuth();
                        showToast('Welcome back, Admin!');
                        updateCartUI();

                        // Redirect to dashboard instead of opening cart
                        setTimeout(() => {
                            window.location.href = 'profile.html';
                        }, 1000);
                        return;
                    } else {
                        throw new Error(adminData.message || 'Admin login failed');
                    }
                }

                // API Login
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Success
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('efv_user', JSON.stringify({
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    _id: data._id
                }));

                closeAuth();
                showToast('Welcome back!');
                if (typeof updateAuthNavbar === 'function') updateAuthNavbar();
                updateCartUI();

                // Redirect to dashboard instead of opening cart
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);

                // Sync library
                syncLibraryWithBackend().catch(err => console.error('Background sync failed:', err));

            } catch (error) {
                console.error('Login Error:', error);
                const genError = document.getElementById('login-general-error');
                if (genError) {
                    genError.textContent = error.message;
                    genError.style.display = 'block';
                }
            } finally {
                const btnText = submitBtn.querySelector('span');
                const loader = submitBtn.querySelector('.loader');
                if (btnText) btnText.style.display = 'block';
                if (loader) loader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameEl = document.getElementById('signup-name');
            const emailEl = document.getElementById('signup-email');
            const phoneEl = document.getElementById('signup-phone');
            const passwordEl = document.getElementById('signup-password');
            if (!nameEl || !emailEl || !passwordEl) return;
            const name = nameEl.value.trim();
            const email = emailEl.value.trim();
            const phone = phoneEl ? phoneEl.value.trim() : '';
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            // UI Feedback
            const btnText = submitBtn.querySelector('span');
            const loader = submitBtn.querySelector('.loader');
            const genError = document.getElementById('signup-general-error');

            if (btnText) btnText.style.display = 'none';
            if (loader) loader.style.display = 'block';
            if (genError) genError.style.display = 'none';
            submitBtn.disabled = true;

            try {
                // API Signup (Updated to /register with phone)
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameEl.value.trim(),
                        email: emailEl.value.trim(),
                        phone: phoneEl ? phoneEl.value.trim() : '',
                        password: passwordEl.value
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Signup failed');
                }

                // Success
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('efv_user', JSON.stringify({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: 'user'
                }));

                closeAuth();
                showToast('Account created successfully!');
                if (typeof updateAuthNavbar === 'function') updateAuthNavbar();

                // Auto-login flow: Redirect to profile for dashboard access
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);

            } catch (error) {
                console.error('Signup Error:', error);
                const genError = document.getElementById('signup-general-error');
                if (genError) {
                    genError.textContent = error.message;
                    genError.style.display = 'block';
                }
            } finally {
                const btnText = submitBtn.querySelector('span');
                const loader = submitBtn.querySelector('.loader');
                if (btnText) btnText.style.display = 'block';
                if (loader) loader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    // --- FORGOT PASSWORD FLOW LOGIC ---
    const forgotLink = document.querySelector('.forgot-link');
    const authTabs = document.querySelector('.auth-premium-tabs');
    const forgotFlow = document.getElementById('forgot-password-flow');
    const backToLogin = document.getElementById('back-to-login');

    // Forms
    const forgotEmailForm = document.getElementById('forgot-email-form');
    const forgotOtpForm = document.getElementById('forgot-otp-form');
    const forgotResetForm = document.getElementById('forgot-reset-form');
    const forgotSuccessView = document.getElementById('forgot-success-view');

    let resetSession = {
        email: '',
        token: ''
    };

    const showForgotStep = (step) => {
        forgotEmailForm.style.display = 'none';
        forgotOtpForm.style.display = 'none';
        forgotResetForm.style.display = 'none';
        forgotSuccessView.style.display = 'none';

        const dots = [1, 2, 3].map(n => document.getElementById(`fp-dot-${n}`));
        const titles = ['Send Code', 'Verify OTP', 'New Password', 'Done!'];
        const titleEl = document.getElementById('forgot-flow-title');
        const backEl = document.getElementById('back-to-login');

        // Hide back button on success
        if (backEl) backEl.style.display = step === 4 ? 'none' : 'flex';
        if (titleEl) titleEl.textContent = titles[step - 1] || '';

        // Update dots
        dots.forEach((dot, i) => {
            dot?.classList.remove('active', 'done');
            if (i < step - 1) dot?.classList.add('done');
            else if (i === step - 1) dot?.classList.add('active');
        });

        if (step === 1) forgotEmailForm.style.display = 'flex';
        if (step === 2) forgotOtpForm.style.display = 'flex';
        if (step === 3) forgotResetForm.style.display = 'flex';
        if (step === 4) forgotSuccessView.style.display = 'block';
    };

    if (forgotLink) {
        forgotLink.onclick = (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
            authTabs.style.display = 'none';
            forgotFlow.style.display = 'block';
            showForgotStep(1);
        };
    }

    if (backToLogin) {
        backToLogin.onclick = () => {
            if (forgotFlow) forgotFlow.style.display = 'none';
            if (authTabs) authTabs.style.display = 'flex';
            switchTab('login');
        };
    }

    const setLoader = (form, isLoading) => {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        const text = btn.querySelector('span');
        const loader = btn.querySelector('.loader');
        btn.disabled = isLoading;
        if (text) text.style.display = isLoading ? 'none' : 'block';
        if (loader) loader.style.display = isLoading ? 'block' : 'none';
    };

    // Step 1: Send OTP
    if (forgotEmailForm) {
        forgotEmailForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value.trim();
            const errorEl = document.getElementById('forgot-email-error');
            errorEl.style.display = 'none';
            setLoader(forgotEmailForm, true);

            try {
                const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();

                if (res.ok) {
                    resetSession.email = email;
                    showForgotStep(2);
                    showToast('OTP sent to your email');
                } else {
                    errorEl.textContent = data.message;
                    errorEl.style.display = 'block';
                }
            } catch (err) {
                errorEl.textContent = 'Connection error. Try again.';
                errorEl.style.display = 'block';
            } finally {
                setLoader(forgotEmailForm, false);
            }
        };
    }

    // Step 2: Verify OTP
    if (forgotOtpForm) {
        forgotOtpForm.onsubmit = async (e) => {
            e.preventDefault();
            const otp = document.getElementById('forgot-otp').value.trim();
            const errorEl = document.getElementById('forgot-otp-error');
            errorEl.style.display = 'none';
            setLoader(forgotOtpForm, true);

            try {
                const res = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resetSession.email, otp })
                });
                const data = await res.json();

                if (res.ok) {
                    resetSession.token = data.resetToken;
                    showForgotStep(3);
                } else {
                    errorEl.textContent = data.message;
                    errorEl.style.display = 'block';
                }
            } catch (err) {
                errorEl.textContent = 'Verification failed. Try again.';
                errorEl.style.display = 'block';
            } finally {
                setLoader(forgotOtpForm, false);
            }
        };
    }

    // Step 3: Reset Password
    if (forgotResetForm) {
        forgotResetForm.onsubmit = async (e) => {
            e.preventDefault();
            const pass = document.getElementById('forgot-new-password').value;
            const confirm = document.getElementById('forgot-confirm-password').value;
            const errorEl = document.getElementById('forgot-reset-error');
            errorEl.style.display = 'none';

            if (pass.length < 6) {
                errorEl.textContent = 'Password must be at least 6 characters.';
                errorEl.style.display = 'block';
                return;
            }
            if (pass !== confirm) {
                errorEl.textContent = 'Passwords do not match.';
                errorEl.style.display = 'block';
                return;
            }

            setLoader(forgotResetForm, true);
            try {
                const res = await fetch('http://localhost:5000/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resetToken: resetSession.token, newPassword: pass })
                });
                const data = await res.json();

                if (res.ok) {
                    showForgotStep(4);
                } else {
                    errorEl.textContent = data.message;
                    errorEl.style.display = 'block';
                }
            } catch (err) {
                errorEl.textContent = 'Reset failed. Try again.';
                errorEl.style.display = 'block';
            } finally {
                setLoader(forgotResetForm, false);
            }
        };
    }

    const finishBtn = document.getElementById('finish-reset-btn');
    if (finishBtn) {
        finishBtn.onclick = () => {
            if (forgotFlow) forgotFlow.style.display = 'none';
            if (authTabs) authTabs.style.display = 'flex';
            switchTab('login');
        };
    }

    // Resend OTP
    const resendBtn = document.getElementById('resend-otp-btn');
    if (resendBtn) {
        resendBtn.onclick = async (e) => {
            e.preventDefault();
            showToast('Requesting new code...');
            try {
                await fetch('http://localhost:5000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resetSession.email })
                });
                showToast('New code sent');
            } catch (err) { }
        };
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Stop Audio and Remove Shield if active
            if (window.currentAudio) {
                window.currentAudio.pause();
                window.currentAudio = null;
            }
            if (typeof deactivateSecurityShield === 'function') deactivateSecurityShield();

            sessionStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('efv_user');
            localStorage.removeItem('authToken'); // Clear auth token
            localStorage.removeItem('efv_cart'); // Clear cart on logout for demo isolation

            if (window.updateAdminNavbar) window.updateAdminNavbar();

            // Re-initialize cart variable and UI
            cart = [];
            updateCartUI();

            toggleUserProfile(false);

            // Optional: Reload to ensure all states are clean
            // window.location.reload();
        });
    }

    // --- AUTO LOGIN & NAVBAR SYNC ---
    // --- PREMIUM AUTO LOGIN & NAVBAR SYNC ---
    window.updateAuthNavbar = function () {
        const user = JSON.parse(localStorage.getItem('efv_user'));
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        let userMenu = document.getElementById('nav-user-menu');
        let loginBtn = document.getElementById('nav-login-btn');

        if (user) {
            if (loginBtn) loginBtn.remove();
            if (!userMenu) {
                userMenu = document.createElement('div');
                userMenu.id = 'nav-user-menu';
                userMenu.className = 'user-menu-container';
                userMenu.style.marginLeft = '10px';
                userMenu.innerHTML = `
                    <button class="btn btn-outline small" id="user-menu-trigger" style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i> 
                        <span>${user.name.split(' ')[0]}</span> 
                        <i class="fas fa-chevron-down" style="font-size: 0.7rem; opacity: 0.7;"></i>
                    </button>
                    <div class="user-dropdown" id="user-dropdown">
                        <div style="padding: 10px 15px; font-size: 0.75rem; color: var(--gold-energy); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Account</div>
                        <a href="profile.html?tab=dashboard" class="dropdown-item"><i class="fas fa-th-large"></i> Dashboard</a>
                        <a href="profile.html?tab=orders" class="dropdown-item"><i class="fas fa-shopping-bag"></i> My Orders</a>
                        <a href="profile.html?tab=library" class="dropdown-item"><i class="fas fa-book-open"></i> My Library</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item" id="nav-logout-btn" style="color: #ff4d4d;"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                `;
                navActions.appendChild(userMenu);

                // Dropdown Trigger
                const trigger = document.getElementById('user-menu-trigger');
                const dropdown = document.getElementById('user-dropdown');

                trigger.onclick = (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                };

                // Logout logic injection
                const logout = document.getElementById('nav-logout-btn');
                logout.onclick = (e) => {
                    e.preventDefault();
                    logoutUser();
                };
            } else {
                userMenu.querySelector('span').textContent = user.name.split(' ')[0];
            }
        } else {
            if (userMenu) userMenu.remove();
            if (!loginBtn) {
                loginBtn = document.createElement('button');
                loginBtn.id = 'nav-login-btn';
                loginBtn.className = 'btn btn-gold small';
                loginBtn.style.marginLeft = '10px';
                loginBtn.textContent = 'Login';
                loginBtn.onclick = () => openAuthModal('login');
                navActions.appendChild(loginBtn);
            }
        }
    };

    function logoutUser() {
        if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio = null;
        }
        if (typeof deactivateSecurityShield === 'function') deactivateSecurityShield();

        sessionStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('efv_user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('efv_cart');

        if (window.updateAdminNavbar) window.updateAdminNavbar();

        showToast('Logged out successfully');

        // Update UI
        updateAuthNavbar();
        updateCartUI();
        if (typeof toggleUserProfile === 'function') toggleUserProfile(false);

        // Redirect to home if on profile
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }

    // Auto-login on load
    async function checkAutoLogin() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            updateAuthNavbar();
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                localStorage.setItem('efv_user', JSON.stringify(userData));
                updateAuthNavbar();
                // If on profile page, maybe trigger local state update
                if (typeof initializeDashboard === 'function') {
                    initializeDashboard(userData);
                }
            } else {
                // Token invalid
                localStorage.removeItem('authToken');
                // localStorage.removeItem('efv_user'); // Don't clear user immediately to prevent blink? Or do it for security.
                updateAuthNavbar();
            }
        } catch (e) {
            console.error('Auto-login check failed', e);
            updateAuthNavbar();
        }
    }

    checkAutoLogin();
    updateCartUI();

    // Forced Library Sync on load if token exists
    if (localStorage.getItem('authToken')) {
        setTimeout(() => {
            syncLibraryWithBackend().catch(e => console.error('Early sync failed:', e));
        }, 100);
    }
});

function showResumeOption(title, progressLabel, onResume, onRestart) {
    // Remove existing
    const existing = document.getElementById('resume-modal');
    if (existing) existing.remove();

    const isAudio = progressLabel.includes(':');
    const icon = isAudio ? 'fa-headphones' : 'fa-bookmark';
    const subTitle = isAudio ? 'Continue Listening?' : 'Resume Reading?';
    const labelPrefix = isAudio ? 'You left off at' : 'You left at';
    const labelSuffix = isAudio ? 'in the audio' : `Page ${progressLabel}`;

    const html = `
    <div id="resume-modal" class="modal-overlay active" style="z-index: 30000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.4s ease-out;">
        <div class="modal-card" style="max-width: 400px; width: 90%; text-align: center; border: 1px solid var(--gold-energy); box-shadow: 0 0 30px rgba(255, 211, 105, 0.2); background: #111; padding: 30px; border-radius: 12px; position: relative;">
            <div style="font-size: 3rem; color: var(--gold-energy); margin-bottom: 20px;">
                <i class="fas ${icon}"></i>
            </div>
            <h3 style="margin-bottom: 10px; color: white; font-family: 'Cinzel', serif;">${subTitle}</h3>
            <p style="opacity: 0.8; margin-bottom: 25px; color: #ccc;">${labelPrefix} <strong>${title}</strong> at <span class="gold-text">${isAudio ? progressLabel : labelSuffix}</span>.</p>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button id="resume-btn" style="flex: 1; min-width: 140px; padding: 12px; background: var(--gold-energy); color: black; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: 'Cinzel', serif;">
                    <i class="fas fa-play"></i> CONTINUE
                </button>
                <button id="restart-btn" style="flex: 1; min-width: 140px; padding: 12px; background: transparent; color: var(--gold-energy); border: 1px solid var(--gold-energy); border-radius: 6px; font-weight: bold; cursor: pointer; font-family: 'Cinzel', serif;">
                    <i class="fas fa-redo"></i> START OVER
                </button>
            </div>
            <div style="margin-top: 20px;">
                 <button id="resume-cancel" style="background: none; border: none; color: #666; cursor: pointer; text-decoration: underline; font-size: 0.9rem;">Cancel</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const modal = document.getElementById('resume-modal');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const cancelBtn = document.getElementById('resume-cancel');

    const close = () => modal.remove();

    resumeBtn.onclick = () => { close(); onResume(); };
    restartBtn.onclick = () => { close(); onRestart(); };
    cancelBtn.onclick = close;
}

// Global beforeunload to save playing audio progress
window.addEventListener('beforeunload', () => {
    if (window.currentAudio && window.currentPlayingName) {
        window.saveAudioProgress(window.currentPlayingName, window.currentAudio.currentTime, window.currentAudio.duration);
    }
});

