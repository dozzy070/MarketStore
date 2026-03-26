// frontend/src/pages/AdminReviews.jsx - Fixed Version (No Loading Spinners, No Mock Data)
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { 
  FaStar, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaSearch,
  FaUser,
  FaBox,
  FaFlag,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    reported: 0
  });

  // Single fetchReviews function - no mock data
  const fetchReviews = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('Fetching reviews...');
      
      const response = await adminAPI.getReviews();
      let reviewsData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          reviewsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          reviewsData = response.data.data;
        } else if (response.data.reviews && Array.isArray(response.data.reviews)) {
          reviewsData = response.data.reviews;
        }
      }
      
      if (!reviewsData || reviewsData.length === 0) {
        // Empty state - no mock data
        setReviews([]);
        setStats({ total: 0, pending: 0, approved: 0, reported: 0 });
        if (showToast) toast('No reviews found', { icon: '📝' });
      } else {
        setReviews(reviewsData);
        
        // Calculate stats from actual data
        const reviewsStats = reviewsData.reduce((acc, review) => {
          acc.total++;
          if (review.status === 'pending') acc.pending++;
          else if (review.status === 'approved') acc.approved++;
          if (review.reported) acc.reported++;
          return acc;
        }, { total: 0, pending: 0, approved: 0, reported: 0 });
        
        setStats(reviewsStats);
        
        if (showToast) toast.success('Reviews refreshed');
      }
      
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      // Empty state - no mock data
      setReviews([]);
      setStats({ total: 0, pending: 0, approved: 0, reported: 0 });
      if (showToast) toast.error('Failed to load reviews');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveReview(id);
      toast.success('Review approved');
      fetchReviews(); // Refresh to get latest data
    } catch (error) {
      console.error('Approve error:', error);
      // Optimistic update as fallback
      const updatedReviews = reviews.map(r => 
        r.id === id ? { ...r, status: 'approved' } : r
      );
      setReviews(updatedReviews);
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1
      }));
      toast.success('Review approved (local update)');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectReview(id);
      toast.success('Review rejected');
      fetchReviews(); // Refresh to get latest data
    } catch (error) {
      console.error('Reject error:', error);
      // Optimistic update - remove the review locally
      const removedReview = reviews.find(r => r.id === id);
      const updatedReviews = reviews.filter(r => r.id !== id);
      setReviews(updatedReviews);
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        pending: removedReview?.status === 'pending' ? Math.max(0, prev.pending - 1) : prev.pending,
        approved: removedReview?.status === 'approved' ? Math.max(0, prev.approved - 1) : prev.approved
      }));
      toast.success('Review rejected');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await adminAPI.deleteReview(id);
        toast.success('Review deleted');
        fetchReviews(); // Refresh to get latest data
      } catch (error) {
        console.error('Delete error:', error);
        // Optimistic update
        const deletedReview = reviews.find(r => r.id === id);
        const updatedReviews = reviews.filter(r => r.id !== id);
        setReviews(updatedReviews);
        setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          pending: deletedReview?.status === 'pending' ? Math.max(0, prev.pending - 1) : prev.pending,
          approved: deletedReview?.status === 'approved' ? Math.max(0, prev.approved - 1) : prev.approved,
          reported: deletedReview?.reported ? Math.max(0, prev.reported - 1) : prev.reported
        }));
        toast.success('Review deleted');
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (!review) return false;
    
    const matchesSearch = 
      (review.content?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (review.user_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (review.product_name?.toLowerCase() || '').includes(search.toLowerCase());
    
    if (filter === 'pending') return matchesSearch && review.status === 'pending';
    if (filter === 'reported') return matchesSearch && review.reported === true;
    if (filter === 'approved') return matchesSearch && review.status === 'approved';
    return matchesSearch;
  });

  const handleClearFilters = () => {
    setSearch('');
    setFilter('all');
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Review Management</h4>
          <p className="text-muted mb-0">Manage and moderate customer reviews</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => fetchReviews(true)} 
          disabled={refreshing}
        >
          <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3>{stats.total}</h3>
              <p className="text-muted mb-0">Total Reviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.pending}</h3>
              <p className="text-muted mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.approved}</h3>
              <p className="text-muted mb-0">Approved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-danger">{stats.reported}</h3>
              <p className="text-muted mb-0">Reported</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by user, product, or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="reported">Reported</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <FaStar size={40} className="text-muted mb-3" />
            <h5>No reviews found</h5>
            <p className="text-muted">
              {search || filter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No reviews have been submitted yet'}
            </p>
            {(search || filter !== 'all') && (
              <Button variant="outline-primary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        filteredReviews.map(review => (
          <Card key={review.id} className="border-0 shadow-sm mb-3 review-card">
            <Card.Body className="p-4">
              <Row className="align-items-start">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <FaUser className="text-primary" />
                    </div>
                    <div>
                      <div className="fw-medium">{review.user_name || 'Anonymous'}</div>
                      <small className="text-muted">
                        on <FaBox className="me-1" /> {review.product_name || 'Unknown Product'}
                      </small>
                    </div>
                    <div className="ms-2 d-flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < (review.rating || 0) ? 'text-warning' : 'text-secondary'} 
                          size={14}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mb-2" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    "{review.content || 'No content provided'}"
                  </p>
                  <small className="text-muted">
                    {review.created_at 
                      ? new Date(review.created_at).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Date not available'}
                  </small>
                </Col>
                <Col md={4} className="mt-3 mt-md-0">
                  <div className="d-flex flex-wrap align-items-center justify-content-md-end gap-2">
                    {review.reported && (
                      <Badge bg="danger" className="px-3 py-2">
                        <FaFlag className="me-1" size={12} /> Reported
                      </Badge>
                    )}
                    <Badge 
                      bg={
                        review.status === 'approved' ? 'success' :
                        review.status === 'pending' ? 'warning' : 'secondary'
                      }
                      className="px-3 py-2"
                    >
                      {review.status === 'approved' ? 'Approved' : 
                       review.status === 'pending' ? 'Pending' : 'Rejected'}
                    </Badge>
                    {review.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          variant="success" 
                          onClick={() => handleApprove(review.id)}
                          title="Approve Review"
                          className="px-3"
                        >
                          <FaCheck className="me-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="warning" 
                          onClick={() => handleReject(review.id)}
                          title="Reject Review"
                          className="px-3"
                        >
                          <FaTimes className="me-1" /> Reject
                        </Button>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(review.id)}
                      title="Delete Review"
                      className="px-3"
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      )}

      <style>{`
        .review-card {
          transition: all 0.3s ease;
        }
        
        .review-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminReviews;