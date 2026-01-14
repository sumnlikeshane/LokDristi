import type { DatasetsConfig, MetricConfig } from './types';

/**
 * Get metric configuration for a specific category and metric
 */
export function getMetricConfig(
  config: DatasetsConfig,
  categoryId: string,
  metricKey: string
): MetricConfig | null {
  const category = config.categories.find(c => c.id === categoryId);
  if (!category) return null;
  return category.metrics[metricKey] || null;
}

/**
 * Get all metrics for a category
 */
export function getCategoryMetrics(
  config: DatasetsConfig,
  categoryId: string
): Record<string, MetricConfig> {
  const category = config.categories.find(c => c.id === categoryId);
  return category?.metrics || {};
}

/**
 * Get all files for a category
 */
export function getCategoryFiles(config: DatasetsConfig, categoryId: string) {
  const category = config.categories.find(c => c.id === categoryId);
  return category?.files || [];
}

/**
 * Get first metric key for a category
 */
export function getDefaultMetricKey(
  config: DatasetsConfig,
  categoryId: string
): string | null {
  const metrics = getCategoryMetrics(config, categoryId);
  const keys = Object.keys(metrics);
  return keys.length > 0 ? keys[0] : null;
}
