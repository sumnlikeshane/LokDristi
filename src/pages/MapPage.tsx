import { DataProvider } from '../context/DataContext';
import MapView from '../map/MapView';
import MetricSelector from '../ui/MetricSelector';
import { DatasetSelector } from '../ui/DatasetSelector';
import Legend from '../ui/Legend';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <DataProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/')}
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </button>
            <h1>LokDristi</h1>
          </div>
          <div className="header-controls">
            <DatasetSelector />
            <MetricSelector />
          </div>
        </header>
        
        <main className="app-main">
          <MapView />
          <Legend />
        </main>
      </div>
    </DataProvider>
  );
}
