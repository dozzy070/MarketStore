// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaStore, 
  FaCheckCircle,
  FaArrowLeft,
  FaEnvelopeOpenText
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSent(true);
        toast.success('Reset email sent! Check your inbox.');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-5">
        <Row className="w-100">
          <Col lg={5} md={8} className="mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div className="bg-primary text-white text-center py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex p-3 mb-3">
                    <FaEnvelopeOpenText size={32} className="text-white" />
                  </div>
                  <h3 className="mb-1 fw-bold">Forgot Password?</h3>
                  <p className="mb-0 text-white-50">We'll help you reset it</p>
                </div>

                <Card.Body className="p-4 p-lg-5">
                  {sent ? (
                    <div className="text-center py-4">
                      <FaCheckCircle size={60} className="text-success mb-3" />
                      <h5>Check Your Email</h5>
                      <p className="text-muted">
                        We've sent password reset instructions to <strong>{email}</strong>
                      </p>
                      <Link to="/login">
                        <Button variant="primary" className="mt-3">
                          Back to Login
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible className="rounded-3">
                          {error}
                        </Alert>
                      )}

                      <div className="text-center mb-4">
                        <p className="text-muted small">
                          Enter your email address and we'll send you instructions to reset your password.
                        </p>
                      </div>

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted">EMAIL ADDRESS</Form.Label>
                        <InputGroup className="border rounded-3 overflow-hidden">
                          <InputGroup.Text className="bg-white border-0">
                            <FaEnvelope className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            placeholder="hello@marketstore.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="border-0 py-3"
                            style={{ background: '#f8f9fa' }}
                          />
                        </InputGroup>
                      </Form.Group>

                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 py-3 mb-4 rounded-3 fw-bold"
                        disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Instructions'
                        )}
                      </Button>

                      <div className="text-center">
                        <Link to="/login" className="text-decoration-none">
                          <FaArrowLeft className="me-2" /> Back to Login
                        </Link>
                      </div>
                    </form>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .forgot-password-page {
          position: relative;
          overflow: hidden;
        }
        
        .forgot-password-page::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: moveBackground 60s linear infinite;
          pointer-events: none;
        }
        
        @keyframes moveBackground {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;
