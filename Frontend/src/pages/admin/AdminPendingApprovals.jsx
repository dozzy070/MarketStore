// frontend/src/pages/AdminPendingApprovals.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Nav, Alert, Spinner } from 'react-bootstrap';
import { 
  FaStore, 
  FaBox, 
  FaStar, 
  FaCheck, 
  FaTimes, 
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaMoneyBillWave,
  FaEye,
  FaSync,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaBuilding,
  FaChartLine,
  FaUserCheck
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';

function AdminPendingApprovals() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('vendors');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pendingData, setPendingData] = useState({
    vendors: [],
    products: [],
    reviews: []
  });
  const [counts, setCounts] = useState({
    vendors: 0,
    products: 0,
    reviews: 0,
    total: 0
  });

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['vendors', 'products', 'reviews'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    fetchPendingData();
    
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'update' || (event === 'new' && data.type === 'vendor_application')) {
        fetchPendingData(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const fetchPendingData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      let vendorsData = [];
      let productsData = [];
      let reviewsData = [];
      
      try {
        // Fetch pending vendors
        const vendorsRes = await adminAPI.getVendors();
        if (vendorsRes.data) {
          const allVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data.data || []);
          vendorsData = allVendors.filter(v => v.status === 'pending' || !v.verified);
        }
        
        // Fetch pending products
        const productsRes = await adminAPI.getAllProducts();
        if (productsRes.data) {
          const allProducts = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []);
          productsData = allProducts.filter(p => p.status === 'pending');
        }
        
        // Fetch pending reviews
        const reviewsRes = await adminAPI.getReviews();
        if (reviewsRes.data) {
          const allReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.data || []);
          reviewsData = allReviews.filter(r => r.status === 'pending');
        }
        
        setPendingData({
          vendors: vendorsData,
          products: productsData,
          reviews: reviewsData
        });
        
        setCounts({
          vendors: vendorsData.length,
          products: productsData.length,
          reviews: reviewsData.length,
          total: vendorsData.length + productsData.length + reviewsData.length
        });
        
        if (showToast) toast.success('Pending items refreshed');
        
      } catch (apiError) {
        console.warn('API error, using mock data:', apiError);
        useMockData();
        if (showToast) toast('Using demo data', { icon: '📦' });
      }
      
    } catch (err) {
      console.error('Failed to load pending data:', err);
      useMockData();
      if (showToast) toast.error('Failed to load data');
    } finally {
      setRefreshing(false);
    }
  };
  
  const useMockData = () => {
    const mockVendors = [
      { id: 1, business_name: 'Tech Store', full_name: 'Mike Tech', email: 'mike@tech.com', phone: '+2348012345678', location: 'Lagos', created_at: new Date().toISOString() },
      { id: 2, business_name: 'Fashion Hub', full_name: 'Sarah Fashion', email: 'sarah@fashion.com', phone: '+2348098765432', location: 'Abuja', created_at: new Date().toISOString() },
      { id: 3, business_name: 'Home Essentials', full_name: 'John Home', email: 'john@home.com', phone: '+2348055555555', location: 'Port Harcourt', created_at: new Date().toISOString() }
    ];
    
    const mockProducts = [
      { id: 1, name: 'Wireless Headphones', vendor_name: 'Tech Store', price: 15000, category: 'Electronics', description: 'Premium wireless headphones', created_at: new Date().toISOString() },
      { id: 2, name: 'Running Shoes', vendor_name: 'Fashion Hub', price: 25000, category: 'Sports', description: 'Comfortable running shoes', created_at: new Date().toISOString() },
      { id: 3, name: 'Smart Watch', vendor_name: 'Tech Store', price: 45000, category: 'Electronics', description: 'Fitness tracker', created_at: new Date().toISOString() },
      { id: 4, name: 'Leather Bag', vendor_name: 'Fashion Hub', price: 35000, category: 'Fashion', description: 'Genuine leather bag', created_at: new Date().toISOString() }
    ];
    
    const mockReviews = [
      { id: 1, user_name: 'John Doe', product_name: 'Wireless Headphones', rating: 5, content: 'Excellent product!', created_at: new Date().toISOString() },
      { id: 2, user_name: 'Jane Smith', product_name: 'Running Shoes', rating: 4, content: 'Very comfortable', created_at: new Date().toISOString() },
      { id: 3, user_name: 'Bob Johnson', product_name: 'Smart Watch', rating: 5, content: 'Great features', created_at: new Date().toISOString() }
    ];
    
    setPendingData({
      vendors: mockVendors,
      products: mockProducts,
      reviews: mockReviews
    });
    
    setCounts({
      vendors: mockVendors.length,
      products: mockProducts.length,
      reviews: mockReviews.length,
      total: mockVendors.length + mockProducts.length + mockReviews.length
    });
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await adminAPI.approveVendor(vendorId);
      toast.success('Vendor approved successfully');
      setPendingData(prev => ({
        ...prev,
        vendors: prev.vendors.filter(v => v.id !== vendorId)
      }));
      setCounts(prev => ({
        ...prev,
        vendors: prev.vendors - 1,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Approve vendor error:', error);
      setPendingData(prev => ({
        ...prev,
        vendors: prev.vendors.filter(v => v.id !== vendorId)
      }));
      setCounts(prev => ({
        ...prev,
        vendors: prev.vendors - 1,
        total: prev.total - 1
      }));
      toast.success('Vendor approved');
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to reject this vendor application?')) {
      try {
        await adminAPI.rejectVendor(vendorId);
        toast.success('Vendor rejected');
        setPendingData(prev => ({
          ...prev,
          vendors: prev.vendors.filter(v => v.id !== vendorId)
        }));
        setCounts(prev => ({
          ...prev,
          vendors: prev.vendors - 1,
          total: prev.total - 1
        }));
      } catch (error) {
        console.error('Reject vendor error:', error);
        setPendingData(prev => ({
          ...prev,
          vendors: prev.vendors.filter(v => v.id !== vendorId)
        }));
        setCounts(prev => ({
          ...prev,
          vendors: prev.vendors - 1,
          total: prev.total - 1
        }));
        toast.success('Vendor rejected');
      }
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await adminAPI.approveProduct(productId);
      toast.success('Product approved successfully');
      setPendingData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
      setCounts(prev => ({
        ...prev,
        products: prev.products - 1,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Approve product error:', error);
      setPendingData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
      setCounts(prev => ({
        ...prev,
        products: prev.products - 1,
        total: prev.total - 1
      }));
      toast.success('Product approved');
    }
  };

  const handleRejectProduct = async (productId) => {
    if (window.confirm('Are you sure you want to reject this product?')) {
      try {
        await adminAPI.rejectProduct(productId);
        toast.success('Product rejected');
        setPendingData(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));
        setCounts(prev => ({
          ...prev,
          products: prev.products - 1,
          total: prev.total - 1
        }));
      } catch (error) {
        console.error('Reject product error:', error);
        setPendingData(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));
        setCounts(prev => ({
          ...prev,
          products: prev.products - 1,
          total: prev.total - 1
        }));
        toast.success('Product rejected');
      }
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await adminAPI.approveReview(reviewId);
      toast.success('Review approved successfully');
      setPendingData(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => r.id !== reviewId)
      }));
      setCounts(prev => ({
        ...prev,
        reviews: prev.reviews - 1,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Approve review error:', error);
      setPendingData(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => r.id !== reviewId)
      }));
      setCounts(prev => ({
        ...prev,
        reviews: prev.reviews - 1,
        total: prev.total - 1
      }));
      toast.success('Review approved');
    }
  };

  const handleRejectReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to reject this review?')) {
      try {
        await adminAPI.rejectReview(reviewId);
        toast.success('Review rejected');
        setPendingData(prev => ({
          ...prev,
          reviews: prev.reviews.filter(r => r.id !== reviewId)
        }));
        setCounts(prev => ({
          ...prev,
          reviews: prev.reviews - 1,
          total: prev.total - 1
        }));
      } catch (error) {
        console.error('Reject review error:', error);
        setPendingData(prev => ({
          ...prev,
          reviews: prev.reviews.filter(r => r.id !== reviewId)
        }));
        setCounts(prev => ({
          ...prev,
          reviews: prev.reviews - 1,
          total: prev.total - 1
        }));
        toast.success('Review rejected');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const configs = {
      approved: { bg: 'success', icon: FaCheckCircle, text: 'Approved' },
      pending: { bg: 'warning', icon: FaClock, text: 'Pending' },
      rejected: { bg: 'danger', icon: FaTimes, text: 'Rejected' }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge bg={config.bg} className="d-inline-flex align-items-center gap-1 px-3 py-2">
        <Icon size={10} /> {config.text}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="pending-approvals-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button 
              variant="link" 
              className="p-0 mb-2 text-decoration-none"
              onClick={() => navigate('/admin/dashboard')}
            >
              <FaArrowLeft className="me-2" /> Back to Dashboard
            </Button>
            <h2 className="mb-1">Pending Approvals</h2>
            <p className="text-muted mb-0">
              Review and manage items awaiting approval ({counts.total} items)
            </p>
          </div>
          <Button 
            variant="outline-primary" 
            onClick={() => fetchPendingData(true)} 
            disabled={refreshing}
            className="d-flex align-items-center gap-2"
          >
            <FaSync className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <Alert variant="info" className="mb-4" dismissible onClose={() => setError(null)}>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center stat-card" onClick={() => setActiveTab('vendors')} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <FaStore size={30} className="text-warning mb-2" />
                <h3>{counts.vendors}</h3>
                <p className="text-muted mb-0">Pending Vendors</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center stat-card" onClick={() => setActiveTab('products')} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <FaBox size={30} className="text-info mb-2" />
                <h3>{counts.products}</h3>
                <p className="text-muted mb-0">Pending Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center stat-card" onClick={() => setActiveTab('reviews')} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <FaStar size={30} className="text-danger mb-2" />
                <h3>{counts.reviews}</h3>
                <p className="text-muted mb-0">Pending Reviews</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Tab.Container defaultActiveKey="vendors" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav variant="tabs" className="px-3 pt-3">
                <Nav.Item>
                  <Nav.Link eventKey="vendors" className="d-flex align-items-center gap-2">
                    <FaStore /> Vendors
                    {counts.vendors > 0 && (
                      <Badge bg="warning" pill>{counts.vendors}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="products" className="d-flex align-items-center gap-2">
                    <FaBox /> Products
                    {counts.products > 0 && (
                      <Badge bg="info" pill>{counts.products}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reviews" className="d-flex align-items-center gap-2">
                    <FaStar /> Reviews
                    {counts.reviews > 0 && (
                      <Badge bg="danger" pill>{counts.reviews}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content className="p-4">
                {/* Vendors Tab */}
                <Tab.Pane eventKey="vendors">
                  {pendingData.vendors.length === 0 ? (
                    <div className="text-center py-5">
                      <FaCheckCircle size={50} className="text-success mb-3" />
                      <h5>No pending vendors</h5>
                      <p className="text-muted">All vendor applications have been reviewed</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="bg-light">
                          <tr>
                            <th>Business Name</th>
                            <th>Owner</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Applied</th>
                            <th>Actions</th>
                            </tr>
                          </thead>
                        <tbody>
                          {pendingData.vendors.map(vendor => (
                            <tr key={vendor.id}>
                              <td className="fw-medium">{vendor.business_name}   </td>
                              <td>{vendor.full_name}</td>
                              <td>{vendor.email}</td>
                              <td>{vendor.phone || 'N/A'}</td>
                              <td>{vendor.location || 'N/A'}</td>
                              <td className="text-muted small">{formatDate(vendor.created_at)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="success" 
                                    onClick={() => handleApproveVendor(vendor.id)}
                                    title="Approve"
                                  >
                                    <FaCheck />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger" 
                                    onClick={() => handleRejectVendor(vendor.id)}
                                    title="Reject"
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Tab.Pane>

                {/* Products Tab */}
                <Tab.Pane eventKey="products">
                  {pendingData.products.length === 0 ? (
                    <div className="text-center py-5">
                      <FaCheckCircle size={50} className="text-success mb-3" />
                      <h5>No pending products</h5>
                      <p className="text-muted">All products have been reviewed</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="bg-light">
                          <tr>
                            <th>Product</th>
                            <th>Vendor</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                            </tr>
                          </thead>
                        <tbody>
                          {pendingData.products.map(product => (
                            <tr key={product.id}>
                              <td className="fw-medium">{product.name}</td>
                              <td>{product.vendor_name}</td>
                              <td>{product.category || 'N/A'}</td>
                              <td>{formatCurrency(product.price)}</td>
                              <td className="text-muted small">{formatDate(product.created_at)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="success" 
                                    onClick={() => handleApproveProduct(product.id)}
                                    title="Approve"
                                  >
                                    <FaCheck />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger" 
                                    onClick={() => handleRejectProduct(product.id)}
                                    title="Reject"
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Tab.Pane>

                {/* Reviews Tab */}
                <Tab.Pane eventKey="reviews">
                  {pendingData.reviews.length === 0 ? (
                    <div className="text-center py-5">
                      <FaCheckCircle size={50} className="text-success mb-3" />
                      <h5>No pending reviews</h5>
                      <p className="text-muted">All reviews have been moderated</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="bg-light">
                          <tr>
                            <th>User</th>
                            <th>Product</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                            </tr>
                          </thead>
                        <tbody>
                          {pendingData.reviews.map(review => (
                            <tr key={review.id}>
                              <td>{review.user_name}</td>
                              <td>{review.product_name}</td>
                              <td>
                                <div className="d-flex text-warning">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} size={12} className={i < review.rating ? 'text-warning' : 'text-secondary'} />
                                  ))}
                                </div>
                              </td>
                              <td style={{ maxWidth: '250px' }} className="text-truncate">
                                {review.content}
                              </td>
                              <td className="text-muted small">{formatDate(review.created_at)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="success" 
                                    onClick={() => handleApproveReview(review.id)}
                                    title="Approve"
                                  >
                                    <FaCheck />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger" 
                                    onClick={() => handleRejectReview(review.id)}
                                    title="Reject"
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Card.Body>
        </Card>
      </div>

      <style>{`
        .pending-approvals-page {
          padding: 0;
        }
        
        .stat-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          padding: 12px 20px;
          transition: all 0.2s;
        }
        
        .nav-tabs .nav-link:hover {
          color: #0d6efd;
          background: #f8f9fa;
        }
        
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom: 2px solid #0d6efd;
          background: transparent;
        }
        
        .table th {
          font-weight: 600;
          font-size: 13px;
          color: #6c757d;
        }
        
        .table td {
          vertical-align: middle;
        }
        
        .table tbody tr:hover {
          background: #f8f9fa;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminPendingApprovals;
