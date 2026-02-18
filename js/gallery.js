/**
 * EFV Gallery JS - Lightbox Viewer
 */

document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-content');
    const closeBtn = document.querySelector('.close-lightbox');

    // Add blurred background to each item
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            const bgDiv = document.createElement('div');
            bgDiv.className = 'gallery-item-bg';
            bgDiv.style.backgroundImage = `url('${img.src}')`;
            item.prepend(bgDiv);
        }
    });

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-src');
            const type = item.getAttribute('data-type');

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (type === 'video') {
                lightbox.innerHTML = `
                    <div class="close-lightbox">&times;</div>
                    <video src="${src}" controls autoplay style="max-width: 90%; max-height: 80%; box-shadow: 0 0 50px rgba(255, 211, 105, 0.2); border: 1px solid var(--gold-energy);"></video>
                `;
            } else {
                lightbox.innerHTML = `
                    <div class="close-lightbox">&times;</div>
                    <img id="lightbox-content" src="${src}" style="max-width: 90%; max-height: 80%; box-shadow: 0 0 50px rgba(255, 211, 105, 0.2); border: 1px solid var(--gold-energy);">
                `;
            }

            // Re-bind close button after innerHTML change
            lightbox.querySelector('.close-lightbox').addEventListener('click', closeLightbox);
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        lightbox.innerHTML = ''; // Clear everything
    };

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
