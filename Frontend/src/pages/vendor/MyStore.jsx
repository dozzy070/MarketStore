import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, Badge, Image, 
  Tab, Nav, Modal, Alert 
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaStore, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaImage,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaStar,
  FaShoppingBag,
  FaBox,
  FaUsers,
  FaEye,
  FaUpload,
  FaPlus,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { vendorAPI, productAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function MyStore() {
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  // Store state with default values
  const [store, setStore] = useState({
    id: '',
    store_name: 'My Store',
    store_description: 'Welcome to my store!',
    store_logo: '',
    store_banner: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_website: '',
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      whatsapp: ''
    },
    shipping_policy: 'Free shipping on orders over ₦50,000. Delivery within 3-5 business days.',
    return_policy: '30-day return policy. Items must be unused and in original packaging.',
    payment_methods: ['Bank Transfer', 'Card Payment'],
    established: new Date().getFullYear().toString(),
    business_hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    }
  });

  const [formData, setFormData] = useState({ ...store });
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageRating: 4.5,
    totalReviews: 0
  });

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
  setError(null);
  
  try {
    console.log('Fetching store data...');
    
    // Fetch profile data
    let profileData = {};
    try {
      const profileRes = await vendorAPI.getProfile();
      // Check if the response has a data property or if it's directly the data
      profileData = profileRes.data || profileRes || {};
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }

    // Fetch products - FIX THIS PART
    let productsData = [];
    try {
      const productsRes = await productAPI.getProducts();
      console.log('Products response:', productsRes);
      
      // Handle different response structures
      if (productsRes && productsRes.data) {
        // If response has data property
        if (Array.isArray(productsRes.data)) {
          productsData = productsRes.data;
        } else if (productsRes.data.products && Array.isArray(productsRes.data.products)) {
          // If data has products property (like {success: true, products: []})
          productsData = productsRes.data.products;
        }
      } else if (productsRes && productsRes.products && Array.isArray(productsRes.products)) {
        // If response directly has products property
        productsData = productsRes.products;
      } else if (Array.isArray(productsRes)) {
        // If response is directly an array
        productsData = productsRes;
      }
      
      console.log('Processed products data:', productsData);
    } catch (err) {
      console.warn('Failed to fetch products:', err);
    }

    // Fetch stats - FIX THIS PART TOO
    let statsData = {};
    try {
      const statsRes = await productAPI.getStats();
      console.log('Stats response:', statsRes);
      
      // Handle different response structures
      if (statsRes && statsRes.data) {
        statsData = statsRes.data;
      } else if (statsRes && statsRes.stats) {
        statsData = statsRes.stats;
      } else {
        statsData = statsRes || {};
      }
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    }

    // Update store state with safe defaults
    setStore({
      id: profileData.id || '',
      store_name: profileData.store_name || profileData.full_name || 'My Store',
      store_description: profileData.store_description || 'Welcome to my store!',
      store_logo: profileData.store_logo || '',
      store_banner: profileData.store_banner || '',
      store_email: profileData.store_email || profileData.email || '',
      store_phone: profileData.phone_number || '',
      store_address: profileData.location || '',
      store_website: profileData.website || '',
      social_media: profileData.social_media || {
        facebook: '',
        twitter: '',
        instagram: '',
        whatsapp: ''
      },
      shipping_policy: profileData.shipping_policy || 'Free shipping on orders over ₦50,000. Delivery within 3-5 business days.',
      return_policy: profileData.return_policy || '30-day return policy. Items must be unused and in original packaging.',
      payment_methods: profileData.payment_methods || ['Bank Transfer', 'Card Payment'],
      established: profileData.established || new Date().getFullYear().toString(),
      business_hours: profileData.business_hours || {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      }
    });

    // Update form data
    setFormData({
      id: profileData.id || '',
      store_name: profileData.store_name || profileData.full_name || 'My Store',
      store_description: profileData.store_description || 'Welcome to my store!',
      store_logo: profileData.store_logo || '',
      store_banner: profileData.store_banner || '',
      store_email: profileData.store_email || profileData.email || '',
      store_phone: profileData.phone_number || '',
      store_address: profileData.location || '',
      store_website: profileData.website || '',
      social_media: profileData.social_media || {
        facebook: '',
        twitter: '',
        instagram: '',
        whatsapp: ''
      },
      shipping_policy: profileData.shipping_policy || 'Free shipping on orders over ₦50,000. Delivery within 3-5 business days.',
      return_policy: profileData.return_policy || '30-day return policy. Items must be unused and in original packaging.',
      payment_methods: profileData.payment_methods || ['Bank Transfer', 'Card Payment'],
      established: profileData.established || new Date().getFullYear().toString(),
      business_hours: profileData.business_hours || {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      }
    });

    // Update products
    setProducts(Array.isArray(productsData) ? productsData.slice(0, 6) : []);

    // Update stats
    setStats({
      totalProducts: statsData.total_products || productsData.length || 0,
      totalOrders: statsData.total_orders || 0,
      totalCustomers: statsData.total_customers || 0,
      averageRating: statsData.average_rating || 4.5,
      totalReviews: statsData.total_reviews || 0
    });

  } catch (err) {
    console.error('Failed to load store data:', err);
    setError('Failed to load some store data. Using default values.');
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent] || {}),
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePaymentMethodChange = (method) => {
    const currentMethods = formData.payment_methods || [];
    const methods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    setFormData({ ...formData, payment_methods: methods });
  };

  const handleBusinessHoursChange = (day, value) => {
    setFormData({
      ...formData,
      business_hours: {
        ...(formData.business_hours || {}),
        [day]: value
      }
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Banner must be less than 5MB');
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      await vendorAPI.updateStoreLogo(formData);
      toast.success('Store logo updated');
      setShowLogoModal(false);
      setLogoPreview(null);
      setLogoFile(null);
      fetchStoreData();
    } catch (error) {
      console.error('Failed to update logo:', error);
      toast.error('Failed to update logo');
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerFile) return;

    const formData = new FormData();
    formData.append('banner', bannerFile);

    try {
      await vendorAPI.updateStoreBanner(formData);
      toast.success('Store banner updated');
      setShowBannerModal(false);
      setBannerPreview(null);
      setBannerFile(null);
      fetchStoreData();
    } catch (error) {
      console.error('Failed to update banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const handleSaveStore = async () => {
    setSaving(true);
    try {
      await vendorAPI.updateStore(formData);
      setStore(formData);
      setEditing(false);
      toast.success('Store updated successfully');
    } catch (error) {
      console.error('Failed to update store:', error);
      toast.error('Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(store);
    setEditing(false);
  };

  return (
    <DashboardLayout>
      {/* Header with Edit Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">My Store</h4>
          <p className="text-muted mb-0">Manage your store appearance and settings</p>
        </div>
        <div>
          {store.id && (
            <Button variant="outline-primary" as={Link} to={`/stores/${store.id}`} className="me-2">
              <FaEye className="me-2" /> View Public Store
            </Button>
          )}
          {!editing ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              <FaEdit className="me-2" /> Edit Store
            </Button>
          ) : (
            <div className="d-flex gap-2">
              <Button variant="success" onClick={handleSaveStore} disabled={saving}>
                {saving ? 'Saving...' : <><FaSave className="me-2" /> Save Changes</>}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                <FaTimes className="me-2" /> Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" className="mb-4" dismissible onClose={() => setError(null)}>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3" size={24} />
            <div>
              <strong>Notice</strong>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Store Banner */}
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div 
          className="position-relative" 
          style={{ 
            height: '200px', 
            background: store.store_banner 
              ? `url(${store.store_banner})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {editing && (
            <Button
              variant="light"
              size="sm"
              className="position-absolute top-0 end-0 m-3"
              onClick={() => setShowBannerModal(true)}
            >
              <FaImage className="me-2" /> Change Banner
            </Button>
          )}
        </div>

        <Card.Body className="position-relative" style={{ marginTop: '-50px' }}>
          <div className="d-flex align-items-end">
            <div className="position-relative me-4">
              <div 
                className="bg-white rounded-circle p-1 shadow"
                style={{ width: '100px', height: '100px', cursor: editing ? 'pointer' : 'default' }}
                onClick={() => editing && setShowLogoModal(true)}
              >
                {store.store_logo ? (
                  <Image 
                    src={store.store_logo} 
                    roundedCircle 
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                    <FaStore size={40} className="text-primary" />
                  </div>
                )}
              </div>
              {editing && (
                <Button
                  variant="primary"
                  size="sm"
                  className="position-absolute bottom-0 end-0 rounded-circle"
                  style={{ width: '30px', height: '30px' }}
                  onClick={() => setShowLogoModal(true)}
                >
                  <FaEdit size={12} />
                </Button>
              )}
            </div>

            <div className="flex-grow-1">
              {editing ? (
                <Form.Control
                  type="text"
                  name="store_name"
                  value={formData.store_name || ''}
                  onChange={handleChange}
                  className="mb-2"
                  placeholder="Store Name"
                />
              ) : (
                <h3 className="mb-1">{store.store_name}</h3>
              )}
              
              <div className="d-flex gap-3 text-muted small">
                <span><FaBox className="me-1" /> {stats.totalProducts} products</span>
                <span><FaShoppingBag className="me-1" /> {stats.totalOrders} orders</span>
                <span><FaUsers className="me-1" /> {stats.totalCustomers} customers</span>
                <span><FaStar className="text-warning me-1" /> {stats.averageRating} ({stats.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Store Tabs */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4">
          <Nav variant="tabs" className="border-0">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
                className="border-0"
              >
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'products'} 
                onClick={() => setActiveTab('products')}
                className="border-0"
              >
                Products
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'policies'} 
                onClick={() => setActiveTab('policies')}
                className="border-0"
              >
                Policies
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'hours'} 
                onClick={() => setActiveTab('hours')}
                className="border-0"
              >
                Business Hours
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Row>
              <Col md={8}>
                <h6 className="mb-3">About Store</h6>
                {editing ? (
                  <Form.Control
                    as="textarea"
                    name="store_description"
                    rows={5}
                    value={formData.store_description || ''}
                    onChange={handleChange}
                    className="mb-4"
                  />
                ) : (
                  <p className="text-muted mb-4">{store.store_description}</p>
                )}

                <Row className="g-3 mb-4">
                  <Col sm={6}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <small className="text-muted d-block">Contact Email</small>
                        {editing ? (
                          <Form.Control
                            type="email"
                            name="store_email"
                            value={formData.store_email || ''}
                            onChange={handleChange}
                            size="sm"
                          />
                        ) : (
                          <strong>{store.store_email || 'Not set'}</strong>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <small className="text-muted d-block">Phone</small>
                        {editing ? (
                          <Form.Control
                            type="text"
                            name="store_phone"
                            value={formData.store_phone || ''}
                            onChange={handleChange}
                            size="sm"
                          />
                        ) : (
                          <strong>{store.store_phone || 'Not set'}</strong>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <small className="text-muted d-block">Address</small>
                        {editing ? (
                          <Form.Control
                            type="text"
                            name="store_address"
                            value={formData.store_address || ''}
                            onChange={handleChange}
                            size="sm"
                          />
                        ) : (
                          <strong>{store.store_address || 'Not set'}</strong>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <small className="text-muted d-block">Website</small>
                        {editing ? (
                          <Form.Control
                            type="url"
                            name="store_website"
                            value={formData.store_website || ''}
                            onChange={handleChange}
                            size="sm"
                            placeholder="https://"
                          />
                        ) : (
                          <strong>{store.store_website || 'Not set'}</strong>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <h6 className="mb-3">Payment Methods</h6>
                {editing ? (
                  <div className="d-flex gap-3 flex-wrap mb-4">
                    {['Bank Transfer', 'Card Payment', 'PayPal', 'Mobile Money'].map(method => (
                      <Form.Check
                        key={method}
                        type="checkbox"
                        label={method}
                        checked={(formData.payment_methods || []).includes(method)}
                        onChange={() => handlePaymentMethodChange(method)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="d-flex gap-2 mb-4">
                    {(store.payment_methods || []).map(method => (
                      <Badge key={method} bg="light" text="dark" className="p-2">
                        {method}
                      </Badge>
                    ))}
                  </div>
                )}
              </Col>

              <Col md={4}>
                <h6 className="mb-3">Social Media</h6>
                {editing ? (
                  <div className="space-y-3">
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Facebook</Form.Label>
                      <Form.Control
                        type="url"
                        name="social_media.facebook"
                        value={formData.social_media?.facebook || ''}
                        onChange={handleChange}
                        size="sm"
                        placeholder="https://facebook.com/..."
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Twitter</Form.Label>
                      <Form.Control
                        type="url"
                        name="social_media.twitter"
                        value={formData.social_media?.twitter || ''}
                        onChange={handleChange}
                        size="sm"
                        placeholder="https://twitter.com/..."
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Instagram</Form.Label>
                      <Form.Control
                        type="url"
                        name="social_media.instagram"
                        value={formData.social_media?.instagram || ''}
                        onChange={handleChange}
                        size="sm"
                        placeholder="https://instagram.com/..."
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">WhatsApp</Form.Label>
                      <Form.Control
                        type="text"
                        name="social_media.whatsapp"
                        value={formData.social_media?.whatsapp || ''}
                        onChange={handleChange}
                        size="sm"
                        placeholder="+2348012345678"
                      />
                    </Form.Group>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {store.social_media?.facebook && (
                      <a href={store.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        <FaFacebook className="text-primary me-2" /> Facebook
                      </a>
                    )}
                    {store.social_media?.twitter && (
                      <a href={store.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        <FaTwitter className="text-info me-2" /> Twitter
                      </a>
                    )}
                    {store.social_media?.instagram && (
                      <a href={store.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        <FaInstagram className="text-danger me-2" /> Instagram
                      </a>
                    )}
                    {store.social_media?.whatsapp && (
                      <a href={`https://wa.me/${store.social_media.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        <FaWhatsapp className="text-success me-2" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <Row className="g-4">
              {products.length > 0 ? (
                products.map(product => (
                  <Col key={product.id} md={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Img 
                        variant="top" 
                        src={product.image_url || 'https://via.placeholder.com/300'} 
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title className="h6">{product.name}</Card.Title>
                        <Card.Text className="small text-muted">
                          ₦{(product.price || 0).toLocaleString()}
                        </Card.Text>
                        <Badge bg={product.published ? 'success' : 'secondary'}>
                          {product.published ? 'Published' : 'Draft'}
                        </Badge>
                        <div className="mt-2">
                          <small className="text-muted">Stock: {product.stock_quantity || 0}</small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col md={12} className="text-center py-4">
                  <p className="text-muted">No products yet</p>
                </Col>
              )}
              <Col md={12} className="text-center">
                <Button variant="outline-primary" as={Link} to="/vendor/products/add">
                  <FaPlus className="me-2" /> Add New Product
                </Button>
              </Col>
            </Row>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <Row>
              <Col md={6}>
                <h6 className="mb-3">Shipping Policy</h6>
                {editing ? (
                  <Form.Control
                    as="textarea"
                    name="shipping_policy"
                    rows={5}
                    value={formData.shipping_policy || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-muted">{store.shipping_policy}</p>
                )}
              </Col>
              <Col md={6}>
                <h6 className="mb-3">Return Policy</h6>
                {editing ? (
                  <Form.Control
                    as="textarea"
                    name="return_policy"
                    rows={5}
                    value={formData.return_policy || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-muted">{store.return_policy}</p>
                )}
              </Col>
            </Row>
          )}

          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <Row>
              <Col md={8} className="mx-auto">
                <h6 className="mb-3">Business Hours</h6>
                {Object.entries(formData.business_hours || store.business_hours).map(([day, hours]) => (
                  <Row key={day} className="mb-3 align-items-center">
                    <Col md={4}>
                      <Form.Label className="fw-medium mb-0">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Form.Label>
                    </Col>
                    <Col md={8}>
                      {editing ? (
                        <Form.Control
                          type="text"
                          value={hours || ''}
                          onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                          placeholder="e.g., 9:00 AM - 6:00 PM"
                        />
                      ) : (
                        <p className="text-muted mb-0">{hours}</p>
                      )}
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Logo Upload Modal */}
      <Modal show={showLogoModal} onHide={() => setShowLogoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Store Logo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div 
              className="border rounded-circle mx-auto d-flex align-items-center justify-content-center bg-light"
              style={{ width: '150px', height: '150px', cursor: 'pointer' }}
              onClick={() => document.getElementById('logoInput').click()}
            >
              {logoPreview ? (
                <Image src={logoPreview} roundedCircle className="w-100 h-100" style={{ objectFit: 'cover' }} />
              ) : (
                <FaStore size={50} className="text-muted" />
              )}
            </div>
            <Form.Control
              id="logoInput"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="d-none"
            />
            <p className="text-muted small mt-2">
              Click to upload logo (PNG, JPG, max 2MB)
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveLogo} disabled={!logoFile}>
            Save Logo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Banner Upload Modal */}
      <Modal show={showBannerModal} onHide={() => setShowBannerModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Store Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div 
              className="border rounded-3 mx-auto d-flex align-items-center justify-content-center bg-light"
              style={{ width: '100%', height: '200px', cursor: 'pointer' }}
              onClick={() => document.getElementById('bannerInput').click()}
            >
              {bannerPreview ? (
                <Image src={bannerPreview} fluid className="w-100 h-100" style={{ objectFit: 'cover' }} />
              ) : (
                <div>
                  <FaImage size={50} className="text-muted mb-2" />
                  <p className="text-muted">Click to upload banner image</p>
                </div>
              )}
            </div>
            <Form.Control
              id="bannerInput"
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="d-none"
            />
            <p className="text-muted small mt-2">
              Recommended size: 1200x400px (max 5MB)
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBannerModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBanner} disabled={!bannerFile}>
            Save Banner
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default MyStore;
