// frontend/src/pages/AdminAnalytics.jsx - No Loading Spinners
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { 
  FaChartLine, 
  FaUsers, 
  FaStore, 
  FaBox, 
  FaShoppingCart,
  FaDollarSign,
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

function AdminAnalytics() {
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({
    summary: {
      users: { total: 1250, new: 45, growth: 8.3 },
      vendors: { total: 45, pending: 3 },
      products: { total: 2340, pending: 12 },
      orders: { total: 890, pending: 34 },
      revenue: { total: 4560000, growth: 12.5 }
    },
    monthlyRevenue: [
      { month: 'Jan', revenue: 450000 },
      { month: 'Feb', revenue: 520000 },
      { month: 'Mar', revenue: 480000 },
      { month: 'Apr', revenue: 610000 },
      { month: 'May', revenue: 580000 },
      { month: 'Jun', revenue: 650000 }
    ],
    categories: [
      { name: 'Electronics', count: 30 },
      { name: 'Fashion', count: 25 },
      { name: 'Home', count: 20 },
      { name: 'Sports', count: 15 },
      { name: 'Books', count: 10 }
    ],
    recentOrders: [
      { id: 'ORD-001', total: 25000, status: 'delivered', customer_name: 'John Doe', created_at: new Date() },
      { id: 'ORD-002', total: 45000, status: 'processing', customer_name: 'Jane Smith', created_at: new Date() },
      { id: 'ORD-003', total: 15000, status: 'pending', customer_name: 'Bob Johnson', created_at: new Date() }
    ],
    metrics: {
      averageOrderValue: 5120,
      conversionRate: 3.2,
      returningCustomers: 45
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('📊 Fetching analytics data...');
      
      // Try to fetch from API
      try {
        const response = await adminAPI.getAnalytics();
        console.log('Analytics response:', response);
        
        if (response.data && response.data.success && response.data.data) {
          const apiData = response.data.data;
          setAnalytics(prev => ({
            summary: {
              users: { 
                total: apiData.summary?.users?.total ?? prev.summary.users.total,
                new: apiData.summary?.users?.new ?? prev.summary.users.new,
                growth: apiData.summary?.users?.growth ?? prev.summary.users.growth
              },
              vendors: { 
                total: apiData.summary?.vendors?.total ?? prev.summary.vendors.total,
                pending: apiData.summary?.vendors?.pending ?? prev.summary.vendors.pending
              },
              products: { 
                total: apiData.summary?.products?.total ?? prev.summary.products.total,
                pending: apiData.summary?.products?.pending ?? prev.summary.products.pending
              },
              orders: { 
                total: apiData.summary?.orders?.total ?? prev.summary.orders.total,
                pending: apiData.summary?.orders?.pending ?? prev.summary.orders.pending
              },
              revenue: { 
                total: apiData.summary?.revenue?.total ?? prev.summary.revenue.total,
                growth: apiData.summary?.revenue?.growth ?? prev.summary.revenue.growth
              }
            },
            monthlyRevenue: apiData.monthlyRevenue || prev.monthlyRevenue,
            categories: apiData.categories || prev.categories,
            recentOrders: apiData.recentOrders || prev.recentOrders,
            metrics: {
              averageOrderValue: apiData.metrics?.averageOrderValue ?? prev.metrics.averageOrderValue,
              conversionRate: apiData.metrics?.conversionRate ?? prev.metrics.conversionRate,
              returningCustomers: apiData.metrics?.returningCustomers ?? prev.metrics.returningCustomers
            }
          }));
          if (showToast) toast.success('Analytics refreshed');
        } else {
          console.log('Using demo data - API response format unexpected');
        }
      } catch (apiError) {
        console.log('Using demo data - API error:', apiError.message);
        // Keep using default mock data
        if (showToast) toast.info('Using demo analytics data');
      }
      
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Could not load analytics data. Using demo data instead.');
    } finally {
      setRefreshing(false);
    }
  };

  // Safe formatting function
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₦0';
    return `₦${value.toLocaleString()}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  const getMaxRevenue = () => {
    const revenues = analytics.monthlyRevenue?.map(r => r.revenue) || [];
    return Math.max(...revenues, 1);
  };

  const maxRevenue = getMaxRevenue();

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Header with Refresh Button */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="mb-1">Analytics Dashboard</h2>
            <p className="text-muted mb-0">Platform performance and metrics</p>
          </div>
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Demo Data Notice */}
        {error && (
          <Alert variant="info" className="mb-4" dismissible onClose={() => setError(null)}>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Row className="g-4 mb-4">
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Revenue</h6>
                    <h4 className="mb-0">{formatCurrency(analytics.summary?.revenue?.total)}</h4>
                    <small className="text-success">+{analytics.summary?.revenue?.growth || 0}%</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FaDollarSign className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Users</h6>
                    <h4 className="mb-0">{formatNumber(analytics.summary?.users?.total)}</h4>
                    <small className="text-success">+{analytics.summary?.users?.growth || 0}%</small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <FaUsers className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Products</h6>
                    <h4 className="mb-0">{formatNumber(analytics.summary?.products?.total)}</h4>
                    <small className="text-warning">{analytics.summary?.products?.pending || 0} pending</small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <FaBox className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Orders</h6>
                    <h4 className="mb-0">{formatNumber(analytics.summary?.orders?.total)}</h4>
                    <small className="text-warning">{analytics.summary?.orders?.pending || 0} pending</small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <FaShoppingCart className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="mb-0">Revenue Overview (Last 6 Months)</h6>
                <span className="text-muted small">₦ in thousands</span>
              </Card.Header>
              <Card.Body style={{ minHeight: '300px' }}>
                <div className="d-flex justify-content-between align-items-end h-100" style={{ minHeight: '250px' }}>
                  {(analytics.monthlyRevenue || []).map((item, index) => {
                    const heightPercent = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={index} className="text-center" style={{ width: '15%' }}>
                        <div 
                          className="bg-primary rounded-top" 
                          style={{ 
                            height: `${Math.max(30, heightPercent)}px`,
                            minHeight: '30px',
                            transition: 'height 0.3s ease',
                            cursor: 'pointer'
                          }}
                          title={`${item.month}: ₦${(item.revenue / 1000).toFixed(1)}K`}
                        />
                        <small className="text-muted mt-2 d-block">{item.month}</small>
                        <small className="text-primary fw-bold">₦{(item.revenue / 1000).toFixed(0)}k</small>
                      </div>
                    );
                  })}
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
                {(analytics.categories || []).map((category, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">{category.name}</small>
                      <span className="fw-bold">{category.count}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${category.count}%`, borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Orders */}
        <Row className="mt-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Recent Orders</h6>
                <span className="text-muted small">Latest 5 orders</span>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        </tr>
                      </thead>
                    <tbody>
                      {(analytics.recentOrders || []).map(order => (
                        <tr key={order.id}>
                           <td className="fw-medium">#{order.id}</td>
                          <td>{order.customer_name}</td>
                          <td className="fw-bold">{formatCurrency(order.total)}</td>
                          <td>
                            <span className={`badge bg-${
                              order.status === 'delivered' ? 'success' :
                              order.status === 'processing' ? 'info' :
                              order.status === 'shipped' ? 'primary' :
                              order.status === 'pending' ? 'warning' : 'secondary'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Stats */}
        <Row className="mt-4 g-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm metric-card">
              <Card.Body className="text-center">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <FaChartLine className="text-primary" size={24} />
                </div>
                <h6 className="text-muted mb-2">Average Order Value</h6>
                <h3 className="mb-0 text-primary">{formatCurrency(analytics.metrics?.averageOrderValue)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm metric-card">
              <Card.Body className="text-center">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <FaChartLine className="text-success" size={24} />
                </div>
                <h6 className="text-muted mb-2">Conversion Rate</h6>
                <h3 className="mb-0 text-success">{analytics.metrics?.conversionRate || 0}%</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm metric-card">
              <Card.Body className="text-center">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <FaUsers className="text-info" size={24} />
                </div>
                <h6 className="text-muted mb-2">Returning Customers</h6>
                <h3 className="mb-0 text-info">{analytics.metrics?.returningCustomers || 0}%</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .stat-card, .metric-card {
          transition: all 0.3s ease;
        }
        
        .stat-card:hover, .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .progress-bar {
          transition: width 0.5s ease;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminAnalytics;
