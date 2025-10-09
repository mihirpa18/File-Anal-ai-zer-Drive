import React from 'react';
import { CheckCircle, Loader } from 'lucide-react';

const UploadProgress = ({ progress }) => {
  const isComplete = progress === 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        ) : (
          <Loader className="w-6 h-6 text-primary-500 flex-shrink-0 animate-spin" />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">
              {isComplete ? 'Upload complete!' : 'Uploading...'}
            </span>
            <span className="text-sm font-semibold text-primary-600">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete ? 'bg-green-500' : 'bg-primary-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {isComplete && (
            <p className="text-xs text-gray-600 mt-2">
              AI analysis completed successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;