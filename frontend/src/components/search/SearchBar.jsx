import React, { useState, useEffect } from 'react';
import { Search, X, Tag as TagIcon } from 'lucide-react';
import apiService from '../../services/api';
import Tag from '../common/Tag';

const SearchBar = ({ onTagSelect, selectedTag }) => {
  const [allTags, setAllTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllTags();
        setAllTags(response.data || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = searchQuery
    ? allTags.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : allTags;

  const handleClearFilter = () => {
    onTagSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Selected Tag Display */}
      {selectedTag && (
        <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TagIcon className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              Filtering by: <strong>{selectedTag}</strong>
            </span>
          </div>
          <button
            onClick={handleClearFilter}
            className="text-primary-600 hover:text-primary-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tags List */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <TagIcon className="w-4 h-4 mr-1" />
          Available Tags ({filteredTags.length})
        </p>
        
        {loading ? (
          <p className="text-sm text-gray-500">Loading tags...</p>
        ) : filteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
            {filteredTags.map((tag) => (
              <Tag
                key={tag}
                label={tag}
                onClick={() => onTagSelect(tag)}
                active={selectedTag === tag}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {searchQuery ? 'No tags match your search' : 'No tags available yet'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;