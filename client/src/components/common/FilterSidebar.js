import React from 'react';

const FilterSidebar = ({ filters, categories, onFilterChange }) => {
  const handleCategoryChange = (category) => {
    onFilterChange({ category: filters.category === category ? '' : category });
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value);
    onFilterChange({ priceRange: newRange });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({ rating: filters.rating === rating ? 0 : rating });
  };

  const clearFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [0, 2000000],
      rating: 0
    });
  };

  const hasActiveFilters = filters.category || filters.rating > 0 || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 2000000;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="atelier-label text-atelier-charcoal font-semibold">Category</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="atelier-label text-atelier-gold"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 atelier-label text-atelier-muted hover:text-atelier-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="h-3 w-3 border-atelier-outline rounded-none text-atelier-charcoal focus:ring-0"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="atelier-label text-atelier-charcoal font-semibold mb-5">Price Range</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(0, e.target.value)}
              className="w-20 bg-transparent border-0 border-b border-atelier-outline/60 px-1 py-1 text-sm focus:ring-0 focus:border-atelier-gold"
              placeholder="0"
            />
            <span className="atelier-label text-atelier-muted">to</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(1, e.target.value)}
              className="w-24 bg-transparent border-0 border-b border-atelier-outline/60 px-1 py-1 text-sm focus:ring-0 focus:border-atelier-gold"
              placeholder="2000000"
            />
          </div>

          <div>
            <input
              type="range"
              min="0"
              max="2000000"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(1, e.target.value)}
              className="w-full h-[2px] bg-atelier-outline appearance-none cursor-pointer"
            />
            <div className="flex justify-between atelier-label text-atelier-muted mt-2">
              <span>₹0</span>
              <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="atelier-label text-atelier-charcoal font-semibold mb-5">Minimum Rating</h4>
        <div className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-3 atelier-label text-atelier-muted hover:text-atelier-charcoal cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="h-3 w-3 text-atelier-charcoal border-atelier-outline focus:ring-0"
              />
              <span>{rating}+ stars</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="atelier-label text-atelier-charcoal font-semibold mb-5">Availability</h4>
        <label className="flex items-center gap-3 atelier-label text-atelier-muted hover:text-atelier-charcoal cursor-pointer">
          <input
            type="checkbox"
            className="h-3 w-3 text-atelier-charcoal border-atelier-outline rounded-none focus:ring-0"
          />
          <span>In stock only</span>
        </label>
      </div>
    </div>
  );
};

export default FilterSidebar;
