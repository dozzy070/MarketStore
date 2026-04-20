import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Badge, Image } from 'react-bootstrap';
import { 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaCalendar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

function AdminProfile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Initial profile – start with auth context data (no mock)
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    avatar: '',
    bio: '',
    joined: user?.created_at || new Date().toISOString(),
    verified: user?.verified || false
  });

  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio
  });

  // Fetch real profile data from API (no loading indicator)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.data) {
          const data = response.data.data || response.data.user || response.data;
          setProfile({
            full_name: data.full_name || user?.full_name || '',
            email: data.email || user?.email || '',
            phone: data.phone || data.phone_number || user?.phone || '',
            location: data.location || user?.location || '',
            avatar: data.avatar || '',
            bio: data.bio || '',
            joined: data.created_at || user?.created_at || new Date().toISOString(),
            verified: data.verified || user?.verified || false
          });
          setFormData({
            full_name: data.full_name || user?.full_name || '',
            phone: data.phone || data.phone_number || user?.phone || '',
            location: data.location || user?.location || '',
            bio: data.bio || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Keep using auth context data – no toast on initial load to avoid spam
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Row>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <div className="position-relative d-inline-block mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '120px', height: '120px' }}>
                  {profile.avatar ? (
                    <Image src={profile.avatar} roundedCircle fluid />
                  ) : (
                    <FaUser size={50} className="text-primary" />
                  )}
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
                <Badge bg="danger">Administrator</Badge>
                {profile.verified && <Badge bg="success" className="ms-2">Verified</Badge>}
              </div>

              <hr />

              <div className="text-start">
                <p className="mb-2">
                  <FaPhone className="text-primary me-2" />
                  {profile.phone || 'Not provided'}
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  {profile.location || 'Not provided'}
                </p>
                <p className="mb-0">
                  <FaCalendar className="text-primary me-2" />
                  Joined {new Date(profile.joined).toLocaleDateString()}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Admin Information</h5>
              {!editing ? (
                <Button variant="outline-primary" onClick={() => setEditing(true)}>
                  <FaEdit className="me-2" /> Edit Profile
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Saving...' : <><FaSave className="me-2" /> Save</>}
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    <FaTimes /> Cancel
                  </Button>
                </div>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              {editing ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={profile.email}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                    />
                  </Form.Group>
                </Form>
              ) : (
                <>
                  <Row>
                    <Col md={6}>
                      <p><strong>Full Name:</strong><br />{profile.full_name}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Email:</strong><br />{profile.email}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <p><strong>Phone:</strong><br />{profile.phone || 'Not provided'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Location:</strong><br />{profile.location || 'Not provided'}</p>
                    </Col>
                  </Row>
                  <p><strong>Bio:</strong><br />{profile.bio || 'No bio added yet.'}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default AdminProfile;
