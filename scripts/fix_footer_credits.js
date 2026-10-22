const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.aistudio' && file !== 'functions') {
        getHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = getHtmlFiles(ROOT_DIR);

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content;

  const regex = /Designed\s*(?:&amp;|&)\s*Developed\s*by\s*(?:<a[^>]*>)?Ashish\s*Naik(?:<\/a>)?/gi;

  if (regex.test(content)) {
    const replacement = 'Designed &amp; Developed by <a href="https://www.linkedin.com/in/ashish-naik-0b853a36a/" target="_blank" rel="noopener noreferrer" class="footer-developer-link">Ashish Naik</a>';
    updated = content.replace(regex, replacement);
    if (updated !== content) {
      fs.writeFileSync(file, updated, 'utf8');
      console.log(`Updated footer credit in: ${path.relative(ROOT_DIR, file)}`);
    }
  }
});

console.log('Footer credit update complete.');
