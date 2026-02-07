/**
 * SVG to PNG Converter
 * 
 * Usage: node scripts/svg-to-png.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_DIR = 'images/dog-avatar';
const PNG_DIR = 'images/dog-avatar/png';

async function convertSvgToPng() {
  // Create output directory
  if (!fs.existsSync(PNG_DIR)) {
    fs.mkdirSync(PNG_DIR, { recursive: true });
  }
  
  // Get all SVG files
  const files = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
  
  console.log(`Found ${files.length} SVG files to convert...\n`);
  
  for (const file of files) {
    const svgPath = path.join(SVG_DIR, file);
    const pngName = file.replace('.svg', '.png');
    const pngPath = path.join(PNG_DIR, pngName);
    
    try {
      const svgBuffer = fs.readFileSync(svgPath);
      
      await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(pngPath);
      
      console.log(`✅ ${file} → ${pngName}`);
    } catch (error) {
      console.error(`❌ ${file}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Conversion complete!');
}

convertSvgToPng();
