// ==========================================
// Initial Website Loading Screen Handler
// ==========================================
(function initStarlineInitialLoader() {
    const loader = document.getElementById('initial-loader');

    // On any page load, mark session visited so internal navigation never repeats the loader
    try {
        if (!loader) {
            sessionStorage.setItem('starline_session_visited', 'true');
            return;
        }

        if (sessionStorage.getItem('starline_session_visited')) {
            loader.style.display = 'none';
            document.documentElement.classList.add('starline-no-loader');
            document.documentElement.classList.remove('starline-show-loader');
            document.body.classList.remove('starline-loader-active');
            return;
        }
    } catch (e) {
        // Fallback for restricted storage modes
    }

    if (!loader) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 200 : 450;
    const exitDuration = prefersReducedMotion ? 150 : 250;

    document.body.classList.add('starline-loader-active');

    function dismissLoader() {
        if (loader.dataset.dismissed) return;
        loader.dataset.dismissed = 'true';

        // Trigger smooth fade & slide exit
        loader.classList.add('loader-exit');

        try {
            sessionStorage.setItem('starline_session_visited', 'true');
        } catch (e) {}

        setTimeout(() => {
            loader.classList.add('loader-hidden');
            loader.style.display = 'none';
            document.body.classList.remove('starline-loader-active');
            document.documentElement.classList.remove('starline-show-loader');
            document.documentElement.classList.add('starline-no-loader');
            loader.setAttribute('aria-hidden', 'true');
        }, exitDuration);
    }

    // Dismiss loader promptly on window load or timeout
    if (document.readyState === 'complete') {
        setTimeout(dismissLoader, 100);
    } else {
        window.addEventListener('load', () => setTimeout(dismissLoader, 150), { once: true });
        setTimeout(dismissLoader, duration);
    }
})();

// Legacy loader safeguard
const legacyLoader = document.querySelector('.preloader, .loading-screen');
if (legacyLoader) {
    legacyLoader.setAttribute('aria-hidden', 'true');
    legacyLoader.style.display = 'none';
    legacyLoader.style.opacity = '0';
    legacyLoader.style.pointerEvents = 'none';
}

// Hamburger Menu Toggle & Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navBackdrop = document.querySelector('.nav-backdrop');

function closeMobileMenu() {
    if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation menu');
    }
    if (navMenu) {
        navMenu.classList.remove('active');
    }
    document.body.classList.remove('menu-open');
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
        dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
}

if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Dropdown toggle
    document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdown = toggle.closest('.nav-dropdown');
            if (!dropdown) return;
            const isOpen = dropdown.classList.contains('open');

            document.querySelectorAll('.nav-dropdown.open').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('open');
                    openDropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                }
            });

            dropdown.classList.toggle('open', !isOpen);
            toggle.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close menu and dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
                dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            }
        });

        if (hamburger && navMenu && !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        let hadOpenDropdown = false;
        document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
            hadOpenDropdown = true;
            dropdown.classList.remove('open');
            const toggle = dropdown.querySelector('.nav-dropdown-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                if (dropdown.contains(document.activeElement)) {
                    toggle.focus();
                }
            }
        });
        if (!hadOpenDropdown && document.body.classList.contains('menu-open')) {
            closeMobileMenu();
            if (hamburger) {
                hamburger.focus();
            }
        }
    });
}

// Slider functionality - Initialize after DOM is loaded
let currentSlide = 0;
let slides;
let sliderInterval;

function initSlider() {
    slides = document.querySelectorAll('.slide');
    
    if (slides.length > 0) {
        // Ensure first slide is active
        slides[0].classList.add('active');
        startSliderInterval();
        
        // Pause slider on hover
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                clearInterval(sliderInterval);
            });
            heroSection.addEventListener('mouseleave', () => {
                startSliderInterval();
            });
        }

        // Touch / Swipe support for mobile devices
        const sliderEl = document.querySelector('.slider');
        if (sliderEl) {
            let touchStartX = 0;
            let touchEndX = 0;
            let touchStartY = 0;
            let touchEndY = 0;

            sliderEl.addEventListener('touchstart', (e) => {
                if (!e.changedTouches || e.changedTouches.length === 0) return;
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            sliderEl.addEventListener('touchend', (e) => {
                if (!e.changedTouches || e.changedTouches.length === 0) return;
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < 0) {
                        changeSlide(1);
                    } else {
                        changeSlide(-1);
                    }
                }
            }, { passive: true });
        }

        // Hero "Request a Quote" button triggers the quotation modal
        document.querySelectorAll('.hero-quote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = btn.getAttribute('data-product') || 'Adventure Rides Manufacturer in India';
                if (typeof openQuoteModal === 'function') {
                    e.preventDefault();
                    openQuoteModal(product);
                } else if (typeof openProductEnquiryModal === 'function') {
                    e.preventDefault();
                    openProductEnquiryModal(product);
                }
            });
        });

        document.querySelectorAll('.slider-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetSliderInterval();
            });
        });

        document.querySelector('.slider-arrow-left')?.addEventListener('click', () => changeSlide(-1));
        document.querySelector('.slider-arrow-right')?.addEventListener('click', () => changeSlide(1));

        showSlide(0);
    }
}

function showSlide(index) {
    if (!slides || slides.length === 0) return;

    currentSlide = (index + slides.length) % slides.length;
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentSlide) {
            slide.classList.add('active');
            // Play video if it's a video slide
            const video = slide.querySelector('video');
            if (video) {
                video.play().catch(e => console.log('Video play failed:', e));
            }
        } else {
            // Pause video if moving away from video slide
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
            }
        }
    });

    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
        dot.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
    });
}

function nextSlide() {
    if (!slides || slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    if (!slides || slides.length === 0) return;
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

function changeSlide(direction) {
    if (direction === 1) {
        nextSlide();
    } else {
        prevSlide();
    }
    // Reset auto-advance timer
    resetSliderInterval();
}

function startSliderInterval() {
    sliderInterval = setInterval(nextSlide, 4000);
}

function resetSliderInterval() {
    clearInterval(sliderInterval);
    startSliderInterval();
}

// Initialize slider when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
} else {
    initSlider();
}

// Keyboard navigation for slider
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// Search functionality removed (search UI disabled)

// Animated Counter for Stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16); // 60fps
    const suffix = element.getAttribute('data-suffix') || '';
    
    const counter = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString() + suffix;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(start).toLocaleString() + suffix;
        }
    }, 16);
}

// Intersection Observer for Stats Counter
const observeStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent === '0') {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
};

// Initialize stats observer when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeStats);
} else {
    observeStats();
}

// Portfolio tab switching
function switchTab(category) {
    const projectCards = document.querySelectorAll('.project-card');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', btn.textContent.trim() === category ? 'true' : 'false');
        if (btn.textContent.trim() === category) {
            btn.classList.add('active');
        }
    });
    
    projectCards.forEach(card => {
        card.classList.toggle('is-hidden', category !== 'All Projects' && card.dataset.category !== category);
    });
}

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => switchTab(button.textContent.trim()));
});

const categoryContent = {
    'rope-courses': {
        label: 'Featured category',
        title: 'Rope Courses & Obstacles',
        intro: 'Custom-designed rope-based adventure experiences that combine climbing, balance, movement, and confidence-building challenges for family entertainment zones, resorts, and high-energy outdoor destinations.',
        focus: ['Adventure parks', 'Resorts', 'Outdoor recreation zones'],
        activities: ['High rope course circuits', 'Obstacle challenge trails', 'Suspended bridges and crossings', 'Confidence-based team activities']
    },
    'zip-line': {
        label: 'Featured category',
        title: 'Zip Line & Sky Activities',
        intro: 'High-adrenaline sky experiences built for scenic viewpoints, tourism destinations, and adventure parks that need a memorable aerial attraction with strong operational safety.',
        focus: ['Tourism destinations', 'Adventure parks', 'Viewpoint attractions'],
        activities: ['Dual zip line systems', 'Sky cycle experiences', 'Aerial cable rides', 'High-line scenic circuits']
    },
    'climbing': {
        label: 'Featured category',
        title: 'Climbing & Height Activities',
        intro: 'Vertical experiences designed for active guest engagement, skill-based play, and structured challenge zones with safe, durable installation standards.',
        focus: ['Indoor and outdoor zones', 'Family attractions', 'Adventure learning spaces'],
        activities: ['Wall climbing setups', 'Tower climbing systems', 'Challenge ladders', 'Height-based fitness activities']
    },
    'multi-activity': {
        label: 'Featured category',
        title: 'Multi-Activity Structures',
        intro: 'Integrated adventure towers and activity hubs that combine fitness, climbing, zip, and challenge features into a single premium guest experience.',
        focus: ['Large family parks', 'School camps', 'Premium public attractions'],
        activities: ['Multi-level towers', 'Combined climbing and challenge zones', 'Rappelling and zip modules', 'Custom mixed-use adventure structures']
    },
    'thrill-rides': {
        label: 'Featured category',
        title: 'Extreme Thrill Rides',
        intro: 'High-intensity entertainment installations engineered to deliver bold motion, excitement, and memorable guest reactions for dedicated thrill zones.',
        focus: ['Thrill parks', 'Event venues', 'Adventure attractions'],
        activities: ['360-degree motion rides', 'Human gyro attractions', 'High-speed spinning rides', 'Extreme challenge experiences']
    },
    'atv': {
        label: 'Featured category',
        title: 'ATV & Off-Road Adventures',
        intro: 'Off-road, terrain-driven activities that offer a strong adventure value proposition for recreational destinations and outdoor tourism projects.',
        focus: ['Adventure parks', 'Camp grounds', 'Tourism properties'],
        activities: ['ATV trail rides', 'Off-road circuits', 'Adventure driving experiences', 'Terrain-based guest activities']
    },
    'shooting': {
        label: 'Featured category',
        title: 'Shooting & Target Activities',
        intro: 'Precision-based attractions built for entertainment, training, and target challenge experiences with a safe and professionally managed setup.',
        focus: ['Family entertainment parks', 'Training zones', 'Event spaces'],
        activities: ['Target shooting activities', 'Skill challenge games', 'Interactive range systems', 'Precision-based challenge modules']
    },
    'zorbing': {
        label: 'Featured category',
        title: 'Zorbing & Inflatable Adventures',
        intro: 'Lightweight, energetic inflatable and rolling attractions that bring playful excitement to family zones, festivals, and active event spaces.',
        focus: ['Family events', 'Sports zones', 'Festival setups'],
        activities: ['Zorbing experiences', 'Inflatable obstacle setups', 'Rolling fun attractions', 'Play-based obstacle installations']
    },
    'mechanical': {
        label: 'Featured category',
        title: 'Fun & Mechanical Rides',
        intro: 'Classic ride formats and mechanical attractions designed to balance entertainment value, reliability, and broad appeal across age groups.',
        focus: ['Amusement destinations', 'Family zones', 'Public spaces'],
        activities: ['Mechanical rides', 'Family spinning attractions', 'Interactive ride formats', 'Mini amusement experiences']
    },
    'water': {
        label: 'Featured category',
        title: 'Water Adventure Equipment',
        intro: 'Water-based adventure experiences engineered for aquatic facilities, seasonal attractions, and leisure destinations looking for stronger guest engagement.',
        focus: ['Water parks', 'Resorts', 'Leisure destinations'],
        activities: ['Water adventure setups', 'Splash-based challenge modules', 'Aquatic activity systems', 'Pool-side adventure experiences']
    },
    'kids': {
        label: 'Featured category',
        title: 'Kids Adventure Zone',
        intro: 'Play-focused activities carefully designed for younger guests, balancing excitement, safety, and age-appropriate challenge levels.',
        focus: ['Kids zones', 'Family parks', 'School play spaces'],
        activities: ['Junior climbing elements', 'Soft adventure activities', 'Interactive family play modules', 'Age-specific play structures']
    },
    'safety': {
        label: 'Featured category',
        title: 'Safety Equipment',
        intro: 'Essential protection, control, and support systems that ensure each attraction is installed, operated, and managed with professional-grade safety in mind.',
        focus: ['Site safety', 'Operational compliance', 'Professional installation'],
        activities: ['Full-body safety harnesses', 'Helmets and protective gear', 'Belay and rescue components', 'High-strength safety netting and connectors']
    }
};

function inferProductCategory(title) {
    const text = (title || '').toLowerCase();

    if (text.includes('rope') || text.includes('obstacle') || text.includes('bridge')) return 'rope-courses';
    if (text.includes('zip') || text.includes('sky') || text.includes('line')) return 'zip-line';
    if (text.includes('climb') || text.includes('wall') || text.includes('ladder')) return 'climbing';
    if (text.includes('tower') || text.includes('multi') || text.includes('activity')) return 'multi-activity';
    if (text.includes('gyro') || text.includes('360') || text.includes('spinner') || text.includes('spin')) return 'thrill-rides';
    if (text.includes('atv') || text.includes('off-road') || text.includes('off road')) return 'atv';
    if (text.includes('shoot') || text.includes('target')) return 'shooting';
    if (text.includes('zorb') || text.includes('inflatable')) return 'zorbing';
    if (text.includes('bull') || text.includes('cup') || text.includes('meltdown') || text.includes('ride')) return 'mechanical';
    if (text.includes('water') || text.includes('pool')) return 'water';
    if (text.includes('kid') || text.includes('junior') || text.includes('family')) return 'kids';
    if (text.includes('helmet') || text.includes('harness') || text.includes('belay') || text.includes('carabiner') || text.includes('safety') || text.includes('net')) return 'safety';

    return 'all-products';
}

function enhanceProductCards() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent?.trim() || 'Product';
        const categoryKey = card.dataset.category || inferProductCategory(title);
        card.dataset.category = categoryKey;

        const info = card.querySelector('.product-info');
        if (!info) return;

        if (!info.querySelector('.product-category-tag')) {
            const tag = document.createElement('span');
            tag.className = 'product-category-tag';
            tag.textContent = categoryKey === 'all-products' ? 'Adventure Product' : (categoryContent[categoryKey]?.title || 'Adventure Product');
            const heading = info.querySelector('h3');
            info.insertBefore(tag, heading);
        }

        if (!info.querySelector('.product-summary')) {
            const summary = document.createElement('p');
            summary.className = 'product-summary';
            summary.textContent = card.getAttribute('data-desc') || categoryContent[categoryKey]?.intro || 'Designed for adventure, safety, and memorable guest experiences.';
            const heading = info.querySelector('h3');
            info.insertBefore(summary, heading.nextSibling);
        }
    });
}

function getCategoryDisplayName(categoryKey) {
    if (!categoryKey || categoryKey === 'all-products') return 'Adventure Products';
    return categoryContent[categoryKey]?.title || 'Adventure Products';
}

function updateProductHeadingAndCount() {
    const sectionTitle = document.querySelector('.product-section-copy h2');
    const sectionMeta = document.querySelector('.product-section-controls span');
    const buttons = document.querySelectorAll('.category-button');
    const activeButton = document.querySelector('.category-button.active');
    const activeCategory = activeButton ? activeButton.dataset.category : 'all-products';
    const cards = Array.from(document.querySelectorAll('.product-card'));
    const total = cards.length;
    const matching = cards.filter(card => !card.classList.contains('is-hidden')).length;
    const visible = cards.filter(card => !card.classList.contains('is-hidden') && !card.classList.contains('page-hidden')).length;

    if (sectionTitle) {
        sectionTitle.textContent = getCategoryDisplayName(activeCategory);
    }

    if (sectionMeta) {
        const selectedLabel = activeCategory === 'all-products' ? 'All products' : getCategoryDisplayName(activeCategory);
        sectionMeta.textContent = `Showing ${visible} of ${matching || total} ${selectedLabel.toLowerCase() === 'adventure products' ? 'activities' : 'items'}`;
    }

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === activeCategory);
    });

    const pagerButtons = document.querySelectorAll('.product-nav-buttons button');
    const pageCount = Math.max(1, Math.ceil(matching / productPageSize));
    pagerButtons.forEach((button, index) => {
        button.disabled = matching === 0 || (index === 0 ? productPage === 0 : productPage >= pageCount - 1);
    });
}

const productPageSize = 6;
let productPage = 0;

function applyProductFilters() {
    const searchInput = document.getElementById('productSearch');
    const activeButton = document.querySelector('.category-button.active');
    const activeCategory = activeButton ? activeButton.dataset.category : 'all-products';
    const term = (searchInput ? searchInput.value.trim() : '').toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    const matchingCards = [];

    cards.forEach(card => {
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const summary = (card.querySelector('.product-summary')?.textContent || '').toLowerCase();
        const category = card.dataset.category || inferProductCategory(card.querySelector('h3')?.textContent || '');
        const matchesCategory = activeCategory === 'all-products' || category === activeCategory;
        const matchesSearch = !term || title.includes(term) || summary.includes(term) || (categoryContent[category]?.title || '').toLowerCase().includes(term);
        const shouldShow = matchesCategory && matchesSearch;
        card.classList.toggle('is-hidden', !shouldShow);
        card.classList.remove('page-hidden');
        if (shouldShow) matchingCards.push(card);
    });

    const pageCount = Math.max(1, Math.ceil(matchingCards.length / productPageSize));
    productPage = Math.min(productPage, pageCount - 1);
    const firstCard = productPage * productPageSize;
    matchingCards.forEach((card, index) => {
        card.classList.toggle('page-hidden', index < firstCard || index >= firstCard + productPageSize);
    });

    const visibleCount = matchingCards.filter(card => !card.classList.contains('page-hidden')).length;

    updateProductHeadingAndCount();

    const emptyState = document.getElementById('productEmptyState');
    if (visibleCount === 0) {
        if (!emptyState) {
            const node = document.createElement('div');
            node.id = 'productEmptyState';
            node.className = 'product-empty-state';
            node.innerHTML = `
                <h3>No matching products found</h3>
                <p>Try another search or request category details for a customized solution.</p>
                <div class="category-enquiry-actions">
                    <a class="request-category-button" href="contact.html">Request Category Details</a>
                    <a class="talk-expert-button" href="https://wa.me/919424904000?text=${encodeURIComponent('Hello Starline Adventures, I am looking for a custom adventure solution.')}">Talk to Our Expert</a>
                </div>
            `;
            const grid = document.querySelector('.product-grid');
            if (grid) grid.insertAdjacentElement('afterend', node);
        }
    } else if (emptyState) {
        emptyState.remove();
    }
}

function changeProductPage(direction) {
    const matching = Array.from(document.querySelectorAll('.product-card')).filter(card => !card.classList.contains('is-hidden')).length;
    const pageCount = Math.max(1, Math.ceil(matching / productPageSize));
    productPage = Math.max(0, Math.min(productPage + direction, pageCount - 1));
    applyProductFilters();
    document.querySelector('.product-category')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCategoryDetail(categoryKey) {
    const panel = document.getElementById('category-detail-panel');
    if (!panel) return;
    if (categoryKey === 'all-products') {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
    }
    if (!categoryContent[categoryKey]) return;

    const data = categoryContent[categoryKey];
    panel.hidden = false;
    const focusList = data.focus.map(item => `<span>${item}</span>`).join('');
    const activityList = data.activities.map(item => `<li>${item}</li>`).join('');

    panel.innerHTML = `
        <div class="category-detail-header">
            <p class="category-detail-label">${data.label}</p>
            <h2>${data.title}</h2>
        </div>
        <div class="category-detail-body">
            <div class="category-detail-copy">
                <p>${data.intro}</p>
                <div class="category-detail-meta">${focusList}</div>
            </div>
            <div class="category-detail-list-wrap">
                <h3>Available options</h3>
                <ul class="category-detail-list">${activityList}</ul>
            </div>
        </div>
        <div class="category-enquiry-box">
            <h3>Looking for detailed information or a customized solution?</h3>
            <div class="category-enquiry-actions">
                <a class="request-category-button" href="contact.html">Request Category Details</a>
                <a class="talk-expert-button" href="https://wa.me/919424904000?text=${encodeURIComponent('Hello Starline Adventures, I would like details for the ' + data.title + ' category.')}">Talk to Our Expert</a>
            </div>
        </div>
    `;

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initCategoryButtons() {
    const buttons = document.querySelectorAll('.category-button');
    const searchInput = document.getElementById('productSearch');
    const clearSearchButton = document.getElementById('clearSearch');
    const panel = document.getElementById('category-detail-panel');

    if (!buttons.length) return;

    enhanceProductCards();

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            productPage = 0;
            buttons.forEach(item => item.classList.toggle('active', item === button));
            renderCategoryDetail(button.dataset.category);
            applyProductFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyProductFilters);
    }

    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }
            productPage = 0;
            applyProductFilters();
        });
    }

    document.querySelectorAll('.product-nav-buttons button').forEach((button, index) => {
        button.addEventListener('click', () => changeProductPage(index === 0 ? -1 : 1));
    });

    if (panel) {
        renderCategoryDetail('rope-courses');
    }

    applyProductFilters();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCategoryButtons);
} else {
    initCategoryButtons();
}

// Share functionality
function shareWebsite() {
    if (navigator.share) {
        navigator.share({
            title: 'STARLINE ADVENTURES PVT LTD',
            text: 'Check out Starline Adventure - Manufacturers of Adventure Equipment',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// ===================================================================
// CONTACT FORM HANDLING - Enquiry API (email) + WhatsApp click-to-chat
// ===================================================================
// The contact form posts to a small backend (see server/ folder) that emails
// every enquiry to us. Update ENQUIRY_API_URL to the deployed server's URL
// once it's hosted (see server/README.md).
// In addition, after a successful submit we show a WhatsApp click-to-chat
// button pre-filled with the enquiry details - this works with zero
// third-party API dependency (the visitor just taps it and hits send).
const ENQUIRY_API_URL = 'direct-firebase';

function getEnquiryApiEndpoint() {
    return 'direct-firebase';
}

// Sanitize URL parameters to prevent XSS
function getURLParameter(param) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    if (!value) return null;
    // Sanitize: remove script tags and dangerous characters
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

// Pre-fill product field from URL parameter (Requirement #19)
function preselectProductFromURL() {
    const productParam = getURLParameter('product');
    if (productParam) {
        const productSelect = document.getElementById('contactProduct') ||
                              document.getElementById('product') ||
                              document.getElementById('quoteModalProduct') ||
                              document.querySelector('select[name="product"]');
        if (productSelect) {
            const target = productParam.toLowerCase().trim();
            let found = false;
            for (let i = 0; i < productSelect.options.length; i++) {
                const optVal = productSelect.options[i].value.toLowerCase().trim();
                const optText = productSelect.options[i].text.toLowerCase().trim();
                if (optVal === target || optText === target || optVal.includes(target) || target.includes(optVal)) {
                    productSelect.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                const newOpt = document.createElement('option');
                newOpt.value = productParam;
                newOpt.textContent = productParam;
                newOpt.selected = true;
                productSelect.appendChild(newOpt);
            }
            setTimeout(() => {
                productSelect.focus();
            }, 300);
        }

        const productInput = document.getElementById('detailEnquiryProduct') ||
                             document.querySelector('input[name="product"]:not([type="hidden"])');
        if (productInput) {
            productInput.value = productParam;
        }
    }
}

// Build a pre-filled WhatsApp click-to-chat message from the enquiry form data
function buildWhatsAppEnquiryMessage(formData) {
    const idPrefix = formData.id ? `[Enquiry ID: ${formData.id}]\n\n` : '';
    return `Hello STARLINE ADVENTURES,\n\n${idPrefix}Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany: ${formData.company || 'N/A'}\nLocation: ${formData.location}\nInterested In: ${formData.product}\n\nDetails: ${formData.message}`;
}

// Global escape HTML helper
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const escapeHtmlString = escapeHTML;
window.escapeHTML = escapeHTML;
window.escapeHtmlString = escapeHTML;

// Helper to generate Unique Enquiry ID (Format: ENQ-YYYYMMDD-XXXXXX)
function generateStarlineEnquiryId(date = new Date()) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let rand = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(6);
        crypto.getRandomValues(bytes);
        for (let i = 0; i < 6; i++) {
            rand += chars[bytes[i] % chars.length];
        }
    } else {
        for (let i = 0; i < 6; i++) {
            rand += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    return `ENQ-${yyyy}${mm}${dd}-${rand}`;
}
window.generateStarlineEnquiryId = generateStarlineEnquiryId;

// Professional Enquiry Success Confirmation Modal
function showEnquirySuccessModal(info) {
    let modal = document.getElementById('enquirySuccessModal');
    if (!modal) {
        const modalHtml = `
        <div id="enquirySuccessModal" class="enquiry-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="enquiryModalTitle">
            <div class="enquiry-modal-backdrop" id="enquiryModalBackdrop"></div>
            <div class="enquiry-modal-dialog">
                <div class="enquiry-modal-header">
                    <span class="enquiry-modal-brand-badge">STARLINE ADVENTURES PVT LTD</span>
                    <h2 id="enquiryModalTitle" class="enquiry-modal-title">Enquiry Received Successfully!</h2>
                    <button type="button" class="enquiry-modal-close" id="enquiryModalClose" aria-label="Close enquiry confirmation">&times;</button>
                </div>
                <div class="enquiry-modal-body">
                    <div class="enquiry-success-icon-wrap" aria-hidden="true">&#10003;</div>
                    
                    <div class="enquiry-id-box">
                        <span class="enquiry-id-label">Enquiry Reference ID</span>
                        <strong class="enquiry-id-value" id="enquiryModalRefId"></strong>
                        <button type="button" class="enquiry-copy-btn" id="enquiryModalCopyBtn" title="Copy Enquiry ID">&#128203; Copy</button>
                    </div>

                    <div class="enquiry-ack-message" id="enquiryModalAckMsg">
                        Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.
                    </div>

                    <div class="enquiry-email-banner" id="enquiryModalEmailBanner" style="display: none; margin: 12px 0 16px; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; line-height: 1.4; text-align: left;"></div>

                    <div class="enquiry-summary-grid">
                        <div class="enquiry-summary-item">
                            <span class="enquiry-summary-label">Full Name</span>
                            <span class="enquiry-summary-val" id="enquiryModalSummaryName">-</span>
                        </div>
                        <div class="enquiry-summary-item">
                            <span class="enquiry-summary-label">Product / Solution</span>
                            <span class="enquiry-summary-val" id="enquiryModalSummaryProduct">-</span>
                        </div>
                        <div class="enquiry-summary-item">
                            <span class="enquiry-summary-label">Project Location</span>
                            <span class="enquiry-summary-val" id="enquiryModalSummaryLocation">-</span>
                        </div>
                        <div class="enquiry-summary-item">
                            <span class="enquiry-summary-label">Date &amp; Time</span>
                            <span class="enquiry-summary-val" id="enquiryModalSummaryDate">-</span>
                        </div>
                    </div>

                    <div class="enquiry-modal-actions">
                        <a href="#" target="_blank" rel="noopener noreferrer" class="enquiry-wa-action-btn" id="enquiryModalWhatsAppBtn">
                            <span>&#128172; Chat on WhatsApp for Quick Quote</span>
                        </a>
                        <div class="enquiry-modal-btn-row">
                            <a href="tel:+919424904000" class="enquiry-call-action-btn">
                                <span>&#128222; +91 94249 04000</span>
                            </a>
                            <button type="button" class="enquiry-done-action-btn" id="enquiryModalDoneBtn">&#10003; Done</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('enquirySuccessModal');
        
        // Event Listeners for closing modal
        const closeBtn = document.getElementById('enquiryModalClose');
        const doneBtn = document.getElementById('enquiryModalDoneBtn');
        const backdrop = document.getElementById('enquiryModalBackdrop');
        const copyBtn = document.getElementById('enquiryModalCopyBtn');

        const closeModal = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        closeBtn?.addEventListener('click', closeModal);
        doneBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        copyBtn?.addEventListener('click', () => {
            const idVal = document.getElementById('enquiryModalRefId')?.textContent || '';
            if (idVal && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(idVal).then(() => {
                    copyBtn.textContent = '✓ Copied!';
                    setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
                }).catch(() => {});
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Populate data
    const refIdEl = document.getElementById('enquiryModalRefId');
    const ackMsgEl = document.getElementById('enquiryModalAckMsg');
    const nameEl = document.getElementById('enquiryModalSummaryName');
    const prodEl = document.getElementById('enquiryModalSummaryProduct');
    const locEl = document.getElementById('enquiryModalSummaryLocation');
    const dateEl = document.getElementById('enquiryModalSummaryDate');
    const waBtn = document.getElementById('enquiryModalWhatsAppBtn');

    const enquiryId = info.id || generateStarlineEnquiryId();
    if (refIdEl) refIdEl.textContent = enquiryId;
    if (ackMsgEl) {
        ackMsgEl.textContent = info.customerMessage || "Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.";
    }
    if (nameEl) nameEl.textContent = info.name || 'Valued Customer';
    if (prodEl) prodEl.textContent = info.product || 'Adventure Park Project';
    if (locEl) locEl.textContent = info.location || 'India';
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (waBtn) {
        const waText = encodeURIComponent(`Hello STARLINE ADVENTURES,\n\nI have submitted enquiry reference ID ${enquiryId} on your website:\n- Name: ${info.name}\n- Product/Activity: ${info.product}\n- Location: ${info.location}\n- Phone: ${info.phone}\n\nLooking forward to hearing from your engineering team.`);
        waBtn.href = `https://wa.me/919424904000?text=${waText}`;
    }

    const emailBannerEl = document.getElementById('enquiryModalEmailBanner');
    if (emailBannerEl) {
        if (info.emailSent) {
            emailBannerEl.style.display = 'block';
            emailBannerEl.style.background = '#f0fdf4';
            emailBannerEl.style.border = '1px solid #86efac';
            emailBannerEl.style.color = '#166534';
            emailBannerEl.innerHTML = '✉️ <strong>EmailJS Dispatched:</strong> Notification email sent directly to <strong>starlineadventure@gmail.com</strong>';
        } else if (info.emailError) {
            emailBannerEl.style.display = 'block';
            emailBannerEl.style.background = '#fefce8';
            emailBannerEl.style.border = '1px solid #fef08a';
            emailBannerEl.style.color = '#854d0e';
            emailBannerEl.innerHTML = '💾 <strong>Firestore Saved:</strong> Your enquiry is securely saved. <br><span style="font-size: 0.8rem; opacity: 0.85;">(Email notification: ' + escapeHtmlString(info.emailError) + ')</span>';
        } else {
            emailBannerEl.style.display = 'none';
        }
    }

    // Open Modal with smooth transition
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on done button for keyboard accessibility
    setTimeout(() => {
        document.getElementById('enquiryModalDoneBtn')?.focus();
    }, 120);
}

// Helper to get form fields by name or fallback IDs
function getFormField(form, name, ...fallbackIds) {
    if (form.elements && form.elements[name]) return form.elements[name];
    for (const id of fallbackIds) {
        const el = form.querySelector('#' + id);
        if (el) return el;
    }
    return form.querySelector(`[name="${name}"]`);
}

function setFormStatus(statusEl, message, state) {
    if (!statusEl) return;
    if (state === 'clean') {
        statusEl.innerHTML = '';
        statusEl.className = 'form-status';
        statusEl.style.display = 'none';
        return;
    }
    statusEl.style.display = 'block';
    statusEl.className = `form-status ${state}`;
    statusEl.innerHTML = message;
}

function detectProductFromUrl(url) {
    if (!url) return 'General Adventure Project Quote';
    const clean = String(url).toLowerCase();
    if (clean.includes('zipline') || clean.includes('zip-line')) return 'Zip Line';
    if (clean.includes('giant-swing')) return 'Giant Swing';
    if (clean.includes('suspension-bridge')) return 'Suspension Bridge';
    if (clean.includes('climbing-wall-equipment')) return 'Climbing Wall Equipment';
    if (clean.includes('climbing-wall')) return 'Climbing Wall';
    if (clean.includes('sky-cycling')) return 'Sky Cycling';
    if (clean.includes('trampoline-park')) return 'Trampoline Park';
    if (clean.includes('bungee-jumping')) return '4 in 1 Bungee Jumping';
    if (clean.includes('human-gyro')) return 'Human Gyro Ride';
    if (clean.includes('rocket-ejection')) return 'Rocket Ejection';
    if (clean.includes('sky-roller')) return 'Sky Roller Ride';
    if (clean.includes('net-climbing')) return 'Net Climbing';
    if (clean.includes('rope-course-equipment')) return 'Rope Course Equipment';
    if (clean.includes('rope-course-platforms')) return 'Rope Course Platforms & Obstacles';
    if (clean.includes('rope-course')) return 'Rope Course';
    if (clean.includes('multi-activity-tower')) return 'Multi Activity Tower';
    if (clean.includes('glass-bridge')) return 'Glass Bridge';
    if (clean.includes('360-degree-cycle')) return '360 Degree Cycle';
    if (clean.includes('mechanical-bull')) return 'Mechanical Bull Ride';
    if (clean.includes('rifle-shooting')) return 'Rifle Shooting Range';
    if (clean.includes('archery-range')) return 'Archery Range';
    if (clean.includes('open-gym')) return 'Open Gym Equipment';
    if (clean.includes('safety-nets')) return 'Safety Nets';
    if (clean.includes('safety-harness')) return 'Safety Harness & Belts';
    if (clean.includes('safety-helmets')) return 'Safety Helmets & Fall-Arrest Systems';
    if (clean.includes('steel-cables')) return 'Steel Cables, Anchors & Rigging Equipment';
    if (clean.includes('cargo-nets')) return 'Cargo Nets & Net Bridges';
    if (clean.includes('tyre-balance')) return 'Tyre Balance Obstacles';
    if (clean.includes('climbing-holds')) return 'Climbing Holds & Wall Panels';
    if (clean.includes('climbing-ropes')) return 'Climbing Ropes & Carabiners';
    if (clean.includes('adventure-park-platforms')) return 'Adventure Park Platforms';
    if (clean.includes('adventure-park-ladders')) return 'Adventure Park Ladders & Bridges';
    return 'General Adventure Project Quote';
}

// Main form submission handler - Send to Node.js server with validation, loading state, error handling, and confirmation modal
function handleEnquiry(event) {
    event.preventDefault();
    
    const form = event.target;
    const status = form.querySelector('.form-status') || document.getElementById('contactFormStatus');
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.submit-btn');
    
    // Prevent duplicate clicks
    if (submitBtn && submitBtn.disabled) return;

    const nameInput = getFormField(form, 'name', 'contactName', 'detailEnquiryName', 'name');
    const emailInput = getFormField(form, 'email', 'contactEmail', 'detailEnquiryEmail', 'email');
    const phoneInput = getFormField(form, 'phone', 'contactPhone', 'detailEnquiryPhone', 'phone');
    const companyInput = getFormField(form, 'company', 'contactCompany', 'company');
    const locationInput = getFormField(form, 'location', 'contactLocation', 'detailEnquiryLocation', 'location');
    const productInput = getFormField(form, 'product', 'contactProduct', 'detailEnquiryProduct', 'product');
    const messageInput = getFormField(form, 'message', 'contactMessage', 'detailEnquiryMessage', 'message');
    const formTypeInput = getFormField(form, 'formType');

    // Honeypot check (Requirement #15)
    const hpInput = form.querySelector('input[name="website_hp"], input.hp-field');
    if (hpInput && hpInput.value) {
        return;
    }

    let defaultFormType = 'Contact Form';
    if (form.id === 'sidebarProductEnquiryForm') defaultFormType = 'Product Page RFQ';
    else if (form.id === 'quoteModalForm') defaultFormType = 'Quick RFQ';

    const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        company: companyInput ? companyInput.value.trim() : '',
        location: locationInput ? locationInput.value.trim() : '',
        product: productInput ? productInput.value.trim() : '',
        message: messageInput ? messageInput.value.trim() : '',
        formType: (formTypeInput && formTypeInput.value) ? formTypeInput.value : defaultFormType,
        pageUrl: window.location.href,
        referrer: document.referrer || 'Direct'
    };

    if (!formData.product) {
        const pageTitle = document.querySelector('h1')?.textContent.trim();
        formData.product = pageTitle || 'General Adventure Project Enquiry';
    }

    if (!formData.message) {
        formData.message = `Project quote request for ${formData.product} at ${formData.location || 'India'}.`;
    }
    
    // Client-side Validation (Only Name, Email, Phone, Message)
    if (!formData.name || formData.name.length < 2) {
        setFormStatus(status, '❌ Please enter your full name (minimum 2 characters).', 'error');
        nameInput?.focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        setFormStatus(status, '❌ Please enter a valid email address (e.g. you@example.com).', 'error');
        emailInput?.focus();
        return;
    }

    const digitsOnly = formData.phone.replace(/[^\d]/g, '');
    if (!formData.phone || digitsOnly.length < 8) {
        setFormStatus(status, '❌ Please enter a valid contact phone number (minimum 8 digits).', 'error');
        phoneInput?.focus();
        return;
    }

    if (!formData.message || formData.message.length < 2) {
        setFormStatus(status, '❌ Please provide some details about your project requirements.', 'error');
        messageInput?.focus();
        return;
    }

    if (!formData.location) formData.location = 'Not specified';
    if (!formData.company) formData.company = 'N/A';
    if (!formData.product) formData.product = detectProductFromUrl(window.location.href);

    // Show professional loading state & prevent duplicate submissions (Requirement #16)
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Enquiry';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';
    }
    setFormStatus(status, '⏳ Submitting your enquiry to our adventure engineering team...', 'loading');
    
    const submitEnquiry = async () => {
        let directFbError = null;
        // 1. Try Direct to Firebase Firestore via Modular SDK (pure static hosting compatible)
        try {
            if (typeof window.StarlineFirebase === 'undefined' || typeof window.StarlineFirebase.saveEnquiry !== 'function') {
                try {
                    await import('/js/firebase-init.js');
                } catch (impErr) {}
            }

            if (typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                return await window.StarlineFirebase.saveEnquiry(formData);
            }
        } catch (fbErr) {
            console.warn('[Submission Note]: Direct Firestore error:', fbErr.message);
            directFbError = fbErr;
        }

        // 2. Fallback: Submit to server backend /api/enquiry if accessible
        try {
            const res = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                return data;
            }
        } catch (serverErr) {
            console.warn('[Submission Note]: Server endpoint error:', serverErr.message);
        }

        if (directFbError) throw directFbError;
        throw new Error('Enquiry submission is temporarily unavailable. Please contact us directly via WhatsApp or phone.');
    };

    submitEnquiry()
    .then(data => {
        // SUCCESS: Restore button and clear inline loading indicator
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
        setFormStatus(status, '', 'clean');
        
        const enquiryId = data.enquiryId || data.id || generateStarlineEnquiryId();
        
        // Display the professional success confirmation modal popup (Requirement #12)
        showEnquirySuccessModal({
            id: enquiryId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            location: formData.location,
            product: formData.product,
            message: formData.message,
            emailSent: data.emailSent,
            emailError: data.emailError,
            customerMessage: data.customerMessage || "Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you."
        });

        // Reset form inputs only after verified success
        form.reset();
    })
    .catch(error => {
        console.error('Enquiry submission failure:', error);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
        // Failure Handling (Requirement #13)
        if (status) {
            status.style.display = 'block';
            status.className = 'form-status error';
            status.innerHTML = `
                <div style="background: #fef2f2; border: 1.5px solid #f87171; border-radius: 8px; padding: 14px 16px; margin: 12px 0; color: #991b1b; text-align: left;">
                    <p style="font-weight: 700; margin: 0 0 6px; font-size: 0.95rem;">⚠️ We couldn't submit your enquiry right now. Please try again or contact us directly on WhatsApp/phone.</p>
                    <p style="font-size: 0.85rem; margin: 0 0 10px; color: #b91c1c;">${escapeHtmlString(error.message || 'Submission error')}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <a href="tel:+919424904000" style="display: inline-flex; align-items: center; gap: 4px; background: #0284c7; color: #fff; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-size: 0.84rem; font-weight: 700;">📞 Call Starline</a>
                        <a href="https://wa.me/919424904000?text=${encodeURIComponent('Hello Starline Adventures, I was trying to submit an enquiry on your website regarding ' + (formData.product || 'an adventure project') + '. Please get in touch.')}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #25D366; color: #fff; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-size: 0.84rem; font-weight: 700;">💬 WhatsApp Starline</a>
                        <button type="button" class="btn-try-again" onclick="this.closest('form')?.querySelector('button[type=submit], .submit-btn')?.click()" style="background: #475569; color: #fff; border: 0; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 0.84rem; font-weight: 700;">🔄 Try Again</button>
                    </div>
                </div>
            `;
        }
    });
}

// Attach form submit listeners to all enquiry forms on the page
function initEnquiryForms() {
    const forms = document.querySelectorAll('.enquiry-form, #sidebarProductEnquiryForm, #productEnquiryForm');
    forms.forEach(form => {
        if (form.id === 'contactEnquiryForm') return;
        form.removeEventListener('submit', handleEnquiry);
        form.addEventListener('submit', handleEnquiry);
    });
    preselectProductFromURL();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnquiryForms);
} else {
    initEnquiryForms();
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Testimonial slider controls
const testimonialTrack = document.querySelector('.testimonial-track');
if (testimonialTrack) {
    const testimonialSlider = testimonialTrack.closest('.testimonial-slider');
    const testimonialCards = Array.from(testimonialTrack.children);
    const previousButton = testimonialSlider.querySelector('.testimonial-prev');
    const nextButton = testimonialSlider.querySelector('.testimonial-next');
    let testimonialIndex = 0;

    const getVisibleTestimonials = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    };
    let touchStartX = 0;
    let touchStartY = 0;
    testimonialSlider.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });
    testimonialSlider.addEventListener('touchend', event => {
        const touchEndX = event.changedTouches[0].screenX;
        const touchEndY = event.changedTouches[0].screenY;
        const horizontalDistance = touchEndX - touchStartX;
        const verticalDistance = touchEndY - touchStartY;
        if (Math.abs(horizontalDistance) < 45 || Math.abs(horizontalDistance) < Math.abs(verticalDistance)) return;
        testimonialIndex += horizontalDistance < 0 ? 1 : -1;
        updateTestimonials();
    }, { passive: true });

    const updateTestimonials = () => {
        const visibleTestimonials = getVisibleTestimonials();
        const maximumIndex = Math.max(0, testimonialCards.length - visibleTestimonials);
        testimonialIndex = Math.min(testimonialIndex, maximumIndex);
        const cardWidth = testimonialCards[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(testimonialTrack).gap) || 0;
        testimonialTrack.style.transform = `translateX(-${testimonialIndex * (cardWidth + gap)}px)`;
        previousButton.disabled = testimonialIndex === 0;
        nextButton.disabled = testimonialIndex === maximumIndex;
    };

    previousButton.addEventListener('click', () => {
        testimonialIndex -= 1;
        updateTestimonials();
    });

    nextButton.addEventListener('click', () => {
        testimonialIndex += 1;
        updateTestimonials();
    });

    window.addEventListener('resize', updateTestimonials);
    updateTestimonials();
}

// Set active page in navigation
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Certificate Modal Functions
function openCertificate(element) {
    const img = element.querySelector('img');
    const fullImageUrl = img.getAttribute('data-full') || img.src;
    const modal = document.getElementById('certificateModal');
    const modalImg = document.getElementById('modalCertificateImg');
    
    modalImg.src = fullImageUrl;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCertificate() {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close certificate modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCertificate();
    }
});

// Product details modal functions
function viewDetails(button) {
    const card = button.closest('.product-card');
    const title = card?.querySelector('h3')?.textContent?.trim() || 'Product Details';
    const desc = button.getAttribute('data-desc') || card?.querySelector('.product-summary')?.textContent || 'Premium adventure equipment for custom installations.';
    const specsText = button.getAttribute('data-specs') || '';
    const applicationsText = button.getAttribute('data-applications') || '';
    const image = card?.querySelector('img')?.src || '';
    const categoryKey = card?.dataset.category || inferProductCategory(title);
    const categoryName = getCategoryDisplayName(categoryKey);
    const modal = document.getElementById('productModal');
    if (!modal) return;

    const modalImage = document.getElementById('modalImage');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalSpecs = document.getElementById('modalSpecs');
    const modalApplications = document.getElementById('modalApplications');
    const modalQuote = document.getElementById('modalQuote');
    const modalWhatsApp = document.getElementById('modalWhatsApp');
    modal.returnFocus = button;

    if (modalImage) {
        modalImage.src = image;
        modalImage.alt = title;
    }
    if (modalCategory) modalCategory.textContent = categoryName;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;

    if (modalSpecs) {
        modalSpecs.innerHTML = '';
        if (specsText) {
            specsText.split('|').forEach(spec => {
                const item = document.createElement('li');
                item.textContent = spec.trim();
                modalSpecs.appendChild(item);
            });
        } else {
            const item = document.createElement('li');
            item.textContent = 'Custom specification available on request.';
            modalSpecs.appendChild(item);
        }
    }

    if (modalApplications) {
        modalApplications.innerHTML = '';
        const applications = applicationsText ? applicationsText.split('|') : categoryContent[categoryKey]?.focus || ['Adventure parks', 'Resorts', 'Custom installations'];
        applications.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.trim();
            modalApplications.appendChild(li);
        });
    }

    // Update links to pass product parameter to contact form
    if (modalQuote) modalQuote.href = `contact.html?product=${encodeURIComponent(title)}`;
    const whatsappMsg = `Hello Starline Adventures, I would like a quote for ${title}.`;
    if (modalWhatsApp) modalWhatsApp.href = `https://wa.me/919424904000?text=${encodeURIComponent(whatsappMsg)}`;

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close')?.focus();
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    modal.returnFocus?.focus();
    modal.returnFocus = null;
}

// Close product modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// ===== SCROLL PROGRESS BAR =====
function createScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.insertBefore(progressBar, document.body.firstChild);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createScrollProgressBar);
} else {
    createScrollProgressBar();
}

// ===== CURRENT PAGE HIGHLIGHT IN NAV (Requirement #6) =====
function updateNavActiveStates() {
    const path = window.location.pathname;
    const isProductDetailPage = path.includes('/product/');
    let fileName = path.split('/').pop() || 'index.html';
    if (!fileName || fileName === '') {
        fileName = 'index.html';
    }

    const directNavLinks = document.querySelectorAll('.nav-menu > a');
    const navDropdownButtons = document.querySelectorAll('.nav-dropdown-toggle');
    
    // Check direct nav links
    directNavLinks.forEach(link => {
        if (link.classList.contains('nav-cta-btn')) return;
        const href = (link.getAttribute('href') || '').split('#')[0];
        const hrefFile = href.split('/').pop() || 'index.html';

        let isMatch = false;
        if (isProductDetailPage) {
            // Requirement #6: /product/*.html -> Products active
            isMatch = (hrefFile === 'products.html');
        } else if (fileName === 'index.html') {
            isMatch = (hrefFile === 'index.html' || href === '/' || href === '');
        } else {
            isMatch = (hrefFile === fileName);
        }

        if (isMatch) {
            link.classList.add('active', 'current-page');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active', 'current-page');
            link.removeAttribute('aria-current');
        }
    });
    
    // Check Projects dropdown
    const isProjectsActive = (fileName === 'portfolio.html' || fileName === 'gallery.html' || fileName === 'project-details.html');
    navDropdownButtons.forEach(button => {
        const dropdown = button.closest('.nav-dropdown');
        const dropdownMenu = button.nextElementSibling || dropdown?.querySelector('.nav-dropdown-menu');

        if (dropdownMenu) {
            const links = dropdownMenu.querySelectorAll('a');
            links.forEach(link => {
                const rawHref = link.getAttribute('href') || '';
                const hrefFile = rawHref.split('/').pop().split('#')[0];

                let isChildMatch = false;
                if (fileName === 'gallery.html' && hrefFile === 'gallery.html') {
                    isChildMatch = true;
                } else if ((fileName === 'portfolio.html' || fileName === 'project-details.html') && hrefFile === 'portfolio.html') {
                    isChildMatch = true;
                }

                if (isChildMatch) {
                    link.classList.add('active', 'current-page');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active', 'current-page');
                    link.removeAttribute('aria-current');
                }
            });
        }

        if (isProjectsActive) {
            button.classList.add('active', 'current-page');
            dropdown?.classList.add('active');
        } else {
            button.classList.remove('active', 'current-page');
            dropdown?.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', updateNavActiveStates);
window.addEventListener('hashchange', updateNavActiveStates);

// ===== NEWSLETTER FORM HANDLER =====
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value.trim();
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            
            // Validate email without window.alert
            if (!email || !email.includes('@')) {
                if (button) {
                    button.textContent = '⚠️ Invalid email';
                    setTimeout(() => { button.textContent = originalText; }, 2500);
                }
                return;
            }
            
            // Disable button during submission
            button.disabled = true;
            button.textContent = 'Subscribing...';
            
            setTimeout(() => {
                button.textContent = '✅ Subscribed!';
                button.style.background = '#4caf50';
                form.reset();
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                    button.style.background = '';
                }, 3000);
            }, 800);
        });
    });
});

// ===== UNIFIED PROJECT ENQUIRY / REQUEST QUOTATION MODAL =====
let quoteModalPreviousFocus = null;

function createQuoteModal() {
    if (document.getElementById('quoteModal')) return;

    const modalHTML = `
    <div id="quoteModal" class="quote-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="quoteModalTitle">
        <div class="quote-modal-backdrop" id="quoteModalBackdrop" aria-hidden="true"></div>
        <div class="quote-modal-dialog" role="document">
            <div class="quote-modal-header">
                <span class="quote-modal-badge">Direct Factory Engineering</span>
                <h2 id="quoteModalTitle" class="quote-modal-title">Request Product Quotation</h2>
                <p id="quoteModalSubtitle" class="quote-modal-subtitle">Direct manufacturer pricing, technical specs &amp; installation estimates for your adventure facility.</p>
                <button type="button" class="quote-modal-close" id="quoteModalClose" aria-label="Close quote modal">&times;</button>
            </div>

            <div class="quote-modal-body">
                <form id="quoteModalForm" class="quote-modal-form" novalidate>
                    <input type="hidden" name="formType" value="Get a Quote">
                    <input type="hidden" name="product" id="quoteModalProduct" value="">
                    
                    <div id="quoteModalProductBadge" style="display: none; align-items: center; gap: 6px; padding: 7px 12px; background: rgba(244, 118, 33, 0.08); border-left: 3px solid #F47621; border-radius: 4px; font-size: 0.85rem; color: #c25409; font-weight: 600; margin-bottom: 14px;">
                        <span>Requested Item:</span>
                        <strong id="quoteModalProductLabel" style="color: #0f172a;"></strong>
                    </div>

                    <div class="quote-form-grid">
                        <div class="quote-field-group">
                            <label for="quoteModalName">Full Name <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">👤</span>
                                <input type="text" id="quoteModalName" name="name" placeholder="Your full name" required autocomplete="name">
                            </div>
                        </div>

                        <div class="quote-field-group">
                            <label for="quoteModalEmail">Email Address <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">✉️</span>
                                <input type="email" id="quoteModalEmail" name="email" placeholder="you@example.com" required autocomplete="email">
                            </div>
                        </div>

                        <div class="quote-field-group">
                            <label for="quoteModalPhone">Phone Number <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">📞</span>
                                <input type="tel" id="quoteModalPhone" name="phone" placeholder="+91-94249-04000" required autocomplete="tel">
                            </div>
                        </div>

                        <div class="quote-field-group">
                            <label for="quoteModalMessage">Project Requirements / Message <span class="quote-required">*</span></label>
                            <textarea id="quoteModalMessage" name="message" rows="3" placeholder="Tell us about your project requirements, site dimensions, or timeline..." required></textarea>
                        </div>
                    </div>

                    <div class="quote-modal-trust">
                        <span>⚡ Response within 24 Hours</span>
                        <span>🛡️ Certified Safety Standards</span>
                        <span>🏭 Factory Direct Pricing</span>
                    </div>

                    <button type="submit" class="quote-submit-btn" id="quoteSubmitBtn">
                        Get a Quote
                    </button>

                    <div class="quote-modal-status" id="quoteModalStatus" role="alert" aria-live="polite"></div>
                </form>

                <div class="quote-success-view" id="quoteSuccessView">
                    <div class="quote-success-icon" aria-hidden="true">✓</div>
                    <h3 class="quote-success-title">Quote Request Received!</h3>
                    <div id="quoteSuccessDesc" class="quote-success-desc">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="quote-success-actions">
                        <a href="https://wa.me/919424904000" target="_blank" rel="noopener noreferrer" class="quote-whatsapp-btn" id="quoteSuccessWhatsApp">
                            <span>💬 Connect on WhatsApp</span>
                        </a>
                        <button type="button" class="quote-close-done-btn" id="quoteCloseDoneBtn">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    bindQuoteModalEvents();
}

function openQuoteModal(productName) {
    createQuoteModal();

    const modal = document.getElementById('quoteModal');
    if (!modal) return;

    quoteModalPreviousFocus = document.activeElement;

    // Close any other open modals in the page cleanly
    document.querySelectorAll('.product-modal.active, .enquiry-modal.active, .gallery-lightbox.active').forEach(m => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
    });

    // Reset form view
    const form = document.getElementById('quoteModalForm');
    const successView = document.getElementById('quoteSuccessView');
    const status = document.getElementById('quoteModalStatus');
    const submitBtn = document.getElementById('quoteSubmitBtn');
    const titleEl = document.getElementById('quoteModalTitle');
    const subtitleEl = document.getElementById('quoteModalSubtitle');
    const productInput = document.getElementById('quoteModalProduct');
    const productBadge = document.getElementById('quoteModalProductBadge');
    const productLabel = document.getElementById('quoteModalProductLabel');

    if (form) form.style.display = 'block';
    if (successView) successView.style.display = 'none';
    if (status) {
        status.textContent = '';
        status.className = 'quote-modal-status';
        status.style.display = 'none';
    }
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Get a Quote';
    }

    // Resolve product
    let product = (productName && typeof productName === 'string' && productName.trim() !== '') 
        ? productName.trim() 
        : detectProductFromUrl(window.location.href);

    if (productInput) productInput.value = product;

    if (titleEl) {
        titleEl.textContent = 'Request Product Quotation';
    }

    if (product && product !== 'General Adventure Project Quote' && product !== 'Adventure Equipment' && product !== 'Footer Quote Request') {
        if (productBadge && productLabel) {
            productLabel.textContent = product;
            productBadge.style.display = 'flex';
        }
        if (subtitleEl) {
            subtitleEl.innerHTML = `Direct manufacturer pricing, technical specs &amp; installation estimates for <strong>${escapeHTML(product)}</strong>.`;
        }
    } else {
        if (productBadge) productBadge.style.display = 'none';
        if (subtitleEl) {
            subtitleEl.textContent = 'Direct manufacturer pricing, technical specs & installation estimates for your adventure facility.';
        }
    }

    // Open modal
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => {
        const nameInput = document.getElementById('quoteModalName');
        if (nameInput) nameInput.focus();
    }, 120);
}

// Global modal triggers and aliases
window.openProductEnquiryModal = openQuoteModal;
window.openQuoteModal = openQuoteModal;
window.closeProductEnquiryModal = closeQuoteModal;
window.closeQuoteModal = closeQuoteModal;

function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Also close any legacy product modal if open
    document.querySelectorAll('.product-modal.active, .enquiry-modal.active').forEach(m => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
    });

    if (quoteModalPreviousFocus && typeof quoteModalPreviousFocus.focus === 'function') {
        try {
            quoteModalPreviousFocus.focus();
        } catch (e) {}
        quoteModalPreviousFocus = null;
    }
}

function bindQuoteModalEvents() {
    const modal = document.getElementById('quoteModal');
    if (!modal || modal.dataset.bound === 'true') return;
    modal.dataset.bound = 'true';

    const closeBtn = document.getElementById('quoteModalClose');
    const backdrop = document.getElementById('quoteModalBackdrop');
    const doneBtn = document.getElementById('quoteCloseDoneBtn');
    const form = document.getElementById('quoteModalForm');

    if (closeBtn) closeBtn.addEventListener('click', closeQuoteModal);
    if (backdrop) backdrop.addEventListener('click', closeQuoteModal);
    if (doneBtn) doneBtn.addEventListener('click', closeQuoteModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeQuoteModal();
        }
    });

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('quoteModalName');
            const emailInput = document.getElementById('quoteModalEmail');
            const phoneInput = document.getElementById('quoteModalPhone');
            const messageInput = document.getElementById('quoteModalMessage');
            const productInput = document.getElementById('quoteModalProduct');
            const status = document.getElementById('quoteModalStatus');
            const submitBtn = document.getElementById('quoteSubmitBtn');
            const successView = document.getElementById('quoteSuccessView');
            const successDesc = document.getElementById('quoteSuccessDesc');
            const whatsAppBtn = document.getElementById('quoteSuccessWhatsApp');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';
            const product = (productInput && productInput.value) ? productInput.value : detectProductFromUrl(window.location.href);

            // Validation - Full Name
            if (!name || name.length < 2) {
                showModalStatus('Please enter your full name (minimum 2 characters).', 'error');
                nameInput?.focus();
                return;
            }

            // Validation - Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                showModalStatus('Please enter a valid email address (e.g. you@example.com).', 'error');
                emailInput?.focus();
                return;
            }

            // Validation - Phone
            const phoneDigits = phone.replace(/[^\d]/g, '');
            if (!phone || phoneDigits.length < 8) {
                showModalStatus('Please enter a valid phone number (minimum 8 digits).', 'error');
                phoneInput?.focus();
                return;
            }

            // Validation - Message
            if (!message || message.length < 2) {
                showModalStatus('Please enter your project requirements or message.', 'error');
                messageInput?.focus();
                return;
            }

            showModalStatus('Submitting your quotation request...', 'loading');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Submitting...';
            }

            const payload = {
                name,
                email,
                phone,
                message,
                company: 'N/A',
                location: 'Not specified',
                product: product || 'General Adventure Project Enquiry',
                formType: 'Get a Quote'
            };

            const submitQuote = async () => {
                let directFbError = null;
                // 1. Direct Firebase Firestore submission (Modular SDK)
                try {
                    if (typeof window.StarlineFirebase === 'undefined' || typeof window.StarlineFirebase.saveEnquiry !== 'function') {
                        try {
                            await import('/js/firebase-init.js');
                        } catch (impErr) {}
                    }

                    if (typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                        return await window.StarlineFirebase.saveEnquiry(payload);
                    }
                } catch (fbErr) {
                    console.warn('[Quote Modal]: Direct Firestore notice:', fbErr.message);
                    directFbError = fbErr;
                }

                // 2. Server API fallback (/api/enquiry)
                try {
                    const res = await fetch('/api/enquiry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        return await res.json();
                    }
                } catch (apiErr) {
                    console.warn('[Quote Modal]: Server API notice:', apiErr.message);
                }

                if (directFbError) throw directFbError;
                throw new Error('Service temporarily unavailable. Please try again or reach out directly on WhatsApp.');
            };

            submitQuote()
            .then(data => {
                const enquiryId = data.enquiryId || data.id || generateStarlineEnquiryId();
                
                // Show success view
                form.style.display = 'none';
                successView.style.display = 'block';

                if (successDesc) {
                    const emailBannerHtml = data.emailSent
                        ? `<div style="background: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 0.86rem; font-weight: 600;">✉️ Notification email dispatched to <strong>starlineadventure@gmail.com</strong></div>`
                        : (data.emailError
                            ? `<div style="background: #fefce8; border: 1px solid #fef08a; color: #854d0e; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 0.86rem;">💾 <strong>Firestore Saved:</strong> Enquiry securely recorded. <br><span style="font-size: 0.78rem; opacity: 0.85;">(${escapeHTML(data.emailError)})</span></div>`
                            : '');

                    successDesc.innerHTML = `
                        <div style="background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 6px; margin-bottom: 14px; font-family: monospace; font-size: 0.95rem;">
                            Enquiry ID: <strong style="color: #F47621;">${escapeHTML(enquiryId)}</strong>
                        </div>
                        ${emailBannerHtml}
                        <div style="background: rgba(244,118,33,0.06); border-left: 4px solid #F47621; padding: 14px; border-radius: 6px; text-align: left; margin-bottom: 16px; font-size: 0.92rem; line-height: 1.6; color: #334155;">
                            Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.
                        </div>
                    `;
                }

                if (whatsAppBtn) {
                    const waText = encodeURIComponent(`Hello STARLINE ADVENTURES,\n\nI just requested a project quote [Enquiry ID: ${enquiryId}] on your website:\n- Name: ${name}\n- Phone: ${phone}\n- Email: ${email}\n- Product/Activity: ${product}\n- Requirements: ${message}`);
                    whatsAppBtn.href = `https://wa.me/919424904000?text=${waText}`;
                }

                form.reset();
            })
            .catch(err => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Get a Quote';
                }
                showModalStatus(`❌ ${escapeHTML(err.message || 'Unable to submit enquiry. Please try again or reach out on WhatsApp.')}`, 'error');
            });
        });
    }

    function showModalStatus(text, type) {
        const status = document.getElementById('quoteModalStatus');
        if (!status) return;
        status.textContent = text;
        status.className = `quote-modal-status ${type}`;
        status.style.display = 'block';
    }
}

// ==========================================
// 1. “TELL US YOUR REQUIREMENT” MODAL
// ==========================================
let reqModalPreviousFocus = null;

function createRequirementModal() {
    if (document.getElementById('requirementModal')) return;

    const modalHTML = `
    <div id="requirementModal" class="quote-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="reqModalTitle">
        <div class="quote-modal-backdrop" id="reqModalBackdrop" aria-hidden="true"></div>
        <div class="quote-modal-dialog" role="document">
            <div class="quote-modal-header">
                <span class="quote-modal-badge">✨ Custom Adventure Solutions</span>
                <h2 id="reqModalTitle" class="quote-modal-title">Tell Us Your Requirement</h2>
                <p id="reqModalSubtitle" class="quote-modal-subtitle">Share your customized adventure ride, equipment, or project specifications with our engineering team.</p>
                <button type="button" class="quote-modal-close" id="reqModalClose" aria-label="Close requirement modal">&times;</button>
            </div>

            <div class="quote-modal-body">
                <form id="requirementModalForm" class="quote-modal-form" novalidate>
                    <input type="hidden" name="formType" value="Tell Us Your Requirement">
                    
                    <div class="quote-form-grid">
                        <div class="quote-field-group">
                            <label for="reqModalName">Name <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">👤</span>
                                <input type="text" id="reqModalName" name="name" placeholder="Your full name" required autocomplete="name">
                            </div>
                            <span class="field-error-msg" id="reqErrorName"></span>
                        </div>

                        <div class="quote-field-group">
                            <label for="reqModalPhone">Phone Number <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">📞</span>
                                <input type="tel" id="reqModalPhone" name="phone" placeholder="+91-94249-04000" required autocomplete="tel">
                            </div>
                            <span class="field-error-msg" id="reqErrorPhone"></span>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="reqModalEmail">Email</label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">✉️</span>
                                <input type="email" id="reqModalEmail" name="email" placeholder="you@example.com (optional)" autocomplete="email">
                            </div>
                            <span class="field-error-msg" id="reqErrorEmail"></span>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="reqModalDetails">Requirement Details <span class="quote-required">*</span></label>
                            <textarea id="reqModalDetails" name="details" rows="4" placeholder="Tell us about the activity, dimensions, equipment specs, or site requirements..." required></textarea>
                            <span class="field-error-msg" id="reqErrorDetails"></span>
                        </div>
                    </div>

                    <div class="quote-modal-trust">
                        <span>⚡ Response within 24 Hours</span>
                        <span>🛡️ Certified Safety Standards</span>
                        <span>🏭 Factory Direct Customization</span>
                    </div>

                    <button type="submit" class="quote-submit-btn" id="reqSubmitBtn">
                        Submit Requirement &rarr;
                    </button>

                    <div class="quote-modal-status" id="reqModalStatus" role="alert" aria-live="polite"></div>
                </form>

                <div class="quote-success-view" id="reqSuccessView">
                    <div class="quote-success-icon" aria-hidden="true">✓</div>
                    <h3 class="quote-success-title">Requirement Received!</h3>
                    <div id="reqSuccessDesc" class="quote-success-desc">
                        <p style="margin: 0 0 12px; font-size: 1.05rem; font-weight: 600; color: #166534; line-height: 1.6;">
                            Thank you! Your requirement has been received. Our team will review your requirement and contact you shortly.
                        </p>
                    </div>
                    <div class="quote-success-actions">
                        <a href="https://wa.me/919424904000" target="_blank" rel="noopener noreferrer" class="quote-whatsapp-btn" id="reqSuccessWhatsApp">
                            <span>💬 Connect on WhatsApp</span>
                        </a>
                        <button type="button" class="quote-close-done-btn" id="reqCloseDoneBtn">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    bindRequirementModalEvents();
}

function openRequirementModal() {
    createRequirementModal();

    const modal = document.getElementById('requirementModal');
    if (!modal) return;

    reqModalPreviousFocus = document.activeElement;

    // Close any other open modals cleanly
    document.querySelectorAll('.quote-modal.active, .product-modal.active, .enquiry-modal.active').forEach(m => {
        if (m !== modal) {
            m.classList.remove('active');
            m.setAttribute('aria-hidden', 'true');
        }
    });

    const form = document.getElementById('requirementModalForm');
    const successView = document.getElementById('reqSuccessView');
    const status = document.getElementById('reqModalStatus');
    const submitBtn = document.getElementById('reqSubmitBtn');

    if (form) {
        form.style.display = 'block';
        form.querySelectorAll('.field-error-msg').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
        form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('has-error'));
    }
    if (successView) successView.style.display = 'none';
    if (status) {
        status.textContent = '';
        status.className = 'quote-modal-status';
        status.style.display = 'none';
    }
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Requirement &rarr;';
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const nameInput = document.getElementById('reqModalName');
        if (nameInput) nameInput.focus();
    }, 120);
}

function closeRequirementModal() {
    const modal = document.getElementById('requirementModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (reqModalPreviousFocus && typeof reqModalPreviousFocus.focus === 'function') {
        try {
            reqModalPreviousFocus.focus();
        } catch (e) {}
        reqModalPreviousFocus = null;
    }
}

function bindRequirementModalEvents() {
    const modal = document.getElementById('requirementModal');
    if (!modal || modal.dataset.bound === 'true') return;
    modal.dataset.bound = 'true';

    const closeBtn = document.getElementById('reqModalClose');
    const backdrop = document.getElementById('reqModalBackdrop');
    const doneBtn = document.getElementById('reqCloseDoneBtn');
    const form = document.getElementById('requirementModalForm');

    if (closeBtn) closeBtn.addEventListener('click', closeRequirementModal);
    if (backdrop) backdrop.addEventListener('click', closeRequirementModal);
    if (doneBtn) doneBtn.addEventListener('click', closeRequirementModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRequirementModal();
        }
    });

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('reqModalName');
            const phoneInput = document.getElementById('reqModalPhone');
            const emailInput = document.getElementById('reqModalEmail');
            const detailsInput = document.getElementById('reqModalDetails');
            const status = document.getElementById('reqModalStatus');
            const submitBtn = document.getElementById('reqSubmitBtn');
            const successView = document.getElementById('reqSuccessView');
            const successDesc = document.getElementById('reqSuccessDesc');
            const whatsAppBtn = document.getElementById('reqSuccessWhatsApp');

            // Reset errors
            form.querySelectorAll('.field-error-msg').forEach(el => {
                el.textContent = '';
                el.classList.remove('visible');
            });
            form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('has-error'));
            if (status) {
                status.textContent = '';
                status.className = 'quote-modal-status';
                status.style.display = 'none';
            }

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const details = detailsInput ? detailsInput.value.trim() : '';

            let isValid = true;
            let firstInvalid = null;

            function setFieldError(input, errorId, msg) {
                isValid = false;
                if (input) {
                    input.classList.add('has-error');
                    if (!firstInvalid) firstInvalid = input;
                }
                const errSpan = document.getElementById(errorId);
                if (errSpan) {
                    errSpan.textContent = msg;
                    errSpan.classList.add('visible');
                }
            }

            // 1. Name* (Required)
            if (!name || name.length < 2) {
                setFieldError(nameInput, 'reqErrorName', 'Please enter your full name (minimum 2 characters).');
            }

            // 2. Phone Number* (Required)
            const phoneClean = phone.replace(/[^\d+]/g, '');
            if (!phone || phoneClean.length < 8) {
                setFieldError(phoneInput, 'reqErrorPhone', 'Please enter a valid phone number (minimum 8 digits).');
            }

            // 3. Email (Optional, but if supplied validate pattern)
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setFieldError(emailInput, 'reqErrorEmail', 'Please enter a valid email address.');
                }
            }

            // 4. Requirement Details* (Required)
            if (!details || details.length < 2) {
                setFieldError(detailsInput, 'reqErrorDetails', 'Please provide details about your requirement.');
            }

            if (!isValid) {
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';
            }
            if (status) {
                status.textContent = 'Submitting your requirement...';
                status.className = 'quote-modal-status loading';
                status.style.display = 'block';
            }

            const payload = {
                name,
                phone,
                email: email || 'no-email@starline.customer',
                message: details,
                product: 'Custom Requirement / Unlisted Activity',
                company: 'N/A',
                location: 'Not specified',
                formType: 'Tell Us Your Requirement'
            };

            const submitRequirement = async () => {
                let directFbError = null;
                try {
                    if (typeof window.StarlineFirebase === 'undefined' || typeof window.StarlineFirebase.saveEnquiry !== 'function') {
                        try {
                            await import('/js/firebase-init.js');
                        } catch (impErr) {}
                    }
                    if (typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                        return await window.StarlineFirebase.saveEnquiry(payload);
                    }
                } catch (fbErr) {
                    console.warn('[Requirement Modal]: Direct Firestore notice:', fbErr.message);
                    directFbError = fbErr;
                }

                try {
                    const res = await fetch('/api/enquiry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        return await res.json();
                    }
                } catch (apiErr) {
                    console.warn('[Requirement Modal]: Server API notice:', apiErr.message);
                }

                if (directFbError) throw directFbError;
                throw new Error('Unable to submit requirement. Please try again or reach out on WhatsApp.');
            };

            submitRequirement()
            .then(data => {
                const enquiryId = data.enquiryId || data.id || generateStarlineEnquiryId();
                
                form.style.display = 'none';
                successView.style.display = 'block';

                if (successDesc) {
                    successDesc.innerHTML = `
                        <div style="background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 6px; margin-bottom: 14px; font-family: monospace; font-size: 0.95rem;">
                            Requirement ID: <strong style="color: #F47621;">${escapeHTML(enquiryId)}</strong>
                        </div>
                        <div style="background: rgba(34,197,94,0.08); border-left: 4px solid #22c55e; padding: 14px; border-radius: 6px; text-align: left; margin-bottom: 16px; font-size: 0.96rem; line-height: 1.6; color: #15803d; font-weight: 600;">
                            Thank you! Your requirement has been received. Our team will review your requirement and contact you shortly.
                        </div>
                    `;
                }

                if (whatsAppBtn) {
                    const waText = encodeURIComponent(`Hello Starline Adventures,\n\nI just submitted my custom requirement [ID: ${enquiryId}] on your website:\n- Name: ${name}\n- Phone: ${phone}${email ? '\n- Email: ' + email : ''}\n- Requirement: ${details}`);
                    whatsAppBtn.href = `https://wa.me/919424904000?text=${waText}`;
                }

                form.reset();
            })
            .catch(err => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Submit Requirement &rarr;';
                }
                if (status) {
                    status.textContent = `❌ ${err.message || 'Unable to submit requirement. Please try again.'}`;
                    status.className = 'quote-modal-status error';
                    status.style.display = 'block';
                }
            });
        });
    }
}

// ==========================================
// 2. “ASK FOR ANOTHER ACTIVITY” MODAL
// ==========================================
let askModalPreviousFocus = null;

function createAskActivityModal() {
    if (document.getElementById('askActivityModal')) return;

    const modalHTML = `
    <div id="askActivityModal" class="quote-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="askModalTitle">
        <div class="quote-modal-backdrop" id="askModalBackdrop" aria-hidden="true"></div>
        <div class="quote-modal-dialog" role="document">
            <div class="quote-modal-header">
                <span class="quote-modal-badge">💬 Unlisted Activity Enquiry</span>
                <h2 id="askModalTitle" class="quote-modal-title">Ask for Another Activity</h2>
                <p id="askModalSubtitle" class="quote-modal-subtitle">Looking for an adventure ride or equipment not listed on our website? Share your request with us.</p>
                <button type="button" class="quote-modal-close" id="askModalClose" aria-label="Close ask activity modal">&times;</button>
            </div>

            <div class="quote-modal-body">
                <form id="askActivityModalForm" class="quote-modal-form" novalidate>
                    <input type="hidden" name="formType" value="Ask for Another Activity">
                    
                    <div class="quote-form-grid">
                        <div class="quote-field-group">
                            <label for="askModalName">Name <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">👤</span>
                                <input type="text" id="askModalName" name="name" placeholder="Your full name" required autocomplete="name">
                            </div>
                            <span class="field-error-msg" id="askErrorName"></span>
                        </div>

                        <div class="quote-field-group">
                            <label for="askModalPhone">Phone Number <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">📞</span>
                                <input type="tel" id="askModalPhone" name="phone" placeholder="+91-94249-04000" required autocomplete="tel">
                            </div>
                            <span class="field-error-msg" id="askErrorPhone"></span>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="askModalEmail">Email</label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">✉️</span>
                                <input type="email" id="askModalEmail" name="email" placeholder="you@example.com (optional)" autocomplete="email">
                            </div>
                            <span class="field-error-msg" id="askErrorEmail"></span>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="askModalActivity">Activity / Equipment Required <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">🎡</span>
                                <input type="text" id="askModalActivity" name="activity" placeholder="e.g. Roller Coaster, FlowRider, Ninja Obstacle Course..." required>
                            </div>
                            <span class="field-error-msg" id="askErrorActivity"></span>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="askModalDetails">Requirement Details <span class="quote-required">*</span></label>
                            <textarea id="askModalDetails" name="details" rows="3" placeholder="Describe your required features, site space, or operational goals..." required></textarea>
                            <span class="field-error-msg" id="askErrorDetails"></span>
                        </div>
                    </div>

                    <div class="quote-modal-trust">
                        <span>⚡ Response within 24 Hours</span>
                        <span>🛡️ Certified Safety Standards</span>
                        <span>🏗️ Custom Engineering & Setup</span>
                    </div>

                    <button type="submit" class="quote-submit-btn" id="askSubmitBtn">
                        Send Request &rarr;
                    </button>

                    <div class="quote-modal-status" id="askModalStatus" role="alert" aria-live="polite"></div>
                </form>

                <div class="quote-success-view" id="askSuccessView">
                    <div class="quote-success-icon" aria-hidden="true">✓</div>
                    <h3 class="quote-success-title">Request Received!</h3>
                    <div id="askSuccessDesc" class="quote-success-desc">
                        <p style="margin: 0 0 12px; font-size: 1.05rem; font-weight: 600; color: #166534; line-height: 1.6;">
                            Thank you! Your request has been received. Our team will review your request and contact you shortly.
                        </p>
                    </div>
                    <div class="quote-success-actions">
                        <a href="https://wa.me/919424904000" target="_blank" rel="noopener noreferrer" class="quote-whatsapp-btn" id="askSuccessWhatsApp">
                            <span>💬 Connect on WhatsApp</span>
                        </a>
                        <button type="button" class="quote-close-done-btn" id="askCloseDoneBtn">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    bindAskActivityModalEvents();
}

function openAskActivityModal() {
    createAskActivityModal();

    const modal = document.getElementById('askActivityModal');
    if (!modal) return;

    askModalPreviousFocus = document.activeElement;

    // Close any other open modals cleanly
    document.querySelectorAll('.quote-modal.active, .product-modal.active, .enquiry-modal.active').forEach(m => {
        if (m !== modal) {
            m.classList.remove('active');
            m.setAttribute('aria-hidden', 'true');
        }
    });

    const form = document.getElementById('askActivityModalForm');
    const successView = document.getElementById('askSuccessView');
    const status = document.getElementById('askModalStatus');
    const submitBtn = document.getElementById('askSubmitBtn');

    if (form) {
        form.style.display = 'block';
        form.querySelectorAll('.field-error-msg').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
        form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('has-error'));
    }
    if (successView) successView.style.display = 'none';
    if (status) {
        status.textContent = '';
        status.className = 'quote-modal-status';
        status.style.display = 'none';
    }
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Request &rarr;';
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const nameInput = document.getElementById('askModalName');
        if (nameInput) nameInput.focus();
    }, 120);
}

function closeAskActivityModal() {
    const modal = document.getElementById('askActivityModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (askModalPreviousFocus && typeof askModalPreviousFocus.focus === 'function') {
        try {
            askModalPreviousFocus.focus();
        } catch (e) {}
        askModalPreviousFocus = null;
    }
}

function bindAskActivityModalEvents() {
    const modal = document.getElementById('askActivityModal');
    if (!modal || modal.dataset.bound === 'true') return;
    modal.dataset.bound = 'true';

    const closeBtn = document.getElementById('askModalClose');
    const backdrop = document.getElementById('askModalBackdrop');
    const doneBtn = document.getElementById('askCloseDoneBtn');
    const form = document.getElementById('askActivityModalForm');

    if (closeBtn) closeBtn.addEventListener('click', closeAskActivityModal);
    if (backdrop) backdrop.addEventListener('click', closeAskActivityModal);
    if (doneBtn) doneBtn.addEventListener('click', closeAskActivityModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAskActivityModal();
        }
    });

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('askModalName');
            const phoneInput = document.getElementById('askModalPhone');
            const emailInput = document.getElementById('askModalEmail');
            const activityInput = document.getElementById('askModalActivity');
            const detailsInput = document.getElementById('askModalDetails');
            const status = document.getElementById('askModalStatus');
            const submitBtn = document.getElementById('askSubmitBtn');
            const successView = document.getElementById('askSuccessView');
            const successDesc = document.getElementById('askSuccessDesc');
            const whatsAppBtn = document.getElementById('askSuccessWhatsApp');

            // Reset errors
            form.querySelectorAll('.field-error-msg').forEach(el => {
                el.textContent = '';
                el.classList.remove('visible');
            });
            form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('has-error'));
            if (status) {
                status.textContent = '';
                status.className = 'quote-modal-status';
                status.style.display = 'none';
            }

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const activity = activityInput ? activityInput.value.trim() : '';
            const details = detailsInput ? detailsInput.value.trim() : '';

            let isValid = true;
            let firstInvalid = null;

            function setFieldError(input, errorId, msg) {
                isValid = false;
                if (input) {
                    input.classList.add('has-error');
                    if (!firstInvalid) firstInvalid = input;
                }
                const errSpan = document.getElementById(errorId);
                if (errSpan) {
                    errSpan.textContent = msg;
                    errSpan.classList.add('visible');
                }
            }

            // 1. Name* (Required)
            if (!name || name.length < 2) {
                setFieldError(nameInput, 'askErrorName', 'Please enter your full name (minimum 2 characters).');
            }

            // 2. Phone Number* (Required)
            const phoneClean = phone.replace(/[^\d+]/g, '');
            if (!phone || phoneClean.length < 8) {
                setFieldError(phoneInput, 'askErrorPhone', 'Please enter a valid phone number (minimum 8 digits).');
            }

            // 3. Email (Optional, but if supplied validate pattern)
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setFieldError(emailInput, 'askErrorEmail', 'Please enter a valid email address.');
                }
            }

            // 4. Activity / Equipment Required* (Required)
            if (!activity || activity.length < 2) {
                setFieldError(activityInput, 'askErrorActivity', 'Please specify the activity or equipment required.');
            }

            // 5. Requirement Details* (Required)
            if (!details || details.length < 2) {
                setFieldError(detailsInput, 'askErrorDetails', 'Please provide details about your request.');
            }

            if (!isValid) {
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';
            }
            if (status) {
                status.textContent = 'Submitting your request...';
                status.className = 'quote-modal-status loading';
                status.style.display = 'block';
            }

            const payload = {
                name,
                phone,
                email: email || 'no-email@starline.customer',
                product: activity,
                message: details,
                company: 'N/A',
                location: 'Not specified',
                formType: 'Ask for Another Activity'
            };

            const submitAskRequest = async () => {
                let directFbError = null;
                try {
                    if (typeof window.StarlineFirebase === 'undefined' || typeof window.StarlineFirebase.saveEnquiry !== 'function') {
                        try {
                            await import('/js/firebase-init.js');
                        } catch (impErr) {}
                    }
                    if (typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                        return await window.StarlineFirebase.saveEnquiry(payload);
                    }
                } catch (fbErr) {
                    console.warn('[Ask Activity Modal]: Direct Firestore notice:', fbErr.message);
                    directFbError = fbErr;
                }

                try {
                    const res = await fetch('/api/enquiry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        return await res.json();
                    }
                } catch (apiErr) {
                    console.warn('[Ask Activity Modal]: Server API notice:', apiErr.message);
                }

                if (directFbError) throw directFbError;
                throw new Error('Unable to submit request. Please try again or reach out on WhatsApp.');
            };

            submitAskRequest()
            .then(data => {
                const enquiryId = data.enquiryId || data.id || generateStarlineEnquiryId();
                
                form.style.display = 'none';
                successView.style.display = 'block';

                if (successDesc) {
                    successDesc.innerHTML = `
                        <div style="background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 6px; margin-bottom: 14px; font-family: monospace; font-size: 0.95rem;">
                            Request ID: <strong style="color: #F47621;">${escapeHTML(enquiryId)}</strong>
                        </div>
                        <div style="background: rgba(34,197,94,0.08); border-left: 4px solid #22c55e; padding: 14px; border-radius: 6px; text-align: left; margin-bottom: 16px; font-size: 0.96rem; line-height: 1.6; color: #15803d; font-weight: 600;">
                            Thank you! Your request has been received. Our team will review your request and contact you shortly.
                        </div>
                    `;
                }

                if (whatsAppBtn) {
                    const waText = encodeURIComponent(`Hello Starline Adventures,\n\nI just requested an unlisted activity [ID: ${enquiryId}] on your website:\n- Name: ${name}\n- Phone: ${phone}${email ? '\n- Email: ' + email : ''}\n- Requested Activity: ${activity}\n- Details: ${details}`);
                    whatsAppBtn.href = `https://wa.me/919424904000?text=${waText}`;
                }

                form.reset();
            })
            .catch(err => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Request &rarr;';
                }
                if (status) {
                    status.textContent = `❌ ${err.message || 'Unable to submit request. Please try again.'}`;
                    status.className = 'quote-modal-status error';
                    status.style.display = 'block';
                }
            });
        });
    }
}

// Window global exports
window.openRequirementModal = openRequirementModal;
window.closeRequirementModal = closeRequirementModal;
window.openAskActivityModal = openAskActivityModal;
window.closeAskActivityModal = closeAskActivityModal;

// Global click listener to open Modals
document.addEventListener('click', function(e) {
    // 1. "Tell Us Your Requirement" trigger
    const reqTrigger = e.target.closest('.btn-tell-requirement, [data-open-requirement-modal]');
    if (reqTrigger) {
        if (reqTrigger.type === 'submit' && !reqTrigger.classList.contains('btn-tell-requirement')) {
            return;
        }
        e.preventDefault();
        openRequirementModal();
        return;
    }

    // 2. "Ask for Another Activity" trigger
    const askTrigger = e.target.closest('.btn-ask-activity, [data-open-ask-modal]');
    if (askTrigger) {
        if (askTrigger.type === 'submit' && !askTrigger.classList.contains('btn-ask-activity')) {
            return;
        }
        e.preventDefault();
        openAskActivityModal();
        return;
    }

    // 3. General Quote triggers
    const quoteTrigger = e.target.closest(
        '.nav-cta-btn, .hero-quote-btn, .btn-product-enquire, .btn-footer-quote, .open-quote-modal, .btn-quote, [data-open-quote-modal], #productModalEnquireBtn'
    );

    if (quoteTrigger) {
        // Skip submit buttons inside other active forms
        if (quoteTrigger.type === 'submit' && !quoteTrigger.classList.contains('open-quote-modal')) {
            return;
        }

        e.preventDefault();
        
        let product = quoteTrigger.getAttribute('data-product') || '';
        if (!product || product === 'Footer Quote Request') {
            const card = quoteTrigger.closest('.product-item-card, .product-card');
            if (card) {
                product = card.querySelector('.product-item-title, h3')?.textContent.trim() || '';
            } else if (window.location.pathname.includes('/product/')) {
                product = document.querySelector('h1')?.textContent.trim() || '';
            }
        }

        openQuoteModal(product);
        return;
    }

    // Check for any anchor or button with text matching quote variations
    const buttonOrLink = e.target.closest('a, button');
    if (buttonOrLink && !buttonOrLink.closest('#quoteModal') && !buttonOrLink.closest('#requirementModal') && !buttonOrLink.closest('#askActivityModal')) {
        const href = buttonOrLink.getAttribute('href') || '';
        if (href.startsWith('tel:') || href.startsWith('mailto:')) {
            return;
        }

        const rawText = buttonOrLink.textContent.trim().toLowerCase();
        const text = rawText.replace(/[→\s]+$/, '');

        if (text === 'tell us your requirement' || text.startsWith('tell us your requirement')) {
            e.preventDefault();
            openRequirementModal();
            return;
        }

        if (text === 'ask for another activity' || text.startsWith('ask for another activity')) {
            e.preventDefault();
            openAskActivityModal();
            return;
        }

        if (
            text === 'get a quote' ||
            text === 'request a quote' ||
            text === 'request quote' ||
            text === 'get quote' ||
            text === 'get a project quote' ||
            text === 'enquire now' ||
            text === 'enquire about this product' ||
            text.startsWith('get a quote') ||
            text.startsWith('request a quote') ||
            text.includes('price & project quote')
        ) {
            e.preventDefault();
            let product = buttonOrLink.getAttribute('data-product') || '';
            if (!product || product === 'Footer Quote Request') {
                const card = buttonOrLink.closest('.product-item-card, .product-card');
                if (card) {
                    product = card.querySelector('.product-item-title, h3')?.textContent.trim() || '';
                } else if (window.location.pathname.includes('/product/')) {
                    product = document.querySelector('h1')?.textContent.trim() || '';
                }
            }
            openQuoteModal(product);
        }
    }
});

// Close all modals on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const reqModal = document.getElementById('requirementModal');
        if (reqModal && reqModal.classList.contains('active')) {
            closeRequirementModal();
        }
        const askModal = document.getElementById('askActivityModal');
        if (askModal && askModal.classList.contains('active')) {
            closeAskActivityModal();
        }
        const quoteModal = document.getElementById('quoteModal');
        if (quoteModal && quoteModal.classList.contains('active')) {
            closeQuoteModal();
        }
    }
});

// Initialize modals on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createQuoteModal();
        createRequirementModal();
        createAskActivityModal();
        initTestimonialsCarousel();
        initContactForm();
    });
} else {
    createQuoteModal();
    createRequirementModal();
    createAskActivityModal();
    initTestimonialsCarousel();
    initContactForm();
}

// ==========================================
// CONTACT PAGE ENQUIRY FORM HANDLER
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactEnquiryForm');
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    // Auto-detect product internally from URL if provided (e.g., ?product=Zip%20Line)
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product') || urlParams.get('equipment') || urlParams.get('activity');
    const internalProduct = productParam || detectProductFromUrl(window.location.href);

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Anti-spam honeypot check
        const hp = form.querySelector('[name="website_hp"]');
        if (hp && hp.value) {
            console.warn('Spam submission detected.');
            return;
        }

        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const phoneInput = document.getElementById('contactPhone');
        const messageInput = document.getElementById('contactMessage');
        const submitBtn = document.getElementById('contactSubmitBtn');
        const statusDiv = document.getElementById('contactFormStatus');

        // Reset errors
        form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('has-error'));
        if (statusDiv) {
            statusDiv.textContent = '';
            statusDiv.className = 'form-status';
            statusDiv.style.display = 'none';
        }

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        let isValid = true;
        let firstInvalidField = null;

        function setError(fieldInput, errorSpanId, msg) {
            isValid = false;
            if (fieldInput) {
                fieldInput.classList.add('has-error');
                if (!firstInvalidField) firstInvalidField = fieldInput;
            }
            const errorSpan = document.getElementById(errorSpanId);
            if (errorSpan) {
                errorSpan.textContent = msg;
            }
        }

        // 1. Validate Name (Required)
        if (!name) {
            setError(nameInput, 'error-contactName', 'Please enter your full name.');
        }

        // 2. Validate Email (Required)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError(emailInput, 'error-contactEmail', 'Please enter a valid email address.');
        }

        // 3. Validate Phone (Required)
        const phoneClean = phone.replace(/[^\d+]/g, '');
        if (!phone || phoneClean.length < 8) {
            setError(phoneInput, 'error-contactPhone', 'Please enter a valid phone number (minimum 8 digits).');
        }

        // 4. Validate Message (Required)
        if (!message) {
            setError(messageInput, 'error-contactMessage', 'Please provide details about your project requirements.');
        }

        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        // Loading state & prevent double submission
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';
        }

        if (statusDiv) {
            statusDiv.textContent = 'Submitting your quote request...';
            statusDiv.className = 'form-status loading';
            statusDiv.style.display = 'block';
        }

        const payload = {
            name,
            email,
            phone,
            message,
            company: 'N/A',
            location: 'Not specified',
            product: internalProduct,
            formType: 'Contact Form'
        };

        const submitContactForm = async () => {
            // Direct to Firebase Firestore via Modular SDK (pure static hosting compatible)
            if (typeof window.StarlineFirebase === 'undefined' || typeof window.StarlineFirebase.saveEnquiry !== 'function') {
                try {
                    await import('/js/firebase-init.js');
                } catch (impErr) {}
            }

            if (typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                return await window.StarlineFirebase.saveEnquiry(payload);
            }

            throw new Error('Firebase Firestore service is unavailable. Please check your internet connection and try again.');
        };

        submitContactForm()
        .then(data => {
            const enquiryId = data.enquiryId || data.id || generateStarlineEnquiryId();
            if (statusDiv) {
                const waText = encodeURIComponent(`Hello Starline Adventures, I am interested in your adventure rides/equipment. I would like to discuss a project [Enquiry ID: ${enquiryId}]`);
                statusDiv.innerHTML = `
                    <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 16px; text-align: left; color: #166534; font-size: 0.95rem; line-height: 1.6;">
                        <p style="margin: 0 0 10px; font-weight: 700; color: #14532d; font-size: 1.05rem;">
                            ✓ Thank you for choosing Starline Adventures. We have received your enquiry and our team will get in touch with you shortly.
                        </p>
                        <p style="margin: 0 0 14px; font-size: 0.88rem; color: #15803d;">
                            Enquiry Reference ID: <strong style="color: #0f172a; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${enquiryId}</strong>
                        </p>
                        <a href="https://wa.me/919424904000?text=${waText}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-weight: 700; font-size: 0.88rem; box-shadow: 0 2px 8px rgba(37,211,102,0.3);">
                            💬 Connect Directly on WhatsApp
                        </a>
                    </div>
                `;
                statusDiv.className = 'form-status success';
                statusDiv.style.display = 'block';
            }

            if (typeof showEnquirySuccessModal === 'function') {
                showEnquirySuccessModal({
                    id: enquiryId,
                    name,
                    email,
                    phone,
                    company,
                    location,
                    product: product || 'General Adventure Project Enquiry',
                    message,
                    emailSent: data.emailSent,
                    emailError: data.emailError,
                    customerMessage: data.customerMessage || "Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you."
                });
            }

            form.reset();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Request a Quote';
            }
        })
        .catch(err => {
            console.error('Contact form submission error:', err);
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 8px; padding: 14px; text-align: left; color: #991b1b; font-size: 0.92rem; line-height: 1.5;">
                        We couldn't submit your enquiry right now. Please try again or contact us directly by phone or WhatsApp.
                    </div>
                `;
                statusDiv.className = 'form-status error';
                statusDiv.style.display = 'block';
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Request a Quote';
            }
        });
    });
}

// ==========================================
// TESTIMONIAL CAROUSEL HANDLER
// ==========================================
function initTestimonialsCarousel() {
    const carousels = document.querySelectorAll('.testimonial-carousel-container');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.testimonial-carousel-track');
        const cards = carousel.querySelectorAll('.testimonial-card');
        const prevBtn = carousel.querySelector('.testimonial-nav-btn.prev-btn');
        const nextBtn = carousel.querySelector('.testimonial-nav-btn.next-btn');
        const dotsContainer = carousel.querySelector('.testimonial-dots');

        if (!track || !cards.length) return;

        let currentIndex = 0;
        let autoplayTimer = null;
        let visibleCards = 1;

        function getVisibleCardsCount() {
            const w = window.innerWidth;
            if (w >= 1024) return 3;
            if (w >= 640) return 2;
            return 1;
        }

        function getMaxIndex() {
            return Math.max(0, cards.length - visibleCards);
        }

        function updateCarousel() {
            visibleCards = getVisibleCardsCount();
            const maxIndex = getMaxIndex();

            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }

            const wrapper = carousel.querySelector('.testimonial-carousel-track-wrapper');
            if (!wrapper) return;
            const containerWidth = wrapper.clientWidth;
            const gap = 0; // gap is handled by testimonial-card padding (0 12px)

            const cardWidth = containerWidth / visibleCards;

            cards.forEach(card => {
                card.style.width = `${cardWidth}px`;
                card.style.flex = `0 0 ${cardWidth}px`;
            });

            const moveX = currentIndex * cardWidth;
            track.style.transform = `translateX(-${moveX}px)`;

            // Render Dots
            if (dotsContainer) {
                dotsContainer.innerHTML = '';
                const totalDots = maxIndex + 1;
                for (let i = 0; i < totalDots; i++) {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = `testimonial-dot${i === currentIndex ? ' active' : ''}`;
                    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                    dot.addEventListener('click', () => {
                        currentIndex = i;
                        updateCarousel();
                        resetAutoplay();
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            // Enable/Disable buttons
            if (prevBtn) {
                prevBtn.disabled = cards.length <= visibleCards;
                prevBtn.style.opacity = prevBtn.disabled ? '0.4' : '1';
                prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
            }
            if (nextBtn) {
                nextBtn.disabled = cards.length <= visibleCards;
                nextBtn.style.opacity = nextBtn.disabled ? '0.4' : '1';
                nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
            }
        }

        function goNext() {
            const maxIndex = getMaxIndex();
            if (currentIndex >= maxIndex) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            updateCarousel();
        }

        function goPrev() {
            const maxIndex = getMaxIndex();
            if (currentIndex <= 0) {
                currentIndex = maxIndex;
            } else {
                currentIndex--;
            }
            updateCarousel();
        }

        function startAutoplay() {
            stopAutoplay();
            if (cards.length > visibleCards) {
                autoplayTimer = setInterval(goNext, 5000);
            }
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goPrev();
                resetAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goNext();
                resetAutoplay();
            });
        }

        // Mouse hover & focus pause
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        carousel.addEventListener('focusin', stopAutoplay);
        carousel.addEventListener('focusout', startAutoplay);

        // Mobile Touch Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length) {
                touchStartX = e.touches[0].clientX;
            }
            stopAutoplay();
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length) {
                touchEndX = e.changedTouches[0].clientX;
                const diffX = touchEndX - touchStartX;
                if (Math.abs(diffX) > 40) {
                    if (diffX < 0) {
                        goNext();
                    } else {
                        goPrev();
                    }
                }
            }
            startAutoplay();
        }, { passive: true });

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                goPrev();
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                goNext();
                resetAutoplay();
            }
        });

        // Window resize debounced update
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCarousel, 100);
        });

        // Initial setup
        updateCarousel();
        startAutoplay();
    });
}

// Expose globally
window.openQuoteModal = openQuoteModal;
window.closeQuoteModal = closeQuoteModal;

/* ============================================================
   LEAD CAPTURE MODAL / ENQUIRY POPUP (STARLINE ADVENTURES)
   - Opened ONLY via explicit user interaction (e.g. clicking buttons)
   - All automatic popup triggers (onload, setTimeout, scroll, exit-intent) are disabled
   - Fields: Name*, Email (optional), Phone Number*, Submit button
   - Clearly visible × close button in top-right corner
   - Closes when clicking × or outside the card (stops bubbling inside)
   - Saves lead to existing Firebase / /api/enquiry backend
   ============================================================ */
(function initLeadCaptureModule() {
    const STORAGE_KEY = 'starline_lead_popup_closed';
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Lead Capture Popup localStorage logic
    function isVisitorEligible() {
        if (typeof window === 'undefined') return false;
        if (window.location.pathname.includes('thank-you')) return false;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return true;

            // Direct string indicators
            if (raw === 'true' || raw === 'closed' || raw === 'dismissed' || raw === '1') {
                return false;
            }

            let expiresAt = null;
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    expiresAt = parsed.expiresAt;
                }
            } catch (e) {
                const num = Number(raw);
                if (!isNaN(num) && num > 0) expiresAt = num;
            }

            if (!expiresAt) return false;
            // Return true only if the suppression expiry time has passed
            return Date.now() > expiresAt;
        } catch (err) {
            return true;
        }
    }

    function recordPopupAction(actionType) {
        try {
            // After successful submission: 7 days. After clicking × or backdrop close: 24 hours.
            const duration = actionType === 'submitted' ? SEVEN_DAYS_MS : TWENTY_FOUR_HOURS_MS;
            const data = JSON.stringify({
                action: actionType, // 'closed' or 'submitted'
                closedAt: Date.now(),
                expiresAt: Date.now() + duration
            });
            localStorage.setItem(STORAGE_KEY, data);
        } catch (err) {}
    }

    function createLeadCaptureModal() {
        let existing = document.getElementById('leadCaptureModal');
        if (existing) {
            if (existing.parentElement !== document.body) {
                document.body.appendChild(existing);
            }
            bindModalEvents(existing);
            return existing;
        }

        const modal = document.createElement('div');
        modal.id = 'leadCaptureModal';
        modal.className = 'lead-capture-modal';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'leadCaptureTitle');
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="lead-capture-card" role="document">
                <button type="button" class="lead-capture-close" id="leadCaptureClose" aria-label="Close popup" title="Close popup">&times;</button>
                
                <div class="lead-capture-content" id="leadCaptureFormContainer">
                    <h2 id="leadCaptureTitle" class="lead-capture-title">Let's Connect</h2>

                    <form id="leadCaptureForm" class="lead-capture-form" novalidate>
                        <div class="lead-capture-group">
                            <label for="leadCaptureName" class="lead-capture-label">
                                Name <span class="required" aria-hidden="true">*</span>
                            </label>
                            <input type="text"
                                   id="leadCaptureName"
                                   name="name"
                                   class="lead-capture-input"
                                   placeholder="Your Full Name"
                                   required
                                   minlength="2"
                                   maxlength="100"
                                   autocomplete="name">
                            <div class="lead-field-error" id="leadCaptureNameError" role="alert" aria-live="polite"></div>
                        </div>

                        <div class="lead-capture-group">
                            <label for="leadCaptureEmail" class="lead-capture-label">Email</label>
                            <input type="email"
                                   id="leadCaptureEmail"
                                   name="email"
                                   class="lead-capture-input"
                                   placeholder="name@example.com"
                                   maxlength="120"
                                   autocomplete="email">
                            <div class="lead-field-error" id="leadCaptureEmailError" role="alert" aria-live="polite"></div>
                        </div>

                        <div class="lead-capture-group">
                            <label for="leadCapturePhone" class="lead-capture-label">
                                Phone Number <span class="required" aria-hidden="true">*</span>
                            </label>
                            <input type="tel"
                                   id="leadCapturePhone"
                                   name="phone"
                                   class="lead-capture-input"
                                   placeholder="+91 94249 04000"
                                   required
                                   minlength="8"
                                   maxlength="25"
                                   autocomplete="tel">
                            <div class="lead-field-error" id="leadCapturePhoneError" role="alert" aria-live="polite"></div>
                        </div>

                        <button type="submit" id="leadCaptureSubmitBtn" class="lead-capture-submit">
                            <span class="lead-btn-text">Submit</span>
                            <span class="lead-btn-loader" style="display: none;">
                                <span class="lead-spinner" aria-hidden="true"></span> Submitting...
                            </span>
                        </button>
                    </form>
                </div>

                <div class="lead-capture-success" id="leadCaptureSuccessContainer" style="display: none; text-align: center; padding: 20px 8px;">
                    <div class="lead-success-icon-wrap" aria-hidden="true" style="width: 56px; height: 56px; border-radius: 50%; background: #ecfdf5; color: #10b981; border: 2px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px;">&#10003;</div>
                    <h3 class="lead-success-title" style="color: #0f172a; font-size: 1.35rem; font-weight: 800; margin: 0 0 10px;">Thank you!</h3>
                    <p class="lead-success-message" style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin: 0 0 20px;">Thank you! We have received your details. Our team will contact you shortly.</p>
                    <div class="lead-success-actions">
                        <button type="button" class="lead-success-close-btn" id="leadCaptureSuccessDoneBtn" style="background: #0f172a; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        bindModalEvents(modal);
        return modal;
    }

    function bindModalEvents(modal) {
        if (!modal || modal.dataset.eventsBound === 'true') return;
        modal.dataset.eventsBound = 'true';

        const closeBtn = modal.querySelector('#leadCaptureClose');
        const card = modal.querySelector('.lead-capture-card');
        const successDoneBtn = modal.querySelector('#leadCaptureSuccessDoneBtn');
        const form = modal.querySelector('#leadCaptureForm');

        const nameInput = modal.querySelector('#leadCaptureName');
        const emailInput = modal.querySelector('#leadCaptureEmail');
        const phoneInput = modal.querySelector('#leadCapturePhone');

        const nameError = modal.querySelector('#leadCaptureNameError');
        const emailError = modal.querySelector('#leadCaptureEmailError');
        const phoneError = modal.querySelector('#leadCapturePhoneError');

        // Clear error states on input
        nameInput?.addEventListener('input', () => {
            nameInput.classList.remove('has-error');
            if (nameError) { nameError.textContent = ''; nameError.classList.remove('visible'); }
        });

        emailInput?.addEventListener('input', () => {
            emailInput.classList.remove('has-error');
            if (emailError) { emailError.textContent = ''; emailError.classList.remove('visible'); }
        });

        phoneInput?.addEventListener('input', () => {
            phoneInput.classList.remove('has-error');
            if (phoneError) { phoneError.textContent = ''; phoneError.classList.remove('visible'); }
        });

        // 1. × button -> Close popup
        closeBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeLeadCapturePopup('closed');
        });

        // 2. Click outside card (on modal backdrop) -> Close popup
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.preventDefault();
                closeLeadCapturePopup('closed');
            }
        });

        // 3. Click inside card -> DO NOT close popup
        card?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 4. Escape key -> Close popup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (modal.classList.contains('is-open') || modal.classList.contains('active') || modal.style.display === 'flex')) {
                closeLeadCapturePopup('closed');
            }
        });

        // 5. Success done button -> Close popup
        successDoneBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            closeLeadCapturePopup('submitted');
        });

        // 6. Form submission handler
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal = (nameInput?.value || '').trim();
            const emailVal = (emailInput?.value || '').trim();
            const phoneVal = (phoneInput?.value || '').trim();

            let isValid = true;

            // Name validation (required, minimum 2 characters)
            if (!nameVal || nameVal.length < 2) {
                isValid = false;
                nameInput?.classList.add('has-error');
                if (nameError) {
                    nameError.textContent = 'Please enter your name (minimum 2 characters).';
                    nameError.classList.add('visible');
                }
            } else if (nameVal.length > 100) {
                isValid = false;
                nameInput?.classList.add('has-error');
                if (nameError) {
                    nameError.textContent = 'Name cannot exceed 100 characters.';
                    nameError.classList.add('visible');
                }
            }

            // Email validation (optional, only validated if entered)
            const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
            if (emailVal) {
                if (!emailPattern.test(emailVal) || emailVal.length < 5 || emailVal.length > 120) {
                    isValid = false;
                    emailInput?.classList.add('has-error');
                    if (emailError) {
                        emailError.textContent = 'Please enter a valid email address.';
                        emailError.classList.add('visible');
                    }
                }
            }

            // Phone Number validation (required, must contain a valid number with >= 8 digits)
            const cleanDigits = phoneVal.replace(/[^\d]/g, '');
            const phoneRegex = /^\+?[0-9\s\-()]{8,25}$/;
            if (!phoneVal || cleanDigits.length < 8 || !phoneRegex.test(phoneVal)) {
                isValid = false;
                phoneInput?.classList.add('has-error');
                if (phoneError) {
                    phoneError.textContent = 'Please enter a valid phone number (minimum 8 digits).';
                    phoneError.classList.add('visible');
                }
            }

            if (!isValid) {
                if (nameInput?.classList.contains('has-error')) {
                    nameInput.focus();
                } else if (emailInput?.classList.contains('has-error')) {
                    emailInput.focus();
                } else if (phoneInput?.classList.contains('has-error')) {
                    phoneInput.focus();
                }
                return;
            }

            // Valid submission - show loading
            const submitBtn = modal.querySelector('#leadCaptureSubmitBtn');
            const btnText = submitBtn?.querySelector('.lead-btn-text');
            const btnLoader = submitBtn?.querySelector('.lead-btn-loader');

            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-flex';

            const payload = {
                name: nameVal,
                email: emailVal || 'no-email@starline.customer',
                phone: phoneVal,
                leadSource: 'Website Entry Popup',
                message: 'Lead Source: Website Entry Popup',
                formType: 'Website Entry Popup',
                product: 'Website Entry Popup',
                company: 'Website Visitor',
                location: 'Website Direct',
                pageUrl: window.location.href,
                referrer: document.referrer || 'Direct Entry'
            };

            let saveSucceeded = false;

            // Submit using existing website / backend enquiry system
            try {
                const res = await fetch('/api/enquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    saveSucceeded = true;
                }
            } catch (fetchErr) {
                console.warn('[Lead Capture]: Server endpoint fetch note:', fetchErr.message);
            }

            // Secondary fallback if server endpoint is inaccessible
            if (!saveSucceeded) {
                try {
                    if (typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                        await window.StarlineFirebase.saveEnquiry(payload);
                        saveSucceeded = true;
                    }
                } catch (fbErr) {
                    console.warn('[Lead Capture]: Firebase fallback note:', fbErr.message);
                }
            }

            // Record action in localStorage with 7 days expiry
            recordPopupAction('submitted');

            // Show Confirmation View: "Thank you! We have received your details. Our team will contact you shortly."
            const formContainer = modal.querySelector('#leadCaptureFormContainer');
            const successContainer = modal.querySelector('#leadCaptureSuccessContainer');

            if (formContainer) formContainer.style.display = 'none';
            if (successContainer) successContainer.style.display = 'block';

            // Auto-dismiss smoothly after 5.5 seconds if user hasn't clicked close
            setTimeout(() => {
                const currentModal = document.getElementById('leadCaptureModal');
                if (currentModal && (currentModal.classList.contains('is-open') || currentModal.classList.contains('active') || currentModal.style.display === 'flex')) {
                    closeLeadCapturePopup('submitted');
                }
            }, 5500);
        });
    }

    function openLeadCapturePopup() {
        const modal = createLeadCaptureModal();
        if (!modal) return;

        // Reset views in case of previous submission
        const formContainer = modal.querySelector('#leadCaptureFormContainer');
        const successContainer = modal.querySelector('#leadCaptureSuccessContainer');
        const submitBtn = modal.querySelector('#leadCaptureSubmitBtn');
        const btnText = submitBtn?.querySelector('.lead-btn-text');
        const btnLoader = submitBtn?.querySelector('.lead-btn-loader');

        if (formContainer) formContainer.style.display = 'block';
        if (successContainer) successContainer.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) {
            btnText.style.display = 'inline';
            btnText.textContent = 'Submit';
        }
        if (btnLoader) btnLoader.style.display = 'none';

        // Display modal as fixed viewport overlay
        modal.style.display = 'flex';
        modal.classList.add('is-open');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        // Lock body scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.classList.add('lead-popup-open');

        // Accessible focus
        setTimeout(() => {
            const nameInput = modal.querySelector('#leadCaptureName');
            if (nameInput && document.activeElement !== nameInput) {
                nameInput.focus();
            }
        }, 150);
    }

    function closeLeadCapturePopup(actionType = 'closed') {
        const modal = document.getElementById('leadCaptureModal');
        if (!modal) return;

        modal.style.display = 'none';
        modal.classList.remove('is-open');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        // Restore body scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.classList.remove('lead-popup-open');

        recordPopupAction(actionType);
    }

    // Expose for explicit button/programmatic triggers only (no auto triggers)
    window.openLeadCapturePopup = openLeadCapturePopup;
    window.closeLeadCapturePopup = closeLeadCapturePopup;
    window.isVisitorEligible = isVisitorEligible;

    // Bind event handlers on existing static modal if present in HTML without auto-opening
    function initExistingModal() {
        const existing = document.getElementById('leadCaptureModal');
        if (existing) {
            bindModalEvents(existing);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExistingModal);
    } else {
        initExistingModal();
    }
})();
