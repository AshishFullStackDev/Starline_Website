const fs = require('fs');
const path = require('path');

// 1. Gather all actual files on disk
function getAllFiles(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allDiskFiles = getAllFiles('.');
const diskFileSet = new Set(allDiskFiles.map(f => f.replace(/^\.\//, '')));
const diskLowerMap = new Map();
for (const f of diskFileSet) {
    diskLowerMap.set(f.toLowerCase(), f);
}

// All image files on disk
const imageExtensions = new Set(['.jpeg', '.jpg', '.png', '.webp', '.svg', '.gif', '.ico']);
const diskImages = new Set();
for (const f of diskFileSet) {
    const ext = path.extname(f).toLowerCase();
    if (imageExtensions.has(ext)) {
        diskImages.add(f);
    }
}

console.log(`[Disk Audit] Found ${diskImages.size} physical image files on disk:`);
for (const img of Array.from(diskImages).sort()) {
    console.log(`  - ${img}`);
}

// 2. Scan every file in codebase for image references
const filesToScan = allDiskFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.html', '.js', '.css', '.json', '.xml', '.md'].includes(ext);
});

console.log(`\n[Scan Audit] Scanning ${filesToScan.length} source files for image references...`);

const references = []; // { sourceFile, lineNumber, rawRef, resolvedFromSource, resolvedFromRoot, status, suggestedFix }

const imgRegex = /(?:src|href|content|data-src|data-lazy|image|fallbackImage|poster|url)\s*[:=]\s*["'`]([^"'`]+?\.(?:jpeg|jpg|png|webp|svg|gif|ico)(?:\?[^"'`]*)?)["'`]|url\(\s*["']?([^"')]+?\.(?:jpeg|jpg|png|webp|svg|gif|ico)(?:\?[^"')]+)?)["']?\s*\)|["']([^"'\s]+\.(?:jpeg|jpg|png|webp|svg|gif|ico)(?:\?[^"'\s]*)?)["']/gi;

for (const filePath of filesToScan) {
    const normalizedSource = filePath.replace(/^\.\//, '');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        let match;
        // reset regex
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(line)) !== null) {
            const rawRef = match[1] || match[2] || match[3];
            if (!rawRef) continue;
            // Ignore external URLs that don't belong to our site
            if ((rawRef.startsWith('http://') || rawRef.startsWith('https://')) && 
                !rawRef.includes('localhost') && 
                !rawRef.includes('starlineadventures.com') && 
                !rawRef.includes('starline') &&
                !rawRef.includes('images/')) {
                continue;
            }

            // Clean query params / hashes
            let cleanRef = rawRef.split('?')[0].split('#')[0];
            // Remove full domain if local domain
            cleanRef = cleanRef.replace(/^https?:\/\/[^\/]+/, '');

            // Figure out source directory depth
            const sourceDir = path.dirname(normalizedSource);

            // Path resolved from source file directory
            let fromSource = path.normalize(path.join(sourceDir, cleanRef)).replace(/^\.\//, '');
            // Path resolved assuming root-relative or leading slash
            let fromRoot = cleanRef.replace(/^\//, '');

            references.push({
                sourceFile: normalizedSource,
                lineNum: idx + 1,
                rawRef,
                cleanRef,
                sourceDir,
                fromSource,
                fromRoot
            });
        }
    });
}

console.log(`Found ${references.length} image reference occurrences in codebase.`);

// Check validity
const brokenRefs = [];
const okRefs = [];

for (const ref of references) {
    // Does it exist fromSource?
    const existsFromSource = diskFileSet.has(ref.fromSource);
    // Does it exist fromRoot?
    const existsFromRoot = diskFileSet.has(ref.fromRoot);

    if (existsFromSource || existsFromRoot) {
        okRefs.push({ ...ref, foundAt: existsFromSource ? ref.fromSource : ref.fromRoot });
    } else {
        // Try case-insensitive or filename search
        const basename = path.basename(ref.cleanRef).toLowerCase();
        let candidate = null;
        for (const img of diskImages) {
            if (path.basename(img).toLowerCase() === basename) {
                candidate = img;
                break;
            }
        }
        brokenRefs.push({ ...ref, candidate });
    }
}

console.log(`\n--- AUDIT SUMMARY ---`);
console.log(`Valid/Found References: ${okRefs.length}`);
console.log(`Broken/Missing References: ${brokenRefs.length}`);

console.log(`\n--- LIST OF BROKEN / PROBLEMATIC REFERENCES (${brokenRefs.length}) ---`);
const brokenBySource = {};
for (const b of brokenRefs) {
    brokenBySource[b.sourceFile] = brokenBySource[b.sourceFile] || [];
    brokenBySource[b.sourceFile].push(b);
}

for (const [src, list] of Object.entries(brokenBySource)) {
    console.log(`\nFile: ${src}`);
    for (const b of list) {
        console.log(`  Line ${b.lineNum}: "${b.rawRef}" -> candidate: ${b.candidate ? b.candidate : 'NONE FOUND'}`);
    }
}
