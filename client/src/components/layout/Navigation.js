import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { IoChevronDown, IoSearchOutline } from 'react-icons/io5';

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const dropdownRefs = useRef({});

  const navigationItems = [
    {
      name: 'HIGH JEWELRY',
      href: '/high-jewelry',
      dropdown: [
        { name: 'Diamond Collections', href: '/high-jewelry/diamonds', description: 'Exquisite diamond pieces' },
        { name: 'Emerald Collections', href: '/high-jewelry/emeralds', description: 'Rare emerald masterpieces' },
        { name: 'Sapphire Collections', href: '/high-jewelry/sapphires', description: 'Stunning sapphire designs' },
        { name: 'Ruby Collections', href: '/high-jewelry/rubies', description: 'Bold ruby creations' }
      ]
    },
    {
      name: 'JEWELRY',
      href: '/jewelry',
      dropdown: [
        { name: 'Rings', href: '/jewelry/rings', description: 'Elegant rings for every occasion' },
        { name: 'Necklaces', href: '/jewelry/necklaces', description: 'Statement necklaces' },
        { name: 'Earrings', href: '/jewelry/earrings', description: 'Beautiful earrings' },
        { name: 'Bracelets', href: '/jewelry/bracelets', description: 'Charming bracelets' }
      ]
    },
    {
      name: 'LOVE & ENGAGEMENT',
      href: '/love-engagement',
      dropdown: [
        { name: 'Engagement Rings', href: '/love-engagement/engagement-rings', description: 'Symbols of eternal love' },
        { name: 'Wedding Bands', href: '/love-engagement/wedding-bands', description: 'Perfect wedding bands' },
        { name: 'Anniversary Gifts', href: '/love-engagement/anniversary', description: 'Celebrate your love' },
        { name: 'Promise Rings', href: '/love-engagement/promise-rings', description: 'Tokens of commitment' }
      ]
    },
    {
      name: 'FINE WATCHES',
      href: '/fine-watches',
      dropdown: [
        { name: 'Luxury Watches', href: '/fine-watches/luxury', description: 'Premium timepieces' },
        { name: 'Diamond Watches', href: '/fine-watches/diamond', description: 'Diamond-encrusted watches' },
        { name: 'Classic Watches', href: '/fine-watches/classic', description: 'Timeless designs' },
        { name: 'Sports Watches', href: '/fine-watches/sports', description: 'Active lifestyle watches' }
      ]
    },
    {
      name: 'HOME',
      href: '/',
      dropdown: [
        { name: 'Homepage', href: '/', description: 'Return to homepage' },
        { name: 'New Arrivals', href: '/new-arrivals', description: 'Latest collections' },
        { name: 'Best Sellers', href: '/bestsellers', description: 'Customer favorites' },
        { name: 'Sale', href: '/sale', description: 'Special offers' }
      ]
    },
    {
      name: 'ACCESSORIES',
      href: '/accessories',
      dropdown: [
        { name: 'Handbags', href: '/accessories/handbags', description: 'Luxury handbags' },
        { name: 'Scarves', href: '/accessories/scarves', description: 'Silk scarves' },
        { name: 'Belts', href: '/accessories/belts', description: 'Designer belts' },
        { name: 'Sunglasses', href: '/accessories/sunglasses', description: 'Premium eyewear' }
      ]
    },
    {
      name: 'GIFTS',
      href: '/gifts',
      dropdown: [
        { name: 'Gift Cards', href: '/gifts/gift-cards', description: 'Perfect for any occasion' },
        { name: 'Gift Sets', href: '/gifts/sets', description: 'Curated gift collections' },
        { name: 'Personalized Gifts', href: '/gifts/personalized', description: 'Customized pieces' },
        { name: 'Holiday Gifts', href: '/gifts/holiday', description: 'Seasonal collections' }
      ]
    },
    {
      name: 'WORLD OF TIFFANY',
      href: '/world-of-tiffany',
      dropdown: [
        { name: 'Our Story', href: '/world-of-tiffany/story', description: 'Tiffany heritage' },
        { name: 'Sustainability', href: '/world-of-tiffany/sustainability', description: 'Our commitment' },
        { name: 'Careers', href: '/world-of-tiffany/careers', description: 'Join our team' },
        { name: 'Stores', href: '/world-of-tiffany/stores', description: 'Find a store near you' }
      ]
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !dropdownRefs.current[activeDropdown]?.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    setActiveDropdown(null);
    setIsSearchOpen(false);
  }, [location]);

  const handleDropdownToggle = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {/* Main Navigation Items */}
      {navigationItems.map((item) => (
        <div key={item.name} className="relative" ref={(el) => dropdownRefs.current[item.name] = el}>
          <button
            onClick={() => handleDropdownToggle(item.name)}
            className={`flex items-center space-x-1 py-2 px-3 rounded-lg transition-all duration-200 font-medium ${
              isActive(item.href)
                ? 'text-tiffany-blue bg-tiffany-blue/10'
                : 'text-gray-700 hover:text-tiffany-blue hover:bg-gray-50'
            }`}
          >
            <span>{item.name}</span>
            <IoChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                activeDropdown === item.name ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {activeDropdown === item.name && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50"
              >
                <div className="grid grid-cols-1 gap-1">
                  {item.dropdown.map((dropdownItem) => (
                    <Link
                      key={dropdownItem.name}
                      to={dropdownItem.href}
                      className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-tiffany-blue transition-colors duration-150">
                        {dropdownItem.name}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {dropdownItem.description}
                      </span>
                    </Link>
                  ))}
                </div>
                
                {/* View All Link */}
                <div className="border-t border-gray-100 mt-3 pt-3">
                  <Link
                    to={item.href}
                    className="flex items-center justify-between px-4 py-2 text-tiffany-blue hover:bg-tiffany-blue/5 transition-colors duration-150"
                  >
                    <span className="font-medium">View All {item.name}</span>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="w-4 h-4"
                    >
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Search Button */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="p-2 text-gray-700 hover:text-tiffany-blue hover:bg-gray-50 rounded-lg transition-all duration-200"
        aria-label="Search"
      >
        <IoSearchOutline className="w-5 h-5" />
      </button>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 300 }}
            exit={{ opacity: 0, width: 0 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-4 px-6 z-50"
          >
            <div className="max-w-7xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands, or collections..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiffany-blue focus:border-transparent"
                  autoFocus
                />
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
