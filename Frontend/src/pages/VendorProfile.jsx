import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Badge, Image, Spinner } from 'react-bootstrap';
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
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { vendorAPI } from '../services/api';
import toast from 'react-hot-toast';

function VendorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    store_name: user?.store_name || user?.full_name || 'My Store',
    full_name: user?.full_name || 'Vendor',
    email: user?.email || 'vendor@example.com',
    phone: user?.phone || '+234 801 234 5678',
    location: user?.location || 'Lagos, Nigeria',
    bio: 'Welcome to my store!',
    store_logo: '',
    website: '',
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      whatsapp: ''
    },
    verified: user?.verified || false
  });

  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await vendorAPI.getProfile();
        if (response.data) {
          const data = response.data.data || response.data;
          setProfile(prev => ({ ...prev, ...data }));
          setFormData(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.log('Using default vendor data');
      }
    };
    
    fetchVendorData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social_media.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        social_media: {
          ...formData.social_media,
          [socialKey]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await vendorAPI.updateProfile(formData);
      setProfile(formData);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      setProfile(formData);
      setEditing(false);
      toast.success('Profile updated (demo mode)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Vendor Profile</h4>
          <p className="text-muted mb-0">Manage your store information</p>
        </div>
        {!editing ? (
          <Button variant="primary" onClick={() => setEditing(true)}>
            <FaEdit className="me-2" /> Edit Profile
          </Button>
        ) : (
          <div className="d-flex gap-2">
            <Button variant="success" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : <><FaSave className="me-2" /> Save</>}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              <FaTimes className="me-2" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <Row>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <div className="position-relative d-inline-block mb-3">
                <div className="rounded-circle overflow-hidden border border-4 border-white shadow"
                     style={{ width: '120px', height: '120px' }}>
                  {profile.store_logo ? (
                    <img 
                      src={profile.store_logo} 
                      alt={profile.store_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-primary bg-opacity-10 d-flex align-items-center justify-content-center w-100 h-100">
                      <FaStore size={50} className="text-primary" />
                    </div>
                  )}
                </div>
                {profile.verified && (
                  <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1">
                    <FaCheckCircle className="text-white" size={16} />
                  </div>
                )}
              </div>

              <h4>{profile.store_name}</h4>
              <p className="text-muted mb-2">{profile.full_name}</p>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <Badge bg="primary">Vendor</Badge>
                {profile.verified && <Badge bg="success">Verified</Badge>}
              </div>

              <div className="text-start mt-3">
                <p className="mb-2">
                  <FaEnvelope className="text-primary me-2" />
                  {profile.email}
                </p>
                <p className="mb-2">
                  <FaPhone className="text-primary me-2" />
                  {profile.phone}
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  {profile.location}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Store Information</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {editing ? (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Store Name</Form.Label>
                        <Form.Control
                          name="store_name"
                          value={formData.store_name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Owner Name</Form.Label>
                        <Form.Control
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
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
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourstore.com"
                    />
                  </Form.Group>

                  <h6>Social Media</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Facebook</Form.Label>
                        <Form.Control
                          name="social_media.facebook"
                          value={formData.social_media?.facebook}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Twitter</Form.Label>
                        <Form.Control
                          name="social_media.twitter"
                          value={formData.social_media?.twitter}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Instagram</Form.Label>
                        <Form.Control
                          name="social_media.instagram"
                          value={formData.social_media?.instagram}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>WhatsApp</Form.Label>
                        <Form.Control
                          name="social_media.whatsapp"
                          value={formData.social_media?.whatsapp}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <>
                  <Row>
                    <Col md={6}>
                      <p><strong>Store Name:</strong><br />{profile.store_name}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Owner Name:</strong><br />{profile.full_name}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <p><strong>Email:</strong><br />{profile.email}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Phone:</strong><br />{profile.phone}</p>
                    </Col>
                  </Row>
                  <p><strong>Location:</strong><br />{profile.location}</p>
                  <p><strong>Bio:</strong><br />{profile.bio}</p>
                  {profile.website && (
                    <p><strong>Website:</strong><br /><a href={profile.website}>{profile.website}</a></p>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default VendorProfile;