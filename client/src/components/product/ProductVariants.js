import React from 'react';

const ProductVariants = ({ variants = [], selectedVariant, onVariantSelect }) => {
  if (!variants || variants.length === 0) return null;

  const variantTypes = Object.keys(variants[0]).filter(key => 
    key !== 'id' && key !== 'price' && key !== 'sku' && key !== 'stock'
  );

  return (
    <div className="space-y-4">
      {variantTypes.map(type => {
        const uniqueValues = [...new Set(variants.map(v => v[type]))];
        
        return (
          <div key={type}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {type}
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueValues.map(value => {
                const variant = variants.find(v => v[type] === value);
                const isSelected = selectedVariant && selectedVariant[type] === value;
                const isAvailable = variant && variant.stock > 0;
                
                return (
                  <button
                    key={value}
                    onClick={() => onVariantSelect(variant)}
                    disabled={!isAvailable}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-md border transition-colors
                      ${isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }
                      ${!isAvailable && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {value}
                    {!isAvailable && ' (Out of Stock)'}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductVariants;
