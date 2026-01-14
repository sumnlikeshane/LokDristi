import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load existing pincodes
const pincodeData = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/pincode_latlng.json'), 'utf-8'));
const existingPincodes = new Set(Object.keys(pincodeData));
console.log('Existing pincodes in JSON:', existingPincodes.size);

// Find all CSV files
const dataDir = path.join(rootDir, 'public/data');
const csvFiles = [];

function findCSVs(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findCSVs(fullPath);
    } else if (item.endsWith('.csv')) {
      csvFiles.push(fullPath);
    }
  }
}
findCSVs(dataDir);

console.log('Found CSV files:', csvFiles.length);
csvFiles.forEach(f => console.log('  -', f));

// Extract all unique pincodes from CSV files
const allPincodes = new Set();
const missingPincodes = new Set();

for (const csvFile of csvFiles) {
  const content = fs.readFileSync(csvFile, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const pincodeIdx = headers.findIndex(h => h.trim().toLowerCase() === 'pincode');
  
  if (pincodeIdx === -1) {
    console.log('No pincode column in:', csvFile);
    continue;
  }
  
  let fileTotal = 0;
  let fileMissing = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols[pincodeIdx]) {
      const pincode = cols[pincodeIdx].trim();
      if (pincode && pincode.length === 6 && /^\d+$/.test(pincode)) {
        allPincodes.add(pincode);
        fileTotal++;
        if (!existingPincodes.has(pincode)) {
          missingPincodes.add(pincode);
          fileMissing++;
        }
      }
    }
  }
}

console.log('\n=== Summary ===');
console.log('Total unique pincodes in CSVs:', allPincodes.size);
console.log('Pincodes with coordinates:', allPincodes.size - missingPincodes.size);
console.log('Missing pincodes:', missingPincodes.size);
console.log('Coverage:', ((allPincodes.size - missingPincodes.size) / allPincodes.size * 100).toFixed(2) + '%');

// Save missing pincodes to a file
const missingList = Array.from(missingPincodes).sort();
fs.writeFileSync(path.join(rootDir, 'missing_pincodes.txt'), missingList.join('\n'));
console.log('\nSaved missing pincodes to missing_pincodes.txt');

// Show sample of missing pincodes
console.log('\nSample missing pincodes (first 100):');
console.log(missingList.slice(0, 100).join(', '));
