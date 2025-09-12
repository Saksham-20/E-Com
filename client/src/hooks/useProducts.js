import { useState, useEffect, useCallback } from 'react';

const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  const fetchProducts = useCallback(async (newFilters = filters, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...newFilters
      });

      const response = await fetch(`/api/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      setProducts(data.products);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.itemsPerPage]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [initialFilters]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  }, [pagination.totalPages]);

  const searchProducts = useCallback((query) => {
    updateFilters({ search: query });
  }, [updateFilters]);

  const filterByCategory = useCallback((category) => {
    updateFilters({ category });
  }, [updateFilters]);

  const filterByPrice = useCallback((minPrice, maxPrice) => {
    updateFilters({ minPrice, maxPrice });
  }, [updateFilters]);

  const filterByBrand = useCallback((brand) => {
    updateFilters({ brand });
  }, [updateFilters]);

  const sortProducts = useCallback((sortBy, sortOrder = 'asc') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Fetch products when filters or page changes
  useEffect(() => {
    fetchProducts(filters, pagination.currentPage);
  }, [filters, pagination.currentPage, fetchProducts]);

  return {
    products,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    resetFilters,
    goToPage,
    searchProducts,
    filterByCategory,
    filterByPrice,
    filterByBrand,
    sortProducts,
    refetch: () => fetchProducts(filters, pagination.currentPage)
  };
};

export default useProducts;
