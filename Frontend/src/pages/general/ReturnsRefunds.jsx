import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUndo, FaCreditCard, FaExchangeAlt, FaClock } from 'react-icons/fa';

function ReturnsRefunds() {
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Returns & Refunds</h1>
        <p className="lead text-muted">Our return policy and how to get your refund</p>
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <FaUndo className="text-primary" size={24} />
                </div>
                <h3 className="h4 mb-0">Return Policy</h3>
              </div>
              <p>We offer a 30‑day return policy for most items. To be eligible for a return:</p>
              <ul>
                <li>Items must be unused and in the same condition that you received them</li>
                <li>Must be in the original packaging with all tags attached</li>
                <li>Proof of purchase is required (order number or receipt)</li>
                <li>Clearance items and perishable goods are non‑returnable</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                  <FaCreditCard className="text-success" size={24} />
                </div>
                <h3 className="h4 mb-0">Refund Process</h3>
              </div>
              <p>Once we receive your returned item:</p>
              <ul>
                <li>We'll inspect the item and notify you of the approval or rejection</li>
                <li>If approved, a refund will be processed to your original payment method</li>
                <li>Refunds typically appear within 5‑7 business days (depending on your bank)</li>
                <li>Shipping costs are non‑refundable unless the return is due to our error</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <FaExchangeAlt className="text-warning" size={24} />
                </div>
                <h3 className="h4 mb-0">How to Initiate a Return</h3>
              </div>
              <ol>
                <li>Log into your account and go to <strong>My Orders</strong></li>
                <li>Click on the order containing the item you wish to return</li>
                <li>Select the item and choose <strong>Return Item</strong></li>
                <li>Follow the on‑screen instructions to print a return label (if applicable)</li>
                <li>Pack the item securely and ship it back to the return address provided</li>
              </ol>
              <p className="text-muted mt-3">
                If you have any questions, please contact our support team at{' '}
                <a href="mailto:support@marketstore.com">support@marketstore.com</a>.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="p-4 text-center">
              <FaClock className="text-primary mb-3" size={32} />
              <h5>Need to track a return?</h5>
              <p>Log in to check your return status.</p>
              <a href="/login" className="btn btn-primary">
                Log in to Track
              </a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ReturnsRefunds;
