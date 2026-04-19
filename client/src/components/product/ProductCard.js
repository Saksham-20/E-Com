import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import { formatCurrency as formatPrice } from '../../utils/formatters';
import Loading from '../ui/Loading';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

const ProductCard = React.memo(({ product, className = '' }) => {
  const { addToCart, isItemInCart, removeFromCart } = useCart();
  const { addToWishlist, removeFromWishlist, isItemInWishlist } = useWishlist();

  const productId = product?.product_id || product?.id;
  const comparePriceValue = product?.compare_price ?? product?.comparePrice;
  const stockQuantity = Number(product?.stock_quantity ?? product?.stock ?? 0);
  const categoryLabel = product?.category_name || product?.category || 'Curated Piece';
  const productSummary =
    product?.short_description ||
    product?.shortDescription ||
    product?.description ||
    'A polished piece selected for elevated daily wear and milestone gifting.';
  const teaser =
    productSummary.length > 112 ? `${productSummary.slice(0, 109)}...` : productSummary;

  const formattedPrice = useMemo(() => formatPrice(product?.price), [product?.price]);
  const formattedComparePrice = useMemo(
    () => (comparePriceValue ? formatPrice(comparePriceValue) : null),
    [comparePriceValue],
  );

  const discountPercentage = useMemo(() => {
    if (!comparePriceValue || comparePriceValue <= product?.price) return 0;
    return Math.round(((comparePriceValue - product.price) / comparePriceValue) * 100);
  }, [comparePriceValue, product?.price]);

  const badgeLabel = useMemo(() => {
    if (product?.is_new_arrival) return 'New Arrival';
    if (product?.is_bestseller) return 'Best Seller';
    if (product?.is_featured) return 'Featured';
    return categoryLabel;
  }, [categoryLabel, product?.is_bestseller, product?.is_featured, product?.is_new_arrival]);

  const isInCartState = useMemo(() => isItemInCart(productId), [isItemInCart, productId]);
  const isInWishlistState = useMemo(
    () => isItemInWishlist(productId),
    [isItemInWishlist, productId],
  );

  const handleAddToCart = useCallback(() => {
    addToCart({
      id: productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: comparePriceValue,
      sku: product.sku,
      primary_image: product.primary_image,
      category_name: product.category_name,
      category_slug: product.category_slug,
    });
  }, [addToCart, comparePriceValue, product, productId]);

  const handleRemoveFromCart = useCallback(() => {
    removeFromCart(productId);
  }, [removeFromCart, productId]);

  const handleToggleWishlist = useCallback(() => {
    if (isInWishlistState) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  }, [addToWishlist, isInWishlistState, product, productId, removeFromWishlist]);

  if (!product) {
    return <Loading variant="skeleton" />;
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group h-full ${className}`}
    >
      <div className="relative h-full overflow-hidden rounded-[24px] border border-atelier-outline/25 bg-white/95 backdrop-blur-sm shadow-[0_24px_54px_-42px_rgba(26,26,27,0.45)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(244,243,241,0.9))]" />

        <div className="relative flex h-full flex-col">
          <div className="relative aspect-[4/4.6] overflow-hidden bg-atelier-surface-low">
            <Link to={`/products/${product.slug || product.id}`}>
              <motion.img
                src={getImageUrl(product.primary_image)}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                loading="lazy"
                onError={(event) => {
                  event.target.src = getPlaceholderImage();
                }}
              />
            </Link>

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span className="atelier-label bg-white/85 px-2.5 py-1.5 text-atelier-charcoal shadow-sm backdrop-blur-sm">
                {badgeLabel}
              </span>
              <button
                onClick={handleToggleWishlist}
                className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
                  isInWishlistState
                    ? 'border-atelier-charcoal bg-atelier-charcoal text-white'
                    : 'border-white/50 bg-white/80 text-atelier-charcoal hover:border-atelier-gold hover:text-atelier-gold'
                }`}
                aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart className={`h-4 w-4 ${isInWishlistState ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-10 text-white">
              <p className="atelier-label text-white/75 mb-1.5">{categoryLabel}</p>
              <p className="text-xs text-white/90">
                {stockQuantity > 0 ? `${stockQuantity} pieces available` : 'Currently unavailable'}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-[18px] md:p-5">
            <div className="mb-3">
              <Link to={`/products/${product.slug || product.id}`}>
                <h3 className="font-headline text-[23px] md:text-[25px] leading-[1.05] mb-2 transition-colors group-hover:text-atelier-gold">
                  {product.name}
                </h3>
              </Link>
              <p className="text-[13px] leading-5 text-atelier-muted min-h-[52px]">{teaser}</p>
            </div>

            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="atelier-label text-atelier-muted mb-1.5">Price</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg text-atelier-gold">{formattedPrice}</span>
                  {formattedComparePrice && (
                    <span className="atelier-label text-atelier-muted line-through">
                      {formattedComparePrice}
                    </span>
                  )}
                </div>
              </div>

              {discountPercentage > 0 && (
                <div className="border border-atelier-gold/30 px-2.5 py-1.5 text-right">
                  <p className="atelier-label text-atelier-muted mb-1">Saving</p>
                  <p className="text-xs text-atelier-charcoal">{discountPercentage}% off</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={isInCartState ? handleRemoveFromCart : handleAddToCart}
              disabled={stockQuantity <= 0}
              className={`mt-auto w-full px-4 py-2.5 text-[11px] tracking-[0.2em] uppercase transition-all duration-200 ${
                isInCartState
                  ? 'bg-[#8f1d1d] text-white hover:bg-[#731616]'
                  : stockQuantity <= 0
                  ? 'bg-atelier-outline text-atelier-muted cursor-not-allowed'
                  : 'bg-atelier-charcoal text-atelier-ivory hover:bg-black'
              }`}
            >
              {isInCartState ? 'Remove From Bag' : stockQuantity <= 0 ? 'Sold Out' : 'Add To Bag'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
