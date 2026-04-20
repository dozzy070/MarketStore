import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query]);

  const searchProducts = async () => {
    try {
      const response = await productAPI.searchProducts(query);
      setProducts(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  };

  return (
    <Container className="py-5">
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="primary">
            <FaSearch /> Search
          </Button>
        </InputGroup>
      </Form>

      <h4 className="mb-4">
        {loading ? 'Searching...' : `${products.length} results for "${query}"`}
      </h4>

      <Row className="g-4">
        {products.map(product => (
          <Col key={product.id} md={4} lg={3}>
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={product.image_url || 'https://via.placeholder.com/200'} 
                style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product.id}`)}
              />
              <Card.Body>
                <Card.Title className="h6" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
                  {product.name}
                </Card.Title>
                <Card.Text className="text-primary fw-bold mb-2">
                  ₦{product.price?.toLocaleString()}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>
                    {product.stock_quantity > 0 ? 'In Stock' : 'Out'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity <= 0}
                  >
                    <FaShoppingCart /> Add
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default SearchResults;
