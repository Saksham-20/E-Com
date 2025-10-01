import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import Loading from '../ui/Loading';

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products/related?categoryId=${categoryId}&excludeId=${currentProductId}&limit=4`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setProducts(data.data);
      } else {
        console.error('Error in related products response:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!products || !Array.isArray(products) || products.length === 0) return null;

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products && Array.isArray(products) && products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          to={`/products?category=${categoryId}`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          View All Products in This Category
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;
