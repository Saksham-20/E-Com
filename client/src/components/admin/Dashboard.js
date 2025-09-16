import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../ui/Loading';
import useAuth from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Helper function to safely format numbers
  const safeToFixed = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    try {
      return Number(value).toFixed(decimals);
    } catch (error) {
      console.warn('Error formatting number:', value, error);
      return '0.00';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const dashboardResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch analytics data
      const analyticsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/analytics?period=30d`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        console.log('Dashboard data received:', data);
        
        // Safely set data with fallbacks
        setStats(data.stats || {});
        setRecentOrders(Array.isArray(data.recentOrders) ? data.recentOrders : []);
        // Handle both possible field names
        const lowStockProducts = data.lowStockProducts || data.LowStockProducts || [];
        setRecentProducts(Array.isArray(lowStockProducts) ? lowStockProducts : []);
      } else {
        console.error('Failed to fetch dashboard data:', dashboardResponse.status, dashboardResponse.statusText);
        // Set empty data on error
        setStats({});
        setRecentOrders([]);
        setRecentProducts([]);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setTopProducts(analyticsData.topProducts || []);
        setAnalyticsData(analyticsData);
      } else {
        console.error('Failed to fetch analytics data:', analyticsResponse.status);
        setTopProducts([]);
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setStats({});
      setRecentOrders([]);
      setRecentProducts([]);
      setTopProducts([]);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.first_name || 'Admin'}! Here's what's happening with your store.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${safeToFixed(stats?.totalRevenue)}`}
          change={0}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={0}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalUsers || 0}
          change={0}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          change={0}
          icon="🛍️"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Add Product"
            description="Create a new product listing"
            icon="➕"
            link="/admin/products"
            color="blue"
          />
          <QuickActionCard
            title="View Orders"
            description="Manage customer orders"
            icon="📋"
            link="/admin/orders"
            color="green"
          />
          <QuickActionCard
            title="Manage Users"
            description="View and manage user accounts"
            icon="👤"
            link="/admin/users"
            color="purple"
          />
          <QuickActionCard
            title="View Products"
            description="Manage all products"
            icon="🛍️"
            link="/admin/products"
            color="orange"
          />
          <QuickActionCard
            title="Store Settings"
            description="Configure store settings"
            icon="⚙️"
            link="/admin/settings"
            color="gray"
          />
          <QuickActionCard
            title="Inventory"
            description="Check stock levels and manage inventory"
            icon="📦"
            link="/admin/products"
            color="red"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {!recentOrders || recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order, index) => (
                  <div key={order.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.order_number || order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.first_name || 'Unknown'} {order.last_name || 'Customer'} • {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown Date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${safeToFixed(order.total_amount)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
              <Link
                to="/admin/products"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Manage inventory
              </Link>
            </div>
          </div>
          <div className="p-6">
            {!recentProducts || recentProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            ) : (
              <div className="space-y-4">
                {recentProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id || index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-lg">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name || 'Unnamed Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${safeToFixed(product.price)} • SKU: {product.sku || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {product.stock_quantity || 0} left
                      </p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      {topProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Best Sellers</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                      <img
                        src={product.image_url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover ml-3"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.total_quantity || 0} sold
                      </p>
                      <p className="text-sm text-gray-500">
                        ${safeToFixed(product.total_revenue || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, color = 'blue' }) => {
  const isPositive = change >= 0;
  
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200'
  };

  const iconColorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <span className={`text-2xl ${iconColorClasses[color]}`}>{icon}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
      {change !== 0 && (
        <div className="mt-4">
          <span className={`inline-flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '↗' : '↘'} {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, link, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200',
    red: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
  };

  return (
    <Link
      to={link}
      className={`block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:scale-105 ${colorClasses[color]}`}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-white/50">
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm opacity-80 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
