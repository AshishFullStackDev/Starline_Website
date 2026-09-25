/**
 * STARLINE ADVENTURES - PRODUCT DETAILS PAGE SCRIPT
 * Dynamically loads and renders product specifications, images, and handles quote enquiry.
 */

function initProductDetailsApp() {
    initProductDetailsPage();
    initDetailEnquiryForm();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductDetailsApp);
} else {
    initProductDetailsApp();
}

function initProductDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || 'rocket-ejection';

    // Find product in catalog
    const productList = typeof STARLINE_PRODUCTS !== 'undefined' ? STARLINE_PRODUCTS : [];
    let product = productList.find(p => p.id === productId || p.id.toLowerCase() === productId.toLowerCase());
    if (!product && typeof window !== 'undefined' && typeof window.normalizeActivityKey === 'function') {
        const canonical = window.normalizeActivityKey(productId);
        product = productList.find(p => p.id.toLowerCase() === canonical.toLowerCase());
    }

    if (!product && productList.length > 0) {
        product = productList[0];
    }

    if (!product) return;

    // Update document title and headers
    document.title = `${product.name} - Technical Specifications | STARLINE ADVENTURES`;
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = `${product.name} - Technical Specifications | STARLINE ADVENTURES`;

    const breadcrumbName = document.getElementById('breadcrumbProductName');
    if (breadcrumbName) breadcrumbName.textContent = product.name;

    const titleEl = document.getElementById('productDetailTitle');
    if (titleEl) titleEl.textContent = product.name;

    const taglineEl = document.getElementById('productDetailTagline');
    if (taglineEl) taglineEl.textContent = product.shortDesc;

    const overviewEl = document.getElementById('productOverviewText');
    if (overviewEl) overviewEl.textContent = product.fullDesc || product.shortDesc;

    // Render Product Image or Clean Empty Placeholder
    const imgContainer = document.getElementById('productImageContainer');
    if (imgContainer) {
        if (typeof renderProductDetailImage === 'function') {
            imgContainer.innerHTML = renderProductDetailImage(product);
        } else {
            const imgUrl = (typeof getProductImage === 'function') ? getProductImage(product) : product.image;
            if (imgUrl && imgUrl.trim() !== "") {
                imgContainer.innerHTML = `
                    <img src="${imgUrl}"
                         alt="${escapeHtml(product.name)} - Starline Adventures"
                         loading="eager"
                         onerror="this.onerror=null; this.parentElement.innerHTML = getEmptyPlaceholderHtml('${escapeHtml(product.name)}', true);">
                `;
            } else {
                imgContainer.innerHTML = getEmptyPlaceholderHtml(product.name, true);
            }
        }
    }

    // Populate Specifications Table
    const specsTable = document.getElementById('productSpecsTable');
    if (specsTable && product.specs && product.specs.length > 0) {
        let specsHtml = '';
        product.specs.forEach(spec => {
            specsHtml += `
                <tr>
                    <th>${escapeHtml(spec.label)}</th>
                    <td>${escapeHtml(spec.value)}</td>
                </tr>
            `;
        });
        specsTable.innerHTML = specsHtml;
    }

    // Pre-fill Sidebar Form
    const productInput = document.getElementById('detailEnquiryProduct');
    if (productInput) productInput.value = product.name;

    // WhatsApp customized link
    const waLink = document.getElementById('productWhatsAppLink');
    if (waLink) {
        const text = encodeURIComponent(`Hello STARLINE ADVENTURES, I am interested in technical details and quotation for "${product.name}".`);
        waLink.href = `https://wa.me/919424904000?text=${text}`;
    }

    // Render 3 Related/Other Products
    const relatedContainer = document.getElementById('relatedProductsGrid');
    if (relatedContainer) {
        const relatedList = productList.filter(p => p.id !== product.id).slice(0, 3);
        let relatedHtml = '';
        relatedList.forEach(rel => {
            const relImgHtml = (typeof renderProductCardImage === 'function')
                ? renderProductCardImage(rel)
                : getEmptyPlaceholderHtml(rel.name, false);

            relatedHtml += `
            <article class="product-item-card">
                <div class="product-item-img-wrap">
                    ${relImgHtml}
                </div>
                <div class="product-item-body">
                    <h3 class="product-item-title">${escapeHtml(rel.name)}</h3>
                    <p class="product-item-desc">${escapeHtml(rel.shortDesc)}</p>
                    <div class="product-item-actions">
                        <a href="product-details.html?product=${rel.id}" class="btn-product-info" style="text-decoration:none;">View Info</a>
                        <button type="button" class="btn-product-enquire" onclick="openProductEnquiryModal('${escapeHtml(rel.name)}')">Enquiry</button>
                    </div>
                </div>
            </article>
            `;
        });
        relatedContainer.innerHTML = relatedHtml;
    }
}

function getEmptyPlaceholderHtml(name, isDetailView) {
    if (typeof window !== 'undefined' && typeof window.getEmptyPlaceholderHtml === 'function') {
        return window.getEmptyPlaceholderHtml(name, isDetailView);
    }
    if (isDetailView) {
        return `
            <div class="product-empty-image-placeholder">
                <span class="product-empty-icon" aria-hidden="true">📷</span>
                <div class="product-empty-text">${escapeHtml(name)}</div>
                <div class="product-empty-subtext">Product Image Coming Soon</div>
            </div>
        `;
    }
    return `
        <div class="product-card-empty-box">
            <span class="product-card-empty-icon" aria-hidden="true">📷</span>
            <span class="product-card-empty-text">Image coming soon</span>
        </div>
    `;
}

function initDetailEnquiryForm() {
    const form = document.getElementById('sidebarProductEnquiryForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const statusEl = form.querySelector('.form-status');
        const submitBtn = form.querySelector('button[type="submit"]');

        const name = document.getElementById('detailEnquiryName')?.value.trim();
        const email = document.getElementById('detailEnquiryEmail')?.value.trim();
        const phone = document.getElementById('detailEnquiryPhone')?.value.trim();
        const location = document.getElementById('detailEnquiryLocation')?.value.trim();
        const product = document.getElementById('detailEnquiryProduct')?.value.trim() || 'Adventure Equipment';
        const message = document.getElementById('detailEnquiryMessage')?.value.trim();

        if (!name || !email || !phone || !location || !message) {
            if (statusEl) {
                statusEl.className = 'form-status error';
                statusEl.textContent = '❌ Please fill in all required fields.';
            }
            return;
        }

        if (statusEl) {
            statusEl.className = 'form-status loading';
            statusEl.textContent = '⏳ Submitting your request to our engineering team...';
        }
        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            name,
            email,
            phone,
            location,
            product,
            message,
            formType: 'Product Details Page Enquiry'
        };

        const apiUrl = (typeof STARLINE_CONFIG !== 'undefined' && STARLINE_CONFIG?.enquiryApiUrl) || '/api/enquiry';

        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success !== false) {
                form.reset();
                if (statusEl) {
                    statusEl.className = 'form-status success';
                    statusEl.textContent = `✅ Enquiry submitted! Reference ID: ${data.enquiryId || data.id || 'SA-ENQ'}. Our team will contact you shortly.`;
                }

                if (typeof showEnquirySuccessModal === 'function') {
                    showEnquirySuccessModal({
                        id: data.enquiryId || data.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000)),
                        name,
                        product,
                        location,
                        phone,
                        customerMessage: data.customerMessage || "Thank you for contacting Starline Adventures! We have received your technical specifications enquiry and will get back to you shortly."
                    });
                }
            } else {
                throw new Error(data.error || data.message || 'Submission failed.');
            }
        } catch (err) {
            console.error('Sidebar enquiry error:', err);
            if (statusEl) {
                statusEl.className = 'form-status error';
                statusEl.textContent = `❌ ${err.message || 'Submission failed. Please call or WhatsApp directly.'}`;
            }
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
