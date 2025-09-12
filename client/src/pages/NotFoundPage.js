import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoHome, IoSearch, IoArrowBack } from 'react-icons/io5';

const NotFoundPage = () => {
  const quickLinks = [
    { name: 'Home', href: '/', icon: IoHome, description: 'Return to homepage' },
    { name: 'Products', href: '/products', icon: IoSearch, description: 'Browse our collections' },
    { name: 'Collections', href: '/collections', icon: IoSearch, description: 'Explore categories' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <h1 className="text-9xl md:text-[12rem] font-bold text-tiffany-blue font-playfair leading-none">
            404
          </h1>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-playfair">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're sorry, but the page you're looking for seems to have wandered off. 
            Perhaps it's exploring our luxury collections or enjoying a moment of elegance elsewhere.
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Where would you like to go?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link
                  to={link.href}
                  className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-tiffany-blue/20"
                >
                  <div className="w-16 h-16 bg-tiffany-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-tiffany-blue group-hover:text-white transition-all duration-300">
                    <link.icon className="w-8 h-8 text-tiffany-blue group-hover:text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {link.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {link.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/"
            className="bg-tiffany-blue text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-tiffany-blue-dark transition-colors duration-300 flex items-center group"
          >
            <IoHome className="mr-2 group-hover:scale-110 transition-transform duration-200" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="border-2 border-tiffany-blue text-tiffany-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-tiffany-blue hover:text-white transition-all duration-300 flex items-center group"
          >
            <IoArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Go Back
          </button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help Finding Something?
          </h3>
          <p className="text-gray-600 mb-4">
            Our customer service team is here to help you navigate our luxury collections 
            and find exactly what you're looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="text-tiffany-blue hover:text-tiffany-blue-dark font-semibold flex items-center justify-center group"
            >
              <span className="mr-2">📞</span>
              Call us: +1 (555) 123-4567
            </a>
            <a
              href="mailto:hello@luxuryecommerce.com"
              className="text-tiffany-blue hover:text-tiffany-blue-dark font-semibold flex items-center justify-center group"
            >
              <span className="mr-2">✉️</span>
              Email us
            </a>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute top-20 left-20 w-32 h-32 bg-tiffany-blue/5 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-tiffany-blue/5 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
