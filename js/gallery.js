/**
 * STARLINE ADVENTURES - DYNAMIC GALLERY & LIGHTBOX ENGINE
 * Automatically loads all images from /api/gallery-images (or static fallback)
 * Provides interactive categories, instant search, responsive grid, and full-screen lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Gallery State
    let galleryImages = [];
    let currentFilteredImages = [];
    let currentLightboxIndex = 0;
    let isZoomed = false;

    // DOM Elements
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtonsContainer = document.getElementById('gallery-filters');
    const searchInput = document.getElementById('gallery-search-input');
    const statusCountEl = document.getElementById('gallery-status-count');
    const heroCountEl = document.getElementById('hero-gallery-count');

    // Lightbox DOM Elements
    const lightboxModal = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxTitle = document.getElementById('lightbox-caption-title');
    const lightboxBadge = document.getElementById('lightbox-caption-badge');
    const lightboxPrevBtn = document.getElementById('lightbox-prev');
    const lightboxNextBtn = document.getElementById('lightbox-next');
    const lightboxCloseBtn = document.getElementById('lightbox-close');
    const lightboxZoomBtn = document.getElementById('lightbox-zoom');
    const lightboxFullscreenBtn = document.getElementById('lightbox-fullscreen');

    // Categories Configuration (Requirement 7: Keep only All, Activities, Installation)
    const categoryLabels = {
        all: 'All',
        activities: 'Activities',
        installation: 'Installation'
    };

    /**
     * Initial Load: Load authentic verified images from centralized StarlineImageMap or API
     */
    async function initGallery() {
        if (typeof window !== 'undefined' && typeof window.getVerifiedGalleryData === 'function') {
            galleryImages = window.getVerifiedGalleryData();
        } else if (typeof StarlineImageMap !== 'undefined' && typeof StarlineImageMap.getVerifiedGalleryData === 'function') {
            galleryImages = StarlineImageMap.getVerifiedGalleryData();
        }

        try {
            const response = await fetch('/api/gallery-images');
            if (response.ok) {
                const data = await response.json();
                if (data && data.ok && Array.isArray(data.images) && data.images.length > 0) {
                    galleryImages = data.images;
                }
            }
        } catch (e) {
            console.warn('[Gallery] API fetch fallback to centralized gallery data:', e);
        }

        if (galleryImages.length > 0) {
            renderFilterTabs();
            applyFilters();
        } else {
            hydrateFromDom();
        }

        setupLightboxListeners();
        setupSearchListener();
    }

    /**
     * Hydrate data from static DOM in case of offline / static hosting
     */
    function hydrateFromDom() {
        const cards = document.querySelectorAll('.gallery-card');
        galleryImages = Array.from(cards).map((card, index) => {
            const img = card.querySelector('img');
            const titleEl = card.querySelector('.gallery-card-title');
            const badgeEl = card.querySelector('.gallery-card-badge');
            let category = card.getAttribute('data-category') || 'activities';
            if (category !== 'installation' && category !== 'activities') {
                category = 'activities';
            }

            return {
                id: card.id || `img-${index + 1}`,
                filename: img ? img.getAttribute('src').split('/').pop() : `image-${index + 1}`,
                src: img ? img.getAttribute('src') : 'images/logo.jpeg',
                title: titleEl ? titleEl.textContent.trim() : `Project Photo #${index + 1}`,
                category: category,
                categoryLabel: badgeEl ? badgeEl.textContent.trim() : (categoryLabels[category] || 'Activities'),
                alt: img ? img.getAttribute('alt') : 'Starline Adventures Experience'
            };
        });

        renderFilterTabs();
        applyFilters();
    }

    /**
     * Render Dynamic Category Filter Buttons with Item Counts
     */
    function renderFilterTabs() {
        if (!filterButtonsContainer) return;

        // Calculate counts per category
        const counts = { all: galleryImages.length };
        galleryImages.forEach(img => {
            counts[img.category] = (counts[img.category] || 0) + 1;
        });

        // Determine active filter
        const currentActive = filterButtonsContainer.querySelector('.gallery-filter-btn.active');
        const activeFilter = currentActive ? currentActive.getAttribute('data-filter') : 'all';

        // Order of filters (Requirement 7: Keep only All, Activities, Installation)
        const order = ['all', 'activities', 'installation'];

        let html = '';
        order.forEach(catKey => {
            const count = counts[catKey] || 0;
            if (count > 0 || catKey === 'all') {
                const label = categoryLabels[catKey] || catKey;
                const isActive = (catKey === activeFilter) ? 'active' : '';
                const ariaPressed = (catKey === activeFilter) ? 'true' : 'false';
                html += `
                    <button class="gallery-filter-btn ${isActive}" type="button" data-filter="${catKey}" aria-pressed="${ariaPressed}">
                        <span>${label}</span>
                        <span class="btn-count">${count}</span>
                    </button>
                `;
            }
        });

        filterButtonsContainer.innerHTML = html;

        // Attach click events
        filterButtonsContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtonsContainer.querySelectorAll('.gallery-filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                applyFilters();
            });
        });

        // Update stats
        if (heroCountEl) {
            heroCountEl.textContent = `${galleryImages.length}+`;
        }
    }

    /**
     * Search Input Handler (Debounced)
     */
    function setupSearchListener() {
        if (!searchInput) return;
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applyFilters();
            }, 150);
        });
    }

    /**
     * Filter & Search Combiner
     */
    function applyFilters() {
        const activeBtn = filterButtonsContainer ? filterButtonsContainer.querySelector('.gallery-filter-btn.active') : null;
        const selectedCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        currentFilteredImages = galleryImages.filter(item => {
            const matchCategory = (selectedCategory === 'all' || item.category === selectedCategory);
            const matchSearch = !query || 
                item.title.toLowerCase().includes(query) || 
                item.categoryLabel.toLowerCase().includes(query) ||
                item.filename.toLowerCase().includes(query);
            return matchCategory && matchSearch;
        });

        renderGrid(currentFilteredImages);
        updateStatusCount(currentFilteredImages.length, galleryImages.length);
    }

    /**
     * Update Status Bar Count
     */
    function updateStatusCount(visibleCount, totalCount) {
        if (!statusCountEl) return;
        if (visibleCount === totalCount) {
            statusCountEl.innerHTML = `Showing all <strong>${totalCount}</strong> adventure project photos`;
        } else {
            statusCountEl.innerHTML = `Showing <strong>${visibleCount}</strong> of <strong>${totalCount}</strong> project photos`;
        }
    }

    /**
     * Render Gallery Grid Cards
     */
    function renderGrid(images) {
        if (!galleryGrid) return;

        if (images.length === 0) {
            galleryGrid.innerHTML = `
                <div class="gallery-empty-state">
                    <h3>No photos found</h3>
                    <p>No project images match your current filter or search query.</p>
                    <button type="button" class="btn btn-primary" onclick="document.getElementById('gallery-search-input').value=''; document.querySelector('.gallery-filter-btn[data-filter=all]').click();">
                        Show All Photos
                    </button>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        images.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'gallery-card';
            card.setAttribute('data-category', item.category);
            card.setAttribute('data-index', index);
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View ${item.title} in full screen`);

            card.innerHTML = `
                <div class="gallery-card-img-wrap">
                    <span class="gallery-card-badge">${item.categoryLabel}</span>
                    <img 
                        src="${item.src}" 
                        alt="${item.alt}" 
                        loading="lazy" 
                        decoding="async" 
                        width="400" 
                        height="300" 
                        class="gallery-card-img"
                        onerror="this.onerror=null; this.src='images/logo.jpeg';"
                    >
                    <div class="gallery-card-overlay">
                        <div class="gallery-card-zoom-icon">
                            <span aria-hidden="true">&#128269;</span>
                            <span>View Photo</span>
                        </div>
                    </div>
                </div>
                <div class="gallery-card-info">
                    <h3 class="gallery-card-title">${item.title}</h3>
                    <div class="gallery-card-meta">
                        <span>Starline Adventures</span>
                        <span class="gallery-card-view-link">Fullscreen &rarr;</span>
                    </div>
                </div>
            `;

            // Open Lightbox on Click or Enter Key
            card.addEventListener('click', () => {
                openLightbox(index);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });

            fragment.appendChild(card);
        });

        galleryGrid.innerHTML = '';
        galleryGrid.appendChild(fragment);
    }

    /**
     * Lightbox Modal Functions
     */
    function openLightbox(index) {
        if (!lightboxModal || currentFilteredImages.length === 0) return;
        currentLightboxIndex = index;
        isZoomed = false;
        if (lightboxImg) {
            lightboxImg.style.transform = 'scale(1)';
        }
        updateLightboxContent();
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        if (lightboxCloseBtn) lightboxCloseBtn.focus();
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        isZoomed = false;
        if (lightboxImg) {
            lightboxImg.style.transform = 'scale(1)';
        }
    }

    function showPrevImage() {
        if (currentFilteredImages.length <= 1) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + currentFilteredImages.length) % currentFilteredImages.length;
        updateLightboxContent();
    }

    function showNextImage() {
        if (currentFilteredImages.length <= 1) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % currentFilteredImages.length;
        updateLightboxContent();
    }

    function updateLightboxContent() {
        const item = currentFilteredImages[currentLightboxIndex];
        if (!item) return;

        if (lightboxImg) {
            lightboxImg.style.opacity = '0.3';
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
            };
        }

        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentFilteredImages.length}`;
        }

        if (lightboxTitle) {
            lightboxTitle.textContent = item.title;
        }

        if (lightboxBadge) {
            lightboxBadge.textContent = item.categoryLabel;
        }

        isZoomed = false;
        if (lightboxImg) {
            lightboxImg.style.transform = 'scale(1)';
            lightboxImg.style.cursor = 'zoom-in';
        }
    }

    function toggleZoom() {
        if (!lightboxImg) return;
        isZoomed = !isZoomed;
        if (isZoomed) {
            lightboxImg.style.transform = 'scale(1.6)';
            lightboxImg.style.cursor = 'zoom-out';
        } else {
            lightboxImg.style.transform = 'scale(1)';
            lightboxImg.style.cursor = 'zoom-in';
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (lightboxModal.requestFullscreen) {
                lightboxModal.requestFullscreen();
            } else if (lightboxModal.webkitRequestFullscreen) {
                lightboxModal.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    /**
     * Attach Event Listeners to Lightbox Controls
     */
    function setupLightboxListeners() {
        if (!lightboxModal) return;

        if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
        if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrevImage);
        if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNextImage);
        if (lightboxZoomBtn) lightboxZoomBtn.addEventListener('click', toggleZoom);
        if (lightboxFullscreenBtn) lightboxFullscreenBtn.addEventListener('click', toggleFullscreen);

        if (lightboxImg) {
            lightboxImg.addEventListener('click', toggleZoom);
        }

        // Close on clicking backdrop
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-body') || e.target.classList.contains('lightbox-img-wrapper')) {
                closeLightbox();
            }
        });

        // Global Keyboard Controls
        document.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            } else if (e.key === '+' || e.key === '=') {
                if (!isZoomed) toggleZoom();
            } else if (e.key === '-') {
                if (isZoomed) toggleZoom();
            }
        });

        // Touch Swipe Gestures for Mobile
        let touchStartX = 0;
        let touchEndX = 0;

        lightboxModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightboxModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    showPrevImage(); // Swiped right -> previous image
                } else {
                    showNextImage(); // Swiped left -> next image
                }
            }
        }
    }

    // Initialize gallery
    initGallery();
});
