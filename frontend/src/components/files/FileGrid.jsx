import React from 'react';
import FileCard from './FileCard';
import EmptyState from './EmptyState';
import Loading from '../common/Loading';

const FileGrid = ({ files, loading, onDelete, onTagClick, hasFilter }) => {
  if (loading) {
    return (
      <div className="py-12">
        <Loading size="lg" text="Loading your files..." />
      </div>
    );
  }

  if (!files || files.length === 0) {
    return <EmptyState hasFilter={hasFilter} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file) => (
        <FileCard
          key={file._id}
          file={file}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};

export default FileGrid;