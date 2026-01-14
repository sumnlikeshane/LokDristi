import { useRef, useCallback } from 'react';
import Map, { type MapRef, type MapLayerMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useData } from '../context/DataContext';
import HeatmapLayer from './HeatmapLayer';
import PointsLayer from './PointsLayer';
import CitiesLayer from './CitiesLayer';
import { useTooltip } from './Tooltip';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// India center coordinates
const INDIA_CENTER = {
  longitude: 78.9629,
  latitude: 20.5937
};

export default function MapView() {
  const mapRef = useRef<MapRef>(null);
  const { isLoading, error } = useData();
  
  const { onMouseMove, onMouseLeave, tooltipContent } = useTooltip({
    mapRef
  });

  const handleMouseMove = useCallback((event: MapLayerMouseEvent) => {
    onMouseMove(event);
  }, [onMouseMove]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave();
  }, [onMouseLeave]);

  if (error) {
    return (
      <div className="map-error">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          ...INDIA_CENTER,
          zoom: 4.5
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={['points-layer']}
      >
        <HeatmapLayer />
        <PointsLayer />
        <CitiesLayer />
      </Map>
      
      {tooltipContent}
      
      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner" />
          <p>Loading data...</p>
        </div>
      )}
    </div>
  );
}
