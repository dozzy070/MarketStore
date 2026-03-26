import React from 'react';
import { Container, Row, Col, Card, Accordion, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTruck, FaMapMarkerAlt, FaClock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';

function OrdersShipping() {
  const shippingZones = [
    { zone: 'Lagos Mainland', cost: '₦1,500', time: '1-2 days' },
    { zone: 'Lagos Island', cost: '₦2,000', time: '1-2 days' },
    { zone: 'Other States (North)', cost: '₦3,500', time: '3-5 days' },
    { zone: 'Other States (South)', cost: '₦2,500', time: '2-4 days' },
    { zone: 'International', cost: '₦15,000+', time: '7-14 days' }
  ];

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'Log in to your account and go to "My Orders". Click on the order you want to track. You\'ll see the tracking number and current status. Click the tracking number to see detailed delivery updates.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard delivery takes 3-5 business days within Nigeria. Express delivery (where available) takes 1-2 business days. International shipping takes 7-14 business days depending on location.'
    },
    {
      question: 'Do you offer free shipping?',
      answer: 'Yes! Free shipping on all orders above ₦50,000 within Nigeria. For orders below this amount, standard shipping rates apply based on your location.'
    },
    {
      question: 'Can I change my shipping address after ordering?',
      answer: 'Address changes are only possible if the order hasn\'t been processed yet. Contact our support team immediately with your order number and new address.'
    },
    {
      question: 'What if my package is delayed?',
      answer: 'If your package hasn\'t arrived within the estimated delivery time, please contact our support team. We\'ll investigate and provide updates within 24 hours.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to select international destinations. Shipping costs and delivery times vary by location. You can see the shipping cost at checkout.'
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
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <FaTruck size={40} className="text-success" />
              </div>
              <h1 className="display-5 fw-bold mb-3">Orders & Shipping</h1>
              <p className="lead text-muted">
                Track your orders and learn about our shipping policies
              </p>
            </div>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Shipping Rates & Delivery Times</h5>
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Delivery Zone</th>
                      <th>Cost</th>
                      <th>Estimated Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingZones.map((zone, index) => (
                      <tr key={index}>
                        <td>{zone.zone}</td>
                        <td>{zone.cost}</td>
                        <td><Badge bg="info">{zone.time}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Frequently Asked Questions</h5>
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

            <Card className="border-0 bg-success text-white text-center">
              <Card.Body className="p-4">
                <FaCheckCircle size={40} className="mb-3" />
                <h5>Need help tracking your order?</h5>
                <p className="mb-3">We're here to help you every step of the way</p>
                <Button variant="light" as={Link} to="/user/orders">
                  Track Your Order
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default OrdersShipping;