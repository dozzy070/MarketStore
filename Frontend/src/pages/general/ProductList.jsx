import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaShoppingCart, FaHeart } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { productAPI } from '../../services/api';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // track loading state
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getProducts();
      let items = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          items = response.data.products;
        }
      }
      setProducts(items);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
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

  const handleAddToWishlist = async (product) => {
    try {
      await userAPI.addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast.error('Could not add to wishlist');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <h5>Loading products...</h5>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Browse Products</h4>
          <p className="text-muted mb-0">{products.length} products available</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {filteredProducts.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <FaSearch size={60} className="text-muted mb-3" />
            <h5>No products found</h5>
            <p className="text-muted">Try a different search term</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredProducts.map(product => (
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
                    onClick={() => handleAddToWishlist(product)}
                  >
                    <FaHeart className="text-danger" />
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
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_quantity <= 0}
                  >
                    <FaShoppingCart className="me-2" /> Add to Cart
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </DashboardLayout>
  );
}

export default ProductList;
