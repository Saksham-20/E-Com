import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import CheckoutForm from '../components/cart/CheckoutForm';
import CartSummary from '../components/cart/CartSummary';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cart, clearCart, summary } = useCart();
  const { user } = useAuth();
  
  // Calculate total from summary
  const total = summary?.estimated_total || 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Redirect if cart is empty
  if (!cart || cart.length === 0) {
    navigate('/cart');
    return null;
  }

  // Redirect if user is not logged in
  if (!user) {
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }

  const handleCheckout = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          id: item.product_id || item.id, // Use product_id if available
          name: item.name || item.product_name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant_details || item.variant || null,
          image: item.primary_image || item.image
        })),
        shippingAddress: formData.address,
        billingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod === 'card' ? formData.payment : {},
        notes: formData.notes || ''
      };

      // Create order using the order service
      const response = await orderService.createOrder(orderData);
      
      if (response) {
        setOrderNumber(response.orderNumber || response.order_number || 'N/A');
        setShowSuccessModal(true);
        clearCart();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/orders');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your purchase</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Information</h2>
              </div>
              <div className="p-6">
                <CheckoutForm onSubmit={handleCheckout} loading={loading} />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary showCheckoutButton={false} />
          </div>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          title="Order Placed Successfully!"
          size="md"
        >
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you for your order!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your order has been placed successfully. Order number: <span className="font-semibold text-gray-900">{orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive a confirmation email shortly with your order details.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleSuccessModalClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CheckoutPage;
