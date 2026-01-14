import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import InsightsPage from './pages/InsightsPage';
import DataViewPage from './pages/DataViewPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/data/:categoryId" element={<DataViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
