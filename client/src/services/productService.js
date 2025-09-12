import api from './api';

export const productService = {
  // Get all products with optional filters
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  },

  // Get a single product by ID
  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch product');
    }
  },

  // Get related products
  async getRelatedProducts(productId, categoryId, limit = 4) {
    try {
      const response = await api.get(`/products/related/${productId}`, {
        params: { categoryId, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch related products');
    }
  },

  // Search products
  async searchProducts(query, filters = {}) {
    try {
      const params = new URLSearchParams({ q: query });
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/products/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to search products');
    }
  },

  // Get product categories
  async getCategories() {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch categories');
    }
  },

  // Get product reviews
  async getProductReviews(productId) {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch product reviews');
    }
  },

  // Add product review
  async addProductReview(productId, review) {
    try {
      const response = await api.post(`/products/${productId}/reviews`, review);
      return response.data;
    } catch (error) {
      throw new Error('Failed to add review');
    }
  }
};
