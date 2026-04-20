import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function ShippingInfo() {
  return (
    <Container className="py-5">
      <h1 className="display-4 fw-bold mb-4">Shipping Information</h1>
      <Row>
        <Col lg={10} className="mx-auto">
          <section className="mb-4">
            <h3>Delivery Options</h3>
            <ul>
              <li><strong>Standard Shipping</strong> – 3-5 business days (₦1,000)</li>
              <li><strong>Express Shipping</strong> – 1-2 business days (₦2,500)</li>
              <li><strong>Free Shipping</strong> – on orders over ₦50,000 (standard delivery)</li>
            </ul>
          </section>
          <section className="mb-4">
            <h3>Order Tracking</h3>
            <p>Once your order ships, you'll receive a tracking number via email. You can also track it in your account under "My Orders".</p>
          </section>
          <section>
            <h3>International Shipping</h3>
            <p>We currently ship only within Nigeria. International shipping will be available soon.</p>
          </section>
        </Col>
      </Row>
    </Container>
  );
}

export default ShippingInfo;
