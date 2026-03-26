import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Image, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaStar, FaWhatsapp, FaMinus, FaPlus } from 'react-icons/fa';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProduct(id);
      setProduct(response.data);
      // Fetch related products from same category
      if (response.data.category_id) {
        const related = await productAPI.getProductsByCategory(response.data.category_id);
        setRelatedProducts(related.data.filter(p => p.id !== id).slice(0, 4));
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Image src={product?.image_url || 'https://via.placeholder.com/500'} fluid rounded />
        </Col>
        <Col md={6}>
          <h2>{product?.name}</h2>
          <div className="d-flex align-items-center mb-3">
            <div className="text-warning me-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < 4 ? 'text-warning' : 'text-secondary'} />
              ))}
            </div>
            <span className="text-muted">(42 reviews)</span>
          </div>
          <h3 className="text-primary mb-3">₦{product?.price?.toLocaleString()}</h3>
          <p className="mb-4">{product?.description}</p>
          
          <div className="mb-4">
            <Badge bg={product?.stock_quantity > 0 ? 'success' : 'danger'}>
              {product?.stock_quantity > 0 ? `${product?.stock_quantity} in stock` : 'Out of stock'}
            </Badge>
          </div>

          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center border rounded">
              <Button variant="link" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <FaMinus />
              </Button>
              <span className="px-3">{quantity}</span>
              <Button variant="link" onClick={() => setQuantity(quantity + 1)}>
                <FaPlus />
              </Button>
            </div>
            <Button variant="primary" onClick={addToCart} disabled={product?.stock_quantity <= 0}>
              <FaShoppingCart className="me-2" /> Add to Cart
            </Button>
            <Button variant="outline-danger">
              <FaHeart />
            </Button>
            <Button variant="success">
              <FaWhatsapp />
            </Button>
          </div>
        </Col>
      </Row>

      {relatedProducts.length > 0 && (
        <>
          <h4 className="mt-5 mb-4">Related Products</h4>
          <Row className="g-4">
            {relatedProducts.map(p => (
              <Col key={p.id} md={3}>
                <Card className="h-100" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <Card.Img variant="top" src={p.image_url || 'https://via.placeholder.com/200'} />
                  <Card.Body>
                    <Card.Title className="h6">{p.name}</Card.Title>
                    <Card.Text className="text-primary">₦{p.price?.toLocaleString()}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default ProductDetails;