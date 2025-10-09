import React, { useState, useRef } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import UploadProgress from './UploadProgress';
import ErrorMessage from '../common/ErrorMessage';

const UploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { uploading, progress, error, uploadFile, reset } = useUpload(onUploadSuccess);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Error Message */}
      {error && <ErrorMessage message={error} onClose={reset} />}

      {/* Upload Progress */}
      {uploading && <UploadProgress progress={progress} />}

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-primary-400 hover:bg-primary-50
          ${isDragging ? 'border-primary-500 bg-primary-50 scale-105' : 'border-gray-300 bg-white'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
          accept="image/*,.pdf,.txt,.md,.doc,.docx"
        />

        <div className="flex flex-col items-center space-y-4">
          {isDragging ? (
            <FileUp className="w-16 h-16 text-primary-500 animate-bounce" />
          ) : (
            <Upload className="w-16 h-16 text-gray-400" />
          )}

          <div>
            <p className="text-lg font-semibold text-gray-900">
              {isDragging ? 'Drop your file here' : 'Upload a file'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop or click to browse
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">Images</span>
            <span className="px-2 py-1 bg-gray-100 rounded">PDFs</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Documents</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Max 10MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;