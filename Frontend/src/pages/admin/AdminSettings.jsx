import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, Tab, Nav, 
  InputGroup, Alert, Spinner 
} from 'react-bootstrap';
import { 
  FaCog, 
  FaGlobe, 
  FaDollarSign, 
  FaTruck, 
  FaEnvelope,
  FaShieldAlt,
  FaBell,
  FaSave,
  FaTimes,
  FaCheck,
  FaPalette,
  FaLanguage,
  FaClock,
  FaPercent,
  FaWallet,
  FaCreditCard,
  FaUsers,
  FaStore,
  FaBox,
  FaShoppingCart,
  FaBars,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  useEffect(() => {
    fetchSettings();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth <= 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Mock data for testing - replace with actual API call
      // const response = await adminAPI.getSettings();
      // setSettings(response.data);
      // setFormData(response.data);
      
      // Mock data
      const mockSettings = {
        // General Settings
        site_name: 'MarketStore',
        site_description: 'Your one-stop shop for quality products',
        site_email: 'admin@marketstore.com',
        site_phone: '+234 801 234 5678',
        site_address: 'Lagos, Nigeria',
        timezone: 'Africa/Lagos',
        language: 'en',
        maintenance_mode: false,
        guest_checkout: true,
        
        // Commerce Settings
        currency: 'NGN',
        tax_rate: 7.5,
        commission_rate: 5,
        min_payout: 1000,
        enable_coupons: true,
        enable_reviews: true,
        
        // Shipping Settings
        free_shipping_threshold: 50000,
        domestic_rate: 2500,
        international_rate: 15000,
        international_shipping: true,
        default_shipping: 'standard',
        
        // Payment Settings
        payment_methods: ['Bank Transfer', 'Card Payment', 'PayPal'],
        payment_gateway: 'paystack',
        conversion_fee: 1,
        
        // Email Settings
        sender_email: 'noreply@marketstore.com',
        sender_name: 'MarketStore',
        email_new_order: true,
        email_vendor_reg: true,
        email_password_reset: true,
        
        // Security Settings
        admin_2fa: false,
        session_timeout: 30,
        login_alerts: true,
        rate_limit: 60,
        
        // User Settings
        allow_registration: true,
        require_email_verification: true,
        default_user_role: 'user',
        
        // Vendor Settings
        auto_approve_vendors: false,
        vendor_commission: 5,
        min_payout_vendor: 5000,
        
        // Product Settings
        max_product_images: 5,
        max_file_size: 5,
        allow_product_reviews: true,
        moderate_reviews: true
      };
      
      setSettings(mockSettings);
      setFormData(mockSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
      // await adminAPI.updateSettings(formData);
      setSettings(formData);
      toast.success('Settings saved successfully');
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          {isMobile && (
            <Button 
              variant="link" 
              className="me-2 p-0"
              onClick={toggleSidebar}
            >
              <FaBars size={24} />
            </Button>
          )}
          <div>
            <h4 className="mb-1">System Settings</h4>
            <p className="text-muted mb-0">Configure global marketplace settings</p>
          </div>
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

      <Row className="position-relative">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="settings-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1040,
              transition: 'all 0.3s'
            }}
          />
        )}

        {/* Sidebar */}
        <Col 
          lg={3} 
          md={4} 
          className="mb-4"
          style={{
            position: isMobile ? 'fixed' : 'relative',
            left: isMobile ? (sidebarOpen ? '0' : '-100%') : '0',
            top: isMobile ? '60px' : '0',
            width: isMobile ? '280px' : 'auto',
            zIndex: 1050,
            transition: 'left 0.3s ease-in-out',
            height: isMobile ? 'calc(100vh - 60px)' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}
        >
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-0">
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom d-lg-none">
                <h6 className="mb-0">Settings Menu</h6>
                <Button 
                  variant="link" 
                  className="p-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTimes />
                </Button>
              </div>
              <Nav variant="pills" className="flex-column p-3">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'general'} 
                    onClick={() => handleTabClick('general')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaCog /> General
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'commerce'} 
                    onClick={() => handleTabClick('commerce')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaDollarSign /> Commerce
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'shipping'} 
                    onClick={() => handleTabClick('shipping')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaTruck /> Shipping
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'payment'} 
                    onClick={() => handleTabClick('payment')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaCreditCard /> Payments
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'email'} 
                    onClick={() => handleTabClick('email')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaEnvelope /> Email
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'security'} 
                    onClick={() => handleTabClick('security')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaShieldAlt /> Security
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'users'} 
                    onClick={() => handleTabClick('users')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaUsers /> Users
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'vendors'} 
                    onClick={() => handleTabClick('vendors')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaStore /> Vendors
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'products'} 
                    onClick={() => handleTabClick('products')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaBox /> Products
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col 
          lg={9} 
          md={8} 
          style={{
            marginLeft: isMobile ? '0' : 'auto',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {/* General Settings */}
              {activeTab === 'general' && (
                <>
                  <h5 className="mb-4">General Settings</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Site Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="site_name"
                      value={formData.site_name || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Site Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="site_description"
                      value={formData.site_description || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Site Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="site_email"
                      value={formData.site_email || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Site Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="site_phone"
                      value={formData.site_phone || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Site Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="site_address"
                      value={formData.site_address || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Select
                          name="timezone"
                          value={formData.timezone || 'Africa/Lagos'}
                          onChange={handleChange}
                        >
                          <option value="Africa/Lagos">Lagos (GMT+1)</option>
                          <option value="Africa/Cairo">Cairo (GMT+2)</option>
                          <option value="Africa/Johannesburg">Johannesburg (GMT+2)</option>
                          <option value="Europe/London">London (GMT+0)</option>
                          <option value="America/New_York">New York (GMT-5)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                          name="language"
                          value={formData.language || 'en'}
                          onChange={handleChange}
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                          <option value="ar">Arabic</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Maintenance Mode"
                      name="maintenance_mode"
                      checked={formData.maintenance_mode || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Enable Guest Checkout"
                      name="guest_checkout"
                      checked={formData.guest_checkout || false}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Commerce Settings */}
              {activeTab === 'commerce' && (
                <>
                  <h5 className="mb-4">Commerce Settings</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Currency</Form.Label>
                        <Form.Select
                          name="currency"
                          value={formData.currency || 'NGN'}
                          onChange={handleChange}
                        >
                          <option value="NGN">₦ Nigerian Naira</option>
                          <option value="USD">$ US Dollar</option>
                          <option value="EUR">€ Euro</option>
                          <option value="GBP">£ British Pound</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tax Rate (%)</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="tax_rate"
                            value={formData.tax_rate || 7.5}
                            onChange={handleChange}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Commission Rate (%)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="commission_rate"
                        value={formData.commission_rate || 5}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Payout Amount (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      name="min_payout"
                      value={formData.min_payout || 1000}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Enable Coupons"
                      name="enable_coupons"
                      checked={formData.enable_coupons || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Enable Reviews"
                      name="enable_reviews"
                      checked={formData.enable_reviews || false}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Shipping Settings */}
              {activeTab === 'shipping' && (
                <>
                  <h5 className="mb-4">Shipping Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Default Shipping Method</Form.Label>
                    <Form.Select
                      name="default_shipping"
                      value={formData.default_shipping || 'standard'}
                      onChange={handleChange}
                    >
                      <option value="standard">Standard Delivery</option>
                      <option value="express">Express Delivery</option>
                      <option value="pickup">Store Pickup</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Free Shipping Threshold (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      name="free_shipping_threshold"
                      value={formData.free_shipping_threshold || 50000}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Domestic Shipping Rate (₦)</Form.Label>
                        <Form.Control
                          type="number"
                          name="domestic_rate"
                          value={formData.domestic_rate || 2500}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>International Shipping Rate (₦)</Form.Label>
                        <Form.Control
                          type="number"
                          name="international_rate"
                          value={formData.international_rate || 15000}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Allow International Shipping"
                      name="international_shipping"
                      checked={formData.international_shipping || false}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <>
                  <h5 className="mb-4">Payment Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Methods</Form.Label>
                    <div className="mb-2">
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
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Payment Gateway</Form.Label>
                    <Form.Select
                      name="payment_gateway"
                      value={formData.payment_gateway || 'paystack'}
                      onChange={handleChange}
                    >
                      <option value="paystack">Paystack</option>
                      <option value="flutterwave">Flutterwave</option>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Currency Conversion Fee (%)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="conversion_fee"
                        value={formData.conversion_fee || 1}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <>
                  <h5 className="mb-4">Email Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Sender Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="sender_email"
                      value={formData.sender_email || 'noreply@marketstore.com'}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Sender Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="sender_name"
                      value={formData.sender_name || 'MarketStore'}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <h6 className="mb-3 mt-4">Email Notifications</h6>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="New Order Notification"
                      name="email_new_order"
                      checked={formData.email_new_order || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Vendor Registration"
                      name="email_vendor_reg"
                      checked={formData.email_vendor_reg || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Password Reset"
                      name="email_password_reset"
                      checked={formData.email_password_reset || false}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <>
                  <h5 className="mb-4">Security Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Two-Factor Authentication for Admins"
                      name="admin_2fa"
                      checked={formData.admin_2fa || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Session Timeout (minutes)</Form.Label>
                    <Form.Select
                      name="session_timeout"
                      value={formData.session_timeout || 30}
                      onChange={handleChange}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Login Alerts"
                      name="login_alerts"
                      checked={formData.login_alerts || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Rate Limiting (requests per minute)</Form.Label>
                    <Form.Control
                      type="number"
                      name="rate_limit"
                      value={formData.rate_limit || 60}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* User Settings */}
              {activeTab === 'users' && (
                <>
                  <h5 className="mb-4">User Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Allow User Registration"
                      name="allow_registration"
                      checked={formData.allow_registration || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Require Email Verification"
                      name="require_email_verification"
                      checked={formData.require_email_verification || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Default User Role</Form.Label>
                    <Form.Select
                      name="default_user_role"
                      value={formData.default_user_role || 'user'}
                      onChange={handleChange}
                    >
                      <option value="user">User</option>
                      <option value="vendor">Vendor</option>
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              {/* Vendor Settings */}
              {activeTab === 'vendors' && (
                <>
                  <h5 className="mb-4">Vendor Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Auto-approve Vendors"
                      name="auto_approve_vendors"
                      checked={formData.auto_approve_vendors || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Vendor Commission (%)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="vendor_commission"
                        value={formData.vendor_commission || 5}
                        onChange={handleChange}
                        step="0.1"
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Payout for Vendors (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      name="min_payout_vendor"
                      value={formData.min_payout_vendor || 5000}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </>
              )}

              {/* Product Settings */}
              {activeTab === 'products' && (
                <>
                  <h5 className="mb-4">Product Settings</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Max Images per Product</Form.Label>
                        <Form.Control
                          type="number"
                          name="max_product_images"
                          value={formData.max_product_images || 5}
                          onChange={handleChange}
                          min="1"
                          max="20"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Max File Size (MB)</Form.Label>
                        <Form.Control
                          type="number"
                          name="max_file_size"
                          value={formData.max_file_size || 5}
                          onChange={handleChange}
                          min="1"
                          max="50"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Allow Product Reviews"
                      name="allow_product_reviews"
                      checked={formData.allow_product_reviews || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Moderate Reviews Before Publishing"
                      name="moderate_reviews"
                      checked={formData.moderate_reviews || false}
                      onChange={handleChange}
                    />
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

export default AdminSettings;
