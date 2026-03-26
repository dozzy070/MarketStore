import React from 'react';
import { Container, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';

function AccountHelp() {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the "Register" button at the top right corner. Fill in your details including name, email, and password. You\'ll receive a verification email to activate your account.'
    },
    {
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password" on the login page. Enter your registered email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Log in to your account, go to "My Profile" from the dashboard. You can update your name, phone number, location, and profile picture. Click "Save Changes" to update.'
    },
    {
      question: 'How do I change my email address?',
      answer: 'Go to Settings > Security. Enter your new email address and confirm your password. We\'ll send a verification link to your new email to confirm the change.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'To delete your account, please contact our support team. They will guide you through the account deletion process and ensure all your data is handled properly.'
    },
    {
      question: 'What if I don\'t receive verification email?',
      answer: 'Check your spam/junk folder. If you still don\'t see it, click "Resend Verification" on the login page. Make sure you entered the correct email address.'
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
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <FaUser size={40} className="text-primary" />
              </div>
              <h1 className="display-5 fw-bold mb-3">Account Help</h1>
              <p className="lead text-muted">
                Everything you need to know about managing your MarketStore account
              </p>
            </div>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Common Account Questions</h5>
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

            <Card className="border-0 bg-primary text-white text-center">
              <Card.Body className="p-4">
                <FaCheckCircle size={40} className="mb-3" />
                <h5>Still have questions?</h5>
                <p className="mb-3">Our support team is here to help</p>
                <Button variant="light" as={Link} to="/help/contact">
                  Contact Support
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default AccountHelp;