import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock,
  FaPaperPlane
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully!');
      
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <Container className="py-4">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
          <p className="lead text-muted">
            Get in touch with our support team
          </p>
        </div>

        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-4">Contact Information</h5>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <FaEnvelope className="text-primary" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-1">Email</h6>
                    <p className="text-muted mb-0">support@marketstore.com</p>
                    <p className="text-muted">info@marketstore.com</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <FaPhone className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-1">Phone</h6>
                    <p className="text-muted mb-0">+234 801 234 5678</p>
                    <p className="text-muted">+234 809 876 5432</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <FaMapMarkerAlt className="text-warning" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-1">Address</h6>
                    <p className="text-muted mb-0">
                      123 Tech Avenue,<br />
                      Ikeja, Lagos,<br />
                      Nigeria
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <FaClock className="text-info" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-1">Business Hours</h6>
                    <p className="text-muted mb-0">Monday - Friday: 9am - 6pm</p>
                    <p className="text-muted">Saturday: 10am - 4pm</p>
                    <p className="text-muted">Sunday: Closed</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="mb-4">Send us a Message</h5>

                {submitted && (
                  <Alert variant="success" className="mb-4">
                    Thank you for contacting us! We'll get back to you soon.
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this about?"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Write your message here..."
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={submitting}
                    className="px-5"
                  >
                    {submitting ? 'Sending...' : (
                      <>
                        <FaPaperPlane className="me-2" /> Send Message
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}

export default Contact;