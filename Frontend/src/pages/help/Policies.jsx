// frontend/src/pages/help/Policies.jsx
import React from 'react';
import { Container, Row, Col, Card, Accordion, Button, Nav, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaFileAlt, 
  FaShieldAlt, 
  FaLock, 
  FaCookie, 
  FaGavel, 
  FaArrowLeft,
  FaCheckCircle,
  FaStore,
  FaUserSecret,
  FaCopyright
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';

function Policies() {
  const policySections = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FaGavel,
      content: (
        <div>
          <h6>1. Acceptance of Terms</h6>
          <p>By accessing or using MarketStore, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          
          <h6 className="mt-4">2. Account Registration</h6>
          <p>You must be at least 18 years old to create an account. You are responsible for maintaining the security of your account and for all activities that occur under your account.</p>
          
          <h6 className="mt-4">3. Products and Services</h6>
          <p>MarketStore is a marketplace connecting buyers and sellers. We do not manufacture or store products. Product listings are provided by independent vendors.</p>
          
          <h6 className="mt-4">4. Pricing and Payments</h6>
          <p>All prices are in Nigerian Naira (₦) unless otherwise stated. We accept various payment methods. Orders are processed upon successful payment confirmation.</p>
          
          <h6 className="mt-4">5. Shipping and Delivery</h6>
          <p>Delivery times vary by location and vendor. Estimated delivery times are provided for reference and are not guaranteed.</p>
          
          <h6 className="mt-4">6. Returns and Refunds</h6>
          <p>Returns are subject to our Return Policy. Customers have 30 days to request returns for eligible items.</p>
          
          <h6 className="mt-4">7. Prohibited Activities</h6>
          <p>You may not use our platform for illegal activities, to infringe on intellectual property rights, or to distribute harmful content.</p>
          
          <h6 className="mt-4">8. Limitation of Liability</h6>
          <p>MarketStore is not liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
          
          <h6 className="mt-4">9. Modifications</h6>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
          
          <h6 className="mt-4">10. Contact</h6>
          <p>For questions about these terms, contact us at legal@marketstore.com</p>
          
          <div className="mt-4 text-muted small">
            Last updated: January 1, 2024
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: FaUserSecret,
      content: (
        <div>
          <h6>Information We Collect</h6>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes:</p>
          <ul>
            <li>Name, email address, phone number, and shipping address</li>
            <li>Payment information (processed securely by our payment partners)</li>
            <li>Order history and preferences</li>
            <li>Communications with our support team</li>
          </ul>
          
          <h6 className="mt-4">How We Use Your Information</h6>
          <p>We use your information to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate about your orders and account</li>
            <li>Improve our services and customer experience</li>
            <li>Send promotional offers (with your consent)</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
          
          <h6 className="mt-4">Information Sharing</h6>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul>
            <li>Vendors to fulfill orders</li>
            <li>Payment processors to handle transactions</li>
            <li>Shipping carriers for delivery</li>
            <li>Law enforcement when required by law</li>
          </ul>
          
          <h6 className="mt-4">Data Security</h6>
          <p>We implement industry-standard security measures to protect your data, including SSL encryption for all transactions.</p>
          
          <h6 className="mt-4">Your Rights</h6>
          <p>You have the right to access, correct, or delete your personal information. Contact our support team to exercise these rights.</p>
          
          <h6 className="mt-4">Cookies</h6>
          <p>We use cookies to enhance your browsing experience and analyze site traffic. You can disable cookies in your browser settings.</p>
          
          <div className="mt-4 text-muted small">
            Last updated: January 1, 2024
          </div>
        </div>
      )
    },
    {
      id: 'cookie',
      title: 'Cookie Policy',
      icon: FaCookie,
      content: (
        <div>
          <h6>What Are Cookies?</h6>
          <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.</p>
          
          <h6 className="mt-4">Types of Cookies We Use</h6>
          <p><strong>Essential Cookies:</strong> Required for basic site functionality, such as keeping you logged in and processing orders.</p>
          <p><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site by collecting anonymous usage data.</p>
          <p><strong>Functionality Cookies:</strong> Remember your preferences, such as language and currency settings.</p>
          <p><strong>Advertising Cookies:</strong> Used to deliver relevant ads and track campaign performance.</p>
          
          <h6 className="mt-4">Managing Cookies</h6>
          <p>You can control and manage cookies in your browser settings. Disabling cookies may affect site functionality.</p>
          
          <div className="mt-4 text-muted small">
            Last updated: January 1, 2024
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security Policy',
      icon: FaShieldAlt,
      content: (
        <div>
          <h6>Payment Security</h6>
          <p>All payments on MarketStore are processed through secure, PCI DSS compliant payment gateways. Your card details are never stored on our servers.</p>
          
          <h6 className="mt-4">Data Protection</h6>
          <p>We use SSL encryption to protect data transmission between your browser and our servers. All sensitive information is encrypted at rest.</p>
          
          <h6 className="mt-4">Account Security</h6>
          <p>We recommend using strong, unique passwords and enabling two-factor authentication for added security. Never share your login credentials.</p>
          
          <h6 className="mt-4">Fraud Prevention</h6>
          <p>We monitor transactions for suspicious activity. If we detect potential fraud, we may contact you to verify the transaction.</p>
          
          <h6 className="mt-4">Reporting Security Issues</h6>
          <p>If you discover a security vulnerability, please report it to security@marketstore.com. We will investigate and address the issue promptly.</p>
          
          <div className="mt-4 text-muted small">
            Last updated: January 1, 2024
          </div>
        </div>
      )
    },
    {
      id: 'seller',
      title: 'Seller Policy',
      icon: FaStore,
      content: (
        <div>
          <h6>Vendor Requirements</h6>
          <p>To become a vendor, you must provide valid business registration, tax identification, and contact information. Vendors are subject to verification.</p>
          
          <h6 className="mt-4">Product Listings</h6>
          <p>All product listings must be accurate, include high-quality images, and comply with our prohibited items policy. Misleading listings may result in account suspension.</p>
          
          <h6 className="mt-4">Order Fulfillment</h6>
          <p>Vendors must process orders within 2 business days and provide tracking information. Failure to fulfill orders may result in penalties.</p>
          
          <h6 className="mt-4">Customer Service</h6>
          <p>Vendors are responsible for responding to customer inquiries within 24 hours and resolving issues promptly.</p>
          
          <h6 className="mt-4">Commissions and Payouts</h6>
          <p>Commissions are calculated per sale and deducted automatically. Payouts are processed weekly for eligible vendors.</p>
          
          <h6 className="mt-4">Prohibited Items</h6>
          <p>Illegal items, counterfeit goods, weapons, adult content, and hazardous materials are prohibited.</p>
          
          <div className="mt-4 text-muted small">
            Last updated: January 1, 2024
          </div>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <Container className="py-4">
        <Button 
          variant="link" 
          className="mb-4 text-decoration-none"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="me-2" /> Back to Help Center
        </Button>

        <Row>
          <Col lg={10} className="mx-auto">
            <div className="text-center mb-5">
              <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <FaFileAlt size={40} className="text-secondary" />
              </div>
              <h1 className="display-5 fw-bold mb-3">Policies & Guidelines</h1>
              <p className="lead text-muted">
                Understanding our policies helps ensure a safe and fair marketplace for everyone
              </p>
            </div>

            <Tab.Container defaultActiveKey="terms">
              <Row>
                <Col md={3}>
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="p-0">
                      <Nav variant="pills" className="flex-column p-3">
                        {policySections.map((section) => {
                          const Icon = section.icon;
                          return (
                            <Nav.Item key={section.id} className="mb-2">
                              <Nav.Link 
                                eventKey={section.id}
                                className="d-flex align-items-center gap-3 p-3 rounded"
                              >
                                <Icon size={18} />
                                <span>{section.title}</span>
                              </Nav.Link>
                            </Nav.Item>
                          );
                        })}
                      </Nav>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={9}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Tab.Content>
                        {policySections.map((section) => (
                          <Tab.Pane key={section.id} eventKey={section.id}>
                            <div className="policy-content">
                              <h4 className="mb-4">{section.title}</h4>
                              {section.content}
                            </div>
                          </Tab.Pane>
                        ))}
                      </Tab.Content>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Container>

            <Card className="border-0 bg-primary text-white text-center mt-4">
              <Card.Body className="p-4">
                <FaCheckCircle size={40} className="mb-3" />
                <h5>Questions About Our Policies?</h5>
                <p className="mb-3">Contact our legal team for clarification on any policy</p>
                <Button variant="light" href="mailto:legal@marketstore.com">
                  Contact Legal Team
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default Policies;