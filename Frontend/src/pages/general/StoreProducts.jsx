import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaStore, 
  FaStar, 
  FaShoppingCart, 
  FaHeart,
  FaSearch,
  FaFilter,
  FaSort,
  FaBox,
  FaEye,
  FaWhatsapp,
  FaShare,
  FaCheckCircle,
  FaTruck,
  FaUndo,
  FaArrowLeft
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function StoreProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, search, sortBy, priceRange]);

  const fetchStoreData = async () => {
    try {
      // Mock data - replace with actual API call
      // const storeRes = await storeAPI.getStoreById(id);
      // const productsRes = await storeAPI.getStoreProducts(id);
      
      // Mock store data
      const mockStore = {
        id: id,
        name: "Tech Haven",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
        cover: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
        rating: 4.5,
        totalReviews: 234,
        verified: true,
        description: "Your one-stop shop for electronics and gadgets. We offer the latest tech products at competitive prices with excellent customer service."
      };

      // Mock products data
      const mockProducts = [
        {
          id: 1,
          name: "Wireless Headphones",
          price: 15000,
          oldPrice: 18000,
          description: "Premium noise-canceling wireless headphones with 30-hour battery life",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          category: "Electronics",
          rating: 4.5,
          reviews: 128,
          stock: 15,
          sold: 342,
          discount: 17,
          featured: true,
          tags: ["headphones", "wireless", "audio"]
        },
        {
          id: 2,
          name: "Smart Watch",
          price: 45000,
          oldPrice: 50000,
          description: "Fitness tracker with heart rate monitor, GPS, and smartphone notifications",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          category: "Electronics",
          rating: 4.8,
          reviews: 89,
          stock: 8,
          sold: 156,
          discount: 10,
          featured: true,
          tags: ["watch", "fitness", "smart"]
        },
        {
          id: 3,
          name: "Bluetooth Speaker",
          price: 25000,
          oldPrice: 30000,
          description: "Portable waterproof speaker with 360° sound and 20-hour playtime",
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
          category: "Electronics",
          rating: 4.6,
          reviews: 156,
          stock: 23,
          sold: 412,
          discount: 17,
          featured: false,
          tags: ["speaker", "bluetooth", "audio"]
        },
        {
          id: 4,
          name: "Laptop Backpack",
          price: 12000,
          oldPrice: 15000,
          description: "Water-resistant backpack with USB charging port and anti-theft design",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
          category: "Accessories",
          rating: 4.7,
          reviews: 92,
          stock: 45,
          sold: 278,
          discount: 20,
          featured: false,
          tags: ["backpack", "travel", "laptop"]
        },
        {
          id: 5,
          name: "USB-C Hub",
          price: 8000,
          oldPrice: 10000,
          description: "7-in-1 multiport adapter with HDMI, USB 3.0, and SD card reader",
          image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400",
          category: "Accessories",
          rating: 4.4,
          reviews: 67,
          stock: 34,
          sold: 189,
          discount: 20,
          featured: false,
          tags: ["hub", "usb", "adapter"]
        },
        {
          id: 6,
          name: "Mechanical Keyboard",
          price: 35000,
          oldPrice: 40000,
          description: "RGB mechanical gaming keyboard with Cherry MX switches",
          image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400",
          category: "Electronics",
          rating: 4.9,
          reviews: 203,
          stock: 12,
          sold: 567,
          discount: 12.5,
          featured: true,
          tags: ["keyboard", "gaming", "mechanical"]
        }
      ];

      // Extract unique categories
      const uniqueCategories = [...new Set(mockProducts.map(p => p.category))];
      
      setStore(mockStore);
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setCategories(uniqueCategories);
      
      // Load wishlist from localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Failed to load store products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.sold - a.sold);
        break;
      default:
        filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
  };

  const toggleWishlist = (productId) => {
    let newWishlist;
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, productId];
      toast.success('Added to wishlist');
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at ${store.name}!`,
        url: `/product/${product.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  return (
    <div className="store-products-page">
      {/* Store Header */}
      <div className="position-relative mb-4">
        <img 
          src={store.cover} 
          alt={store.name}
          className="w-100"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="position-absolute bottom-0 start-0 w-100 p-4" 
             style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
          <Container>
            <div className="d-flex align-items-center text-white">
              <img 
                src={store.logo} 
                alt={store.name}
                className="rounded-circle border border-3 border-white me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="mb-0">{store.name}</h4>
                  {store.verified && (
                    <FaCheckCircle className="text-success" />
                  )}
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-1" />
                    <span>{store.rating} ({store.totalReviews} reviews)</span>
                  </div>
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => navigate(`/stores/${id}`)}
                  >
                    <FaStore className="me-1" /> View Store
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="mb-1">{store.name} Products</h5>
            <p className="text-muted mb-0">{filteredProducts.length} products found</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-2" /> Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Search products in this store..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Card.Body>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Category</Form.Label>
                    <Form.Select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Price Range (₦)</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      />
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Sort By</Form.Label>
                    <Form.Select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="popular">Most Popular</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </motion.div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <FaBox size={50} className="text-muted mb-3" />
              <h5>No products found</h5>
              <p className="text-muted">Try adjusting your filters</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredProducts.map((product, index) => (
              <Col key={product.id} lg={4} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="product-card h-100 border-0 shadow-sm">
                    <div className="position-relative">
                      <Link to={`/product/${product.id}`}>
                        <Card.Img 
                          variant="top" 
                          src={product.image} 
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      </Link>
                      
                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <Badge 
                          bg="danger" 
                          className="position-absolute top-0 start-0 m-3"
                        >
                          -{product.discount}%
                        </Badge>
                      )}

                      {/* Featured Badge */}
                      {product.featured && (
                        <Badge 
                          bg="warning" 
                          className="position-absolute top-0 end-0 m-3"
                        >
                          Featured
                        </Badge>
                      )}

                      {/* Wishlist Button */}
                      <Button
                        variant="link"
                        className="position-absolute bottom-0 end-0 m-3 bg-white rounded-circle p-2"
                        style={{ width: '40px', height: '40px' }}
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
                        <FaStar className="text-warning me-1" size={14} />
                        <span className="fw-medium me-2">{product.rating}</span>
                        <span className="text-muted small">({product.reviews} reviews)</span>
                      </div>

                      <p className="small text-muted mb-2">{product.description}</p>

                      <div className="d-flex align-items-baseline mb-3">
                        <h5 className="text-primary mb-0 me-2">
                          ₦{product.price.toLocaleString()}
                        </h5>
                        {product.oldPrice > product.price && (
                          <small className="text-muted text-decoration-line-through">
                            ₦{product.oldPrice.toLocaleString()}
                          </small>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg="light" text="dark" className="small">
                            <FaTruck className="me-1" size={10} /> Free Shipping
                          </Badge>
                          <Badge bg="light" text="dark" className="small">
                            <FaUndo className="me-1" size={10} /> 30-day
                          </Badge>
                        </div>
                        <small className="text-muted">
                          {product.stock} left
                        </small>
                      </div>

                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          className="flex-grow-1"
                          onClick={() => handleAddToCart(product)}
                        >
                          <FaShoppingCart className="me-2" /> Add to Cart
                        </Button>
                        <Button 
                          variant="outline-primary"
                          onClick={() => handleShare(product)}
                        >
                          <FaShare />
                        </Button>
                        <Button 
                          variant="outline-success"
                          href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at ${store.name}!`)}`}
                          target="_blank"
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

export default StoreProducts;
