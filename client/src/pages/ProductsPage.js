import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/common/FilterSidebar';
import Loading from '../components/ui/Loading';
import api from '../services/api';

const ProductsPage = ({ category: propCategory }) => {
  const { subcategory } = useParams();
  const category = propCategory || subcategory;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 20000000],
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
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50'
      });
      
      // Add category filter if provided
      if (category) {
        const categoryMap = {
          'necklaces': 'necklaces',
          'earrings': 'earrings',
          'bangles-bracelets': 'bangles-bracelets',
          'rings': 'rings',
          'anklets': 'anklets',
          'nose-rings': 'nose-rings',
          'mangalsutras': 'mangalsutras',
          'temple-jewelry': 'temple-jewelry',
          'kundan-sets': 'kundan-sets',
          'polki-sets': 'polki-sets',
          'meenakari': 'meenakari',
          'antique-jewelry': 'antique-jewelry'
        };
        
        const categorySlug = categoryMap[category];
        if (categorySlug) {
          queryParams.append('category', categorySlug);
        }
      }
      
      const response = await api.get(`/products?${queryParams}`);
      
      if (response.data) {
        console.log('API Response:', response.data);
        console.log('Products:', response.data.data.products);
        setProducts(response.data.data.products || []);
        setError(null);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    console.log('Starting with products:', products.length);
    console.log('Initial products:', products);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      console.log('After search filter:', filtered.length);
    }

    // Apply category filter from sidebar (additional to URL category)
    if (filters.category) {
      console.log('Applying category filter:', filters.category);
      filtered = filtered.filter(product => product.category_name === filters.category);
      console.log('After category filter:', filtered.length);
    }

    // Apply price range filter
    console.log('Price range filter:', filters.priceRange);
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      const inRange = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      console.log(`Product ${product.name} price ${price} in range ${filters.priceRange[0]}-${filters.priceRange[1]}: ${inRange}`);
      return inRange;
    });
    console.log('After price filter:', filtered.length);

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => (product.average_rating || 0) >= filters.rating);
      console.log('After rating filter:', filtered.length);
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
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    console.log('Final filtered products:', filtered.length);
    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {category ? category.replace(/-/g, ' ').toUpperCase() : 'All Products'}
          </h1>
          <p className="text-base text-gray-600">
            {category 
              ? `Discover our curated collection of ${category.replace(/-/g, ' ')}`
              : 'Discover our curated collection of premium products'
            }
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Search Bar - Full Width on Mobile */}
          <div className="w-full">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search products..." 
              className="w-full"
              size="sm"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-center"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 w-full sm:min-w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
          {/* Filters Sidebar */}
          <div className={`xl:w-64 ${showFilters ? 'block' : 'hidden xl:block'}`}>
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 text-center sm:text-left">
              <p className="text-sm text-gray-600">
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
