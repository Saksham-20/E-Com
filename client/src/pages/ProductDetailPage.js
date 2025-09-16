import React from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../components/product/ProductDetail';
import Breadcrumb from '../components/common/Breadcrumb';

const ProductDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        <ProductDetail />
      </div>
    </div>
  );
};

export default ProductDetailPage;
