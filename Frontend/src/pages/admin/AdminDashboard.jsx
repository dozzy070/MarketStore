// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { 
  FaUsers, FaStore, FaBox, FaShoppingCart, FaDollarSign,
  FaChartLine, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaStar, FaCog, FaCheck, FaTimes, FaList, FaHistory,
  FaComment, FaSync, FaArrowRight, FaTrash
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false); // only for manual refresh button (disabled state)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    pendingProducts: 0,
    pendingReviews: 0,
    totalCategories: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [revenueData, setRevenueData] = useState({ labels: [], values: [] });

  const triggerRealTimeUpdate = () => {
    window.dispatchEvent(new CustomEvent('pendingCountsUpdated'));
    localStorage.setItem('pending_counts_updated', Date.now().toString());
  };

  // Fetch admin data
  // @param showToast - whether to show success/error toast
  // @param silent - if true, do not show refresh button spinner
  const fetchAdminData = async (showToast = false, silent = false) => {
    if (showToast) setRefreshing(true);

    try {
      const [
        usersRes, vendorsRes, productsRes, reviewsRes, categoriesRes, revenueRes
      ] = await Promise.allSettled([
        adminAPI.getUsers(),
        adminAPI.getVendors(),
        adminAPI.getAllProducts(),
        adminAPI.getReviews(),
        adminAPI.getCategories ? adminAPI.getCategories() : Promise.reject('No categories endpoint'),
        adminAPI.getRevenueOverview ? adminAPI.getRevenueOverview() : Promise.reject('No revenue endpoint')
      ]);
      
      // Process users
      let usersData = [];
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        usersData = Array.isArray(usersRes.value.data) ? usersRes.value.data : (usersRes.value.data.data || []);
        setRecentUsers(usersData.slice(0, 5));
      }
      
      // Process vendors
      let vendorsData = [];
      let pendingVendorsList = [];
      if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.data) {
        vendorsData = Array.isArray(vendorsRes.value.data) ? vendorsRes.value.data : (vendorsRes.value.data.data || []);
        pendingVendorsList = vendorsData.filter(v => v.status === 'pending' || !v.verified);
        setPendingVendors(pendingVendorsList.slice(0, 5));
      }
      
      // Process products
      let productsData = [];
      let pendingProductsList = [];
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        productsData = Array.isArray(productsRes.value.data) ? productsRes.value.data : (productsRes.value.data.data || []);
        pendingProductsList = productsData.filter(p => p.status === 'pending');
        setPendingProducts(pendingProductsList.slice(0, 5));
      }
      
      // Process reviews
      let reviewsData = [];
      let pendingReviewsList = [];
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
        reviewsData = Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : (reviewsRes.value.data.data || []);
        pendingReviewsList = reviewsData.filter(r => r.status === 'pending');
        setPendingReviews(pendingReviewsList.slice(0, 5));
        setRecentReviews(pendingReviewsList.slice(0, 5));
      }
      
      // Process categories
      let categoriesData = [];
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data) {
        categoriesData = Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : (categoriesRes.value.data.data || []);
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
      
      // Process revenue data
      let revenue = { labels: [], values: [] };
      if (revenueRes.status === 'fulfilled' && revenueRes.value?.data) {
        const rev = revenueRes.value.data;
        revenue.labels = rev.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        revenue.values = rev.values || [0,0,0,0,0,0];
        setRevenueData(revenue);
      } else {
        setRevenueData({ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [0,0,0,0,0,0] });
      }
      
      setStats({
        totalUsers: usersData.length,
        totalVendors: vendorsData.length,
        totalProducts: productsData.length,
        totalOrders: 0,
        totalRevenue: revenue.values.reduce((a,b) => a+b, 0),
        pendingVendors: pendingVendorsList.length,
        pendingProducts: pendingProductsList.length,
        pendingReviews: pendingReviewsList.length,
        totalCategories: categoriesData.length
      });
      
      if (showToast) toast.success('Dashboard refreshed');
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (showToast) toast.error('Failed to refresh data');
    } finally {
      if (showToast) setRefreshing(false);
    }
  };

  // Approve vendor
  const handleApproveVendor = async (vendorId) => {
    try {
      await adminAPI.approveVendor(vendorId);
      toast.success('Vendor approved successfully');
      await fetchAdminData(false, true); // silent refresh
      triggerRealTimeUpdate();
    } catch (error) {
      console.error('Approve vendor error:', error);
      toast.error('Failed to approve vendor');
    }
  };

  // Approve product
  const handleApproveProduct = async (productId) => {
    try {
      await adminAPI.approveProduct(productId);
      toast.success('Product approved successfully');
      await fetchAdminData(false, true);
      triggerRealTimeUpdate();
    } catch (error) {
      console.error('Approve product error:', error);
      toast.error('Failed to approve product');
    }
  };

  // Approve review
  const handleApproveReview = async (reviewId) => {
    try {
      await adminAPI.approveReview(reviewId);
      toast.success('Review approved successfully');
      await fetchAdminData(false, true);
      triggerRealTimeUpdate();
    } catch (error) {
      console.error('Approve review error:', error);
      toast.error('Failed to approve review');
    }
  };

  // Reject review
  const handleRejectReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to reject this review?')) {
      try {
        await adminAPI.rejectReview(reviewId);
        toast.success('Review rejected');
        await fetchAdminData(false, true);
        triggerRealTimeUpdate();
      } catch (error) {
        console.error('Reject review error:', error);
        toast.error('Failed to reject review');
      }
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await adminAPI.deleteReview(reviewId);
        toast.success('Review deleted');
        await fetchAdminData(false, true);
        triggerRealTimeUpdate();
      } catch (error) {
        console.error('Delete review error:', error);
        toast.error('Failed to delete review');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    fetchAdminData(false, true); // initial load – silent (no spinner)
    
    const handlePendingUpdate = () => {
      fetchAdminData(false, true); // silent refresh
    };
    window.addEventListener('pendingCountsUpdated', handlePendingUpdate);
    
    // Poll every 15 seconds (silent)
    const interval = setInterval(() => {
      fetchAdminData(false, true);
    }, 15000);
    
    return () => {
      window.removeEventListener('pendingCountsUpdated', handlePendingUpdate);
      clearInterval(interval);
    };
  }, []);

  const quickActions = [
    { icon: FaList, label: 'Categories', color: '#4361ee', link: '/admin/categories', count: stats.totalCategories },
    { icon: FaComment, label: 'Reviews', color: '#06d6a0', link: '/admin/reviews', count: stats.pendingReviews },
    { icon: FaHistory, label: 'Audit Log', color: '#ffd166', link: '/admin/audit-log', count: null },
    { icon: FaUsers, label: 'Users', color: '#ef476f', link: '/admin/users', count: stats.totalUsers },
    { icon: FaStore, label: 'Vendors', color: '#4cc9f0', link: '/admin/vendors', count: stats.totalVendors },
    { icon: FaBox, label: 'Products', color: '#fb8500', link: '/admin/products', count: stats.totalProducts },
    { icon: FaShoppingCart, label: 'Orders', color: '#e63946', link: '/admin/orders', count: stats.totalOrders },
    { icon: FaCog, label: 'Settings', color: '#7209b7', link: '/admin/settings', count: null }
  ];

  const statCards = [
    { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: '#4361ee', link: '/admin/users' },
    { icon: FaStore, label: 'Vendors', value: stats.totalVendors, color: '#06d6a0', link: '/admin/vendors' },
    { icon: FaBox, label: 'Products', value: stats.totalProducts, color: '#ffd166', link: '/admin/products' },
    { icon: FaShoppingCart, label: 'Orders', value: stats.totalOrders, color: '#ef476f', link: '/admin/orders' },
    { icon: FaDollarSign, label: 'Revenue', value: formatCurrency(stats.totalRevenue), color: '#4cc9f0', link: '/admin/analytics' },
    { icon: FaClock, label: 'Pending Vendors', value: stats.pendingVendors, color: '#fb8500', link: '/admin/vendors?filter=pending' },
    { icon: FaStar, label: 'Pending Reviews', value: stats.pendingReviews, color: '#e63946', link: '/admin/reviews?filter=pending' },
    { icon: FaList, label: 'Categories', value: stats.totalCategories, color: '#7209b7', link: '/admin/categories' }
  ];

  const lineChartData = {
    labels: revenueData.labels,
    datasets: [{
      label: 'Revenue',
      data: revenueData.values,
      borderColor: '#4361ee',
      backgroundColor: 'rgba(67, 97, 238, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const categoryDistributionData = {
    labels: categories.length > 0 ? categories.map(c => c.name) : ['No categories'],
    datasets: [{
      data: categories.length > 0 ? categories.map(() => 1) : [1],
      backgroundColor: ['#4361ee', '#06d6a0', '#ffd166', '#ef476f', '#4cc9f0', '#fb8500']
    }]
  };

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        {/* Welcome Banner */}
        <div className="welcome-banner mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1">Admin Dashboard</h2>
              <p className="text-muted mb-0">Oversee platform operations and manage marketplace</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={() => fetchAdminData(true, false)}
                disabled={refreshing}
                className="d-flex align-items-center gap-2"
              >
                <FaSync /> 
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h5 className="mb-3">Quick Actions</h5>
        <Row className="g-3 mb-4">
          {quickActions.map((action, index) => (
            <Col key={index} lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                whileHover={{ y: -4 }}
              >
                <Card 
                  className="border-0 shadow-sm quick-action-card"
                  onClick={() => navigate(action.link)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <div className="p-3 rounded-circle me-3" style={{ background: `${action.color}20` }}>
                      <action.icon style={{ color: action.color }} size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{action.label}</h6>
                      {action.count !== null && action.count > 0 && (
                        <Badge bg="primary" className="mt-1">{action.count}</Badge>
                      )}
                    </div>
                    <FaArrowRight className="text-muted" size={14} />
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Main Stats Grid */}
        <h5 className="mb-3">Platform Overview</h5>
        <Row className="g-4 mb-4">
          {statCards.map((stat, index) => (
            <Col key={index} lg={3} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-0 shadow-sm stat-card h-100" onClick={() => navigate(stat.link)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="text-muted mb-1">{stat.label}</h6>
                        <h4 className="mb-0">{stat.value}</h4>
                      </div>
                      <div className="p-3 rounded-circle" style={{ background: `${stat.color}20` }}>
                        <stat.icon style={{ color: stat.color }} size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row className="g-4 mb-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Revenue Overview</h6>
                <Link to="/admin/analytics" className="text-decoration-none small">View Details</Link>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '280px' }}>
                  <Line data={lineChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4">
                <h6 className="mb-0">Category Distribution</h6>
              </Card.Header>
              <Card.Body>
                {categories.length > 0 ? (
                  <div style={{ height: '220px' }}>
                    <Doughnut data={categoryDistributionData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } }
                    }} />
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <FaList size={30} className="mb-2" />
                    <p>No categories data available</p>
                  </div>
                )}
                <div className="text-center mt-2">
                  <Link to="/admin/categories">
                    <Button variant="link" size="sm">Manage Categories</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Approvals Section */}
        <Row className="g-4 mb-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0"><FaStore className="me-2 text-warning" /> Pending Vendors ({stats.pendingVendors})</h6>
                <Link to="/admin/vendors?filter=pending" className="text-decoration-none small">View All</Link>
              </Card.Header>
              <Card.Body className="p-0">
                {pendingVendors.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {pendingVendors.map(vendor => (
                      <div key={vendor.id} className="list-group-item border-0 d-flex justify-content-between align-items-center py-3">
                        <div className="flex-grow-1">
                          <div className="fw-medium">{vendor.business_name || vendor.full_name || vendor.owner_name}</div>
                          <small className="text-muted">{vendor.email}</small>
                          <div className="mt-1">
                            <Badge bg="warning" className="me-1">Pending</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="success" onClick={() => handleApproveVendor(vendor.id)}>
                          <FaCheck /> Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card.Body className="text-center text-muted py-4">
                    <FaCheckCircle size={30} className="mb-2 text-success" />
                    <p className="mb-0">No pending vendors</p>
                  </Card.Body>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0"><FaBox className="me-2 text-warning" /> Pending Products ({stats.pendingProducts})</h6>
                <Link to="/admin/products?filter=pending" className="text-decoration-none small">View All</Link>
              </Card.Header>
              <Card.Body className="p-0">
                {pendingProducts.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {pendingProducts.map(product => (
                      <div key={product.id} className="list-group-item border-0 d-flex justify-content-between align-items-center py-3">
                        <div className="flex-grow-1">
                          <div className="fw-medium">{product.name}</div>
                          <small className="text-muted">by {product.vendor_name}</small>
                          <div className="mt-1">
                            <Badge bg="warning">Pending</Badge>
                            <small className="text-muted ms-2">₦{product.price?.toLocaleString()}</small>
                          </div>
                        </div>
                        <Button size="sm" variant="success" onClick={() => handleApproveProduct(product.id)}>
                          <FaCheck /> Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card.Body className="text-center text-muted py-4">
                    <FaCheckCircle size={30} className="mb-2 text-success" />
                    <p className="mb-0">No pending products</p>
                  </Card.Body>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0"><FaStar className="me-2 text-warning" /> Pending Reviews ({stats.pendingReviews})</h6>
                <Link to="/admin/reviews?filter=pending" className="text-decoration-none small">View All</Link>
              </Card.Header>
              <Card.Body className="p-0">
                {pendingReviews.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {pendingReviews.map(review => (
                      <div key={review.id} className="list-group-item border-0 d-flex justify-content-between align-items-center py-3">
                        <div className="flex-grow-1">
                          <div className="fw-medium">{review.user_name}</div>
                          <small className="text-muted">on {review.product_name}</small>
                          <div className="mt-1">
                            <div className="d-flex text-warning">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} size={12} className={i < review.rating ? 'text-warning' : 'text-secondary'} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="success" onClick={() => handleApproveReview(review.id)} title="Approve">
                            <FaCheck />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleRejectReview(review.id)} title="Reject">
                            <FaTimes />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteReview(review.id)} title="Delete">
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card.Body className="text-center text-muted py-4">
                    <FaCheckCircle size={30} className="mb-2 text-success" />
                    <p className="mb-0">No pending reviews</p>
                  </Card.Body>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row className="g-4">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Recent Users</h6>
                <Link to="/admin/users" className="text-decoration-none small">View All</Link>
              </Card.Header>
              <Card.Body className="p-0">
                {recentUsers.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map(user => (
                          <tr key={user.id}>
                            <td className="fw-medium">{user.full_name}</td>
                            <td>{user.email}</td>
                            <td>
                              <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'vendor' ? 'success' : 'info'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td>
                              {user.verified ? (
                                <Badge bg="success">Verified</Badge>
                              ) : (
                                <Badge bg="warning">Pending</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">No users found</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Recent Reviews</h6>
                <Link to="/admin/reviews" className="text-decoration-none small">View All</Link>
              </Card.Header>
              <Card.Body className="p-0">
                {recentReviews.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>User</th>
                          <th>Product</th>
                          <th>Rating</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReviews.map(review => (
                          <tr key={review.id}>
                            <td>{review.user_name}</td>
                            <td>{review.product_name}</td>
                            <td>
                              <div className="d-flex">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar 
                                    key={i} 
                                    className={i < review.rating ? 'text-warning' : 'text-secondary'} 
                                    size={12}
                                  />
                                ))}
                              </div>
                            </td>
                            <td>
                              <Badge bg={review.status === 'pending' ? 'warning' : 'success'}>
                                {review.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">No reviews found</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Audit Log Link */}
        <Row className="mt-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm bg-light">
              <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <FaHistory className="text-primary" size={24} />
                  </div>
                  <div>
                    <h6 className="mb-1">System Audit Log</h6>
                    <p className="text-muted mb-0 small">Track all platform activities and changes</p>
                  </div>
                </div>
                <Link to="/admin/audit-log">
                  <Button variant="primary" className="d-flex align-items-center gap-2">
                    <FaHistory /> View Audit Log
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .admin-dashboard { padding: 0; }
        .welcome-banner { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 24px 28px; color: white; }
        .welcome-banner h2 { color: white; }
        .welcome-banner .text-muted { color: rgba(255,255,255,0.8) !important; }
        .quick-action-card, .stat-card { transition: all 0.3s ease; cursor: pointer; }
        .quick-action-card:hover, .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important; }
        .list-group-item { transition: all 0.2s ease; }
        .list-group-item:hover { background: #f8f9fa; }
        .table tbody tr:hover { background: #f8f9fa; }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminDashboard;
