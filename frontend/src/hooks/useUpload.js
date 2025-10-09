import { useState, useCallback } from 'react';
import apiService from '../services/api';
import { validateFile } from '../utils/validators';

export const useUpload = (onSuccess) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return { success: false, error: validation.error };
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setUploadedFile(null);

      // Upload with progress tracking
      const response = await apiService.uploadFile(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      });

      if (response.success) {
        setUploadedFile(response.data);
        setProgress(100);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Reset after short delay
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          setUploadedFile(null);
        }, 2000);

        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to upload file';
      setError(errorMessage);
      setUploading(false);
      setProgress(0);
      return { success: false, error: errorMessage };
    }
  }, [onSuccess]);

  // Reset upload state
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedFile,
    uploadFile,
    reset,
  };
};