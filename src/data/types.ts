// Types for the multi-dataset system

export interface MetricConfig {
  label: string;
  color: [string, string];
  heatRadius: number;
}

export interface DatasetFile {
  id: string;
  label: string;
  path: string;
}

export interface DatasetCategory {
  id: string;
  label: string;
  metrics: Record<string, MetricConfig>;
  files: DatasetFile[];
}

export interface DatasetsConfig {
  categories: DatasetCategory[];
}

export interface GeoDataPoint {
  id: string;
  date: string;
  state: string;
  district: string;
  pincode: string;
  latitude: number;
  longitude: number;
  metrics: Record<string, number>;
}

export interface PincodeLatLng {
  [pincode: string]: {
    lat: number;
    lng: number;
  };
}

// GeoJSON types for map rendering
export interface GeoFeatureProperties {
  id: string;
  state: string;
  district: string;
  pincode: string;
  value: number;
  date?: string;
  count?: number;
  [key: string]: string | number | undefined;
}

export type GeoFeature = GeoJSON.Feature<GeoJSON.Point, GeoFeatureProperties>;
export type GeoFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point, GeoFeatureProperties>;

