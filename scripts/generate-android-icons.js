#!/usr/bin/env node

/**
 * Generate Android launcher icons from SVG logo
 * This script converts the YellowTaxi logo SVG to various PNG sizes
 * required for Android launcher icons across different densities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Android icon sizes for different densities
const ICON_SIZES = {
  'mipmap-mdpi': 48,      // 1x
  'mipmap-hdpi': 72,      // 1.5x
  'mipmap-xhdpi': 96,     // 2x
  'mipmap-xxhdpi': 144,   // 3x
  'mipmap-xxxhdpi': 192,  // 4x
};

// Paths
const SVG_SOURCE = path.join(__dirname, '../src/assets/images/logo.svg');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');

/**
 * Check if ImageMagick is installed
 */
function checkImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Inkscape is installed
 */
function checkInkscape() {
  try {
    execSync('inkscape --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert SVG to PNG using ImageMagick
 */
function convertWithImageMagick(svgPath, outputPath, size) {
  // Try modern magick command first, fallback to convert
  try {
    const command = `magick -background none -density 300 "${svgPath}" -resize ${size}x${size} "${outputPath}"`;
    execSync(command);
  } catch (error) {
    // Fallback to legacy convert command
    const command = `convert -background none -density 300 "${svgPath}" -resize ${size}x${size} "${outputPath}"`;
    execSync(command);
  }
}

/**
 * Convert SVG to PNG using Inkscape
 */
function convertWithInkscape(svgPath, outputPath, size) {
  const command = `inkscape --export-type=png --export-filename="${outputPath}" --export-width=${size} --export-height=${size} "${svgPath}"`;
  execSync(command);
}

/**
 * Create a simple fallback icon if conversion tools are not available
 */
function createFallbackIcon(outputPath, size) {
  // Create a simple yellow circle with taxi text as fallback
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="#FFC100" stroke="#000" stroke-width="2"/>
      <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold" fill="#000">🚕</text>
    </svg>
  `;
  
  const tempSvgPath = outputPath.replace('.png', '_temp.svg');
  fs.writeFileSync(tempSvgPath, canvas);
  
  try {
    if (checkImageMagick()) {
      convertWithImageMagick(tempSvgPath, outputPath, size);
    } else {
      console.warn(`⚠️  Cannot create ${outputPath} - no conversion tools available`);
    }
  } finally {
    if (fs.existsSync(tempSvgPath)) {
      fs.unlinkSync(tempSvgPath);
    }
  }
}

/**
 * Generate launcher icons for all densities
 */
function generateIcons() {
  console.log('🚕 Generating YellowTaxi Android launcher icons...\n');

  // Check if source SVG exists
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error(`❌ Source SVG not found: ${SVG_SOURCE}`);
    process.exit(1);
  }

  // Check available conversion tools
  const hasImageMagick = checkImageMagick();
  const hasInkscape = checkInkscape();

  if (!hasImageMagick && !hasInkscape) {
    console.warn('⚠️  Neither ImageMagick nor Inkscape found. Will create fallback icons.');
    console.warn('   Install ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Ubuntu)');
    console.warn('   Install Inkscape: brew install inkscape (macOS) or apt-get install inkscape (Ubuntu)\n');
  } else {
    console.log(`✅ Using ${hasInkscape ? 'Inkscape' : 'ImageMagick'} for SVG conversion\n`);
  }

  // Generate icons for each density
  Object.entries(ICON_SIZES).forEach(([density, size]) => {
    const densityDir = path.join(ANDROID_RES_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(densityDir)) {
      fs.mkdirSync(densityDir, { recursive: true });
    }

    // Generate both regular and round icons
    const regularIconPath = path.join(densityDir, 'ic_launcher.png');
    const roundIconPath = path.join(densityDir, 'ic_launcher_round.png');

    try {
      if (hasInkscape) {
        convertWithInkscape(SVG_SOURCE, regularIconPath, size);
        convertWithInkscape(SVG_SOURCE, roundIconPath, size);
      } else if (hasImageMagick) {
        convertWithImageMagick(SVG_SOURCE, regularIconPath, size);
        convertWithImageMagick(SVG_SOURCE, roundIconPath, size);
      } else {
        createFallbackIcon(regularIconPath, size);
        createFallbackIcon(roundIconPath, size);
      }

      console.log(`✅ Generated ${density}: ${size}x${size}px`);
    } catch (error) {
      console.error(`❌ Failed to generate ${density} icons:`, error.message);
    }
  });

  console.log('\n🎉 Android launcher icons generation complete!');
  console.log('\n📱 Generated icons:');
  Object.entries(ICON_SIZES).forEach(([density, size]) => {
    console.log(`   ${density}: ${size}x${size}px (ic_launcher.png, ic_launcher_round.png)`);
  });

  console.log('\n🔧 Next steps:');
  console.log('   1. Build your Android app: npx react-native run-android');
  console.log('   2. Check the app icon on your device/emulator');
  console.log('   3. For production: Generate adaptive icons using Android Studio');
}

// Run the script
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };
