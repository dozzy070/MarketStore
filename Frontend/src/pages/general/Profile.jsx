import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Badge, Image } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaStore, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaBox,
  FaCalendar,
  FaHeart
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { vendorAPI, productAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    joined: ''
  });
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    location: '',
    store_description: '',
    verified: false,
    role: '',
    created_at: ''
  });
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    location: '',
    store_description: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        vendorAPI.getProfile(),
        productAPI.getStats()
      ]);

      setProfile(profileRes.data);
      setFormData({
        full_name: profileRes.data.full_name || '',
        phone_number: profileRes.data.phone_number || '',
        location: profileRes.data.location || '',
        store_description: profileRes.data.store_description || ''
      });
      
      setStats({
        products: statsRes.data.total_products || 0,
        joined: new Date(profileRes.data.created_at).toLocaleDateString() || '2026'
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await vendorAPI.updateProfile(formData);
      setProfile({ ...profile, ...response.data });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      location: profile.location,
      store_description: profile.store_description
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="welcome-banner mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>My Profile</h2>
              <p className="mb-0">Manage your personal information and account settings</p>
            </div>
            {!editing && (
              <Button 
                variant="light" 
                onClick={() => setEditing(true)}
                className="d-flex align-items-center"
              >
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Only Products Count */}
      <Row className="g-4 mb-4">
        <Col sm={6} md={4} className="mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm text-center stat-card">
              <Card.Body>
                <div className="stat-icon bg-primary bg-opacity-10 mx-auto mb-3">
                  <FaBox className="text-primary" size={24} />
                </div>
                <h3>{stats.products}</h3>
                <p className="text-muted small mb-0">Products</p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="text-center p-4">
                <div className="position-relative d-inline-block mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '120px', height: '120px' }}>
                    <FaUser size={50} className="text-primary" />
                  </div>
                  {profile.verified && (
                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1">
                      <FaCheckCircle className="text-white" size={16} />
                    </div>
                  )}
                </div>
                
                <h4>{profile.full_name}</h4>
                <p className="text-muted mb-2">{profile.email}</p>
                
                <div className="mb-3">
                  {profile.verified ? (
                    <Badge bg="success" className="me-2 px-3 py-2">
                      <FaCheckCircle className="me-1" /> Verified Vendor
                    </Badge>
                  ) : (
                    <Badge bg="warning" className="me-2 px-3 py-2">
                      Pending Verification
                    </Badge>
                  )}
                  <Badge bg="info" className="px-3 py-2">
                    <FaStore className="me-1" /> {profile.role || 'Vendor'}
                  </Badge>
                </div>

                <div className="text-start mt-4">
                  <p className="text-muted small mb-2">
                    <FaCalendar className="me-2" />
                    Member since {stats.joined}
                  </p>
                  <p className="text-muted small mb-0">
                    <FaMapMarkerAlt className="me-2" />
                    {profile.location || 'Location not set'}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </motion.div>

          {/* Store Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaStore className="text-primary me-2" size={20} />
                  <h6 className="mb-0">Store Preview</h6>
                </div>
                <p className="small text-muted mb-2">
                  {profile.store_description || 'No store description yet. Add one to attract customers!'}
                </p>
                <Button variant="outline-primary" size="sm" onClick={() => window.open('/store', '_blank')}>
                  View My Store
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col lg={8}>
          {/* Edit Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Personal Information</h5>
              </Card.Header>
              <Card.Body className="p-4">
                {editing ? (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={profile.email}
                            disabled
                            className="bg-light"
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="e.g., 08012345678"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Lagos, Nigeria"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Store Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="store_description"
                        rows={4}
                        value={formData.store_description}
                        onChange={handleChange}
                        placeholder="Tell customers about your store, what you sell, and what makes you special..."
                      />
                      <Form.Text className="text-muted">
                        This will be displayed on your public store page
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-3">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="secondary" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <>
                    <Row>
                      <Col md={6}>
                        <p className="mb-3">
                          <strong>Full Name:</strong><br />
                          <span className="text-muted">{profile.full_name}</span>
                        </p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-3">
                          <strong>Email:</strong><br />
                          <span className="text-muted">{profile.email}</span>
                        </p>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <p className="mb-3">
                          <strong>Phone Number:</strong><br />
                          <span className="text-muted">{profile.phone_number || 'Not set'}</span>
                        </p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-3">
                          <strong>Location:</strong><br />
                          <span className="text-muted">{profile.location || 'Not set'}</span>
                        </p>
                      </Col>
                    </Row>

                    <p className="mb-3">
                      <strong>Store Description:</strong><br />
                      <span className="text-muted">{profile.store_description || 'No description added yet'}</span>
                    </p>

                    <p className="mb-0 text-muted small">
                      <FaCalendar className="me-2" />
                      Member since: {stats.joined}
                    </p>
                  </>
                )}
              </Card.Body>
            </Card>
          </motion.div>

          {/* Recent Activity section removed as per request */}
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default Profile;
