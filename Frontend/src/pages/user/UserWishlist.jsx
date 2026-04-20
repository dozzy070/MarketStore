import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaTrash, FaSearch, FaSync } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function UserWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch wishlist silently (no spinner)
  const fetchWishlist = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const response = await userAPI.getWishlist();

      let items = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (response.data.wishlist && Array.isArray(response.data.wishlist)) {
          items = response.data.wishlist;
        }
      }
      setWishlist(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  // Initial load (no spinner)
  useEffect(() => {
    fetchWishlist();

    // Real‑time sync when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWishlist(); // silent refresh
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchWishlist]);

  // Remove item with optimistic update
  const handleRemove = async (productId) => {
    const originalWishlist = [...wishlist];
    setWishlist(wishlist.filter(item => item.id !== productId));

    try {
      await userAPI.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
      setWishlist(originalWishlist);
    }
  };

  // Add to cart
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
  };

  // Manual refresh (spinner only on the button)
  const handleRefresh = () => {
    fetchWishlist(true);
  };

  const filteredWishlist = wishlist.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">My Wishlist</h4>
          <p className="text-muted mb-0">{wishlist.length} items saved</p>
        </div>
        <Button
          variant="outline-secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          className="d-flex align-items-center gap-2"
        >
          <FaSync className={refreshing ? 'fa-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search in wishlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {filteredWishlist.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <FaHeart size={60} className="text-muted mb-3" />
            <h5>Your wishlist is empty</h5>
            <p className="text-muted mb-4">Save items you love to your wishlist</p>
            <Button variant="primary" as={Link} to="/products">
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredWishlist.map(product => (
            <Col key={product.id} md={4}>
              <Card className="border-0 shadow-sm h-100">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={product.image_url || product.image || 'https://via.placeholder.com/200'}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                  />
                  <Button
                    variant="link"
                    className="position-absolute top-0 end-0 m-2 bg-white rounded-circle p-2"
                    onClick={() => handleRemove(product.id)}
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </div>
                <Card.Body>
                  <Card.Title className="h6">{product.name}</Card.Title>

                  {product.rating && (
                    <div className="d-flex align-items-center mb-2">
                      <span className="text-warning me-2">★</span>
                      <span className="fw-medium">{product.rating}</span>
                      {product.reviews !== undefined && (
                        <span className="text-muted ms-2">({product.reviews})</span>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-primary mb-0">₦{(product.price || 0).toLocaleString()}</h5>
                    <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>
                      {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-grow-1"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity <= 0}
                    >
                      <FaShoppingCart className="me-2" /> Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </DashboardLayout>
  );
}

export default UserWishlist;
