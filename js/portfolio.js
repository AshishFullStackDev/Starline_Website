const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
    initProjectFilters();
    initGalleryLightbox();
    initVideoPlayers();
    initSmoothScroll();
    initLazyLoading();
    initScrollAnimations();
});

function initProjectFilters() {
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const resultsStatus = document.getElementById('filter-results-status');
    const searchInput = document.getElementById('project-search-input');

    if (projectCards.length === 0) {
        return;
    }

    let activeFilter = 'all';
    let searchQuery = '';

    const updateFilter = () => {
        let visibleCount = 0;

        filterButtons.forEach(button => {
            const isActive = (button.dataset.filter || 'all') === activeFilter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        projectCards.forEach(card => {
            const category = card.dataset.category || '';
            const categoryMatch = activeFilter === 'all' || category === activeFilter;
            const textContent = (card.textContent || '').toLowerCase();
            const searchMatch = !searchQuery || textContent.includes(searchQuery);
            const isVisible = categoryMatch && searchMatch;

            if (isVisible) {
                visibleCount += 1;
                card.classList.remove('hidden');
                card.removeAttribute('hidden');
                card.setAttribute('aria-hidden', 'false');
                card.style.display = 'flex';
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                card.style.transform = 'none';
            } else {
                card.classList.add('hidden');
                card.setAttribute('hidden', '');
                card.setAttribute('aria-hidden', 'true');
                card.style.display = 'none';
            }
        });

        if (resultsStatus) {
            let label = 'all locations';
            const currentBtn = filterButtons.find(b => (b.dataset.filter || 'all') === activeFilter);
            if (currentBtn && activeFilter !== 'all') {
                label = currentBtn.textContent.trim();
            }
            const queryLabel = searchQuery ? ` matching "${searchQuery}"` : '';
            resultsStatus.textContent = `Showing ${visibleCount} of ${projectCards.length} projects (${label}${queryLabel}).`;
        }
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter || 'all';
            updateFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchQuery = (e.target.value || '').trim().toLowerCase();
            updateFilter();
        });
    }

    const viewAllBottomBtn = document.getElementById('btn-view-all-projects-bottom');
    if (viewAllBottomBtn) {
        viewAllBottomBtn.addEventListener('click', () => {
            activeFilter = 'all';
            searchQuery = '';
            if (searchInput) {
                searchInput.value = '';
            }
            updateFilter();
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    updateFilter();
}

function initGalleryLightbox() {
    const triggers = Array.from(document.querySelectorAll('.gallery-item, .featured-gallery-grid img'));
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    const lightboxCurrent = document.getElementById('lightbox-current');
    const lightboxTotal = document.getElementById('lightbox-total');

    if (!lightbox || !lightboxContent || !lightboxImage || !lightboxClose || !lightboxPrev || !lightboxNext || triggers.length === 0) {
        return;
    }

    const images = triggers.map((item, index) => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-haspopup', 'dialog');
        item.setAttribute('aria-controls', 'lightbox');
        item.setAttribute('aria-label', `Open gallery image ${index + 1} of ${triggers.length}: ${item.alt}`);

        return {
            src: item.getAttribute('src') || '',
            alt: item.getAttribute('alt') || 'Project gallery image'
        };
    });

    let currentIndex = 0;
    let lastFocusedElement = null;

    if (lightboxTotal) {
        lightboxTotal.textContent = String(images.length);
    }

    const updateLightboxImage = () => {
        const image = images[currentIndex];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        if (lightboxCaption) {
            lightboxCaption.textContent = image.alt;
        }
        if (lightboxCurrent) {
            lightboxCurrent.textContent = String(currentIndex + 1);
        }
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    const openLightbox = index => {
        currentIndex = index;
        lastFocusedElement = document.activeElement;
        updateLightboxImage();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
    };

    const nextImage = () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    };

    const previousImage = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    };

    triggers.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(index);
            }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', previousImage);

    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    lightbox.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeLightbox();
            return;
        }

        if (event.key === 'ArrowRight') {
            nextImage();
            return;
        }

        if (event.key === 'ArrowLeft') {
            previousImage();
            return;
        }

        if (event.key === 'Tab') {
            trapFocus(event, lightbox);
        }
    });
}

function initVideoPlayers() {
    const videoButtons = Array.from(document.querySelectorAll('.video-play-btn[data-video-src]'));
    const modal = document.getElementById('video-modal');
    const modalContent = modal ? modal.querySelector('.video-modal-content') : null;
    const modalClose = modal ? modal.querySelector('.video-modal-close') : null;
    const video = document.getElementById('portfolio-video-player');
    const source = document.getElementById('portfolio-video-source');
    const heading = document.getElementById('video-modal-heading');
    const description = document.getElementById('video-modal-description');
    const link = document.getElementById('video-modal-link');

    if (!modal || !modalContent || !modalClose || !video || !source || !link || videoButtons.length === 0) {
        return;
    }

    let lastFocusedElement = null;

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        video.pause();
        video.removeAttribute('src');
        source.setAttribute('src', '');
        link.setAttribute('href', '#');
        video.load();

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    const openModal = button => {
        const videoSource = encodeURI(button.dataset.videoSrc || '');
        lastFocusedElement = document.activeElement;
        video.setAttribute('src', videoSource);
        source.setAttribute('src', videoSource);
        if (heading) heading.textContent = button.dataset.videoTitle || 'Project video';
        if (description) description.textContent = button.dataset.videoDescription || '';
        link.setAttribute('href', videoSource || '#');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        video.load();
        modalClose.focus();
    };

    videoButtons.forEach(button => {
        button.addEventListener('click', () => openModal(button));
    });

    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modal.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal();
            return;
        }

        if (event.key === 'Tab') {
            trapFocus(event, modal);
        }
    });
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (!href || href === '#') {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });
}

function initLazyLoading() {
    document.querySelectorAll('img[loading="lazy"]').forEach(image => {
        image.decoding = 'async';
        if (!image.hasAttribute('fetchpriority')) {
            image.setAttribute('fetchpriority', 'low');
        }
    });
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.video-card, .expertise-item, .stat-card');

    if (animatedElements.length === 0) {
        return;
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        animatedElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
        return;
    }

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(18px)';
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.style.animation = 'fadeInUp 0.5s ease forwards';
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(element => observer.observe(element));
}

function trapFocus(event, container) {
    const focusableElements = Array.from(container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(element => !element.hasAttribute('disabled'));

    if (focusableElements.length === 0) {
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}
