import React from 'react';
import { Container, Row, Col, Card, Accordion, Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUndo, FaMoneyBillWave, FaClock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';

function ReturnsRefunds() {
  const returnSteps = [
    { step: 1, title: 'Initiate Return', description: 'Log in to your account, go to "My Orders", select the order and click "Return Item".' },
    { step: 2, title: 'Print Return Label', description: 'Download and print the return shipping label. Pack the item securely in original packaging.' },
    { step: 3, title: 'Ship Item Back', description: 'Drop off the package at any authorized shipping location. Keep the tracking number.' },
    { step: 4, title: 'Quality Check', description: 'We inspect the returned item to ensure it meets return conditions.' },
    { step: 5, title: 'Refund Processed', description: 'Refund is processed within 5-7 business days after approval.' }
  ];

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy. Items must be unused, in original packaging, and include all tags and accessories. Some items like perishable goods, intimate items, and digital products are non-returnable.'
    },
    {
      question: 'How do I start a return?',
      answer: 'Log in to your account, go to "My Orders", find the order containing the item you want to return, and click "Return Item". Follow the instructions to complete the return request.'
    },
    {
      question: 'How long does it take to get a refund?',
      answer: 'Once we receive and inspect your return, refunds are processed within 5-7 business days. The time it takes for the refund to appear in your account depends on your payment method and bank.'
    },
    {
      question: 'Do I have to pay for return shipping?',
      answer: 'Return shipping is free for defective items or if we made an error. For other returns, return shipping costs are deducted from your refund unless you qualify for free returns.'
    },
    {
      question: 'Can I exchange an item instead of refund?',
      answer: 'Yes! When initiating a return, you can select "Exchange" instead of "Refund". We\'ll process the exchange once we receive your return.'
    },
    {
      question: 'What if my item arrives damaged?',
      answer: 'Contact our support team immediately with photos of the damaged item and packaging. We\'ll arrange for a replacement or full refund at no cost to you.'
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
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <FaUndo size={40} className="text-warning" />
              </div>
              <h1 className="display-5 fw-bold mb-3">Returns & Refunds</h1>
              <p className="lead text-muted">
                Easy returns and quick refunds for your peace of mind
              </p>
            </div>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">How to Return an Item</h5>
                <ListGroup variant="flush">
                  {returnSteps.map((step) => (
                    <ListGroup.Item key={step.step} className="d-flex align-items-start gap-3 border-0 py-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                        {step.step}
                      </div>
                      <div>
                        <h6 className="mb-1">{step.title}</h6>
                        <p className="text-muted mb-0">{step.description}</p>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Return Policy FAQs</h5>
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

            <Card className="border-0 bg-warning text-white text-center">
              <Card.Body className="p-4">
                <FaCheckCircle size={40} className="mb-3" />
                <h5>Ready to start a return?</h5>
                <p className="mb-3">We'll guide you through the process</p>
                <Button variant="light" as={Link} to="/user/orders">
                  Start a Return
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default ReturnsRefunds;