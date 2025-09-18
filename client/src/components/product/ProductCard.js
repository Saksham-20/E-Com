import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import { formatCurrency as formatPrice } from '../../utils/formatters';
import Loading from '../ui/Loading';

const ProductCard = React.memo(({ product, className = '' }) => {
  const { addToCart, isItemInCart, removeFromCart } = useCart();
  const { addToWishlist, removeFromWishlist, isItemInWishlist } = useWishlist();

  // Memoize expensive calculations
  const formattedPrice = useMemo(() => formatPrice(product.price), [product.price]);
  const formattedComparePrice = useMemo(() => 
    product.comparePrice ? formatPrice(product.comparePrice) : null, 
    [product.comparePrice]
  );
  
  const discountPercentage = useMemo(() => {
    if (!product.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  }, [product.price, product.comparePrice]);

  // Handle both product.id and product.product_id for compatibility
  // Prioritize product_id for cart operations since it's the actual product ID
  const productId = product.product_id || product.id;
  
  const isInCartState = useMemo(() => isItemInCart(productId), [isItemInCart, productId]);
  const isInWishlistState = useMemo(() => isItemInWishlist(productId), [isItemInWishlist, productId]);

  // Memoize event handlers
  const handleAddToCart = useCallback(() => {
    // Ensure we have the correct product structure for cart
    const cartProduct = {
      id: productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: product.compare_price,
      sku: product.sku,
      primary_image: product.primary_image,
      category_name: product.category_name,
      category_slug: product.category_slug
    };
    addToCart(cartProduct);
  }, [addToCart, product, productId]);

  const handleRemoveFromCart = useCallback(() => {
    removeFromCart(productId);
  }, [removeFromCart, productId]);

  const handleToggleWishlist = useCallback(() => {
    if (isInWishlistState) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlistState, removeFromWishlist, addToWishlist, product, productId]);

  const handleQuickView = useCallback(() => {
    // Quick view functionality can be implemented here
    console.log('Quick view for:', product.name);
  }, [product.name]);

  if (!product) {
    return <Loading variant="skeleton" />;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.slug || product.id}`}>
          <motion.img
            src={product.primary_image ? `http://localhost:5000${product.primary_image}` : '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              console.log('ProductCard image failed to load:', e.target.src);
              console.log('Product:', product.name, 'Primary image:', product.primary_image);
              e.target.src = '/placeholder-product.jpg';
            }}
            onLoad={() => {
              console.log('ProductCard image loaded successfully:', product.name, product.primary_image);
            }}
          />
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className={`w-4 h-4 ${isInWishlistState ? 'text-red-500 fill-current' : 'text-gray-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickView}
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            aria-label="Quick view"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </motion.button>
        </div>

        {/* Stock Status */}
        {product.stock_quantity <= 0 && (
          <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Category */}
        {product.category_name && (
          <div className="text-xs text-gray-500 mb-1 text-center sm:text-left">
            {product.category_name}
          </div>
        )}

        {/* Product Name */}
        <Link to={`/products/${product.slug || product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-tiffany-blue transition-colors duration-200 text-center sm:text-left">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.average_rating && product.average_rating > 0 && (
          <div className="flex items-center justify-center sm:justify-start mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < Math.floor(product.average_rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.review_count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
          <span className="text-sm sm:text-base font-semibold text-gray-900">
            {formattedPrice}
          </span>
          {formattedComparePrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {formattedComparePrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isInCartState ? handleRemoveFromCart : handleAddToCart}
          disabled={product.stock_quantity <= 0}
          className={`w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
            isInCartState
              ? 'bg-red-600 text-white hover:bg-red-700'
              : product.stock_quantity <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-tiffany-blue text-white hover:bg-tiffany-blue-dark'
          }`}
        >
          {isInCartState ? 'Remove from Cart' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
