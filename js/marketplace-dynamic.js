/**
 * EFV Marketplace - Dynamic Loading System v4.0
 * Renders all products from static data immediately.
 * Merges digital product filePaths from backend (admin-configured).
 */

// ─── Static Product Catalog ─────────────────────────────────────────────────
const STATIC_PRODUCTS = [

    // ══════════════════════════════════════════════════════════════
    //  VOLUME 1 — ORIGIN CODE™  (Hindi Edition)
    // ══════════════════════════════════════════════════════════════
    {
        _id: 'efv_v1_hardcover',
        title: 'EFV™ VOL 1: ORIGIN CODE™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 599,
        thumbnail: 'img/vol1-cover.png',
        category: 'Physical',
        description: 'Learn the secrets of Energy and Alignment. Premium hardcover book.',
        language: 'Hindi',
        volume: '1'
    },
    {
        _id: 'efv_v1_paperback',
        title: 'EFV™ VOL 1: ORIGIN CODE™',
        subtitle: 'Paperback Edition',
        type: 'PAPERBACK',
        price: 399,
        thumbnail: 'img/vol1-cover.png',
        category: 'Physical',
        description: 'Learn the secrets of Energy and Alignment. Easy-to-carry paperback book.',
        language: 'Hindi',
        volume: '1'
    },
    {
        _id: 'efv_v1_audiobook',
        title: 'EFV™ VOL 1: ORIGIN CODE™',
        subtitle: 'Audiobook Edition',
        type: 'AUDIOBOOK',
        price: 199,
        thumbnail: 'img/vol1-cover.png',
        category: 'Digital',
        description: 'Listen and learn on the go. High-quality audio version.',
        language: 'Hindi',
        volume: '1'
    },
    {
        _id: 'efv_v1_ebook',
        title: 'EFV™ VOL 1: ORIGIN CODE™',
        subtitle: 'E-Book Edition',
        type: 'EBOOK',
        price: 149,
        thumbnail: 'img/vol1-cover.png',
        category: 'Digital',
        description: 'Read anytime, anywhere on your digital devices.',
        language: 'Hindi',
        volume: '1'
    },

    // ══════════════════════════════════════════════════════════════
    //  VOLUME 1 — ORIGIN CODE™  (English Edition)
    // ══════════════════════════════════════════════════════════════
    {
        _id: 'efv_v1_hardcover_en',
        title: 'EFV™ VOL 1: THE ORIGIN CODE™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 499,
        thumbnail: 'img/vol1-cover.png',
        category: 'Physical',
        description: 'Learn the secrets of Energy and Alignment. Premium hardcover book.',
        language: 'English',
        volume: '1'
    },
    {
        _id: 'efv_v1_paperback_en',
        title: 'EFV™ VOL 1: THE ORIGIN CODE™',
        subtitle: 'Paperback Edition',
        type: 'PAPERBACK',
        price: 298,
        thumbnail: 'img/vol1-cover.png',
        category: 'Physical',
        description: 'Learn the secrets of Energy and Alignment. Easy-to-carry paperback book.',
        language: 'English',
        volume: '1'
    },
    {
        _id: 'efv_v1_audiobook_en',
        title: 'EFV™ VOL 1: THE ORIGIN CODE™',
        subtitle: 'Audiobook Edition',
        type: 'AUDIOBOOK',
        price: 199,
        thumbnail: 'img/vol1-cover.png',
        category: 'Digital',
        description: 'Listen and learn on the go. High-quality audio version.',
        language: 'English',
        volume: '1'
    },
    {
        _id: 'efv_v1_ebook_en',
        title: 'EFV™ VOL 1: THE ORIGIN CODE™',
        subtitle: 'E-Book Edition',
        type: 'EBOOK',
        price: 149,
        thumbnail: 'img/vol1-cover.png',
        category: 'Digital',
        description: 'Read anytime, anywhere on your digital devices.',
        language: 'English',
        volume: '1'
    },

    // ══════════════════════════════════════════════════════════════
    //  VOLUME 2 — MINDOS™  (Hindi Edition)
    // ══════════════════════════════════════════════════════════════
    {
        _id: 'efv_v2_hardcover',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 649,
        thumbnail: 'img/vol 2.png',
        category: 'Physical',
        description: 'An exploration of how thoughts and emotions shape our inner world.',
        language: 'Hindi',
        volume: '2'
    },
    {
        _id: 'efv_v2_paperback',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'Paperback Edition',
        type: 'PAPERBACK',
        price: 449,
        thumbnail: 'img/vol 2.png',
        category: 'Physical',
        description: 'Decoding Thought, Emotion & The Architecture Of The Human Mind.',
        language: 'Hindi',
        volume: '2'
    },
    {
        _id: 'efv_v2_audiobook',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'Audiobook Edition',
        type: 'AUDIOBOOK',
        price: 249,
        thumbnail: 'img/vol 2.png',
        category: 'Digital',
        description: 'The audiobook version of Volume 2. Decode the mind while on the go.',
        language: 'Hindi',
        volume: '2'
    },
    {
        _id: 'efv_v2_ebook',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'E-Book Edition',
        type: 'EBOOK',
        price: 199,
        thumbnail: 'img/vol 2.png',
        category: 'Digital',
        description: 'The complete digital version of Volume 2. Accessible on all devices.',
        language: 'Hindi',
        volume: '2'
    },

    // ══════════════════════════════════════════════════════════════
    //  VOLUME 2 — MINDOS™  (English Edition)
    // ══════════════════════════════════════════════════════════════
    {
        _id: 'efv_v2_hardcover_en',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 699,
        thumbnail: 'img/vol 2.png',
        category: 'Physical',
        description: 'The English hardcover edition of Volume 2. Explore the architecture of the human mind.',
        language: 'English',
        volume: '2'
    },
    {
        _id: 'efv_v2_paperback_en',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'Paperback Edition',
        type: 'PAPERBACK',
        price: 499,
        thumbnail: 'img/vol 2.png',
        category: 'Physical',
        description: 'The English paperback edition. Decoding Thought, Emotion & The Architecture Of The Human Mind.',
        language: 'English',
        volume: '2'
    },
    {
        _id: 'efv_v2_audiobook_en',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'Audiobook Edition',
        type: 'AUDIOBOOK',
        price: 299,
        thumbnail: 'img/vol 2.png',
        category: 'Digital',
        description: 'The English audio experience of Volume 2. Decode the architecture of the human mind on the go.',
        language: 'English',
        volume: '2'
    },
    {
        _id: 'efv_v2_ebook_en',
        title: 'EFV™ VOL 2: MINDOS™',
        subtitle: 'E-Book Edition',
        type: 'EBOOK',
        price: 249,
        thumbnail: 'img/vol 2.png',
        category: 'Digital',
        description: 'The complete English digital version of Volume 2. Accessible on all your devices.',
        language: 'English',
        volume: '2'
    },

    // ══════════════════════════════════════════════════════════════
    //  VOLUMES 3–9 (Physical Hardcover)
    // ══════════════════════════════════════════════════════════════
    {
        _id: 'efv_canon_v3_hard',
        title: 'EFV™ VOL 3: UNIVERSAL ACTIVATION',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 699,
        thumbnail: 'img/vol 3.png',
        category: 'Physical',
        description: 'A guide to awakening the untapped potential within you.',
        language: 'Hindi',
        volume: '3'
    },
    {
        _id: 'efv_canon_v4_hard',
        title: 'EFV™ VOL 4: RESONANCE BRIDGE',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 699,
        thumbnail: 'img/vol 4.png',
        category: 'Physical',
        description: 'Bridges the gap between human awareness and universal intelligence.',
        language: 'Hindi',
        volume: '4'
    },
    {
        _id: 'efv_canon_v5_hard',
        title: 'EFV™ VOL 5: HUMAN OS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 749,
        thumbnail: 'img/vol 5.png',
        category: 'Physical',
        description: 'A fresh look at the human operating system.',
        language: 'Hindi',
        volume: '5'
    },
    {
        _id: 'efv_canon_v6_hard',
        title: 'EFV™ VOL 6: EMOTIONOS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 749,
        thumbnail: 'img/vol 6.png',
        category: 'Physical',
        description: 'Explains emotional intelligence as a powerful stabilizing force.',
        language: 'Hindi',
        volume: '6'
    },
    {
        _id: 'efv_canon_v7_hard',
        title: 'EFV™ VOL 7: MEMORYOS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 799,
        thumbnail: 'img/vol 7.jpeg',
        category: 'Physical',
        description: 'Explores memory as the thread that holds identity together.',
        language: 'Hindi',
        volume: '7'
    },
    {
        _id: 'efv_canon_v8_hard',
        title: 'EFV™ VOL 8: AGENTOS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 849,
        thumbnail: 'img/vol 8.png',
        category: 'Physical',
        description: 'Unpacks the rise of autonomous intelligence and intelligent agents.',
        language: 'Hindi',
        volume: '8'
    },
    {
        _id: 'efv_canon_v9_hard',
        title: 'EFV™ VOL 9: GOVERNANCEOS™',
        subtitle: 'Hardcover Edition',
        type: 'HARDCOVER',
        price: 899,
        thumbnail: 'img/vol 9.png',
        category: 'Physical',
        description: 'Focuses on ethics, alignment, and responsibility in an AI-powered civilization.',
        language: 'Hindi',
        volume: '9'
    }
];

// ─── Main Marketplace Logic ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL)
        ? CONFIG.API_BASE_URL
        : 'http://localhost:5000';

    // Step 1: Render static products IMMEDIATELY — no backend needed
    renderProducts(STATIC_PRODUCTS);

    // Step 2: Silently try to merge backend data (filePaths for digital products)
    mergeBackendData();

    async function mergeBackendData() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${API_BASE}/api/products`, { signal: controller.signal });
            clearTimeout(timeout);

            if (!response.ok) return;
            const backendProducts = await response.json();
            if (!Array.isArray(backendProducts)) return;

            const backendMap = {};
            backendProducts.forEach(p => { backendMap[p._id] = p; });

            // Merge filePaths and admin-uploaded thumbnails into static products
            STATIC_PRODUCTS.forEach(p => {
                const b = backendMap[p._id];
                if (b) {
                    if (b.filePath) p.filePath = b.filePath;
                    if (b.thumbnail && !b.thumbnail.startsWith('img/')) p.thumbnail = b.thumbnail;
                    if (b.price) p.price = b.price;
                }
            });

            // Re-render to show backend-overridden data (like updated prices/titles)
            renderProducts(STATIC_PRODUCTS);
            console.log('✅ Marketplace: Backend data merged and UI updated');
        } catch (err) {
            console.log('ℹ️ Marketplace: Offline mode — showing static catalog');
        }
    }

    function renderProducts(products) {
        // Clean up loading state or any mixed hardcoded content
        if (productGrid.querySelector('.loading-state')) {
            productGrid.innerHTML = '';
        }

        const existingCardIds = new Set(Array.from(productGrid.children).map(c => c.getAttribute('data-id')));

        products.forEach(product => {
            const id = product._id || product.id;
            if (!existingCardIds.has(id)) {
                productGrid.appendChild(createProductCard(product));
            }
        });

        // Initialize scroll animations
        if (typeof revealObserver !== 'undefined') {
            document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        }
        if (typeof updateMarketplaceButtons === 'function') {
            updateMarketplaceButtons();
        }
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card glass-panel reveal magnetic shine-box';
        card.setAttribute('data-id', product._id || product.id);
        card.setAttribute('data-name', product.title);
        card.setAttribute('data-price', product.price);
        card.setAttribute('data-language', product.language || '');
        card.setAttribute('data-subtitle', product.subtitle || '');

        const rawType = (product.type || 'book').toLowerCase();
        const typeLabel = {
            'hardcover': 'Hardcover',
            'paperback': 'Paperback',
            'audiobook': 'Audiobook',
            'ebook': 'E-Book'
        }[rawType] || product.type;

        const typeBadgeColor = {
            'hardcover': 'var(--gold-energy)',
            'paperback': '#4CAF50',
            'audiobook': '#FF6B35',
            'ebook': '#7B68EE'
        }[rawType] || 'var(--gold-energy)';

        const imageUrl = product.thumbnail
            ? (product.thumbnail.startsWith('http') || product.thumbnail.startsWith('img/')
                ? product.thumbnail
                : `${API_BASE}/${product.thumbnail}`)
            : 'img/vol1-cover.png';

        const isDigital = rawType === 'audiobook' || rawType === 'ebook';
        const buttonText = isDigital ? 'Purchase Now' : 'Add to Cart';

        const langBadge = product.language
            ? `<span style="display:inline-block; background: rgba(212,175,55,0.15); border: 1px solid var(--gold-energy); color: var(--gold-energy); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">${product.language.toUpperCase()}</span>`
            : '';

        card.innerHTML = `
            <div class="book-cover"
                style="width: 100%; max-width: 280px; aspect-ratio: 2/3; margin: 0 auto 20px; background: #0b132b; border-radius: 10px; overflow: hidden; border: 1px solid var(--gold-energy); position: relative;">
                <span style="position: absolute; top: 10px; right: 10px; background: ${typeBadgeColor}; color: black; padding: 4px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; z-index: 5; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${typeLabel}</span>
                <img src="${imageUrl}" alt="${product.title}" loading="lazy"
                    style="width: 100%; height: 100%; object-fit: cover;"
                    onerror="this.src='img/vol1-cover.png'">
            </div>
            <div class="product-info" style="text-align: center;">
                ${langBadge}
                <h3 style="font-size: 1.05rem; letter-spacing: 1px; margin-bottom: 5px; line-height: 1.4;">
                    ${product.title}
                </h3>
                <span style="color: var(--gold-energy); font-size: 0.85rem; display: block; margin-bottom: 10px;">${typeLabel} Edition</span>
            </div>
            <div class="rating" style="color: var(--gold-energy); margin: 8px 0; text-align: center;">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <p style="margin-bottom: 16px; font-size: 0.88rem; opacity: 0.8; min-height: 60px; text-align: center; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${product.description || 'Discover the secrets of Energy and Alignment.'}
            </p>
            <span class="price" style="font-size: 1.5rem; display: block; text-align: center; margin-bottom: 16px;">₹${product.price}.00</span>
            <div style="display: flex; gap: 10px; flex-direction: column;">
                <button class="btn btn-gold add-to-cart" style="width: auto; padding: 12px 30px; margin: 0 auto;">${buttonText}</button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                if (typeof window.openProductModal === 'function') {
                    window.openProductModal(product._id || product.id, card);
                }
            }
        });

        return card;
    }
});
