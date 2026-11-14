// frontend/src/pages/Stores.jsx - With DashboardLayout Sidebar
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup, Alert } from 'react-bootstrap';
import { 
  FaStore, 
  FaStar, 
  FaMapMarkerAlt, 
  FaSearch,
  FaFilter,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { storeAPI } from '../../services/api';

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total_stores: 0,
    verified_stores: 0,
    total_products: 0,
    total_completed_orders: 0
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await storeAPI.getStores();
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error('The stores API returned an invalid response.');
      }

      setStores(response.data.data);
      setStats({
        total_stores: Number(response.data.stats?.total_stores) || 0,
        verified_stores: Number(response.data.stats?.verified_stores) || 0,
        total_products: Number(response.data.stats?.total_products) || 0,
        total_completed_orders: Number(response.data.stats?.total_completed_orders) || 0
      });
    } catch (error) {
      console.error('Failed to load stores:', error);
      setStores([]);
      setLoadError('Stores are temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const searchText = `${store.name || ''} ${store.description || ''} ${store.location || ''}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase());
    
    if (filter === 'verified') return matchesSearch && store.verified;
    if (filter === 'new') {
      const joinedDate = new Date(store.joined_date);
      return matchesSearch && !Number.isNaN(joinedDate.getTime()) &&
        Date.now() - joinedDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
    }
    if (filter === 'top-rated') return matchesSearch && Number(store.rating) >= 4.5;
    
    return matchesSearch;
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Number(num || 0).toString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="stores-page">
        {/* Hero Section */}
        <section className="hero-section py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <h1 className="display-4 fw-bold mb-4 text-white">Discover Amazing Stores</h1>
                <p className="lead text-white-50 mb-4">
                  Browse through our curated collection of trusted vendors and find exactly what you're looking for.
                </p>
                <div className="d-flex gap-3">
                  <InputGroup className="w-75">
                    <InputGroup.Text className="bg-white border-0">
                      <FaSearch className="text-primary" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search stores by name, location, or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="border-0 py-3"
                    />
                  </InputGroup>
                </div>
              </Col>
              <Col lg={6}>
                <img 
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800" 
                  alt="Stores"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                />
              </Col>
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-4 bg-light">
          <Container>
            <Row className="g-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaStore size={30} className="text-primary mb-2" />
                    <h3 className="mb-0">{stats.total_stores}</h3>
                    <p className="text-muted mb-0">Total Stores</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaCheckCircle size={30} className="text-success mb-2" />
                    <h3 className="mb-0">{stats.verified_stores}</h3>
                    <p className="text-muted mb-0">Verified Stores</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaBox size={30} className="text-info mb-2" />
                    <h3 className="mb-0">{formatNumber(stats.total_products)}</h3>
                    <p className="text-muted mb-0">Total Products</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaShoppingBag size={30} className="text-warning mb-2" />
                    <h3 className="mb-0">{formatNumber(stats.total_completed_orders)}</h3>
                    <p className="text-muted mb-0">Orders Completed</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Filters */}
        <section className="py-4">
          <Container>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <h4 className="mb-0">All Stores ({filteredStores.length})</h4>
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant={filter === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  All Stores
                </Button>
                <Button 
                  variant={filter === 'verified' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('verified')}
                  size="sm"
                >
                  Verified Only
                </Button>
                <Button 
                  variant={filter === 'top-rated' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('top-rated')}
                  size="sm"
                >
                  Top Rated
                </Button>
                <Button 
                  variant={filter === 'new' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('new')}
                  size="sm"
                >
                  New Stores
                </Button>
              </div>
            </div>

            {loadError && (
              <Alert variant="warning" className="d-flex justify-content-between align-items-center">
                <span>{loadError}</span>
                <Button variant="outline-primary" size="sm" onClick={fetchStores}>Try again</Button>
              </Alert>
            )}

            <Row className="g-4">
              {filteredStores.length === 0 ? (
                <Col md={12}>
                  <Card className="border-0 shadow-sm text-center py-5">
                    <Card.Body>
                      <FaStore size={50} className="text-muted mb-3" />
                      <h5>No stores found</h5>
                      <p className="text-muted">Try adjusting your search or filters</p>
                      <Button variant="outline-primary" onClick={() => { setSearch(''); setFilter('all'); }}>
                        Clear Filters
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                filteredStores.map((store, index) => (
                  <Col key={store.id} lg={6} xl={4}>
                    <Motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="border-0 shadow-sm h-100 store-card">
                        <div className="position-relative">
                          {store.cover_url ? (
                            <Card.Img
                              variant="top"
                              src={store.cover_url}
                              alt={`${store.name} cover`}
                              style={{ height: '160px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-primary bg-opacity-10" style={{ height: '160px' }} />
                          )}
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" />
                          <div className="position-absolute bottom-0 start-0 p-3 text-white">
                            <div className="d-flex align-items-center">
                              {store.logo_url ? (
                                <img
                                  src={store.logo_url}
                                  alt={`${store.name} logo`}
                                  className="rounded-circle border border-2 border-white me-2"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', background: 'white' }}
                                />
                              ) : (
                                <div className="rounded-circle border border-2 border-white me-2 d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                                  style={{ width: '50px', height: '50px' }}>
                                  {store.name?.charAt(0)?.toUpperCase() || <FaStore />}
                                </div>
                              )}
                              <div>
                                <h6 className="mb-0 fw-bold">{store.name}</h6>
                                {store.verified && (
                                  <Badge bg="success" className="mt-1">Verified</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Card.Body>
                          <Card.Text className="text-muted small mb-3">
                            {(store.description || '').length > 100 ? `${store.description.substring(0, 100)}...` : store.description}
                          </Card.Text>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <div className="d-flex align-items-center">
                              <FaStar className="text-warning me-1" size={12} />
                              <span className="small fw-medium">{Number(store.rating) > 0 ? Number(store.rating).toFixed(1) : 'No ratings'}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaBox className="text-info me-1" size={12} />
                              <span className="small">{store.product_count} products</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaShoppingBag className="text-success me-1" size={12} />
                              <span className="small">{formatNumber(store.completed_order_count)} orders</span>
                            </div>
                          </div>
                          {store.location && (
                            <div className="d-flex align-items-center text-muted small mb-3">
                              <FaMapMarkerAlt className="me-1" size={12} />
                              {store.location}
                            </div>
                          )}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            {store.joined_date ? (
                              <small className="text-muted">
                                <FaClock className="me-1" size={10} />
                                Joined {new Date(store.joined_date).toLocaleDateString()}
                              </small>
                            ) : <span />}
                            <small className="text-muted">{store.review_count} reviews</small>
                          </div>
                              <Button as={Link} to={`/stores/${store.id}`} variant="primary" className="w-100">
                                Visit Store <FaArrowRight className="ms-2" size={12} />
                              </Button>
                        </Card.Body>
                      </Card>
                    </Motion.div>
                  </Col>
                ))
              )}
            </Row>
          </Container>
        </section>
      </div>

      <style>{`
        .store-card {
          transition: all 0.3s ease;
        }
        
        .store-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        
        .hero-section {
          margin-top: -20px;
        }
        
        @media (max-width: 768px) {
          .hero-section {
            text-align: center;
          }
          
          .hero-section h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default Stores;
