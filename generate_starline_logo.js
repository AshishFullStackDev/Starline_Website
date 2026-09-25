const fs = require('fs');
const opentype = require('opentype.js');
const sharp = require('sharp');

// Load fonts
const fontBI = opentype.parse(fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf').buffer);
const fontB = opentype.parse(fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf').buffer);
const fontR = opentype.parse(fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf').buffer);

// Colors matching original logo
const orange = "#FF4600";
const black = "#000000";

// Text paths
const starlinePath = fontBI.getPath("STARLINE", 515, 526, 182);
const tmPath = fontB.getPath("TM", 1405, 328, 44);
const advPath = fontBI.getPath("A  D  V  E  N  T  U  R  E", 555, 660, 64);
const subPath = fontR.getPath("Adventure Rides Manufacturer", 95, 875, 94);

// Function to convert path to SVG path string
function getPathD(p) {
  return p.toPathData(2);
}

// Star geometry
// Center of inner star
const cx = 370;
const cy = 445;
const R_inner = 112;
const r_inner = 43;

function getStarPoints(centerX, centerY, R, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = (i % 2 === 0) ? R : r;
    const a = (-90 + i * 36) * Math.PI / 180;
    pts.push({
      x: centerX + rad * Math.cos(a),
      y: centerY + rad * Math.sin(a)
    });
  }
  return pts;
}

const innerPts = getStarPoints(cx, cy, R_inner, r_inner);
const innerPolygon = innerPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

// White cutout star (gap = 25px)
const R_cut = 188;
const r_cut = 72;
const cutPts = getStarPoints(cx, cy, R_cut, r_cut);
const cutPolygon = cutPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

// Outer frame and streaks
// Let's create the outer shape path
// It starts at top point (370, 75)
// Right edge goes down-right towards (485, 340)
// Extends into top streak to (1420, 340)
// Bottom of top streak returns to (495, 375)
// Connects to outer frame around cutout:
// Along right side of cutout to (465, 445) -> (490, 515)
// Then into bottom streak:
// Top of bottom streak: (490, 545) to (1390, 545)
// Bottom of bottom streak: returns to (445, 578)
// Continues along frame:
// (360, 535) -> down bottom-left leg to (100, 805)
// Up to valley (240, 515)
// Out to left point (15, 355)
// Up to top-left valley (300, 355)
// Up to top point (370, 75)
// AND the cutout hole inside!

const outerPathD = `
  M 370,75
  L 485,340
  L 1420,340
  L 495,376
  L 462,445
  L 490,515
  L 1390,545
  L 445,578
  L 360,535
  L 100,805
  L 240,515
  L 15,355
  L 300,355
  Z
  M ${cutPts[0].x.toFixed(1)},${cutPts[0].y.toFixed(1)}
  L ${cutPts[9].x.toFixed(1)},${cutPts[9].y.toFixed(1)}
  L ${cutPts[8].x.toFixed(1)},${cutPts[8].y.toFixed(1)}
  L ${cutPts[7].x.toFixed(1)},${cutPts[7].y.toFixed(1)}
  L ${cutPts[6].x.toFixed(1)},${cutPts[6].y.toFixed(1)}
  L ${cutPts[5].x.toFixed(1)},${cutPts[5].y.toFixed(1)}
  L ${cutPts[4].x.toFixed(1)},${cutPts[4].y.toFixed(1)}
  L ${cutPts[3].x.toFixed(1)},${cutPts[3].y.toFixed(1)}
  L ${cutPts[2].x.toFixed(1)},${cutPts[2].y.toFixed(1)}
  L ${cutPts[1].x.toFixed(1)},${cutPts[1].y.toFixed(1)}
  Z
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000" width="1500" height="1000">
  <rect width="1500" height="1000" fill="#ffffff"/>
  <g>
    <!-- Outer Star & Speed Streaks with cutout -->
    <path d="${outerPathD.replace(/\s+/g, ' ').trim()}" fill="${orange}" fill-rule="evenodd"/>

    <!-- Inner Solid Star -->
    <polygon points="${innerPolygon}" fill="${orange}"/>

    <!-- Text elements converted to exact vector paths -->
    <path d="${getPathD(starlinePath)}" fill="${black}"/>
    <path d="${getPathD(tmPath)}" fill="${black}"/>
    <path d="${getPathD(advPath)}" fill="${black}"/>
    <path d="${getPathD(subPath)}" fill="${black}"/>
  </g>
</svg>`;

fs.writeFileSync('starline_logo_official.svg', svg);

sharp(Buffer.from(svg))
  .png()
  .toFile('starline_logo_official.png')
  .then(info => console.log('Generated official logo PNG:', info))
  .catch(err => console.error(err));
