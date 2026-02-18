/**
 * EFV Main JS - Global UI Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');

    // Optimized Scroll Reveal using IntersectionObserver
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Optimized Navbar Scroll Effect
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Mobile Menu Toggle Logic
    const initMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        const container = document.querySelector('nav .container');
        let hamburger = document.querySelector('.hamburger');

        if (!hamburger && container) {
            hamburger = document.createElement('button');
            hamburger.className = 'hamburger';
            hamburger.setAttribute('aria-label', 'Toggle Menu');
            hamburger.innerHTML = '<span></span><span></span><span></span>';
            container.appendChild(hamburger);
        }

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            });

            // Auto-close when clicking outside
            document.addEventListener('click', (e) => {
                const isClickInside = navLinks.contains(e.target) || hamburger.contains(e.target);
                if (!isClickInside && navLinks.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            // Close menu if window is resized to desktop width
            window.addEventListener('resize', () => {
                if (window.innerWidth > 992 && navLinks.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    };

    initMobileMenu();

    // Custom Cursor Trail (Disabled on mobile for performance)
    if (!window.matchMedia("(max-width: 768px)").matches) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-trail';
        document.body.appendChild(cursor);

        Object.assign(cursor.style, {
            position: 'fixed',
            width: '20px',
            height: '20px',
            background: 'radial-gradient(circle, rgba(255, 211, 105, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '9999',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.05s linear'
        });

        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Book Carousel Functionality
    const track = document.getElementById('books-track');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    if (track && prevBtn && nextBtn) {
        let currentIndex = 0;

        const updateCarousel = () => {
            const cardWidth = track.querySelector('.glass-panel').offsetWidth;
            const gap = 30; // Matches CSS gap
            const scrollAmount = (cardWidth + gap) * currentIndex;

            track.style.transform = `translateX(-${scrollAmount}px)`;

            // Update button states
            prevBtn.classList.toggle('disabled', currentIndex === 0);

            // Estimate max index (total cards - visible cards)
            const visibleCards = window.innerWidth > 1024 ? 3 : (window.innerWidth > 768 ? 2 : 1);
            const totalCards = track.querySelectorAll('.glass-panel').length;
            nextBtn.classList.toggle('disabled', currentIndex >= totalCards - visibleCards);
        };

        nextBtn.addEventListener('click', () => {
            const visibleCards = window.innerWidth > 1024 ? 3 : (window.innerWidth > 768 ? 2 : 1);
            const totalCards = track.querySelectorAll('.glass-panel').length;
            if (currentIndex < totalCards - visibleCards) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        // Handle resize
        window.addEventListener('resize', updateCarousel);
    }

    // Global Modal System
    const initModal = () => {
        const modalHtml = `
            <div class="modal-overlay" id="privacy-modal">
                <div class="modal-card">
                    <button class="modal-close" aria-label="Close Modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2 style="text-align: center; margin-bottom: 25px; font-family: 'Montserrat', sans-serif; font-weight: 800; color: var(--gold-energy); border-bottom: 1px solid var(--glass-border); padding-bottom: 15px;">
                        PRIVACY POLICY
                    </h2>
                    <div class="modal-body" style="font-family: 'Inter', sans-serif; color: rgba(240, 244, 248, 0.9);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <p style="font-weight: 700; color: var(--gold-light); font-size: 1.1rem;">Protecting your frequency and your digital footprint.</p>
                            <p style="font-size: 0.9rem; opacity: 0.6;">Effective Date: February 2026</p>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1rem; color: var(--gold-energy); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">1. Information EFV™ Collects</h3>
                            <p style="margin-bottom: 10px; font-size: 0.95rem;">We prioritize minimal data collection. We only store the basic information you explicitly provide:
                                <ul style="list-style: disc; margin-left: 20px; margin-top: 8px; font-size: 0.95rem; opacity: 0.85;">
                                    <li>Name / Identifier</li>
                                    <li>Email address for ecosystem synchronization</li>
                                    <li>Alignment Intelligence preferences within the UWO™ framework</li>
                                </ul>
                            </p>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1rem; color: var(--gold-energy); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">2. How We Utilize Your Data</h3>
                            <p style="margin-bottom: 10px; font-size: 0.95rem;">Your data is used exclusively to:
                                <ul style="list-style: disc; margin-left: 20px; margin-top: 8px; font-size: 0.95rem; opacity: 0.85;">
                                    <li>Personalize your frequency calibration experience.</li>
                                    <li>Synchronize your progress across the EFV™ ecosystem.</li>
                                    <li>Provide essential updates regarding UWO™ and Alignment Intelligence.</li>
                                </ul>
                            </p>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1rem; color: var(--gold-energy); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">3. Security & Sovereignty</h3>
                            <p style="margin-bottom: 10px; font-size: 0.95rem;">We believe in data sovereignty. All information is encrypted using high-level security standards. EFV™ maintains a **Zero-Sharing Policy**—we never sell or provide your data to third-party entities.</p>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1rem; color: var(--gold-energy); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">4. Your Rights</h3>
                            <p style="margin-bottom: 10px; font-size: 0.95rem;">You maintain full control over your digital history. You may request to view, export, or permanently delete your data at any time through our official support channels.</p>
                        </div>

                        <div style="padding-top: 20px; border-top: 1px solid var(--glass-border); text-align: center; opacity: 0.6; font-size: 0.85rem;">
                            Contact: support@uwo.ai<br>
                            UWO Framework & EFV Ecosystem — Alignment Intelligence
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('privacy-modal');
        const closeBtn = modal.querySelector('.modal-close');

        const openModal = (e) => {
            if (e) e.preventDefault();
            document.body.classList.add('modal-open');
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        };

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            setTimeout(() => modal.style.display = 'none', 400);
        };

        // Attach to all Privacy Policy links
        document.querySelectorAll('a[href*="privacy-policy.html"]').forEach(link => {
            link.addEventListener('click', openModal);
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    };

    initModal();

    // Admin Navbar Visibility Logic - REMOVED as admin is now integrated in profile
    window.updateAdminNavbar = () => {
        document.querySelectorAll('a[href="admin.html"]').forEach(link => {
            link.parentElement.style.display = 'none';
        });
    };

    // Initial check on load
    window.updateAdminNavbar();

    // Home Page Volume Buttons Active State
    const bookButtons = document.querySelectorAll('.btn-outline');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all others in the track if desired, 
            // but usually we just want feedback on the clicked one.
            bookButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // If it's a link, we don't preventDefault so it still navigates, 
            // but the user sees the golden flash/transition.
        });
    });
});
