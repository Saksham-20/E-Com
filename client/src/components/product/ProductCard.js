import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import { formatCurrency as formatPrice } from '../../utils/formatters';
import Loading from '../ui/Loading';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

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
      className={`group overflow-hidden ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-atelier-surface-low mb-5">
        <Link to={`/products/${product.slug || product.id}`}>
          <motion.img
            src={getImageUrl(product.primary_image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              e.target.src = getPlaceholderImage();
            }}
          />
        </Link>

        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiX className="h-4 w-4" />
        </button>

        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-atelier-gold px-2 py-1 atelier-label text-black">
            -{discountPercentage}%
          </div>
        )}

        {product.stock_quantity <= 0 && (
          <div className="absolute bottom-3 left-3 bg-atelier-charcoal text-white px-2 py-1 atelier-label">
            Out of Stock
          </div>
        )}
      </div>

      <div className="text-center">
        {product.category_name && (
          <div className="atelier-label text-atelier-muted mb-2">
            {product.category_name}
          </div>
        )}

        <Link to={`/products/${product.slug || product.id}`}>
          <h3 className="font-headline text-[30px] leading-tight mb-2 hover:text-atelier-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.average_rating && product.average_rating > 0 && (
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.average_rating)
                      ? 'text-atelier-gold fill-current'
                      : 'text-atelier-outline'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 atelier-label text-atelier-muted">
              ({product.review_count || 0})
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-lg text-atelier-gold">
            {formattedPrice}
          </span>
          {formattedComparePrice && (
            <span className="atelier-label text-atelier-muted line-through">
              {formattedComparePrice}
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isInCartState ? handleRemoveFromCart : handleAddToCart}
          disabled={product.stock_quantity <= 0}
          className={`w-full py-3 px-4 atelier-label transition-all duration-200 ${
            isInCartState
              ? 'bg-[#a61c1c] text-white hover:bg-[#7f1515]'
              : product.stock_quantity <= 0
              ? 'bg-atelier-outline text-atelier-muted cursor-not-allowed'
              : 'bg-atelier-charcoal text-atelier-ivory hover:opacity-90'
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
