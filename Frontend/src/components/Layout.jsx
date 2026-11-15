// frontend/src/components/SimpleLayout.jsx
import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome,
  FaBox, 
  FaUser, 
  FaHeart,
  FaStore, 
  FaSignOutAlt, 
  FaHistory,
  FaSearch,
  FaShoppingCart
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function SimpleLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(totalItems);
  }, []);

  const navItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/products', icon: FaBox, label: 'Products' },
    { path: '/stores', icon: FaStore, label: 'Stores' },
    { path: '/categories', icon: FaHistory, label: 'Categories' },
  ];

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            <FaStore className="text-primary me-2" />
            DoorMart
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto align-items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                                (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Nav.Link 
                    key={item.path}
                    as={Link} 
                    to={item.path}
                    className={`d-flex align-items-center gap-2 px-3 py-2 mx-1 rounded ${
                      isActive ? 'bg-primary text-white' : 'text-dark'
                    }`}
                  >
                    <Icon /> {item.label}
                  </Nav.Link>
                );
              })}
            </Nav>
            
            <div className="d-flex align-items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="position-relative d-none d-md-block">
                <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-control ps-5"
                  style={{ width: '250px', borderRadius: '50px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${e.target.value}`);
                    }
                  }}
                />
              </div>

              {/* Cart Icon */}
              <div className="d-flex align-items-center gap-2">
                {user ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-primary">
                      <FaUser className="me-2" /> Account
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate(user.role === 'admin' ? '/admin/profile' : user.role === 'vendor' ? '/vendor/profile' : '/user/profile')}>
                        <FaUser className="me-2" /> My Account
                      </Dropdown.Item>
                      <Dropdown.Item onClick={logout}>
                        <FaSignOutAlt className="me-2" /> Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Button variant="outline-primary" onClick={() => navigate('/profile')}>
                    <FaUser className="me-2" /> Account
                  </Button>
                )}
                <Button variant="outline-danger" onClick={() => navigate('/user/wishlist')}>
                  <FaHeart className="me-2" /> Wishlist
                </Button>
                <Button
                  variant="outline-primary"
                  className="position-relative"
                  onClick={() => navigate('/cart')}
                >
                  <FaShoppingCart className="me-2" /> Cart
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="py-4">
        <Row>
          <Col>
            {children}
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white pt-4 pb-3 mt-4">
        <Container>
          <Row>
            <Col md={4}>
              <h5>DoorMart</h5>
              <p className="text-white-50 small">Your one-stop destination for quality products at great prices.</p>
            </Col>
            <Col md={4}>
              <h6>Quick Links</h6>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-white-50 text-decoration-none small">Home</Link></li>
                <li><Link to="/products" className="text-white-50 text-decoration-none small">Products</Link></li>
                <li><Link to="/stores" className="text-white-50 text-decoration-none small">Stores</Link></li>
                <li><Link to="/contact" className="text-white-50 text-decoration-none small">Contact</Link></li>
              </ul>
            </Col>
            <Col md={4}>
              <h6>Contact</h6>
              <p className="text-white-50 small mb-1">Email: support@doormart.com</p>
              <p className="text-white-50 small">Phone: +234 801 234 5678</p>
            </Col>
          </Row>
          <hr className="border-secondary" />
          <div className="text-center text-white-50 small">
            &copy; {new Date().getFullYear()} DoorMart. All rights reserved.
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default SimpleLayout;