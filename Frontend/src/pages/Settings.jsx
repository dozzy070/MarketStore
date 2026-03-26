import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav } from 'react-bootstrap';
import { FaCog, FaBell, FaPalette, FaGlobe, FaSave, FaKey, FaMoon, FaSun } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { SettingsSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'My Store',
    email: 'vendor@example.com',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <DashboardLayout>
      <Row className="mb-4">
        <Col>
          <h4 className="mb-0"><FaCog className="me-2" /> Settings</h4>
          <p className="text-muted">Manage your preferences</p>
        </Col>
      </Row>

      <Row>
        <Col lg={3} md={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column p-3">
                <Nav.Item><Nav.Link active={activeTab === 'general'} onClick={() => setActiveTab('general')}><FaCog className="me-2" /> General</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}><FaBell className="me-2" /> Notifications</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}><FaPalette className="me-2" /> Appearance</Nav.Link></Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} md={8}>
          {loading ? (
            <SettingsSkeleton />
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                {activeTab === 'general' && (
                  <>
                    <h5 className="mb-4">General Settings</h5>
                    <Form>
                      <Form.Group className="mb-3"><Form.Label>Store Name</Form.Label><Form.Control value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Currency</Form.Label><Form.Select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})}><option>NGN</option><option>USD</option></Form.Select></Form.Group>
                      <Button variant="primary" onClick={handleSave}><FaSave className="me-2" /> Save</Button>
                    </Form>
                  </>
                )}
                {activeTab === 'notifications' && (
                  <>
                    <h5 className="mb-4">Notification Preferences</h5>
                    <Form>
                      <Form.Check type="switch" label="Email Notifications" checked={settings.emailNotifications} onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})} />
                      <Form.Check type="switch" label="SMS Notifications" checked={settings.smsNotifications} onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})} />
                      <Button variant="primary" onClick={handleSave} className="mt-3"><FaSave className="me-2" /> Save</Button>
                    </Form>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default Settings;