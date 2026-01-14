import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Search,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';
import JSZip from 'jszip';

const datasetFiles: Record<string, string[]> = {
  enrollment: [
    '/data/enrollment/api_data_aadhar_enrolment_0_500000.csv',
    '/data/enrollment/api_data_aadhar_enrolment_500000_1000000.csv',
    '/data/enrollment/api_data_aadhar_enrolment_1000000_1006029.csv'
  ],
  biometric: [
    '/data/biometric/api_data_aadhar_biometric_0_500000.csv',
    '/data/biometric/api_data_aadhar_biometric_500000_1000000.csv',
    '/data/biometric/api_data_aadhar_biometric_1000000_1500000.csv',
    '/data/biometric/api_data_aadhar_biometric_1500000_1861108.csv'
  ],
  demographics: [
    '/data/demographics/api_data_aadhar_demographic_0_500000.csv',
    '/data/demographics/api_data_aadhar_demographic_500000_1000000.csv',
    '/data/demographics/api_data_aadhar_demographic_1000000_1500000.csv',
    '/data/demographics/api_data_aadhar_demographic_1500000_2000000.csv',
    '/data/demographics/api_data_aadhar_demographic_2000000_2071700.csv'
  ]
};

export default function InsightsPage() {
  const navigate = useNavigate();

  const datasets = [
    {
      id: 'enrollment',
      name: 'Aadhaar Enrollment',
      description: 'Enrollment statistics across India including total enrollments, updates, and regional distribution.',
      records: '1M+',
      icon: Users,
      metrics: ['Age 0-5', 'Age 5-17', 'Age 18+', 'Regional Coverage']
    },
    {
      id: 'biometric',
      name: 'Biometric Authentication',
      description: 'Biometric authentication data including fingerprint, iris, and face authentication success rates.',
      records: '1.8M+',
      icon: TrendingUp,
      metrics: ['Bio Age 5-17', 'Bio Age 17+', 'State-wise Data', 'District-wise Data']
    },
    {
      id: 'demographics',
      name: 'Demographics',
      description: 'Demographic distribution data showing age groups, gender distribution, and population segments.',
      records: '2M+',
      icon: BarChart3,
      metrics: ['Demo Age 5-17', 'Demo Age 17+', 'State Analysis', 'Pincode Data']
    }
  ];

  const handleExport = async (datasetId: string, datasetName: string) => {
    const files = datasetFiles[datasetId];
    if (!files) return;
    
    const zip = new JSZip();
    
    // Fetch all files and add to ZIP
    for (const filePath of files) {
      try {
        const response = await fetch(filePath);
        const text = await response.text();
        const fileName = filePath.split('/').pop() || 'data.csv';
        zip.file(fileName, text);
      } catch (error) {
        console.error('Failed to fetch file:', error);
      }
    }
    
    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LokDristi_${datasetName.replace(/\s+/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="insights-page">
      <header className="insights-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </button>
          <h1>Data Insights</h1>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search datasets..." />
          </div>
        </div>
      </header>

      <main className="insights-main">
        <section className="insights-intro">
          <h2>Explore the Data</h2>
          <p>
            Dive deep into India's Aadhaar infrastructure data. Access comprehensive datasets 
            covering enrollment statistics, biometric authentication patterns, and demographic 
            distributions across all states and union territories.
          </p>
        </section>

        <section className="datasets-section">
          <div className="section-header">
            <h3>Available Datasets</h3>
          </div>

          <div className="datasets-grid">
            {datasets.map((dataset) => {
              const IconComponent = dataset.icon;
              return (
                <div key={dataset.id} className="dataset-card">
                  <div className="dataset-header">
                    <div className="dataset-icon">
                      <IconComponent size={24} />
                    </div>
                    <span className="dataset-records">{dataset.records} records</span>
                  </div>
                  <h4>{dataset.name}</h4>
                  <p>{dataset.description}</p>
                  <div className="dataset-metrics">
                    {dataset.metrics.map((metric, idx) => (
                      <span key={idx} className="metric-tag">{metric}</span>
                    ))}
                  </div>
                  <div className="dataset-actions">
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/data/${dataset.id}`)}
                    >
                      <FileText size={16} />
                      View Data
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => handleExport(dataset.id, dataset.name)}
                    >
                      <Download size={16} />
                      Export
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
