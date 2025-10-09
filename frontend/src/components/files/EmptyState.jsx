import React from 'react';
import { FolderOpen, Upload } from 'lucide-react';

const EmptyState = ({ hasFilter = false }) => {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
        <FolderOpen className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasFilter ? 'No files found' : 'No files yet'}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {hasFilter 
          ? 'Try a different tag or clear your filter to see all files.'
          : 'Upload your first file to get started with AI-powered organization.'}
      </p>

      {!hasFilter && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Upload className="w-4 h-4" />
          <span>Drag and drop files above to upload</span>
        </div>
      )}
    </div>
  );
};

export default EmptyState;