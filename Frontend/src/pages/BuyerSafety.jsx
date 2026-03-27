import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Modal, Form, Accordion, Badge } from 'react-bootstrap';
import { 
  FaUserShield, FaCheckCircle, FaLock, FaCreditCard, FaEye, 
  FaShieldAlt, FaExclamationTriangle, FaPhoneAlt, FaEnvelope, 
  FaQuestionCircle, FaArrowRight, FaFileAlt, FaHandHoldingUsd,
  FaSearch, FaChartLine, FaBoxOpen, FaShoppingBag, FaGlobe,
  FaClock, FaUserSecret, FaHandSpock
} from 'react-icons/fa';
import toast from 'react-hot-toast';

function BuyerSafety() {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ orderId: '', issue: '', description: '' });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Stats data
  const stats = [
    { icon: FaLock, value: '100%', label: 'Encrypted Transactions' },
    { icon: FaUserShield, value: '100%', label: 'Vendor Verification' },
    { icon: FaCheckCircle, value: '99.9%', label: 'Satisfied Buyers' },
    { icon: FaHandHoldingUsd, value: '30 Days', label: 'Money‑Back Guarantee' },
  ];

  // Security features
  const securityFeatures = [
    {
      icon: FaCreditCard,
      title: 'Secure Payments',
      desc: 'All transactions are processed through Paystack and other trusted gateways with PCI‑DSS compliance.',
    },
    {
      icon: FaUserShield,
      title: 'Vendor Verification',
      desc: 'Every seller undergoes identity verification and business validation before listing products.',
    },
    {
      icon: FaEye,
      title: '24/7 Monitoring',
      desc: 'Our security team actively monitors the platform for suspicious activity.',
    },
    {
      icon: FaFileAlt,
      title: 'Buyer Protection',
      desc: 'If an item doesn’t match the description or never arrives, we’ll help you get a full refund.',
    },
  ];

  // Safety tips
  const safetyTips = [
    { icon: FaBoxOpen, tip: 'Always use the platform’s messaging system for communication.' },
    { icon: FaStar, tip: 'Verify vendor ratings and reviews before making a purchase.' },
    { icon: FaLock, tip: 'Never share your payment details outside the platform.' },
    { icon: FaExclamationTriangle, tip: 'Report suspicious sellers or listings immediately.' },
    { icon: FaCamera, tip: 'Keep screenshots of your conversations as proof.' },
  ];

  // FAQs
  const faqs = [
    {
      q: 'How does buyer protection work?',
      a: 'If you receive an item that is significantly different from the description or if the item never arrives, you can file a dispute within 30 days. We’ll investigate and refund your payment if the claim is valid.',
    },
    {
      q: 'What if I receive a damaged item?',
      a: 'Contact the seller through the platform and provide photos of the damage. If the seller doesn’t resolve the issue within 48 hours, open a dispute and we’ll step in to help.',
    },
    {
      q: 'How do I report a suspicious vendor?',
      a: 'Use the "Report an Issue" button on this page or the "Report" option on the vendor’s profile. Our team will investigate within 24 hours.',
    },
    {
      q: 'Is my payment information secure?',
      a: 'Absolutely. We use industry‑standard encryption (SSL) and never store your full payment details on our servers. Payments are processed by certified payment gateways.',
    },
    {
      q: 'How long does the refund process take?',
      a: 'Once a dispute is resolved in your favour, refunds are processed within 5‑7 business days, depending on your bank.',
    },
  ];

  // Extended safety guide sections (more detailed)
  const guideSections = [
    {
      title: '🔐 Secure Payments & Encryption',
      content: 'All payments on MarketStore are processed through Paystack, a PCI‑DSS Level 1 certified payment gateway. Your card details are never stored on our servers – they are tokenized and encrypted. We also enforce HTTPS across the site, ensuring your data is safe during transmission. We support multiple secure payment methods including cards, bank transfers, and mobile money.',
    },
    {
      title: '✅ Vendor Verification Process',
      content: 'Before a vendor can start selling, they must provide valid identification, business registration (if applicable), and a bank account. Our team manually verifies these documents. We also continuously monitor vendor performance and remove those with repeated complaints. Verified vendors have a special badge on their profile.',
    },
    {
      title: '⚖️ Dispute Resolution',
      content: 'If a problem arises, you can open a dispute from your order page. You and the vendor have 7 days to reach a resolution. If not resolved, our support team steps in to mediate. We review all evidence (messages, photos, tracking numbers) and make a fair decision. The process is transparent and free for buyers.',
    },
    {
      title: '💰 Buyer Protection Guarantee',
      content: 'You are covered for 30 days after the estimated delivery date. If the item does not arrive, is significantly different from the description, or arrives damaged, we will refund your full purchase price including shipping. The process is simple: submit a claim with supporting evidence. We’ll investigate and resolve within 48 hours.',
    },
    {
      title: '🚨 How to Spot Scams',
      content: 'Be cautious of deals that seem too good to be true. Never communicate off‑platform or send money outside MarketStore. Look for verified seller badges and read recent reviews. If a seller pressures you to act quickly or asks for personal information, report them immediately. Also, avoid sharing your OTP or banking details.',
    },
    {
      title: '📦 Order Tracking & Delivery',
      content: 'We provide real‑time order tracking for all shipments. Once your order is shipped, you’ll receive a tracking number. You can also track it in your account under "My Orders". If your order hasn’t arrived within the estimated time, contact the seller first; if unresolved, open a dispute.',
    },
    {
      title: '🛡️ Data Privacy & Protection',
      content: 'We adhere to strict data protection regulations. Your personal information is used only to process orders and improve your experience. We never sell your data to third parties. You can request data deletion anytime from your account settings.',
    },
    {
      title: '📞 Need Immediate Help?',
      content: 'Our support team is available Monday to Friday, 9am‑6pm (WAT). You can reach us via email at support@marketstore.com or phone at +234 801 234 5678. For urgent issues, please use the live chat feature in your dashboard.',
    },
  ];

  // Handle report form
  const handleReportChange = (e) => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.issue || !reportForm.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setReportSubmitted(true);
    toast.success('Your report has been submitted. Our team will review it shortly.');
    setReportForm({ orderId: '', issue: '', description: '' });
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
    }, 2000);
  };

  return (
    <>
      <style>{`
        .safety-hero {
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 80px 0;
          text-align: center;
        }
        .stat-card, .feature-card, .tip-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .stat-card:hover, .feature-card:hover, .tip-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .tip-card {
          background: #f8f9fa;
        }
        @media (max-width: 768px) {
          .safety-hero {
            padding: 60px 0;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="safety-hero">
        <Container>
          <h1 className="display-4 fw-bold mb-3">Buyer Safety</h1>
          <p className="lead mb-4">Your security is our priority – shop with confidence.</p>
          <Button variant="light" size="lg" onClick={() => setShowGuideModal(true)} className="rounded-pill px-4 py-2">
            <FaFileAlt className="me-2" /> Read Safety Guide
          </Button>
        </Container>
      </div>

      <Container className="py-5">
        {/* Stats Section */}
        <Row className="g-4 mb-5">
          {stats.map((stat, idx) => (
            <Col md={3} key={idx}>
              <Card className="border-0 shadow-sm stat-card h-100 text-center">
                <Card.Body className="p-4">
                  <stat.icon size={40} className="text-primary mb-3" />
                  <h2 className="display-5 fw-bold mb-0">{stat.value}</h2>
                  <p className="text-muted mt-2">{stat.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Security Features */}
        <h2 className="display-6 fw-bold text-center mb-4">How We Protect You</h2>
        <Row className="g-4 mb-5">
          {securityFeatures.map((feature, idx) => (
            <Col md={3} key={idx}>
              <Card className="border-0 shadow-sm feature-card h-100 text-center">
                <Card.Body className="p-4">
                  <feature.icon size={40} className="text-primary mb-3" />
                  <h5 className="fw-bold">{feature.title}</h5>
                  <p className="text-muted small">{feature.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Buyer Protection Steps */}
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <h2 className="display-6 fw-bold mb-3">Our Buyer Protection Promise</h2>
            <p>We’re committed to ensuring every purchase is safe and satisfying. If something goes wrong, we’ve got your back.</p>
            <ul className="list-unstyled">
              <li className="mb-2"><FaCheckCircle className="text-success me-2" /> <strong>Money‑Back Guarantee:</strong> Full refund if item is not as described or never arrives.</li>
              <li className="mb-2"><FaCheckCircle className="text-success me-2" /> <strong>Dispute Resolution:</strong> Our team mediates between buyers and sellers to resolve issues.</li>
              <li className="mb-2"><FaCheckCircle className="text-success me-2" /> <strong>Secure Escrow:</strong> Funds are held until you confirm satisfactory delivery.</li>
            </ul>
            <Button variant="outline-primary" onClick={() => setShowGuideModal(true)} className="mt-3">
              Learn More <FaArrowRight className="ms-2" />
            </Button>
          </Col>
          <Col lg={6}>
            <Image 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600" 
              alt="Security" 
              fluid 
              rounded 
              className="shadow-lg"
            />
          </Col>
        </Row>

        {/* Safety Tips */}
        <h2 className="display-6 fw-bold text-center mb-4">Safety Tips for Buyers</h2>
        <Row className="g-4 mb-5">
          {safetyTips.map((tip, idx) => (
            <Col md={4} key={idx}>
              <Card className="border-0 shadow-sm tip-card h-100">
                <Card.Body className="p-4">
                  <tip.icon className="text-primary mb-3" size={30} />
                  <p className="mb-0">{tip.tip}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* FAQ Section */}
        <h2 className="display-6 fw-bold text-center mb-4">Frequently Asked Questions</h2>
        <Row className="justify-content-center mb-5">
          <Col lg={8}>
            <Accordion>
              {faqs.map((faq, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx}>
                  <Accordion.Header>
                    <FaQuestionCircle className="text-primary me-2" /> {faq.q}
                  </Accordion.Header>
                  <Accordion.Body>{faq.a}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* Call to Action */}
        <div className="text-center bg-light p-5 rounded-4 shadow-sm">
          <h2 className="display-6 fw-bold mb-3">Still Have Questions?</h2>
          <p className="lead mb-4">Our support team is ready to help you.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button variant="primary" size="lg" onClick={() => setShowReportModal(true)} className="rounded-pill px-4">
              <FaExclamationTriangle className="me-2" /> Report an Issue
            </Button>
            <Button variant="outline-primary" size="lg" href="mailto:support@marketstore.com" className="rounded-pill px-4">
              <FaEnvelope className="me-2" /> Email Support
            </Button>
            <Button variant="outline-primary" size="lg" href="tel:+2348012345678" className="rounded-pill px-4">
              <FaPhoneAlt className="me-2" /> Call Us
            </Button>
          </div>
          <p className="text-muted mt-4">Or visit our <a href="/help/contact">Help Center</a> for more resources.</p>
        </div>
      </Container>

      {/* Comprehensive Safety Guide Modal */}
      <Modal show={showGuideModal} onHide={() => setShowGuideModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>MarketStore Safety Guide</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="lead">Your complete guide to staying safe while shopping on MarketStore.</p>
          <Accordion defaultActiveKey="0">
            {guideSections.map((section, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={idx}>
                <Accordion.Header>{section.title}</Accordion.Header>
                <Accordion.Body>{section.content}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <div className="bg-light p-3 rounded mt-4">
            <strong>Need immediate assistance?</strong> Contact us at <a href="mailto:support@marketstore.com">support@marketstore.com</a> or call +234 801 234 5678.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGuideModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Report Issue Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report an Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reportSubmitted ? (
            <div className="text-center py-4">
              <FaCheckCircle size={50} className="text-success mb-3" />
              <h5>Report Submitted</h5>
              <p>Thank you. Our team will review your report and get back to you within 24 hours.</p>
            </div>
          ) : (
            <Form onSubmit={handleReportSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Order ID (optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="orderId"
                  value={reportForm.orderId}
                  onChange={handleReportChange}
                  placeholder="e.g., ORD-12345"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Issue Type *</Form.Label>
                <Form.Select name="issue" value={reportForm.issue} onChange={handleReportChange} required>
                  <option value="">Select an issue</option>
                  <option value="item_not_received">Item not received</option>
                  <option value="item_not_as_described">Item not as described</option>
                  <option value="damaged_item">Damaged item</option>
                  <option value="suspicious_vendor">Suspicious vendor</option>
                  <option value="payment_issue">Payment issue</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={reportForm.description}
                  onChange={handleReportChange}
                  placeholder="Please provide details..."
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100">
                Submit Report
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default BuyerSafety;