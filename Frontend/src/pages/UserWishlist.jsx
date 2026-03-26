import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { 
  FaHeart, 
  FaShoppingCart, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaShare
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function UserWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      // Mock data - replace with actual API call
      // const response = await userAPI.getWishlist();
      // setWishlist(response.data);
      
      setWishlist([
        {
          id: 1,
          name: 'Wireless Headphones',
          price: 15000,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
          rating: 4.5,
          reviews: 128,
          inStock: true
        },
        {
          id: 2,
          name: 'Running Shoes',
          price: 25000,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
          rating: 4.8,
          reviews: 256,
          inStock: true
        },
        {
          id: 3,
          name: 'Smart Watch',
          price: 45000,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
          rating: 4.6,
          reviews: 89,
          inStock: false
        }
      ]);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      // await userAPI.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

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

  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on MarketStore!`,
        url: `/product/${product.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const filteredWishlist = wishlist.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">My Wishlist</h4>
          <p className="text-muted mb-0">{wishlist.length} items saved</p>
        </div>
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
            <Button variant="primary" as={Link} to="/">Browse Products</Button>
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
                    src={product.image} 
                    style={{ height: '200px', objectFit: 'cover' }}
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
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-warning me-2">★</span>
                    <span className="fw-medium">{product.rating}</span>
                    <span className="text-muted ms-2">({product.reviews})</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-primary mb-0">₦{product.price.toLocaleString()}</h5>
                    <Badge bg={product.inStock ? 'success' : 'danger'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      className="flex-grow-1"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      <FaShoppingCart className="me-2" /> Add to Cart
                    </Button>
                    <Button 
                      variant="outline-primary"
                      onClick={() => handleShare(product)}
                    >
                      <FaShare />
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