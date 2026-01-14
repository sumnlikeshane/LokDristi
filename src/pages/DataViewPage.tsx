import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  FileSpreadsheet
} from 'lucide-react';
import Papa from 'papaparse';
import JSZip from 'jszip';

interface DatasetFile {
  id: string;
  label: string;
  path: string;
}

interface Category {
  id: string;
  label: string;
  files: DatasetFile[];
}

interface DataRow {
  [key: string]: string | number;
}

export default function DataViewPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<DatasetFile | null>(null);
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Load categories
  useEffect(() => {
    fetch('/data/datasets.json')
      .then(res => res.json())
      .then(json => {
        setCategories(json.categories);
      });
  }, []);

  // Get current category
  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === categoryId);
  }, [categories, categoryId]);

  // Set initial file from URL params or first file
  useEffect(() => {
    if (currentCategory) {
      const fileId = searchParams.get('file');
      const file = currentCategory.files.find(f => f.id === fileId) || currentCategory.files[0];
      if (file && (!selectedFile || selectedFile.id !== file.id)) {
        setSelectedFile(file);
      }
    }
  }, [currentCategory, searchParams]);

  // Load CSV data when file changes
  useEffect(() => {
    if (selectedFile) {
      setLoading(true);
      setCurrentPage(1);
      
      fetch(selectedFile.path)
        .then(res => res.text())
        .then(csvText => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              setColumns(results.meta.fields || []);
              setData(results.data as DataRow[]);
              setLoading(false);
            }
          });
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedFile]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleFileChange = (file: DatasetFile) => {
    setSelectedFile(file);
    setSearchParams({ file: file.id });
  };

  const handleDownload = async () => {
    if (!currentCategory || !selectedFile) return;
    
    const response = await fetch(selectedFile.path);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (!currentCategory) return;
    
    const zip = new JSZip();
    
    // Fetch all files and add to ZIP
    for (const file of currentCategory.files) {
      try {
        const response = await fetch(file.path);
        const text = await response.text();
        const fileName = file.path.split('/').pop() || 'data.csv';
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
    a.download = `LokDristi_${currentCategory.label.replace(/\\s+/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!currentCategory) {
    return (
      <div className="data-view-page">
        <header className="data-view-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/insights')}
              aria-label="Back to insights"
            >
              <ArrowLeft size={18} />
            </button>
            <h1>Loading...</h1>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="data-view-page">
      <header className="data-view-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/insights')}
            aria-label="Back to insights"
          >
            <ArrowLeft size={18} />
          </button>
          <h1>{currentCategory.label}</h1>
        </div>
        <div className="header-actions">
          <button className="btn-download" onClick={handleDownload}>
            <Download size={16} />
            Export Current
          </button>
          <button className="btn-view" onClick={handleDownloadAll}>
            <Download size={16} />
            Export All
          </button>
        </div>
      </header>

      <div className="data-view-content">
        <aside className="data-sidebar">
          <h3>Data Files</h3>
          <div className="file-list-vertical">
            {currentCategory.files.map(file => (
              <button
                key={file.id}
                className={`file-btn ${selectedFile?.id === file.id ? 'active' : ''}`}
                onClick={() => handleFileChange(file)}
              >
                <FileSpreadsheet size={16} />
                <span>{file.label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-info">
            <p><strong>Total Records:</strong> {data.length.toLocaleString()}</p>
            <p><strong>Columns:</strong> {columns.length}</p>
          </div>
        </aside>

        <main className="data-main">
          <div className="table-controls">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search in data..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="results-info">
              Showing {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length.toLocaleString()} records
            </div>
          </div>

          {loading ? (
            <div className="table-loading">
              <div className="loading-spinner" />
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {columns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map(col => (
                          <td key={col}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="page-info">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
