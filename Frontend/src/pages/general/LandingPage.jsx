// frontend/src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Navbar, Nav, Dropdown, Form, Alert, InputGroup, Modal, Image, ListGroup, Spinner, Accordion, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaStore, FaShoppingCart, FaStar, FaHeart, FaFilter, FaSearch, FaUser, FaTag,
  FaShoppingBag, FaCheckCircle, FaArrowRight,
  FaBars, FaTimes, FaMapMarkerAlt, FaFacebook,
  FaTwitter, FaInstagram, FaTruck, FaShieldAlt, FaHeadset,
  FaExclamationTriangle, FaSync, FaChevronRight, FaChevronLeft,
  FaFire, FaClock, FaRocket, FaPaperPlane, FaGift, FaHandsHelping,
  FaBookOpen, FaStoreAlt, FaUserShield, FaAngleRight, FaQuoteLeft,
  FaBoxOpen, FaAward, FaLeaf, FaCreditCard, FaMobileAlt, FaApple,
  FaGooglePlay, FaDownload, FaQuestionCircle, FaBolt, FaCrown,
  FaGem, FaUsers, FaChartLine, FaLinkedin, FaYoutube, FaCheck,
  FaMoneyBillWave, FaRegSmile, FaGlobe, FaComments, FaCertificate
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { categoryAPI, newsletterAPI, reviewAPI, storeAPI, userAPI } from '../../services/api';
import heroImage from '../../assets/doormart-hero.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────
// Skeletons & Modals
// ─────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px', overflow: 'hidden' }}>
    <div className="bg-light" style={{ height: '200px' }} />
    <Card.Body>
      <div className="bg-light rounded mb-2" style={{ height: '20px', width: '80%' }} />
      <div className="bg-light rounded mb-2" style={{ height: '16px', width: '60%' }} />
      <div className="bg-light rounded" style={{ height: '36px', width: '100%' }} />
    </Card.Body>
  </Card>
);

const CharityModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton className="border-0 pb-0">
      <Modal.Title className="fw-bold"><FaHandsHelping className="text-primary me-2" /> DoorMart Cares</Modal.Title>
    </Modal.Header>
    <Modal.Body className="pt-0">
      <p className="lead">Empowering African communities through commerce and giving back.</p>
      <p>Visit our community page for current programs and ways to get involved.</p>
      <Button as={Link} to="/charity" variant="outline-primary" className="mt-2">Explore Community Programs</Button>
    </Modal.Body>
  </Modal>
);

const BlogModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton className="border-0 pb-0">
      <Modal.Title className="fw-bold"><FaBookOpen className="text-primary me-2" /> DoorMart Blog</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center py-5">
      <p className="lead">Read the latest stories and updates published by DoorMart.</p>
      <Button as={Link} to="/blog" variant="outline-primary" onClick={onHide}>Explore the Blog</Button>
    </Modal.Body>
  </Modal>
);

const BecomeVendorModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const handleStart = () => {
    if (isAuthenticated) navigate('/become-vendor');
    else { navigate('/login'); toast('Please log in to apply as a vendor'); }
  };
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold"><FaStoreAlt className="text-primary me-2" /> Sell on DoorMart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="align-items-center">
          <Col md={6}><Image src="https://images.unsplash.com/photo-1556742031-c6961e8561b0?w=600" alt="Vendor" fluid rounded className="mb-3" /></Col>
          <Col md={6}>
            <p className="lead">Create a store and manage your products and orders on DoorMart.</p>
            <ul className="list-unstyled">
              <li><FaCheckCircle className="text-success me-2" /> Easy product upload</li>
              <li><FaCheckCircle className="text-success me-2" /> Secure payments</li>
              <li><FaCheckCircle className="text-success me-2" /> Manage customer orders</li>
            </ul>
            <Button variant="primary" onClick={handleStart} className="mt-3 w-100">Become a Vendor</Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

const BuyerSafetyModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton className="border-0 pb-0">
      <Modal.Title className="fw-bold"><FaUserShield className="text-primary me-2" /> Buyer Safety</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Row>
        <Col md={7}>
          <h5>Your security is our priority</h5>
          <p>We use industry‑standard encryption and fraud detection to keep every transaction safe.</p>
          <h6>What we do:</h6>
          <ul>
            <li><strong>Secure Payments:</strong> Processed via trusted gateways.</li>
            <li><strong>Approved Stores:</strong> Browse stores approved by DoorMart.</li>
            <li><strong>Buyer Support:</strong> Contact our team for assistance.</li>
            <li><strong>Order Updates:</strong> Follow orders from your account.</li>
          </ul>
          <Button as={Link} to="/buyer-safety" variant="outline-primary" className="mt-2">Full Safety Guide</Button>
        </Col>
        <Col md={5}>
          <Image src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500" alt="Safety" fluid rounded />
        </Col>
      </Row>
    </Modal.Body>
  </Modal>
);

// ─────────────────────────────────────────────
// Static data for new sections
// ─────────────────────────────────────────────
const STATS = [
  { key: 'total_stores', label: 'Approved Stores', icon: FaStore, color: 'blue' },
  { key: 'total_products', label: 'Products Listed', icon: FaShoppingBag, color: 'gold' },
  { key: 'total_reviews', label: 'Customer Reviews', icon: FaUsers, color: 'green' },
  { key: 'average_rating', label: 'Average Rating', icon: FaStar, color: 'blue' },
];

const getDiscountPercent = (product) => {
  const discount = Number(product.discount);
  if (Number.isFinite(discount) && discount > 0) return Math.round(discount);

  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice);
  if (!Number.isFinite(price) || !Number.isFinite(originalPrice) || originalPrice <= price || originalPrice <= 0) {
    return 0;
  }
  return Math.round((1 - price / originalPrice) * 100);
};

const FEATURES = [
  { icon: FaTruck, title: 'Delivery Options', desc: 'Review delivery information provided for each order.', color: 'blue' },
  { icon: FaShieldAlt, title: 'Secure Payments', desc: 'Payment options are provided during checkout.', color: 'green' },
  { icon: FaHeadset, title: 'Customer Support', desc: 'Contact our team if you need help with an order.', color: 'gold' },
  { icon: FaAward, title: 'Vendor Listings', desc: 'Browse products offered by DoorMart vendors.', color: 'blue' },
  { icon: FaMoneyBillWave, title: 'Buyer Support', desc: 'Get help from our team when you need it.', color: 'green' },
  { icon: FaLeaf, title: 'More to Explore', desc: 'Discover products across a range of categories.', color: 'gold' },
];

const STEPS = [
  { num: '01', title: 'Browse & Discover', desc: 'Explore products from DoorMart stores.', icon: FaSearch, color: 'blue' },
  { num: '02', title: 'Add to Cart', desc: 'Pick your favourites in one click.', icon: FaShoppingCart, color: 'gold' },
  { num: '03', title: 'Secure Checkout', desc: 'Choose from the payment methods available at checkout.', icon: FaCreditCard, color: 'green' },
  { num: '04', title: 'Delivery', desc: 'Review delivery details for your order.', icon: FaTruck, color: 'blue' },
];

const FAQS = [
  { q: 'How long does delivery take?', a: 'Delivery estimates depend on your location and the vendor. Check the order details and tracking information for updates.' },
  { q: 'How do I get help with an order?', a: 'Contact our support team with your order details and we will help you resolve the issue.' },
  { q: 'What payment methods do you accept?', a: 'Available payment methods are shown during checkout.' },
  { q: 'How do I become a vendor on DoorMart?', a: 'Open the Become a Vendor page and follow the application instructions.' },
  { q: 'How are payments handled?', a: 'Payments are processed through the payment provider shown at checkout. DoorMart does not display full card details.' },
];

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesError, setStoresError] = useState(false);
  const [storeStats, setStoreStats] = useState({
    total_stores: 0,
    total_products: 0,
    total_reviews: 0,
    average_rating: 0
  });
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', minPrice: '', maxPrice: '', inStock: false, search: '', sort: 'newest' });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [dealsOfDay, setDealsOfDay] = useState([]);
  const [apiError, setApiError] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('All Products');
  const searchTimeout = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState({ charity: false, blog: false, vendor: false, safety: false });
  const productsPerPage = 8;

  // Initial loads
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadFeaturedReviews();
    loadCart();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStores();
      const fetchWishlist = async () => {
        try {
          const response = await userAPI.getWishlist();
          const products = response.data?.data;
          if (!response.data?.success || !Array.isArray(products)) {
            throw new Error('The wishlist API returned an invalid response.');
          }
          const productIds = products.map(product => product.id);
          setWishlist(productIds);
          localStorage.setItem('wishlist', JSON.stringify(productIds));
        } catch (error) {
          console.error('Failed to load wishlist:', error);
          setWishlist([]);
        }
      };
      void fetchWishlist();
      return;
    }

    setStores([]);
    setWishlist([]);
    localStorage.removeItem('wishlist');
    setStoresError(false);
    setStoreStats({
      total_stores: 0,
      total_products: 0,
      total_reviews: 0,
      average_rating: 0
    });
  }, [isAuthenticated]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const timer = setTimeout(() => setCurrentPage(1), 300);
    searchTimeout.current = timer;
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadProducts = async (retry = false) => {
    try {
      if (!retry) setProductsLoading(true);
      setApiError(false);
      const response = await axios.get(`${API_BASE_URL}/products/public`, { timeout: 30000, headers: { Accept: 'application/json' } });
      if (response?.data?.success) {
        const productsData = response.data.products || [];
        setProducts(productsData);
        setDealsOfDay(productsData.filter(product => getDiscountPercent(product) > 0).slice(0, 4));
      } else throw new Error('No products found');
    } catch (error) {
      console.error('Failed to load public products:', error);
      setApiError(true);
      setProducts([]);
      setDealsOfDay([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      if (!response.data?.success || !Array.isArray(response.data.data)) throw new Error('Invalid categories response');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
      setCategoriesError(true);
    }
  };

  const loadStores = async () => {
    try {
      const response = await storeAPI.getStores({ limit: 6 });
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error('The stores API returned an invalid response.');
      }

      setStores(response.data.data);
      setStoreStats({
        total_stores: Number(response.data.stats?.total_stores) || 0,
        total_products: Number(response.data.stats?.total_products) || 0,
        total_reviews: Number(response.data.stats?.total_reviews) || 0,
        average_rating: Number(response.data.stats?.average_rating) || 0
      });
      setStoresError(false);
    } catch (error) {
      console.error('Failed to load featured stores:', error);
      setStores([]);
      setStoresError(true);
    }
  };

  const loadFeaturedReviews = async () => {
    try {
      const response = await reviewAPI.getFeaturedReviews();
      if (!response.data?.success || !Array.isArray(response.data.data)) throw new Error('Invalid reviews response');
      setReviews(response.data.data);
    } catch (error) {
      console.error('Failed to load featured reviews:', error);
      setReviews([]);
      setReviewsError(true);
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) try { setCart(JSON.parse(saved)); } catch { setCart([]); }
  };
  const addToCart = (product) => {
    if (!product?.id) return;
    const existing = cart.find(i => i.id === product.id);
    const newCart = existing
      ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  const toggleWishlist = async (id) => {
    if (!isAuthenticated) {
      toast.error('Sign in to save products to your wishlist.');
      navigate('/login');
      return;
    }

    const alreadySaved = wishlist.includes(id);
    try {
      if (alreadySaved) {
        await userAPI.removeFromWishlist(id);
      } else {
        await userAPI.addToWishlist(id);
      }
      const newList = alreadySaved ? wishlist.filter(productId => productId !== id) : [...wishlist, id];
      setWishlist(newList);
      localStorage.setItem('wishlist', JSON.stringify(newList));
      toast.success(alreadySaved ? 'Removed from wishlist' : 'Added to wishlist', { icon: '❤️' });
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      toast.error(error.response?.data?.message || 'Could not update wishlist.');
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true); setNewsletterError('');
    try {
      const response = await newsletterAPI.subscribe(newsletterEmail);
      if (!response.data?.success) throw new Error(response.data?.message || 'Unable to subscribe.');
      setNewsletterSubscribed(true);
      toast.success(response.data.message);
      setNewsletterEmail('');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Unable to subscribe.';
      setNewsletterError(msg); toast.error(msg);
    } finally { setNewsletterLoading(false); }
  };

  const handleCategoryClick = (id, name) => {
    setSelectedCategoryName(name);
    setFilters({ ...filters, category: id.toString() });
    setCurrentPage(1);
    setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearCategoryFilter = () => { setFilters({ ...filters, category: 'all' }); setSelectedCategoryName('All Products'); setCurrentPage(1); };
  const clearFilters = () => { setFilters({ category: 'all', minPrice: '', maxPrice: '', inStock: false, search: '', sort: 'newest' }); setSelectedCategoryName('All Products'); setCurrentPage(1); };

  const filterProducts = () => {
    let f = [...products];
    if (filters.category !== 'all') f = f.filter(p => String(p.category_id) === String(filters.category));
    if (filters.search) f = f.filter(p => p.name?.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.minPrice) f = f.filter(p => (p.price || 0) >= parseFloat(filters.minPrice));
    if (filters.maxPrice) f = f.filter(p => (p.price || 0) <= parseFloat(filters.maxPrice));
    if (filters.inStock) f = f.filter(p => (p.stock_quantity || 0) > 0);
    switch (filters.sort) {
      case 'price-low': f.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-high': f.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'rating': f.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: f.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return f;
  };

  const filteredProducts = filterProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const getCartCount = () => cart.reduce((t, i) => t + (i.quantity || 0), 0);
  const formatCurrency = (a) => isNaN(parseFloat(a)) ? '₦0' : `₦${parseFloat(a).toLocaleString()}`;
  const getCategoryProductCount = (id) => products.filter(p => String(p.category_id) === String(id)).length;
  const getCategoryIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('electronic') || n.includes('computer')) return '💻';
    if (n.includes('fashion') || n.includes('cloth')) return '👕';
    if (n.includes('home') || n.includes('furniture')) return '🏠';
    if (n.includes('sport') || n.includes('fitness')) return '⚽';
    if (n.includes('beauty') || n.includes('skin')) return '✨';
    if (n.includes('book')) return '📚';
    return <FaTag />;
  };

  const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <div className="landing-page dm-page">

      {/* ═══════════════════════════════════════
          TOP PROMO TICKER (Gold → Green gradient)
      ═══════════════════════════════════════ */}
      <div className="promo-ticker">
        <div className="promo-ticker-track">
          {[...Array(2)].map((_, dup) => (
            <React.Fragment key={dup}>
              <span className="promo-item"><FaGift /> Discover products from DoorMart vendors</span>
              <span className="promo-item"><FaBolt /> Browse current product offers</span>
              <span className="promo-item"><FaCrown /> Explore trusted stores</span>
              <span className="promo-item"><FaTruck /> Shop products from across Nigeria</span>
              <span className="promo-item"><FaCheckCircle /> Secure checkout</span>
              <span className="promo-item"><FaGem /> Browse the latest listings</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sidebar Toggle */}
      <Button
        variant="light"
        className="position-fixed start-0 top-50 translate-middle-y rounded-end-0 shadow-sm"
        style={{ zIndex: 1000, transform: 'translateY(-50%)' }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open discover menu"
      >
        <FaAngleRight size={20} />
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
              style={{ zIndex: 1040 }} onClick={() => setSidebarOpen(false)}
            />
            <Motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="position-fixed top-0 start-0 h-100 bg-white shadow-lg"
              style={{ width: '280px', zIndex: 1050, overflowY: 'auto' }}
            >
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0">Discover</h5>
                <Button variant="link" className="p-0" onClick={() => setSidebarOpen(false)}><FaTimes size={20} /></Button>
              </div>
              <ListGroup variant="flush">
                <ListGroup.Item action onClick={() => { setModalOpen({ ...modalOpen, charity: true }); setSidebarOpen(false); }}><FaHandsHelping className="text-primary me-3" /> Charity</ListGroup.Item>
                <ListGroup.Item action onClick={() => { setModalOpen({ ...modalOpen, blog: true }); setSidebarOpen(false); }}><FaBookOpen className="text-primary me-3" /> Blog</ListGroup.Item>
                <ListGroup.Item action onClick={() => { setModalOpen({ ...modalOpen, vendor: true }); setSidebarOpen(false); }}><FaStoreAlt className="text-primary me-3" /> Become a Vendor</ListGroup.Item>
                <ListGroup.Item action onClick={() => { setModalOpen({ ...modalOpen, safety: true }); setSidebarOpen(false); }}><FaUserShield className="text-primary me-3" /> Buyer Safety</ListGroup.Item>
              </ListGroup>
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      <CharityModal show={modalOpen.charity} onHide={() => setModalOpen({ ...modalOpen, charity: false })} />
      <BlogModal show={modalOpen.blog} onHide={() => setModalOpen({ ...modalOpen, blog: false })} />
      <BecomeVendorModal show={modalOpen.vendor} onHide={() => setModalOpen({ ...modalOpen, vendor: false })} />
      <BuyerSafetyModal show={modalOpen.safety} onHide={() => setModalOpen({ ...modalOpen, safety: false })} />

      {/* ═══════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════ */}
      <Navbar bg="white" expand="lg" className="py-3 shadow-sm sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-2 d-flex align-items-center">
            <div className="brand-badge me-2"><FaStore size={20} /></div>
            <span className="text-dark">Door<span className="text-gold">Mart</span></span>
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-3 order-lg-2">
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 p-0" />
          </div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto align-items-center">
              <Nav.Link href="#categories">Categories</Nav.Link>
              <Nav.Link href="#flash-sale">Flash Sale</Nav.Link>
              <Nav.Link href="#products">Products</Nav.Link>
              <Nav.Link href="#vendors">Vendors</Nav.Link>
              <Nav.Link href="#testimonials">Reviews</Nav.Link>
              <Nav.Link href="#blog">Blog</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center mt-3 mt-lg-0 ms-lg-4 gap-3">
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center">
                    <FaUser className="me-2" /> Account
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'vendor' ? '/vendor/profile' : '/user/profile'}>
                      <FaUser className="me-2" /> My Account
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/user/orders"><FaShoppingBag className="me-2" /> My Orders</Dropdown.Item>
                    {user?.role === 'vendor' && <Dropdown.Item as={Link} to="/vendor/dashboard"><FaStore className="me-2" /> Vendor Dashboard</Dropdown.Item>}
                    {user?.role === 'admin' && <Dropdown.Item as={Link} to="/admin/dashboard"><FaShieldAlt className="me-2" /> Admin Panel</Dropdown.Item>}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button variant="outline-primary" onClick={() => navigate('/profile')}>
                  <FaUser className="me-2" /> Account
                </Button>
              )}
              <Button variant="outline-danger" className="d-flex align-items-center" onClick={() => navigate('/user/wishlist')}>
                <FaHeart className="me-2" /> Wishlist
              </Button>
              <Button variant="outline-primary" className="position-relative d-flex align-items-center" onClick={() => navigate('/cart')}>
                <FaShoppingCart className="me-2" /> Cart
                {getCartCount() > 0 && <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill">{getCartCount()}</Badge>}
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-blob hero-blob-gold" />
        <div className="hero-blob hero-blob-green" />
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Row className="align-items-center py-5">
              <Col lg={6} className="mb-5 mb-lg-0 text-white">
                <Badge className="hero-badge mb-4"><FaRocket className="me-2" /> {productsLoading ? 'Discover DoorMart' : `${products.length}+ products to explore`}</Badge>
                <h1 className="display-3 fw-bold mb-4 lh-1">
                  Shop Smarter<br />
                  <span className="text-gold">Save Bigger</span><br />
                  <span className="text-green">Live Better</span>
                </h1>
                <p className="lead mb-4 opacity-90">Explore fairly products from DoorMart vendors, discover trusted stores, and use secure checkout.</p>
                <div className="hero-search bg-white rounded-pill p-2 mb-4" style={{ maxWidth: '540px' }}>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-0"><FaSearch className="text-primary" /></InputGroup.Text>
                    <Form.Control
                      type="text" placeholder="Search products, brands, vendors..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value, category: 'all' })}
                      className="border-0 shadow-none"
                    />
                    <Button className="btn-primary-gradient rounded-pill px-4" onClick={scrollToProducts}>Search</Button>
                  </InputGroup>
                </div>
                <div className="d-flex flex-wrap gap-4">
                  <div className="d-flex align-items-center"><div className="hero-icon-chip"><FaTruck size={18} /></div><small className="ms-2">Amazing Sales</small></div>
                  <div className="d-flex align-items-center"><div className="hero-icon-chip"><FaShieldAlt size={18} /></div><small className="ms-2">Secure Payment</small></div>
                  <div className="d-flex align-items-center"><div className="hero-icon-chip"><FaClock size={18} /></div><small className="ms-2">24/7 Support</small></div>
                </div>
              </Col>
              <Col lg={6} className="text-center position-relative">
                <Motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  className="hero-image-wrap"
                >
                  <img
                    src={heroImage}
                    alt="DoorMart shopping bags and packages"
                    className="hero-illustration"
                    fetchPriority="high"
                  />
                  <Motion.div className="hero-float-card hero-float-card-1" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                    <FaCheckCircle className="text-success me-2" /> <strong>Find your next favorite</strong>
                  </Motion.div>
                  <Motion.div className="hero-float-card hero-float-card-2" animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <FaStar className="text-gold me-2" />
                    <strong>{storeStats.average_rating > 0 ? `${storeStats.average_rating.toFixed(1)}/5` : 'Shopper favorites'}</strong>
                    {storeStats.total_reviews > 0 && ` — ${storeStats.total_reviews.toLocaleString()} reviews`}
                  </Motion.div>
                </Motion.div>
              </Col>
            </Row>
          </Motion.div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════ */}
      <section className="stats-section py-4">
        <Container>
          <Row className="g-3">
            {STATS.map((s, i) => (
              <Col key={i} xs={6} md={3}>
                <Motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className={`stat-card stat-${s.color}`}
                >
                  <div className="stat-icon"><s.icon size={22} /></div>
                  <div>
                    <h4 className="mb-0 fw-bold">
                      {s.key === 'average_rating'
                        ? storeStats[s.key] > 0 ? `${storeStats[s.key].toFixed(1)}★` : '—'
                        : storeStats[s.key].toLocaleString()}
                    </h4>
                    <small className="opacity-75">{s.label}</small>
                  </div>
                </Motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES TICKER (marquee)
      ═══════════════════════════════════════ */}
      <section className="features-marquee py-3">
        <div className="features-marquee-track">
          {[...Array(2)].map((_, dup) => (
            <React.Fragment key={dup}>
              <span className="marquee-item"><FaTruck /> Delivery Information at Checkout</span>
              <span className="marquee-item"><FaShieldAlt /> Secure Payments</span>
              <span className="marquee-item"><FaHeadset /> Customer Support</span>
              <span className="marquee-item"><FaAward /> Vendor Listings</span>
              <span className="marquee-item"><FaMoneyBillWave /> Buyer Support</span>
              <span className="marquee-item"><FaLeaf /> Shop by Category</span>
              <span className="marquee-item"><FaCheckCircle /> Approved Vendors</span>
              <span className="marquee-item"><FaRocket /> Review Delivery Details</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════ */}
      <section id="categories" className="py-5">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-blue mb-3">Shop by Category</Badge>
              <h2 className="display-5 fw-bold">Explore Popular Categories</h2>
              <p className="lead text-muted">Click any category to jump straight to products</p>
            </div>
          </Motion.div>

          {categoriesError && <Alert variant="warning" className="text-center">Categories are temporarily unavailable.</Alert>}
          {!categoriesError && categories.length === 0 && !productsLoading && <p className="text-center text-muted">Categories will appear here soon.</p>}

          <div className="categories-horizontal">
            {categories.map((cat) => (
              <Motion.div
                key={cat.id}
                className="category-card-horizontal"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleCategoryClick(cat.id, cat.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleCategoryClick(cat.id, cat.name);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Browse ${cat.name} products`}
                style={{ cursor: 'pointer' }}
              >
                <div className="position-relative overflow-hidden rounded-4 shadow-sm h-100">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="category-img-horizontal" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="category-img-horizontal d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fs-1">{getCategoryIcon(cat.name)}</div>
                  )}
                  <div className="category-overlay">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-bold">{cat.name}</h5>
                      <span className="fs-4">{getCategoryIcon(cat.name)}</span>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <small>{getCategoryProductCount(cat.id)} products</small>
                      <FaChevronRight className="ms-2" size={12} />
                    </div>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          FLASH SALE + COUNTDOWN
      ═══════════════════════════════════════ */}
      <section id="flash-sale" className="py-5 flash-sale-section">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flash-sale-header">
              <div>
                <Badge className="flash-badge mb-2"><FaBolt className="me-1" /> Current Deals</Badge>
                <h2 className="display-6 fw-bold mb-1 text-white">Discounted Products</h2>
                <p className="text-white-50 mb-0">Current offers from DoorMart product listings.</p>
              </div>
              <span className="text-white-50">{dealsOfDay.length} current offers</span>
            </div>
          </Motion.div>

          <Row className="g-4 mt-4">
            {dealsOfDay.map((product, idx) => (
              <Col key={product.id || idx} xs={6} md={4} lg={3}>
                <Motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} viewport={{ once: true }}>
                  <Card className="border-0 shadow-sm h-100 product-card-light">
                    <div className="position-relative">
                      <Badge className="badge-discount position-absolute top-0 start-0 m-3">
                        -{getDiscountPercent(product)}%
                      </Badge>
                      <Link to={`/product/${product.id}`}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="card-img-top" style={{ height: '200px', objectFit: 'cover', backgroundColor: '#f1f3f5' }} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                        ) : (
                          <div className="card-img-top bg-light" role="img" aria-label={`${product.name} image unavailable`} style={{ height: '200px' }} />
                        )}
                      </Link>
                    </div>
                    <Card.Body>
                      <h6 className="mb-1 text-truncate">{product.name}</h6>
                      <div className="d-flex align-items-center mb-2">
                        {[...Array(5)].map((_, i) => <FaStar key={i} size={12} className={i < Math.floor(Number(product.rating) || 0) ? 'text-warning' : 'text-secondary'} />)}
                        <small className="text-muted ms-2">({Number(product.review_count) || 0})</small>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <span className="h5 fw-bold text-primary mb-0">{formatCurrency(product.price)}</span>
                        {product.originalPrice && <small className="text-muted text-decoration-line-through ms-2">{formatCurrency(product.originalPrice)}</small>}
                      </div>
                      <Button className="btn-primary-gradient w-100 btn-sm" onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0}>
                        <FaShoppingCart className="me-2" /> Add to Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </Motion.div>
              </Col>
            ))}
            {!dealsOfDay.length && (
              <Col xs={12}>
                <p className="text-center text-white-50 mb-0">No active deals are available right now.</p>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCTS
      ═══════════════════════════════════════ */}
      <section id="products" className="py-5">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-green mb-3">Our Products</Badge>
              <h2 className="display-5 fw-bold">{selectedCategoryName}</h2>
              <p className="lead text-muted">
                {filters.category !== 'all' ? `Browse our ${selectedCategoryName.toLowerCase()} collection` : 'Discover our curated collection'}
              </p>
              {filters.category !== 'all' && (
                <Button variant="link" onClick={clearCategoryFilter} className="mt-2">Clear Category Filter <FaTimes className="ms-1" /></Button>
              )}
            </div>
          </Motion.div>

          <Card className="border-0 shadow-sm mb-4 filter-card">
            <Card.Body className="p-4">
              <Row className="align-items-center g-3">
                <Col lg={4}>
                  <InputGroup>
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control type="text" placeholder="Search products..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                  </InputGroup>
                </Col>
                <Col lg={3}>
                  <Form.Select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                    <option value="newest">Newest</option>
                    <option value="rating">Top Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </Form.Select>
                </Col>
                <Col lg={3}>
                  <Button variant={showFilters ? 'primary' : 'outline-primary'} className="w-100" onClick={() => setShowFilters(!showFilters)}>
                    <FaFilter className="me-2" /> {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </Col>
                <Col lg={2}>
                  <div className="text-muted text-center bg-light py-2 rounded-pill"><small><strong>{filteredProducts.length}</strong> found</small></div>
                </Col>
              </Row>

              {showFilters && (
                <Row className="mt-3 pt-3 border-top g-3">
                  <Col md={3}><Form.Label>Min Price (₦)</Form.Label><Form.Control type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} /></Col>
                  <Col md={3}><Form.Label>Max Price (₦)</Form.Label><Form.Control type="number" placeholder="100000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} /></Col>
                  <Col md={3} className="d-flex align-items-end"><Form.Check type="checkbox" label="In Stock Only" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} /></Col>
                  <Col md={3} className="d-flex align-items-end"><Button variant="link" onClick={clearFilters} className="p-0">Clear All Filters</Button></Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {productsLoading ? (
            <Row className="g-4">{[...Array(8)].map((_, i) => <Col key={i} xs={6} md={4} lg={3}><ProductCardSkeleton /></Col>)}</Row>
          ) : apiError ? (
            <div className="text-center py-5">
              <FaExclamationTriangle size={50} className="text-warning mb-3" />
              <h5>Unable to load products</h5>
              <p className="text-muted">Check your connection and try again.</p>
              <Button className="btn-primary-gradient" onClick={() => loadProducts(true)}><FaSync className="me-2" /> Retry</Button>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-5">
              <FaExclamationTriangle size={50} className="text-muted mb-3" />
              <h5>No products found</h5>
              <p className="text-muted">{filters.category !== 'all' ? `No products in ${selectedCategoryName}.` : 'Check back later.'}</p>
              {filters.category !== 'all' && <Button className="btn-primary-gradient" onClick={clearCategoryFilter}>Browse All Products</Button>}
            </div>
          ) : (
            <>
              <Row className="g-4">
                {currentProducts.map((product, idx) => (
                  <Col key={product.id} xs={6} md={4} lg={3}>
                    <Motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} viewport={{ once: true }}>
                      <Card className="border-0 shadow-sm h-100 product-card">
                        <div className="position-relative">
                          <Link to={`/product/${product.id}`}>
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="card-img-top" style={{ height: '200px', objectFit: 'cover', backgroundColor: '#f1f3f5' }}
                                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                            ) : (
                              <div className="card-img-top bg-light" role="img" aria-label={`${product.name} image unavailable`} style={{ height: '200px' }} />
                            )}
                          </Link>
                          {product.discount > 0 && <Badge className="badge-discount position-absolute top-0 start-0 m-2">-{product.discount}%</Badge>}
                          {product.stock_quantity <= 0 && <Badge bg="dark" className="position-absolute top-0 end-0 m-2">Out of Stock</Badge>}
                          <Button
                            variant="light"
                            className="wishlist-btn position-absolute top-0 end-0 m-2"
                            onClick={() => toggleWishlist(product.id)}
                            aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <FaHeart color={wishlist.includes(product.id) ? '#ef476f' : '#adb5bd'} />
                          </Button>
                        </div>
                        <Card.Body>
                          <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                            <Card.Title className="h6 mb-2">{product.name}</Card.Title>
                          </Link>
                          <div className="d-flex align-items-center mb-2">
                            <div className="d-flex text-warning me-2">{[...Array(5)].map((_, i) => <FaStar key={i} size={12} className={i < Math.floor(product.rating || 0) ? 'text-warning' : 'text-secondary'} />)}</div>
                            <small className="text-muted">({product.review_count || 0})</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="h6 fw-bold text-primary">{formatCurrency(product.price)}</span>
                              {product.originalPrice && <small className="text-muted text-decoration-line-through ms-2">{formatCurrency(product.originalPrice)}</small>}
                            </div>
                            <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>{product.stock_quantity > 0 ? 'In Stock' : 'Out'}</Badge>
                          </div>
                          <Button className="btn-primary-gradient w-100 mt-3 btn-sm" onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0}>
                            <FaShoppingCart className="me-2" /> Add to Cart
                          </Button>
                        </Card.Body>
                      </Card>
                    </Motion.div>
                  </Col>
                ))}
              </Row>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Button variant="outline-primary" className="mx-1" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <Button key={pageNum} className={pageNum === currentPage ? 'btn-primary-gradient mx-1' : 'mx-1'} variant={pageNum === currentPage ? undefined : 'outline-primary'} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="outline-primary" className="mx-1" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════ */}
      <section className="py-5 bg-light">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-gold mb-3">Why DoorMart</Badge>
              <h2 className="display-5 fw-bold">Everything You Need to Shop with Confidence</h2>
              <p className="lead text-muted">Your New and Fairly Used Products at Your Door Step.</p>
            </div>
          </Motion.div>
          <Row className="g-4">
            {FEATURES.map((f, i) => (
              <Col key={i} md={6} lg={4}>
                <Motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                  <Card className={`border-0 shadow-sm h-100 feature-card feature-${f.color}`}>
                    <Card.Body className="p-4">
                      <div className={`feature-icon feature-icon-${f.color}`}><f.icon size={26} /></div>
                      <h5 className="fw-bold mb-2 mt-3">{f.title}</h5>
                      <p className="text-muted mb-0">{f.desc}</p>
                    </Card.Body>
                  </Card>
                </Motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-5">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-blue mb-3">How It Works</Badge>
              <h2 className="display-5 fw-bold">Shopping Made Effortless</h2>
              <p className="lead text-muted">Four simple steps to get what you love</p>
            </div>
          </Motion.div>
          <Row className="g-4 align-items-stretch">
            {STEPS.map((s, i) => (
              <Col key={i} xs={6} lg={3}>
                <Motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="h-100">
                  <div className={`step-card step-${s.color}`}>
                    <div className={`step-num step-num-${s.color}`}>{s.num}</div>
                    <div className={`step-icon step-icon-${s.color}`}><s.icon size={24} /></div>
                    <h6 className="fw-bold mt-3 mb-1">{s.title}</h6>
                    <small className="text-muted">{s.desc}</small>
                  </div>
                </Motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          TRUSTED STORES
      ═══════════════════════════════════════ */}
      <section id="vendors" className="py-5 bg-light">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-green mb-3"><FaCrown className="me-1" /> Top Vendors</Badge>
              <h2 className="display-5 fw-bold">Trusted Stores You'll Love</h2>
              <p className="lead text-muted">Explore stores from approved DoorMart vendors</p>
            </div>
          </Motion.div>
          {!isAuthenticated ? (
            <div className="text-center py-4">
              <p className="text-muted">Sign in or create an account to browse approved vendor stores.</p>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/login')}>Sign In</Button>
                <Button className="btn-primary-gradient" onClick={() => navigate('/register')}>Register</Button>
              </div>
            </div>
          ) : storesError ? (
            <Alert variant="warning" className="text-center">
              Stores are temporarily unavailable.
              <Button variant="link" onClick={loadStores}>Try again</Button>
            </Alert>
          ) : stores.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Approved stores will appear here when vendors are approved.</p>
              <Button as={Link} to="/stores" variant="outline-primary">Browse Stores</Button>
            </div>
          ) : (
            <div className="vendors-horizontal">
              {stores.map((store, index) => (
                <Motion.div key={store.id} whileHover={{ y: -6 }} className="vendor-card-wrap">
                  <Card className="border-0 shadow-sm h-100 vendor-card">
                    <Card.Body className="text-center p-4">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`${store.name} logo`}
                          className="vendor-avatar"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className={`vendor-avatar vendor-avatar-${['blue', 'gold', 'green'][index % 3]}`}>
                          {store.name?.charAt(0)?.toUpperCase() || <FaStore />}
                        </div>
                      )}
                      <h6 className="fw-bold mt-3 mb-1">{store.name}</h6>
                      {store.location && <Badge bg="light" text="dark" className="mb-2">{store.location}</Badge>}
                      <div className="d-flex justify-content-center align-items-center mb-2">
                        <FaStar className="text-warning me-1" size={12} />
                        <small className="fw-bold">
                          {Number(store.rating) > 0 ? Number(store.rating).toFixed(1) : 'New'}
                        </small>
                        <small className="text-muted ms-2">({store.product_count} products)</small>
                      </div>
                      <Button as={Link} to={`/store/${store.slug || store.id}`} className="btn-primary-gradient btn-sm w-100">
                        Visit Store
                      </Button>
                    </Card.Body>
                  </Card>
                </Motion.div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          APP PROMO
      ═══════════════════════════════════════ */}
      <section className="py-5 app-promo-section">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={6}>
              <Badge className="section-badge section-badge-gold mb-3"><FaMobileAlt className="me-1" /> Mobile Shopping</Badge>
              <h2 className="display-5 fw-bold mb-3">Shop DoorMart on the Go</h2>
              <p className="lead text-muted mb-4">Shop from your mobile browser, review your orders, and check out securely wherever you are.</p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <div className="app-benefit"><FaCheckCircle className="text-success me-2" /> Browse on mobile</div>
                <div className="app-benefit"><FaCheckCircle className="text-success me-2" /> Review your orders</div>
                <div className="app-benefit"><FaCheckCircle className="text-success me-2" /> Secure checkout</div>
              </div>
              <div className="d-flex gap-3">
                <Button className="app-store-btn" size="lg" onClick={() => toast('The DoorMart mobile app is coming soon. You can shop on the website.')}>
                <FaApple size={24} className="me-2" /> App Store — Coming Soon
                </Button>
                <Button className="app-store-btn" size="lg" onClick={() => toast('The DoorMart mobile app is coming soon. You can shop on the website.')}>
                <FaGooglePlay size={22} className="me-2" /> Google Play — Coming Soon
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <FaMobileAlt size={64} className="text-primary mb-3" />
                  <h5 className="fw-bold">DoorMart</h5>
                  <p className="text-muted small mb-0">Shop from your mobile browser.</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS (swipe carousel)
      ═══════════════════════════════════════ */}
      <section id="testimonials" className="py-5 bg-light">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-blue mb-3"><FaComments className="me-1" /> Customer Reviews</Badge>
              <h2 className="display-5 fw-bold">What Our Customers Say</h2>
              <p className="lead text-muted">Real reviews from real shoppers</p>
            </div>
          </Motion.div>
          {reviewsError ? (
            <Alert variant="warning" className="text-center">Reviews are temporarily unavailable.</Alert>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted">Customer reviews will appear here soon.</p>
          ) : (
            <div className="testimonials-horizontal">
              {reviews.map((review, idx) => (
                <Motion.div key={review.id || idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} viewport={{ once: true }} className="testimonial-wrap">
                  <Card className="border-0 shadow-sm h-100 testimonial-card">
                    <Card.Body className="p-4">
                      <FaQuoteLeft className="text-primary opacity-25 mb-2" size={28} />
                      <p className="text-muted mb-3">"{review.comment}"</p>
                      <div className="d-flex text-warning mb-3">
                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Number(review.rating) ? 'text-warning' : 'text-secondary'} />)}
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '48px', height: '48px' }}>
                          {review.user_name?.charAt(0)?.toUpperCase() || <FaUser />}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{review.user_name}</h6>
                          <small className="text-muted">{review.product_name ? `Reviewed ${review.product_name}` : 'Customer review'}</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Motion.div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          BLOG
      ═══════════════════════════════════════ */}
      <section id="blog" className="py-5">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-gold mb-3"><FaBookOpen className="me-1" /> From the Blog</Badge>
              <h2 className="display-5 fw-bold">Stories, Tips & Updates</h2>
              <p className="lead text-muted">Fresh reads from the DoorMart team</p>
            </div>
          </Motion.div>
          <div className="text-center py-4">
            <p className="text-muted">There are no published stories yet.</p>
            <Button as={Link} to="/blog" variant="outline-primary">
              Visit the Blog <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section className="py-5 bg-light">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="section-heading text-center mb-5">
              <Badge className="section-badge section-badge-blue mb-3"><FaQuestionCircle className="me-1" /> FAQ</Badge>
              <h2 className="display-5 fw-bold">Frequently Asked Questions</h2>
              <p className="lead text-muted">Everything you need to know</p>
            </div>
          </Motion.div>
          <Row className="justify-content-center">
            <Col lg={9}>
              <Accordion defaultActiveKey="0" flush className="faq-accordion">
                {FAQS.map((f, i) => (
                  <Accordion.Item eventKey={String(i)} key={i} className="mb-2 border-0 rounded-3 shadow-sm overflow-hidden">
                    <Accordion.Header><strong>{f.q}</strong></Accordion.Header>
                    <Accordion.Body className="text-muted">{f.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════ */}
      <section className="py-5 newsletter-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center text-white">
              <FaPaperPlane size={40} className="mb-3 opacity-75" />
              <h2 className="display-6 fw-bold mb-3">Never Miss a Deal</h2>
              <p className="lead mb-4 opacity-90">Subscribe for exclusive offers, early access to sales, and new product alerts.</p>
              {newsletterSubscribed ? (
                <Alert variant="success" className="rounded-pill"><FaCheckCircle className="me-2" /> Thank you for subscribing!</Alert>
              ) : (
                <>
                  {newsletterError && <Alert variant="danger" className="text-start">{newsletterError}</Alert>}
                  <Form onSubmit={handleNewsletterSubmit} className="d-flex gap-2 justify-content-center flex-wrap">
                    <Form.Control
                      type="email" placeholder="Enter your email" value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="py-3 px-4" style={{ maxWidth: '420px', borderRadius: '50px' }}
                      required disabled={newsletterLoading}
                    />
                    <Button type="submit" variant="light" className="px-5 py-3 fw-bold" style={{ borderRadius: '50px' }} disabled={newsletterLoading}>
                      {newsletterLoading ? <Spinner animation="border" size="sm" className="me-2" /> : <FaPaperPlane className="me-2" />}
                      {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </Form>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="py-5 cta-section">
        <Container>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="cta-banner text-center">
              <h2 className="display-5 fw-bold mb-3 text-white">Ready to Start Shopping?</h2>
              <p className="lead text-white-50 mb-4">Create your account and start exploring DoorMart today.</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button className="btn-gold" size="lg" onClick={() => navigate('/register')}>Get Started <FaArrowRight className="ms-2" /></Button>
                <Button variant="outline-light" size="lg" onClick={() => navigate('/login')}>Sign In</Button>
              </div>
            </div>
          </Motion.div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="dm-footer pt-5 pb-3">
        <Container>
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <div className="d-flex align-items-center mb-3">
                <div className="brand-badge me-2"><FaStore size={20} /></div>
                <h5 className="mb-0 text-white">Door<span className="text-gold">Mart</span></h5>
              </div>
              <p className="text-white-50 mb-3">Your one‑stop destination for quality products at great prices.</p>
              <div className="d-flex gap-3">
                <Button type="button" variant="link" aria-label="DoorMart Facebook profile" className="footer-social p-0" onClick={() => toast('DoorMart social profiles are not available yet.')}><FaFacebook size={18} /></Button>
                <Button type="button" variant="link" aria-label="DoorMart Twitter profile" className="footer-social p-0" onClick={() => toast('DoorMart social profiles are not available yet.')}><FaTwitter size={18} /></Button>
                <Button type="button" variant="link" aria-label="DoorMart Instagram profile" className="footer-social p-0" onClick={() => toast('DoorMart social profiles are not available yet.')}><FaInstagram size={18} /></Button>
                <Button type="button" variant="link" aria-label="DoorMart LinkedIn profile" className="footer-social p-0" onClick={() => toast('DoorMart social profiles are not available yet.')}><FaLinkedin size={18} /></Button>
                <Button type="button" variant="link" aria-label="DoorMart YouTube channel" className="footer-social p-0" onClick={() => toast('DoorMart social profiles are not available yet.')}><FaYoutube size={18} /></Button>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3 text-gold">Shop</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#categories" className="footer-link">Categories</a></li>
                <li className="mb-2"><a href="#flash-sale" className="footer-link">Flash Sale</a></li>
                <li className="mb-2"><a href="#products" className="footer-link">All Products</a></li>
                <li className="mb-2"><a href="#vendors" className="footer-link">Vendors</a></li>
              </ul>
            </Col>
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3 text-gold">Company</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/about" className="footer-link">About Us</Link></li>
                <li className="mb-2"><Link to="/faq" className="footer-link">FAQ</Link></li>
                <li className="mb-2"><Link to="/terms" className="footer-link">Terms</Link></li>
              </ul>
            </Col>
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3 text-gold">Support</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/faq" className="footer-link">Help Center</Link></li>
                <li className="mb-2"><Link to="/shipping" className="footer-link">Shipping Info</Link></li>
                <li className="mb-2"><Link to="/track" className="footer-link">Track Order</Link></li>
                <li className="mb-2"><Link to="/buyer-safety" className="footer-link">Safety</Link></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h6 className="fw-bold mb-3 text-gold">Get in Touch</h6>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center text-white-50"><FaHeadset className="me-2 text-gold" /><Link className="footer-link" to="/contact">Contact Support</Link></li>
              </ul>
            </Col>
          </Row>
          <hr className="border-secondary opacity-25" />
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <p className="text-white-50 small mb-0">&copy; {new Date().getFullYear()} DoorMart. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <small className="text-white-50">Your New and Fairly Used Products at Your Door Step <FaHeart className="text-danger" size={11} /> in Owerri, Imo Nigeria.</small>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* ═══════════════════════════════════════
          GLOBAL STYLES
      ═══════════════════════════════════════ */}
      <style>{`
        /* ── Color system ───────────────────── */
        .dm-page {
          --dm-blue: #2563eb;
          --dm-blue-dark: #1e40af;
          --dm-blue-light: #dbeafe;
          --dm-gold: #d4af37;
          --dm-gold-light: #fef3c7;
          --dm-gold-dark: #b8941f;
          --dm-green: #10b981;
          --dm-green-light: #d1fae5;
          --dm-green-dark: #047857;
          --dm-grad-primary: linear-gradient(135deg, #2563eb 0%, #764ba2 100%);
          --dm-grad-gold: linear-gradient(135deg, #d4af37 0%, #f59e0b 100%);
          --dm-grad-green: linear-gradient(135deg, #10b981 0%, #047857 100%);
          --dm-grad-hero: linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #764ba2 100%);
          scroll-behavior: smooth;
        }
        html { scroll-behavior: smooth; }
        .text-gold { color: var(--dm-gold) !important; }
        .text-green { color: var(--dm-green) !important; }
        .btn-primary-gradient {
          background: var(--dm-grad-primary);
          border: none;
          color: #fff;
          font-weight: 600;
          transition: all 0.3s;
        }
        .btn-primary-gradient:hover { filter: brightness(1.1); transform: translateY(-1px); color: #fff; }
        .btn-gold {
          background: var(--dm-grad-gold);
          border: none;
          color: #fff;
          font-weight: 700;
          transition: all 0.3s;
        }
        .btn-gold:hover { filter: brightness(1.1); color: #fff; transform: translateY(-1px); }
        .brand-badge { background: var(--dm-grad-primary); color: #fff; padding: 8px; border-radius: 10px; display: inline-flex; align-items: center; }

        /* ── Top promo ticker (gold→green) ──── */
        .promo-ticker {
          background: linear-gradient(90deg, #d4af37 0%, #10b981 100%);
          color: #fff;
          overflow: hidden;
          padding: 8px 0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .promo-ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: promoScroll 40s linear infinite;
        }
        .promo-ticker:hover .promo-ticker-track { animation-play-state: paused; }
        .promo-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-right: 3rem;
        }
        @keyframes promoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Hero ───────────────────────────── */
        .hero-section {
          background: var(--dm-grad-hero);
          min-height: 620px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.5;
          pointer-events: none;
        }
        .hero-blob-gold { width: 380px; height: 380px; background: var(--dm-gold); top: -100px; right: -80px; }
        .hero-blob-green { width: 320px; height: 320px; background: var(--dm-green); bottom: -100px; left: -80px; }
        .hero-badge {
          background: rgba(255,255,255,0.15) !important;
          color: #fff !important;
          backdrop-filter: blur(10px);
          padding: 8px 18px;
          border-radius: 50px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .hero-search {
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .hero-icon-chip {
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          padding: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .hero-image-wrap {
          position: relative;
          max-width: 560px;
          margin: 0 auto;
        }
        .hero-illustration {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: contain;
          filter: drop-shadow(0 25px 35px rgba(0,0,0,0.2));
          animation: heroImageFloat 6s ease-in-out infinite;
        }
        @keyframes heroImageFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .hero-float-card {
          position: absolute;
          background: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .hero-float-card-1 { top: 20px; left: -20px; }
        .hero-float-card-2 { bottom: 20px; right: -20px; }
        .hero-fallback {
          background: rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 60px 40px;
          color: #fff;
        }
        .shadow-2xl { box-shadow: 0 25px 50px rgba(0,0,0,0.25); }

        /* ── Stats ──────────────────────────── */
        .stats-section { background: #fff; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border-radius: 16px;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .stat-blue { background: var(--dm-blue-light); }
        .stat-blue .stat-icon { background: var(--dm-blue); }
        .stat-gold { background: var(--dm-gold-light); }
        .stat-gold .stat-icon { background: var(--dm-gold); }
        .stat-green { background: var(--dm-green-light); }
        .stat-green .stat-icon { background: var(--dm-green); }

        /* ── Features marquee ───────────────── */
        .features-marquee {
          background: #0f172a;
          color: #fff;
          overflow: hidden;
        }
        .features-marquee-track {
          display: inline-flex;
          white-space: nowrap;
          animation: featuresScroll 35s linear infinite;
        }
        .features-marquee:hover .features-marquee-track { animation-play-state: paused; }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-right: 3rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .marquee-item svg { color: var(--dm-gold); }
        @keyframes featuresScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Section headings & badges ──────── */
        .section-badge {
          padding: 8px 18px;
          border-radius: 50px;
          font-weight: 500;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }
        .section-badge-blue { background: var(--dm-blue) !important; color: #fff !important; }
        .section-badge-gold { background: var(--dm-gold) !important; color: #fff !important; }
        .section-badge-green { background: var(--dm-green) !important; color: #fff !important; }
        .section-heading .display-5 { letter-spacing: -1px; }

        /* ── Categories carousel ────────────── */
        .categories-horizontal {
          display: flex;
          overflow-x: auto;
          scrollbar-width: thin;
          gap: 1.5rem;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
        }
        .categories-horizontal::-webkit-scrollbar { height: 6px; }
        .categories-horizontal::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .categories-horizontal::-webkit-scrollbar-thumb { background: var(--dm-blue); border-radius: 10px; }
        .category-card-horizontal { flex: 0 0 auto; width: 260px; scroll-snap-align: start; }
        .category-img-horizontal { width: 100%; height: 200px; object-fit: cover; transition: transform 0.5s; }
        .category-card-horizontal:hover .category-img-horizontal { transform: scale(1.05); }
        .category-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 1rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          color: #fff;
          border-radius: 0 0 1rem 1rem;
        }

        /* ── Flash sale ─────────────────────── */
        .flash-sale-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
          position: relative;
        }
        .flash-sale-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .flash-badge {
          background: var(--dm-grad-gold) !important;
          color: #fff !important;
          padding: 8px 18px;
          border-radius: 50px;
          font-weight: 600;
        }
        .countdown { display: flex; gap: 10px; }
        .countdown-box {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 14px;
          border-radius: 12px;
          text-align: center;
          min-width: 64px;
          backdrop-filter: blur(10px);
        }
        .countdown-num { display: block; font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1; }
        .countdown-label { display: block; font-size: 0.65rem; color: rgba(255,255,255,0.7); letter-spacing: 1px; margin-top: 4px; }
        .product-card-light { border-radius: 15px; overflow: hidden; transition: transform 0.3s; }
        .product-card-light:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important; }
        .badge-discount { background: var(--dm-grad-gold) !important; color: #fff !important; font-weight: 700; }

        /* ── Products ───────────────────────── */
        .filter-card { border-radius: 15px !important; }
        .product-card {
          border-radius: 15px !important;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .product-card:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }
        .product-card:hover img { transform: scale(1.05); }
        .product-card img { transition: transform 0.5s; }
        .wishlist-btn {
          width: 36px; height: 36px;
          border-radius: 50% !important;
          border: none !important;
          display: flex; align-items: center; justify-content: center;
          padding: 0 !important;
        }

        /* ── Features (Why choose us) ───────── */
        .feature-card { border-radius: 16px !important; transition: transform 0.3s; }
        .feature-card:hover { transform: translateY(-4px); }
        .feature-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
        }
        .feature-icon-blue { background: var(--dm-grad-primary); }
        .feature-icon-gold { background: var(--dm-grad-gold); }
        .feature-icon-green { background: var(--dm-grad-green); }

        /* ── How it works ───────────────────── */
        .step-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px 18px;
          height: 100%;
          position: relative;
          border: 1px solid #e2e8f0;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .step-num {
          position: absolute; top: 12px; right: 16px;
          font-size: 2rem; font-weight: 900; opacity: 0.08;
          line-height: 1;
        }
        .step-num-blue { color: var(--dm-blue); }
        .step-num-gold { color: var(--dm-gold); }
        .step-num-green { color: var(--dm-green); }
        .step-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
        }
        .step-icon-blue { background: var(--dm-grad-primary); }
        .step-icon-gold { background: var(--dm-grad-gold); }
        .step-icon-green { background: var(--dm-grad-green); }

        /* ── Vendors ────────────────────────── */
        .vendors-horizontal {
          display: flex;
          overflow-x: auto;
          gap: 1.5rem;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
          scrollbar-width: thin;
        }
        .vendors-horizontal::-webkit-scrollbar { height: 6px; }
        .vendors-horizontal::-webkit-scrollbar-thumb { background: var(--dm-green); border-radius: 10px; }
        .vendor-card-wrap { flex: 0 0 auto; width: 220px; scroll-snap-align: start; }
        .vendor-card { border-radius: 16px !important; }
        .vendor-avatar {
          width: 64px; height: 64px;
          border-radius: 50%;
          margin: 0 auto;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.5rem; font-weight: 800;
        }
        .vendor-avatar-blue { background: var(--dm-grad-primary); }
        .vendor-avatar-gold { background: var(--dm-grad-gold); }
        .vendor-avatar-green { background: var(--dm-grad-green); }

        /* ── App promo ──────────────────────── */
        .app-promo-section {
          background: linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%);
        }
        .app-benefit {
          background: #fff;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .app-store-btn {
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        .app-store-btn:hover { background: #1e293b; color: #fff; transform: translateY(-2px); }
        .phone-mockup {
          background: #0f172a;
          padding: 18px;
          border-radius: 40px;
          max-width: 280px;
          margin: 0 auto;
          box-shadow: 0 30px 60px rgba(0,0,0,0.25);
        }
        .phone-screen {
          background: #fff;
          border-radius: 28px;
          padding: 50px 20px;
        }

        /* ── Testimonials ───────────────────── */
        .testimonials-horizontal {
          display: flex;
          overflow-x: auto;
          gap: 1.5rem;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
          scrollbar-width: thin;
        }
        .testimonials-horizontal::-webkit-scrollbar { height: 6px; }
        .testimonials-horizontal::-webkit-scrollbar-thumb { background: var(--dm-blue); border-radius: 10px; }
        .testimonial-wrap { flex: 0 0 auto; width: 320px; scroll-snap-align: start; }
        .testimonial-card { border-radius: 16px !important; }

        /* ── Blog ───────────────────────────── */
        .blog-horizontal {
          display: flex;
          overflow-x: auto;
          gap: 1.5rem;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
          scrollbar-width: thin;
        }
        .blog-horizontal::-webkit-scrollbar { height: 6px; }
        .blog-horizontal::-webkit-scrollbar-thumb { background: var(--dm-gold); border-radius: 10px; }
        .blog-card-wrap { flex: 0 0 auto; width: 300px; scroll-snap-align: start; }
        .blog-card { border-radius: 16px !important; overflow: hidden; }

        /* ── FAQ ────────────────────────────── */
        .faq-accordion .accordion-item {
          background: #fff;
          border-radius: 12px !important;
        }
        .faq-accordion .accordion-button {
          background: #fff;
          border: none;
          padding: 18px 22px;
        }
        .faq-accordion .accordion-button:not(.collapsed) {
          background: var(--dm-blue-light);
          color: var(--dm-blue-dark);
          box-shadow: none;
        }
        .faq-accordion .accordion-button:focus { box-shadow: none; border: none; }

        /* ── Newsletter ─────────────────────── */
        .newsletter-section {
          background: var(--dm-grad-primary);
        }

        /* ── CTA banner ─────────────────────── */
        .cta-section { background: #0f172a; }
        .cta-banner {
          background: linear-gradient(135deg, var(--dm-blue) 0%, #764ba2 50%, var(--dm-gold) 100%);
          border-radius: 24px;
          padding: 60px 30px;
        }

        /* ── Footer ─────────────────────────── */
        .dm-footer { background: #0f172a; }
        .footer-link {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--dm-gold); }
        .footer-social {
          color: rgba(255,255,255,0.6);
          transition: all 0.2s;
        }
        .footer-social:hover {
          color: var(--dm-gold);
          transform: translateY(-2px);
        }

        /* ── Responsive ─────────────────────── */
        @media (max-width: 768px) {
          .promo-item { font-size: 0.8rem; margin-right: 1.5rem; }
          .marquee-item { font-size: 0.8rem; margin-right: 1.5rem; }
          .category-card-horizontal { width: 220px; }
          .category-img-horizontal { height: 170px; }
          .hero-section { min-height: auto; padding: 40px 0; }
          .display-3 { font-size: 2.25rem; }
          .countdown-box { min-width: 54px; padding: 8px 10px; }
          .countdown-num { font-size: 1.2rem; }
          .hero-float-card { display: none; }
          .testimonial-wrap, .blog-card-wrap { width: 85vw; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-illustration { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;