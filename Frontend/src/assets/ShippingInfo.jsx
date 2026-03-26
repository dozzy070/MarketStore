import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { FaTruck, FaBox, FaClock, FaMapMarkerAlt, FaGlobe, FaQuestionCircle } from 'react-icons/fa';

function ShippingInfo() {
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Shipping Information</h1>
        <p className="lead text-muted">Learn about our shipping options, costs, and delivery times</p>
      </div>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaTruck className="text-primary" size={30} />
              </div>
              <h5>Standard Shipping</h5>
              <p className="text-muted">3‑5 business days</p>
              <p className="fw-bold">₦3,500</p>
              <small className="text-muted">Free on orders over ₦50,000</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaClock className="text-success" size={30} />
              </div>
              <h5>Express Shipping</h5>
              <p className="text-muted">1‑2 business days</p>
              <p className="fw-bold">₦7,500</p>
              <small className="text-muted">Available for major cities</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaGlobe className="text-info" size={30} />
              </div>
              <h5>International Shipping</h5>
              <p className="text-muted">7‑14 business days</p>
              <p className="fw-bold">Calculated at checkout</p>
              <small className="text-muted">Select countries only</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Accordion defaultActiveKey="0" className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <FaBox className="me-2" /> Order Processing
          </Accordion.Header>
          <Accordion.Body>
            Orders are processed within 24‑48 hours (excluding weekends and holidays). You'll receive a confirmation email once your order ships.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <FaMapMarkerAlt className="me-2" /> Delivery Areas
          </Accordion.Header>
          <Accordion.Body>
            We currently ship to all states in Nigeria. International shipping is available to select countries (US, UK, Canada, Ghana, Kenya). Contact support if your country isn't listed.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <FaQuestionCircle className="me-2" /> Tracking Your Order
          </Accordion.Header>
          <Accordion.Body>
            Once your order ships, you'll receive a tracking number via email. You can also track your order from your <a href="/user/orders">account dashboard</a> or use our <a href="/track">Track Order</a> page.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Card className="border-0 shadow-sm bg-light">
        <Card.Body className="p-4 text-center">
          <h5>Need faster shipping?</h5>
          <p>Contact our customer support for rush order options.</p>
          <a href="/contact" className="btn btn-primary">Contact Us</a>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ShippingInfo;