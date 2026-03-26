// frontend/src/pages/help/VendorHelp.jsx
import React from 'react';
import { Container, Row, Col, Card, Accordion, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaStore, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaBox, 
  FaUsers, 
  FaArrowLeft, 
  FaCheckCircle,
  FaTruck,
  FaStar,
  FaQuestionCircle
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';

function VendorHelp() {
  const commissionRates = [
    { category: 'Electronics', rate: '5%', min: '₦1,000', max: 'No limit' },
    { category: 'Fashion', rate: '4%', min: '₦500', max: 'No limit' },
    { category: 'Home & Living', rate: '4.5%', min: '₦500', max: 'No limit' },
    { category: 'Sports', rate: '4%', min: '₦500', max: 'No limit' },
    { category: 'Beauty', rate: '5%', min: '₦500', max: 'No limit' },
    { category: 'Books', rate: '3.5%', min: '₦200', max: 'No limit' }
  ];

  const vendorSteps = [
    { 
      step: 1, 
      title: 'Apply to Become a Vendor', 
      description: 'Fill out the vendor application form with your business details, tax ID, and store information.' 
    },
    { 
      step: 2, 
      title: 'Verification Process', 
      description: 'Our team reviews your application within 2-3 business days. You may be contacted for additional verification.' 
    },
    { 
      step: 3, 
      title: 'Set Up Your Store', 
      description: 'Once approved, customize your store profile, add logo, banner, and store description.' 
    },
    { 
      step: 4, 
      title: 'Add Products', 
      description: 'Start listing your products with high-quality images, detailed descriptions, and competitive prices.' 
    },
    { 
      step: 5, 
      title: 'Start Selling', 
      description: 'Receive orders, manage inventory, and process shipments to customers.' 
    }
  ];

  const faqs = [
    {
      question: 'How do I become a vendor?',
      answer: 'Click on your profile icon, select "Become a Vendor", fill out the application form with your business details, and submit for review. Our team will approve your application within 2-3 business days.'
    },
    {
      question: 'What are the vendor fees and commissions?',
      answer: 'We charge a commission on each sale ranging from 3.5% to 5% depending on the product category. There are no monthly subscription fees. Payouts are processed weekly.'
    },
    {
      question: 'How do I get paid?',
      answer: 'Payouts are processed weekly to your registered bank account. You need to have a minimum of ₦10,000 in your earnings to receive a payout. Payment is made within 3-5 business days after the payout is processed.'
    },
    {
      question: 'How do I manage my products?',
      answer: 'Log in to your vendor dashboard, go to "Products" section. You can add, edit, or remove products. Make sure to include high-quality images and detailed descriptions for better visibility.'
    },
    {
      question: 'What happens when I receive an order?',
      answer: 'You\'ll receive an email notification. Go to "Orders" in your dashboard, review the order details, prepare the items for shipping, and update the order status to "Shipped" with tracking information.'
    },
    {
      question: 'How are returns handled?',
      answer: 'If a customer requests a return, you\'ll be notified. Review the request and approve if it meets return criteria. The customer will return the item, and once received, you can process the refund or exchange.'
    },
    {
      question: 'How do I improve my store visibility?',
      answer: 'Maintain high product ratings, respond to customer reviews quickly, offer competitive prices, use high-quality images, and keep inventory updated. Featured products get priority visibility.'
    },
    {
      question: 'Can I run promotions on my store?',
      answer: 'Yes! You can create discount coupons, bundle deals, and seasonal promotions. Contact our support team to learn about featured promotions and marketing opportunities.'
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
          <Col lg={8} className="mx-auto">
            <div className="text-center mb-5">
              <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <FaStore size={40} className="text-danger" />
              </div>
              <h1 className="display-5 fw-bold mb-3">Vendor Help</h1>
              <p className="lead text-muted">
                Everything you need to know about selling on MarketStore
              </p>
              <Badge bg="success" className="me-2">Apply Now</Badge>
              <Badge bg="info">Vendor Dashboard</Badge>
            </div>

            {/* Getting Started */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">How to Become a Vendor</h5>
                <div className="vendor-steps">
                  {vendorSteps.map((step) => (
                    <div key={step.step} className="d-flex align-items-start gap-3 mb-4">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                        {step.step}
                      </div>
                      <div>
                        <h6 className="mb-1">{step.title}</h6>
                        <p className="text-muted mb-0">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="primary" as={Link} to="/vendor/apply" className="mt-2">
                  Apply to Become a Vendor
                </Button>
              </Card.Body>
            </Card>

            {/* Commission Rates */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Commission Rates by Category</h5>
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Category</th>
                      <th>Commission Rate</th>
                      <th>Minimum Sale</th>
                      <th>Maximum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionRates.map((rate, index) => (
                      <tr key={index}>
                        <td>{rate.category}</td>
                        <td><Badge bg="primary">{rate.rate}</Badge></td>
                        <td>{rate.min}</td>
                        <td>{rate.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="mt-3 text-muted small">
                  <FaQuestionCircle className="me-1" /> 
                  Commissions are calculated on the final sale price (excluding shipping)
                </div>
              </Card.Body>
            </Card>

            {/* Vendor Benefits */}
            <Row className="g-4 mb-4">
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center p-4">
                    <FaChartLine size={40} className="text-primary mb-3" />
                    <h6>Analytics Dashboard</h6>
                    <p className="text-muted small">Track sales, views, and customer insights</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center p-4">
                    <FaMoneyBillWave size={40} className="text-success mb-3" />
                    <h6>Weekly Payouts</h6>
                    <p className="text-muted small">Get paid every week directly to your bank</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center p-4">
                    <FaUsers size={40} className="text-info mb-3" />
                    <h6>Dedicated Support</h6>
                    <p className="text-muted small">Priority support for vendors</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center p-4">
                    <FaStar size={40} className="text-warning mb-3" />
                    <h6>Promotion Opportunities</h6>
                    <p className="text-muted small">Get featured in marketing campaigns</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* FAQs */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Vendor FAQs</h5>
                <Accordion>
                  {faqs.map((faq, index) => (
                    <Accordion.Item key={index} eventKey={index.toString()} className="border-0 mb-2">
                      <Accordion.Header className="bg-light rounded">
                        {faq.question}
                      </Accordion.Header>
                      <Accordion.Body className="text-muted">
                        {faq.answer}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>

            {/* Contact Support */}
            <Card className="border-0 bg-danger text-white text-center">
              <Card.Body className="p-4">
                <FaCheckCircle size={40} className="mb-3" />
                <h5>Need Vendor Support?</h5>
                <p className="mb-3">Our vendor support team is here to help you succeed</p>
                <Button variant="light" href="mailto:vendors@marketstore.com">
                  Contact Vendor Support
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default VendorHelp;