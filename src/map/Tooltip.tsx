import { useState, useCallback } from 'react';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl';
import { useData } from '../context/DataContext';
import type { GeoFeatureProperties } from '../data/types';

interface TooltipState {
  x: number;
  y: number;
  properties: GeoFeatureProperties | null;
}

interface UseTooltipProps {
  mapRef: React.RefObject<MapRef | null>;
}

export function useTooltip({ mapRef }: UseTooltipProps) {
  const { currentMetricConfig } = useData();
  const [tooltip, setTooltip] = useState<TooltipState>({
    x: 0,
    y: 0,
    properties: null
  });

  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ['points-layer']
    });

    if (features && features.length > 0) {
      const feature = features[0];
      setTooltip({
        x: event.point.x,
        y: event.point.y,
        properties: feature.properties as GeoFeatureProperties
      });
    } else {
      setTooltip((prev) => ({ ...prev, properties: null }));
    }
  }, [mapRef]);

  const onMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, properties: null }));
  }, []);

  const tooltipContent = tooltip.properties && currentMetricConfig ? (
    <div
      className="tooltip-card"
      style={{
        position: 'absolute',
        left: tooltip.x + 10,
        top: tooltip.y + 10,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      <h4>{tooltip.properties.district}</h4>
      <p className="tooltip-state">{tooltip.properties.state}</p>
      <p className="tooltip-pincode">Pincode: {tooltip.properties.pincode}</p>
      <div className="tooltip-metric">
        <span className="metric-label">{currentMetricConfig.label}:</span>
        <span className="metric-value" style={{ color: currentMetricConfig.color[1] }}>
          {tooltip.properties.value.toLocaleString()}
        </span>
      </div>
    </div>
  ) : null;

  return {
    onMouseMove,
    onMouseLeave,
    tooltipContent
  };
}
