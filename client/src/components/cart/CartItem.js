import React from 'react';
import { useCart } from '../../context/CartContext';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
// import Button from '../ui/Button';

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    updateItemQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    console.log('Removing cart item:', item);
    console.log('Item ID (cart item):', item.id);
    console.log('Product ID:', item.product_id);
    console.log('Item type:', typeof item.id);
    console.log('Full item object keys:', Object.keys(item));
    console.log('Item values:', Object.values(item));
    removeFromCart(item.id);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex-shrink-0">
        <img
          src={getImageUrl(item.primary_image)}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-md"
          onError={(e) => {
            console.log('Cart image failed to load:', e.target.src);
            e.target.src = getPlaceholderImage();
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {item.description}
        </p>
        {item.variant && (
          <p className="text-sm text-gray-600">
            Variant: {item.variant}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <span className="w-12 text-center text-gray-900 font-medium">
          {item.quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-semibold text-gray-900">
          ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {item.originalPrice && item.originalPrice > item.price && (
          <div className="text-sm text-gray-500 line-through">
            ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        <div className="text-sm text-gray-600">
          ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
        </div>
      </div>
      
      <button
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 transition-colors p-2"
        title="Remove item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default CartItem;
