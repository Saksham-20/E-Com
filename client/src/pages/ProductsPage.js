import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
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
      console.log('📄 ProductsPage: Starting fetchProducts');
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
      
      const url = `/products?${queryParams}`;
      console.log('📄 ProductsPage: Fetching from URL:', url);
      
      const response = await api.get(url);
      console.log('📄 ProductsPage: API Response:', response);
      
      if (response.data) {
        console.log('📄 ProductsPage: Response data:', response.data);
        // Handle the correct API response format
        const products = response.data.data?.products || response.data.products || [];
        console.log('📄 ProductsPage: Extracted products:', products.length);
        console.log('📄 ProductsPage: First product:', products[0]);
        setProducts(products);
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
    <div className="min-h-screen bg-atelier-ivory pt-20">
      <header className="w-full bg-atelier-surface-low py-20 text-center overflow-hidden relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="font-headline text-5xl md:text-7xl tracking-tight mb-6">
            Our <span className="italic">Collections</span>
          </h1>
          <p className="text-atelier-muted text-lg leading-relaxed">
            {category
              ? `Discover our curated ${category.replace(/-/g, ' ')} edit, where every piece is selected for timeless elegance.`
              : 'Explore a curated selection of masterpieces, where traditional craftsmanship meets contemporary vision.'}
          </p>
        </div>
      </header>

      <section className="atelier-container py-14 md:py-16">
        <div className="md:hidden flex items-center justify-between border-b border-atelier-outline/30 pb-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="atelier-label text-atelier-charcoal font-semibold"
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          <span className="atelier-label text-atelier-muted">{filteredProducts.length} Items</span>
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-12">
          <aside className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              <p className="atelier-label text-atelier-muted">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="atelier-label text-atelier-charcoal bg-transparent border-0 border-b border-atelier-outline/50 px-0 py-2 focus:ring-0"
              >
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search"
                className="atelier-input"
              />
            </div>

            {error ? (
              <div className="text-center py-16">
                <h3 className="font-headline text-3xl mb-3">Unable to load products</h3>
                <p className="text-atelier-muted mb-6">Please try refreshing the page.</p>
                <button onClick={fetchProducts} className="atelier-primary-btn">
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="font-headline text-3xl mb-3">No products found</h3>
                <p className="text-atelier-muted">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} className="shadow-none" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
