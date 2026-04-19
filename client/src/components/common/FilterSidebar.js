import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const normalizeCategories = (categories = []) =>
  categories.map((category) => {
    if (typeof category === 'string') {
      return {
        label: category,
        value: category,
        count: null,
      };
    }

    return {
      label: category.name || category.label || category.slug || category.value,
      value: category.slug || category.value || category.name || category.label,
      count: category.count ?? null,
    };
  });

const FilterSidebar = ({
  filters,
  categories = [],
  onFilterChange,
  priceBounds = { min: 0, max: 250000 },
}) => {
  const categoryOptions = normalizeCategories(categories);
  const presetCaps = [50000, 100000, 150000, priceBounds.max].filter(
    (value, index, array) => value >= priceBounds.min && array.indexOf(value) === index,
  );

  const clearFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [priceBounds.min, priceBounds.max],
      rating: 0,
      inStock: false,
    });
  };

  const hasActiveFilters =
    Boolean(filters.category) ||
    filters.rating > 0 ||
    filters.inStock ||
    filters.priceRange[0] > priceBounds.min ||
    filters.priceRange[1] < priceBounds.max;

  return (
    <div className="rounded-[28px] border border-atelier-outline/30 bg-white/90 backdrop-blur-sm p-5 md:p-6 space-y-7 shadow-[0_24px_70px_-48px_rgba(26,26,27,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="atelier-label text-atelier-gold mb-3">Refine</p>
          <h3 className="font-headline text-[28px] leading-none">Build Your Edit</h3>
          <p className="text-sm mt-3 text-atelier-muted">
            Narrow the vault by category, price, rating, and stock.
          </p>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="atelier-label text-atelier-gold">
            Reset
          </button>
        )}
      </div>

      <div>
        <h4 className="atelier-label text-atelier-charcoal font-semibold mb-4">Categories</h4>
        <div className="space-y-3">
          {categoryOptions.map((category) => {
            const active = filters.category === category.value;

            return (
              <button
                key={category.value}
                onClick={() =>
                  onFilterChange({
                    category: active ? '' : category.value,
                  })
                }
                className={`w-full flex items-center justify-between border px-4 py-2.5 text-left transition-colors ${
                  active
                    ? 'border-atelier-charcoal bg-atelier-charcoal text-white'
                    : 'border-atelier-outline/35 bg-atelier-surface-low text-atelier-charcoal hover:border-atelier-gold/40'
                }`}
              >
                <span className="atelier-label">{category.label}</span>
                {category.count !== null && (
                  <span className={`text-xs ${active ? 'text-white/75' : 'text-atelier-muted'}`}>
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="atelier-label text-atelier-charcoal font-semibold">Price Range</h4>
          <span className="text-sm text-atelier-muted">
            {formatCurrency(filters.priceRange[0])} to {formatCurrency(filters.priceRange[1])}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="number"
            value={filters.priceRange[0]}
            min={priceBounds.min}
            max={filters.priceRange[1]}
            onChange={(event) =>
              onFilterChange({
                priceRange: [
                  Math.min(Number(event.target.value || priceBounds.min), filters.priceRange[1]),
                  filters.priceRange[1],
                ],
              })
            }
            className="w-full bg-atelier-surface-low border border-atelier-outline/35 px-3 py-2.5 text-sm focus:border-atelier-gold focus:ring-0"
          />
          <input
            type="number"
            value={filters.priceRange[1]}
            min={filters.priceRange[0]}
            max={priceBounds.max}
            onChange={(event) =>
              onFilterChange({
                priceRange: [
                  filters.priceRange[0],
                  Math.max(Number(event.target.value || priceBounds.max), filters.priceRange[0]),
                ],
              })
            }
            className="w-full bg-atelier-surface-low border border-atelier-outline/35 px-3 py-2.5 text-sm focus:border-atelier-gold focus:ring-0"
          />
        </div>

        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step="1000"
          value={filters.priceRange[1]}
          onChange={(event) =>
            onFilterChange({
              priceRange: [filters.priceRange[0], Number(event.target.value)],
            })
          }
          className="w-full h-[2px] bg-atelier-outline appearance-none cursor-pointer"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          {presetCaps.map((value) => (
            <button
              key={value}
              onClick={() =>
                onFilterChange({
                  priceRange: [priceBounds.min, value],
                })
              }
              className="atelier-label border border-atelier-outline/35 px-3 py-2 hover:border-atelier-gold hover:text-atelier-charcoal"
            >
              Under {formatCurrency(value)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="atelier-label text-atelier-charcoal font-semibold mb-4">Rating</h4>
        <div className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onFilterChange({
                  rating: filters.rating === rating ? 0 : rating,
                })
              }
              className={`w-full border px-4 py-2.5 text-left atelier-label transition-colors ${
                filters.rating === rating
                  ? 'border-atelier-charcoal bg-atelier-charcoal text-white'
                  : 'border-atelier-outline/35 bg-transparent text-atelier-muted hover:text-atelier-charcoal'
              }`}
            >
              {rating}+ stars
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="atelier-label text-atelier-charcoal font-semibold mb-4">Availability</h4>
        <button
          onClick={() => onFilterChange({ inStock: !filters.inStock })}
          className={`w-full border px-4 py-2.5 text-left atelier-label transition-colors ${
            filters.inStock
              ? 'border-atelier-charcoal bg-atelier-charcoal text-white'
              : 'border-atelier-outline/35 text-atelier-muted hover:text-atelier-charcoal'
          }`}
        >
          In stock only
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
