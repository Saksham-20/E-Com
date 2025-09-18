import React, { useState } from 'react';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CheckoutForm = ({ onSubmit, loading = false }) => {
  const { items: cart, summary } = useCart();
  const { user } = useAuth();
  
  // Calculate total from summary
  const total = summary?.estimated_total || 0;
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    paymentMethod: 'card',
    payment: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';
    // Payment validation only for card payments
    if (formData.paymentMethod === 'card') {
      if (!formData.payment.cardNumber.trim()) newErrors['payment.cardNumber'] = 'Card number is required';
      if (!formData.payment.expiryDate.trim()) newErrors['payment.expiryDate'] = 'Expiry date is required';
      if (!formData.payment.cvv.trim()) newErrors['payment.cvv'] = 'CVV is required';
      if (!formData.payment.cardholderName.trim()) newErrors['payment.cardholderName'] = 'Cardholder name is required';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Card number validation (basic)
    if (formData.payment.cardNumber && formData.payment.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors['payment.cardNumber'] = 'Please enter a valid card number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            required
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
        <div className="space-y-4">
          <Input
            label="Street Address"
            value={formData.address.street}
            onChange={(e) => handleInputChange('address.street', e.target.value)}
            error={errors['address.street']}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              error={errors['address.city']}
              required
            />
            <Input
              label="State"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              error={errors['address.state']}
              required
            />
            <Input
              label="ZIP Code"
              value={formData.address.zipCode}
              onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
              error={errors['address.zipCode']}
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="relative flex cursor-pointer rounded-lg p-4 focus:outline-none border-2 border-gray-200 hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Credit/Debit Card</div>
                  <div className="text-gray-500">Pay with your card</div>
                </div>
              </div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg p-4 focus:outline-none border-2 border-gray-200 hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={formData.paymentMethod === 'upi'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">UPI</div>
                  <div className="text-gray-500">Pay via UPI</div>
                </div>
              </div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg p-4 focus:outline-none border-2 border-gray-200 hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="paymentMethod"
                value="netbanking"
                checked={formData.paymentMethod === 'netbanking'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Net Banking</div>
                  <div className="text-gray-500">Pay via net banking</div>
                </div>
              </div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg p-4 focus:outline-none border-2 border-gray-200 hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Cash on Delivery</div>
                  <div className="text-gray-500">Pay when delivered</div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Payment Information - Only show for card payments */}
      {formData.paymentMethod === 'card' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Card Information</h3>
          <div className="space-y-4">
            <Input
              label="Card Number"
              value={formData.payment.cardNumber}
              onChange={(e) => handleInputChange('payment.cardNumber', e.target.value)}
              error={errors['payment.cardNumber']}
              placeholder="1234 5678 9012 3456"
              required
            />
            <Input
              label="Cardholder Name"
              value={formData.payment.cardholderName}
              onChange={(e) => handleInputChange('payment.cardholderName', e.target.value)}
              error={errors['payment.cardholderName']}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                value={formData.payment.expiryDate}
                onChange={(e) => handleInputChange('payment.expiryDate', e.target.value)}
                error={errors['payment.expiryDate']}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV"
                value={formData.payment.cvv}
                onChange={(e) => handleInputChange('payment.cvv', e.target.value)}
                error={errors['payment.cvv']}
                placeholder="123"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Specific Information */}
      {formData.paymentMethod === 'upi' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">UPI Payment</h4>
          <p className="text-sm text-blue-700">
            You will be redirected to your UPI app to complete the payment after placing the order.
          </p>
        </div>
      )}

      {formData.paymentMethod === 'netbanking' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Net Banking</h4>
          <p className="text-sm text-blue-700">
            You will be redirected to your bank's net banking portal to complete the payment after placing the order.
          </p>
        </div>
      )}

      {formData.paymentMethod === 'cod' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Cash on Delivery</h4>
          <p className="text-sm text-green-700">
            Pay the exact amount in cash when your order is delivered. No additional charges apply.
          </p>
        </div>
      )}

      {/* Order Notes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special instructions for your order..."
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2">
          {(cart || []).map((item) => (
            <div key={`${item.id}-${item.variant?.id || 'default'}`} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>₹{(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? 'Processing...' : `Place Order - ₹${(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </Button>
    </form>
  );
};

export default CheckoutForm;
