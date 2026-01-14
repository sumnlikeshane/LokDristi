import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Database,
  AlertTriangle,
  Activity,
  Globe,
  Layers,
  Target
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
      description: 'Entry into the identity system — 5.43M individuals tracked across age groups.',
      records: '1M+',
      icon: Users,
      metrics: ['Age 0-5', 'Age 5-17', 'Age 18+', 'Regional Coverage']
    },
    {
      id: 'biometric',
      name: 'Biometric Authentication',
      description: 'Active interaction with state and market services — 69.76M authentications.',
      records: '1.86M',
      icon: TrendingUp,
      metrics: ['Bio Age 5-17', 'Bio Age 17+', 'State-wise Data', 'District-wise Data']
    },
    {
      id: 'demographics',
      name: 'Demographics',
      description: 'The population substrate on which Aadhaar operates — 49.29M population mapped.',
      records: '2.07M',
      icon: BarChart3,
      metrics: ['Demo Age 5-17', 'Demo Age 17+', 'State Analysis', 'Pincode Data']
    }
  ];

  const handleExport = async (datasetId: string, datasetName: string) => {
    const files = datasetFiles[datasetId];
    if (!files) return;
    
    const zip = new JSZip();
    
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

  const handleExportAll = async () => {
    const zip = new JSZip();
    
    for (const [category, files] of Object.entries(datasetFiles)) {
      const folder = zip.folder(category);
      for (const filePath of files) {
        try {
          const response = await fetch(filePath);
          const text = await response.text();
          const fileName = filePath.split('/').pop() || 'data.csv';
          folder?.file(fileName, text);
        } catch (error) {
          console.error('Failed to fetch file:', error);
        }
      }
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LokDristi_Complete_Dataset.zip';
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
          <button className="btn-export-all" onClick={handleExportAll}>
            <Download size={16} />
            Export All Data
          </button>
        </div>
      </header>

      <main className="insights-main">
        {/* Hero Summary */}
        <section className="report-hero">
          <div className="hero-content">
            <span className="hero-badge">Comprehensive Analysis</span>
            <h2>Aadhaar: India's Living Administrative System</h2>
            <p>
              A deep-dive into enrollment, biometric authentication, and demographic patterns 
              based on ~4.94 million records, ~124.5 million data points, spanning 19,742 pincodes 
              and 68 state/territorial identifiers.
            </p>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="metrics-overview">
          <div className="metric-card">
            <Database size={20} />
            <div className="metric-info">
              <span className="metric-value">4.94M</span>
              <span className="metric-label">Total Records</span>
            </div>
          </div>
          <div className="metric-card">
            <MapPin size={20} />
            <div className="metric-info">
              <span className="metric-value">19,742</span>
              <span className="metric-label">Unique Pincodes</span>
            </div>
          </div>
          <div className="metric-card">
            <Globe size={20} />
            <div className="metric-info">
              <span className="metric-value">68</span>
              <span className="metric-label">States/UTs</span>
            </div>
          </div>
          <div className="metric-card">
            <Layers size={20} />
            <div className="metric-info">
              <span className="metric-value">124.5M</span>
              <span className="metric-label">Data Points</span>
            </div>
          </div>
        </section>

        {/* Narrative: Aadhaar as Infrastructure */}
        <section className="narrative-section">
          <p>
            In the last decade, Aadhaar has evolved from a technocratic identity project into one of the most 
            consequential instruments of state capacity in India. It is no longer merely a number—it is 
            <em>infrastructure</em>. It mediates welfare delivery, enables financial inclusion, governs 
            authentication for public and private services, and quietly maps the contours of inclusion and exclusion.
          </p>
        </section>

        {/* Dataset Composition Table */}
        <section className="insight-section">
          <div className="section-title">
            <Database size={18} />
            <h3>Dataset Composition</h3>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Records</th>
                  <th>Total Count</th>
                  <th>Key Insight</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="table-badge enrollment">Enrollment</span></td>
                  <td>1.0M</td>
                  <td>5.43M individuals</td>
                  <td>Identity capture at scale</td>
                </tr>
                <tr>
                  <td><span className="table-badge biometric">Biometric</span></td>
                  <td>1.86M</td>
                  <td>69.76M authentications</td>
                  <td>Usage-heavy, not enrollment-heavy</td>
                </tr>
                <tr>
                  <td><span className="table-badge demographics">Demographics</span></td>
                  <td>2.07M</td>
                  <td>49.29M population</td>
                  <td>Population substrate mapped</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="table-insight">
            Aadhaar is no longer enrollment-heavy—it is <strong>usage-heavy</strong>. The system has succeeded 
            in identity capture; the challenge now is identity activation and service linkage.
          </p>
        </section>

        {/* Narrative: The Age Paradox */}
        <section className="narrative-section">
          <p>
            One of the most revealing contradictions in the data is what might be called the <em>Age Paradox</em>: 
            India is registering identity early, but activating it late. Children are enrolled en masse—often at 
            birth or during immunization—but real interaction with the Aadhaar ecosystem happens only when citizens 
            enter labour markets, welfare systems, and financial networks. Aadhaar, therefore, is less a childhood 
            identity and more a <em>threshold into citizenship utility</em>.
          </p>
        </section>

        {/* Age Distribution Analysis */}
        <section className="insight-section">
          <div className="section-title">
            <Users size={18} />
            <h3>Age Structure Analysis</h3>
          </div>
          <div className="split-insight">
            <div className="insight-block">
              <h4>Enrollment by Age</h4>
              <p className="insight-desc">Identity creation happens early, not continuously</p>
              <div className="progress-bars">
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Age 0–5</span>
                    <span className="progress-value">65.25%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width: '65.25%'}}></div></div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Age 5–17</span>
                    <span className="progress-value">31.65%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width: '31.65%'}}></div></div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Age 18+</span>
                    <span className="progress-value">3.1%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width: '3.1%'}}></div></div>
                </div>
              </div>
            </div>
            <div className="insight-block">
              <h4>Biometric Usage by Age</h4>
              <p className="insight-desc">Adults dominate system usage despite children dominating enrollment</p>
              <div className="progress-bars">
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Adults (17+)</span>
                    <span className="progress-value">50.94%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill accent" style={{width: '50.94%'}}></div></div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Youth (5–17)</span>
                    <span className="progress-value">49.06%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill accent" style={{width: '49.06%'}}></div></div>
                </div>
              </div>
              <p className="insight-note">
                Aadhaar becomes operationally relevant when individuals enter welfare systems, 
                labour markets, and financial networks.
              </p>
            </div>
          </div>
        </section>

        {/* Narrative: Continental Scale */}
        <section className="narrative-section">
          <p>
            India's Aadhaar footprint mirrors its civilizational scale. The asymmetry across regions is not 
            accidental—it reflects population gravity, historical state penetration, infrastructure density, 
            and political prioritization. India, once again, behaves less like a nation-state and more like 
            a <em>federation of unequal administrative worlds</em>.
          </p>
        </section>

        {/* Regional Distribution Table */}
        <section className="insight-section">
          <div className="section-title">
            <Globe size={18} />
            <h3>Regional Distribution</h3>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Enrollment</th>
                  <th>Biometric</th>
                  <th>Demographics</th>
                  <th>Observation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>North</strong></td>
                  <td>32.1%</td>
                  <td>29.1%</td>
                  <td>32.4%</td>
                  <td className="highlight">Gravitational core of Aadhaar</td>
                </tr>
                <tr>
                  <td><strong>East</strong></td>
                  <td>23.2%</td>
                  <td>17.0%</td>
                  <td>22.7%</td>
                  <td>Lower biometric-to-enrollment ratio</td>
                </tr>
                <tr>
                  <td><strong>South</strong></td>
                  <td>14.4%</td>
                  <td>20.7%</td>
                  <td>17.5%</td>
                  <td className="highlight">Punches above demographic weight</td>
                </tr>
                <tr>
                  <td><strong>West</strong></td>
                  <td>12.0%</td>
                  <td>17.9%</td>
                  <td>14.0%</td>
                  <td>High biometric intensity</td>
                </tr>
                <tr>
                  <td><strong>Northeast</strong></td>
                  <td>7.2%</td>
                  <td>2.8%</td>
                  <td>3.4%</td>
                  <td className="warning">Under-activated, not under-enrolled</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="table-insight">
            Regions with low biometric-to-population ratios are most vulnerable to service exclusion during 
            authentication-dependent rollouts.
          </p>
        </section>

        {/* Narrative: Northeast Periphery */}
        <section className="narrative-section">
          <p>
            The Northeast, despite constitutional protections and special status narratives, remains 
            <em>structurally peripheral</em>—accounting for only ~4.4% combined activity across datasets. 
            This points to infrastructural rather than demographic constraints. Border regions like Ladakh, 
            by contrast, are administratively over-indexed—identity there is geopolitical as much as social.
          </p>
        </section>

        {/* Administrative Backbone */}
        <section className="insight-section">
          <div className="section-title">
            <Target size={18} />
            <h3>Administrative Backbone States</h3>
          </div>
          <p className="section-desc">
            States consistently appearing in Top 5 across all datasets — policy stress-test zones 
            where Aadhaar-linked reforms must succeed first.
          </p>
          <div className="state-cards">
            <div className="state-card">
              <div className="state-rank">1</div>
              <div className="state-info">
                <h4>Uttar Pradesh</h4>
                <div className="state-stats">
                  <span>18.7% enrollment</span>
                  <span>13.7% biometric</span>
                  <span>17.3% demographics</span>
                </div>
                <p>~1,760 pincodes • 90 districts</p>
              </div>
            </div>
            <div className="state-card">
              <div className="state-rank">2</div>
              <div className="state-info">
                <h4>Bihar</h4>
                <p>Consistent presence across all three dimensions</p>
              </div>
            </div>
            <div className="state-card">
              <div className="state-rank">3</div>
              <div className="state-info">
                <h4>Madhya Pradesh</h4>
                <p>Deep enrollment saturation with stable biometric usage</p>
              </div>
            </div>
            <div className="state-card">
              <div className="state-rank">4</div>
              <div className="state-info">
                <h4>Maharashtra</h4>
                <p>High biometric frequency, urbanization-driven</p>
              </div>
            </div>
          </div>
          <p className="table-insight">
            These states represent different political cultures, yet converge administratively. Any national 
            reform—DBT expansion, digital health, social registries—will succeed or fail first in these geographies.
          </p>
        </section>

        {/* Narrative: UP as Republic */}
        <section className="narrative-section">
          <p>
            High biometric usage in Uttar Pradesh suggests not just population size, but deep Aadhaar entanglement 
            with daily life—ration distribution, banking services, pension delivery, employment schemes. 
            Sociopolitically, this confirms a crucial reality: <em>whoever governs Uttar Pradesh governs the 
            operational India</em>. This also explains why Aadhaar-linked policy shocks become national political 
            events when they occur here.
          </p>
        </section>

        {/* Youth Demographics */}
        <section className="insight-section">
          <div className="section-title">
            <Activity size={18} />
            <h3>Youth Demographics — Future Load Indicators</h3>
          </div>
          <p className="section-desc">
            High youth share signals future surge in biometric usage. Infrastructure planning must precede demographic maturation.
          </p>
          <div className="data-table-wrapper compact">
            <table className="data-table">
              <thead>
                <tr>
                  <th>State/UT</th>
                  <th>Youth Proportion</th>
                  <th>Implication</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ladakh</td>
                  <td><span className="highlight-value">23.98%</span></td>
                  <td>Early warning system for future load</td>
                </tr>
                <tr>
                  <td>Dadra & Nagar Haveli</td>
                  <td><span className="highlight-value">21.71%</span></td>
                  <td>Infrastructure investment priority</td>
                </tr>
                <tr>
                  <td>Puducherry</td>
                  <td>~15-16%</td>
                  <td>Moderate future load</td>
                </tr>
                <tr>
                  <td>Arunachal Pradesh</td>
                  <td>~15-16%</td>
                  <td>Border region with strategic attention</td>
                </tr>
                <tr>
                  <td>Chandigarh</td>
                  <td>~15-16%</td>
                  <td>Urban center with stable infrastructure</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Narrative: Biometric as State Presence */}
        <section className="narrative-section">
          <p>
            Average biometric usage sits at 37.48 authentications per pincode-day, but this masks sharp 
            regional contrasts. High biometric frequency correlates strongly with urbanization, banking density, 
            welfare conditionality, and labour formalization. In effect, <em>biometric data maps where the 
            Indian state is most present in everyday life</em>—not as policy intent, but as lived administrative 
            reality.
          </p>
        </section>

        {/* Data Quality Issues */}
        <section className="insight-section warning-section">
          <div className="section-title">
            <AlertTriangle size={18} />
            <h3>Data Quality Anomalies</h3>
          </div>
          <div className="warning-content">
            <div className="warning-block">
              <h4>Naming Fragmentation Risk</h4>
              <p>Same states appear under multiple spellings, creating exclusion risks in automated systems:</p>
              <div className="code-examples">
                <div className="code-row">
                  <span className="code-label">West Bengal:</span>
                  <code>West Bengal</code> <code>WESTBENGAL</code> <code>West Bangal</code> <code>West Bengli</code>
                </div>
                <div className="code-row">
                  <span className="code-label">Odisha:</span>
                  <code>Odisha</code> <code>ODISHA</code> <code>Orissa</code>
                </div>
                <div className="code-row">
                  <span className="code-label">Uttarakhand:</span>
                  <code>Uttarakhand</code> <code>Uttaranchal</code>
                </div>
              </div>
            </div>
            <div className="warning-block">
              <h4>Cross-Dataset Gaps</h4>
              <p>52 states have complete data across all three datasets. Remaining states appear in only one or two, 
              indicating incomplete pipelines and asynchronous reporting.</p>
            </div>
          </div>
        </section>

        {/* Narrative: Democratic Implications */}
        <section className="narrative-section">
          <p>
            In a welfare state increasingly driven by algorithms, naming inconsistency becomes policy failure. 
            The data reveals an India that is highly centralized in the North, operationally dependent on a 
            few mega-states, digitally deep but uneven. Digital governance does not erase regional imbalance; 
            <em>it exposes it</em>. Aadhaar has succeeded as infrastructure—but infrastructure amplifies 
            inequality unless constantly audited.
          </p>
        </section>

        {/* Key Findings */}
        <section className="insight-section highlight-section">
          <div className="section-title">
            <TrendingUp size={18} />
            <h3>Key Findings</h3>
          </div>
          <div className="findings-grid">
            <div className="finding-card">
              <div className="finding-number">01</div>
              <h4>Enrollment Maturity</h4>
              <p>Adult enrollment is residual (3.1%), indicating system maturity. Future growth comes from update frequency, not new enrollments.</p>
            </div>
            <div className="finding-card">
              <div className="finding-number">02</div>
              <h4>Usage Gap</h4>
              <p>Children dominate enrollment but adults dominate usage. Aadhaar is a functional citizenship gateway, not merely an ID.</p>
            </div>
            <div className="finding-card">
              <div className="finding-number">03</div>
              <h4>Regional Asymmetry</h4>
              <p>Northeast is under-activated, not under-enrolled. Regions with low biometric-to-population ratios face service exclusion risks.</p>
            </div>
            <div className="finding-card">
              <div className="finding-number">04</div>
              <h4>Data Hygiene Crisis</h4>
              <p>Naming fragmentation creates silent exclusions. Data hygiene is now a governance issue, not a technical one.</p>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="insight-section">
          <div className="section-title">
            <Target size={18} />
            <h3>Policy Recommendations</h3>
          </div>
          <div className="recommendations-list">
            <div className="recommendation">
              <span className="rec-number">1</span>
              <div className="rec-content">
                <h4>Shift Metrics</h4>
                <p>Track biometric failures per pincode, authentication frequency volatility, and update latency — not just enrollment counts.</p>
              </div>
            </div>
            <div className="recommendation">
              <span className="rec-number">2</span>
              <div className="rec-content">
                <h4>Standardize Identity Dictionaries</h4>
                <p>Enforce canonical state/district registries with fuzzy-matching and mandatory normalization at ingestion.</p>
              </div>
            </div>
            <div className="recommendation">
              <span className="rec-number">3</span>
              <div className="rec-content">
                <h4>Northeast Intervention</h4>
                <p>Deploy offline authentication buffers, assisted biometric centers, and reduced real-time verification dependency.</p>
              </div>
            </div>
            <div className="recommendation">
              <span className="rec-number">4</span>
              <div className="rec-content">
                <h4>Youth-Weighted Forecasting</h4>
                <p>Use demographic youth ratios to predict future authentication load, infrastructure saturation, and service demand curves.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative: Aadhaar as Mirror */}
        <section className="narrative-section conclusion">
          <p>
            Aadhaar is no longer a project—it is a <em>mirror</em>. It reflects where the state reaches, 
            whom it serves daily, where it falters quietly, and how India governs itself in practice, not theory. 
            Scale without symmetry produces stress fractures. The next phase of governance will not be about 
            who is enrolled, but about who can authenticate, who gets excluded silently, and how data integrity 
            shapes democratic outcomes.
          </p>
        </section>

        {/* Available Datasets */}
        <section className="datasets-section">
          <div className="section-header">
            <h3>Access Raw Data</h3>
            <span className="section-tag">Download & Explore</span>
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

        {/* Final Note */}
        <section className="final-note">
          <p>
            <strong>In Summary:</strong> Identity is universal, but usage is uneven and access is conditional. 
            Infrastructure determines citizenship experience. The next phase of Aadhaar governance will focus 
            not on who is enrolled, but on who can authenticate, who gets excluded silently, and how data 
            integrity shapes democratic outcomes.
          </p>
        </section>
      </main>
    </div>
  );
}
