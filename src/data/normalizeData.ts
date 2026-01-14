import type { GeoDataPoint, GeoFeatureCollection } from './types';

interface AggregatedPoint {
  pincode: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  metrics: Record<string, number>;
  count: number;
}

/**
 * Aggregate data points by pincode to reduce the number of features
 * This dramatically improves performance for large datasets
 */
export function aggregateByPincode(data: GeoDataPoint[]): AggregatedPoint[] {
  const aggregated = new Map<string, AggregatedPoint>();
  
  for (const point of data) {
    const existing = aggregated.get(point.pincode);
    
    if (existing) {
      // Sum up metrics
      for (const [key, value] of Object.entries(point.metrics)) {
        existing.metrics[key] = (existing.metrics[key] || 0) + value;
      }
      existing.count++;
    } else {
      aggregated.set(point.pincode, {
        pincode: point.pincode,
        state: point.state,
        district: point.district,
        latitude: point.latitude,
        longitude: point.longitude,
        metrics: { ...point.metrics },
        count: 1
      });
    }
  }
  
  return Array.from(aggregated.values());
}

/**
 * Convert aggregated data points to GeoJSON FeatureCollection
 */
export function toGeoJSON(
  data: GeoDataPoint[],
  currentMetric: string
): GeoFeatureCollection {
  // Aggregate by pincode first to reduce feature count
  const aggregated = aggregateByPincode(data);
  
  return {
    type: 'FeatureCollection',
    features: aggregated.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
      },
      properties: {
        id: point.pincode,
        state: point.state,
        district: point.district,
        pincode: point.pincode,
        value: point.metrics[currentMetric] || 0,
        count: point.count
      }
    }))
  };
}
