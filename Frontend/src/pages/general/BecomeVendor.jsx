import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Accordion, Modal, Form, Table } from 'react-bootstrap';
import { 
  FaStoreAlt, FaCheckCircle, FaArrowRight, FaBoxOpen, FaChartLine, 
  FaHandHoldingUsd, FaHeadset, FaUsers, FaQuestionCircle, FaStar,
  FaUserTie, FaPhoneAlt, FaEnvelope, FaGlobe, FaShoppingCart, FaTruck,
  FaCreditCard, FaCamera, FaPaintBrush, FaLaptop, FaMobileAlt, FaAppleAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function BecomeVendor() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/vendor/apply');
    } else {
      navigate('/login');
      toast('Please log in to apply as a vendor');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setContactSubmitted(true);
      toast.success('Message sent! We’ll get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => {
        setContactSubmitted(false);
        setShowContactModal(false);
      }, 2000);
    }, 500);
  };

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Vendor testimonials
  const testimonials = [
    {
      name: 'Adaobi Nwosu',
      role: 'Fashion Designer, Lagos',
      quote: 'Joining MarketStore was the best decision for my business. I’ve reached customers I never thought possible!',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 5,
    },
    {
      name: 'Chinedu Okonkwo',
      role: 'Artisan Crafts, Enugu',
      quote: 'The platform is easy to use and payments are always on time. Highly recommended!',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5,
    },
    {
      name: 'Fatima Bello',
      role: 'Organic Farmer, Kaduna',
      quote: 'MarketStore helped me sell my produce directly to urban buyers. My income has doubled!',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5,
    },
  ];

  // FAQ items
  const faqs = [
    {
      question: 'What are the requirements to become a vendor?',
      answer: 'You need a valid business registration (or proof of identity), a bank account for payouts, and products to sell. We’ll guide you through the simple application process.',
    },
    {
      question: 'How much does it cost to sell on MarketStore?',
      answer: 'There are no monthly fees. We charge a 5% commission on each successful sale. That’s it!',
    },
    {
      question: 'How do I get paid?',
      answer: 'Payouts are processed weekly via bank transfer to your registered account. You’ll receive a notification when funds are sent.',
    },
    {
      question: 'Can I sell internationally?',
      answer: 'Currently, our marketplace focuses on Nigeria, but we’re expanding soon. You can already sell to customers across the country.',
    },
    {
      question: 'What kind of products can I sell?',
      answer: 'We accept a wide range of products – fashion, electronics, home goods, food items, crafts, and more. Prohibited items are listed in our terms.',
    },
  ];

  // Benefits data (expanded)
  const benefits = [
    { icon: FaBoxOpen, title: 'Easy Product Upload', desc: 'Add your products in minutes with our simple dashboard. Bulk upload also supported.' },
    { icon: FaHandHoldingUsd, title: 'Secure Payments', desc: 'Get paid safely through our trusted payment gateway with fraud protection.' },
    { icon: FaChartLine, title: 'Marketing Support', desc: 'We promote your products via email, social media, and targeted ads to boost sales.' },
    { icon: FaHeadset, title: '24/7 Support', desc: 'Our dedicated vendor support team is available via chat, email, and phone.' },
    { icon: FaTruck, title: 'Logistics Assistance', desc: 'We partner with top courier services to ensure fast, affordable shipping.' },
    { icon: FaCreditCard, title: 'Multiple Payout Options', desc: 'Receive weekly payouts via bank transfer or mobile money (coming soon).' },
  ];

  // Steps data
  const steps = [
    { number: 1, title: 'Apply Online', desc: 'Fill out our simple application form. It takes only a few minutes.' },
    { number: 2, title: 'Get Approved', desc: 'We’ll review your application and notify you within 48 hours.' },
    { number: 3, title: 'Start Selling', desc: 'Once approved, list your products and start earning!' },
  ];

  // Product categories you can sell
  const categories = [
    { name: 'Fashion', icon: FaUserTie, bg: '#f3f4f6' },
    { name: 'Electronics', icon: FaLaptop, bg: '#e0e7ff' },
    { name: 'Home & Living', icon: FaStoreAlt, bg: '#fef3c7' },
    { name: 'Beauty & Health', icon: FaPaintBrush, bg: '#fce7f3' },
    { name: 'Food & Groceries', icon: FaAppleAlt, bg: '#d1fae5' },
    { name: 'Mobile & Accessories', icon: FaMobileAlt, bg: '#e0f2fe' },
    { name: 'Crafts & Art', icon: FaCamera, bg: '#f3e8ff' },
    { name: 'Books & Stationery', icon: FaShoppingCart, bg: '#ffedd5' },
  ];

  // Gallery images (vendor products)
  const galleryImages = [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', // fashion
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', // electronics
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400', // home
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', // beauty
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', // food
    'https://images.unsplash.com/photo-1598327105859-78c7b3ef53c2?w=400', // mobile
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400', // crafts
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', // books
  ];

  // Comparison table (MarketStore vs other platforms)
  const comparison = [
    { feature: 'Monthly Fees', marketstore: 'No fees', other: '₦5,000+', highlight: true },
    { feature: 'Commission Rate', marketstore: '5%', other: '10-20%', highlight: true },
    { feature: 'Payout Speed', marketstore: 'Weekly', other: 'Bi-weekly', highlight: true },
    { feature: 'Marketing Support', marketstore: 'Included', other: 'Paid add-on', highlight: true },
    { feature: 'Customer Support', marketstore: '24/7 Priority', other: 'Email only', highlight: true },
  ];

  return (
    <>
      <style>{`
        .vendor-hero {
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 80px 0;
        }
        .benefit-card, .step-card, .testimonial-card, .category-card, .gallery-img {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .benefit-card:hover, .step-card:hover, .testimonial-card:hover, .category-card:hover, .gallery-img:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .stat-card {
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .gallery-img {
          cursor: pointer;
          overflow: hidden;
          position: relative;
        }
        .gallery-img img {
          transition: transform 0.5s ease;
        }
        .gallery-img:hover img {
          transform: scale(1.05);
        }
        .comparison-table td {
          vertical-align: middle;
        }
        @media (max-width: 768px) {
          .vendor-hero {
            padding: 60px 0;
          }
        }
      `}</style>

      {/* Hero Section with Split Layout */}
      <div className="vendor-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Sell on MarketStore</h1>
              <p className="lead mb-4">Reach thousands of customers across Nigeria and Africa. Join the fastest‑growing marketplace.</p>
              <Button variant="light" size="lg" onClick={handleStart} className="rounded-pill px-4 py-2">
                <FaStoreAlt className="me-2" /> Become a Vendor
              </Button>
              <Button variant="outline-light" size="lg" onClick={() => setShowContactModal(true)} className="rounded-pill px-4 py-2 ms-3">
                Contact Sales
              </Button>
            </Col>
            <Col lg={6}>
              <Image 
                src="https://images.unsplash.com/photo-1556742031-c6961e8561b0?w=800" 
                alt="Vendor" 
                fluid 
                rounded 
                className="shadow-lg"
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Stats / Highlights */}
        <Row className="g-4 mb-5">
          <Col md={3}>
            <Card className="border-0 shadow-sm stat-card text-center">
              <Card.Body className="p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">2,000+</h2>
                <p className="text-muted mt-2">Active Vendors</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm stat-card text-center">
              <Card.Body className="p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">₦50M+</h2>
                <p className="text-muted mt-2">Vendor Earnings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm stat-card text-center">
              <Card.Body className="p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">50K+</h2>
                <p className="text-muted mt-2">Products Sold</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm stat-card text-center">
              <Card.Body className="p-4">
                <h2 className="display-5 fw-bold text-primary mb-0">4.8★</h2>
                <p className="text-muted mt-2">Vendor Rating</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Benefits Section (expanded) */}
        <h2 className="display-6 fw-bold text-center mb-4">Why Sell with Us?</h2>
        <Row className="g-4 mb-5">
          {benefits.map((benefit, idx) => (
            <Col md={4} key={idx}>
              <Card className="border-0 shadow-sm benefit-card h-100">
                <Card.Body className="p-4">
                  <benefit.icon size={40} className="text-primary mb-3" />
                  <h5 className="fw-bold">{benefit.title}</h5>
                  <p className="text-muted">{benefit.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Categories you can sell (grid) */}
        <h2 className="display-6 fw-bold text-center mb-4">What Can You Sell?</h2>
        <Row className="g-4 mb-5">
          {categories.map((cat, idx) => (
            <Col md={3} key={idx}>
              <Card className="border-0 shadow-sm category-card text-center h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '60px' }}>
                    <cat.icon size={32} className="text-primary" />
                  </div>
                  <Card.Text className="mt-2 mb-0 fw-semibold">{cat.name}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Gallery – click to enlarge */}
        <h2 className="display-6 fw-bold text-center mb-4">Vendor Showcase</h2>
        <Row className="g-3 mb-5">
          {galleryImages.map((img, idx) => (
            <Col md={3} key={idx}>
              <div className="gallery-img rounded overflow-hidden shadow-sm" onClick={() => openImageModal(img)}>
                <Image src={img} fluid style={{ height: '150px', objectFit: 'cover', width: '100%' }} />
              </div>
            </Col>
          ))}
        </Row>

        {/* Step-by-Step Guide */}
        <h2 className="display-6 fw-bold text-center mb-4">How to Get Started</h2>
        <Row className="g-4 mb-5">
          {steps.map((step) => (
            <Col md={4} key={step.number}>
              <Card className="border-0 shadow-sm step-card h-100 text-center">
                <Card.Body className="p-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>
                    {step.number}
                  </div>
                  <h5 className="fw-bold">{step.title}</h5>
                  <p className="text-muted">{step.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Comparison Table */}
        <h2 className="display-6 fw-bold text-center mb-4">MarketStore vs Others</h2>
        <Row className="justify-content-center mb-5">
          <Col lg={8}>
            <Table bordered responsive className="shadow-sm">
              <thead className="bg-light">
                <tr>
                  <th>Feature</th>
                  <th className="text-primary">MarketStore</th>
                  <th>Other Platforms</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.feature}</td>
                    <td className={item.highlight ? 'fw-bold text-success' : ''}>{item.marketstore}</td>
                    <td>{item.other}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>

        {/* Vendor Success Stories */}
        <h2 className="display-6 fw-bold text-center mb-4">Vendor Success Stories</h2>
        <Row className="g-4 mb-5">
          {testimonials.map((test, idx) => (
            <Col md={4} key={idx}>
              <Card className="border-0 shadow-sm testimonial-card h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <Image src={test.image} roundedCircle width="50" height="50" className="me-3" />
                    <div>
                      <h6 className="mb-0 fw-bold">{test.name}</h6>
                      <small className="text-muted">{test.role}</small>
                    </div>
                  </div>
                  <div className="d-flex text-warning mb-2">
                    {[...Array(5)].map((_, i) => <FaStar key={i} size={14} />)}
                  </div>
                  <p className="text-muted mb-0">“{test.quote}”</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* FAQ Accordion */}
        <h2 className="display-6 fw-bold text-center mb-4">Frequently Asked Questions</h2>
        <Row className="justify-content-center mb-5">
          <Col lg={8}>
            <Accordion>
              {faqs.map((faq, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx}>
                  <Accordion.Header>
                    <FaQuestionCircle className="text-primary me-2" /> {faq.question}
                  </Accordion.Header>
                  <Accordion.Body>{faq.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* Call to Action */}
        <div className="text-center bg-light p-5 rounded-4 shadow-sm mb-5">
          <h2 className="display-6 fw-bold mb-3">Ready to Start Selling?</h2>
          <p className="lead mb-4">Join thousands of successful vendors on MarketStore today.</p>
          <Button variant="primary" size="lg" onClick={handleStart} className="rounded-pill px-4 me-3">
            <FaStoreAlt className="me-2" /> Apply Now
          </Button>
          <Button variant="outline-primary" size="lg" onClick={() => setShowContactModal(true)} className="rounded-pill px-4">
            <FaHeadset className="me-2" /> Contact Sales
          </Button>
          <p className="text-muted mt-4">Or call us: <strong>+234 801 234 5678</strong> | Email: <strong>vendors@marketstore.com</strong></p>
        </div>
      </Container>

      {/* Contact Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Get in Touch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contactSubmitted ? (
            <div className="text-center py-4">
              <FaCheckCircle size={50} className="text-success mb-3" />
              <h5>Message Sent!</h5>
              <p>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <Form onSubmit={handleContactSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                  placeholder="Enter your full name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                  placeholder="you@example.com"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message / Question</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  placeholder="Tell us about your business..."
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100">
                Send Message
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Image Gallery Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
        <Modal.Body className="p-0">
          {selectedImage && <Image src={selectedImage} fluid />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BecomeVendor;
