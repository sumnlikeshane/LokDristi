/**
 * Parse GeoNames India postal code data from file
 */

import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = '/tmp/IN_pincodes.txt';
const OUTPUT_FILE = path.join(__dirname, '../public/data/pincode_latlng.json');

async function parseGeoNamesData() {
  console.log('Parsing GeoNames India postal code data...\n');
  
  const pincodeMap = {};
  let lineCount = 0;
  
  const fileStream = fs.createReadStream(INPUT_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    const parts = line.split('\t');
    if (parts.length >= 11) {
      const pincode = parts[1].trim();
      const lat = parseFloat(parts[9]);
      const lng = parseFloat(parts[10]);
      
      if (pincode && !isNaN(lat) && !isNaN(lng)) {
        if (!pincodeMap[pincode]) {
          pincodeMap[pincode] = { lat, lng };
        }
      }
    }
    
    lineCount++;
    if (lineCount % 50000 === 0) {
      console.log(`Processed ${lineCount} records (${Object.keys(pincodeMap).length} unique pincodes)`);
    }
  }
  
  console.log(`Processed ${lineCount} records total`);
  return pincodeMap;
}

async function main() {
  try {
    const pincodeMap = await parseGeoNamesData();
    
    console.log(`\nTotal unique pincodes: ${Object.keys(pincodeMap).length}`);
    
    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pincodeMap, null, 2));
    console.log(`Saved to: ${OUTPUT_FILE}`);
    
    // Show sample
    const sample = Object.entries(pincodeMap).slice(0, 5);
    console.log('\nSample entries:');
    sample.forEach(([pincode, coords]) => {
      console.log(`  ${pincode}: ${coords.lat}, ${coords.lng}`);
    });
    
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main();
