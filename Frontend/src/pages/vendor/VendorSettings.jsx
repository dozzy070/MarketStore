import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav, Spinner } from 'react-bootstrap';
import { 
  FaStore, 
  FaBell, 
  FaLock, 
  FaPalette, 
  FaGlobe, 
  FaSave,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMoon,
  FaSun,
  FaLanguage,
  FaCreditCard,
  FaTruck,
  FaUndo,
  FaUser,
  FaKey
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { vendorAPI } from '../../services/api';
import toast from 'react-hot-toast';

function VendorSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  
  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_description: '',
    currency: 'NGN',
    tax_rate: 7.5,
    commission_rate: 5
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_inventory: true,
    email_promotions: false,
    sms_orders: true,
    push_orders: true,
    weekly_report: true
  });

  // Shipping Settings
  const [shipping, setShipping] = useState({
    free_shipping_threshold: 50000,
    domestic_rate: 2500,
    international_rate: 15000,
    handling_time: '1-2',
    return_policy: '30-day return policy. Items must be unused and in original packaging.',
    shipping_policy: 'Free shipping on orders over ₦50,000. Delivery within 3-5 business days.'
  });

  // Security Settings
  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    two_factor: false
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Africa/Lagos',
    date_format: 'DD/MM/YYYY'
  });

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      // const response = await vendorAPI.getSettings();
      
      setStoreSettings({
        store_name: 'My Demo Store',
        store_email: 'store@example.com',
        store_phone: '+234 801 234 5678',
        store_address: 'Lagos, Nigeria',
        store_description: 'This is a demo store',
        currency: 'NGN',
        tax_rate: 7.5,
        commission_rate: 5
      });

      setPaymentMethods([
        { id: 1, type: 'bank', name: 'First Bank', account: '****1234', default: true },
        { id: 2, type: 'mobile', name: 'MTN Mobile Money', account: '****5678', default: false }
      ]);

    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreChange = (e) => {
    setStoreSettings({
      ...storeSettings,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    });
  };

  const handleShippingChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e) => {
    setSecurity({
      ...security,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveStore = async () => {
    setSaving(true);
    try {
      // await vendorAPI.updateStoreSettings(storeSettings);
      toast.success('Store settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // await vendorAPI.updateNotificationSettings(notifications);
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Failed to save notifications:', error);
      toast.error('Failed to save notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShipping = async () => {
    setSaving(true);
    try {
      // await vendorAPI.updateShippingSettings(shipping);
      toast.success('Shipping settings saved');
    } catch (error) {
      console.error('Failed to save shipping settings:', error);
      toast.error('Failed to save shipping settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.new_password !== security.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (security.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      // await vendorAPI.changePassword({
      //   current: security.current_password,
      //   new: security.new_password
      // });
      toast.success('Password changed successfully');
      setSecurity({ current_password: '', new_password: '', confirm_password: '', two_factor: security.two_factor });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      // await vendorAPI.updatePreferences(preferences);
      if (preferences.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
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
        <div>
          <h4 className="mb-1">Vendor Settings</h4>
          <p className="text-muted mb-0">Manage your store preferences and configurations</p>
        </div>
      </div>

      <Row>
        <Col lg={3} md={4} className="mb-4">
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column p-3">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'store'} 
                    onClick={() => setActiveTab('store')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaStore /> Store Settings
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
                    active={activeTab === 'notifications'} 
                    onClick={() => setActiveTab('notifications')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaBell /> Notifications
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
                    active={activeTab === 'security'} 
                    onClick={() => setActiveTab('security')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaLock /> Security
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'preferences'} 
                    onClick={() => setActiveTab('preferences')}
                    className="d-flex align-items-center gap-3"
                  >
                    <FaPalette /> Preferences
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} md={8}>
          {/* Store Settings */}
          {activeTab === 'store' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Store Settings</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Store Name</Form.Label>
                    <Form.Control
                      name="store_name"
                      value={storeSettings.store_name}
                      onChange={handleStoreChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Store Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="store_email"
                          value={storeSettings.store_email}
                          onChange={handleStoreChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Store Phone</Form.Label>
                        <Form.Control
                          name="store_phone"
                          value={storeSettings.store_phone}
                          onChange={handleStoreChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Address</Form.Label>
                    <Form.Control
                      name="store_address"
                      value={storeSettings.store_address}
                      onChange={handleStoreChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="store_description"
                      value={storeSettings.store_description}
                      onChange={handleStoreChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Currency</Form.Label>
                        <Form.Select
                          name="currency"
                          value={storeSettings.currency}
                          onChange={handleStoreChange}
                        >
                          <option value="NGN">₦ Naira</option>
                          <option value="USD">$ US Dollar</option>
                          <option value="EUR">€ Euro</option>
                          <option value="GBP">£ Pound</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tax Rate (%)</Form.Label>
                        <Form.Control
                          type="number"
                          name="tax_rate"
                          value={storeSettings.tax_rate}
                          onChange={handleStoreChange}
                          step="0.1"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" onClick={handleSaveStore} disabled={saving}>
                    <FaSave className="me-2" /> Save Store Settings
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Shipping Settings</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Free Shipping Threshold (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      name="free_shipping_threshold"
                      value={shipping.free_shipping_threshold}
                      onChange={handleShippingChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Domestic Rate (₦)</Form.Label>
                        <Form.Control
                          type="number"
                          name="domestic_rate"
                          value={shipping.domestic_rate}
                          onChange={handleShippingChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>International Rate (₦)</Form.Label>
                        <Form.Control
                          type="number"
                          name="international_rate"
                          value={shipping.international_rate}
                          onChange={handleShippingChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Handling Time (days)</Form.Label>
                    <Form.Select
                      name="handling_time"
                      value={shipping.handling_time}
                      onChange={handleShippingChange}
                    >
                      <option value="0">Same day</option>
                      <option value="1-2">1-2 business days</option>
                      <option value="2-3">2-3 business days</option>
                      <option value="3-5">3-5 business days</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Shipping Policy</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="shipping_policy"
                      value={shipping.shipping_policy}
                      onChange={handleShippingChange}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleSaveShipping} disabled={saving}>
                    <FaSave className="me-2" /> Save Shipping Settings
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Returns Settings */}
          {activeTab === 'returns' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Return Policy</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Return Period (days)</Form.Label>
                    <Form.Control
                      type="number"
                      name="return_days"
                      value={30}
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
                      value={shipping.return_policy}
                      onChange={handleShippingChange}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleSaveShipping} disabled={saving}>
                    <FaSave className="me-2" /> Save Return Policy
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Notification Preferences</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <h6 className="mb-3">Email Notifications</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="email_orders"
                    label="New order notifications"
                    checked={notifications.email_orders}
                    onChange={handleNotificationChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="email_inventory"
                    label="Low inventory alerts"
                    checked={notifications.email_inventory}
                    onChange={handleNotificationChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="email_promotions"
                    label="Promotional emails"
                    checked={notifications.email_promotions}
                    onChange={handleNotificationChange}
                  />
                </Form.Group>

                <h6 className="mb-3 mt-4">SMS Notifications</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="sms_orders"
                    label="SMS for new orders"
                    checked={notifications.sms_orders}
                    onChange={handleNotificationChange}
                  />
                </Form.Group>

                <h6 className="mb-3 mt-4">Push Notifications</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="push_orders"
                    label="Push for new orders"
                    checked={notifications.push_orders}
                    onChange={handleNotificationChange}
                  />
                </Form.Group>

                <h6 className="mb-3 mt-4">Reports</h6>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="weekly_report"
                    label="Weekly sales report"
                    checked={notifications.weekly_report}
                    onChange={handleNotificationChange}
                  />
                </Form.Group>

                <Button variant="primary" onClick={handleSaveNotifications} disabled={saving}>
                  <FaSave className="me-2" /> Save Preferences
                </Button>
              </Card.Body>
            </Card>
          )}

          {/* Payment Methods */}
          {activeTab === 'payment' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Payment Methods</h5>
                <Button variant="outline-primary" size="sm">
                  Add New
                </Button>
              </Card.Header>
              <Card.Body className="p-4">
                {paymentMethods.map(method => (
                  <Card key={method.id} className="border-0 bg-light mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <FaCreditCard className="me-2 text-primary" />
                          {method.name} - {method.account}
                          {method.default && (
                            <Badge bg="success" className="ms-2">Default</Badge>
                          )}
                        </div>
                        <div>
                          <Button variant="link" size="sm" className="text-danger">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Security Settings</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <h6 className="mb-3">Change Password</h6>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={security.current_password}
                      onChange={handleSecurityChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={security.new_password}
                      onChange={handleSecurityChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={security.confirm_password}
                      onChange={handleSecurityChange}
                    />
                  </Form.Group>

                  <h6 className="mb-3 mt-4">Two-Factor Authentication</h6>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Enable two-factor authentication"
                      checked={security.two_factor}
                      onChange={(e) => setSecurity({...security, two_factor: e.target.checked})}
                    />
                  </Form.Group>

                  <Button variant="primary" onClick={handleChangePassword} disabled={saving}>
                    <FaKey className="me-2" /> Change Password
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Preferences</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <div className="d-flex gap-3">
                      <Button 
                        variant={preferences.theme === 'light' ? 'primary' : 'outline-secondary'}
                        onClick={() => setPreferences({...preferences, theme: 'light'})}
                      >
                        <FaSun className="me-2" /> Light
                      </Button>
                      <Button 
                        variant={preferences.theme === 'dark' ? 'primary' : 'outline-secondary'}
                        onClick={() => setPreferences({...preferences, theme: 'dark'})}
                      >
                        <FaMoon className="me-2" /> Dark
                      </Button>
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                          name="language"
                          value={preferences.language}
                          onChange={handlePreferenceChange}
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Select
                          name="timezone"
                          value={preferences.timezone}
                          onChange={handlePreferenceChange}
                        >
                          <option value="Africa/Lagos">Lagos (GMT+1)</option>
                          <option value="Africa/Cairo">Cairo (GMT+2)</option>
                          <option value="Europe/London">London (GMT+0)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Date Format</Form.Label>
                    <Form.Select
                      name="date_format"
                      value={preferences.date_format}
                      onChange={handlePreferenceChange}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" onClick={handleSavePreferences} disabled={saving}>
                    <FaSave className="me-2" /> Save Preferences
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default VendorSettings;
