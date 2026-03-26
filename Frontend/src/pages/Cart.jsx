import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaMinus, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.075; // 7.5% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="py-5">
          <FaShoppingBag size={60} className="text-muted mb-3" />
          <h3 className="mb-3">Your Cart is Empty</h3>
          <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
          <Button variant="primary" size="lg" as={Link} to="/">
            <FaArrowLeft className="me-2" /> Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Shopping Cart ({cart.length} items)</h2>
      
      <Row>
        <Col lg={8}>
          {cart.map((item) => (
            <Card key={item.id} className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={3} md={2}>
                    <Image 
                      src={item.image_url || 'https://via.placeholder.com/100'} 
                      fluid 
                      rounded
                      style={{ maxHeight: '80px', objectFit: 'cover' }}
                    />
                  </Col>
                  <Col xs={9} md={5}>
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="text-muted small mb-0">{item.category || 'Uncategorized'}</p>
                  </Col>
                  <Col xs={5} md={3} className="mt-3 mt-md-0">
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FaMinus size={10} />
                      </Button>
                      <Form.Control 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="mx-2 text-center"
                        style={{ width: '60px' }}
                      />
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FaPlus size={10} />
                      </Button>
                    </div>
                  </Col>
                  <Col xs={4} md={1} className="text-end mt-3 mt-md-0">
                    <strong>₦{(item.price * item.quantity).toLocaleString()}</strong>
                  </Col>
                  <Col xs={3} md={1} className="text-end mt-3 mt-md-0">
                    <Button 
                      variant="link" 
                      className="p-0 text-danger"
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          
          <Button 
            variant="outline-primary" 
            as={Link} 
            to="/"
            className="mt-3"
          >
            <FaArrowLeft className="me-2" /> Continue Shopping
          </Button>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span>₦{calculateSubtotal().toLocaleString()}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tax (7.5%)</span>
                <span>₦{calculateTax().toLocaleString()}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong className="text-primary h5">₦{calculateTotal().toLocaleString()}</strong>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;