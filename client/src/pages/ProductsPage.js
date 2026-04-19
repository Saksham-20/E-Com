import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowUpRight, FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/common/FilterSidebar';
import Loading from '../components/ui/Loading';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { getImageUrl } from '../utils/imageUtils';

const DEFAULT_PRICE_MAX = 250000;

const categoryRouteMap = {
  'high-jewelry': 'necklaces',
  jewelry: 'rings',
  'love-engagement': 'rings',
  'fine-watches': 'watches',
  accessories: 'bracelets',
  gifts: 'earrings',
};

const categoryCopy = {
  necklaces: 'Diamond rivieres, pendants, and pearl silhouettes designed for spotlight moments.',
  rings: 'Modern solitaires, gemstone statements, and occasion-led signatures with heirloom energy.',
  earrings: 'Sculpted hoops, chandelier drops, and polished accents that frame the face with clarity.',
  bracelets: 'Refined bracelets and tennis lines built to stack, gift, and carry a full evening look.',
  watches: 'Jewelry-led timepieces with collectible finishing and understated luxury.',
};

const createDefaultFilters = (maxPrice = DEFAULT_PRICE_MAX) => ({
  category: '',
  priceRange: [0, maxPrice],
  rating: 0,
  sortBy: 'curated',
  inStock: false,
});

const getRoundedPriceCeiling = (products) => {
  const maximum = Math.max(
    ...products.map((product) => Number(product.price) || 0),
    DEFAULT_PRICE_MAX,
  );

  return Math.ceil(maximum / 25000) * 25000;
};

const ProductsPage = ({ category: propCategory }) => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceCeiling, setPriceCeiling] = useState(DEFAULT_PRICE_MAX);
  const [filters, setFilters] = useState(createDefaultFilters(DEFAULT_PRICE_MAX));
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);

        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products?limit=64'),
          api.get('/products/categories'),
        ]);

        const fetchedProducts = productsResponse.data?.data?.products || [];
        const fetchedCategories = categoriesResponse.data?.data || [];
        const roundedMax = getRoundedPriceCeiling(fetchedProducts);

        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setPriceCeiling(roundedMax);
        setFilters((previous) => ({
          ...previous,
          priceRange:
            previous.priceRange[0] === 0 && previous.priceRange[1] === DEFAULT_PRICE_MAX
              ? [0, roundedMax]
              : previous.priceRange,
        }));
        setError(null);
      } catch (fetchError) {
        setError('Unable to load the catalog right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedCategory =
      params.get('category') || categoryRouteMap[propCategory] || propCategory || '';
    const requestedSearch = params.get('search') || '';
    const requestedSort = params.get('sort') || 'curated';

    setSearchQuery(requestedSearch);
    setFilters((previous) => ({
      ...previous,
      category: requestedCategory,
      sortBy: requestedSort,
    }));
  }, [location.search, propCategory]);

  const categoryOptions = useMemo(() => {
    const counts = products.reduce((accumulator, product) => {
      const slug = product.category_slug;
      if (!slug) return accumulator;
      accumulator[slug] = (accumulator[slug] || 0) + 1;
      return accumulator;
    }, {});

    return categories.map((category) => ({
      ...category,
      count: counts[category.slug] || 0,
    }));
  }, [categories, products]);

  const activeCategory = useMemo(
    () => categoryOptions.find((category) => category.slug === filters.category),
    [categoryOptions, filters.category],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description || '').toLowerCase().includes(normalizedSearch) ||
        (product.short_description || '').toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        !filters.category || product.category_slug === filters.category;

      const productPrice = Number(product.price) || 0;
      const matchesPrice =
        productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];

      const productRating = Number(product.average_rating) || 0;
      const matchesRating = filters.rating === 0 || productRating >= filters.rating;

      const matchesAvailability = !filters.inStock || Number(product.stock_quantity) > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesAvailability
      );
    });

    return filtered.sort((left, right) => {
      switch (filters.sortBy) {
        case 'price-low':
          return Number(left.price) - Number(right.price);
        case 'price-high':
          return Number(right.price) - Number(left.price);
        case 'rating':
          return Number(right.average_rating || 0) - Number(left.average_rating || 0);
        case 'newest':
          return new Date(right.created_at) - new Date(left.created_at);
        case 'curated':
        default: {
          const leftScore =
            (left.is_featured ? 4 : 0) +
            (left.is_bestseller ? 3 : 0) +
            (left.is_new_arrival ? 2 : 0);
          const rightScore =
            (right.is_featured ? 4 : 0) +
            (right.is_bestseller ? 3 : 0) +
            (right.is_new_arrival ? 2 : 0);

          if (rightScore !== leftScore) {
            return rightScore - leftScore;
          }

          return new Date(right.created_at) - new Date(left.created_at);
        }
      }
    });
  }, [filters, products, searchQuery]);

  const spotlightProduct = filteredProducts[0] || null;
  const mosaicProducts = spotlightProduct ? filteredProducts.slice(1) : [];

  const activeFilterChips = [
    filters.category
      ? {
          key: 'category',
          label: activeCategory?.name || filters.category,
          clear: () => setFilters((previous) => ({ ...previous, category: '' })),
        }
      : null,
    searchQuery
      ? {
          key: 'search',
          label: `Search: ${searchQuery}`,
          clear: () => setSearchQuery(''),
        }
      : null,
    filters.rating > 0
      ? {
          key: 'rating',
          label: `${filters.rating}+ stars`,
          clear: () => setFilters((previous) => ({ ...previous, rating: 0 })),
        }
      : null,
    filters.inStock
      ? {
          key: 'stock',
          label: 'In stock',
          clear: () => setFilters((previous) => ({ ...previous, inStock: false })),
        }
      : null,
    filters.priceRange[0] > 0 || filters.priceRange[1] < priceCeiling
      ? {
          key: 'price',
          label: `${formatCurrency(filters.priceRange[0])} - ${formatCurrency(filters.priceRange[1])}`,
          clear: () =>
            setFilters((previous) => ({
              ...previous,
              priceRange: [0, priceCeiling],
            })),
        }
      : null,
  ].filter(Boolean);

  const closeFilters = () => setShowFilters(false);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-atelier-ivory pt-20">
      <section className="relative overflow-hidden border-b border-atelier-outline/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(244,243,241,0.86))]" />
        <div className="atelier-container relative py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-end">
            <div>
              <p className="atelier-label text-atelier-gold mb-5">Catalog</p>
              <h1 className="font-headline text-5xl md:text-7xl leading-[0.96] mb-6">
                The ECOM Vault
              </h1>
              <p className="text-lg max-w-2xl">
                {activeCategory?.description ||
                  categoryCopy[filters.category] ||
                  'Browse a polished jewelry catalog shaped around modern heirlooms, milestone gifting, and evening-ready statements.'}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <div className="border border-atelier-outline/30 bg-white/80 px-4 py-3">
                  <p className="atelier-label text-atelier-muted mb-1">Visible Pieces</p>
                  <p className="text-2xl font-headline">{filteredProducts.length}</p>
                </div>
                <div className="border border-atelier-outline/30 bg-white/80 px-4 py-3">
                  <p className="atelier-label text-atelier-muted mb-1">Departments</p>
                  <p className="text-2xl font-headline">{categoryOptions.length}</p>
                </div>
                <div className="border border-atelier-outline/30 bg-white/80 px-4 py-3">
                  <p className="atelier-label text-atelier-muted mb-1">Price Range</p>
                  <p className="text-2xl font-headline">{formatCurrency(priceCeiling)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-atelier-outline/25 bg-white/90 p-6 md:p-7 shadow-[0_34px_80px_-58px_rgba(26,26,27,0.55)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-atelier-charcoal text-white">
                  <IoSparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="atelier-label text-atelier-gold mb-1">Curated Search</p>
                  <p className="text-sm text-atelier-muted">
                    Start with a category, style cue, or gemstone.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 border border-atelier-outline/35 bg-atelier-surface-low px-4 py-4">
                <FiSearch className="h-4 w-4 text-atelier-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search rings, necklaces, pearls, diamonds..."
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-atelier-muted/60"
                />
              </label>

              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  onClick={() => setFilters((previous) => ({ ...previous, category: '' }))}
                  className={`atelier-label border px-3 py-2 ${
                    !filters.category
                      ? 'border-atelier-charcoal bg-atelier-charcoal text-white'
                      : 'border-atelier-outline/35 bg-white text-atelier-muted'
                  }`}
                >
                  All Pieces
                </button>
                {categoryOptions.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() =>
                      setFilters((previous) => ({
                        ...previous,
                        category: category.slug,
                      }))
                    }
                    className={`atelier-label border px-3 py-2 ${
                      filters.category === category.slug
                        ? 'border-atelier-charcoal bg-atelier-charcoal text-white'
                        : 'border-atelier-outline/35 bg-white text-atelier-muted'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="atelier-container py-12 md:py-16">
        <div className="relative min-w-0">
          {showFilters && (
            <div className="fixed inset-0 z-40 bg-atelier-charcoal/35 backdrop-blur-[2px]" onClick={closeFilters} />
          )}

          <aside
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-[380px] transform bg-atelier-ivory p-4 transition-transform duration-300 ease-out sm:p-6 ${
              showFilters ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-hidden={!showFilters}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-atelier-outline/30 bg-white/95 shadow-[0_32px_90px_-52px_rgba(26,26,27,0.55)]">
              <div className="flex items-center justify-between border-b border-atelier-outline/20 px-5 py-4 sm:px-6">
                <div>
                  <p className="atelier-label text-atelier-gold mb-1">Filters</p>
                  <p className="text-sm text-atelier-muted">Refine the catalog without leaving the grid.</p>
                </div>
                <button
                  onClick={closeFilters}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-atelier-outline/30 text-atelier-charcoal transition-colors hover:border-atelier-gold hover:text-atelier-gold"
                  aria-label="Close filters"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <FilterSidebar
                  filters={filters}
                  categories={categoryOptions}
                  onFilterChange={(nextFilters) =>
                    setFilters((previous) => ({
                      ...previous,
                      ...nextFilters,
                    }))
                  }
                  priceBounds={{ min: 0, max: priceCeiling }}
                />
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <p className="atelier-label text-atelier-muted mb-3">
                  Showing {filteredProducts.length} of {products.length} catalog pieces
                </p>
                {activeFilterChips.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilterChips.map((chip) => (
                      <button
                        key={chip.key}
                        onClick={chip.clear}
                        className="inline-flex items-center gap-2 border border-atelier-outline/35 bg-white px-3 py-2 text-sm text-atelier-charcoal"
                      >
                        <span>{chip.label}</span>
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center gap-2 border border-atelier-outline/35 bg-white px-4 py-3 text-sm text-atelier-charcoal transition-colors hover:border-atelier-gold"
                >
                  <FiSliders className="h-4 w-4" />
                  <span className="atelier-label text-atelier-charcoal">
                    Filters {activeFilterChips.length > 0 ? `(${activeFilterChips.length})` : ''}
                  </span>
                </button>

                <label className="border border-atelier-outline/35 bg-white px-4 py-3 text-sm">
                  <span className="atelier-label text-atelier-muted mr-4">Sort</span>
                  <select
                    value={filters.sortBy}
                    onChange={(event) =>
                      setFilters((previous) => ({
                        ...previous,
                        sortBy: event.target.value,
                      }))
                    }
                    className="bg-transparent focus:outline-none"
                  >
                    <option value="curated">Curated</option>
                    <option value="newest">Newest</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </label>
              </div>
            </div>

            {error ? (
              <div className="rounded-[28px] border border-atelier-outline/30 bg-white p-10 text-center">
                <h3 className="font-headline text-3xl mb-3">Unable to load products</h3>
                <p className="mb-6">Refresh the page or try again in a moment.</p>
                <button onClick={() => window.location.reload()} className="atelier-primary-btn">
                  Reload Catalog
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[28px] border border-atelier-outline/30 bg-white p-10 text-center">
                <h3 className="font-headline text-3xl mb-3">No matching pieces found</h3>
                <p className="mb-6">
                  Adjust the price, remove a filter, or search with a broader term.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters(createDefaultFilters(priceCeiling));
                  }}
                  className="atelier-primary-btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {spotlightProduct && (
                  <div className="rounded-[34px] overflow-hidden border border-atelier-outline/25 bg-white shadow-[0_40px_90px_-64px_rgba(26,26,27,0.6)]">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="relative min-h-[300px] md:min-h-[360px] overflow-hidden bg-atelier-surface-low">
                        <img
                          src={getImageUrl(spotlightProduct.primary_image)}
                          alt={spotlightProduct.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                        <div className="absolute left-6 right-6 bottom-6 flex items-end justify-between gap-4 text-white">
                          <div>
                            <p className="atelier-label text-white/70 mb-2">Curator Spotlight</p>
                            <p className="text-sm text-white/90">
                              {spotlightProduct.category_name || 'Featured Jewelry'}
                            </p>
                          </div>
                          {spotlightProduct.is_new_arrival && (
                            <span className="atelier-label bg-white/15 px-3 py-2 backdrop-blur-sm">
                              New Arrival
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 md:p-8 flex flex-col">
                        <p className="atelier-label text-atelier-gold mb-4">Lead Piece</p>
                        <h2 className="font-headline text-3xl md:text-4xl leading-[0.98] mb-4">
                          {spotlightProduct.name}
                        </h2>
                        <p className="text-sm md:text-base text-atelier-muted mb-6">
                          {spotlightProduct.short_description || spotlightProduct.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="border border-atelier-outline/25 p-4">
                            <p className="atelier-label text-atelier-muted mb-2">Price</p>
                            <p className="text-2xl font-headline text-atelier-gold">
                              {formatCurrency(spotlightProduct.price)}
                            </p>
                          </div>
                          <div className="border border-atelier-outline/25 p-4">
                            <p className="atelier-label text-atelier-muted mb-2">Availability</p>
                            <p className="text-lg text-atelier-charcoal">
                              {Number(spotlightProduct.stock_quantity) > 0
                                ? `${spotlightProduct.stock_quantity} ready to ship`
                                : 'Sold out'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                          <Link
                            to={`/products/${spotlightProduct.slug || spotlightProduct.id}`}
                            className="atelier-primary-btn inline-flex items-center justify-center gap-2"
                          >
                            View Piece
                            <FiArrowUpRight className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              setFilters((previous) => ({
                                ...previous,
                                category: spotlightProduct.category_slug || previous.category,
                              }))
                            }
                            className="atelier-link-btn text-left"
                          >
                            Explore More In {spotlightProduct.category_name}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {mosaicProducts.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 md:gap-5 xl:gap-6">
                    {mosaicProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
