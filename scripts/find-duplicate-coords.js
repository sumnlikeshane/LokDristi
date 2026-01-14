import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load pincode data
const pincodeFile = path.join(rootDir, 'public/data/pincode_latlng.json');
const pincodeData = JSON.parse(fs.readFileSync(pincodeFile, 'utf-8'));

console.log(`Total pincodes: ${Object.keys(pincodeData).length}\n`);

// Group pincodes by their coordinates
const coordMap = new Map();

for (const [pincode, coords] of Object.entries(pincodeData)) {
  // Create a key from lat/lng (rounded to avoid floating point issues)
  const key = `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
  
  if (!coordMap.has(key)) {
    coordMap.set(key, []);
  }
  coordMap.get(key).push(pincode);
}

// Find duplicates (coordinates with multiple pincodes)
const duplicates = [];
let totalDuplicatePincodes = 0;

for (const [coords, pincodes] of coordMap.entries()) {
  if (pincodes.length > 1) {
    const [lat, lng] = coords.split(',');
    duplicates.push({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      count: pincodes.length,
      pincodes: pincodes.sort()
    });
    totalDuplicatePincodes += pincodes.length;
  }
}

// Sort by number of duplicates (most first)
duplicates.sort((a, b) => b.count - a.count);

console.log('=== DUPLICATE COORDINATES ANALYSIS ===\n');
console.log(`Unique coordinate locations: ${coordMap.size}`);
console.log(`Locations with multiple pincodes: ${duplicates.length}`);
console.log(`Total pincodes at duplicate locations: ${totalDuplicatePincodes}`);
console.log(`Pincodes at unique locations: ${Object.keys(pincodeData).length - totalDuplicatePincodes}`);

console.log('\n=== TOP 50 DUPLICATE LOCATIONS ===\n');

duplicates.slice(0, 50).forEach((dup, i) => {
  console.log(`${i + 1}. [${dup.lat}, ${dup.lng}] - ${dup.count} pincodes:`);
  console.log(`   ${dup.pincodes.join(', ')}`);
});

// Stats by duplicate count
const countStats = {};
for (const dup of duplicates) {
  countStats[dup.count] = (countStats[dup.count] || 0) + 1;
}

console.log('\n=== DISTRIBUTION BY DUPLICATE COUNT ===\n');
Object.entries(countStats)
  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  .forEach(([count, locations]) => {
    console.log(`${count} pincodes at same location: ${locations} locations`);
  });

// Save full report to file
const report = {
  summary: {
    totalPincodes: Object.keys(pincodeData).length,
    uniqueLocations: coordMap.size,
    duplicateLocations: duplicates.length,
    pincodesAtDuplicateLocations: totalDuplicatePincodes,
    pincodesAtUniqueLocations: Object.keys(pincodeData).length - totalDuplicatePincodes
  },
  distribution: countStats,
  duplicates: duplicates
};

const reportFile = path.join(rootDir, 'duplicate_coords_report.json');
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
console.log(`\n✅ Full report saved to: duplicate_coords_report.json`);

// Also save just the pincodes that need fixing
const pincodesToFix = duplicates.flatMap(d => d.pincodes);
const fixFile = path.join(rootDir, 'pincodes_needing_unique_coords.txt');
fs.writeFileSync(fixFile, pincodesToFix.join('\n'));
console.log(`✅ Pincodes needing unique coords saved to: pincodes_needing_unique_coords.txt (${pincodesToFix.length} pincodes)`);
