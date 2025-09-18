import React from 'react';
import useCart from '../../hooks/useCart';
import Button from '../ui/Button';

const CartSummary = ({ onCheckout }) => {
  const { items, summary, getCartItemCount } = useCart();

  const subtotal = summary.subtotal;
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h3>
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({getCartItemCount()})</span>
          <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        {shipping > 0 && (
          <div className="text-xs text-blue-600 text-center py-2 bg-blue-50 rounded">
            Add ₹{(100 - subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more for free shipping!
          </div>
        )}
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      
      <Button
        onClick={onCheckout}
        className="w-full"
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </Button>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Secure checkout powered by Stripe
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
