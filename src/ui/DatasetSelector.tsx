import { useData } from '../context/DataContext';

export function DatasetSelector() {
  const {
    config,
    currentCategory,
    currentFileIds,
    setCurrentCategory,
    setCurrentFiles,
    isLoading
  } = useData();

  if (!config) return null;

  const handleFileToggle = (fileId: string) => {
    if (currentFileIds.includes(fileId)) {
      // Don't allow deselecting the last file
      if (currentFileIds.length > 1) {
        setCurrentFiles(currentFileIds.filter(id => id !== fileId));
      }
    } else {
      setCurrentFiles([...currentFileIds, fileId]);
    }
  };

  const handleSelectAll = () => {
    if (!currentCategory) return;
    setCurrentFiles(currentCategory.files.map(f => f.id));
  };

  const handleSelectOne = (fileId: string) => {
    setCurrentFiles([fileId]);
  };

  return (
    <div className="dataset-selector">
      <div className="selector-group">
        <label>Dataset Category</label>
        <select
          value={currentCategory?.id || ''}
          onChange={(e) => setCurrentCategory(e.target.value)}
          disabled={isLoading}
        >
          {config.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {currentCategory && currentCategory.files.length > 0 && (
        <div className="selector-group">
          <label>
            Data Files
            {currentCategory.files.length > 1 && (
              <button
                className="select-all-btn"
                onClick={handleSelectAll}
                disabled={isLoading}
              >
                Select All
              </button>
            )}
          </label>
          <div className="file-list">
            {currentCategory.files.map((file) => (
              <div key={file.id} className="file-item">
                <label className="file-checkbox">
                  <input
                    type="checkbox"
                    checked={currentFileIds.includes(file.id)}
                    onChange={() => handleFileToggle(file.id)}
                    disabled={isLoading}
                  />
                  <span>{file.label}</span>
                </label>
                {currentCategory.files.length > 1 && (
                  <button
                    className="only-btn"
                    onClick={() => handleSelectOne(file.id)}
                    disabled={isLoading || (currentFileIds.length === 1 && currentFileIds[0] === file.id)}
                  >
                    Only
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
