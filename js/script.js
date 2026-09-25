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

        // Hero "Request a Quote" button triggers the existing enquiry modal if available
        document.querySelectorAll('.hero-quote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = document.getElementById('productEnquiryModal');
                if (modal && typeof openProductEnquiryModal === 'function') {
                    e.preventDefault();
                    const product = btn.getAttribute('data-product') || 'Adventure Ride Manufacturing & Installation';
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
const ENQUIRY_API_URL = (typeof STARLINE_CONFIG !== 'undefined' && STARLINE_CONFIG && STARLINE_CONFIG.enquiryApiUrl) || '/api/enquiry';

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

// Pre-fill product field from URL parameter
function preselectProductFromURL() {
    const productParam = getURLParameter('product');
    if (productParam) {
        const productSelect = document.getElementById('product');
        if (productSelect) {
            // Normalize the product name to match select options
            const productMap = {
                'zipline': 'zipline',
                'zip line': 'zipline',
                'rope': 'rope',
                'rope course': 'rope',
                'swing': 'swing',
                'giant swing': 'swing',
                'climbing': 'climbing',
                'wall climbing': 'climbing',
                'safety': 'safety',
                'safety equipment': 'safety',
                'custom': 'custom',
                'custom solution': 'custom'
            };
            const normalizedProduct = productMap[productParam.toLowerCase()] || productParam;
            productSelect.value = normalizedProduct;
            // Scroll to product field to show pre-selection
            setTimeout(() => {
                productSelect.focus();
            }, 300);
        }
    }
}

// Build a pre-filled WhatsApp click-to-chat message from the enquiry form data
function buildWhatsAppEnquiryMessage(formData) {
    const idPrefix = formData.id ? `[Enquiry ID: ${formData.id}]\n\n` : '';
    return `Hello STARLINE ADVENTURES,\n\n${idPrefix}Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany: ${formData.company || 'N/A'}\nLocation: ${formData.location}\nInterested In: ${formData.product}\n\nDetails: ${formData.message}`;
}

// Global escape HTML helper
function escapeHtmlString(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

    const enquiryId = info.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000));
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

    // Open Modal with smooth transition
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on done button for keyboard accessibility
    setTimeout(() => {
        document.getElementById('enquiryModalDoneBtn')?.focus();
    }, 120);
}

// Main form submission handler - Send to Node.js server with validation, loading state, error handling, and confirmation modal
function handleEnquiry(event) {
    event.preventDefault();
    
    const form = event.target;
    const status = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!status || !submitBtn) return;
    
    // Prevent duplicate clicks
    if (submitBtn.disabled) return;

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const companyInput = form.querySelector('#company');
    const locationInput = form.querySelector('#location');
    const productInput = form.querySelector('#product');
    const messageInput = form.querySelector('#message');

    // Collect and trim form data
    const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        company: companyInput ? companyInput.value.trim() : '',
        location: locationInput ? locationInput.value.trim() : '',
        product: productInput ? productInput.value.trim() : '',
        message: messageInput ? messageInput.value.trim() : '',
        formType: 'Contact Form'
    };
    
    // Client-side Validation
    if (!formData.name) {
        status.className = 'form-status error';
        status.textContent = '❌ Please enter your full name.';
        nameInput?.focus();
        return;
    }

    if (!formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
        status.className = 'form-status error';
        status.textContent = '❌ Please enter a valid email address (e.g. you@example.com).';
        emailInput?.focus();
        return;
    }

    if (!formData.phone || formData.phone.length < 7) {
        status.className = 'form-status error';
        status.textContent = '❌ Please enter a valid contact phone number.';
        phoneInput?.focus();
        return;
    }

    if (!formData.location) {
        status.className = 'form-status error';
        status.textContent = '❌ Please enter your project location (City, State).';
        locationInput?.focus();
        return;
    }

    if (!formData.product) {
        status.className = 'form-status error';
        status.textContent = '❌ Please select an activity or solution of interest.';
        productInput?.focus();
        return;
    }

    if (!formData.message) {
        status.className = 'form-status error';
        status.textContent = '❌ Please provide some details about your project requirements.';
        messageInput?.focus();
        return;
    }

    // Show professional loading state & prevent duplicate submissions
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Sending Enquiry...';
    status.className = 'form-status loading';
    status.textContent = '⏳ Submitting your enquiry to our adventure engineering team...';
    
    // API endpoint
    const apiUrl = (typeof STARLINE_CONFIG !== 'undefined' && STARLINE_CONFIG?.enquiryApiUrl) || '/api/enquiry';
    
    // Send to server
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(async response => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.ok === false) {
            const serverErrMsg = (data && data.error) ? data.error : `Server responded with status ${response.status}`;
            throw new Error(serverErrMsg);
        }
        return data;
    })
    .then(data => {
        // SUCCESS: Restore button and clear inline loading indicator
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Enquiry <span aria-hidden="true">&#8594;</span>';
        status.className = 'form-status';
        status.textContent = '';
        
        const enquiryId = data.enquiryId || data.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000));
        
        // Display the professional success confirmation modal popup
        showEnquirySuccessModal({
            id: enquiryId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            location: formData.location,
            product: formData.product,
            message: formData.message,
            customerMessage: data.customerMessage || "Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you."
        });

        // Reset form inputs only after verified success
        form.reset();
    })
    .catch(error => {
        console.error('Enquiry submission failure:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Enquiry <span aria-hidden="true">&#8594;</span>';
        status.className = 'form-status error';
        status.innerHTML = `❌ We could not submit your enquiry: <strong>${escapeHtmlString(error.message)}</strong>. Please check your information and try again, or contact us directly on WhatsApp/Phone.`;
    });
}

// Attach form submit listener
const enquiryForm = document.querySelector('.enquiry-form, .enquiry-form-fs');
if (enquiryForm) {
    enquiryForm.addEventListener('submit', handleEnquiry);
    // Pre-select product from URL parameter on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preselectProductFromURL);
    } else {
        preselectProductFromURL();
    }
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

// ===== BACK-TO-TOP BUTTON =====
function createBackToTopButton() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    button.setAttribute('title', 'Back to top');
    button.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(button);
    
    // Show/hide button based on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
    
    // Scroll to top smoothly
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize back-to-top button
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBackToTopButton);
} else {
    createBackToTopButton();
}

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

// ===== CURRENT PAGE HIGHLIGHT IN NAV =====
function updateNavActiveStates() {
    let currentLocation = location.pathname.split('/').pop() || 'index.html';
    if (!currentLocation || currentLocation === '') {
        currentLocation = 'index.html';
    }

    const directNavLinks = document.querySelectorAll('.nav-menu > a');
    const navDropdownButtons = document.querySelectorAll('.nav-dropdown-toggle');
    const currentHash = window.location.hash;
    
    // Check direct nav links
    directNavLinks.forEach(link => {
        if (link.classList.contains('nav-cta-btn')) return;
        const href = (link.getAttribute('href') || '').split('#')[0];
        const isMatch = href === currentLocation || 
            (currentLocation === 'index.html' && href === 'index.html');

        if (isMatch) {
            link.classList.add('active', 'current-page');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active', 'current-page');
            link.removeAttribute('aria-current');
        }
    });
    
    // Check dropdown menus for current page and highlight button + active items
    navDropdownButtons.forEach(button => {
        const dropdown = button.closest('.nav-dropdown');
        const dropdownMenu = button.nextElementSibling || dropdown?.querySelector('.nav-dropdown-menu');
        const controls = button.getAttribute('aria-controls') || '';
        const isProductsBtn = controls === 'products-navigation';
        const isPortfolioBtn = controls === 'portfolio-navigation';

        if (dropdownMenu) {
            const links = dropdownMenu.querySelectorAll('a');
            let hasActiveChild = false;

            links.forEach(link => {
                const rawHref = link.getAttribute('href') || '';
                const hrefFile = rawHref.split('#')[0] || 'index.html';
                const hrefHash = rawHref.includes('#') ? '#' + rawHref.split('#')[1] : '';

                let isMatch = false;
                if (isProductsBtn) {
                    if (currentLocation === 'products.html') {
                        if (currentHash) {
                            isMatch = (hrefHash === currentHash);
                        } else {
                            isMatch = false;
                        }
                    }
                } else if (isPortfolioBtn) {
                    isMatch = hrefFile === currentLocation || (currentLocation === 'project-details.html' && hrefFile === 'portfolio.html');
                }

                if (isMatch) {
                    link.classList.add('active', 'current-page');
                    link.setAttribute('aria-current', 'page');
                    hasActiveChild = true;
                } else {
                    link.classList.remove('active', 'current-page');
                    link.removeAttribute('aria-current');
                }
            });

            const isPageActive = (isProductsBtn && (currentLocation === 'products.html' || currentLocation === 'product-details.html')) ||
                                 (isPortfolioBtn && (currentLocation === 'portfolio.html' || currentLocation === 'project-details.html' || currentLocation === 'gallery.html'));

            if (hasActiveChild || isPageActive) {
                button.classList.add('active', 'current-page');
                dropdown?.classList.add('active');
            } else {
                button.classList.remove('active', 'current-page');
                dropdown?.classList.remove('active');
            }
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
            
            // Validate email
            if (!email || !email.includes('@')) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Disable button during submission
            button.disabled = true;
            button.textContent = 'Subscribing...';
            
            // Simulate API call (you can replace with actual API endpoint)
            setTimeout(() => {
                // Show success message
                button.textContent = '✅ Subscribed!';
                button.style.background = '#4caf50';
                
                // Reset form
                form.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                    button.style.background = '';
                }, 3000);
            }, 800);
        });
    });
});

// ===== GET A QUOTE POPUP MODAL =====
let quoteModalPreviousFocus = null;

function createQuoteModal() {
    if (document.getElementById('quoteModal')) return;

    const modalHTML = `
    <div id="quoteModal" class="quote-modal" aria-hidden="true" role="dialog" aria-labelledby="quoteModalTitle">
        <div class="quote-modal-backdrop" id="quoteModalBackdrop"></div>
        <div class="quote-modal-dialog">
            <div class="quote-modal-header">
                <span class="quote-modal-badge">Direct Factory Engineering</span>
                <h2 id="quoteModalTitle" class="quote-modal-title">Get a Project Quote</h2>
                <p class="quote-modal-subtitle">Direct manufacturer pricing, technical specs &amp; installation estimates for your adventure facility.</p>
                <button type="button" class="quote-modal-close" id="quoteModalClose" aria-label="Close quote modal">&times;</button>
            </div>

            <div class="quote-modal-body">
                <form id="quoteModalForm" class="quote-modal-form" novalidate>
                    <div class="quote-form-grid">
                        <div class="quote-field-group">
                            <label for="quoteModalName">Name <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">👤</span>
                                <input type="text" id="quoteModalName" name="name" placeholder="e.g. Rahul Sharma" required autocomplete="name">
                            </div>
                        </div>

                        <div class="quote-field-group">
                            <label for="quoteModalPhone">Phone <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">📞</span>
                                <input type="tel" id="quoteModalPhone" name="phone" placeholder="+91-94249-04000" required autocomplete="tel">
                            </div>
                        </div>

                        <div class="quote-field-group">
                            <label for="quoteModalEmail">Email <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">✉️</span>
                                <input type="email" id="quoteModalEmail" name="email" placeholder="rahul@example.com" required autocomplete="email">
                            </div>
                        </div>

                        <div class="quote-field-group">
                            <label for="quoteModalLocation">Project Location <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">📍</span>
                                <input type="text" id="quoteModalLocation" name="location" placeholder="City, State (e.g. Pune, MH)" required>
                            </div>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="quoteModalProduct">Product / Activity <span class="quote-required">*</span></label>
                            <div class="quote-input-wrap">
                                <span class="quote-input-icon" aria-hidden="true">🎯</span>
                                <select id="quoteModalProduct" name="product" required>
                                    <option value="" disabled selected>Select Requirement *</option>
                                    <option value="Adventure Rides & Equipment">Adventure Rides &amp; Equipment</option>
                                    <option value="Turnkey Adventure Park Setup">Turnkey Adventure Park Setup</option>
                                </select>
                            </div>
                        </div>

                        <div class="quote-field-group full-width">
                            <label for="quoteModalMessage">Message</label>
                            <textarea id="quoteModalMessage" name="message" rows="3" placeholder="Tell us about your site dimensions, target audience, preferred timeline, or specific requirements..."></textarea>
                        </div>
                    </div>

                    <div class="quote-modal-trust">
                        <span>⚡ Response within 24 Hours</span>
                        <span>🛡️ Certified Safety Standards</span>
                        <span>🏭 Factory Direct Pricing</span>
                    </div>

                    <button type="submit" class="quote-submit-btn" id="quoteSubmitBtn">
                        REQUEST A QUOTE <span aria-hidden="true">&rarr;</span>
                    </button>

                    <div class="quote-modal-status" id="quoteModalStatus" role="alert" aria-live="polite"></div>
                </form>

                <div class="quote-success-view" id="quoteSuccessView">
                    <div class="quote-success-icon" aria-hidden="true">✓</div>
                    <h3 class="quote-success-title">Quote Request Received!</h3>
                    <p class="quote-success-desc" id="quoteSuccessDesc">
                        Thank you! Your quote request has been routed directly to our adventure engineering team. We will get back to you with custom drawings, specifications, and pricing within 24 hours.
                    </p>
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

    // Reset views
    const form = document.getElementById('quoteModalForm');
    const successView = document.getElementById('quoteSuccessView');
    const status = document.getElementById('quoteModalStatus');
    const submitBtn = document.getElementById('quoteSubmitBtn');

    if (form) form.style.display = 'block';
    if (successView) successView.style.display = 'none';
    if (status) {
        status.textContent = '';
        status.className = 'quote-modal-status';
        status.style.display = 'none';
    }
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'REQUEST A QUOTE <span aria-hidden="true">&rarr;</span>';
    }

    // Preselect product if specified
    if (productName) {
        const productSelect = document.getElementById('quoteModalProduct');
        if (productSelect) {
            const cleanTarget = productName.toLowerCase();
            let matched = false;
            for (let i = 0; i < productSelect.options.length; i++) {
                const optText = productSelect.options[i].text.toLowerCase();
                const optVal = productSelect.options[i].value.toLowerCase();
                if (optText.includes(cleanTarget) || cleanTarget.includes(optVal) || optVal.includes(cleanTarget)) {
                    productSelect.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // If not in standard list, set to Custom Engineering
                productSelect.value = "Custom Engineering / Other";
            }
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
    }, 100);
}

function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (quoteModalPreviousFocus && typeof quoteModalPreviousFocus.focus === 'function') {
        quoteModalPreviousFocus.focus();
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

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('quoteModalName');
            const phoneInput = document.getElementById('quoteModalPhone');
            const emailInput = document.getElementById('quoteModalEmail');
            const locationInput = document.getElementById('quoteModalLocation');
            const productSelect = document.getElementById('quoteModalProduct');
            const messageInput = document.getElementById('quoteModalMessage');
            const status = document.getElementById('quoteModalStatus');
            const submitBtn = document.getElementById('quoteSubmitBtn');
            const successView = document.getElementById('quoteSuccessView');
            const successDesc = document.getElementById('quoteSuccessDesc');
            const whatsAppBtn = document.getElementById('quoteSuccessWhatsApp');

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const location = locationInput ? locationInput.value.trim() : '';
            const product = productSelect ? productSelect.value.trim() : '';
            let message = messageInput ? messageInput.value.trim() : '';

            // Validation
            if (!name) {
                showModalStatus('Please enter your full name.', 'error');
                nameInput?.focus();
                return;
            }
            if (!phone || phone.length < 7) {
                showModalStatus('Please enter a valid phone number.', 'error');
                phoneInput?.focus();
                return;
            }
            if (!email || !email.includes('@') || !email.includes('.')) {
                showModalStatus('Please enter a valid email address.', 'error');
                emailInput?.focus();
                return;
            }
            if (!location) {
                showModalStatus('Please specify your project location (city, state).', 'error');
                locationInput?.focus();
                return;
            }
            if (!product) {
                showModalStatus('Please select a product or activity.', 'error');
                productSelect?.focus();
                return;
            }

            // Ensure message is not blank so backend /api/enquiry validation passes
            if (!message) {
                message = `Project quote request for ${product} at ${location}.`;
            }

            showModalStatus('Submitting your quote request...', 'loading');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'SENDING REQUEST...';
            }

            const payload = {
                name,
                phone,
                email,
                company: 'N/A',
                location,
                product,
                message,
                formType: 'Quick RFQ'
            };

            const apiUrl = (typeof STARLINE_CONFIG !== 'undefined' && STARLINE_CONFIG?.enquiryApiUrl) || '/api/enquiry';

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(async res => {
                const data = await res.json().catch(() => null);
                if (!res.ok || !data || data.ok === false) {
                    throw new Error((data && data.error) || 'Failed to submit quote request.');
                }
                return data;
            })
            .then(data => {
                const enquiryId = data.enquiryId || data.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000));
                
                // Show success view
                form.style.display = 'none';
                successView.style.display = 'block';

                if (successDesc) {
                    successDesc.innerHTML = `
                        <div style="background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 6px; margin-bottom: 14px; font-family: monospace; font-size: 0.95rem;">
                            Enquiry ID: <strong style="color: #F47621;">${escapeHTML(enquiryId)}</strong>
                        </div>
                        <div style="background: rgba(244,118,33,0.06); border-left: 4px solid #F47621; padding: 14px; border-radius: 6px; text-align: left; margin-bottom: 16px; font-size: 0.92rem; line-height: 1.6; color: #334155;">
                            Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.
                        </div>
                    `;
                }

                if (whatsAppBtn) {
                    const waText = encodeURIComponent(`Hello STARLINE ADVENTURES,\n\nI just requested a project quote [Enquiry ID: ${enquiryId}] on your website:\n- Name: ${name}\n- Phone: ${phone}\n- Email: ${email}\n- Location: ${location}\n- Product/Activity: ${product}\n- Message: ${message}`);
                    whatsAppBtn.href = `https://wa.me/919424904000?text=${waText}`;
                }

                form.reset();
            })
            .catch(err => {
                console.error('Quote submission error:', err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'SUBMIT QUOTE REQUEST <span aria-hidden="true">&#8594;</span>';
                }
                showModalStatus(`❌ Submission failed: ${escapeHTML(err.message)}. Please check your details and try again.`, 'error');
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

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

// Global click listener to open Quote Modal on any "Get a Quote" trigger
document.addEventListener('click', function(e) {
    // Check if clicked element or its parent is a quote trigger
    const trigger = e.target.closest('.nav-cta-btn, .open-quote-modal, .btn-quote, [data-open-quote-modal]');
    if (trigger) {
        e.preventDefault();
        const product = trigger.getAttribute('data-product') || '';
        openQuoteModal(product);
        return;
    }

    // Check for any anchor or button with text matching quote variations
    const buttonOrLink = e.target.closest('a, button');
    if (buttonOrLink && !buttonOrLink.closest('.quote-modal')) {
        // Skip form submit buttons
        if (buttonOrLink.type === 'submit' && !buttonOrLink.classList.contains('open-quote-modal')) return;

        const text = buttonOrLink.textContent.trim().toLowerCase();
        if (text === 'get a quote' || text === 'get quote' || text.startsWith('get a quote') || text === 'request a quote →' || text === 'request a quote') {
            e.preventDefault();
            const product = buttonOrLink.getAttribute('data-product') || '';
            openQuoteModal(product);
        }
    }
});

// Close quote modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('quoteModal');
        if (modal && modal.classList.contains('active')) {
            closeQuoteModal();
        }
    }
});

// Initialize quote modal and contact form on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createQuoteModal();
        initTestimonialsCarousel();
        initContactForm();
    });
} else {
    createQuoteModal();
    initTestimonialsCarousel();
    initContactForm();
}

// ==========================================
// CONTACT PAGE ENQUIRY FORM HANDLER
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactEnquiryForm');
    if (!form) return;

    // Auto-select product from URL if provided (e.g., ?product=Zip%20Line)
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product') || urlParams.get('equipment') || urlParams.get('activity');
    if (productParam) {
        const productSelect = document.getElementById('contactProduct');
        if (productSelect) {
            const cleanTarget = productParam.toLowerCase().trim();
            let matched = false;
            for (let i = 0; i < productSelect.options.length; i++) {
                const optText = productSelect.options[i].text.toLowerCase();
                const optVal = productSelect.options[i].value.toLowerCase();
                if (optText.includes(cleanTarget) || cleanTarget.includes(optVal) || optVal.includes(cleanTarget)) {
                    productSelect.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                const customOpt = new Option(productParam, productParam, true, true);
                productSelect.add(customOpt, 1);
            }
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Anti-spam honeypot check
        const hp = form.querySelector('[name="website_hp"]');
        if (hp && hp.value) {
            console.warn('Spam submission detected.');
            return;
        }

        const nameInput = document.getElementById('contactName');
        const phoneInput = document.getElementById('contactPhone');
        const emailInput = document.getElementById('contactEmail');
        const companyInput = document.getElementById('contactCompany');
        const locationInput = document.getElementById('contactLocation');
        const productSelect = document.getElementById('contactProduct');
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
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const company = companyInput ? companyInput.value.trim() : '';
        const location = locationInput ? locationInput.value.trim() : '';
        const product = productSelect ? productSelect.value.trim() : '';
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

        // Validate Full Name (Required)
        if (!name) {
            setError(nameInput, 'error-contactName', 'Please enter your full name.');
        }

        // Validate Phone Number (Required)
        const phoneClean = phone.replace(/[^\d+]/g, '');
        if (!phone || phoneClean.length < 8) {
            setError(phoneInput, 'error-contactPhone', 'Please enter a valid phone number (minimum 8 digits).');
        }

        // Validate Email Address (Required)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError(emailInput, 'error-contactEmail', 'Please enter a valid email address.');
        }

        // Validate Project / Company Name (Required)
        if (!company) {
            setError(companyInput, 'error-contactCompany', 'Please enter your project or company name.');
        }

        // Validate Project Location (Required)
        if (!location) {
            setError(locationInput, 'error-contactLocation', 'Please enter your project location (city, state).');
        }

        // Validate Requirement / Message (Required)
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
            submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> SUBMITTING ENQUIRY...';
        }

        if (statusDiv) {
            statusDiv.textContent = 'Submitting your enquiry...';
            statusDiv.className = 'form-status loading';
            statusDiv.style.display = 'block';
        }

        const payload = {
            name,
            phone,
            email,
            company,
            location,
            product: product || 'General Adventure Project Enquiry',
            message,
            formType: 'Contact Form'
        };

        const apiUrl = (typeof STARLINE_CONFIG !== 'undefined' && STARLINE_CONFIG?.enquiryApiUrl) || '/api/enquiry';

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json().catch(() => null);
            if (!res.ok || !data || data.ok === false) {
                throw new Error('Submission failed');
            }
            return data;
        })
        .then(data => {
            const enquiryId = data.enquiryId || data.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000));
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