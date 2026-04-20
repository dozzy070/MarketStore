import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaStore, FaUsers, FaTruck, FaHeart, FaShieldAlt, FaGlobe } from 'react-icons/fa';

function AboutUs() {
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">About MarketStore</h1>
        <p className="lead text-muted">
          Empowering local businesses and connecting shoppers with quality products
        </p>
      </div>

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"
            alt="About MarketStore"
            className="img-fluid rounded-4 shadow-sm"
          />
        </Col>
        <Col lg={6}>
          <h2 className="h3 mb-3">Our Story</h2>
          <p className="text-muted">
            MarketStore was founded in 2023 with a simple mission: to create a trusted online marketplace
            where anyone can discover amazing products and local businesses can thrive.
          </p>
          <p className="text-muted">
            What started as a small idea in Lagos has grown into a platform serving thousands of customers
            across Nigeria. We believe in making shopping easy, safe, and enjoyable for everyone.
          </p>
          <p className="text-muted">
            Today, we're proud to support local vendors, artisans, and entrepreneurs by giving them a
            platform to reach customers beyond their local communities.
          </p>
        </Col>
      </Row>

      <h2 className="h3 text-center mb-4">Why Choose Us</h2>
      <Row className="g-4 mb-5">
        {[
          { icon: FaShieldAlt, title: 'Secure Payments', desc: 'Encrypted transactions for your safety' },
          { icon: FaTruck, title: 'Fast Delivery', desc: 'Reliable shipping across Nigeria' },
          { icon: FaHeart, title: 'Quality Products', desc: 'Curated selection from trusted vendors' },
          { icon: FaUsers, title: '24/7 Support', desc: 'We’re here when you need us' },
        ].map((item, idx) => (
          <Col key={idx} md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body className="p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <item.icon className="text-primary" size={30} />
                </div>
                <h5 className="mb-2">{item.title}</h5>
                <p className="text-muted mb-0">{item.desc}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="bg-light rounded-4 p-5 text-center">
        <h2 className="h3 mb-3">Join Our Community</h2>
        <p className="text-muted mb-4">
          Whether you're shopping for yourself or looking to sell your products, we're here to help.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <a href="/register" className="btn btn-primary btn-lg">Create Account</a>
          <a href="/stores" className="btn btn-outline-primary btn-lg">Explore Stores</a>
        </div>
      </div>
    </Container>
  );
}

export default AboutUs;
