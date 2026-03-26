// frontend/src/components/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Button, Badge, Dropdown } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaBox, FaUser, FaStore, FaSignOutAlt, FaHistory,
  FaSearch, FaBars, FaCog, FaQuestionCircle, FaMoon, FaSun,
  FaChevronLeft, FaChevronRight, FaTimes, FaHeart, FaUsers,
  FaShoppingCart, FaChartLine, FaStar, FaWallet, FaPlus, FaTags,
  FaShoppingBag, FaShieldAlt, FaExclamationTriangle, FaHome,
  FaCreditCard // Add this import
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/dashboard.css';
import NotificationBell from './NotificationBell';
import { adminAPI } from '../services/api';

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [pendingCounts, setPendingCounts] = useState({
    vendors: 0,
    products: 0,
    reviews: 0
  });

  // Fetch pending counts - Real-time
  const fetchPendingCounts = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      if (!adminAPI) return;
      
      const [vendorsRes, productsRes, reviewsRes] = await Promise.allSettled([
        adminAPI.getPendingVendorsCount?.() || Promise.resolve({ data: { count: 0 } }),
        adminAPI.getPendingProductsCount?.() || Promise.resolve({ data: { count: 0 } }),
        adminAPI.getPendingReviewsCount?.() || Promise.resolve({ data: { count: 0 } })
      ]);
      
      const newCounts = {
        vendors: vendorsRes.status === 'fulfilled' ? vendorsRes.value?.data?.count || 0 : 0,
        products: productsRes.status === 'fulfilled' ? productsRes.value?.data?.count || 0 : 0,
        reviews: reviewsRes.status === 'fulfilled' ? reviewsRes.value?.data?.count || 0 : 0
      };
      
      setPendingCounts(newCounts);
    } catch (error) {
      console.error('Failed to fetch pending counts:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPendingCounts();
  }, [user]);

  // Set up polling for real-time updates (every 10 seconds)
  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const interval = setInterval(() => {
      fetchPendingCounts();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Listen for storage events (when approvals happen in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pending_counts_updated' || e.key === 'vendor_approved') {
        fetchPendingCounts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom events
  useEffect(() => {
    const handleUpdate = () => {
      fetchPendingCounts();
    };
    
    window.addEventListener('pendingCountsUpdated', handleUpdate);
    return () => window.removeEventListener('pendingCountsUpdated', handleUpdate);
  }, []);

  // ================= RESPONSIVE =================
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setMobileSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if dark mode was previously enabled
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const handleLogout = () => {
    logout(navigate);
  };
  
  const toggleSidebar = () => {
    if (isMobile) setMobileSidebarOpen(!mobileSidebarOpen);
    else setSidebarOpen(!sidebarOpen);
  };
  
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const getSidebarWidth = () => {
    if (isMobile) return mobileSidebarOpen ? 280 : 0;
    return sidebarOpen ? 280 : 80;
  };

  const showLabels = sidebarOpen || mobileSidebarOpen;

  // ================= NAVIGATION ITEMS =================
  const commonItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  ];

  const profileItem = { path: '/profile', icon: FaUser, label: 'Profile' };
  const activityItem = { path: '/activity', icon: FaHistory, label: 'Activity Log' };

  const getStoreItem = () => {
    if (user?.role === 'admin') {
      return { path: '/admin/stores', icon: FaStore, label: 'Stores' };
    } else if (user?.role === 'vendor') {
      return { path: '/vendor/store', icon: FaStore, label: 'My Store' };
    } else {
      return { path: '/stores', icon: FaStore, label: 'Stores' };
    }
  };

  // USER ITEMS - ADDED PAYMENTS LINK
  const userItems = [
    { path: '/user/orders', icon: FaShoppingBag, label: 'My Orders' },
    { path: '/user/wishlist', icon: FaHeart, label: 'Wishlist' },
    { path: '/user/reviews', icon: FaStar, label: 'My Reviews' },
    { path: '/user/payments', icon: FaCreditCard, label: 'Payments' }, // Added Payments
  ];

  const vendorItems = [
    { path: '/vendor/products', icon: FaBox, label: 'Products' },
    { path: '/vendor/products/add', icon: FaPlus, label: 'Add Product' },
    { path: '/vendor/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/vendor/payouts', icon: FaWallet, label: 'Payouts' },
  ];

  const adminItems = [
    { path: '/admin/users', icon: FaUsers, label: 'Users', badge: null },
    { 
      path: '/admin/vendors', 
      icon: FaStore, 
      label: 'Vendors',
      badge: pendingCounts.vendors > 0 ? { count: pendingCounts.vendors, color: 'warning' } : null
    },
    { 
      path: '/admin/products', 
      icon: FaBox, 
      label: 'Products',
      badge: pendingCounts.products > 0 ? { count: pendingCounts.products, color: 'warning' } : null
    },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders', badge: null },
    { path: '/admin/categories', icon: FaTags, label: 'Categories', badge: null },
    { 
      path: '/admin/reviews', 
      icon: FaStar, 
      label: 'Reviews',
      badge: pendingCounts.reviews > 0 ? { count: pendingCounts.reviews, color: 'danger' } : null
    },
    { path: '/admin/analytics', icon: FaChartLine, label: 'Analytics', badge: null },
    { path: '/admin/audit-log', icon: FaShieldAlt, label: 'Audit Log', badge: null },
  ];

  const getNavItems = () => {
    const storeItem = getStoreItem();
    const baseItems = [...commonItems, profileItem, storeItem, activityItem];
    
    if (user?.role === 'admin') {
      return [...baseItems, ...adminItems];
    } else if (user?.role === 'vendor') {
      return [...baseItems, ...vendorItems];
    } else {
      return [...baseItems, ...userItems];
    }
  };

  const navItems = getNavItems();

  const getDashboardTitle = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname.includes('/admin')) return 'Admin Panel';
    if (location.pathname.includes('/vendor')) return 'Vendor Dashboard';
    return 'My Account';
  };

  const getTotalPending = () => {
    if (user?.role === 'admin') {
      return pendingCounts.vendors + pendingCounts.products + pendingCounts.reviews;
    }
    return 0;
  };

  return (
    <div className={`dashboard-wrapper ${darkMode ? 'dark-theme' : ''}`}>
      <motion.div
        className={`sidebar ${isMobile ? 'mobile' : ''}`}
        animate={{ width: getSidebarWidth(), x: isMobile ? (mobileSidebarOpen ? 0 : '-100%') : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <div className="sidebar-logo">
              <span className="sidebar-logo-icon">🏪</span>
              {showLabels && (
                <span className="sidebar-logo-text ms-2">
                  Market<span className="text-primary">Store</span>
                </span>
              )}
            </div>
          </div>
          <Button variant="link" className="sidebar-toggle" onClick={toggleSidebar}>
            {isMobile ? <FaTimes /> : (sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />)}
          </Button>
        </div>

        {showLabels && user && (
          <div className="sidebar-user">
            <div className="user-avatar">{user?.full_name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <h6>{user?.full_name || 'User'}</h6>
              <span className="user-role">
                {user?.role === 'admin' ? 'Administrator' : user?.role === 'vendor' ? 'Vendor' : 'Customer'}
              </span>
            </div>
            {user?.role === 'admin' && getTotalPending() > 0 && (
              <Badge bg="danger" className="ms-auto pending-badge">{getTotalPending()}</Badge>
            )}
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <motion.button
                key={item.path}
                onClick={() => { navigate(item.path); if (isMobile) closeMobileSidebar(); }}
                className={`nav-item w-100 text-start ${isActive ? 'active' : ''}`}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="nav-icon" />
                {showLabels && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <Badge bg={item.badge.color} className="ms-auto nav-badge" pill={item.badge.color === 'danger'}>
                        {item.badge.count}
                      </Badge>
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
        </nav>

        {showLabels && (
          <div className="sidebar-footer">
            <button className="footer-item" onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button className="footer-item" onClick={() => navigate('/settings')}>
              <FaCog /><span>Settings</span>
            </button>
            <button className="footer-item" onClick={() => navigate('/help')}>
              <FaQuestionCircle /><span>Help & Support</span>
            </button>
            <button className="footer-item text-danger" onClick={handleLogout}>
              <FaSignOutAlt /><span>Logout</span>
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isMobile && mobileSidebarOpen && (
          <motion.div className="sidebar-overlay" onClick={closeMobileSidebar}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="topbar">
          <div className="topbar-left">
            <Button variant="link" className="mobile-menu-toggle" onClick={toggleSidebar}>
              <FaBars />
            </Button>
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search products, orders, vendors..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                onKeyPress={(e) => { if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }}}
              />
            </div>
          </div>

          <div className="topbar-right">
            <span className="d-none d-md-block fw-medium me-3 dashboard-title">{getDashboardTitle()}</span>
            
            {user?.role === 'admin' && getTotalPending() > 0 && (
              <Badge bg="warning" className="me-3 pending-alert p-2">
                <FaExclamationTriangle className="me-1" />
                {getTotalPending()} Items Need Review
              </Badge>
            )}

            {user?.role === 'vendor' && (
              <Button variant="primary" size="sm" className="quick-action-btn d-flex align-items-center gap-2"
                onClick={() => navigate('/vendor/products/add')}>
                <FaPlus size={14} /><span>Add Product</span>
              </Button>
            )}

            <NotificationBell />

            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="user-menu-btn p-0">
                <div className="user-avatar-sm">{user?.full_name?.charAt(0) || 'U'}</div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="user-dropdown-menu">
                <div className="dropdown-header px-3 py-2 border-bottom">
                  <div className="fw-semibold">{user?.full_name || 'User'}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
                <Dropdown.Item onClick={() => navigate('/')}><FaHome className="me-2" /> Home</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/profile')}><FaUser className="me-2" /> My Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/activity')}><FaHistory className="me-2" /> Activity Log</Dropdown.Item>
                {user?.role === 'vendor' && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => navigate('/vendor/store')}><FaStore className="me-2" /> My Store</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/vendor/products')}><FaBox className="me-2" /> Products</Dropdown.Item>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => navigate('/admin/stores')}><FaStore className="me-2" /> Manage Stores</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/admin/audit-log')}><FaShieldAlt className="me-2" /> Audit Log</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/admin/reviews')}><FaStar className="me-2" /> Reviews</Dropdown.Item>
                  </>
                )}
                {user?.role === 'user' && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => navigate('/stores')}><FaStore className="me-2" /> Browse Stores</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/user/payments')}><FaCreditCard className="me-2" /> Payments</Dropdown.Item>
                  </>
                )}
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => navigate('/settings')}><FaCog className="me-2" /> Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/help')}><FaQuestionCircle className="me-2" /> Help Center</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger"><FaSignOutAlt className="me-2" /> Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      <style>{`
        .dashboard-title { font-weight: 500; color: #4b5563; }
        .dark-theme .dashboard-title { color: #9ca3af; }
        .pending-alert { display: flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.2s; }
        .pending-alert:hover { opacity: 0.9; transform: scale(1.02); }
        .quick-action-btn { transition: all 0.2s; }
        .quick-action-btn:hover { transform: translateY(-2px); }
        .user-dropdown-menu { min-width: 220px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); border: none; overflow: hidden; }
        .user-dropdown-menu .dropdown-item { padding: 10px 16px; transition: all 0.2s; }
        .user-dropdown-menu .dropdown-item:hover { background: #f3f4f6; padding-left: 20px; }
        .dark-theme .user-dropdown-menu .dropdown-item:hover { background: #374151; }
        .dropdown-header { background: #f9fafb; }
        .dark-theme .dropdown-header { background: #1f2937; }
        .nav-badge { font-size: 10px; padding: 2px 6px; }
        .pending-badge { font-size: 10px; padding: 2px 6px; }
        @media (max-width: 768px) {
          .quick-action-btn span { display: none; }
          .quick-action-btn { padding: 8px 10px; }
          .pending-alert { font-size: 12px; padding: 4px 8px; }
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout;