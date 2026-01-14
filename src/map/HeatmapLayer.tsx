import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import { useData } from '../context/DataContext';
import type { HeatmapLayerSpecification, CircleLayerSpecification } from 'mapbox-gl';

// Multi-stop color gradients for better differentiation (like weather radar)
const WEATHER_GRADIENTS = {
  blue: [
    'rgba(0, 0, 0, 0)',           // 0.0 - transparent
    'rgba(158, 202, 225, 0.25)',  // 0.05 - very light blue
    'rgba(107, 174, 214, 0.4)',   // 0.15 - light blue
    'rgba(66, 146, 198, 0.55)',   // 0.3 - medium light blue
    'rgba(33, 113, 181, 0.7)',    // 0.45 - medium blue
    'rgba(8, 81, 156, 0.8)',      // 0.6 - blue
    'rgba(8, 48, 107, 0.9)',      // 0.8 - dark blue
    'rgba(3, 19, 43, 1)'          // 1.0 - darkest
  ],
  green: [
    'rgba(0, 0, 0, 0)',
    'rgba(199, 233, 192, 0.25)',
    'rgba(161, 217, 155, 0.4)',
    'rgba(116, 196, 118, 0.55)',
    'rgba(65, 171, 93, 0.7)',
    'rgba(35, 139, 69, 0.8)',
    'rgba(0, 90, 50, 0.9)',
    'rgba(0, 50, 30, 1)'
  ],
  orange: [
    'rgba(0, 0, 0, 0)',
    'rgba(255, 245, 210, 0.25)',
    'rgba(254, 227, 145, 0.4)',
    'rgba(254, 196, 79, 0.55)',
    'rgba(254, 153, 41, 0.7)',
    'rgba(236, 112, 20, 0.8)',
    'rgba(204, 76, 2, 0.9)',
    'rgba(140, 45, 4, 1)'
  ],
  red: [
    'rgba(0, 0, 0, 0)',
    'rgba(254, 229, 217, 0.25)',
    'rgba(252, 187, 161, 0.4)',
    'rgba(252, 146, 114, 0.55)',
    'rgba(251, 106, 74, 0.7)',
    'rgba(222, 45, 38, 0.8)',
    'rgba(165, 15, 21, 0.9)',
    'rgba(103, 0, 13, 1)'
  ],
  purple: [
    'rgba(0, 0, 0, 0)',
    'rgba(239, 237, 245, 0.25)',
    'rgba(218, 218, 235, 0.4)',
    'rgba(188, 189, 220, 0.55)',
    'rgba(158, 154, 200, 0.7)',
    'rgba(117, 107, 177, 0.8)',
    'rgba(84, 39, 143, 0.9)',
    'rgba(63, 0, 125, 1)'
  ]
};

// Map metric colors to gradient type
function getGradientType(color: [string, string]): keyof typeof WEATHER_GRADIENTS {
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

export default function HeatmapLayer() {
  const { geojson, currentMetricConfig, data, currentMetric } = useData();
  
  // Calculate statistics for better weight distribution
  const { minValue, maxValue, medianValue } = useMemo(() => {
    if (data.length === 0) return { minValue: 0, maxValue: 1000, medianValue: 500 };
    
    const values: number[] = [];
    for (const d of data) {
      const value = d.metrics[currentMetric] || 0;
      values.push(value);
    }
    
    values.sort((a, b) => a - b);
    const min = values[0];
    const max = values[values.length - 1];
    const median = values[Math.floor(values.length / 2)];
    
    return { 
      minValue: min, 
      maxValue: max,
      medianValue: median
    };
  }, [data, currentMetric]);
  
  // Memoize layer styles
  const { heatmapStyle, pointsStyle } = useMemo(() => {
    if (!currentMetricConfig) return { heatmapStyle: null, pointsStyle: null };
    
    const gradientType = getGradientType(currentMetricConfig.color);
    const gradient = WEATHER_GRADIENTS[gradientType];
    
    // Use logarithmic-like scaling for better differentiation
    // This helps when data has high variance
    const range = maxValue - minValue;
    const lowThreshold = minValue + range * 0.1;
    const midLowThreshold = minValue + range * 0.3;
    const midThreshold = minValue + range * 0.5;
    const midHighThreshold = minValue + range * 0.7;
    const highThreshold = minValue + range * 0.9;
    
    const heatmap: HeatmapLayerSpecification = {
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'data-source',
      maxzoom: 9,
      paint: {
        // Multi-stop weight for better color distribution
        'heatmap-weight': [
          'interpolate',
          ['exponential', 0.5], // Use exponential for better low-value visibility
          ['get', 'value'],
          minValue, 0,
          lowThreshold, 0.15,
          midLowThreshold, 0.35,
          midThreshold, 0.5,
          midHighThreshold, 0.7,
          highThreshold, 0.85,
          maxValue, 1
        ],
        // Smaller radius for more distinct regions
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          3, 8,
          4, 12,
          5, 18,
          6, 25,
          7, 35,
          8, 50,
          9, 70
        ],
        // Lower intensity to prevent over-saturation
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.1,
          3, 0.2,
          4, 0.3,
          5, 0.4,
          6, 0.5,
          7, 0.6,
          8, 0.7,
          9, 0.8
        ],
        // 8-stop gradient for smoother color transitions
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, gradient[0],
          0.05, gradient[1],
          0.15, gradient[2],
          0.3, gradient[3],
          0.45, gradient[4],
          0.6, gradient[5],
          0.8, gradient[6],
          1, gradient[7]
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0.85,
          5, 0.8,
          7, 0.5,
          8, 0.25,
          9, 0
        ]
      }
    };
    
    // Circle points when zoomed in
    const points: CircleLayerSpecification = {
      id: 'points-layer',
      type: 'circle',
      source: 'data-source',
      minzoom: 6,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, ['interpolate', ['linear'], ['get', 'value'], minValue, 2, maxValue, 6],
          8, ['interpolate', ['linear'], ['get', 'value'], minValue, 4, maxValue, 10],
          10, ['interpolate', ['linear'], ['get', 'value'], minValue, 6, maxValue, 14],
          14, ['interpolate', ['linear'], ['get', 'value'], minValue, 10, maxValue, 24]
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          minValue, gradient[2],
          medianValue, gradient[4],
          maxValue, gradient[7]
        ],
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 0,
          7, 0.4,
          8, 0.75,
          9, 0.9
        ],
        'circle-stroke-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 0.5,
          10, 1.5,
          14, 2
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 0,
          7, 0.3,
          8, 0.6,
          9, 0.8
        ]
      }
    };
    
    return { heatmapStyle: heatmap, pointsStyle: points };
  }, [currentMetricConfig, minValue, maxValue, medianValue]);
  
  if (!geojson || !heatmapStyle || !pointsStyle) return null;
  
  return (
    <Source id="data-source" type="geojson" data={geojson}>
      <Layer {...heatmapStyle} />
      <Layer {...pointsStyle} />
    </Source>
  );
}
