// frontend/src/pages/AdminReviews.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Row, Col, Card, Button, Badge, Form, InputGroup, Alert,
} from 'react-bootstrap';
import {
  FaStar, FaTrash, FaCheck, FaTimes, FaSearch,
  FaUser, FaBox, FaSync, FaExclamationTriangle,
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | approved | rejected | featured
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const token = localStorage.getItem('token');
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const stats = useMemo(() => ({
    total:    reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    featured: reviews.filter(r => r.is_featured).length,
  }), [reviews]);

  const fetchReviews = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/reviews/admin/all`, authHeaders);
      const data = res.data?.data ?? res.data ?? [];
      setReviews(Array.isArray(data) ? data : []);
      if (showToast) toast.success('Reviews refreshed');
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews. Please try again later.');
      setReviews([]);
      if (showToast) toast.error('Failed to load reviews');
    } finally {
      setRefreshing(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await axios.patch(
        `${API_BASE_URL}/reviews/admin/${id}/status`,
        { status },
        authHeaders
      );
      toast.success(`Review ${status}`);
      await fetchReviews();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (review) => {
    setBusyId(review.id);
    try {
      await axios.patch(
        `${API_BASE_URL}/reviews/admin/${review.id}/feature`,
        { is_featured: !review.is_featured, featured_order: review.featured_order ?? 0 },
        authHeaders
      );
      toast.success(
        review.is_featured ? 'Removed from landing page' : 'Featured on landing page'
      );
      await fetchReviews();
    } catch (err) {
      console.error('Feature toggle error:', err);
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await axios.delete(`${API_BASE_URL}/reviews/admin/${id}`, authHeaders);
      toast.success('Review deleted');
      await fetchReviews();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setBusyId(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (!review) return false;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (review.comment      || '').toLowerCase().includes(q) ||
      (review.user_name    || '').toLowerCase().includes(q) ||
      (review.product_name || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === 'all')      return true;
    if (filter === 'featured') return !!review.is_featured;
    return review.status === filter;
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
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3>{stats.total}</h3>
              <p className="text-muted mb-0">Total Reviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.pending}</h3>
              <p className="text-muted mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.approved}</h3>
              <p className="text-muted mb-0">Approved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="text-primary">{stats.featured}</h3>
              <p className="text-muted mb-0">Featured</p>
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
                  placeholder="Search by user, product, or comment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Reviews ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="approved">Approved ({stats.approved})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
                <option value="featured">Featured ({stats.featured})</option>
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
        filteredReviews.map((review) => {
          const busy = busyId === review.id;
          const statusBg =
            review.status === 'approved' ? 'success' :
            review.status === 'pending'  ? 'warning' :
            review.status === 'rejected' ? 'danger'  : 'secondary';

          return (
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
                          on <FaBox className="me-1" />{' '}
                          {review.product_name || 'Unknown Product'}
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
                      "{review.comment || 'No comment provided'}"
                    </p>
                    <small className="text-muted">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Date not available'}
                    </small>
                  </Col>

                  <Col md={4} className="mt-3 mt-md-0">
                    <div className="d-flex flex-column align-items-md-end gap-2">
                      <div className="d-flex flex-wrap gap-2">
                        {review.is_featured && (
                          <Badge bg="primary" className="px-3 py-2">
                            <FaStar className="me-1" size={12} /> Featured
                          </Badge>
                        )}
                        <Badge bg={statusBg} className="px-3 py-2">
                          {review.status
                            ? review.status.charAt(0).toUpperCase() + review.status.slice(1)
                            : 'Unknown'}
                        </Badge>
                      </div>

                      <div className="text-md-end">
                        <Form.Check
                          type="switch"
                          id={`feature-${review.id}`}
                          label="Show on landing page"
                          checked={!!review.is_featured}
                          disabled={busy || review.status !== 'approved'}
                          onChange={() => toggleFeatured(review)}
                        />
                        {review.status !== 'approved' && (
                          <small className="text-muted d-block">
                            Approve first to feature
                          </small>
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                        {review.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={busy}
                            onClick={() => updateStatus(review.id, 'approved')}
                          >
                            <FaCheck className="me-1" /> Approve
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="warning"
                            disabled={busy}
                            onClick={() => updateStatus(review.id, 'rejected')}
                          >
                            <FaTimes className="me-1" /> Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy}
                          onClick={() => handleDelete(review.id)}
                        >
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })
      )}

      <style>{`
        .review-card { transition: all 0.3s ease; }
        .review-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminReviews;