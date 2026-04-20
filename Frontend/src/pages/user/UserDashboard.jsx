// frontend/src/pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Alert, Dropdown } from 'react-bootstrap';
import {
  FaUser,
  FaShoppingBag,
  FaHeart,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaArrowRight,
  FaCalendarAlt,
  FaWallet,
  FaEye,
  FaCreditCard,
  FaShippingFast,
  FaBoxOpen,
  FaPercent,
  FaGift,
  FaArrowUp,
  FaDownload,
  FaShareAlt,
  FaEllipsisV,
  FaGem
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { userAPI, orderAPI, paymentAPI, productAPI } from '../../services/api'; // added productAPI
import PaymentModal from '../../components/PaymentModal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);         // initial loading state
  const [refreshing, setRefreshing] = useState(false);  // manual refresh indicator
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [userData, setUserData] = useState({
    profile: null,
    recentOrders: [],
    payments: [],
    stats: {
      totalOrders: 0,
      wishlistCount: 0,
      reviewsCount: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      returningRate: 0
    },
    recommendations: []      // will be filled from real product data
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async (showToast = false) => {
    if (showToast) {
      setRefreshing(true);
    } else {
      setLoading(true); // only show loading on first fetch
    }
    setError(null);

    try {
      console.log('📊 Fetching user dashboard data...');

      // Fetch all required data in parallel
      const [
        profileRes,
        ordersRes,
        paymentsRes,
        balanceRes,
        wishlistRes,
        reviewsRes,
        productsRes
      ] = await Promise.allSettled([
        userAPI.getProfile(),
        orderAPI.getOrders(),
        paymentAPI.getPaymentHistory(),
        paymentAPI.getBalance(),
        userAPI.getWishlist(),
        userAPI.getReviews(),        // assumes you have a getReviews endpoint
        productAPI.getProducts()
      ]);

      // --- Process profile ---
      let profileData = null;
      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        profileData = profileRes.value.data.data || profileRes.value.data.user || profileRes.value.data;
      }

      // --- Process orders ---
      let ordersData = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        ordersData = ordersRes.value.data.orders ||
          ordersRes.value.data.data ||
          (Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
      }

      // --- Process payments ---
      let paymentsData = [];
      let balanceData = 0;
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
        paymentsData = paymentsRes.value.data.payments || [];
      }
      if (balanceRes.status === 'fulfilled' && balanceRes.value?.data) {
        balanceData = balanceRes.value.data.balance || 0;
      }

      // --- Process wishlist count ---
      let wishlistCount = 0;
      if (wishlistRes.status === 'fulfilled' && wishlistRes.value?.data) {
        const wishlistData = wishlistRes.value.data;
        if (Array.isArray(wishlistData)) wishlistCount = wishlistData.length;
        else if (wishlistData.data && Array.isArray(wishlistData.data)) wishlistCount = wishlistData.data.length;
        else if (wishlistData.wishlist && Array.isArray(wishlistData.wishlist)) wishlistCount = wishlistData.wishlist.length;
      }

      // --- Process reviews count ---
      let reviewsCount = 0;
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
        const reviewsData = reviewsRes.value.data;
        if (Array.isArray(reviewsData)) reviewsCount = reviewsData.length;
        else if (reviewsData.data && Array.isArray(reviewsData.data)) reviewsCount = reviewsData.data.length;
        else if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) reviewsCount = reviewsData.reviews.length;
      }

      // --- Process products for recommendations ---
      let productsData = [];
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        let items = [];
        if (Array.isArray(productsRes.value.data)) {
          items = productsRes.value.data;
        } else if (productsRes.value.data.data && Array.isArray(productsRes.value.data.data)) {
          items = productsRes.value.data.data;
        } else if (productsRes.value.data.products && Array.isArray(productsRes.value.data.products)) {
          items = productsRes.value.data.products;
        }
        // Take first 4 products that have image and price
        productsData = items
          .filter(p => p.name && p.price)
          .slice(0, 4)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price) || 0,
            image: p.image_url || p.image || 'https://via.placeholder.com/200'
          }));
      }

      // --- Calculate order statistics ---
      const deliveredOrders = ordersData.filter(o => o?.status === 'delivered');
      const totalSpent = deliveredOrders.reduce((sum, o) => sum + (parseFloat(o?.total) || 0), 0);
      const averageOrderValue = deliveredOrders.length ? totalSpent / deliveredOrders.length : 0;
      const returningRate = ordersData.length > 0 ? 75 : 0; // placeholder – you can compute real rate

      // --- Build final userData object ---
      setUserData({
        profile: profileData || {
          full_name: user?.full_name || 'Valued Customer',
          email: user?.email || 'customer@marketstore.com',
          verified: user?.verified || false,
          joinDate: user?.created_at || new Date().toISOString()
        },
        recentOrders: ordersData.slice(0, 5),
        payments: paymentsData.slice(0, 5),
        stats: {
          totalOrders: ordersData.length,
          wishlistCount,
          reviewsCount,
          totalSpent,
          averageOrderValue,
          returningRate
        },
        recommendations: productsData
      });

      if (showToast) toast.success('Dashboard updated');

    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Unable to load complete data. Please try again later.');
    } finally {
      if (showToast) setRefreshing(false);
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    toast.success('Payment successful!');
    fetchUserData(); // refresh data
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: FaClock, text: 'Pending', bgColor: '#fef3c7', textColor: '#d97706' },
      processing: { icon: FaSync, text: 'Processing', bgColor: '#e0f2fe', textColor: '#0284c7' },
      shipped: { icon: FaShippingFast, text: 'Shipped', bgColor: '#dbeafe', textColor: '#2563eb' },
      delivered: { icon: FaCheckCircle, text: 'Delivered', bgColor: '#d1fae5', textColor: '#059669' },
      cancelled: { icon: FaExclamationTriangle, text: 'Cancelled', bgColor: '#fee2e2', textColor: '#dc2626' }
    };
    return configs[status] || configs.pending;
  };

  const quickPaymentAmounts = [1000, 5000, 10000, 25000, 50000];

  const statCards = [
    {
      icon: FaShoppingBag,
      label: 'Total Orders',
      value: userData.stats.totalOrders,
      trend: '+12%',
      trendUp: true,
      link: '/user/orders',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: FaWallet,
      label: 'Total Spent',
      value: formatCurrency(userData.stats.totalSpent),
      trend: '+8%',
      trendUp: true,
      link: '/user/payments',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
    },
    {
      icon: FaHeart,
      label: 'Wishlist',
      value: userData.stats.wishlistCount,
      trend: '+3',
      trendUp: true,
      link: '/user/wishlist',
      gradient: 'linear-gradient(135deg, #ec489a 0%, #f43f5e 100%)'
    },
    {
      icon: FaStar,
      label: 'Reviews',
      value: userData.stats.reviewsCount,
      trend: '+2',
      trendUp: true,
      link: '/user/reviews',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    }
  ];

  // --- Loading indicator (only on initial load, no spinner if you prefer) ---
  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <h5>Loading dashboard...</h5>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeContent}>
            <div style={styles.welcomeText}>
              <h1 style={styles.welcomeTitle}>
                Welcome back, {userData.profile?.full_name?.split(' ')[0] || 'Valued Customer'}
                <span style={styles.waveEmoji}>👋</span>
              </h1>
              <p style={styles.welcomeSubtitle}>
                Track your orders, manage your account, and discover amazing deals
              </p>
              {userData.profile?.verified && (
                <Badge style={styles.verifiedBadge}>
                  <FaCheckCircle /> Verified Account
                </Badge>
              )}
            </div>
            <div style={styles.welcomeActions}>
              <Button
                style={styles.refreshBtn}
                variant="outline"
                onClick={() => fetchUserData(true)}
                disabled={refreshing}
              >
                <FaSync className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="light" style={styles.errorAlert}>
            <FaExclamationTriangle style={styles.alertIcon} />
            <span>{error}</span>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                style={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link to={stat.link} style={styles.statLink}>
                  <div style={{ ...styles.statIcon, background: stat.gradient }}>
                    <Icon />
                  </div>
                  <div style={styles.statInfo}>
                    <span style={styles.statLabel}>{stat.label}</span>
                    <span style={styles.statValue}>{stat.value}</span>
                    {stat.trend && (
                      <span style={{ ...styles.statTrend, color: stat.trendUp ? '#10b981' : '#ef4444' }}>
                        {stat.trendUp ? <FaArrowUp /> : <FaArrowUp style={{ transform: 'rotate(180deg)' }} />}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Payment Section */}
        <div style={styles.quickPaymentSection}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-1">Quick Payment</h6>
                  <p className="text-muted small mb-0">Make a payment in seconds</p>
                </div>
                <FaCreditCard className="text-primary" size={24} />
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {quickPaymentAmounts.map(amount => (
                  <Button
                    key={amount}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedAmount(amount);
                      setShowPaymentModal(true);
                    }}
                  >
                    ₦{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Button
                variant="primary"
                className="w-100"
                onClick={() => {
                  setSelectedAmount(0);
                  setShowPaymentModal(true);
                }}
              >
                <FaCreditCard className="me-2" /> Custom Amount
              </Button>
            </Card.Body>
          </Card>
        </div>

        {/* Quick Metrics */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>
              <FaCreditCard />
            </div>
            <div style={styles.metricContent}>
              <span style={styles.metricLabel}>Average Order</span>
              <span style={styles.metricValue}>{formatCurrency(userData.stats.averageOrderValue)}</span>
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>
              <FaPercent />
            </div>
            <div style={styles.metricContent}>
              <span style={styles.metricLabel}>Returning Rate</span>
              <span style={styles.metricValue}>{userData.stats.returningRate}%</span>
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>
              <FaGift />
            </div>
            <div style={styles.metricContent}>
              <span style={styles.metricLabel}>Member Since</span>
              <span style={styles.metricValue}>
                {userData.profile?.joinDate
                  ? new Date(userData.profile.joinDate).getFullYear()
                  : '2024'}
              </span>
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>
              <FaGem />
            </div>
            <div style={styles.metricContent}>
              <span style={styles.metricLabel}>Loyalty Points</span>
              <span style={styles.metricValue}>2,450</span> {/* This could also be fetched if you have a points system */}
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div style={styles.recentOrdersSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Orders</h2>
              <p style={styles.sectionSubtitle}>Track and manage your recent purchases</p>
            </div>
            <Link to="/user/orders" style={styles.viewAllLink}>
              View All Orders <FaArrowRight />
            </Link>
          </div>

          {userData.recentOrders.length > 0 ? (
            <div style={styles.ordersTableContainer}>
              <table style={styles.ordersTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Order ID</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Items</th>
                    <th style={styles.tableHeader}>Total</th>
                    <th style={styles.tableHeader}>Status</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {userData.recentOrders.map((order, index) => {
                      const StatusIcon = getStatusConfig(order.status).icon;
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          style={styles.orderRow}
                        >
                          <td style={styles.orderId}>
                            #{order.id?.toString().slice(0, 12) || 'N/A'}
                          </td>
                          <td style={styles.orderDate}>
                            <FaCalendarAlt style={{ marginRight: '8px' }} />
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <Badge style={styles.itemsBadge}>
                              {order.items?.length || 0} items
                            </Badge>
                          </td>
                          <td style={styles.orderTotal}>
                            {formatCurrency(parseFloat(order.total) || 0)}
                          </td>
                          <td>
                            <span
                              style={{
                                ...styles.statusBadge,
                                background: statusConfig.bgColor,
                                color: statusConfig.textColor
                              }}
                            >
                              <StatusIcon style={{ marginRight: '6px' }} />
                              {statusConfig.text}
                            </span>
                          </td>
                          <td>
                            <Dropdown align="end">
                              <Dropdown.Toggle variant="link" style={styles.actionDropdown}>
                                <FaEllipsisV />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => navigate(`/user/orders/${order.id}`)}>
                                  <FaEye /> View Details
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <FaDownload /> Download Invoice
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <FaShareAlt /> Track Order
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <FaBoxOpen style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>No orders yet</h3>
              <p style={styles.emptyText}>Start shopping to see your orders here</p>
              <Button style={styles.shopNowBtn} as={Link} to="/">
                Start Shopping <FaArrowRight />
              </Button>
            </div>
          )}
        </div>

        {/* Payment History Section */}
        <div style={styles.recentOrdersSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Payments</h2>
              <p style={styles.sectionSubtitle}>Track your payment transactions</p>
            </div>
            <Link to="/user/payments" style={styles.viewAllLink}>
              View All Payments <FaArrowRight />
            </Link>
          </div>

          {userData.payments.length > 0 ? (
            <div style={styles.ordersTableContainer}>
              <table style={styles.ordersTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Reference</th>
                    <th style={styles.tableHeader}>Amount</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.payments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={styles.orderRow}
                    >
                      <td style={styles.orderDate}>
                        <FaCalendarAlt style={{ marginRight: '8px' }} />
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.orderId}>
                        <code>{payment.reference?.slice(0, 12)}...</code>
                      </td>
                      <td style={styles.orderTotal}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: payment.status === 'success' ? '#d1fae5' : payment.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: payment.status === 'success' ? '#059669' : payment.status === 'pending' ? '#d97706' : '#dc2626'
                          }}
                        >
                          {payment.status === 'success' ? <FaCheckCircle style={{ marginRight: '6px' }} /> :
                           payment.status === 'pending' ? <FaClock style={{ marginRight: '6px' }} /> :
                           <FaExclamationTriangle style={{ marginRight: '6px' }} />}
                          {payment.status === 'success' ? 'Success' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <FaCreditCard size={40} className="text-muted mb-3" />
              <h3 style={styles.emptyTitle}>No payments yet</h3>
              <p style={styles.emptyText}>Make your first payment to see it here</p>
              <Button style={styles.shopNowBtn} onClick={() => setShowPaymentModal(true)}>
                Make a Payment <FaArrowRight />
              </Button>
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        {userData.recommendations.length > 0 && (
          <div style={styles.recommendationsSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Recommended for You</h2>
                <p style={styles.sectionSubtitle}>Based on popular products</p>
              </div>
            </div>

            <div style={styles.recommendationsGrid}>
              {userData.recommendations.map((product, index) => (
                <motion.div
                  key={product.id}
                  style={styles.recommendationCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <img src={product.image} alt={product.name} style={styles.recommendationImage} />
                  <div style={styles.recommendationContent}>
                    <h4 style={styles.recommendationTitle}>{product.name}</h4>
                    <p style={styles.recommendationPrice}>{formatCurrency(product.price)}</p>
                    <Button
                      style={styles.addToCartBtn}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View Product
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.quickActionsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
          </div>
          <div style={styles.quickActionsGrid}>
            <div style={styles.actionCard} onClick={() => navigate('/user/profile')}>
              <FaUser style={styles.actionIcon} />
              <span>Edit Profile</span>
            </div>
            <div style={styles.actionCard} onClick={() => navigate('/user/wishlist')}>
              <FaHeart style={styles.actionIcon} />
              <span>View Wishlist</span>
            </div>
            <div style={styles.actionCard} onClick={() => navigate('/user/reviews')}>
              <FaStar style={styles.actionIcon} />
              <span>Write Reviews</span>
            </div>
            <div style={styles.actionCard} onClick={() => setShowPaymentModal(true)}>
              <FaCreditCard style={styles.actionIcon} />
              <span>Make Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAmount(0);
        }}
        amount={selectedAmount}
        onSuccess={handlePaymentSuccess}
      />

      <style>{`
        .spin {
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

// Styles object – unchanged, kept as in original
const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  welcomeSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px',
    color: 'white'
  },
  welcomeContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  welcomeText: { flex: 1 },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  waveEmoji: { fontSize: '32px' },
  welcomeSubtitle: {
    fontSize: '14px',
    opacity: '0.9',
    marginBottom: '12px'
  },
  verifiedBadge: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    padding: '6px 12px',
    fontSize: '12px'
  },
  welcomeActions: { display: 'flex', gap: '12px' },
  refreshBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorAlert: {
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  alertIcon: { color: '#f59e0b' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  statLink: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px'
  },
  statInfo: { flex: 1 },
  statLabel: { display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
  statValue: { display: 'block', fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' },
  statTrend: { fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  quickPaymentSection: { marginBottom: '32px' },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  metricCard: {
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s'
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#667eea',
    fontSize: '20px'
  },
  metricContent: { flex: 1 },
  metricLabel: { display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
  metricValue: { display: 'block', fontSize: '18px', fontWeight: '600', color: '#1f2937' },
  recentOrdersSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' },
  sectionSubtitle: { fontSize: '13px', color: '#6b7280', margin: 0 },
  viewAllLink: {
    color: '#667eea',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  ordersTableContainer: { overflowX: 'auto' },
  ordersTable: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#f9fafb',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  orderRow: { borderBottom: '1px solid #e5e7eb' },
  orderId: { padding: '16px', fontWeight: '600', color: '#1f2937' },
  orderDate: { padding: '16px', display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '13px' },
  itemsBadge: { background: '#f3f4f6', color: '#4b5563', padding: '4px 12px', borderRadius: '20px' },
  orderTotal: { padding: '16px', fontWeight: '600', color: '#1f2937' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  actionDropdown: { color: '#9ca3af', padding: 0 },
  emptyState: { textAlign: 'center', padding: '48px' },
  emptyIcon: { fontSize: '64px', color: '#d1d5db', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', marginBottom: '8px' },
  emptyText: { color: '#6b7280', marginBottom: '16px' },
  shopNowBtn: { marginTop: '16px', padding: '10px 24px', borderRadius: '12px' },
  recommendationsSection: { marginBottom: '32px' },
  recommendationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  recommendationCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.3s'
  },
  recommendationImage: { width: '100%', height: '200px', objectFit: 'cover' },
  recommendationContent: { padding: '16px' },
  recommendationTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '8px' },
  recommendationPrice: { color: '#667eea', fontWeight: '600', marginBottom: '12px' },
  addToCartBtn: { width: '100%', borderRadius: '12px' },
  quickActionsSection: { marginTop: '32px' },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  actionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  actionIcon: { fontSize: '28px', color: '#667eea', marginBottom: '12px' }
};

export default UserDashboard;
