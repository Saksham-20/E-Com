import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../ui/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders/recent'),
        fetch('/api/admin/products/recent')
      ]);

      const statsData = await statsResponse.json();
      const ordersData = await ordersResponse.json();
      const productsData = await productsResponse.json();

      setStats(statsData);
      setRecentOrders(ordersData);
      setRecentProducts(productsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={`$${stats?.totalSales?.toFixed(2) || '0.00'}`}
          change={stats?.salesChange || 0}
          icon="💰"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={stats?.ordersChange || 0}
          icon="📦"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          change={stats?.customersChange || 0}
          icon="👥"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          change={stats?.productsChange || 0}
          icon="🛍️"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <QuickActionCard
          title="Add Product"
          description="Create a new product listing"
          icon="➕"
          link="/admin/products/new"
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
          title="Analytics"
          description="View detailed analytics and reports"
          icon="📊"
          link="/admin/analytics"
          color="orange"
        />
        <QuickActionCard
          title="Settings"
          description="Configure store settings"
          icon="⚙️"
          link="/admin/settings"
          color="gray"
        />
        <QuickActionCard
          title="Inventory"
          description="Check stock levels and manage inventory"
          icon="📦"
          link="/admin/inventory"
          color="red"
        />
      </div>

      {/* Recent Activity */}
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
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
              <Link
                to="/admin/products"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent products</p>
            ) : (
              <div className="space-y-4">
                {recentProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center space-x-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${product.price.toFixed(2)} • {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {change !== 0 && (
        <div className="mt-4">
          <span className={`inline-flex items-center text-sm ${
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
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100'
  };

  return (
    <Link
      to={link}
      className={`block p-6 rounded-lg border border-transparent transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
