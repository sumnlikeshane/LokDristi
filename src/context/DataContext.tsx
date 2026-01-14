import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode
} from 'react';
import { loadCSV, loadMultipleCSVs, loadDatasetsConfig } from '../data/loadCSV';
import { toGeoJSON } from '../data/normalizeData';
import { getMetricConfig, getDefaultMetricKey, getCategoryMetrics } from '../data/metricConfig';
import type { GeoDataPoint, GeoFeatureCollection, DatasetsConfig, DatasetCategory, MetricConfig } from '../data/types';

interface DataContextValue {
  // Config
  config: DatasetsConfig | null;
  
  // Data
  data: GeoDataPoint[];
  geojson: GeoFeatureCollection | null;
  
  // Current selections
  currentCategory: DatasetCategory | null;
  currentFileIds: string[];
  currentMetric: string;
  currentMetricConfig: MetricConfig | null;
  availableMetrics: Record<string, MetricConfig>;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentCategory: (categoryId: string) => void;
  setCurrentFiles: (fileIds: string[]) => void;
  setCurrentMetric: (metric: string) => void;
  loadSelectedFiles: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Config state
  const [config, setConfig] = useState<DatasetsConfig | null>(null);
  
  // Selection state
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');
  const [currentFileIds, setCurrentFileIds] = useState<string[]>([]);
  const [currentMetric, setCurrentMetric] = useState<string>('');
  
  // Data state
  const [data, setData] = useState<GeoDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const currentCategory = config?.categories.find(c => c.id === currentCategoryId) || null;
  const currentMetricConfig = config && currentCategoryId && currentMetric
    ? getMetricConfig(config, currentCategoryId, currentMetric)
    : null;
  const availableMetrics = config && currentCategoryId
    ? getCategoryMetrics(config, currentCategoryId)
    : {};

  // Load config on mount
  useEffect(() => {
    async function initConfig() {
      try {
        const loadedConfig = await loadDatasetsConfig();
        setConfig(loadedConfig);
        
        // Set default category
        if (loadedConfig.categories.length > 0) {
          const defaultCategory = loadedConfig.categories[0];
          setCurrentCategoryId(defaultCategory.id);
          
          // Set default file
          if (defaultCategory.files.length > 0) {
            setCurrentFileIds([defaultCategory.files[0].id]);
          }
          
          // Set default metric
          const defaultMetric = getDefaultMetricKey(loadedConfig, defaultCategory.id);
          if (defaultMetric) {
            setCurrentMetric(defaultMetric);
          }
        }
      } catch (err) {
        setError('Failed to load datasets configuration');
        console.error(err);
      }
    }
    
    initConfig();
  }, []);

  // Load data when files change
  const loadSelectedFiles = useCallback(async () => {
    if (!config || !currentCategory || currentFileIds.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filePaths = currentFileIds
        .map(fileId => currentCategory.files.find(f => f.id === fileId)?.path)
        .filter((path): path is string => !!path);
      
      if (filePaths.length === 0) {
        setData([]);
        return;
      }
      
      const loadedData = filePaths.length === 1
        ? await loadCSV(filePaths[0])
        : await loadMultipleCSVs(filePaths);
      
      setData(loadedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [config, currentCategory, currentFileIds]);

  // Auto-load when file selection changes
  useEffect(() => {
    if (currentFileIds.length > 0) {
      loadSelectedFiles();
    }
  }, [currentFileIds, loadSelectedFiles]);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string) => {
    if (!config) return;
    
    setCurrentCategoryId(categoryId);
    
    const category = config.categories.find(c => c.id === categoryId);
    if (category) {
      // Reset to first file of new category
      if (category.files.length > 0) {
        setCurrentFileIds([category.files[0].id]);
      } else {
        setCurrentFileIds([]);
      }
      
      // Reset to first metric of new category
      const defaultMetric = getDefaultMetricKey(config, categoryId);
      if (defaultMetric) {
        setCurrentMetric(defaultMetric);
      }
    }
  }, [config]);

  // Generate GeoJSON whenever data or metric changes - memoized for performance
  const geojson = useMemo(() => {
    if (data.length === 0 || !currentMetric) return null;
    console.log(`Generating GeoJSON for ${data.length} points, metric: ${currentMetric}`);
    return toGeoJSON(data, currentMetric);
  }, [data, currentMetric]);

  const value: DataContextValue = {
    config,
    data,
    geojson,
    currentCategory,
    currentFileIds,
    currentMetric,
    currentMetricConfig,
    availableMetrics,
    isLoading,
    error,
    setCurrentCategory: handleCategoryChange,
    setCurrentFiles: setCurrentFileIds,
    setCurrentMetric,
    loadSelectedFiles
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
