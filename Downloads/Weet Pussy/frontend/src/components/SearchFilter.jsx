import { useState } from 'react';
import './SearchFilter.css';

export function SearchFilter({ onSearch, onFilter, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilter({ category, sortBy, sortOrder });
  };

  const handleSortChange = (newSortBy) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    onFilter({ category: selectedCategory, sortBy: newSortBy, sortOrder: newOrder });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setSortOrder('asc');
    onSearch('');
    onFilter({ category: 'all', sortBy: 'name', sortOrder: 'asc' });
  };

  return (
    <div className="search-filter">
      <div className="search-section">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search sweets..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => handleSearchChange({ target: { value: '' } })}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'Chocolate' && '🍫'} 
              {category === 'Candy' && '🍬'} 
              {category === 'Pastry' && '🥐'} 
              {category}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => handleSortChange('name')}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
            onClick={() => handleSortChange('price')}
          >
            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${sortBy === 'quantity' ? 'active' : ''}`}
            onClick={() => handleSortChange('quantity')}
          >
            Stock {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {(searchTerm || selectedCategory !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}