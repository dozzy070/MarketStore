import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Badge, Image } from 'react-bootstrap';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaCalendar,
  FaShoppingBag,
  FaHeart,
  FaStar,
  FaSpinner,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { userAPI, orderAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

function UserProfile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileError, setProfileError] = useState(false);

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

  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
    totalSpent: 0
  });

  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio
  });

  // Fetch all data silently (no loading spinner)
  const fetchUserData = async () => {
    setProfileError(false);

    let profileData = null;
    let ordersData = [];
    let wishlistCount = 0;
    let reviewsCount = 0;
    let totalSpent = 0;

    // 1. Fetch profile
    try {
      const response = await userAPI.getProfile();
      if (response.data) {
        profileData = response.data.data || response.data.user || response.data;
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfileError(true);
    }

    // 2. Fetch orders
    try {
      const response = await orderAPI.getOrders();
      if (response.data) {
        ordersData = response.data.orders ||
          response.data.data ||
          (Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }

    // 3. Fetch wishlist count
    try {
      const response = await userAPI.getWishlist();
      if (response.data) {
        const wishlistData = response.data;
        if (Array.isArray(wishlistData)) wishlistCount = wishlistData.length;
        else if (wishlistData.data && Array.isArray(wishlistData.data)) wishlistCount = wishlistData.data.length;
        else if (wishlistData.wishlist && Array.isArray(wishlistData.wishlist)) wishlistCount = wishlistData.wishlist.length;
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }

    // 4. Fetch reviews count (only if method exists)
    if (typeof userAPI.getReviews === 'function') {
      try {
        const response = await userAPI.getReviews();
        if (response.data) {
          const reviewsData = response.data;
          if (Array.isArray(reviewsData)) reviewsCount = reviewsData.length;
          else if (reviewsData.data && Array.isArray(reviewsData.data)) reviewsCount = reviewsData.data.length;
          else if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) reviewsCount = reviewsData.reviews.length;
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    }

    // 5. Fetch payments
    try {
      const response = await paymentAPI.getPaymentHistory();
      if (response.data) {
        const payments = response.data.payments || [];
        totalSpent = payments.reduce((sum, p) => sum + (p.status === 'success' ? (p.amount || 0) : 0), 0);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }

    // Update state with real data (fallback to auth context)
    setProfile({
      full_name: profileData?.full_name || user?.full_name || '',
      email: profileData?.email || user?.email || '',
      phone: profileData?.phone || profileData?.phone_number || user?.phone || '',
      location: profileData?.location || user?.location || '',
      avatar: profileData?.avatar || '',
      bio: profileData?.bio || '',
      joined: profileData?.created_at || user?.created_at || new Date().toISOString(),
      verified: profileData?.verified || user?.verified || false
    });

    setFormData({
      full_name: profileData?.full_name || user?.full_name || '',
      phone: profileData?.phone || profileData?.phone_number || user?.phone || '',
      location: profileData?.location || user?.location || '',
      bio: profileData?.bio || ''
    });

    setStats({
      orders: ordersData.length,
      wishlist: wishlistCount,
      reviews: reviewsCount,
      totalSpent
    });
  };

  useEffect(() => {
    fetchUserData();
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
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // No loading spinner – component renders immediately with fallback data
  return (
    <DashboardLayout>
      {profileError && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>⚠️</strong> Could not fetch your profile data. Displaying information from your account.
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}
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
                  {profile.phone || 'Not provided'}
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  {profile.location || 'Not provided'}
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
                  <h3>{formatCurrency(stats.totalSpent)}</h3>
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
                        <span className="text-muted">{profile.phone || 'Not provided'}</span>
                      </p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-3">
                        <strong>Location:</strong><br />
                        <span className="text-muted">{profile.location || 'Not provided'}</span>
                      </p>
                    </Col>
                  </Row>
                  <p className="mb-0">
                    <strong>Bio:</strong><br />
                    <span className="text-muted">{profile.bio || 'No bio added yet.'}</span>
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default UserProfile;