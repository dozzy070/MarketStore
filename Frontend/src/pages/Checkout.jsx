// frontend/src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaTruck, 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaLock,
  FaArrowLeft,
  FaWallet,
  FaMoneyBillWave,
  FaUniversity,
  FaMobile,
  FaSpinner
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { orderAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    shipping: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria'
    },
    billing: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria'
    }
  });

  const [errors, setErrors] = useState({});
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 2500,
    tax: 0,
    total: 0
  });

  const shippingMethods = [
    { id: 'standard', name: 'Standard Delivery', price: 2500, days: '3-5 business days' },
    { id: 'express', name: 'Express Delivery', price: 5000, days: '1-2 business days' },
    { id: 'pickup', name: 'Store Pickup', price: 0, days: 'Ready in 24 hours' }
  ];

  const [selectedShipping, setSelectedShipping] = useState('standard');

  useEffect(() => {
    loadCart();
    loadUserProfile();
  }, []);

  useEffect(() => {
    calculateOrderSummary();
  }, [cart, selectedShipping]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart && JSON.parse(savedCart).length > 0) {
      setCart(JSON.parse(savedCart));
    } else {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  };

  const loadUserProfile = () => {
    if (user) {
      setFormData({
        shipping: {
          fullName: user.full_name || '',
          email: user.email || '',
          phone: user.phone_number || '',
          address: user.location || '',
          apartment: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Nigeria'
        },
        billing: {
          fullName: user.full_name || '',
          email: user.email || '',
          phone: user.phone_number || '',
          address: user.location || '',
          apartment: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Nigeria'
        }
      });
    }
  };

  const calculateOrderSummary = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = shippingMethods.find(m => m.id === selectedShipping)?.price || 0;
    const tax = subtotal * 0.075;
    const total = subtotal + shipping + tax;

    setOrderSummary({ subtotal, shipping, tax, total });
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    const shipping = formData.shipping;

    if (!shipping.fullName.trim()) newErrors['shipping.fullName'] = 'Full name is required';
    if (!shipping.email.trim()) newErrors['shipping.email'] = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shipping.email)) newErrors['shipping.email'] = 'Email is invalid';
    if (!shipping.phone.trim()) newErrors['shipping.phone'] = 'Phone number is required';
    if (!shipping.address.trim()) newErrors['shipping.address'] = 'Address is required';
    if (!shipping.city.trim()) newErrors['shipping.city'] = 'City is required';
    if (!shipping.state.trim()) newErrors['shipping.state'] = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Create order before payment
  const createOrder = async () => {
    setCreatingOrder(true);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        shipping_address: {
          ...formData.shipping,
          method: selectedShipping
        },
        billing_address: sameAsBilling ? formData.shipping : formData.billing,
        payment_method: paymentMethod,
        subtotal: orderSummary.subtotal,
        shipping_cost: orderSummary.shipping,
        tax: orderSummary.tax,
        total: orderSummary.total,
        notes: orderNotes
      };

      // Call your API to create order
      const response = await orderAPI.createOrder(orderData);
      
      if (response.data && response.data.success) {
        setCreatedOrder(response.data.order);
        return response.data.order;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  // Initialize Paystack payment
  const initializePayment = async (order) => {
    setProcessingPayment(true);
    
    try {
      const response = await paymentAPI.initializePayment({
        amount: orderSummary.total,
        email: formData.shipping.email,
        orderId: order.id,
        metadata: {
          order_id: order.id,
          customer_name: formData.shipping.fullName,
          customer_phone: formData.shipping.phone
        }
      });
      
      if (response.data.success) {
        // Open Paystack popup
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: formData.shipping.email,
          amount: orderSummary.total * 100,
          reference: response.data.reference,
          onSuccess: (transaction) => {
            handlePaymentSuccess(transaction, order.id);
          },
          onCancel: () => {
            setProcessingPayment(false);
            toast.error('Payment cancelled');
          },
        });
      } else {
        toast.error(response.data.message || 'Failed to initialize payment');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (transaction, orderId) => {
    try {
      // Verify payment on backend
      const response = await paymentAPI.verifyPayment(transaction.reference);
      
      if (response.data.success) {
        toast.success('Payment successful! Order confirmed.');
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Navigate to order confirmation
        navigate(`/order-confirmation/${orderId}`);
      } else {
        toast.error('Payment verification failed');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed');
      setProcessingPayment(false);
    }
  };

  // Main place order function
  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Step 1: Create the order
      const order = await createOrder();
      
      if (!order) {
        setLoading(false);
        return;
      }
      
      // Step 2: Initialize payment
      await initializePayment(order);
      
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <DashboardLayout>
        <Container className="py-5 text-center">
          <FaShoppingBag size={60} className="text-muted mb-3" />
          <h3>Your cart is empty</h3>
          <Button variant="primary" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container className="py-4">
        <Button variant="link" className="text-decoration-none mb-4" onClick={() => navigate('/cart')}>
          <FaArrowLeft className="me-2" /> Back to Cart
        </Button>

        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-5">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="d-flex align-items-center flex-grow-1">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= s ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                           style={{ width: '40px', height: '40px', zIndex: 2 }}>
                        {step > s ? <FaCheckCircle /> : s}
                      </div>
                      <span className={`ms-2 ${step >= s ? 'text-dark' : 'text-muted'}`}>
                        {s === 1 ? 'Shipping' : s === 2 ? 'Billing' : 'Payment'}
                      </span>
                      {s < 3 && (
                        <div className={`flex-grow-1 mx-3 ${step > s ? 'bg-primary' : 'bg-light'}`} style={{ height: '2px' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Shipping */}
                {step === 1 && (
                  <>
                    <h5 className="mb-4">Shipping Information</h5>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              value={formData.shipping.fullName}
                              onChange={(e) => handleInputChange('shipping', 'fullName', e.target.value)}
                              isInvalid={!!errors['shipping.fullName']}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors['shipping.fullName']}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                              type="email"
                              value={formData.shipping.email}
                              onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                              isInvalid={!!errors['shipping.email']}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors['shipping.email']}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Address *</Form.Label>
                        <Form.Control
                          value={formData.shipping.address}
                          onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                          isInvalid={!!errors['shipping.address']}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors['shipping.address']}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>City *</Form.Label>
                            <Form.Control
                              value={formData.shipping.city}
                              onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                              isInvalid={!!errors['shipping.city']}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors['shipping.city']}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>State *</Form.Label>
                            <Form.Control
                              value={formData.shipping.state}
                              onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                              isInvalid={!!errors['shipping.state']}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors['shipping.state']}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone *</Form.Label>
                            <Form.Control
                              value={formData.shipping.phone}
                              onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                              isInvalid={!!errors['shipping.phone']}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors['shipping.phone']}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Shipping Method</Form.Label>
                        <Row>
                          {shippingMethods.map(method => (
                            <Col md={4} key={method.id}>
                              <Card 
                                className={`border-2 text-center p-2 mb-2 ${selectedShipping === method.id ? 'border-primary' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedShipping(method.id)}
                              >
                                <FaTruck size={20} className="mx-auto mb-1 text-primary" />
                                <small className="fw-bold">{method.name}</small>
                                <small className="text-muted">{method.days}</small>
                                <strong>₦{method.price.toLocaleString()}</strong>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Form.Group>
                    </Form>
                  </>
                )}

                {/* Step 2: Billing */}
                {step === 2 && (
                  <>
                    <h5 className="mb-4">Billing Information</h5>
                    <Form.Check
                      type="checkbox"
                      label="Same as shipping address"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="mb-3"
                    />
                    
                    {!sameAsBilling && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            value={formData.billing.fullName}
                            onChange={(e) => handleInputChange('billing', 'fullName', e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Address *</Form.Label>
                          <Form.Control
                            value={formData.billing.address}
                            onChange={(e) => handleInputChange('billing', 'address', e.target.value)}
                          />
                        </Form.Group>
                      </>
                    )}
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Order Notes (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Special instructions for delivery..."
                      />
                    </Form.Group>
                  </>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <>
                    <h5 className="mb-4">Payment Method</h5>
                    <Row className="g-3 mb-4">
                      {[
                        { id: 'card', icon: FaCreditCard, label: 'Credit Card' },
                        { id: 'bank', icon: FaUniversity, label: 'Bank Transfer' },
                        { id: 'mobile', icon: FaMobile, label: 'Mobile Money' }
                      ].map(method => (
                        <Col md={4} key={method.id}>
                          <Card 
                            className={`border-2 text-center p-3 ${paymentMethod === method.id ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <method.icon size={30} className="mx-auto mb-2 text-primary" />
                            <h6 className="mb-0">{method.label}</h6>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    
                    <div className="bg-light p-3 rounded-3">
                      <FaLock className="text-muted me-2" />
                      <small className="text-muted">
                        Your payment information is secure. We use Paystack for secure payment processing.
                      </small>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item.id} className="d-flex justify-content-between mb-2">
                      <small>{item.name} x{item.quantity}</small>
                      <small>₦{(item.price * item.quantity).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>₦{orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'Free' : `₦${orderSummary.shipping.toLocaleString()}`}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (7.5%)</span>
                  <span>₦{orderSummary.tax.toLocaleString()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total</strong>
                  <h4 className="text-primary mb-0">₦{orderSummary.total.toLocaleString()}</h4>
                </div>

                <div className="d-flex gap-2">
                  {step > 1 && (
                    <Button variant="outline-secondary" className="w-50" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button variant="primary" className={step === 1 ? 'w-100' : 'w-50'} onClick={handleNext}>
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      className="w-100" 
                      onClick={handlePlaceOrder} 
                      disabled={loading || processingPayment || creatingOrder}
                    >
                      {(loading || processingPayment || creatingOrder) ? (
                        <>
                          <FaSpinner className="spinner-border spinner-border-sm me-2" />
                          {creatingOrder ? 'Creating Order...' : processingPayment ? 'Processing Payment...' : 'Placing Order...'}
                        </>
                      ) : (
                        'Place Order & Pay'
                      )}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .sticky-top {
          top: 100px;
        }
        .spinner-border {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default Checkout;