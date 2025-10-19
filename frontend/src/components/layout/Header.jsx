import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = ({ stats }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                Personal Cloud
                <Sparkles className="w-5 h-5 ml-2 text-yellow-500" />
              </h1>
              <p className="text-sm text-gray-600">AI-powered storage & organization</p>
            </div>
          </div>

          {/* User Info and Stats */}
          <div className="flex items-center space-x-6">
            {/* Stats */}
            {stats && (
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{stats.totalFiles || 0}</p>
                  <p className="text-gray-600">Files</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.analyzedFiles || 0}</p>
                  <p className="text-gray-600">Analyzed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalSize ? (stats.totalSize / (1024 * 1024)).toFixed(1) : 0}MB
                  </p>
                  <p className="text-gray-600">Storage</p>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                icon={LogOut}
                className="text-gray-600 hover:text-red-600"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;