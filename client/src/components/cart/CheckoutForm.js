import React, { useState } from 'react';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { validators } from '../../utils/validation';

const CheckoutForm = ({ onSubmit, loading = false }) => {
  const { items: cart, summary } = useCart();
  const { user } = useAuth();
  
  // Calculate total from summary
  const total = summary?.estimated_total || 0;
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneCountryCode: '+91',
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

  // Country codes for phone numbers
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' }
  ];

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  // Format phone number (limit to 10 digits)
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 10);
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    // Apply formatting based on field type
    if (field === 'payment.cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    } else if (field === 'payment.expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'payment.cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
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
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
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
    if (formData.email) {
      const emailError = validators.email(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    // Phone validation (10 digits only)
    if (formData.phone) {
      if (formData.phone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
      }
    }

    // Payment validation for card payments
    if (formData.paymentMethod === 'card') {
      if (formData.payment.cardNumber) {
        const cardNumberError = validators.cardNumber(formData.payment.cardNumber);
        if (cardNumberError) newErrors['payment.cardNumber'] = cardNumberError;
      }
      
      if (formData.payment.expiryDate) {
        const expiryError = validators.expiryDate(formData.payment.expiryDate);
        if (expiryError) newErrors['payment.expiryDate'] = expiryError;
      }
      
      if (formData.payment.cvv) {
        const cvvError = validators.cvv(formData.payment.cvv);
        if (cvvError) newErrors['payment.cvv'] = cvvError;
      }
      
      if (formData.payment.cardholderName) {
        const cardholderError = validators.cardholderName(formData.payment.cardholderName);
        if (cardholderError) newErrors['payment.cardholderName'] = cardholderError;
      }
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="relative flex-shrink-0">
                <select
                  value={formData.phoneCountryCode}
                  onChange={(e) => handleInputChange('phoneCountryCode', e.target.value)}
                  className="appearance-none px-3 py-2.5 pr-8 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[110px] h-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-ms-expand]:hidden"
                  style={{ backgroundImage: 'none' }}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className={`flex-1 px-3 py-2.5 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-10 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
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
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Card Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Card Number"
              value={formData.payment.cardNumber}
              onChange={(e) => handleInputChange('payment.cardNumber', e.target.value)}
              error={errors['payment.cardNumber']}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="tracking-widest"
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
                maxLength={5}
                className="text-center"
                required
              />
              <Input
                label="CVV"
                value={formData.payment.cvv}
                onChange={(e) => handleInputChange('payment.cvv', e.target.value)}
                error={errors['payment.cvv']}
                placeholder="123"
                maxLength={4}
                className="text-center"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Specific Information */}
      {formData.paymentMethod === 'upi' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            UPI Payment
          </h4>
          <p className="text-sm text-blue-700">
            You will be redirected to your UPI app to complete the payment after placing the order.
          </p>
        </div>
      )}

      {formData.paymentMethod === 'netbanking' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Net Banking
          </h4>
          <p className="text-sm text-blue-700">
            You will be redirected to your bank's net banking portal to complete the payment after placing the order.
          </p>
        </div>
      )}

      {formData.paymentMethod === 'cod' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cash on Delivery
          </h4>
          <p className="text-sm text-green-700">
            Pay the exact amount in cash when your order is delivered. No additional charges apply.
          </p>
        </div>
      )}

      {/* Order Notes */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Additional Information
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
