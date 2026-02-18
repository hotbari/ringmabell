// Script to generate PWA icons from SVG
// Run: node scripts/generate-icons.js
// Requires: npm install sharp

const fs = require('fs');
const path = require('path');

// Create placeholder text file explaining how to generate icons
const readme = `
# PWA Icon Generation

To generate proper PWA icons, you have several options:

## Option 1: Online Tools
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## Option 2: Using Sharp (Node.js)
1. Create a high-quality 512x512 PNG icon
2. Install sharp: npm install sharp
3. Run this script to generate all sizes

## Current Placeholder
For now, the app uses a simple SVG icon. For production,
replace with properly sized PNG files:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'icons', 'README.md'),
  readme
);

console.log('Icon README created. See public/icons/README.md for instructions.');
`;
