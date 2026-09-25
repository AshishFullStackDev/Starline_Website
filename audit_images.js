const fs = require('fs');
const path = require('path');

const exts = ['.html', '.css', '.js', '.json'];
const filesToScan = [];

function scanDir(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) scanDir(full);
    else if (exts.includes(path.extname(item))) filesToScan.push(full);
  }
}
scanDir('.');

const references = new Set();
const regexes = [
  /["'\`\(\=](?:(?:https?:\/\/[^\/]+)?\/)?((?:images|logos)\/[^"'\`\)\s>]+)/g,
  /["'\`]([^"'\`\s<>]+\.(?:jpeg|jpg|png|webp|svg))["'\`]/gi
];

filesToScan.forEach(file => {
  if (file === './audit_images.js') return;
  const content = fs.readFileSync(file, 'utf8');
  for (const re of regexes) {
    let match;
    while ((match = re.exec(content)) !== null) {
      let ref = match[1].trim();
      ref = ref.replace(/^[\\\/]+/, '').replace(/#.*$/, '').replace(/\?.*$/, '');
      if (ref.includes('${') || ref.includes('+') || ref.length > 150) continue;
      // Filter out package names or pure mime types or fonts
      if (!ref.match(/\.(jpeg|jpg|png|webp|svg|ico)$/i)) continue;
      references.add(JSON.stringify({ ref, foundIn: file }));
    }
  }
});

const refList = Array.from(references).map(r => JSON.parse(r));
console.log('Total unique references found:', refList.length);

const broken = [];
const existing = [];

refList.forEach(({ ref, foundIn }) => {
  let decoded = decodeURIComponent(ref);
  const inApplet = path.resolve('.', decoded);
  if (fs.existsSync(inApplet)) {
    existing.push({ ref, foundIn });
  } else {
    broken.push({ ref, foundIn });
  }
});

console.log('\n=== BROKEN REFERENCES (' + broken.length + ') ===');
broken.forEach(b => console.log(b.ref + ' ---> found in: ' + b.foundIn));

console.log('\n=== SUMMARY ===');
console.log('Total existing:', existing.length);
console.log('Total broken:', broken.length);
