const fs = require('fs');
const path = require('path');

const report = {
    fixedFiles: [],
    details: []
};

function logFix(file, description) {
    report.details.push({ file, description });
    if (!report.fixedFiles.includes(file)) {
        report.fixedFiles.push(file);
    }
}

// -------------------------------------------------------------
// 1. FIX index.html
// -------------------------------------------------------------
{
    const file = 'index.html';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix malformed domain URL
    if (content.includes('starlineadventures.comimages/')) {
        content = content.replace(/starlineadventures\.comimages\//g, 'starlineadventures.com/images/');
        logFix(file, 'Fixed starlineadventures.comimages/ -> starlineadventures.com/images/');
    }

    // Fix truncated working image extension on line 480
    if (content.includes('src=images/general/working. ')) {
        content = content.replace('src=images/general/working. ', 'src="images/general/working.webp" ');
        logFix(file, 'Fixed truncated src=images/general/working. -> src="images/general/working.webp"');
    }

    // Quote unquoted logo tags
    content = content.replace(/src=images\/logo\/logo\.jpeg/g, 'src="images/logo/logo.jpeg"');
    content = content.replace(/href=images\/logo\/logo\.jpeg/g, 'href="images/logo/logo.jpeg"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 2. FIX about.html
// -------------------------------------------------------------
{
    const file = 'about.html';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('Glass Bridge.jpg')) {
        content = content.replace(/images\/activities\/Glass Bridge\.jpg/g, 'images/activities/glass_square.jpg');
        logFix(file, 'Fixed Glass Bridge.jpg -> glass_square.jpg');
    }
    content = content.replace(/src=images\/logo\/logo\.jpeg/g, 'src="images/logo/logo.jpeg"');
    content = content.replace(/href=images\/logo\/logo\.jpeg/g, 'href="images/logo/logo.jpeg"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 3. FIX contact.html
// -------------------------------------------------------------
{
    const file = 'contact.html';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('Glass Bridge.jpg')) {
        content = content.replace(/images\/activities\/Glass Bridge\.jpg/g, 'images/activities/glass_square.jpg');
        logFix(file, 'Fixed Glass Bridge.jpg -> glass_square.jpg');
    }
    content = content.replace(/src=images\/logo\/logo\.jpeg/g, 'src="images/logo/logo.jpeg"');
    content = content.replace(/href=images\/logo\/logo\.jpeg/g, 'href="images/logo/logo.jpeg"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 4. FIX products.html
// -------------------------------------------------------------
{
    const file = 'products.html';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('Giant swing.jpeg')) {
        content = content.replace(/images\/activities\/Giant swing\.jpeg/g, 'images/activities/giant-swing.jpeg');
        logFix(file, 'Fixed Giant swing.jpeg -> giant-swing.jpeg');
    }
    content = content.replace(/src=images\/logo\/logo\.jpeg/g, 'src="images/logo/logo.jpeg"');
    content = content.replace(/href=images\/logo\/logo\.jpeg/g, 'href="images/logo/logo.jpeg"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 5. FIX js/project-details.js
// -------------------------------------------------------------
{
    const file = 'js/project-details.js';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('IKYA ISLAND photo.jpg')) {
        content = content.replace('images/projects/IKYA ISLAND photo.jpg', 'images/projects/ikya_island.jpg');
        logFix(file, 'Fixed IKYA ISLAND photo.jpg -> ikya_island.jpg');
    }
    if (content.includes('this.src=images/logo/logo.jpeg;')) {
        content = content.replace(/this\.src=images\/logo\/logo\.jpeg;/g, "this.src='images/logo/logo.jpeg';");
        logFix(file, 'Fixed unquoted this.src=images/logo/logo.jpeg;');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 6. FIX js/gallery.js
// -------------------------------------------------------------
{
    const file = 'js/gallery.js';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes(': images/logo/logo.jpeg,')) {
        content = content.replace(': images/logo/logo.jpeg,', ": 'images/logo/logo.jpeg',");
        logFix(file, 'Fixed unquoted fallback : images/logo/logo.jpeg');
    }
    if (content.includes('this.src=images/logo/logo.jpeg;')) {
        content = content.replace(/this\.src=images\/logo\/logo\.jpeg;/g, "this.src='images/logo/logo.jpeg';");
        logFix(file, 'Fixed unquoted onerror this.src=images/logo/logo.jpeg;');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 7. FIX gallery.html
// -------------------------------------------------------------
{
    const file = 'gallery.html';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('this.src=images/logo/logo.jpeg;')) {
        content = content.replace(/this\.src=images\/logo\/logo\.jpeg;/g, "this.src='images/logo/logo.jpeg';");
        logFix(file, 'Fixed unquoted onerror in gallery.html');
    }
    content = content.replace(/src=images\/logo\/logo\.jpeg/g, 'src="images/logo/logo.jpeg"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 8. FIX team.html, portfolio.html, testimonials.html, project-details.html, thank-you.html logo attributes
// -------------------------------------------------------------
['team.html', 'portfolio.html', 'testimonials.html', 'project-details.html', 'thank-you.html', '404.html'].forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;
        content = content.replace(/src=images\/logo\/logo\.jpeg/g, 'src="images/logo/logo.jpeg"');
        content = content.replace(/href=images\/logo\/logo\.jpeg/g, 'href="images/logo/logo.jpeg"');
        if (content !== original) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`[FIXED] ${file}`);
            logFix(file, 'Quoted logo attributes');
        }
    }
});

// -------------------------------------------------------------
// 9. FIX js/products.js
// -------------------------------------------------------------
{
    const file = 'js/products.js';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const replacements = [
        ['"/images/zipline_square.jpeg"', '"images/activities/zipline_square.jpeg"'],
        ['"/images/sky_cycle_square.jpeg"', '"images/activities/sky_cycle_square.jpeg"'],
        ['"/images/Giant swing.jpeg"', '"images/activities/giant-swing.jpeg"'],
        ['"/images/suspension bridge.jpg"', '"images/activities/suspension_bridge.jpg"'],
        ['"/images/trampoline.jpeg"', '"images/activities/trampoline.jpeg"'],
        ['"/images/gyro_square.jpeg"', '"images/activities/gyro_square.jpeg"'],
        ['"/images/ejector_square.jpeg?v=2"', '"images/activities/ejector_square.jpeg?v=2"'],
        ['"/images/sky_roller_square.jpeg"', '"images/activities/sky_roller_square.jpeg"'],
        ['"/images/rope_course_square.jpeg"', '"images/activities/rope_course_square.jpeg"'],
        ['"/images/tower_square.jpeg"', '"images/activities/tower_square.jpeg"'],
        ['"/images/glass_square.jpg"', '"images/activities/glass_square.jpg"'],
        ['"/images/360_square.jpeg"', '"images/activities/360_square.jpeg"'],
        ['"/images/Bull_ride.jpeg"', '"images/activities/bull_ride.jpeg"'],
        ['"/images/Rifale_shooting.jpeg"', '"images/activities/rifle_shooting.jpeg"'],
        ['"/images/Archery.jpeg"', '"images/activities/archery.jpeg"'],
    ];

    replacements.forEach(([from, to]) => {
        if (content.includes(from)) {
            content = content.split(from).join(to);
            logFix(file, `Replaced ${from} -> ${to}`);
        }
    });

    // Also strip leading slash from all other "/images/" in products.js to make them relative
    content = content.replace(/"\/images\//g, '"images/');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 10. FIX js/products-catalog.js
// -------------------------------------------------------------
{
    const file = 'js/products-catalog.js';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Suspension Bridge image in STARLINE_PRODUCTS
    const suspensionOld = `    {
        id: "suspension-bridge",
        name: "Suspension Bridge",
        image: "", // Empty for user image upload`;
    const suspensionNew = `    {
        id: "suspension-bridge",
        name: "Suspension Bridge",
        image: "images/activities/suspension_bridge.jpg",`;
    if (content.includes(suspensionOld)) {
        content = content.replace(suspensionOld, suspensionNew);
        logFix(file, 'Assigned verified image to suspension-bridge in STARLINE_PRODUCTS');
    }

    // 2. Climbing Ropes & Carabiners image in STARLINE_PRODUCTS
    const climbingRopesOld = `    {
        id: "climbing-ropes-carabiners",
        name: "Climbing Ropes & Carabiners",
        category: "equipment",
        image: "",`;
    const climbingRopesNew = `    {
        id: "climbing-ropes-carabiners",
        name: "Climbing Ropes & Carabiners",
        category: "equipment",
        image: "images/equipment/Climbing Ropes & Carabiner.jpg",`;
    if (content.includes(climbingRopesOld)) {
        content = content.replace(climbingRopesOld, climbingRopesNew);
        logFix(file, 'Assigned verified image to climbing-ropes-carabiners in STARLINE_PRODUCTS');
    }

    // 3. Climbing Holds & Wall Panels image in STARLINE_PRODUCTS
    const climbingHoldsOld = `    {
        id: "climbing-holds-wall-panels",
        name: "Climbing Holds & Wall Panels",
        category: "equipment",
        image: "",`;
    const climbingHoldsNew = `    {
        id: "climbing-holds-wall-panels",
        name: "Climbing Holds & Wall Panels",
        category: "equipment",
        image: "images/equipment/Climbing Holds & Wall Panels.jpeg",`;
    if (content.includes(climbingHoldsOld)) {
        content = content.replace(climbingHoldsOld, climbingHoldsNew);
        logFix(file, 'Assigned verified image to climbing-holds-wall-panels in STARLINE_PRODUCTS');
    }

    // 4. Ensure renderProductsGrid uses getResolvedImagePath if available
    if (!content.includes('function getCatalogResolvedImagePath')) {
        const resolverCode = `
// Universal Image Path Resolver for multi-depth pages
function getCatalogResolvedImagePath(rawPath) {
    if (!rawPath) return "";
    let clean = String(rawPath).trim().replace(/^\\/+/, "");
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
        return clean;
    }
    const isSubdir = (typeof window !== "undefined") && (
        window.location.pathname.includes("/product/") || 
        window.location.pathname.endsWith("/product")
    );
    if (isSubdir) {
        if (!clean.startsWith("../")) {
            clean = "../" + clean;
        }
    } else {
        clean = clean.replace(/^(\\.\\.\\/)+/, "");
    }
    return clean;
}
`;
        // Insert resolver before renderProductsGrid
        content = content.replace('function renderProductsGrid(', resolverCode + '\nfunction renderProductsGrid(');

        // Update image src in renderProductsGrid to resolve dynamically
        content = content.replace('`<img src="${product.image}"', '`<img src="${getCatalogResolvedImagePath(product.image)}"');
        logFix(file, 'Added getCatalogResolvedImagePath to renderProductsGrid');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 11. FIX js/image-map.js
// -------------------------------------------------------------
{
    const file = 'js/image-map.js';
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Check if path resolution helper exists
    if (!content.includes('function resolvePathForCurrentPage')) {
        const resolveHelper = `
    /**
     * Resolves image paths according to current directory depth (root vs /product/).
     * Root pages (index.html, products.html): "images/..."
     * Subfolder pages (product/*.html): "../images/..."
     */
    function resolvePathForCurrentPage(pathStr) {
        if (!pathStr || typeof pathStr !== "string") return "";
        let clean = pathStr.trim().replace(/^\\/+/, "");
        if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
            return clean;
        }
        const isSubdir = (typeof window !== "undefined") && (
            window.location.pathname.includes("/product/") || 
            window.location.pathname.endsWith("/product")
        );
        if (isSubdir) {
            if (!clean.startsWith("../")) {
                clean = "../" + clean;
            }
        } else {
            clean = clean.replace(/^(\\.\\.\\/)+/, "");
        }
        return clean;
    }
`;
        content = content.replace('function renderProductCardImage(product) {', resolveHelper + '\n    function renderProductCardImage(product) {');
        logFix(file, 'Added resolvePathForCurrentPage helper');
    }

    // Update renderProductCardImage and renderProductDetailImage to resolve path
    content = content.replace('const imgUrl = getProductImage(product);', 'const rawImgUrl = getProductImage(product);\n        const imgUrl = resolvePathForCurrentPage(rawImgUrl);');
    content = content.replace('<img src="${escapeHtml(imgUrl)}"', '<img src="${escapeHtml(resolvePathForCurrentPage(imgUrl))}"');

    // Make sure all 33 products in productImageMap are mapped to actual existing paths
    if (content.includes('"suspension-bridge": {')) {
        content = content.replace(
            /"suspension-bridge":\s*\{[^}]*image:\s*"[^"]*"[^}]*\}/,
            `"suspension-bridge": {
            image: "images/activities/suspension_bridge.jpg",
            alt: "Suspension Bridge Adventure Activity - Starline Adventures",
            title: "Suspension Bridge",
            category: "activities",
            categoryLabel: "Activities",
            desc: "A thrilling bridge experience that tests balance, confidence and adventure."
        }`
        );
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`[FIXED] ${file}`);
    }
}

// -------------------------------------------------------------
// 12. FIX all 33 product/*.html files
// -------------------------------------------------------------
const productDir = 'product';
const productFiles = fs.readdirSync(productDir).filter(f => f.endsWith('.html'));

productFiles.forEach(fileName => {
    const fullPath = path.join(productDir, fileName);
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    // 1. Fix malformed domain URLs e.g. "https://starlineadventures.com../images/" -> "https://starlineadventures.com/images/"
    if (content.includes('starlineadventures.com../')) {
        content = content.replace(/starlineadventures\.com\.\.\//g, 'starlineadventures.com/');
        logFix(fullPath, 'Fixed starlineadventures.com../ -> starlineadventures.com/');
    }

    // 2. Fix broken onerror quotes: onerror="this.onerror=null; this.src="../images/...";"
    content = content.replace(/onerror="this\.onerror=null;\s*this\.src="([^"]+)";"/g, (match, fallbackSrc) => {
        return `onerror="this.onerror=null; this.src='${fallbackSrc}';"`;
    });

    // 3. Fix unquoted logo and favicon paths
    content = content.replace(/href=\/images\/logo\/logo\.jpeg/g, 'href="../images/logo/logo.jpeg"');
    content = content.replace(/href="\/images\/logo\/logo\.jpeg"/g, 'href="../images/logo/logo.jpeg"');
    content = content.replace(/href='\/images\/logo\/logo\.jpeg'/g, 'href="../images/logo/logo.jpeg"');
    content = content.replace(/src=\/images\/logo\/logo\.jpeg/g, 'src="../images/logo/logo.jpeg"');
    content = content.replace(/src="\/images\/logo\/logo\.jpeg"/g, 'src="../images/logo/logo.jpeg"');

    // 4. Ensure schema.org logo is valid absolute URL
    content = content.replace(/"logo":\s*"\/images\/logo\/logo\.jpeg"/g, '"logo": "https://starlineadventures.com/images/logo/logo.jpeg"');

    // 5. Ensure any <img src="images/..."> inside product/*.html has ../images/
    // Match <img src="images/..." or <img src='/images/...'
    content = content.replace(/<img([^>]+)src="images\//gi, '<img$1src="../images/');
    content = content.replace(/<img([^>]+)src="\/images\//gi, '<img$1src="../images/');

    if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[FIXED] ${fullPath}`);
    }
});

console.log(`\n=== FIX EXECUTION COMPLETE ===`);
console.log(`Total files modified: ${report.fixedFiles.length}`);
console.log(`Total fixes applied: ${report.details.length}`);
