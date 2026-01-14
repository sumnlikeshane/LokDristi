import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Database, 
  BarChart3, 
  Users, 
  Shield, 
  ArrowRight,
  Globe,
  Layers,
  FileSearch
} from 'lucide-react';
import indiaMap from '../assets/india.png';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-dot" />
          <span className="brand-text">LokDristi</span>
        </div>
      </nav>

      <main className="landing-main">
        <div className="landing-content">
          <div className="content-left">
            <div className="hero-badge">
              <Globe size={14} />
              <span>Geospatial Analytics Platform</span>
            </div>
            
            <h1 className="hero-title">
              Visualize India's
              <br />
              <span className="hero-highlight">Aadhaar Infrastructure</span>
            </h1>
            
            <p className="hero-description">
              LokDristi is an interactive geospatial visualization platform that maps 
              Aadhaar enrollment, biometric authentication, and demographic data across 
              India's diverse landscape.
            </p>

            <div className="hero-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate('/map')}
              >
                Explore the Map
                <ArrowRight size={18} />
              </button>
              <button 
                className="btn-outline"
                onClick={() => navigate('/insights')}
              >
                <FileSearch size={18} />
                Data Insights
              </button>
            </div>

            <section className="about-section">
              <h2 className="section-title">About LokDristi</h2>
              
              <div className="about-grid">
                <div className="about-card">
                  <div className="about-icon">
                    <Database size={20} />
                  </div>
                  <h3>Comprehensive Data</h3>
                  <p>
                    Access aggregated Aadhaar statistics including enrollment figures, 
                    biometric authentication rates, and demographic distributions 
                    at the pincode level.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-icon">
                    <BarChart3 size={20} />
                  </div>
                  <h3>Interactive Analytics</h3>
                  <p>
                    Dynamic heatmaps and point visualizations help identify patterns, 
                    coverage gaps, and regional variations in identity infrastructure.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-icon">
                    <Users size={20} />
                  </div>
                  <h3>Population Insights</h3>
                  <p>
                    Understand how India's identity system serves its population 
                    through granular geographic analysis and metric comparisons.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-icon">
                    <Shield size={20} />
                  </div>
                  <h3>Data Transparency</h3>
                  <p>
                    Built on publicly available datasets, LokDristi promotes 
                    transparency in understanding the reach of digital identity services.
                  </p>
                </div>
              </div>
            </section>

            <section className="features-section">
              <h2 className="section-title">Platform Capabilities</h2>
              <ul className="features-list">
                <li>
                  <Layers size={16} />
                  <span>Multi-layer visualization with heatmaps and point clusters</span>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>Pincode-level granularity across all Indian states</span>
                </li>
                <li>
                  <BarChart3 size={16} />
                  <span>Multiple metrics including enrollment, authentication, and demographics</span>
                </li>
                <li>
                  <Database size={16} />
                  <span>Dataset filtering and comparison tools</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="content-right">
            <div 
              className="map-preview"
              onClick={() => navigate('/map')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/map')}
            >
              <div className="preview-overlay">
                <div className="preview-content">
                  <MapPin size={32} />
                  <span className="preview-text">Click to explore</span>
                </div>
              </div>
              <div className="preview-image">
                <img 
                  src={indiaMap} 
                  alt="India Map" 
                  className="india-map-image"
                />
              </div>
              <div className="preview-stats">
                <div className="stat-item">
                  <span className="stat-value">19K+</span>
                  <span className="stat-label">Pincodes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">36</span>
                  <span className="stat-label">States/UTs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">3</span>
                  <span className="stat-label">Datasets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>LokDristi — Open-source geospatial visualization</p>
      </footer>
    </div>
  );
}
