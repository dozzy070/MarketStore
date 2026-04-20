// frontend/src/pages/Stores.jsx - With DashboardLayout Sidebar
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
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
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalStores: 0,
    verifiedStores: 0,
    totalProducts: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStores = [
        {
          id: 1,
          name: "Tech Haven",
          description: "Your one-stop shop for electronics and gadgets. We offer the latest smartphones, laptops, accessories, and tech gadgets at competitive prices.",
          logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
          cover: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
          rating: 4.5,
          products: 156,
          orders: 2341,
          location: "Lagos, Nigeria",
          verified: true,
          joined: "2023",
          response_time: "2-4 hours",
          delivery_time: "1-3 days"
        },
        {
          id: 2,
          name: "Fashion Forward",
          description: "Trendy clothing and accessories for men and women. Stay stylish with our curated collection of fashion items.",
          logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200",
          cover: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
          rating: 4.8,
          products: 342,
          orders: 5678,
          location: "Abuja, Nigeria",
          verified: true,
          joined: "2022",
          response_time: "1-2 hours",
          delivery_time: "2-4 days"
        },
        {
          id: 3,
          name: "Home Essentials",
          description: "Quality home and living products. From furniture to decor, we have everything you need for your home.",
          logo: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200",
          cover: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
          rating: 4.3,
          products: 89,
          orders: 1234,
          location: "Port Harcourt, Nigeria",
          verified: false,
          joined: "2024",
          response_time: "3-5 hours",
          delivery_time: "3-5 days"
        },
        {
          id: 4,
          name: "Sports World",
          description: "Everything for your active lifestyle. Get the best sports equipment, activewear, and fitness accessories.",
          logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200",
          cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
          rating: 4.6,
          products: 203,
          orders: 3456,
          location: "Ibadan, Nigeria",
          verified: true,
          joined: "2023",
          response_time: "2-3 hours",
          delivery_time: "2-4 days"
        },
        {
          id: 5,
          name: "Beauty Bliss",
          description: "Premium beauty and skincare products. Discover the best brands for your beauty routine.",
          logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200",
          cover: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800",
          rating: 4.7,
          products: 178,
          orders: 2890,
          location: "Lagos, Nigeria",
          verified: true,
          joined: "2023",
          response_time: "1-3 hours",
          delivery_time: "2-3 days"
        },
        {
          id: 6,
          name: "Book Haven",
          description: "Your favorite bookstore online. Find bestsellers, textbooks, and rare editions.",
          logo: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200",
          cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800",
          rating: 4.9,
          products: 456,
          orders: 6789,
          location: "Enugu, Nigeria",
          verified: true,
          joined: "2022",
          response_time: "2-5 hours",
          delivery_time: "3-5 days"
        }
      ];
      
      setStores(mockStores);
      
      // Calculate stats
      const verifiedStores = mockStores.filter(s => s.verified).length;
      const totalProducts = mockStores.reduce((sum, s) => sum + s.products, 0);
      const totalOrders = mockStores.reduce((sum, s) => sum + s.orders, 0);
      
      setStats({
        totalStores: mockStores.length,
        verifiedStores: verifiedStores,
        totalProducts: totalProducts,
        totalOrders: totalOrders
      });
      
    } catch (error) {
      console.error('Failed to load stores', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(search.toLowerCase()) ||
                         store.description.toLowerCase().includes(search.toLowerCase()) ||
                         store.location.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'verified') return matchesSearch && store.verified;
    if (filter === 'new') return matchesSearch && store.joined === '2024';
    if (filter === 'top-rated') return matchesSearch && store.rating >= 4.5;
    
    return matchesSearch;
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
                    <h3 className="mb-0">{stats.totalStores}</h3>
                    <p className="text-muted mb-0">Total Stores</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaCheckCircle size={30} className="text-success mb-2" />
                    <h3 className="mb-0">{stats.verifiedStores}</h3>
                    <p className="text-muted mb-0">Verified Stores</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaBox size={30} className="text-info mb-2" />
                    <h3 className="mb-0">{formatNumber(stats.totalProducts)}</h3>
                    <p className="text-muted mb-0">Total Products</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <FaShoppingBag size={30} className="text-warning mb-2" />
                    <h3 className="mb-0">{formatNumber(stats.totalOrders)}</h3>
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
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="border-0 shadow-sm h-100 store-card">
                        <div className="position-relative">
                          <Card.Img 
                            variant="top" 
                            src={store.cover} 
                            style={{ height: '160px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" />
                          <div className="position-absolute bottom-0 start-0 p-3 text-white">
                            <div className="d-flex align-items-center">
                              <img 
                                src={store.logo} 
                                alt={store.name}
                                className="rounded-circle border border-2 border-white me-2"
                                style={{ width: '50px', height: '50px', objectFit: 'cover', background: 'white' }}
                              />
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
                            {store.description.length > 100 ? `${store.description.substring(0, 100)}...` : store.description}
                          </Card.Text>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <div className="d-flex align-items-center">
                              <FaStar className="text-warning me-1" size={12} />
                              <span className="small fw-medium">{store.rating}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaBox className="text-info me-1" size={12} />
                              <span className="small">{store.products} products</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaShoppingBag className="text-success me-1" size={12} />
                              <span className="small">{formatNumber(store.orders)} orders</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center text-muted small mb-3">
                            <FaMapMarkerAlt className="me-1" size={12} />
                            {store.location}
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <small className="text-muted">
                              <FaClock className="me-1" size={10} />
                              Resp: {store.response_time}
                            </small>
                            <small className="text-muted">
                              Delivery: {store.delivery_time}
                            </small>
                          </div>
                          <Link to={`/store/${store.id}`}>
                            <Button variant="primary" className="w-100">
                              Visit Store <FaArrowRight className="ms-2" size={12} />
                            </Button>
                          </Link>
                        </Card.Body>
                      </Card>
                    </motion.div>
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
