import React from 'react';
import Header from './Header';

const Layout = ({ children, stats }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            File Anal(ai)zer Drive © 2025 - AI-Powered File Organization
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;