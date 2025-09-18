import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaPinterest, 
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'Jewelry', href: '/category/jewelry' },
        { name: 'Watches', href: '/category/watches' },
        { name: 'Accessories', href: '/category/accessories' },
        { name: 'Home & Living', href: '/category/home-living' },
        { name: 'New Arrivals', href: '/new-arrivals' },
        { name: 'Best Sellers', href: '/best-sellers' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Shipping & Returns', href: '/shipping-returns' },
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'Care Instructions', href: '/care-instructions' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Track Order', href: '/track-order' }
      ]
    },
    {
      title: 'About',
      links: [
        { name: 'Our Story', href: '/about' },
        { name: 'Craftsmanship', href: '/craftsmanship' },
        { name: 'Sustainability', href: '/sustainability' },
        { name: 'Press', href: '/press' },
        { name: 'Careers', href: '/careers' },
        { name: 'Store Locator', href: '/stores' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Accessibility', href: '/accessibility' },
        { name: 'California Privacy', href: '/california-privacy' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com' },
    { name: 'Pinterest', icon: FaPinterest, href: 'https://pinterest.com' },
    { name: 'YouTube', icon: FaYoutube, href: 'https://youtube.com' }
  ];

  const contactInfo = [
    { icon: FaPhone, text: '+1 (800) 555-0123', href: 'tel:+18005550123' },
    { icon: FaEnvelope, text: 'service@luxuryecom.com', href: 'mailto:service@luxuryecom.com' },
    { icon: FaMapMarkerAlt, text: '123 Luxury Ave, New York, NY 10001', href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h3 
              className="text-3xl font-playfair font-semibold text-tiffany-blue mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Stay in the Loop
            </motion.h3>
            <motion.p 
              className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Be the first to know about new collections, exclusive events, and special offers.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiffany-blue focus:border-transparent"
              />
              <button className="px-8 py-3 bg-tiffany-blue hover:bg-tiffany-blue-dark text-white font-medium rounded-lg transition-colors duration-300">
                Subscribe
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="inline-block">
                <h2 className="text-2xl font-playfair font-bold text-tiffany-blue mb-4">
                  E-Commerce Shop
                </h2>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Discover the world's finest luxury goods, crafted with exceptional attention to detail 
                and delivered with unparalleled service.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <motion.a
                    key={index}
                    href={contact.href}
                    className="flex items-center text-gray-400 hover:text-tiffany-blue transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <contact.icon className="w-4 h-4 mr-3 text-tiffany-blue" />
                    <span className="text-sm">{contact.text}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <motion.h3 
                className="text-lg font-semibold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              >
                {section.title}
              </motion.h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                  >
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-tiffany-blue transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <motion.div 
              className="text-gray-400 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p>&copy; {currentYear} E-Commerce Shop. All rights reserved.</p>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-tiffany-blue rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex flex-wrap justify-center items-center space-x-8 text-gray-500 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-tiffany-blue rounded-full"></div>
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-tiffany-blue rounded-full"></div>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-tiffany-blue rounded-full"></div>
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-tiffany-blue rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
