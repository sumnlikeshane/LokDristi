/**
 * Fetch unique coordinates for pincodes that currently share duplicate coordinates.
 * Uses multiple strategies:
 * 1. Nominatim structured postal code search
 * 2. Nominatim free-form search with district context
 * 3. GeoNames postal code API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const PINCODES_FILE = path.join(__dirname, '..', 'pincodes_needing_unique_coords.txt');
const PINCODE_LATLNG_FILE = path.join(__dirname, '..', 'public', 'data', 'pincode_latlng.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'fetch_progress.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'updated_pincode_coords.json');

// Rate limiting
const NOMINATIM_DELAY = 1100; // 1 request per second for Nominatim
const GEONAMES_DELAY = 500;
const GEONAMES_USERNAME = 'demo'; // Free tier - you can register at geonames.org for more requests

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load existing data
function loadPincodesToFetch() {
  const content = fs.readFileSync(PINCODES_FILE, 'utf-8');
  return content.trim().split('\n').filter(p => p.length === 6);
}

function loadExistingCoords() {
  return JSON.parse(fs.readFileSync(PINCODE_LATLNG_FILE, 'utf-8'));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { processed: {}, failed: [], lastIndex: 0 };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Nominatim structured postal code search
async function fetchFromNominatimStructured(pincode) {
  const url = `https://nominatim.openstreetmap.org/search?` +
    `postalcode=${pincode}&country=India&format=json&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LokDristi-GeoVisualization/1.0 (Educational Project)'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.length > 0 && data[0].lat && data[0].lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        source: 'nominatim-structured',
        displayName: data[0].display_name
      };
    }
  } catch (e) {
    console.error(`  Nominatim structured error for ${pincode}:`, e.message);
  }
  return null;
}

// Nominatim free-form search with pincode + India
async function fetchFromNominatimFreeform(pincode) {
  const url = `https://nominatim.openstreetmap.org/search?` +
    `q=${pincode}+postal+code+India&format=json&limit=5&addressdetails=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LokDristi-GeoVisualization/1.0 (Educational Project)'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Find the result that's actually a postal code match
    for (const result of data) {
      if (result.address && result.address.postcode === pincode) {
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          source: 'nominatim-freeform',
          displayName: result.display_name
        };
      }
    }
    
    // Fallback to first result if it's in India
    if (data.length > 0 && data[0].display_name.includes('India')) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        source: 'nominatim-freeform-fallback',
        displayName: data[0].display_name
      };
    }
  } catch (e) {
    console.error(`  Nominatim freeform error for ${pincode}:`, e.message);
  }
  return null;
}

// GeoNames postal code search
async function fetchFromGeoNames(pincode) {
  const url = `http://api.geonames.org/postalCodeSearchJSON?` +
    `postalcode=${pincode}&country=IN&maxRows=1&username=${GEONAMES_USERNAME}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.postalCodes && data.postalCodes.length > 0) {
      const result = data.postalCodes[0];
      return {
        lat: result.lat,
        lng: result.lng,
        source: 'geonames',
        placeName: result.placeName,
        adminName1: result.adminName1
      };
    }
  } catch (e) {
    console.error(`  GeoNames error for ${pincode}:`, e.message);
  }
  return null;
}

// Check if new coordinates are different from existing
function isDifferentCoord(existing, newCoord, threshold = 0.001) {
  if (!existing || !newCoord) return true;
  const latDiff = Math.abs(existing[0] - newCoord.lat);
  const lngDiff = Math.abs(existing[1] - newCoord.lng);
  return latDiff > threshold || lngDiff > threshold;
}

// Main fetching logic
async function fetchUniqueCoordinates() {
  const pincodes = loadPincodesToFetch();
  const existingCoords = loadExistingCoords();
  const progress = loadProgress();
  
  console.log(`\n=== FETCHING UNIQUE COORDINATES ===`);
  console.log(`Total pincodes to process: ${pincodes.length}`);
  console.log(`Already processed: ${Object.keys(progress.processed).length}`);
  console.log(`Starting from index: ${progress.lastIndex}\n`);
  
  let updated = 0;
  let unchanged = 0;
  let failed = 0;
  
  for (let i = progress.lastIndex; i < pincodes.length; i++) {
    const pincode = pincodes[i];
    
    // Skip if already processed
    if (progress.processed[pincode]) {
      continue;
    }
    
    const existingCoord = existingCoords[pincode];
    console.log(`[${i + 1}/${pincodes.length}] Processing ${pincode}...`);
    
    let newCoord = null;
    
    // Strategy 1: Nominatim structured search
    console.log(`  Trying Nominatim structured...`);
    newCoord = await fetchFromNominatimStructured(pincode);
    await sleep(NOMINATIM_DELAY);
    
    // Strategy 2: Nominatim freeform if structured didn't work or same coords
    if (!newCoord || !isDifferentCoord(existingCoord, newCoord)) {
      console.log(`  Trying Nominatim freeform...`);
      const freeformResult = await fetchFromNominatimFreeform(pincode);
      await sleep(NOMINATIM_DELAY);
      
      if (freeformResult && isDifferentCoord(existingCoord, freeformResult)) {
        newCoord = freeformResult;
      }
    }
    
    // Strategy 3: GeoNames as final fallback
    if (!newCoord || !isDifferentCoord(existingCoord, newCoord)) {
      console.log(`  Trying GeoNames...`);
      const geonamesResult = await fetchFromGeoNames(pincode);
      await sleep(GEONAMES_DELAY);
      
      if (geonamesResult && isDifferentCoord(existingCoord, geonamesResult)) {
        newCoord = geonamesResult;
      }
    }
    
    // Process result
    if (newCoord && isDifferentCoord(existingCoord, newCoord)) {
      console.log(`  ✅ Found unique coords: [${newCoord.lat.toFixed(4)}, ${newCoord.lng.toFixed(4)}] (${newCoord.source})`);
      progress.processed[pincode] = {
        old: existingCoord,
        new: [newCoord.lat, newCoord.lng],
        source: newCoord.source
      };
      updated++;
    } else if (newCoord) {
      console.log(`  ⚠️ Same coords returned, keeping existing`);
      progress.processed[pincode] = { status: 'unchanged' };
      unchanged++;
    } else {
      console.log(`  ❌ No coordinates found`);
      progress.failed.push(pincode);
      failed++;
    }
    
    progress.lastIndex = i + 1;
    
    // Save progress every 10 pincodes
    if ((i + 1) % 10 === 0) {
      saveProgress(progress);
      console.log(`\n  📁 Progress saved (${i + 1}/${pincodes.length})\n`);
    }
    
    // Show stats every 50 pincodes
    if ((i + 1) % 50 === 0) {
      console.log(`\n=== PROGRESS STATS ===`);
      console.log(`Updated: ${updated}, Unchanged: ${unchanged}, Failed: ${failed}`);
      console.log(`======================\n`);
    }
  }
  
  // Final save
  saveProgress(progress);
  
  // Generate updated coordinates file
  const updatedCoords = { ...existingCoords };
  for (const [pincode, data] of Object.entries(progress.processed)) {
    if (data.new) {
      updatedCoords[pincode] = data.new;
    }
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedCoords, null, 2));
  
  console.log(`\n=== FINAL RESULTS ===`);
  console.log(`Total processed: ${Object.keys(progress.processed).length}`);
  console.log(`Updated with new coords: ${updated}`);
  console.log(`Unchanged (same coords returned): ${unchanged}`);
  console.log(`Failed (no coords found): ${failed}`);
  console.log(`\n✅ Updated coordinates saved to: ${OUTPUT_FILE}`);
  console.log(`📁 Progress file: ${PROGRESS_FILE}`);
}

// Run
fetchUniqueCoordinates().catch(console.error);
