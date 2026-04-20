import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, InputGroup, Dropdown, Pagination } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaStar, 
  FaShoppingCart, 
  FaHeart, 
  FaWhatsapp,
  FaFilter,
  FaSearch,
  FaSort,
  FaList,
  FaThLarge,
  FaEye,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaCheck,
  FaTruck,
  FaUndo
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

function CategoryProducts() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [hasLoaded, setHasLoaded] = useState(false); // track first fetch
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('popular');
  const [sortOrder, setSortOrder] = useState('desc');
  const productsPerPage = 12;

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    brands: [],
    ratings: null,
    inStock: false,
    onSale: false,
    search: ''
  });

  // Available brands (will be populated from products)
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    fetchCategoryAndProducts();
    loadCart();
    loadWishlist();
  }, [categoryId]);

  useEffect(() => {
    applyFilters();
  }, [products, filters, sortBy, sortOrder]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category details
      const categoryRes = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
      setCategory(categoryRes.data);

      // Fetch products for this category
      const productsRes = await axios.get(`http://localhost:5000/api/categories/${categoryId}/products`);
      const productsData = productsRes.data;
      setProducts(productsData);
      setFilteredProducts(productsData);

      // Extract unique brands
      const brands = [...new Set(productsData.map(p => p.brand).filter(Boolean))];
      setAvailableBrands(brands);

    } catch (error) {
      console.error('Failed to load category products:', error);
      toast.error('Failed to load products');
    } finally {
      setHasLoaded(true);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  };

  const loadWishlist = () => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        setWishlist([]);
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange.min) {
      filtered = filtered.filter(p => (p.price || 0) >= parseFloat(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(p => (p.price || 0) <= parseFloat(filters.priceRange.max));
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // Rating filter
    if (filters.ratings) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.ratings);
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(p => (p.stock_quantity || 0) > 0);
    }

    // Sale filter
    if (filters.onSale) {
      filtered = filtered.filter(p => p.discount && p.discount > 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'popular':
          comparison = (a.sold_count || 0) - (b.sold_count || 0);
          break;
        case 'newest':
          comparison = new Date(b.created_at || 0) - new Date(a.created_at || 0);
          break;
        default:
          comparison = new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    if (!product || !product.id) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      duration: 3000
    });
  };

  const toggleWishlist = (productId) => {
    if (!productId) return;
    
    let newWishlist;
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, productId];
      toast.success('Added to wishlist', {
        icon: '❤️'
      });
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const handleBrandToggle = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: { min: '', max: '' },
      brands: [],
      ratings: null,
      inStock: false,
      onSale: false,
      search: ''
    });
    setSortBy('popular');
    setSortOrder('desc');
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? 'text-warning' : 'text-secondary'} 
          size={14}
        />
      );
    }
    return stars;
  };

  // No loading spinner – render immediately
  return (
    <div className="category-products-page">
      {/* Header with breadcrumb */}
      <section className="bg-light py-4">
        <Container>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Button 
              variant="link" 
              className="p-0 text-decoration-none"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-1" /> Back
            </Button>
            <span className="text-muted">/</span>
            <Link to="/categories" className="text-decoration-none">Categories</Link>
            <span className="text-muted">/</span>
            <span className="text-primary">{category?.name || 'Category'}</span>
          </div>
          <h1 className="display-6 fw-bold mb-2">{category?.name || 'Loading...'}</h1>
          <p className="lead text-muted mb-0">{category?.description}</p>
          <p className="text-muted mt-2">{filteredProducts.length} products found</p>
        </Container>
      </section>

      <Container className="py-4">
        <Row>
          {/* Sidebar Filters */}
          <Col lg={3} className="mb-4">
            <div className="sticky-top" style={{ top: '100px' }}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Filters</h5>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-decoration-none"
                  >
                    Clear All
                  </Button>
                </Card.Header>
                <Card.Body>
                  {/* Search */}
                  <div className="mb-4">
                    <h6 className="mb-3">Search</h6>
                    <InputGroup size="sm">
                      <InputGroup.Text>
                        <FaSearch size={12} />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                      />
                    </InputGroup>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <h6 className="mb-3">Price Range (₦)</h6>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        size="sm"
                        value={filters.priceRange.min}
                        onChange={(e) => setFilters({
                          ...filters, 
                          priceRange: {...filters.priceRange, min: e.target.value}
                        })}
                      />
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        size="sm"
                        value={filters.priceRange.max}
                        onChange={(e) => setFilters({
                          ...filters, 
                          priceRange: {...filters.priceRange, max: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  {/* Brands */}
                  {availableBrands.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Brands</h6>
                      <div className="d-flex flex-column gap-2">
                        {availableBrands.map(brand => (
                          <Form.Check
                            key={brand}
                            type="checkbox"
                            id={`brand-${brand}`}
                            label={brand}
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="mb-4">
                    <h6 className="mb-3">Minimum Rating</h6>
                    <Form.Select 
                      size="sm"
                      value={filters.ratings || ''}
                      onChange={(e) => setFilters({
                        ...filters, 
                        ratings: e.target.value ? parseInt(e.target.value) : null
                      })}
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4 Stars & Up</option>
                      <option value="3">3 Stars & Up</option>
                      <option value="2">2 Stars & Up</option>
                      <option value="1">1 Star & Up</option>
                    </Form.Select>
                  </div>

                  {/* Other Filters */}
                  <div className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="inStock"
                      label="In Stock Only"
                      checked={filters.inStock}
                      onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="onSale"
                      label="On Sale"
                      checked={filters.onSale}
                      onChange={(e) => setFilters({...filters, onSale: e.target.checked})}
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Products Grid/Table */}
          <Col lg={9}>
            {/* Toolbar */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <FaThLarge />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                      >
                        <FaList />
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="d-lg-none"
                      >
                        <FaFilter className="me-1" /> Filters
                      </Button>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-end gap-2">
                      <Form.Select 
                        size="sm" 
                        style={{ width: '150px' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="popular">Most Popular</option>
                        <option value="newest">Newest</option>
                        <option value="price">Price</option>
                        <option value="name">Name</option>
                        <option value="rating">Rating</option>
                      </Form.Select>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Mobile Filters (collapsible) */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="d-lg-none mb-4"
                >
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      {/* Copy sidebar filters here for mobile */}
                      <h6 className="mb-3">Price Range</h6>
                      <div className="d-flex gap-2 mb-3">
                        <Form.Control
                          type="number"
                          placeholder="Min"
                          size="sm"
                          value={filters.priceRange.min}
                          onChange={(e) => setFilters({...filters, priceRange: {...filters.priceRange, min: e.target.value}})}
                        />
                        <Form.Control
                          type="number"
                          placeholder="Max"
                          size="sm"
                          value={filters.priceRange.max}
                          onChange={(e) => setFilters({...filters, priceRange: {...filters.priceRange, max: e.target.value}})}
                        />
                      </div>
                      <h6 className="mb-3">Brands</h6>
                      <div className="d-flex flex-column gap-2 mb-3">
                        {availableBrands.map(brand => (
                          <Form.Check
                            key={brand}
                            type="checkbox"
                            id={`mobile-brand-${brand}`}
                            label={brand}
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                          />
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Display */}
            {hasLoaded && filteredProducts.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <h5>No products found</h5>
                  <p className="text-muted">Try adjusting your filters</p>
                  <Button variant="primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <Row className="g-4">
                    {currentProducts.map((product, index) => (
                      <Col key={product.id} lg={4} md={6}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="product-card h-100 border-0 shadow-sm">
                            <div className="product-image position-relative">
                              <img 
                                src={product.image_url || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop'} 
                                alt={product.name}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop';
                                }}
                              />
                              {product.discount > 0 && (
                                <Badge bg="danger" className="position-absolute top-0 start-0 m-3">
                                  -{product.discount}%
                                </Badge>
                              )}
                              {product.stock_quantity <= 0 && (
                                <Badge bg="secondary" className="position-absolute top-0 start-0 m-3">
                                  Out of Stock
                                </Badge>
                              )}
                              <Button
                                variant="link"
                                className="position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2"
                                style={{ width: '36px', height: '36px' }}
                                onClick={() => toggleWishlist(product.id)}
                              >
                                <FaHeart color={wishlist.includes(product.id) ? '#ef476f' : '#adb5bd'} />
                              </Button>
                            </div>
                            <Card.Body>
                              {product.brand && (
                                <small className="text-muted text-uppercase">{product.brand}</small>
                              )}
                              <Card.Title className="h6 mb-2">{product.name}</Card.Title>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <div className="d-flex">
                                  {getRatingStars(product.rating || 4)}
                                </div>
                                <small className="text-muted">
                                  ({product.reviews_count || Math.floor(Math.random() * 100) + 10})
                                </small>
                              </div>
                              <Card.Text className="small text-muted mb-3">
                                {(product.description || '').substring(0, 60)}...
                              </Card.Text>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                  <span className="h6 fw-bold text-primary">
                                    ₦{(product.price || 0).toLocaleString()}
                                  </span>
                                  {product.old_price && (
                                    <small className="text-muted text-decoration-line-through ms-2">
                                      ₦{product.old_price.toLocaleString()}
                                    </small>
                                  )}
                                </div>
                                <small className="text-muted">
                                  {product.stock_quantity || 0} left
                                </small>
                              </div>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  className="flex-grow-1"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.stock_quantity <= 0}
                                >
                                  <FaShoppingCart className="me-2" /> Add to Cart
                                </Button>
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  className="flex-grow-0"
                                >
                                  <FaWhatsapp />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentProducts.map(product => (
                            <tr key={product.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={product.image_url || 'https://via.placeholder.com/50'} 
                                    alt={product.name}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                                  />
                                  <div>
                                    <div className="fw-medium">{product.name}</div>
                                    <small className="text-muted">ID: {product.id?.slice(0, 8)}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{product.brand || 'Generic'}</td>
                              <td>
                                <strong>₦{(product.price || 0).toLocaleString()}</strong>
                                {product.discount > 0 && (
                                  <Badge bg="danger" className="ms-2">-{product.discount}%</Badge>
                                )}
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FaStar className="text-warning me-1" size={12} />
                                  <span>{product.rating || 4.0}</span>
                                </div>
                              </td>
                              <td>
                                <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>
                                  {product.stock_quantity > 0 ? product.stock_quantity : 'Out'}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock_quantity <= 0}
                                  >
                                    <FaShoppingCart />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline-danger"
                                    onClick={() => toggleWishlist(product.id)}
                                  >
                                    <FaHeart color={wishlist.includes(product.id) ? '#ef476f' : undefined} />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline-success"
                                  >
                                    <FaWhatsapp />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      <style jsx="true">{`
        .product-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}

export default CategoryProducts;
