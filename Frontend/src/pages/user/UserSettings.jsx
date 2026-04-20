import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaPalette, 
  FaGlobe,
  FaSave,
  FaTimes,
  FaMoon,
  FaSun,
  FaLanguage
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

function UserSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  // Password settings
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_promotions: false,
    sms_updates: true,
    push_notifications: false
  });

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // API call to update password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      toast.success('Password updated successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call to update notifications
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Settings</h4>
          <p className="text-muted mb-0">Manage your account settings and preferences</p>
        </div>
      </div>

      <Row>
        <Col lg={3}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column p-3">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                    className="d-flex align-items-center"
                  >
                    <FaUser className="me-2" /> Profile Information
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'password'} 
                    onClick={() => setActiveTab('password')}
                    className="d-flex align-items-center"
                  >
                    <FaLock className="me-2" /> Password & Security
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'notifications'} 
                    onClick={() => setActiveTab('notifications')}
                    className="d-flex align-items-center"
                  >
                    <FaBell className="me-2" /> Notifications
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'appearance'} 
                    onClick={() => setActiveTab('appearance')}
                    className="d-flex align-items-center"
                  >
                    <FaPalette className="me-2" /> Appearance
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'language'} 
                    onClick={() => setActiveTab('language')}
                    className="d-flex align-items-center"
                  >
                    <FaGlobe className="me-2" /> Language & Region
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <>
                  <h5 className="mb-4">Profile Information</h5>
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={profileForm.full_name}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            placeholder="Enter your email"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us a little about yourself"
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary" disabled={loading}>
                      <FaSave className="me-2" /> Save Changes
                    </Button>
                  </Form>
                </>
              )}

              {/* Password Settings */}
              {activeTab === 'password' && (
                <>
                  <h5 className="mb-4">Password & Security</h5>
                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary" disabled={loading}>
                      <FaLock className="me-2" /> Update Password
                    </Button>
                  </Form>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <>
                  <h5 className="mb-4">Notification Preferences</h5>
                  <Form onSubmit={handleNotificationSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        name="email_orders"
                        label="Email me about order updates"
                        checked={notifications.email_orders}
                        onChange={handleNotificationChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        name="email_promotions"
                        label="Email me about promotions and deals"
                        checked={notifications.email_promotions}
                        onChange={handleNotificationChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        name="sms_updates"
                        label="SMS updates for order status"
                        checked={notifications.sms_updates}
                        onChange={handleNotificationChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check
                        type="switch"
                        name="push_notifications"
                        label="Push notifications"
                        checked={notifications.push_notifications}
                        onChange={handleNotificationChange}
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary" disabled={loading}>
                      <FaBell className="me-2" /> Update Preferences
                    </Button>
                  </Form>
                </>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <>
                  <h5 className="mb-4">Appearance</h5>
                  <Card className="bg-light border-0 mb-4">
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1">Theme Mode</h6>
                          <p className="text-muted small mb-0">
                            Switch between light and dark theme
                          </p>
                        </div>
                        <Button 
                          variant={theme === 'dark' ? 'light' : 'dark'}
                          onClick={toggleTheme}
                          className="d-flex align-items-center"
                        >
                          {theme === 'dark' ? (
                            <>
                              <FaSun className="me-2" /> Light Mode
                            </>
                          ) : (
                            <>
                              <FaMoon className="me-2" /> Dark Mode
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                  <Form.Group className="mb-3">
                    <Form.Label>Accent Color</Form.Label>
                    <div className="d-flex gap-2">
                      {['primary', 'success', 'danger', 'warning', 'info'].map(color => (
                        <div
                          key={color}
                          className={`bg-${color} rounded-circle`}
                          style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                          onClick={() => toast.info(`Color theme changed to ${color}`)}
                        />
                      ))}
                    </div>
                  </Form.Group>
                </>
              )}

              {/* Language Settings */}
              {activeTab === 'language' && (
                <>
                  <h5 className="mb-4">Language & Region</h5>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Language</Form.Label>
                      <Form.Select defaultValue="en">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Currency</Form.Label>
                      <Form.Select defaultValue="NGN">
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Date Format</Form.Label>
                      <Form.Select defaultValue="DD/MM/YYYY">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Form.Select>
                    </Form.Group>

                    <Button variant="primary">
                      <FaSave className="me-2" /> Save Preferences
                    </Button>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default UserSettings;
