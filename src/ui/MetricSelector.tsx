import { useData } from '../context/DataContext';

export default function MetricSelector() {
  const { currentMetric, setCurrentMetric, availableMetrics, currentMetricConfig, isLoading } = useData();
  const metricKeys = Object.keys(availableMetrics);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMetric(event.target.value);
  };

  if (metricKeys.length === 0) {
    return null;
  }

  return (
    <div className="metric-selector">
      <label htmlFor="metric-select">Metric:</label>
      <select
        id="metric-select"
        value={currentMetric}
        onChange={handleChange}
        disabled={isLoading}
      >
        {metricKeys.map((key) => (
          <option key={key} value={key}>
            {availableMetrics[key].label}
          </option>
        ))}
      </select>
      
      {currentMetricConfig && (
        <div 
          className="metric-indicator"
          style={{ 
            background: `linear-gradient(90deg, ${currentMetricConfig.color[0]}, ${currentMetricConfig.color[1]})`
          }}
        />
      )}
    </div>
  );
}
