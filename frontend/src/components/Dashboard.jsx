import React, { useState, useEffect } from 'react';
import Layout from './layout/Layout';
import UploadZone from './upload/UploadZone';
import SearchBar from './search/SearchBar';
import FileGrid from './files/FileGrid';
import { useFiles } from '../hooks/useFiles';
import apiService from '../services/api';

const Dashboard = () => {
  const {
    files,
    loading,
    error,
    selectedTag,
    filterByTag,
    addFile,
    deleteFile,
  } = useFiles();

  const [stats, setStats] = useState(null);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getStatistics();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [files]);

  const handleUploadSuccess = (file) => {
    addFile(file);
  };

  const handleTagClick = (tag) => {
    filterByTag(tag === selectedTag ? null : tag);
  };

  const handleDelete = async (fileId) => {
    const result = await deleteFile(fileId);
    if (!result.success) {
      alert(result.error || 'Failed to delete file');
    }
  };

  return (
    <Layout stats={stats}>
      <div className="space-y-8">
        {/* Upload Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Upload Files
          </h2>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Search and Filter Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Search & Filter
          </h2>
          <SearchBar
            onTagSelect={handleTagClick}
            selectedTag={selectedTag}
          />
        </section>

        {/* Files Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Files {selectedTag && `(${selectedTag})`}
            </h2>
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${files.length} ${files.length === 1 ? 'file' : 'files'}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <FileGrid
            files={files}
            loading={loading}
            onDelete={handleDelete}
            onTagClick={handleTagClick}
            hasFilter={!!selectedTag}
          />
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;