// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaStore, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaKey,
  FaArrowLeft
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(true);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError('No reset token provided. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successfully! Please login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="reset-password-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
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
                      <FaStore size={32} className="text-white" />
                    </div>
                    <h3 className="mb-1 fw-bold">Invalid Reset Link</h3>
                  </div>
                  <Card.Body className="p-4 p-lg-5 text-center">
                    <FaExclamationTriangle size={60} className="text-danger mb-4" />
                    <h5>Invalid or Expired Token</h5>
                    <p className="text-muted mb-4">
                      The password reset link is invalid or has expired.
                      Please request a new password reset.
                    </p>
                    <Link to="/forgot-password">
                      <Button variant="primary" className="px-4">
                        Request New Reset Link
                      </Button>
                    </Link>
                    <div className="mt-3">
                      <Link to="/login" className="text-decoration-none">
                        <FaArrowLeft className="me-2" /> Back to Login
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="reset-password-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-5">
        <Row className="w-100">
          <Col lg={5} md={8} className="mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                {/* Header */}
                <div className="bg-primary text-white text-center py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex p-3 mb-3">
                    <FaKey size={32} className="text-white" />
                  </div>
                  <h3 className="mb-1 fw-bold">Create New Password</h3>
                  <p className="mb-0 text-white-50">Enter your new password below</p>
                </div>

                <Card.Body className="p-4 p-lg-5">
                  {success ? (
                    <div className="text-center py-4">
                      <FaCheckCircle size={60} className="text-success mb-3" />
                      <h5>Password Reset Successfully!</h5>
                      <p className="text-muted">
                        Your password has been reset. Redirecting you to login...
                      </p>
                      <div className="spinner-border text-primary mt-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible className="rounded-3">
                          {error}
                        </Alert>
                      )}

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted">NEW PASSWORD</Form.Label>
                        <InputGroup className="border rounded-3 overflow-hidden">
                          <InputGroup.Text className="bg-white border-0">
                            <FaLock className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="border-0 py-3"
                            style={{ background: '#f8f9fa' }}
                          />
                          <Button
                            variant="link"
                            onClick={() => setShowPassword(!showPassword)}
                            className="border-0 bg-white text-muted"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Password must be at least 6 characters
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted">CONFIRM PASSWORD</Form.Label>
                        <InputGroup className="border rounded-3 overflow-hidden">
                          <InputGroup.Text className="bg-white border-0">
                            <FaLock className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="border-0 py-3"
                            style={{ background: '#f8f9fa' }}
                          />
                          <Button
                            variant="link"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="border-0 bg-white text-muted"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
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
                            Resetting Password...
                          </>
                        ) : (
                          'Reset Password'
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
        .reset-password-page {
          position: relative;
          overflow: hidden;
        }
        
        .reset-password-page::before {
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
        
        .btn-primary {
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
}

export default ResetPassword;
