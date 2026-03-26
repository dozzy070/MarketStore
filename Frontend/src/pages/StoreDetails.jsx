import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Image, Form, InputGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { 
  FaStore, 
  FaStar, 
  FaMapMarkerAlt, 
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaCheckCircle,
  FaTruck,
  FaUndo,
  FaCreditCard,
  FaSearch,
  FaHeart,
  FaShoppingCart
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function StoreDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStore = {
        id: id,
        name: "Tech Haven",
        description: "Your one-stop shop for electronics and gadgets. We offer the latest tech products at competitive prices with excellent customer service.",
        longDescription: "Founded in 2023, Tech Haven has grown to become one of Nigeria's most trusted electronics retailers. We partner with leading brands to bring you authentic products with full warranties. Our team of tech enthusiasts is always ready to help you find the perfect device for your needs.",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
        cover: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
        rating: 4.5,
        totalReviews: 234,
        products: 156,
        orders: 2341,
        customers: 1890,
        location: "Lagos, Nigeria",
        address: "123 Tech Avenue, Ikeja, Lagos",
        email: "contact@techhaven.com",
        phone: "+234 801 234 5678",
        website: "https://techhaven.com",
        verified: true,
        joined: "2023",
        social: {
          facebook: "https://facebook.com/techhaven",
          twitter: "https://twitter.com/techhaven",
          instagram: "https://instagram.com/techhaven",
          whatsapp: "+2348012345678"
        },
        shipping_policy: "Free shipping on orders over ₦50,000. Delivery within 2-4 business days in major cities, 3-7 days for other locations.",
        return_policy: "30-day return policy for unused items in original packaging. Return shipping is free for defective items.",
        payment_methods: ["Bank Transfer", "Card Payment", "PayPal"],
        business_hours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed"
        }
      };

      const mockProducts = [
        {
          id: 1,
          name: "Wireless Headphones",
          price: 15000,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
          rating: 4.5,
          reviews: 128
        },
        {
          id: 2,
          name: "Smart Watch",
          price: 45000,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
          rating: 4.8,
          reviews: 89
        },
        {
          id: 3,
          name: "Bluetooth Speaker",
          price: 25000,
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200",
          rating: 4.6,
          reviews: 156
        },
        {
          id: 4,
          name: "Laptop Backpack",
          price: 12000,
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200",
          rating: 4.7,
          reviews: 92
        }
      ];

      const mockReviews = [
        {
          id: 1,
          user: "John D.",
          rating: 5,
          comment: "Great store! Fast shipping and authentic products.",
          date: "2024-02-15"
        },
        {
          id: 2,
          user: "Sarah M.",
          rating: 4,
          comment: "Good customer service. Will shop again.",
          date: "2024-02-10"
        }
      ];

      setStore(mockStore);
      setProducts(mockProducts);
      setReviews(mockReviews);
    } catch (error) {
      console.error('Failed to load store details');
      toast.error('Failed to load store details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  return (
    <div className="store-details-page">
      {/* Store Banner */}
      <div className="position-relative mb-4">
        <img 
          src={store.cover} 
          alt={store.name}
          className="w-100"
          style={{ height: '300px', objectFit: 'cover' }}
        />
        <div className="position-absolute bottom-0 start-0 w-100 p-4" 
             style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
          <Container>
            <Row className="align-items-end">
              <Col md={8}>
                <div className="d-flex align-items-center text-white">
                  <img 
                    src={store.logo} 
                    alt={store.name}
                    className="rounded-circle border border-3 border-white me-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <div>
                    <h2 className="mb-1">{store.name}</h2>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <FaStar className="text-warning me-1" />
                        <span>{store.rating} ({store.totalReviews} reviews)</span>
                      </div>
                      {store.verified && (
                        <Badge bg="success">
                          <FaCheckCircle className="me-1" /> Verified Store
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      <Container className="py-4">
        <Row>
          <Col lg={8}>
            {/* About Section */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">About {store.name}</h5>
                <p className="text-muted mb-4">{store.longDescription}</p>

                <h6 className="mb-3">Store Policies</h6>
                <Row>
                  <Col md={6}>
                    <Card className="border-0 bg-light mb-3">
                      <Card.Body>
                        <FaTruck className="text-primary mb-2" size={20} />
                        <h6 className="mb-2">Shipping Policy</h6>
                        <p className="small text-muted mb-0">{store.shipping_policy}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-light mb-3">
                      <Card.Body>
                        <FaUndo className="text-primary mb-2" size={20} />
                        <h6 className="mb-2">Return Policy</h6>
                        <p className="small text-muted mb-0">{store.return_policy}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <h6 className="mb-3">Business Hours</h6>
                <Row>
                  <Col md={6}>
                    {Object.entries(store.business_hours).slice(0, 4).map(([day, hours]) => (
                      <div key={day} className="d-flex justify-content-between mb-2">
                        <span className="text-capitalize">{day}:</span>
                        <span className="text-muted">{hours}</span>
                      </div>
                    ))}
                  </Col>
                  <Col md={6}>
                    {Object.entries(store.business_hours).slice(4).map(([day, hours]) => (
                      <div key={day} className="d-flex justify-content-between mb-2">
                        <span className="text-capitalize">{day}:</span>
                        <span className="text-muted">{hours}</span>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Products Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Products ({products.length})</h5>
              <InputGroup style={{ width: '300px' }}>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search in store..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </div>

            <Row className="g-3 mb-4">
              {products.map(product => (
                <Col key={product.id} md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Row className="g-0">
                      <Col md={4}>
                        <Link to={`/product/${product.id}`}>
                          <Card.Img 
                            src={product.image} 
                            style={{ height: '120px', objectFit: 'cover' }}
                          />
                        </Link>
                      </Col>
                      <Col md={8}>
                        <Card.Body>
                          <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                            <Card.Title className="h6">{product.name}</Card.Title>
                          </Link>
                          <div className="d-flex align-items-center mb-2">
                            <FaStar className="text-warning me-1" size={12} />
                            <small>{product.rating} ({product.reviews})</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="text-primary mb-0">₦{product.price.toLocaleString()}</h6>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => handleAddToCart(product)}
                            >
                              <FaShoppingCart />
                            </Button>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Reviews Section */}
            <h5 className="mb-3">Customer Reviews</h5>
            {reviews.map(review => (
              <Card key={review.id} className="border-0 shadow-sm mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{review.user}</h6>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="text-warning">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? 'text-warning' : 'text-secondary'} size={12} />
                          ))}
                        </div>
                        <small className="text-muted">{review.date}</small>
                      </div>
                    </div>
                  </div>
                  <p className="mb-0">{review.comment}</p>
                </Card.Body>
              </Card>
            ))}
          </Col>

          <Col lg={4}>
            {/* Contact Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h6 className="mb-3">Contact Information</h6>
                <div className="mb-3">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  <span className="text-muted">{store.address}</span>
                </div>
                <div className="mb-3">
                  <FaEnvelope className="text-primary me-2" />
                  <a href={`mailto:${store.email}`} className="text-decoration-none">
                    {store.email}
                  </a>
                </div>
                <div className="mb-3">
                  <FaPhone className="text-primary me-2" />
                  <a href={`tel:${store.phone}`} className="text-decoration-none">
                    {store.phone}
                  </a>
                </div>
                {store.website && (
                  <div className="mb-3">
                    <FaGlobe className="text-primary me-2" />
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      {store.website}
                    </a>
                  </div>
                )}
                <hr />
                <h6 className="mb-3">Follow Us</h6>
                <div className="d-flex gap-3">
                  {store.social.facebook && (
                    <a href={store.social.facebook} target="_blank" rel="noopener noreferrer">
                      <FaFacebook className="text-primary" size={24} />
                    </a>
                  )}
                  {store.social.twitter && (
                    <a href={store.social.twitter} target="_blank" rel="noopener noreferrer">
                      <FaTwitter className="text-info" size={24} />
                    </a>
                  )}
                  {store.social.instagram && (
                    <a href={store.social.instagram} target="_blank" rel="noopener noreferrer">
                      <FaInstagram className="text-danger" size={24} />
                    </a>
                  )}
                  {store.social.whatsapp && (
                    <a href={`https://wa.me/${store.social.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <FaWhatsapp className="text-success" size={24} />
                    </a>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="mb-3">Store Stats</h6>
                <Row className="g-3">
                  <Col xs={4} className="text-center">
                    <FaBox className="text-primary mb-2" size={24} />
                    <h6 className="mb-0">{store.products}</h6>
                    <small className="text-muted">Products</small>
                  </Col>
                  <Col xs={4} className="text-center">
                    <FaShoppingBag className="text-success mb-2" size={24} />
                    <h6 className="mb-0">{store.orders.toLocaleString()}</h6>
                    <small className="text-muted">Orders</small>
                  </Col>
                  <Col xs={4} className="text-center">
                    <FaUsers className="text-info mb-2" size={24} />
                    <h6 className="mb-0">{store.customers.toLocaleString()}</h6>
                    <small className="text-muted">Customers</small>
                  </Col>
                </Row>
                <hr />
                <h6 className="mb-3">Payment Methods</h6>
                <div className="d-flex flex-wrap gap-2">
                  {store.payment_methods.map(method => (
                    <Badge key={method} bg="light" text="dark" className="p-2">
                      <FaCreditCard className="me-1" /> {method}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default StoreDetails;