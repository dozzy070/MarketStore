import React from 'react';
import { Container, Row, Col, Card, Accordion, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';

function PaymentsHelp() {
  const paymentMethods = [
    { name: 'Credit/Debit Cards', icon: FaCreditCard, description: 'Visa, Mastercard, Verve accepted' },
    { name: 'Bank Transfer', icon: FaMoneyBillWave, description: 'Direct transfer to our account' },
    { name: 'PayPal', icon: FaCreditCard, description: 'International payments' }
  ];

  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Credit/Debit Cards (Visa, Mastercard, Verve), Bank Transfer, and PayPal. All payments are processed securely through encrypted connections.'
    },
    {
      question: 'Is it safe to use my credit card on MarketStore?',
      answer: 'Yes! We use industry-standard SSL encryption to protect your payment information. We never store your full card details on our servers.'
    },
    {
      question: 'Why was my payment declined?',
      answer: 'Common reasons include: insufficient funds, incorrect card details, bank security flags, or expired card. Contact your bank for more information.'
    },
    {
      question: 'When will I be charged?',
      answer: 'Your payment is processed immediately when you place an order. You\'ll receive a confirmation email once the payment is successful.'
    },
    {
      question: 'Do you offer installment payments?',
      answer: 'Currently, we don\'t offer installment payments. We\'re working on introducing this feature in the future.'
    },
    {
      question: 'How do I get a refund?',
      answer: 'Refunds are processed automatically when a return is approved. The refund will be credited to your original payment method within 5-7 business days.'
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
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <FaCreditCard size={40} className="text-info" />
              </div>
              <h1 className="display-5 fw-bold mb-3">Payments</h1>
              <p className="lead text-muted">
                Secure payment options and billing information
              </p>
            </div>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Accepted Payment Methods</h5>
                <Row className="g-4">
                  {paymentMethods.map((method, index) => {
                    const Icon = method.icon;
                    return (
                      <Col md={4} key={index}>
                        <div className="text-center p-3 border rounded">
                          <Icon size={40} className="text-primary mb-3" />
                          <h6>{method.name}</h6>
                          <small className="text-muted">{method.description}</small>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaShieldAlt size={30} className="text-success me-3" />
                  <div>
                    <h6 className="mb-0">100% Secure Payments</h6>
                    <small className="text-muted">Your payment information is encrypted and secure</small>
                  </div>
                </div>
                <Badge bg="success" className="mb-3">PCI DSS Compliant</Badge>
                <Badge bg="info" className="ms-2 mb-3">SSL Encrypted</Badge>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Payment FAQs</h5>
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
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default PaymentsHelp;