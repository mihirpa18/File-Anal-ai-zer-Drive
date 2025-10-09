import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // Fetch files from API
  const fetchFiles = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAllFiles(params);
      setFiles(response.data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.response?.data?.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Filter by tag
  const filterByTag = useCallback(async (tag) => {
    setSelectedTag(tag);
    if (tag) {
      await fetchFiles({ tag });
    } else {
      await fetchFiles();
    }
  }, [fetchFiles]);

  // Add file to list
  const addFile = useCallback((newFile) => {
    setFiles(prev => [newFile, ...prev]);
  }, []);

  // Remove file from list
  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(file => file._id !== fileId));
  }, []);

  // Delete file
  const deleteFile = useCallback(async (fileId) => {
    try {
      await apiService.deleteFile(fileId);
      removeFile(fileId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting file:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to delete file'
      };
    }
  }, [removeFile]);

  // Refresh files
  const refresh = useCallback(() => {
    if (selectedTag) {
      fetchFiles({ tag: selectedTag });
    } else {
      fetchFiles();
    }
  }, [fetchFiles, selectedTag]);

  return {
    files,
    loading,
    error,
    selectedTag,
    fetchFiles,
    filterByTag,
    addFile,
    removeFile,
    deleteFile,
    refresh,
  };
};