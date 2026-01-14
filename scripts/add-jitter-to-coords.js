import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration for jitter radius based on number of pincodes at location
// More pincodes = larger spread radius (in degrees, roughly 0.01 = 1km)
function getJitterRadius(count) {
  if (count >= 100) return 0.15;      // ~15km for very large clusters (100+)
  if (count >= 50) return 0.12;       // ~12km for large clusters (50-99)
  if (count >= 30) return 0.08;       // ~8km for medium-large clusters (30-49)
  if (count >= 15) return 0.05;       // ~5km for medium clusters (15-29)
  if (count >= 5) return 0.03;        // ~3km for small clusters (5-14)
  return 0.015;                       // ~1.5km for tiny clusters (2-4)
}

// Distribute points in a spiral pattern from center
function distributeInSpiral(centerLat, centerLng, count, radius) {
  const points = [];
  
  // Golden angle for optimal spiral distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      // Keep first pincode at center (or very close)
      points.push({
        lat: centerLat + (Math.random() - 0.5) * 0.002,
        lng: centerLng + (Math.random() - 0.5) * 0.002
      });
    } else {
      // Spiral out from center
      const r = radius * Math.sqrt(i / count);
      const theta = i * goldenAngle;
      
      // Add small random perturbation to avoid perfect patterns
      const perturbation = 0.1;
      const rJitter = r * (1 + (Math.random() - 0.5) * perturbation);
      const thetaJitter = theta + (Math.random() - 0.5) * 0.2;
      
      const lat = centerLat + rJitter * Math.cos(thetaJitter);
      const lng = centerLng + rJitter * Math.sin(thetaJitter);
      
      points.push({ lat, lng });
    }
  }
  
  return points;
}

async function addJitterToCoordinates() {
  const dataPath = join(__dirname, '..', 'public', 'data', 'pincode_latlng.json');
  const reportPath = join(__dirname, '..', 'duplicate_coords_report.json');
  
  // Load existing coordinates
  console.log('Loading pincode coordinates...');
  const pincodeData = JSON.parse(readFileSync(dataPath, 'utf8'));
  
  // Load duplicate report
  console.log('Loading duplicate coordinates report...');
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  
  console.log(`\nFound ${report.duplicates.length} locations with duplicate pincodes`);
  
  let totalUpdated = 0;
  
  // Process each duplicate location
  for (const location of report.duplicates) {
    const { lat, lng, pincodes, count } = location;
    
    if (count < 2) continue;
    
    const radius = getJitterRadius(count);
    const newPositions = distributeInSpiral(lat, lng, count, radius);
    
    // Update each pincode with its new position
    pincodes.forEach((pincode, index) => {
      if (pincodeData[pincode]) {
        pincodeData[pincode] = {
          lat: Number(newPositions[index].lat.toFixed(6)),
          lng: Number(newPositions[index].lng.toFixed(6))
        };
        totalUpdated++;
      }
    });
    
    if (count >= 30) {
      console.log(`  Spread ${count} pincodes around [${lat}, ${lng}] with radius ${radius}° (~${Math.round(radius * 111)}km)`);
    }
  }
  
  // Save updated coordinates
  console.log(`\nSaving updated coordinates...`);
  writeFileSync(dataPath, JSON.stringify(pincodeData, null, 2));
  
  console.log(`\n✅ Done! Updated ${totalUpdated} pincode coordinates`);
  
  // Verify by checking a few examples
  console.log('\n=== Verification (Bengaluru pincodes now spread) ===');
  const bengaluruPincodes = ['560001', '560002', '560003', '560010', '560020', '560050'];
  bengaluruPincodes.forEach(pin => {
    if (pincodeData[pin]) {
      console.log(`  ${pin}: [${pincodeData[pin].lat}, ${pincodeData[pin].lng}]`);
    }
  });
}

addJitterToCoordinates().catch(console.error);
