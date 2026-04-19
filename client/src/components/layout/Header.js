import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingBag, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(false);
  
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(false);
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
    { name: 'Collections', href: '/products' },
    { name: 'Rings', href: '/products?category=rings' },
    { name: 'Necklaces', href: '/products?category=necklaces' },
    { name: 'Earrings', href: '/products?category=earrings' },
    { name: 'Bracelets', href: '/products?category=bracelets' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-atelier-ivory/90 backdrop-blur-xl tonal-shift-bottom border-b border-atelier-outline/20">
      <div className="atelier-container h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link to="/" className="leading-none">
            <span className="block font-headline text-2xl lg:text-3xl tracking-[0.22em] uppercase">
              ECOM
            </span>
            <span className="atelier-label text-atelier-muted">Fine Jewelry</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="atelier-label text-atelier-muted hover:text-atelier-charcoal"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-atelier-charcoal/85 hover:text-atelier-gold transition-colors"
            aria-label="Search"
          >
            <FiSearch className="h-4 w-4" />
          </button>

          <Link to="/wishlist" className="relative text-atelier-charcoal/85 hover:text-atelier-gold transition-colors" aria-label="Wishlist">
            <FiHeart className="h-4 w-4" />
            {wishlistItemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-atelier-gold text-black text-[10px] leading-4 text-center rounded-full">
                {wishlistItemCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative text-atelier-charcoal/85 hover:text-atelier-gold transition-colors" aria-label="Cart">
            <FiShoppingBag className="h-4 w-4" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-atelier-gold text-black text-[10px] leading-4 text-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(!activeDropdown)}
                className="text-atelier-charcoal/85 hover:text-atelier-gold transition-colors"
                aria-label="Account menu"
              >
                <FiUser className="h-4 w-4" />
              </button>
              {activeDropdown && (
                <div className="absolute right-0 mt-4 w-52 bg-white border border-atelier-outline/40 p-3 space-y-2">
                  <Link to="/profile" className="block atelier-label text-atelier-muted hover:text-atelier-charcoal">
                    Account
                  </Link>
                  <Link to="/orders" className="block atelier-label text-atelier-muted hover:text-atelier-charcoal">
                    Orders
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" className="block atelier-label text-atelier-muted hover:text-atelier-charcoal">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="atelier-label text-atelier-muted hover:text-atelier-charcoal"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-atelier-charcoal/85 hover:text-atelier-gold transition-colors" aria-label="Login">
              <FiUser className="h-4 w-4" />
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-atelier-charcoal/85 hover:text-atelier-gold transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-atelier-outline/20 bg-atelier-ivory">
          <div className="atelier-container py-3">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <FiSearch className="h-4 w-4 text-atelier-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rings, necklaces, and more"
                className="atelier-input"
              />
              <button type="submit" className="atelier-primary-btn px-6 py-2">
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="md:hidden border-t border-atelier-outline/20 bg-atelier-ivory">
          <div className="atelier-container py-4 space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block atelier-label text-atelier-muted hover:text-atelier-charcoal"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
