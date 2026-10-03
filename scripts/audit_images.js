const fs = require('fs');
const path = require('path');

// 1. Gather all actual physical files on disk
function getAllFiles(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.secure_store') continue;
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

// 2. Scan every source file for image references
const filesToScan = allDiskFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.html', '.js', '.css', '.json'].includes(ext) && !f.includes('scripts/');
});

console.log(`\n[Scan Audit] Scanning ${filesToScan.length} source files for image references...`);

// Check for any forbidden paths
let forbiddenCount = 0;
const forbiddenFindings = [];
const forbiddenPatterns = [
    { name: 'images/products/', regex: /images\/products\//g },
    { name: 'images/product/', regex: /images\/product\//g },
    { name: 'images/activity/', regex: /images\/activity\//g }
];

for (const filePath of filesToScan) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pat of forbiddenPatterns) {
        const matches = content.match(pat.regex);
        if (matches) {
            forbiddenCount += matches.length;
            forbiddenFindings.push({ file: filePath, pattern: pat.name, count: matches.length });
        }
    }
}

console.log(`\n[Forbidden Path Audit] Deprecated references count: ${forbiddenCount}`);
if (forbiddenCount > 0) {
    console.log('Forbidden matches:', forbiddenFindings);
}

// Check all image references against disk
const references = [];
const imgRegex = /(?:src|href|content|data-src|data-lazy|image|fallbackImage|poster|url)\s*[:=]\s*["'`]([^"'`]+?\.(?:jpeg|jpg|png|webp|svg|gif|ico)(?:\?[^"'`]*)?)["'`]|url\(\s*["']?([^"')]+?\.(?:jpeg|jpg|png|webp|svg|gif|ico)(?:\?[^"')]+)?)["']?\s*\)|["']([^"'\s]+\.(?:jpeg|jpg|png|webp|svg|gif|ico)(?:\?[^"'\s]*)?)["']/gi;

for (const filePath of filesToScan) {
    const normalizedSource = filePath.replace(/^\.\//, '');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        let match;
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(line)) !== null) {
            const rawRef = match[1] || match[2] || match[3];
            if (!rawRef) continue;
            // Ignore external CDN / third party URLs
            if ((rawRef.startsWith('http://') || rawRef.startsWith('https://')) && 
                !rawRef.includes('starlineadventures.com') && 
                !rawRef.includes('images/')) {
                continue;
            }

            let cleanRef = rawRef.split('?')[0].split('#')[0];
            cleanRef = cleanRef.replace(/^https?:\/\/[^\/]+/, '');
            cleanRef = decodeURIComponent(cleanRef);

            const sourceDir = path.dirname(normalizedSource);
            let fromSource = path.normalize(path.join(sourceDir, cleanRef)).replace(/^\.\//, '');
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

const brokenRefs = [];
const okRefs = [];

for (const ref of references) {
    const existsFromSource = diskFileSet.has(ref.fromSource);
    const existsFromRoot = diskFileSet.has(ref.fromRoot);

    if (existsFromSource || existsFromRoot) {
        okRefs.push({ ...ref, foundAt: existsFromSource ? ref.fromSource : ref.fromRoot });
    } else {
        brokenRefs.push(ref);
    }
}

console.log(`\n--- AUDIT SUMMARY ---`);
console.log(`Valid References: ${okRefs.length}`);
console.log(`Broken/Missing References: ${brokenRefs.length}`);

if (brokenRefs.length > 0) {
    console.log(`\n--- LIST OF BROKEN REFERENCES (${brokenRefs.length}) ---`);
    for (const b of brokenRefs) {
        console.log(`File: ${b.sourceFile}:${b.lineNum} -> "${b.rawRef}"`);
    }
}
