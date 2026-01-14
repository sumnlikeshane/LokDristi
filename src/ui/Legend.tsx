import { useMemo } from 'react';
import { useData } from '../context/DataContext';

// Multi-stop gradients matching HeatmapLayer for accurate representation
const LEGEND_GRADIENTS = {
  blue: 'linear-gradient(90deg, rgba(158, 202, 225, 0.3) 0%, rgba(107, 174, 214, 0.5) 15%, rgba(66, 146, 198, 0.65) 30%, rgba(33, 113, 181, 0.75) 45%, rgba(8, 81, 156, 0.85) 60%, rgba(8, 48, 107, 0.95) 80%, rgba(3, 19, 43, 1) 100%)',
  green: 'linear-gradient(90deg, rgba(199, 233, 192, 0.3) 0%, rgba(161, 217, 155, 0.5) 15%, rgba(116, 196, 118, 0.65) 30%, rgba(65, 171, 93, 0.75) 45%, rgba(35, 139, 69, 0.85) 60%, rgba(0, 90, 50, 0.95) 80%, rgba(0, 50, 30, 1) 100%)',
  orange: 'linear-gradient(90deg, rgba(255, 245, 210, 0.3) 0%, rgba(254, 227, 145, 0.5) 15%, rgba(254, 196, 79, 0.65) 30%, rgba(254, 153, 41, 0.75) 45%, rgba(236, 112, 20, 0.85) 60%, rgba(204, 76, 2, 0.95) 80%, rgba(140, 45, 4, 1) 100%)',
  red: 'linear-gradient(90deg, rgba(254, 229, 217, 0.3) 0%, rgba(252, 187, 161, 0.5) 15%, rgba(252, 146, 114, 0.65) 30%, rgba(251, 106, 74, 0.75) 45%, rgba(222, 45, 38, 0.85) 60%, rgba(165, 15, 21, 0.95) 80%, rgba(103, 0, 13, 1) 100%)',
  purple: 'linear-gradient(90deg, rgba(239, 237, 245, 0.3) 0%, rgba(218, 218, 235, 0.5) 15%, rgba(188, 189, 220, 0.65) 30%, rgba(158, 154, 200, 0.75) 45%, rgba(117, 107, 177, 0.85) 60%, rgba(84, 39, 143, 0.95) 80%, rgba(63, 0, 125, 1) 100%)'
};

function getGradientType(color: [string, string]): keyof typeof LEGEND_GRADIENTS {
  const primaryColor = color[1].toLowerCase();
  if (primaryColor.includes('blue') || primaryColor.includes('00f') || primaryColor.includes('0000ff')) return 'blue';
  if (primaryColor.includes('green') || primaryColor.includes('0f0') || primaryColor.includes('00ff00')) return 'green';
  if (primaryColor.includes('orange') || primaryColor.includes('ff8') || primaryColor.includes('ffa')) return 'orange';
  if (primaryColor.includes('red') || primaryColor.includes('f00') || primaryColor.includes('ff0000')) return 'red';
  if (primaryColor.includes('purple') || primaryColor.includes('violet') || primaryColor.includes('800')) return 'purple';
  if (primaryColor.startsWith('#')) {
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    if (r > 200 && g > 100) return 'orange';
  }
  return 'blue';
}

export default function Legend() {
  const { currentMetric, data, currentMetricConfig } = useData();
  
  // Memoize min/max calculation to prevent recalculation on every render
  const { minValue, maxValue } = useMemo(() => {
    if (data.length === 0) return { minValue: 0, maxValue: 0 };
    
    let min = Infinity;
    let max = -Infinity;
    
    for (const d of data) {
      const value = d.metrics[currentMetric] || 0;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    
    return { 
      minValue: min === Infinity ? 0 : min, 
      maxValue: max === -Infinity ? 0 : max 
    };
  }, [data, currentMetric]);
  
  const gradient = useMemo(() => {
    if (!currentMetricConfig) return LEGEND_GRADIENTS.blue;
    return LEGEND_GRADIENTS[getGradientType(currentMetricConfig.color)];
  }, [currentMetricConfig]);
  
  if (!currentMetricConfig) return null;

  return (
    <div className="legend">
      <h4 className="legend-title">{currentMetricConfig.label}</h4>
      
      <div className="legend-gradient">
        <div
          className="gradient-bar"
          style={{ background: gradient }}
        />
        <div className="gradient-labels">
          <span>{minValue.toLocaleString()}</span>
          <span>{Math.round((maxValue - minValue) / 2 + minValue).toLocaleString()}</span>
          <span>{maxValue.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="legend-info">
        <p>
          <strong>Zoom out:</strong> Area gradient view
        </p>
        <p>
          <strong>Zoom in:</strong> Individual pincodes
        </p>
      </div>
    </div>
  );
}
