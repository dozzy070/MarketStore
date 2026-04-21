// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, InputGroup, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaStore,
  FaArrowRight,
  FaShieldAlt,
  FaGoogle,
  FaQuestionCircle,
  FaCheckCircle,
  FaTimes,
  FaKey,
  FaEnvelopeOpenText
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import GoogleLoginButton from '../../components/GoogleLoginButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Show success toast if user came from registration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      toast.success('Account created successfully! Please log in.');
      // Remove the query parameter from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check URL for reset token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
      setShowForgotPassword(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back!');

        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Redirect based on role
        const userRole = result.user?.role;
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'vendor') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSent(true);
        toast.success('Reset email sent! Check your inbox.');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setResetPasswordLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        toast.success('Password reset successfully! Please login.');
        setTimeout(() => {
          setShowResetPassword(false);
          setResetSuccess(false);
          setResetToken('');
          setNewPassword('');
          setConfirmPassword('');
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
    setError('');
  };

  const closeResetPassword = () => {
    setShowResetPassword(false);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setResetSuccess(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <div className="login-page" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1
        }}></div>

        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ position: 'relative', zIndex: 1 }}>
          <Row className="w-100">
            <Col lg={5} md={8} className="mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="border-0 shadow-lg" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                  {/* Decorative Header */}
                  <div className="bg-primary text-white text-center py-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0 11-9 20-20 20s-20-9-20-20 9-20 20-20 20 9 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                      opacity: 0.3
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                        className="bg-white bg-opacity-20 rounded-circle d-inline-flex p-3 mb-3"
                        style={{
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <FaStore size={32} className="text-white" />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-1 fw-bold"
                      >
                        Welcome Back
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mb-0 text-white-50"
                      >
                        Sign in to your account
                      </motion.p>
                    </div>
                  </div>

                  <Card.Body className="p-4 p-lg-5">
                    {!showForgotPassword && !showResetPassword ? (
                      <>
                        {/* Error Alert */}
                        {error && (
                          <Alert variant="danger" onClose={() => setError('')} dismissible className="rounded-3">
                            {error}
                          </Alert>
                        )}

                        {/* Login Form */}
                        <Form onSubmit={handleSubmit}>
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

                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">PASSWORD</Form.Label>
                            <InputGroup className="border rounded-3 overflow-hidden">
                              <InputGroup.Text className="bg-white border-0">
                                <FaLock className="text-muted" />
                              </InputGroup.Text>
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                          </Form.Group>

                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <Form.Check
                              type="checkbox"
                              label="Remember me"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="small"
                            />
                            <Button
                              variant="link"
                              className="p-0 text-decoration-none small"
                              onClick={() => setShowForgotPassword(true)}
                              disabled={loading}
                            >
                              Forgot password?
                            </Button>
                          </div>

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
                                Signing In...
                              </>
                            ) : (
                              <>
                                Sign In <FaArrowRight className="ms-2" />
                              </>
                            )}
                          </Button>
                        </Form>

                        {/* Divider */}
                        <div className="position-relative text-center my-4">
                          <hr className="text-muted" />
                          <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                            OR CONTINUE WITH
                          </span>
                        </div>

                        {/* Google Login Button */}
                        <GoogleLoginButton />

                        {/* Register Link - Single instance */}
                        <div className="text-center mt-4">
                          <span className="text-muted">Don't have an account? </span>
                          <Link to="/register" className="text-decoration-none fw-bold">
                            Create Account
                          </Link>
                        </div>
                      </>
                    ) : null}

                    {/* Security Badge */}
                    <div className="text-center mt-4 pt-3 border-top">
                      <FaShieldAlt className="text-muted me-2" />
                      <small className="text-muted">
                        256-bit SSL encrypted • Your data is safe with us
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Forgot Password Modal */}
      <Modal show={showForgotPassword} onHide={closeForgotPassword} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {resetSent ? (
            <div className="text-center py-4">
              <FaEnvelopeOpenText size={60} className="text-success mb-3" />
              <h5>Check Your Email</h5>
              <p className="text-muted small">
                We've sent password reset instructions to <strong>{resetEmail}</strong>
              </p>
              <Button variant="primary" onClick={closeForgotPassword} className="mt-3">
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="text-center mb-4">
                <FaQuestionCircle size={48} className="text-primary mb-3" />
                <p className="text-muted small">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="rounded-3">
                  {error}
                </Alert>
              )}

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted">EMAIL ADDRESS</Form.Label>
                <InputGroup className="border rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-white border-0">
                    <FaEnvelope className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="hello@marketstore.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={resetLoading}
                    className="border-0 py-3"
                    style={{ background: '#f8f9fa' }}
                  />
                </InputGroup>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={resetLoading}
                  className="py-3 rounded-3 fw-bold"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  {resetLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetPassword} onHide={closeResetPassword} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Create New Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {resetSuccess ? (
            <div className="text-center py-4">
              <FaCheckCircle size={60} className="text-success mb-3" />
              <h5>Password Reset Successfully!</h5>
              <p className="text-muted small">
                Your password has been reset. Please login with your new password.
              </p>
              <Button variant="primary" onClick={closeResetPassword} className="mt-3">
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="text-center mb-4">
                <FaKey size={48} className="text-primary mb-3" />
                <p className="text-muted small">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="rounded-3">
                  {error}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">NEW PASSWORD</Form.Label>
                <InputGroup className="border rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-white border-0">
                    <FaLock className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={resetPasswordLoading}
                    className="border-0 py-3"
                    style={{ background: '#f8f9fa' }}
                  />
                  <Button
                    variant="link"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="border-0 bg-white text-muted"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted">CONFIRM PASSWORD</Form.Label>
                <InputGroup className="border rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-white border-0">
                    <FaLock className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={resetPasswordLoading}
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

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={resetPasswordLoading}
                  className="py-3 rounded-3 fw-bold"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  {resetPasswordLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .login-page {
          position: relative;
          overflow: hidden;
        }
        
        .login-page::before {
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
        
        .modal-content {
          border-radius: 20px;
          border: none;
        }
        
        .modal-header {
          border-bottom: none;
        }
        
        .btn-primary {
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </>
  );
}

export default Login;
