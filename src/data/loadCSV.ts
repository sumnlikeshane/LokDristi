import Papa from 'papaparse';
import type { GeoDataPoint, PincodeLatLng, DatasetsConfig } from './types';

interface CSVRow {
  date: string;
  state: string;
  district: string;
  pincode: string;
  [key: string]: string;
}

interface PincodeEntry {
  pincode: string;
  latitude: number;
  longitude: number;
}

let pincodeCache: PincodeLatLng | null = null;

async function loadPincodeData(): Promise<PincodeLatLng> {
  if (pincodeCache) return pincodeCache;
  
  const response = await fetch('/data/pincode_latlng.json');
  const data = await response.json();
  
  // Handle both array format and object format
  if (Array.isArray(data)) {
    pincodeCache = {};
    data.forEach((entry: PincodeEntry) => {
      pincodeCache![entry.pincode] = {
        lat: entry.latitude,
        lng: entry.longitude
      };
    });
  } else {
    // Already in object format
    pincodeCache = data;
  }
  
  console.log(`Loaded ${Object.keys(pincodeCache!).length} pincode coordinates`);
  return pincodeCache!;
}

/**
 * Load datasets configuration
 */
export async function loadDatasetsConfig(): Promise<DatasetsConfig> {
  const response = await fetch('/data/datasets.json');
  return response.json();
}

/**
 * Load and parse a single CSV file
 */
export async function loadCSV(csvPath: string): Promise<GeoDataPoint[]> {
  const [csvResponse, pincodeData] = await Promise.all([
    fetch(csvPath),
    loadPincodeData()
  ]);
  
  const csvText = await csvResponse.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const dataPoints: GeoDataPoint[] = [];
        
        results.data.forEach((row, index) => {
          const pincode = row.pincode?.trim();
          const coords = pincodeData[pincode];
          
          if (!coords) {
            console.warn(`Pincode ${pincode} not found in lat/lng data (row ${index + 1})`);
            return;
          }
          
          // Extract all numeric columns as metrics
          const metrics: Record<string, number> = {};
          Object.keys(row).forEach(key => {
            if (!['date', 'state', 'district', 'pincode'].includes(key)) {
              const value = parseFloat(row[key]);
              if (!isNaN(value)) {
                metrics[key] = value;
              }
            }
          });
          
          dataPoints.push({
            id: `${pincode}-${index}`,
            date: row.date,
            state: row.state,
            district: row.district,
            pincode,
            latitude: coords.lat,
            longitude: coords.lng,
            metrics
          });
        });
        
        resolve(dataPoints);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

/**
 * Load multiple CSV files and merge data
 */
export async function loadMultipleCSVs(csvPaths: string[]): Promise<GeoDataPoint[]> {
  const allData = await Promise.all(csvPaths.map(path => loadCSV(path)));
  return allData.flat();
}
