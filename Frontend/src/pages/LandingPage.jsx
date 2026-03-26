// frontend/src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Navbar, Nav, Dropdown, Form, Alert, InputGroup, Spinner, Placeholder } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaStore, FaShoppingCart, FaStar, FaHeart, FaFilter, FaSearch, FaUser,
  FaSignInAlt, FaUserPlus, FaShoppingBag, FaCheckCircle, FaArrowRight,
  FaBars, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook,
  FaTwitter, FaInstagram, FaTruck, FaShieldAlt, FaUndo, FaHeadset,
  FaExclamationTriangle, FaSync, FaChevronRight, FaChevronLeft,
  FaFire, FaClock, FaRocket, FaPaperPlane, FaGift, FaTag
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Categories from your database
const CATEGORIES = [
  { id: 1, name: 'Electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', icon: '💻' },
  { id: 2, name: 'Fashion', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', icon: '👕' },
  { id: 3, name: 'Home & Living', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400', icon: '🏠' },
  { id: 4, name: 'Sports', image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400', icon: '⚽' },
  { id: 5, name: 'Beauty', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', icon: '💄' },
  { id: 6, name: 'Books', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', icon: '📚' }
];

// Skeleton Loader Components
const ProductCardSkeleton = () => (
  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px', overflow: 'hidden' }}>
    <Placeholder as="div" animation="glow" style={{ height: '200px', width: '100%' }} />
    <Card.Body>
      <Placeholder as={Card.Title} animation="glow"><Placeholder xs={6} /></Placeholder>
      <Placeholder as={Card.Text} animation="glow"><Placeholder xs={4} /> <Placeholder xs={3} /></Placeholder>
      <Placeholder.Button variant="primary" xs={12} />
    </Card.Body>
  </Card>
);

const CategoryCardSkeleton = () => (
  <div className="bg-light rounded-3" style={{ height: '200px', width: '250px' }} />
);

function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories] = useState(CATEGORIES);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    search: '',
    sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [dealsOfDay, setDealsOfDay] = useState([]);
  const [apiError, setApiError] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('All Products');
  const [searchDebounce, setSearchDebounce] = useState(null);
  const productsPerPage = 8;

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCart();
    loadWishlist();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    setSearchDebounce(timer);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadProducts = async (retry = false) => {
    try {
      if (!retry) setProductsLoading(true);
      setApiError(false);
      console.log('📦 Fetching products from API...');

      const response = await axios.get(`${API_BASE_URL}/products/public`, {
        timeout: 30000,
        headers: { Accept: 'application/json' }
      });

      if (response?.data?.success) {
        const productsData = response.data.products || [];
        setProducts(productsData);
        const deals = productsData.filter(p => p.discount > 0 || p.originalPrice).slice(0, 4);
        setDealsOfDay(deals);
        console.log(`✅ Loaded ${productsData.length} products from API`);
      } else {
        throw new Error('No products found');
      }
    } catch (error) {
      console.error('Failed to load products:', error.message);
      if (!retry) {
        setApiError(true);
      }
      setProducts([]);
      setDealsOfDay([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) { setCart([]); }
  };

  const loadWishlist = () => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { setWishlist([]); }
  };

  const addToCart = (product) => {
    if (!product?.id) return;
    const existingItem = cart.find(item => item.id === product.id);
    const newCart = existingItem
      ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`${product.name} added to cart!`, { icon: '🛒', duration: 3000 });
  };

  const toggleWishlist = (productId) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    toast.success(wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist', { icon: '❤️' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      toast.success('Successfully subscribed to newsletter!');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 3000);
    }
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    setSelectedCategoryName(categoryName);
    setFilters({ ...filters, category: categoryId.toString() });
    setCurrentPage(1);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearCategoryFilter = () => {
    setFilters({ ...filters, category: 'all' });
    setSelectedCategoryName('All Products');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: 'all', minPrice: '', maxPrice: '', inStock: false, search: '', sort: 'newest' });
    setSelectedCategoryName('All Products');
    setCurrentPage(1);
  };

  const filterProducts = () => {
    let filtered = [...products];
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category_id === parseInt(filters.category));
    }
    if (filters.search) {
      filtered = filtered.filter(p => p.name?.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => (p.price || 0) >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => (p.price || 0) <= parseFloat(filters.maxPrice));
    }
    if (filters.inStock) {
      filtered = filtered.filter(p => (p.stock_quantity || 0) > 0);
    }
    switch (filters.sort) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return filtered;
  };

  const filteredProducts = filterProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const getCartCount = () => cart.reduce((total, item) => total + (item.quantity || 0), 0);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '₦0' : `₦${num.toLocaleString()}`;
  };

  const getCategoryProductCount = (categoryId) => products.filter(p => p.category_id === categoryId).length;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar (unchanged) */}
      <Navbar bg="white" expand="lg" className="py-3 shadow-sm sticky-top">
        <Container>
          <Navbar.Brand href="/" className="fw-bold fs-3 d-flex align-items-center">
            <div className="bg-primary text-white p-2 rounded-3 me-2"><FaStore size={20} /></div>
            <span className="text-dark">Market<span className="text-primary">Store</span></span>
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-3 order-lg-2">
            <Button variant="link" className="position-relative text-dark p-0 d-none d-md-block" onClick={() => navigate('/wishlist')}>
              <FaHeart size={20} />
              {wishlist.length > 0 && <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill">{wishlist.length}</Badge>}
            </Button>
            <Button variant="outline-primary" className="position-relative d-flex align-items-center" onClick={() => navigate('/cart')}>
              <FaShoppingCart className="me-2" /><span>Cart</span>
              {getCartCount() > 0 && <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill">{getCartCount()}</Badge>}
            </Button>
            <Button variant="link" className="d-lg-none p-0 text-dark" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </Button>
          </div>

          <Navbar.Collapse className={mobileMenuOpen ? 'show' : ''}>
            <Nav className="mx-auto align-items-center">
              <Nav.Link href="#categories">Categories</Nav.Link>
              <Nav.Link href="#products">Products</Nav.Link>
              <Nav.Link href="#deals">Deals</Nav.Link>
              <Nav.Link href="#testimonials">Testimonials</Nav.Link>
            </Nav>

            <div className="d-flex align-items-center">
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '30px', height: '30px' }}>
                      {user?.full_name?.charAt(0) || <FaUser size={12} />}
                    </div>
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile"><FaUser className="me-2" /> My Profile</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/orders"><FaShoppingBag className="me-2" /> My Orders</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/wishlist"><FaHeart className="me-2" /> Wishlist</Dropdown.Item>
                    {user?.role === 'vendor' && <Dropdown.Item as={Link} to="/vendor/dashboard"><FaStore className="me-2" /> Vendor Dashboard</Dropdown.Item>}
                    {user?.role === 'admin' && <Dropdown.Item as={Link} to="/admin"><FaShieldAlt className="me-2" /> Admin Panel</Dropdown.Item>}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={() => navigate('/login')}><FaSignInAlt className="me-2" /> Sign In</Button>
                  <Button variant="primary" onClick={() => navigate('/register')}><FaUserPlus className="me-2" /> Register</Button>
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section (unchanged) */}
      <section className="py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '600px', display: 'flex', alignItems: 'center' }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Row className="align-items-center">
              <Col lg={6} className="mb-5 mb-lg-0 text-white">
                <Badge bg="light" text="dark" className="mb-4 px-3 py-2 rounded-pill"><FaRocket className="me-2" /> Trusted by 50,000+ shoppers</Badge>
                <h1 className="display-3 fw-bold mb-4">Discover Amazing <span className="text-warning">Products</span><br />at Unbeatable Prices</h1>
                <p className="lead mb-4">Shop from our curated collection of quality products. Free shipping on orders over ₦50,000.</p>
                <div className="bg-white rounded-pill p-2 mb-4" style={{ maxWidth: '500px' }}>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-0"><FaSearch className="text-primary" /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search for products..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value, category: 'all' })}
                      className="border-0 shadow-none"
                    />
                    <Button variant="primary" className="rounded-pill px-4">Search</Button>
                  </InputGroup>
                </div>
                <div className="d-flex gap-4">
                  <div className="d-flex align-items-center"><div className="bg-white bg-opacity-20 rounded-circle p-2 me-2"><FaTruck size={20} /></div><small>Free Shipping</small></div>
                  <div className="d-flex align-items-center"><div className="bg-white bg-opacity-20 rounded-circle p-2 me-2"><FaShieldAlt size={20} /></div><small>Secure Payment</small></div>
                  <div className="d-flex align-items-center"><div className="bg-white bg-opacity-20 rounded-circle p-2 me-2"><FaUndo size={20} /></div><small>30 Days Return</small></div>
                </div>
              </Col>
              <Col lg={6}>
                <motion.img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800"
                  alt="Shopping"
                  className="img-fluid rounded-4 shadow-xl"
                  style={{ maxHeight: '500px', objectFit: 'cover', width: '100%' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Features Section with Horizontal Scroll on Mobile */}
<section className="py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f6 100%)' }}>
  <Container fluid className="px-3">
    <div className="horizontal-scroll-features d-flex gap-3 justify-content-start justify-content-lg-center">
      {/* Free Shipping */}
      <div className="feature-card text-center p-3 rounded-5 position-relative overflow-hidden shipping-card" style={{ minWidth: '150px', flex: '0 0 auto' }}>
        <div className="feature-image position-absolute top-0 start-0 w-100 h-100" style={{ backgroundImage: 'url(https://images.pexels.com/photos/109244/pexels-photo-109244.jpeg?auto=compress&cs=tinysrgb&w=400)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }}></div>
        <div className="position-relative">
          <div className="icon-wrapper bg-white bg-opacity-90 rounded-circle d-inline-flex p-2 mb-2 shadow-sm transition-all">
            <FaTruck size={20} className="transition-all" />
          </div>
          <h6 className="fw-bold mb-1 transition-all">Free Shipping</h6>
          <p className="text-muted small mb-0 transition-all">₦50k+</p>
        </div>
      </div>

      {/* Easy Returns */}
      <div className="feature-card text-center p-3 rounded-5 position-relative overflow-hidden returns-card" style={{ minWidth: '150px', flex: '0 0 auto' }}>
        <div className="feature-image position-absolute top-0 start-0 w-100 h-100" style={{ backgroundImage: 'url(https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=400)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }}></div>
        <div className="position-relative">
          <div className="icon-wrapper bg-white bg-opacity-90 rounded-circle d-inline-flex p-2 mb-2 shadow-sm transition-all">
            <FaUndo size={20} className="transition-all" />
          </div>
          <h6 className="fw-bold mb-1 transition-all">Easy Returns</h6>
          <p className="text-muted small mb-0 transition-all">30 days</p>
        </div>
      </div>

      {/* Secure Payment */}
      <div className="feature-card text-center p-3 rounded-5 position-relative overflow-hidden payment-card" style={{ minWidth: '150px', flex: '0 0 auto' }}>
        <div className="feature-image position-absolute top-0 start-0 w-100 h-100" style={{ backgroundImage: 'url(https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=400)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }}></div>
        <div className="position-relative">
          <div className="icon-wrapper bg-white bg-opacity-90 rounded-circle d-inline-flex p-2 mb-2 shadow-sm transition-all">
            <FaShieldAlt size={20} className="transition-all" />
          </div>
          <h6 className="fw-bold mb-1 transition-all">Secure Payment</h6>
          <p className="text-muted small mb-0 transition-all">100% secure</p>
        </div>
      </div>

      {/* 24/7 Support */}
      <div className="feature-card text-center p-3 rounded-5 position-relative overflow-hidden support-card" style={{ minWidth: '150px', flex: '0 0 auto' }}>
        <div className="feature-image position-absolute top-0 start-0 w-100 h-100" style={{ backgroundImage: 'url(https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }}></div>
        <div className="position-relative">
          <div className="icon-wrapper bg-white bg-opacity-90 rounded-circle d-inline-flex p-2 mb-2 shadow-sm transition-all">
            <FaHeadset size={20} className="transition-all" />
          </div>
          <h6 className="fw-bold mb-1 transition-all">24/7 Support</h6>
          <p className="text-muted small mb-0 transition-all">Always here</p>
        </div>
      </div>
    </div>
  </Container>
</section>

      {/* Categories Section – Horizontal Scroll */}
      <section id="categories" className="py-5">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="text-center mb-5">
              <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">Shop by Category</Badge>
              <h2 className="display-5 fw-bold">Popular Categories</h2>
              <p className="lead text-muted">Scroll sideways to explore</p>
            </div>
          </motion.div>

          <div className="horizontal-scroll-wrapper">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="category-card-wrapper"
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleCategoryClick(category.id, category.name)}
                style={{ cursor: 'pointer' }}
              >
                <Card
                  className={`border-0 shadow-sm category-card h-100 overflow-hidden ${filters.category === category.id.toString() ? 'border-primary border-2' : ''}`}
                  style={{ borderRadius: '15px', width: '250px' }}
                >
                  <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                    <Card.Img
                      variant="top"
                      src={category.image_url}
                      alt={category.name}
                      className="category-img"
                      style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    />
                    <div className="position-absolute bottom-0 start-0 p-4 text-white w-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0 fw-bold">{category.name}</h5>
                        <span className="fs-4">{category.icon}</span>
                      </div>
                      <div className="d-flex align-items-center mt-2">
                        <small>{getCategoryProductCount(category.id)} products</small>
                        <FaChevronRight className="ms-2" size={12} />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Deals of the Day (unchanged, but responsive columns already applied) */}
      {dealsOfDay.length > 0 && (
        <section id="deals" className="py-5 bg-light">
          <Container>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className="text-center mb-5">
                <Badge bg="danger" className="mb-3 px-3 py-2 rounded-pill"><FaFire className="me-2" /> Limited Time Offers</Badge>
                <h2 className="display-5 fw-bold">Deals of the Day</h2>
                <p className="lead text-muted">Grab them before they're gone</p>
              </div>
            </motion.div>
            <Row className="g-4">
              {dealsOfDay.slice(0, 4).map((product, idx) => (
                <Col key={product.id} xs={6} md={4} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                      <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                        <div className="position-relative">
                          {product.discount > 0 && <Badge bg="danger" className="position-absolute top-0 start-0 m-3">-{product.discount}%</Badge>}
                          <img src={product.image_url} alt={product.name} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />
                        </div>
                        <Card.Body>
                          <h6 className="mb-0 text-truncate">{product.name}</h6>
                          <div className="d-flex align-items-center mb-2">
                            <div className="d-flex text-warning">
                              {[...Array(5)].map((_, i) => <FaStar key={i} size={12} className={i < Math.floor(product.rating || 0) ? 'text-warning' : 'text-secondary'} />)}
                            </div>
                            <small className="text-muted ms-2">({product.reviews || 0})</small>
                          </div>
                          <div className="d-flex align-items-center mb-3">
                            <span className="h5 fw-bold text-primary mb-0">{formatCurrency(product.price)}</span>
                            {product.originalPrice && <small className="text-muted text-decoration-line-through ms-2">{formatCurrency(product.originalPrice)}</small>}
                          </div>
                          <Button variant="primary" size="sm" className="w-100" onClick={() => addToCart(product)} disabled={product.stock_quantity <= 0}>
                            <FaShoppingCart className="me-2" /> Add to Cart
                          </Button>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Products Section – Responsive grid (2 columns on mobile) */}
      <section id="products" className="py-5">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="text-center mb-5">
              <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">Our Products</Badge>
              <h2 className="display-5 fw-bold">{selectedCategoryName}</h2>
              <p className="lead text-muted">
                {filters.category !== 'all'
                  ? `Browse our collection of ${selectedCategoryName.toLowerCase()} products`
                  : 'Discover our curated collection of products'}
              </p>
              {filters.category !== 'all' && (
                <Button variant="link" onClick={clearCategoryFilter} className="mt-2">
                  Clear Category Filter <FaTimes className="ms-1" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Filters (unchanged) */}
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <Row className="align-items-center g-3">
                <Col lg={4}>
                  <InputGroup>
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
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
                  <div className="text-muted text-center bg-light py-2 rounded-pill">
                    {filteredProducts.length} products found
                  </div>
                </Col>
              </Row>

              {showFilters && (
                <Row className="mt-3 pt-3 border-top">
                  <Col md={3}>
                    <Form.Label>Min Price (₦)</Form.Label>
                    <Form.Control type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Max Price (₦)</Form.Label>
                    <Form.Control type="number" placeholder="100000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Form.Check type="checkbox" label="In Stock Only" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} />
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button variant="link" onClick={clearFilters} className="p-0">Clear All Filters</Button>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Products Grid */}
          {productsLoading ? (
            <Row className="g-4">
              {[...Array(8)].map((_, i) => (
                <Col key={i} xs={6} md={4} lg={3}>
                  <ProductCardSkeleton />
                </Col>
              ))}
            </Row>
          ) : apiError ? (
            <div className="text-center py-5">
              <FaExclamationTriangle size={50} className="text-warning mb-3" />
              <h5>Unable to load products</h5>
              <p className="text-muted">Please check your internet connection and try again.</p>
              <Button variant="primary" onClick={() => loadProducts(true)}>
                <FaSync className="me-2" /> Retry
              </Button>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-5">
              <FaExclamationTriangle size={50} className="text-muted mb-3" />
              <h5>No products found</h5>
              <p className="text-muted">
                {filters.category !== 'all'
                  ? `No products available in ${selectedCategoryName} category. Try another category.`
                  : 'No products available at the moment. Please check back later.'}
              </p>
              {filters.category !== 'all' && (
                <Button variant="primary" onClick={clearCategoryFilter}>Browse All Products</Button>
              )}
            </div>
          ) : (
            <>
              <Row className="g-4">
                {currentProducts.map((product, idx) => (
                  <Col key={product.id} xs={6} md={4} lg={3}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                        <Card className="border-0 shadow-sm h-100 product-card" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                          <div className="position-relative">
                            <Link to={`/product/${product.id}`}>
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover', width: '100%', transition: 'transform 0.5s' }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                              />
                            </Link>
                            {product.discount > 0 && <Badge bg="danger" className="position-absolute top-0 start-0 m-2">-{product.discount}%</Badge>}
                            {product.stock_quantity <= 0 && <Badge bg="dark" className="position-absolute top-0 end-0 m-2">Out of Stock</Badge>}
                            <Button
                              variant="light"
                              className="position-absolute top-0 end-0 m-2 rounded-circle p-2 border-0"
                              style={{ width: '35px', height: '35px' }}
                              onClick={() => toggleWishlist(product.id)}
                            >
                              <FaHeart color={wishlist.includes(product.id) ? '#ef476f' : '#adb5bd'} />
                            </Button>
                          </div>
                          <Card.Body>
                            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                              <Card.Title className="h6 mb-2">{product.name}</Card.Title>
                            </Link>
                            <div className="d-flex align-items-center mb-2">
                              <div className="d-flex text-warning me-2">
                                {[...Array(5)].map((_, i) => <FaStar key={i} size={12} className={i < Math.floor(product.rating || 0) ? 'text-warning' : 'text-secondary'} />)}
                              </div>
                              <small className="text-muted">({product.reviews || 0})</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="h6 fw-bold text-primary">{formatCurrency(product.price)}</span>
                                {product.originalPrice && <small className="text-muted text-decoration-line-through ms-2">{formatCurrency(product.originalPrice)}</small>}
                              </div>
                              <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>{product.stock_quantity > 0 ? 'In Stock' : 'Out'}</Badge>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-100 mt-3"
                              onClick={() => addToCart(product)}
                              disabled={product.stock_quantity <= 0}
                            >
                              <FaShoppingCart className="me-2" /> Add to Cart
                            </Button>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              {/* Pagination (unchanged) */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Button variant="outline-primary" className="mx-1" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'primary' : 'outline-primary'}
                        className="mx-1"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="outline-primary" className="mx-1" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* Testimonials (unchanged) */}
      <section id="testimonials" className="py-5 bg-light">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="text-center mb-5">
              <Badge bg="info" className="mb-3 px-3 py-2 rounded-pill text-white">Testimonials</Badge>
              <h2 className="display-5 fw-bold">What Our Customers Say</h2>
              <p className="lead text-muted">Trusted by thousands of happy shoppers</p>
            </div>
          </motion.div>
          <Row className="g-4">
            {[
              { id: 1, name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, comment: 'Excellent quality products and fast shipping!', role: 'Verified Buyer' },
              { id: 2, name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, comment: 'I love shopping here. The prices are competitive.', role: 'Frequent Shopper' },
              { id: 3, name: 'Amara Okafor', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4, comment: 'Great marketplace with trusted vendors.', role: 'Verified Buyer' }
            ].map((t, idx) => (
              <Col key={t.id} lg={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <img src={t.avatar} alt={t.name} className="rounded-circle me-3" style={{ width: '50px', height: '50px' }} />
                        <div><h6 className="mb-1">{t.name}</h6><small className="text-muted">{t.role}</small></div>
                      </div>
                      <div className="d-flex text-warning mb-3">
                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < t.rating ? 'text-warning' : 'text-secondary'} />)}
                      </div>
                      <p className="text-muted mb-0">"{t.comment}"</p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Newsletter (unchanged) */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center text-white">
              <h2 className="display-6 fw-bold mb-3">Subscribe to Our Newsletter</h2>
              <p className="lead mb-4">Get the latest updates on new products and upcoming sales</p>
              {newsletterSubscribed ? (
                <Alert variant="success" className="rounded-pill"><FaCheckCircle className="me-2" /> Thank you for subscribing!</Alert>
              ) : (
                <Form onSubmit={handleNewsletterSubmit} className="d-flex gap-2 justify-content-center">
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="py-3 px-4"
                    style={{ maxWidth: '400px', borderRadius: '50px' }}
                    required
                  />
                  <Button type="submit" variant="light" className="px-5" style={{ borderRadius: '50px' }}>
                    <FaPaperPlane className="me-2" /> Subscribe
                  </Button>
                </Form>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer (unchanged) */}
      <footer className="bg-dark text-white pt-5 pb-3">
        <Container>
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white p-2 rounded-3 me-2"><FaStore size={20} /></div>
                <h5 className="mb-0">Market<span className="text-primary">Store</span></h5>
              </div>
              <p className="text-white-50 mb-3">Your one-stop destination for quality products at great prices.</p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white-50"><FaFacebook size={20} /></a>
                <a href="#" className="text-white-50"><FaTwitter size={20} /></a>
                <a href="#" className="text-white-50"><FaInstagram size={20} /></a>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/about" className="text-white-50 text-decoration-none">About Us</Link></li>
                <li className="mb-2"><Link to="/contact" className="text-white-50 text-decoration-none">Contact Us</Link></li>
                <li className="mb-2"><Link to="/faq" className="text-white-50 text-decoration-none">FAQ</Link></li>
                <li className="mb-2"><Link to="/terms" className="text-white-50 text-decoration-none">Terms & Conditions</Link></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h6 className="fw-bold mb-3">Customer Service</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/help" className="text-white-50 text-decoration-none">Help Center</Link></li>
                <li className="mb-2"><Link to="/returns" className="text-white-50 text-decoration-none">Returns & Refunds</Link></li>
                <li className="mb-2"><Link to="/shipping" className="text-white-50 text-decoration-none">Shipping Info</Link></li>
                <li className="mb-2"><Link to="/track" className="text-white-50 text-decoration-none">Track Order</Link></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h6 className="fw-bold mb-3">Contact Info</h6>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center"><FaMapMarkerAlt className="me-2 text-primary" /> Lagos, Nigeria</li>
                <li className="mb-2 d-flex align-items-center"><FaPhone className="me-2 text-primary" /> +234 801 234 5678</li>
                <li className="mb-2 d-flex align-items-center"><FaEnvelope className="me-2 text-primary" /> support@marketstore.com</li>
              </ul>
            </Col>
          </Row>
          <hr className="border-secondary" />
          <div className="text-center">
            <p className="text-white-50 small mb-0">&copy; {new Date().getFullYear()} MarketStore. All rights reserved.</p>
          </div>
        </Container>
      </footer>

      <style>{`
        .category-card:hover .category-img {
          transform: scale(1.05);
        }
        .product-card:hover img {
          transform: scale(1.05);
        }
        .category-card, .product-card {
          transition: all 0.3s ease;
        }
        .category-card:hover, .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        .border-primary {
          border-color: #667eea !important;
        }
        .shadow-xl {
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        /* Horizontal scroll styles for categories */
        .horizontal-scroll-wrapper {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          gap: 1rem;
          padding-bottom: 1rem;
        }
        .horizontal-scroll-wrapper::-webkit-scrollbar {
          height: 6px;
        }
        .horizontal-scroll-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .horizontal-scroll-wrapper::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .horizontal-scroll-wrapper::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .category-card-wrapper {
          flex-shrink: 0;
        }
          .horizontal-scroll-features {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding-bottom: 0.2rem;
}
.horizontal-scroll-features::-webkit-scrollbar {
  height: 4px;
}
.horizontal-scroll-features::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.horizontal-scroll-features::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}
  
.feature-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.15);
}

/* Individual card hover colours */
.shipping-card:hover {
  background: rgba(52, 144, 220, 0.2);
  border-color: #3490dc;
}
.shipping-card:hover .icon-wrapper {
  background: #3490dc !important;
  transform: scale(1.05);
}
.shipping-card:hover .icon-wrapper svg {
  color: white !important;
}
.shipping-card:hover h6,
.shipping-card:hover p {
  color: #1e40af;
}

.returns-card:hover {
  background: rgba(56, 161, 105, 0.2);
  border-color: #38a169;
}
.returns-card:hover .icon-wrapper {
  background: #38a169 !important;
  transform: scale(1.05);
}
.returns-card:hover .icon-wrapper svg {
  color: white !important;
}
.returns-card:hover h6,
.returns-card:hover p {
  color: #2f855a;
}

.payment-card:hover {
  background: rgba(66, 153, 225, 0.2);
  border-color: #4299e1;
}
.payment-card:hover .icon-wrapper {
  background: #4299e1 !important;
  transform: scale(1.05);
}
.payment-card:hover .icon-wrapper svg {
  color: white !important;
}
.payment-card:hover h6,
.payment-card:hover p {
  color: #2c5282;
}

.support-card:hover {
  background: rgba(237, 137, 54, 0.2);
  border-color: #ed8936;
}
.support-card:hover .icon-wrapper {
  background: #ed8936 !important;
  transform: scale(1.05);
}
.support-card:hover .icon-wrapper svg {
  color: white !important;
}
.support-card:hover h6,
.support-card:hover p {
  color: #c05621;
}

.transition-all {
  transition: all 0.3s ease;
}
.icon-wrapper {
  transition: all 0.3s ease;
}
.feature-image {
  z-index: 0;
}
.feature-card > div {
  z-index: 1;
}
      `}</style>
    </div>
  );
}

export default LandingPage;