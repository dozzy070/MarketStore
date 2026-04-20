import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';   // remove BrowserRouter import
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import DashboardLayout from './components/DashboardLayout';

// ==================== PUBLIC ROUTES ====================
import LandingPage from './pages/general/LandingPage';
import Login from './pages/general/Login';
import Register from './pages/general/Register';
import ResetPassword from './pages/general/ResetPassword';
import Cart from './pages/user/Cart';
import ProductDetails from './pages/general/ProductDetails';
import CategoryProducts from './pages/user/CategoryProducts';
import SearchResults from './pages/general/SearchResults';
import Categories from './pages/user/Categories';
import ForgotPassword from './pages/general/ForgotPassword';
import GoogleCallback from './pages/general/GoogleCallback';
import FAQ from './pages/general/FAQ';
import Contact from './pages/general/Contact';
import AboutUs from './pages/general/AboutUs';
import TermsConditions from './pages/general/TermsConditions';
import TrackOrder from './pages/general/TrackOrder';
import ShippingInfo from './pages/general/ShippingInfo';
import ReturnsRefunds from './pages/general/ReturnsRefunds';
import Charity from './pages/general/Charity';
import Blog from './pages/general/Blog';
import BecomeVendor from './pages/general/BecomeVendor';
import BuyerSafety from './pages/general/BuyerSafety';

// ==================== STORE PAGES ====================
import Stores from './pages/general/Stores';
import StoreDetails from './pages/general/StoreDetails';
import StoreProducts from './pages/general/StoreProducts';

// ==================== HELP & SUPPORT PAGES ====================
import HelpCenter from './pages/general/HelpCenter';

// ==================== USER ROUTES ====================
import UserDashboard from './pages/user/UserDashboard';
import UserOrders from './pages/user/UserOrders';
import UserProfile from './pages/user/UserProfile';
import UserWishlist from './pages/user/UserWishlist';
import UserSettings from './pages/user/UserSettings';
import Checkout from './pages/user/Checkout';
import OrderTracking from './pages/user/OrderTracking';
import UserReviews from './pages/user/UserReviews';
import ActivityLog from './pages/user/ActivityLog';
import AccountHelp from './pages/help/AccountHelp';
import OrdersShipping from './pages/help/OrdersShipping';
import PaymentsHelp from './pages/help/PaymentsHelp';
import VendorHelp from './pages/help/VendorHelp';
import Policies from './pages/help/Policies';
import UserPayments from './pages/user/UserPayments';
import ProductList from './pages/general/ProductList';


// ==================== VENDOR ROUTES ====================
import VendorDashboard from './pages/vendor/VendorDashboard';
import Products from './pages/vendor/Products';
import AddProduct from './pages/vendor/AddProduct';
import VendorOrders from './pages/vendor/VendorOrders';
import MyStore from './pages/vendor/MyStore';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorSettings from './pages/vendor/VendorSettings';
import VendorPayouts from './pages/vendor/VendorPayouts';

// ==================== VENDOR STORE ROUTES ====================
import StoreSettings from './pages/vendor/StoreSettings';

// ==================== ADMIN ROUTES ====================
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminProfile from './pages/admin/AdminProfile';
import AdminPendingApprovals from './pages/admin/AdminPendingApprovals';

// ==================== ADMIN STORE ROUTES ====================
import AdminStores from './pages/admin/AdminStores';
import AdminStoreDetails from './pages/admin/AdminStoreDetails';
import ApproveStore from './pages/admin/ApproveStore';
import AdminCreateUser from './pages/admin/AdminCreateUser';

// ==================== REDIRECT HANDLER ====================
const DashboardRedirectHandler = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null;
};

// ==================== ROLE ROUTE ====================
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryId" element={<CategoryProducts />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google-callback" element={<GoogleCallback />} />
        <Route path="/shipping" element={<ShippingInfo />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/returns" element={<ReturnsRefunds />} />
        <Route path="/charity" element={<Charity />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/become-vendor" element={<BecomeVendor />} />
        <Route path="/buyer-safety" element={<BuyerSafety />} />

        {/* Public Store Routes */}
        <Route path="/stores" element={<Stores />} />
        <Route path="/stores/:id" element={<StoreDetails />} />
        <Route path="/stores/:id/products" element={<StoreProducts />} />

        {/* ========== PUBLIC INFO PAGES ========== */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/terms" element={<TermsConditions />} />

        {/* ========== HELP CENTER (protected) ========== */}
        <Route path="/help" element={<PrivateRoute><HelpCenter /></PrivateRoute>} />
        <Route path="/help/faq" element={<PrivateRoute><FAQ /></PrivateRoute>} />
        <Route path="/help/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
        <Route path="/help/account" element={<PrivateRoute><AccountHelp /></PrivateRoute>} />
        <Route path="/help/orders" element={<PrivateRoute><OrdersShipping /></PrivateRoute>} />
        <Route path="/help/payments" element={<PrivateRoute><PaymentsHelp /></PrivateRoute>} />
        <Route path="/help/vendor" element={<PrivateRoute><VendorHelp /></PrivateRoute>} />
        <Route path="/help/policies" element={<PrivateRoute><Policies /></PrivateRoute>} />

        {/* ========== SETTINGS ROUTES - PUBLIC ========== */}
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/vendor/settings" element={<VendorSettings />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* ========== PROFILE ROUTES - AUTH ONLY ========== */}
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/user/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/vendor/profile" element={<PrivateRoute><VendorProfile /></PrivateRoute>} />
        <Route path="/admin/profile" element={<PrivateRoute><AdminProfile /></PrivateRoute>} />

        {/* ========== USER ROUTES ========== */}
        <Route path="/user/dashboard" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><UserDashboard /></RoleRoute></PrivateRoute>
        } />
        <Route path="/user/orders" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><UserOrders /></RoleRoute></PrivateRoute>
        } />
        <Route path="/user/orders/:id" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><OrderTracking /></RoleRoute></PrivateRoute>
        } />
        <Route path="/user/wishlist" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><UserWishlist /></RoleRoute></PrivateRoute>
        } />
        <Route path="/user/reviews" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><UserReviews /></RoleRoute></PrivateRoute>
        } />
        <Route path="/activity" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><ActivityLog /></RoleRoute></PrivateRoute>
        } />
        <Route path="/checkout" element={
          <PrivateRoute><RoleRoute allowedRoles={['user', 'vendor', 'admin']}><Checkout /></RoleRoute></PrivateRoute>
        } />
        <Route path="/user/payments" element={<DashboardLayout><UserPayments /></DashboardLayout>} />
        
        <Route path="/products" element={<ProductList />} />


        {/* ========== VENDOR ROUTES ========== */}
        <Route path="/vendor/dashboard" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><VendorDashboard /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/products" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><Products /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/products/add" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><AddProduct /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/products/edit/:id" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><AddProduct /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/orders" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><VendorOrders /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/payouts" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><VendorPayouts /></RoleRoute></PrivateRoute>
        } />

        {/* Vendor Store Routes */}
        <Route path="/vendor/store" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><MyStore /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/store/settings" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><StoreSettings /></RoleRoute></PrivateRoute>
        } />
        <Route path="/vendor/store/products" element={
          <PrivateRoute><RoleRoute allowedRoles={['vendor', 'admin']}><Products /></RoleRoute></PrivateRoute>
        } />

        {/* ========== ADMIN ROUTES ========== */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/users/create" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminCreateUser /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/vendors" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminVendors /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/products" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminProducts /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/orders" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminOrders /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/categories" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminCategories /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/reviews" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminReviews /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/audit-log" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminAuditLog /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/analytics" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminAnalytics /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/pending-approvals" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminPendingApprovals /></RoleRoute></PrivateRoute>
        } />

        {/* Admin Store Routes */}
        <Route path="/admin/stores" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminStores /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/stores/:id" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><AdminStoreDetails /></RoleRoute></PrivateRoute>
        } />
        <Route path="/admin/stores/:id/approve" element={
          <PrivateRoute><RoleRoute allowedRoles={['admin']}><ApproveStore /></RoleRoute></PrivateRoute>
        } />

        {/* ========== DASHBOARD REDIRECT ========== */}
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardRedirectHandler /></PrivateRoute>
        } />

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;