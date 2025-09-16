import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiUser, 
  FiShoppingBag, 
  FiHeart, 
  FiMenu, 
  FiX,
  FiMapPin
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistItemCount = wishlistItems?.length || 0;

  const navigationItems = [
    { name: 'HIGH JEWELRY', href: '/products?category=high-jewelry' },
    { name: 'JEWELRY', href: '/products?category=jewelry' },
    { name: 'LOVE & ENGAGEMENT', href: '/products?category=love-engagement' },
    { name: 'FINE WATCHES', href: '/products?category=fine-watches' },
    { name: 'HOME', href: '/products?category=home-accessories' },
    { name: 'ACCESSORIES', href: '/products?category=accessories' },
    { name: 'GIFTS', href: '/products?category=gifts' },
    { name: 'WORLD OF TIFFANY', href: '/collections' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-luxury' : 'bg-white'
    }`}>
      {/* Top Banner */}
      <div className="bg-tiffany-blue text-white text-center py-2 px-4">
        <p className="text-sm">
          Discover our most popular designs.{' '}
          <Link to="/products?featured=true" className="underline hover:no-underline">
            Shop Now
          </Link>
        </p>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Search & Location */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300">
                <FiMapPin className="w-5 h-5" />
              </button>
            </div>

            {/* Center Section - Logo */}
            <div className="flex-1 flex justify-center">
              <Link to="/" className="flex items-center">
                <motion.h1 
                  className="text-2xl font-serif font-bold text-gray-900 tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  TIFFANY & CO.
                </motion.h1>
              </Link>
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300">
                <FiHeart className="w-5 h-5" />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                    className="p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300"
                  >
                    <FiUser className="w-5 h-5" />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'user' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-luxury border border-gray-200 py-2"
                      >
                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Profile
                        </Link>
                        <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Orders
                        </Link>
                        {user.is_admin && (
                          <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300">
                  <FiUser className="w-5 h-5" />
                </Link>
              )}
              
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300">
                <FiShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tiffany-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-tiffany-blue transition-colors duration-300"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, collections, or categories..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 focus:border-tiffany-blue focus:ring-2 focus:ring-tiffany-blue/20 outline-none"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-tiffany-blue text-white px-4 py-2 hover:bg-tiffany-blue-dark transition-colors duration-300"
                >
                  Search
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Menu */}
      <nav className={`border-b border-gray-200 bg-white ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-center">
            <ul className="flex space-x-6">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="nav-link py-4 block text-xs font-medium uppercase tracking-wide"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden border-t border-gray-200"
              >
                <ul className="py-4 space-y-2">
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-tiffany-blue transition-colors duration-300 text-sm font-medium uppercase tracking-wide"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
};

export default Header;
