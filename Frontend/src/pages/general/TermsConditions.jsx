import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function TermsConditions() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="display-4 fw-bold mb-3">Terms & Conditions</h1>
        <p className="text-muted">Last updated: March 26, 2026</p>
      </div>

      <Row>
        <Col lg={10} className="mx-auto">
          <section className="mb-5">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing or using the MarketStore website, you agree to be bound by these Terms & Conditions.
              If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="mb-5">
            <h3>2. Account Registration</h3>
            <p>
              You must be at least 18 years old to create an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-5">
            <h3>3. Purchases and Payments</h3>
            <p>
              All orders are subject to acceptance and availability. Prices are in Nigerian Naira (₦) and
              include applicable taxes unless stated otherwise. We reserve the right to cancel any order if
              fraud is suspected or if the product is unavailable.
            </p>
          </section>

          <section className="mb-5">
            <h3>4. Vendor Terms</h3>
            <p>
              Vendors must provide accurate business information and comply with all applicable laws.
              We reserve the right to remove any products that violate our policies.
            </p>
          </section>

          <section className="mb-5">
            <h3>5. Shipping and Delivery</h3>
            <p>
              Delivery times are estimates and may vary. We are not responsible for delays caused by
              shipping carriers or unforeseen circumstances.
            </p>
          </section>

          <section className="mb-5">
            <h3>6. Returns and Refunds</h3>
            <p>
              Please refer to our <a href="/help/returns">Return Policy</a> for detailed information.
            </p>
          </section>

          <section className="mb-5">
            <h3>7. Intellectual Property</h3>
            <p>
              All content on this site (text, graphics, logos, images) is the property of MarketStore
              and protected by copyright laws. Unauthorized use is prohibited.
            </p>
          </section>

          <section className="mb-5">
            <h3>8. Limitation of Liability</h3>
            <p>
              MarketStore is not liable for any indirect, incidental, or consequential damages arising
              from your use of our services.
            </p>
          </section>

          <section className="mb-5">
            <h3>9. Changes to Terms</h3>
            <p>
              We may update these Terms from time to time. Continued use of the site after changes
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-5">
            <h3>10. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at
              <a href="mailto:support@marketstore.com"> support@marketstore.com</a>.
            </p>
          </section>
        </Col>
      </Row>
    </Container>
  );
}

export default TermsConditions;
