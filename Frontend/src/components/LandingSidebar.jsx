import React from 'react';
import { Offcanvas, Nav, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHandsHelping, FaBlog, FaStore, FaShieldAlt, FaUserCircle, 
  FaSignInAlt, FaUserPlus, FaFacebook, FaTwitter, FaInstagram, FaHeart 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function LandingSidebar({ show, onHide }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = (path) => {
    onHide();
    navigate(path);
  };

  return (
    <>
      <style>{`
        .landing-sidebar {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin: 4px 0;
          border-radius: 12px;
          transition: all 0.3s ease;
          color: #1f2937;
          font-weight: 500;
        }
        .sidebar-nav-link:hover {
          background-color: #e9ecef;
          transform: translateX(5px);
          color: #0d6efd;
        }
        .sidebar-nav-link svg {
          transition: transform 0.2s ease;
        }
        .sidebar-nav-link:hover svg {
          transform: scale(1.1);
        }
        .sidebar-user-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          color: white;
        }
        .sidebar-footer {
          margin-top: auto;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          text-align: center;
        }
        .social-icon {
          color: #6c757d;
          transition: color 0.2s ease;
        }
        .social-icon:hover {
          color: #0d6efd;
        }
      `}</style>

      <Offcanvas show={show} onHide={onHide} placement="start" className="landing-sidebar">
        <Offcanvas.Header closeButton className="border-0">
          <Offcanvas.Title className="fw-bold">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          {/* User Section (if logged in) */}
          {isAuthenticated && user && (
            <div className="sidebar-user-section text-center">
              <div className="mb-3">
                {user.avatar ? (
                  <Image src={user.avatar} roundedCircle width="60" height="60" />
                ) : (
                  <FaUserCircle size={60} />
                )}
              </div>
              <h6 className="mb-0 fw-bold">{user.full_name}</h6>
              <small>{user.email}</small>
              <hr className="bg-white opacity-25 my-2" />
              <div className="d-flex justify-content-center gap-2 mt-2">
                <button 
                  onClick={() => handleAuthClick('/profile')}
                  className="btn btn-sm btn-outline-light"
                >
                  Profile
                </button>
                <button 
                  onClick={() => handleAuthClick('/orders')}
                  className="btn btn-sm btn-outline-light"
                >
                  Orders
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <Nav className="flex-column gap-1">
            <Nav.Link 
              as={Link} 
              to="/charity" 
              onClick={onHide} 
              className="sidebar-nav-link"
            >
              <FaHandsHelping className="me-3 text-primary" size={20} />
              <span>Charity</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/blog" 
              onClick={onHide} 
              className="sidebar-nav-link"
            >
              <FaBlog className="me-3 text-primary" size={20} />
              <span>Blog</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/become-vendor" 
              onClick={onHide} 
              className="sidebar-nav-link"
            >
              <FaStore className="me-3 text-primary" size={20} />
              <span>Become a Vendor</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/buyer-safety" 
              onClick={onHide} 
              className="sidebar-nav-link"
            >
              <FaShieldAlt className="me-3 text-primary" size={20} />
              <span>Buyer Safety</span>
            </Nav.Link>
          </Nav>

          {/* Optional: Auth Buttons for non-logged in users */}
          {!isAuthenticated && (
            <div className="mt-4 pt-3 border-top">
              <p className="text-muted small mb-2">Join our community</p>
              <div className="d-flex gap-2">
                <button 
                  onClick={() => handleAuthClick('/login')}
                  className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                >
                  <FaSignInAlt /> Sign In
                </button>
                <button 
                  onClick={() => handleAuthClick('/register')}
                  className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                >
                  <FaUserPlus /> Register
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="d-flex justify-content-center gap-3 mb-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaFacebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaTwitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FaInstagram size={18} />
              </a>
            </div>
            <p className="text-muted small mb-0">
              <FaHeart className="text-danger" size={12} /> Made with love
            </p>
            <p className="text-muted small mt-1">
              © {new Date().getFullYear()} MarketStore
            </p>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default LandingSidebar;