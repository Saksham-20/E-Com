import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import CartItem from './CartItem';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
                <div className="mt-6">
                  <Button onClick={onClose} className="w-full">
                    Continue Shopping
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItem key={`${item.id}-${item.variant?.id || 'default'}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={onClose} className="w-full" variant="outline">
                  Continue Shopping
                </Button>
                
                <Link to="/cart" className="block">
                  <Button className="w-full">
                    View Cart
                  </Button>
                </Link>

                {user ? (
                  <Link to="/checkout" className="block">
                    <Button className="w-full" variant="secondary">
                      Proceed to Checkout
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" className="block">
                    <Button className="w-full" variant="secondary">
                      Login to Checkout
                    </Button>
                  </Link>
                )}
              </div>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
