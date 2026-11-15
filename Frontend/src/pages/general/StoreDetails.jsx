import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import {
  FaStore, FaStar, FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe,
  FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaBox, FaShoppingBag,
  FaCheckCircle, FaTruck, FaCreditCard, FaSearch, FaShoppingCart
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { storeAPI } from '../../services/api';

function StoreDetails() {
  const { id, slug } = useParams();
  const storeIdentifier = slug || id;
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchStoreDetails = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await storeAPI.getStore(storeIdentifier);
        const storeData = response.data?.data;
        if (!response.data?.success || !storeData?.store ||
            !Array.isArray(storeData.products) || !Array.isArray(storeData.reviews)) {
          throw new Error('The store API returned an invalid response.');
        }

        setStore(storeData.store);
        setProducts(storeData.products);
        setReviews(storeData.reviews);
      } catch (error) {
        console.error('Failed to load store details:', error);
        setStore(null);
        setProducts([]);
        setReviews([]);
        setLoadError(error.response?.data?.message || 'Store details are unavailable. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [storeIdentifier]);

  const handleAddToCart = (product) => {
    let cart;
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(cart)) cart = [];
    } catch (error) {
      console.error('Could not read the cart from storage:', error);
      cart = [];
    }

    const existing = cart.find(item => item.id === product.id);
    const updatedCart = existing
      ? cart.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );
  const businessHours = store?.business_hours && typeof store.business_hours === 'object'
    ? Object.entries(store.business_hours)
    : [];
  const socialMedia = store?.social_media || {};
  const paymentMethods = Array.isArray(store?.payment_methods) ? store.payment_methods : [];

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" aria-label="Loading store details" />
      </Container>
    );
  }

  if (!store) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Store unavailable</Alert.Heading>
          <p className="mb-3">{loadError || 'This store could not be found.'}</p>
          <Button as={Link} to="/stores" variant="outline-primary">Browse Stores</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="store-details-page">
      <div
        className="position-relative mb-4 d-flex align-items-end"
        style={{
          minHeight: 300,
          background: store.cover_url
            ? `linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,.05)), url("${store.cover_url}") center/cover`
            : 'linear-gradient(135deg, #2563eb 0%, #764ba2 100%)'
        }}
      >
        <Container className="py-4">
          <Row className="align-items-end">
            <Col md={8}>
              <div className="d-flex align-items-center text-white">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={`${store.name} logo`}
                    className="rounded-circle border border-3 border-white me-3"
                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                  />
                ) : (
                  <div className="rounded-circle border border-3 border-white me-3 d-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 80, background: 'rgba(255,255,255,.2)' }}>
                    <FaStore size={32} />
                  </div>
                )}
                <div>
                  <h1 className="h2 mb-1">{store.name}</h1>
                  {store.tagline && <p className="mb-1">{store.tagline}</p>}
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <span><FaStar className="text-warning me-1" />{Number(store.rating) > 0 ? Number(store.rating).toFixed(1) : 'No ratings'} ({store.review_count} reviews)</span>
                    {store.verified && <Badge bg="success"><FaCheckCircle className="me-1" />Verified Store</Badge>}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {loadError && <Alert variant="warning">{loadError}</Alert>}
        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h2 className="h5 mb-3">About {store.name}</h2>
                <p className="text-muted mb-4">{store.description || 'This store has not added a description yet.'}</p>
                <h3 className="h6 mb-3">Store Information</h3>
                <Row>
                  <Col md={6}>
                    <Card className="border-0 bg-light mb-3 h-100">
                      <Card.Body>
                        <FaTruck className="text-primary mb-2" size={20} />
                        <h4 className="h6 mb-2">Shipping Information</h4>
                        <p className="small text-muted mb-0">{store.shipping_policy || 'Contact the store for shipping information.'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-light mb-3 h-100">
                      <Card.Body>
                        <h4 className="h6 mb-2">Business Hours</h4>
                        {businessHours.length ? businessHours.map(([day, hours]) => (
                          <div key={day} className="d-flex justify-content-between mb-1 small">
                            <span className="text-capitalize">{day}</span>
                            <span className="text-muted">{hours}</span>
                          </div>
                        )) : <p className="small text-muted mb-0">Hours have not been provided.</p>}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
              <h2 className="h5 mb-0">Products ({filteredProducts.length})</h2>
              <InputGroup style={{ maxWidth: 300 }}>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  aria-label="Search products in store"
                  placeholder="Search in store..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </InputGroup>
            </div>

            {filteredProducts.length ? (
              <Row className="g-3 mb-4">
                {filteredProducts.map(product => (
                  <Col key={product.id} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Row className="g-0">
                        <Col md={4}>
                          <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
                            {product.image_url ? (
                              <Card.Img src={product.image_url} alt={product.name} style={{ height: 120, objectFit: 'cover' }} />
                            ) : (
                              <div className="h-100 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: 120 }}>
                                <FaBox className="text-muted" size={30} />
                              </div>
                            )}
                          </Link>
                        </Col>
                        <Col md={8}>
                          <Card.Body>
                            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                              <Card.Title className="h6">{product.name}</Card.Title>
                            </Link>
                            <div className="d-flex align-items-center mb-2">
                              <FaStar className="text-warning me-1" size={12} />
                              <small>{Number(product.rating) > 0 ? Number(product.rating).toFixed(1) : 'No ratings'} ({product.review_count} reviews)</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <h3 className="h6 text-primary mb-0">₦{Number(product.price || 0).toLocaleString()}</h3>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                aria-label={`Add ${product.name} to cart`}
                                onClick={() => handleAddToCart(product)}
                                disabled={Number(product.stock_quantity) <= 0}
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
            ) : (
              <p className="text-muted mb-4">
                {products.length ? 'No products match your search.' : 'This store has no published products yet.'}
              </p>
            )}

            <h2 className="h5 mb-3">Customer Reviews</h2>
            {reviews.length ? reviews.map(review => (
              <Card key={review.id} className="border-0 shadow-sm mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="h6 mb-1">{review.user_name}</h3>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="text-warning">
                          {[...Array(5)].map((_, index) => (
                            <FaStar key={index} className={index < Number(review.rating) ? 'text-warning' : 'text-secondary'} size={12} />
                          ))}
                        </div>
                        <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </div>
                  <p className="mb-0">{review.comment}</p>
                </Card.Body>
              </Card>
            )) : <p className="text-muted">This store has no published reviews yet.</p>}
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h2 className="h6 mb-3">Contact Information</h2>
                {store.location && <div className="mb-3"><FaMapMarkerAlt className="text-primary me-2" /><span className="text-muted">{store.location}</span></div>}
                {store.email && <div className="mb-3"><FaEnvelope className="text-primary me-2" /><a href={`mailto:${store.email}`} className="text-decoration-none">{store.email}</a></div>}
                {store.phone && <div className="mb-3"><FaPhone className="text-primary me-2" /><a href={`tel:${store.phone}`} className="text-decoration-none">{store.phone}</a></div>}
                {store.website_url && (
                  <div className="mb-3">
                    <FaGlobe className="text-primary me-2" />
                    <a href={store.website_url.startsWith('http') ? store.website_url : `https://${store.website_url}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      {store.website_url}
                    </a>
                  </div>
                )}
                {Object.values(socialMedia).some(Boolean) && (
                  <>
                    <hr />
                    <h3 className="h6 mb-3">Follow Us</h3>
                    <div className="d-flex gap-3">
                      {socialMedia.facebook && <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Store Facebook"><FaFacebook className="text-primary" size={24} /></a>}
                      {socialMedia.twitter && <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Store Twitter"><FaTwitter className="text-info" size={24} /></a>}
                      {socialMedia.instagram && <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Store Instagram"><FaInstagram className="text-danger" size={24} /></a>}
                      {socialMedia.whatsapp && <a href={`https://wa.me/${String(socialMedia.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Contact store on WhatsApp"><FaWhatsapp className="text-success" size={24} /></a>}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h2 className="h6 mb-3">Store Stats</h2>
                <Row className="g-3">
                  <Col xs={4} className="text-center">
                    <FaBox className="text-primary mb-2" size={24} />
                    <h3 className="h6 mb-0">{store.product_count}</h3>
                    <small className="text-muted">Products</small>
                  </Col>
                  <Col xs={4} className="text-center">
                    <FaShoppingBag className="text-success mb-2" size={24} />
                    <h3 className="h6 mb-0">{Number(store.completed_order_count || 0).toLocaleString()}</h3>
                    <small className="text-muted">Orders</small>
                  </Col>
                  <Col xs={4} className="text-center">
                    <FaStar className="text-warning mb-2" size={24} />
                    <h3 className="h6 mb-0">{store.review_count}</h3>
                    <small className="text-muted">Reviews</small>
                  </Col>
                </Row>
                <hr />
                <h3 className="h6 mb-3">Payment Methods</h3>
                {paymentMethods.length ? (
                  <div className="d-flex flex-wrap gap-2">
                    {paymentMethods.map(method => (
                      <Badge key={method} bg="light" text="dark" className="p-2">
                        <FaCreditCard className="me-1" /> {method}
                      </Badge>
                    ))}
                  </div>
                ) : <p className="small text-muted mb-0">Payment information is provided at checkout.</p>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default StoreDetails;
