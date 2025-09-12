import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/common/FilterSidebar';
import Loading from '../components/ui/Loading';
import { jewelryProducts } from '../data/jewelryProducts';

const ProductsPage = ({ category: propCategory }) => {
  const { subcategory } = useParams();
  const category = propCategory || subcategory;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 5000],
    rating: 0,
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let filteredProducts = jewelryProducts;
      
      // Filter by category if provided
      if (category) {
        const categoryMap = {
          'high-jewelry': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'jewelry': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'love-engagement': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'fine-watches': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'accessories': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'gifts': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'new-arrivals': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'bestsellers': ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
          'sale': ['Rings', 'Necklaces', 'Earrings', 'Bracelets']
        };
        
        const categoryFilter = categoryMap[category];
        if (categoryFilter) {
          if (Array.isArray(categoryFilter)) {
            filteredProducts = jewelryProducts.filter(product => 
              categoryFilter.includes(product.category)
            );
          } else {
            filteredProducts = jewelryProducts.filter(product => 
              product.category === categoryFilter
            );
          }
        }
      }
      
      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filtering is handled in fetchProducts based on URL category
    // No need to filter by category here as it's already done

    // Apply price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category ? category.replace(/-/g, ' ').toUpperCase() : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {category 
              ? `Discover our curated collection of ${category.replace(/-/g, ' ')}`
              : 'Discover our curated collection of premium products'
            }
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} placeholder="Search products..." />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
