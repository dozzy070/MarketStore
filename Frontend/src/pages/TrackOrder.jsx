import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaBox, FaSearch, FaCheckCircle, FaTruck, FaClock, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId || !email) {
      setError('Please provide both Order ID and Email');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      // Mock API call – replace with actual endpoint
      // const response = await axios.get(`/api/orders/track/${orderId}`, { params: { email } });
      // setTrackingData(response.data);

      // Simulate API response for demo
      setTimeout(() => {
        // Mock data
        const mockData = {
          orderId: orderId,
          status: 'shipped',
          estimatedDelivery: '2026-04-02',
          events: [
            { date: '2026-03-26 10:30', status: 'Order placed', location: 'Online' },
            { date: '2026-03-27 14:15', status: 'Processing', location: 'Warehouse' },
            { date: '2026-03-28 09:45', status: 'Shipped', location: 'Lagos Sorting Center' },
          ]
        };
        setTrackingData(mockData);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Order not found. Please check your Order ID and Email.');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-success" size={24} />;
      case 'shipped':
        return <FaTruck className="text-primary" size={24} />;
      case 'processing':
        return <FaClock className="text-warning" size={24} />;
      case 'cancelled':
        return <FaTimesCircle className="text-danger" size={24} />;
      default:
        return <FaBox className="text-secondary" size={24} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Track Your Order</h1>
        <p className="lead text-muted">Enter your order ID and email to see the current status</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Order ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., #ORD-12345"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter the email used for the order"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaSearch className="me-2" /> Track Order</>}
                </Button>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-4">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {trackingData && (
            <Card className="border-0 shadow-sm mt-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h4 className="mb-0">Order #{trackingData.orderId}</h4>
                  <div className="d-flex align-items-center">
                    {getStatusIcon(trackingData.status)}
                    <span className="ms-2 fw-bold">{getStatusText(trackingData.status)}</span>
                  </div>
                </div>

                {trackingData.estimatedDelivery && (
                  <Alert variant="info" className="mb-4">
                    <strong>Estimated Delivery:</strong> {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                  </Alert>
                )}

                <h5>Tracking History</h5>
                <div className="timeline mt-3">
                  {trackingData.events.map((event, idx) => (
                    <div key={idx} className="d-flex mb-3">
                      <div className="me-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {idx === 0 ? <FaBox /> : <FaClock />}
                        </div>
                      </div>
                      <div>
                        <p className="mb-0 fw-bold">{event.status}</p>
                        <p className="text-muted mb-0 small">{new Date(event.date).toLocaleString()}</p>
                        <p className="text-muted small">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <Button variant="outline-primary" href="/help/orders">
                    Need help? Contact Support
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default TrackOrder;