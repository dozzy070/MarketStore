// frontend/src/pages/VendorDashboard.jsx - No Loading Spinners
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign, 
  FaStore,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSync,
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaChartLine
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { vendorAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function VendorDashboard() {
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    store_name: '',
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    logo: '',
    banner: '',
    website: '',
    social: {
      facebook: '',
      twitter: '',
      instagram: '',
      whatsapp: ''
    },
    verified: false,
    joined: ''
  });

  const [formData, setFormData] = useState({ ...profile });

  // Stats state
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageRating: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('Fetching vendor dashboard data...');
      
      // Fetch dashboard stats
      const statsResponse = await vendorAPI.getDashboardStats().catch(err => {
        console.warn('Stats fetch failed:', err);
        return { data: null };
      });
      
      if (statsResponse?.data) {
        setStats(statsResponse.data);
      }
      
      // Fetch sales analytics
      const analyticsResponse = await vendorAPI.getSalesAnalytics('30days').catch(err => {
        console.warn('Analytics fetch failed:', err);
        return { data: null };
      });
      
      if (analyticsResponse?.data && Array.isArray(analyticsResponse.data)) {
        setSalesData(analyticsResponse.data);
      }
      
      // Fetch profile
      const profileResponse = await vendorAPI.getProfile().catch(err => {
        console.warn('Profile fetch failed:', err);
        return { data: null };
      });
      
      if (profileResponse?.data) {
        const profileData = profileResponse.data;
        const newProfile = {
          store_name: profileData.store_name || profileData.business_name || '',
          full_name: profileData.full_name || profileData.owner_name || '',
          email: profileData.email || '',
          phone: profileData.phone_number || profileData.phone || '',
          location: profileData.location || profileData.address || '',
          bio: profileData.bio || profileData.description || '',
          logo: profileData.logo || '',
          banner: profileData.banner || '',
          website: profileData.website || '',
          social: profileData.social_media || {
            facebook: '',
            twitter: '',
            instagram: '',
            whatsapp: ''
          },
          verified: profileData.verified || false,
          joined: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : new Date().toLocaleDateString()
        };
        setProfile(newProfile);
        setFormData(newProfile);
      }
      
      // Fetch products
      const productsResponse = await vendorAPI.getProducts().catch(err => {
        console.warn('Products fetch failed:', err);
        return { data: null };
      });
      
      let products = [];
      if (productsResponse?.data) {
        if (Array.isArray(productsResponse.data)) {
          products = productsResponse.data;
        } else if (productsResponse.data.products && Array.isArray(productsResponse.data.products)) {
          products = productsResponse.data.products;
        }
      }
      setRecentProducts(products.slice(0, 5));
      
      // Fetch orders
      const ordersResponse = await vendorAPI.getOrders().catch(err => {
        console.warn('Orders fetch failed:', err);
        return { data: null };
      });
      
      let orders = [];
      if (ordersResponse?.data) {
        if (Array.isArray(ordersResponse.data)) {
          orders = ordersResponse.data;
        } else if (ordersResponse.data.orders && Array.isArray(ordersResponse.data.orders)) {
          orders = ordersResponse.data.orders;
        }
      }
      setRecentOrders(orders.slice(0, 5));
      
      if (showToast) toast.success('Dashboard refreshed');
      
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
      setError('Failed to load dashboard data. Please try again later.');
      if (showToast) toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        social: {
          ...(formData.social || {}),
          [socialKey]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await vendorAPI.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setEditing(false);
  };

  const chartData = {
    labels: salesData.map(item => item.date || item.label),
    datasets: [
      {
        label: 'Sales',
        data: salesData.map(item => item.total || item.sales || item.revenue),
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const statCards = [
    { 
      icon: FaBox, 
      label: 'Total Products', 
      value: stats.totalProducts, 
      color: '#4361ee', 
      link: '/vendor/products',
      bg: 'primary'
    },
    { 
      icon: FaShoppingCart, 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      color: '#06d6a0', 
      link: '/vendor/orders',
      bg: 'success'
    },
    { 
      icon: FaDollarSign, 
      label: 'Revenue', 
      value: `₦${stats.totalRevenue.toLocaleString()}`, 
      color: '#ffd166', 
      link: '/vendor/orders',
      bg: 'warning'
    },
    { 
      icon: FaClock, 
      label: 'Pending Orders', 
      value: stats.pendingOrders, 
      color: '#fb8500', 
      link: '/vendor/orders?filter=pending',
      bg: 'warning'
    },
    { 
      icon: FaChartLine, 
      label: 'Avg Rating', 
      value: stats.averageRating?.toFixed(1) || '0.0', 
      color: '#ef476f', 
      link: '/vendor/reviews',
      bg: 'danger'
    }
  ];

  const alerts = [
    { 
      type: 'warning', 
      count: stats.pendingOrders, 
      message: 'Pending orders need your attention',
      link: '/vendor/orders?filter=pending'
    },
    { 
      type: 'danger', 
      count: stats.lowStockProducts, 
      message: 'Products with low stock',
      link: '/vendor/products?filter=lowstock'
    }
  ];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="welcome-banner mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="mb-1">Welcome back, {profile.full_name || 'Vendor'}! 👋</h2>
            <p className="mb-0 text-white-50">{profile.store_name || 'Your Store'}</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="light" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSync className={`me-2 ${refreshing ? 'fa-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link to="/vendor/products/add">
              <Button variant="primary">
                <FaPlus className="me-2" /> Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3" size={24} />
            <div>
              <strong>Error loading dashboard</strong>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Alerts for pending items */}
      {alerts.some(alert => alert.count > 0) && (
        <Row className="g-3 mb-4">
          {alerts.map((alert, index) => (
            alert.count > 0 && (
              <Col key={index} md={6}>
                <Card className={`border-0 shadow-sm bg-${alert.type} bg-opacity-10`}>
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <h6 className="mb-1">{alert.message}</h6>
                        <Badge bg={alert.type}>{alert.count}</Badge>
                      </div>
                      <Button 
                        variant={alert.type} 
                        size="sm"
                        as={Link}
                        to={alert.link}
                      >
                        View
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          ))}
        </Row>
      )}

      {/* Profile Section */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">Store Profile</h5>
          {!editing ? (
            <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>
              <FaEdit className="me-2" /> Edit Profile
            </Button>
          ) : (
            <div className="d-flex gap-2">
              <Button variant="success" size="sm" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : <><FaSave className="me-2" /> Save</>}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                <FaTimes className="me-2" /> Cancel
              </Button>
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-4">
          {editing ? (
            // Edit Mode
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    placeholder="Enter store name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Owner Name</Form.Label>
                  <Form.Control
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Bio / Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell customers about your store"
                  />
                </Form.Group>
              </Col>
            </Row>
          ) : (
            // View Mode
            <Row>
              <Col md={4}>
                <p className="mb-2">
                  <FaStore className="me-2 text-primary" /> 
                  <strong>Store:</strong> {profile.store_name || 'Not set'}
                </p>
                <p className="mb-2">
                  <FaUser className="me-2 text-primary" /> 
                  <strong>Owner:</strong> {profile.full_name || 'Not set'}
                </p>
                <p className="mb-2">
                  <FaEnvelope className="me-2 text-primary" /> 
                  <strong>Email:</strong> {profile.email || 'Not set'}
                </p>
              </Col>
              <Col md={4}>
                <p className="mb-2">
                  <FaPhone className="me-2 text-primary" /> 
                  <strong>Phone:</strong> {profile.phone || 'Not set'}
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt className="me-2 text-primary" /> 
                  <strong>Location:</strong> {profile.location || 'Not set'}
                </p>
                {profile.website && (
                  <p className="mb-2">
                    <FaGlobe className="me-2 text-primary" /> 
                    <strong>Website:</strong> {profile.website}
                  </p>
                )}
              </Col>
              <Col md={4}>
                {profile.bio && (
                  <p className="mb-2">
                    <strong>Bio:</strong> {profile.bio}
                  </p>
                )}
                {profile.verified && (
                  <p className="mb-2">
                    <FaCheckCircle className="text-success me-2" /> 
                    Verified Seller
                  </p>
                )}
                {profile.joined && (
                  <p className="text-muted small mt-2">
                    Member since {profile.joined}
                  </p>
                )}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Stats Grid */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col key={index} md={4} lg={3}>
            <Link to={stat.link} className="text-decoration-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm stat-card">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className={`p-3 rounded-circle me-3 bg-${stat.bg} bg-opacity-10`}>
                        <stat.icon style={{ color: stat.color }} size={24} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">{stat.label}</h6>
                        <h4 className="mb-0">{stat.value}</h4>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Sales Chart */}
      {salesData.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 className="mb-0">Sales Overview (Last 30 Days)</h6>
            <Link to="/vendor/analytics" className="text-decoration-none small">View Details</Link>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `₦${context.raw.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => `₦${value.toLocaleString()}`
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Recent Orders & Products */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Orders</h6>
              <Link to="/vendor/orders" className="text-decoration-none small">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                      </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                           <td>#{order.id?.slice(0, 8) || 'N/A'}</td>
                           <td>{order.customer_name || order.user?.name || 'Guest'}</td>
                           <td>₦{parseFloat(order.total || 0).toLocaleString()}</td>
                           <td>
                            <Badge bg={
                              order.status === 'delivered' ? 'success' :
                              order.status === 'shipped' ? 'info' :
                              order.status === 'processing' ? 'primary' : 'warning'
                            }>
                              {order.status || 'pending'}
                            </Badge>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaShoppingCart size={40} className="mb-2" />
                  <p>No recent orders</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Products</h6>
              <Link to="/vendor/products" className="text-decoration-none small">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {recentProducts.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                       <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                       </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map(product => (
                        <tr key={product.id}>
                           <td>{product.name}</td>
                           <td>₦{parseFloat(product.price || 0).toLocaleString()}</td>
                           <td>
                            <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>
                              {product.stock_quantity || 0}
                            </Badge>
                           </td>
                           <td>
                            {product.published ? (
                              <Badge bg="success">Published</Badge>
                            ) : (
                              <Badge bg="secondary">Draft</Badge>
                            )}
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaBox size={40} className="mb-2" />
                  <p>No products yet</p>
                  <Link to="/vendor/products/add">
                    <Button variant="primary" size="sm">
                      <FaPlus className="me-2" /> Add Your First Product
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-0 pt-4">
          <h6 className="mb-0">Quick Actions</h6>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3} sm={6}>
              <Button 
                variant="outline-primary" 
                className="w-100 py-3"
                as={Link}
                to="/vendor/products/add"
              >
                <FaBox className="me-2" />
                Add Product
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                variant="outline-success" 
                className="w-100 py-3"
                as={Link}
                to="/vendor/orders"
              >
                <FaShoppingCart className="me-2" />
                View Orders
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                variant="outline-info" 
                className="w-100 py-3"
                as={Link}
                to="/vendor/store"
              >
                <FaStore className="me-2" />
                Manage Store
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                variant="outline-warning" 
                className="w-100 py-3"
                as={Link}
                to="/vendor/payouts"
              >
                <FaDollarSign className="me-2" />
                Request Payout
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <style>{`
        .welcome-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 24px 28px;
          color: white;
        }
        
        .welcome-banner h2 {
          color: white;
        }
        
        .stat-card {
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        
        .fa-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default VendorDashboard;
