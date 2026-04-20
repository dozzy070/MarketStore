import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav, Alert, Spinner } from 'react-bootstrap';
import { 
  FaStore, 
  FaTruck, 
  FaUndo, 
  FaCreditCard, 
  FaPalette,
  FaSave,
  FaTimes,
  FaImage,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { vendorAPI } from '../../services/api';
import toast from 'react-hot-toast';

function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    // General Settings
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_description: '',
    
    // Shipping Settings
    free_shipping_threshold: 50000,
    domestic_rate: 2500,
    international_rate: 15000,
    handling_time: '1-2',
    
    // Return Settings
    return_policy: '30-day return policy. Items must be unused and in original packaging.',
    return_days: 30,
    
    // Payment Settings
    payment_methods: ['Bank Transfer', 'Card Payment'],
    
    // Appearance
    store_logo: '',
    store_banner: '',
    theme_color: '#4361ee',
    
    // Social Media
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      whatsapp: ''
    }
  });

  const [formData, setFormData] = useState({ ...settings });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock data - replace with actual API call
      // const response = await vendorAPI.getStoreSettings();
      // setSettings(response.data);
      // setFormData(response.data);
      
      // Mock data
      const mockSettings = {
        store_name: 'Tech Haven',
        store_email: 'contact@techhaven.com',
        store_phone: '+234 801 234 5678',
        store_address: '123 Tech Avenue, Ikeja, Lagos',
        store_description: 'Your one-stop shop for electronics and gadgets',
        free_shipping_threshold: 50000,
        domestic_rate: 2500,
        international_rate: 15000,
        handling_time: '1-2',
        return_policy: '30-day return policy. Items must be unused and in original packaging.',
        return_days: 30,
        payment_methods: ['Bank Transfer', 'Card Payment', 'PayPal'],
        store_logo: '',
        store_banner: '',
        theme_color: '#4361ee',
        social_media: {
          facebook: 'https://facebook.com/techhaven',
          twitter: 'https://twitter.com/techhaven',
          instagram: 'https://instagram.com/techhaven',
          whatsapp: '+2348012345678'
        }
      };
      
      setSettings(mockSettings);
      setFormData(mockSettings);
    } catch (error) {
      toast.error('Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        social_media: {
          ...formData.social_media,
          [socialKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleArrayChange = (field, value, action) => {
    const currentArray = formData[field] || [];
    let newArray;

    if (action === 'add' && value && !currentArray.includes(value)) {
      newArray = [...currentArray, value];
    } else if (action === 'remove') {
      newArray = currentArray.filter(item => item !== value);
    } else {
      return;
    }

    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // await vendorAPI.updateStoreSettings(formData);
      setSettings(formData);
      toast.success('Store settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(settings);
    toast.success('Settings reset to last saved');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading store settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Store Settings</h4>
          <p className="text-muted mb-0">Configure your store preferences</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={handleReset}>
            <FaTimes className="me-2" /> Reset
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : <FaSave className="me-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={3} md={4} className="mb-4">
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column p-3">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'general'} 
                    onClick={() => setActiveTab('general')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaStore /> General
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'shipping'} 
                    onClick={() => setActiveTab('shipping')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaTruck /> Shipping
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'returns'} 
                    onClick={() => setActiveTab('returns')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaUndo /> Returns
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'payment'} 
                    onClick={() => setActiveTab('payment')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaCreditCard /> Payment
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'appearance'} 
                    onClick={() => setActiveTab('appearance')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaPalette /> Appearance
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'social'} 
                    onClick={() => setActiveTab('social')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaGlobe /> Social Media
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {/* General Settings */}
              {activeTab === 'general' && (
                <>
                  <h5 className="mb-4">General Information</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Store Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="store_name"
                      value={formData.store_name}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="store_email"
                      value={formData.store_email}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="store_phone"
                      value={formData.store_phone}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="store_address"
                      value={formData.store_address}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="store_description"
                      value={formData.store_description}
                      onChange={handleChange}
                      placeholder="Tell customers about your store..."
                    />
                  </Form.Group>
                </>
              )}

              {/* Shipping Settings */}
              {activeTab === 'shipping' && (
                <>
                  <h5 className="mb-4">Shipping Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Free Shipping Threshold (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      name="free_shipping_threshold"
                      value={formData.free_shipping_threshold}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Orders above this amount get free shipping
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Domestic Shipping Rate (₦)</Form.Label>
                        <Form.Control
                          type="number"
                          name="domestic_rate"
                          value={formData.domestic_rate}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>International Rate (₦)</Form.Label>
                        <Form.Control
                          type="number"
                          name="international_rate"
                          value={formData.international_rate}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Handling Time (days)</Form.Label>
                    <Form.Select
                      name="handling_time"
                      value={formData.handling_time}
                      onChange={handleChange}
                    >
                      <option value="0">Same day</option>
                      <option value="1-2">1-2 business days</option>
                      <option value="2-3">2-3 business days</option>
                      <option value="3-5">3-5 business days</option>
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              {/* Returns Settings */}
              {activeTab === 'returns' && (
                <>
                  <h5 className="mb-4">Return Policy</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Return Period (days)</Form.Label>
                    <Form.Control
                      type="number"
                      name="return_days"
                      value={formData.return_days}
                      onChange={handleChange}
                      min="0"
                      max="365"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Return Policy Details</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="return_policy"
                      value={formData.return_policy}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <>
                  <h5 className="mb-4">Payment Methods</h5>
                  
                  <div className="mb-3">
                    {['Bank Transfer', 'Card Payment', 'PayPal', 'Mobile Money'].map(method => (
                      <Form.Check
                        key={method}
                        type="checkbox"
                        label={method}
                        checked={formData.payment_methods?.includes(method) || false}
                        onChange={(e) => handleArrayChange(
                          'payment_methods',
                          method,
                          e.target.checked ? 'add' : 'remove'
                        )}
                        className="mb-2"
                      />
                    ))}
                  </div>

                  <Alert variant="info">
                    These payment methods will be displayed to customers at checkout
                  </Alert>
                </>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <>
                  <h5 className="mb-4">Store Appearance</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Store Logo</Form.Label>
                    <div className="border rounded-3 p-4 text-center bg-light mb-2">
                      {formData.store_logo ? (
                        <img 
                          src={formData.store_logo} 
                          alt="Store Logo"
                          style={{ maxHeight: '100px', maxWidth: '100%' }}
                        />
                      ) : (
                        <div>
                          <FaImage size={40} className="text-muted mb-2" />
                          <p className="text-muted mb-0">No logo uploaded</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Banner</Form.Label>
                    <div className="border rounded-3 p-4 text-center bg-light mb-2">
                      {formData.store_banner ? (
                        <img 
                          src={formData.store_banner} 
                          alt="Store Banner"
                          style={{ maxHeight: '150px', maxWidth: '100%' }}
                        />
                      ) : (
                        <div>
                          <FaImage size={40} className="text-muted mb-2" />
                          <p className="text-muted mb-0">No banner uploaded</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Theme Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="theme_color"
                      value={formData.theme_color}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Social Media Settings */}
              {activeTab === 'social' && (
                <>
                  <h5 className="mb-4">Social Media Links</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaFacebook className="text-primary me-2" />
                      Facebook
                    </Form.Label>
                    <Form.Control
                      type="url"
                      name="social.facebook"
                      value={formData.social_media?.facebook || ''}
                      onChange={handleChange}
                      placeholder="https://facebook.com/yourstore"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaTwitter className="text-info me-2" />
                      Twitter
                    </Form.Label>
                    <Form.Control
                      type="url"
                      name="social.twitter"
                      value={formData.social_media?.twitter || ''}
                      onChange={handleChange}
                      placeholder="https://twitter.com/yourstore"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaInstagram className="text-danger me-2" />
                      Instagram
                    </Form.Label>
                    <Form.Control
                      type="url"
                      name="social.instagram"
                      value={formData.social_media?.instagram || ''}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourstore"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaWhatsapp className="text-success me-2" />
                      WhatsApp
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="social.whatsapp"
                      value={formData.social_media?.whatsapp || ''}
                      onChange={handleChange}
                      placeholder="+2348012345678"
                    />
                    <Form.Text className="text-muted">
                      Include country code (e.g., +234 for Nigeria)
                    </Form.Text>
                  </Form.Group>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default StoreSettings;
