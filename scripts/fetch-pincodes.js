/**
 * Script to fetch all India pincodes with lat/lng from data.gov.in API
 * Run with: node scripts/fetch-pincodes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.data.gov.in/resource/04cbe4b1-2f2b-4c39-a1d5-1c2e28bc0e32';
const API_KEY = '579b464db66ec23bdd0000011a93ca79ca3c4ec051c2d43cc3d64ec7';
const LIMIT = 1000; // Records per request
const OUTPUT_FILE = path.join(__dirname, '../public/data/pincode_latlng.json');

async function fetchPage(offset) {
  const url = `${API_URL}?api-key=${API_KEY}&format=json&offset=${offset}&limit=${LIMIT}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function fetchAllPincodes() {
  console.log('Fetching pincode data from data.gov.in...\n');
  
  // First request to get total count
  const firstPage = await fetchPage(0);
  const total = firstPage.total;
  console.log(`Total records: ${total}`);
  
  const pincodeMap = {};
  let offset = 0;
  let fetched = 0;
  
  while (offset < total) {
    try {
      const data = await fetchPage(offset);
      
      if (data.records && data.records.length > 0) {
        data.records.forEach(record => {
          const pincode = String(record.pincode).padStart(6, '0');
          const lat = parseFloat(record.latitude);
          const lng = parseFloat(record.longitude);
          
          // Only add if lat/lng are valid numbers
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            // Keep first occurrence or update if we don't have coords yet
            if (!pincodeMap[pincode]) {
              pincodeMap[pincode] = { lat, lng };
            }
          }
        });
        
        fetched += data.records.length;
        console.log(`Fetched ${fetched}/${total} records (${Object.keys(pincodeMap).length} unique pincodes with coords)`);
      }
      
      offset += LIMIT;
      
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error at offset ${offset}:`, error.message);
      // Retry after delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return pincodeMap;
}

async function main() {
  try {
    const pincodeMap = await fetchAllPincodes();
    
    console.log(`\nTotal unique pincodes with coordinates: ${Object.keys(pincodeMap).length}`);
    
    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pincodeMap, null, 2));
    console.log(`\nSaved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main();
