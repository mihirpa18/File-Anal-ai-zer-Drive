import React, { useState } from 'react';
import { Download, Trash2, FileText, Image as ImageIcon, FileQuestion, Sparkles } from 'lucide-react';
import { formatFileSize, formatRelativeTime, isImage } from '../../utils/formatters';
import Tag from '../common/Tag';
import Button from '../common/Button';
import apiService from '../../services/api';

const FileCard = ({ file, onDelete, onTagClick }) => {
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    window.open(apiService.getDownloadUrl(file._id), '_blank');
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${file.originalName}"?`)) {
      setDeleting(true);
      await onDelete(file._id);
    }
  };

  const FileIcon = isImage(file.mimetype) ? ImageIcon : 
                  file.mimetype === 'application/pdf' ? FileText : 
                  FileQuestion;

  const showThumbnail = isImage(file.mimetype) && !imageError;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Thumbnail or Icon */}
      <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
        {showThumbnail ? (
          <img
            src={apiService.getFileUrl(file.filename)}
            alt={file.originalName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileIcon className="w-16 h-16 text-gray-400" />
        )}
        
        

        {/* Action Buttons (shown on hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            icon={Download}
          >
            Download
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            size="sm"
            icon={Trash2}
            loading={deleting}
            disabled={deleting}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1" title={file.originalName}>
          {file.originalName}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatRelativeTime(file.uploadDate)}</span>
        </div>

        {/* AI Summary */}
        {file.summary && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {file.summary}
          </p>
        )}

        {/* AI Tags */}
        {file.aiTags && file.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {file.aiTags.slice(0, 4).map((tag, index) => (
              <Tag
                key={index}
                label={tag}
                onClick={() => onTagClick(tag)}
              />
            ))}
            {file.aiTags.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-0.5">
                +{file.aiTags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* No analysis message */}
        {!file.analyzed && (
          <p className="text-xs text-gray-500 italic">
            Analysis pending...
          </p>
        )}
      </div>
    </div>
  );
};

export default FileCard;