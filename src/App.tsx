import { DataProvider } from './context/DataContext';
import MapView from './map/MapView';
import MetricSelector from './ui/MetricSelector';
import { DatasetSelector } from './ui/DatasetSelector';
import Legend from './ui/Legend';
import './index.css';

function App() {
  return (
    <DataProvider>
      <div className="app">
        <header className="app-header">
          <h1>LokDristi</h1>
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

export default App;
