import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Lazy load page components for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tiffany-blue"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes - No Header */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Admin Routes - No Header */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminDashboardPage />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminProductsPage />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminOrdersPage />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminUsersPage />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/analytics" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminAnalyticsPage />
                    </AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminLayout>
                      <AdminSettingsPage />
                    </AdminLayout>
                  </AdminRoute>
                } />
                
                {/* Main App Routes - With Header */}
                <Route path="/*" element={
                  <div className="min-h-screen bg-white flex flex-col">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/collections/:slug" element={<CollectionPage />} />
                        
                        {/* Navigation Category Routes */}
                        <Route path="/high-jewelry" element={<ProductsPage category="high-jewelry" />} />
                        <Route path="/high-jewelry/:subcategory" element={<ProductsPage category="high-jewelry" />} />
                        <Route path="/jewelry" element={<ProductsPage category="jewelry" />} />
                        <Route path="/jewelry/:subcategory" element={<ProductsPage category="jewelry" />} />
                        <Route path="/love-engagement" element={<ProductsPage category="love-engagement" />} />
                        <Route path="/love-engagement/:subcategory" element={<ProductsPage category="love-engagement" />} />
                        <Route path="/fine-watches" element={<ProductsPage category="fine-watches" />} />
                        <Route path="/fine-watches/:subcategory" element={<ProductsPage category="fine-watches" />} />
                        <Route path="/accessories" element={<ProductsPage category="accessories" />} />
                        <Route path="/accessories/:subcategory" element={<ProductsPage category="accessories" />} />
                        <Route path="/gifts" element={<ProductsPage category="gifts" />} />
                        <Route path="/gifts/:subcategory" element={<ProductsPage category="gifts" />} />
                        <Route path="/world-of-tiffany" element={<CollectionPage />} />
                        <Route path="/world-of-tiffany/:subcategory" element={<CollectionPage />} />
                        
                        {/* Special Pages */}
                        <Route path="/new-arrivals" element={<ProductsPage category="new-arrivals" />} />
                        <Route path="/bestsellers" element={<ProductsPage category="bestsellers" />} />
                        <Route path="/sale" element={<ProductsPage category="sale" />} />
                        
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        
                        {/* Protected Routes */}
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        } />
                        
                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </Suspense>
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#81D8D0',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
