import { Source, Layer } from 'react-map-gl';
import type { SymbolLayerSpecification, CircleLayerSpecification } from 'mapbox-gl';

// Major Indian cities with coordinates
const MAJOR_CITIES = {
  type: 'FeatureCollection' as const,
  features: [
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [77.2090, 28.6139] }, properties: { name: 'Delhi', population: 32941000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [72.8777, 19.0760] }, properties: { name: 'Mumbai', population: 21297000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [88.3639, 22.5726] }, properties: { name: 'Kolkata', population: 15134000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [77.5946, 12.9716] }, properties: { name: 'Bengaluru', population: 13193000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [80.2707, 13.0827] }, properties: { name: 'Chennai', population: 11503000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [78.4867, 17.3850] }, properties: { name: 'Hyderabad', population: 10534000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [72.5714, 23.0225] }, properties: { name: 'Ahmedabad', population: 8450000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [73.8567, 18.5204] }, properties: { name: 'Pune', population: 6987000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [75.7873, 26.9124] }, properties: { name: 'Jaipur', population: 4107000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [80.9462, 26.8467] }, properties: { name: 'Lucknow', population: 3854000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [80.3319, 26.4499] }, properties: { name: 'Kanpur', population: 3124000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [79.0882, 21.1458] }, properties: { name: 'Nagpur', population: 2893000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [73.0169, 26.2389] }, properties: { name: 'Jodhpur', population: 1476000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [75.8577, 22.7196] }, properties: { name: 'Indore', population: 2464000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [77.4126, 23.2599] }, properties: { name: 'Bhopal', population: 2117000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [85.1376, 25.5941] }, properties: { name: 'Patna', population: 2482000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [83.0007, 25.3176] }, properties: { name: 'Varanasi', population: 1535000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [76.7794, 30.7333] }, properties: { name: 'Chandigarh', population: 1158000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [74.8723, 31.6340] }, properties: { name: 'Amritsar', population: 1183000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [75.7885, 11.2588] }, properties: { name: 'Kozhikode', population: 2030000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [76.2711, 9.9312] }, properties: { name: 'Kochi', population: 2185000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [76.9558, 8.5241] }, properties: { name: 'Thiruvananthapuram', population: 1060000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [91.7362, 26.1445] }, properties: { name: 'Guwahati', population: 1116000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [85.8245, 20.2961] }, properties: { name: 'Bhubaneswar', population: 1090000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [78.0421, 27.1767] }, properties: { name: 'Agra', population: 1867000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [74.6399, 16.7050] }, properties: { name: 'Kolhapur', population: 614000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [73.1812, 22.3072] }, properties: { name: 'Vadodara', population: 2150000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [72.8311, 21.1702] }, properties: { name: 'Surat', population: 7784000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [78.6569, 10.7905] }, properties: { name: 'Tiruchirappalli', population: 1022000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [78.1198, 9.9252] }, properties: { name: 'Madurai', population: 1561000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [74.2179, 15.4909] }, properties: { name: 'Goa', population: 640000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [77.5385, 34.1526] }, properties: { name: 'Leh', population: 35000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [77.1734, 31.1048] }, properties: { name: 'Shimla', population: 206000 } },
    { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [79.4192, 28.3670] }, properties: { name: 'Bareilly', population: 1095000 } },
  ]
};

// City dot style - small white dots with glow
const cityDotStyle: CircleLayerSpecification = {
  id: 'cities-dot',
  type: 'circle',
  source: 'cities',
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, 3,
      6, 5,
      10, 7
    ],
    'circle-color': '#ffffff',
    'circle-opacity': 0.9,
    'circle-stroke-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, 1,
      6, 2,
      10, 3
    ],
    'circle-stroke-color': 'rgba(0, 0, 0, 0.5)',
    'circle-blur': 0.2
  }
};

// City label style
const cityLabelStyle: SymbolLayerSpecification = {
  id: 'cities-label',
  type: 'symbol',
  source: 'cities',
  layout: {
    'text-field': ['get', 'name'],
    'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
    'text-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, 10,
      6, 12,
      10, 14
    ],
    'text-offset': [0, 1.2],
    'text-anchor': 'top',
    'text-max-width': 8,
    'text-allow-overlap': false,
    'text-ignore-placement': false,
    'symbol-sort-key': ['get', 'population']
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': 'rgba(0, 0, 0, 0.8)',
    'text-halo-width': 1.5,
    'text-halo-blur': 0.5,
    'text-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, 0.9,
      8, 1
    ]
  }
};

export default function CitiesLayer() {
  return (
    <Source id="cities" type="geojson" data={MAJOR_CITIES}>
      <Layer {...cityDotStyle} />
      <Layer {...cityLabelStyle} />
    </Source>
  );
}
