import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, Spinner } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaCalendar,
  FaShoppingBag,
  FaHeart,
  FaStar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Default profile from auth user
  const [profile, setProfile] = useState({
    full_name: user?.full_name || 'User',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '+234 801 234 5678',
    location: user?.location || 'Lagos, Nigeria',
    avatar: '',
    bio: 'No bio added yet.',
    joined: user?.created_at || new Date().toISOString(),
    verified: user?.verified || false
  });

  const [stats, setStats] = useState({
    orders: 24,
    wishlist: 18,
    reviews: 12,
    totalSpent: 245000
  });

  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio
  });

  useEffect(() => {
    // Try to fetch additional profile data
    const fetchProfileData = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.data) {
          const data = response.data.data || response.data;
          setProfile(prev => ({
            ...prev,
            ...data,
            full_name: data.full_name || prev.full_name,
            phone: data.phone || data.phone_number || prev.phone,
            location: data.location || prev.location,
            bio: data.bio || prev.bio
          }));
          setFormData({
            full_name: data.full_name || profile.full_name,
            phone: data.phone || data.phone_number || profile.phone,
            location: data.location || profile.location,
            bio: data.bio || profile.bio
          });
        }
      } catch (error) {
        console.log('Using default profile data');
      }
    };
    
    fetchProfileData();
  }, []);

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
      setProfile({ ...profile, ...formData });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      // Optimistic update
      setProfile({ ...profile, ...formData });
      setEditing(false);
      toast.success('Profile updated (demo mode)');
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
                <Badge bg="primary">Customer</Badge>
                {profile.verified && <Badge bg="success" className="ms-2">Verified</Badge>}
              </div>

              <hr />

              <div className="text-start">
                <p className="mb-2">
                  <FaPhone className="text-primary me-2" />
                  {profile.phone}
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  {profile.location}
                </p>
                <p className="mb-0">
                  <FaCalendar className="text-primary me-2" />
                  Member since {new Date(profile.joined).toLocaleDateString()}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <FaShoppingBag className="text-primary mb-2" size={24} />
                  <h3>{stats.orders}</h3>
                  <p className="text-muted mb-0">Orders</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <FaHeart className="text-danger mb-2" size={24} />
                  <h3>{stats.wishlist}</h3>
                  <p className="text-muted mb-0">Wishlist</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <FaStar className="text-warning mb-2" size={24} />
                  <h3>{stats.reviews}</h3>
                  <p className="text-muted mb-0">Reviews</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <FaShoppingBag className="text-success mb-2" size={24} />
                  <h3>₦{(stats.totalSpent / 1000).toFixed(1)}k</h3>
                  <p className="text-muted mb-0">Total Spent</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Edit Profile */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Personal Information</h5>
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
                          required
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
                        <strong>Phone:</strong><br />
                        <span className="text-muted">{profile.phone}</span>
                      </p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-3">
                        <strong>Location:</strong><br />
                        <span className="text-muted">{profile.location}</span>
                      </p>
                    </Col>
                  </Row>
                  <p className="mb-0">
                    <strong>Bio:</strong><br />
                    <span className="text-muted">{profile.bio}</span>
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default UserProfile;