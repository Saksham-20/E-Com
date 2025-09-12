import React, { useState } from 'react';
import Button from '../ui/Button';

const NewsletterSignup = ({ 
  title = "Stay Updated", 
  subtitle = "Get the latest news and exclusive offers delivered to your inbox.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  onSubmit,
  className = ""
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Default newsletter signup logic
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      }
      
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading || success}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || success}
            className="whitespace-nowrap"
          >
            {loading ? 'Subscribing...' : buttonText}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600 text-center">
            Thank you for subscribing! You'll receive our updates soon.
          </p>
        )}
      </form>

      <p className="text-xs text-gray-500 text-center mt-3">
        By subscribing, you agree to our{' '}
        <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
          Privacy Policy
        </a>
        . You can unsubscribe at any time.
      </p>
    </div>
  );
};

export default NewsletterSignup;
