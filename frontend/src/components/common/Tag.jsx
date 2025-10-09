import React from 'react';

const Tag = ({ label, onClick, active = false, variant = 'default' }) => {
  const variants = {
    default: active 
      ? 'bg-primary-500 text-white' 
      : 'bg-primary-100 text-primary-800 hover:bg-primary-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${variants[variant]}`}
    >
      {label}
    </span>
  );
};

export default Tag;