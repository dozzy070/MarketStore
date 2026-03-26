import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';



// Layout Components
import DashboardLayout from './components/DashboardLayout';


// ==================== PUBLIC ROUTES ====================
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import CategoryProducts from './pages/CategoryProducts';
import SearchResults from './pages/SearchResults';
import Categories from './pages/Categories';
import ForgotPassword from './pages/ForgotPassword';
import GoogleCallback from './pages/GoogleCallback';



// ==================== STORE PAGES ====================
import Stores from './pages/Stores';
import StoreDetails from './pages/StoreDetails';
import StoreProducts from './pages/StoreProducts';

// ==================== HELP & SUPPORT PAGES ====================
import HelpCenter from './pages/HelpCenter';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

// ==================== USER ROUTES ====================
import UserDashboard from './pages/UserDashboard';
import UserOrders from './pages/UserOrders';
import UserProfile from './pages/UserProfile';
import UserWishlist from './pages/UserWishlist';
import UserSettings from './pages/UserSettings';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import UserReviews from './pages/UserReviews';
import ActivityLog from './pages/ActivityLog';
import AccountHelp from './pages/help/AccountHelp';
import OrdersShipping from './pages/help/OrdersShipping';
import ReturnsRefunds from './pages/help/ReturnsRefunds';
import PaymentsHelp from './pages/help/PaymentsHelp';
import VendorHelp from './pages/help/VendorHelp';
import Policies from './pages/help/Policies';


// ==================== VENDOR ROUTES ====================
import VendorDashboard from './pages/VendorDashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import VendorOrders from './pages/VendorOrders';
import MyStore from './pages/MyStore';
import VendorProfile from './pages/VendorProfile';
import VendorSettings from './pages/VendorSettings';
import VendorPayouts from './pages/VendorPayouts';
import UserPayments from './pages/UserPayments';


// ==================== VENDOR STORE ROUTES ====================
import StoreSettings from './pages/StoreSettings';

// ==================== ADMIN ROUTES ====================
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminVendors from './pages/AdminVendors';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminReviews from './pages/AdminReviews';
import AdminAuditLog from './pages/AdminAuditLog';
import AdminSettings from './pages/AdminSettings';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminProfile from './pages/AdminProfile';
import AdminPendingApprovals from './pages/AdminPendingApprovals';


// ==================== ADMIN STORE ROUTES ====================
import AdminStores from './pages/AdminStores';
import AdminStoreDetails from './pages/AdminStoreDetails';
import ApproveStore from './pages/ApproveStore';
import AdminCreateUser from './pages/AdminCreateUser';

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
    <Router>
      <ThemeProvider>
        <AuthProvider>
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


            {/* Public Store Routes */}
            <Route path="/stores" element={<Stores />} />
            <Route path="/stores/:id" element={<StoreDetails />} />
            <Route path="/stores/:id/products" element={<StoreProducts />} />

            {/* ========== HELP & SUPPORT ROUTES - PUBLIC ========== */}
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/help/faq" element={<FAQ />} />
            <Route path="/help/contact" element={<Contact />} />

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
            <Route path="/help/account" element={
              <PrivateRoute><AccountHelp /></PrivateRoute>
            } />
            <Route path="/help/orders" element={
              <PrivateRoute><OrdersShipping /></PrivateRoute>
            } />
            <Route path="/help/returns" element={
              <PrivateRoute><ReturnsRefunds /></PrivateRoute>
            } />
            <Route path="/help/payments" element={
              <PrivateRoute><PaymentsHelp /></PrivateRoute>
            } />
            <Route path="/help/vendor" element={
              <PrivateRoute><VendorHelp /></PrivateRoute>
            } />
            <Route path="/help/policies" element={
              <PrivateRoute><Policies /></PrivateRoute>
            } />
            <Route path="/user/payments" element={<DashboardLayout><UserPayments /></DashboardLayout>} />


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
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;