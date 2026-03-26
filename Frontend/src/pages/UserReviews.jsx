// frontend/src/pages/UserReviews.jsx - Completely Fixed with Real API Integration

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { 
  FaStar, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaCamera,
  FaPlus,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaShoppingBag,
  FaSpinner
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { reviewAPI, orderAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Custom Rating Component
const Rating = ({ value, onChange, readonly = false, size = 24 }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          <FaStar
            className={
              star <= (hoverValue || safeValue) 
                ? 'text-warning' 
                : 'text-secondary'
            }
            size={size}
          />
        </span>
      ))}
    </div>
  );
};

function UserReviews() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: '',
    images: []
  });

  const [addForm, setAddForm] = useState({
    productId: '',
    productName: '',
    productImage: '',
    rating: 5,
    comment: '',
    images: []
  });

  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
    withPhotos: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('📊 Fetching user reviews...');
      
      const response = await reviewAPI.getReviews({ user_id: user?.id });
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
        setReviews([]);
        calculateStats([]);
        if (showToast) toast('No reviews found', { icon: '📝' });
      } else {
        setReviews(reviewsData);
        calculateStats(reviewsData);
        if (showToast) toast.success('Reviews refreshed');
      }
      
      // After fetching reviews, fetch purchasable products
      await fetchPurchasableProducts(reviewsData);
      
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      if (showToast) toast.error('Failed to load reviews');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchPurchasableProducts = async (existingReviews = null) => {
    setLoadingProducts(true);
    try {
      const currentReviews = existingReviews || reviews;
      const reviewedProductIds = currentReviews.map(r => r.product_id);
      
      console.log('Fetching orders for user:', user?.id);
      
      // Fetch user's orders
      const ordersResponse = await orderAPI.getOrders();
      let ordersData = [];
      
      if (ordersResponse.data) {
        if (Array.isArray(ordersResponse.data)) {
          ordersData = ordersResponse.data;
        } else if (ordersResponse.data.data && Array.isArray(ordersResponse.data.data)) {
          ordersData = ordersResponse.data.data;
        } else if (ordersResponse.data.orders && Array.isArray(ordersResponse.data.orders)) {
          ordersData = ordersResponse.data.orders;
        }
      }
      
      console.log('Orders found:', ordersData.length);
      
      // If no orders, try user orders endpoint
      if (ordersData.length === 0) {
        const userOrdersResponse = await orderAPI.getUserOrders?.();
        if (userOrdersResponse?.data) {
          ordersData = Array.isArray(userOrdersResponse.data) ? userOrdersResponse.data : 
                       (userOrdersResponse.data.orders || []);
        }
      }
      
      // Extract unique products from orders that are delivered
      const purchasedProductMap = new Map();
      
      ordersData.forEach(order => {
        // Check if order is delivered/completed
        const isDelivered = order.status === 'delivered' || 
                           order.status === 'completed' || 
                           order.payment_status === 'completed';
        
        if (isDelivered) {
          // Get items from order
          const items = order.items || order.order_items || [];
          items.forEach(item => {
            const productId = item.product_id || item.id;
            if (productId && !reviewedProductIds.includes(productId)) {
              purchasedProductMap.set(productId, {
                id: productId,
                name: item.product_name || item.name,
                image: item.image_url || item.product_image || 'https://via.placeholder.com/80'
              });
            }
          });
        }
      });
      
      const products = Array.from(purchasedProductMap.values());
      console.log('Products available for review:', products.length);
      setPurchasedProducts(products);
      
    } catch (error) {
      console.error('Failed to load purchased products:', error);
      // For demo purposes, add some mock products if API fails
      if (process.env.NODE_ENV === 'development') {
        setPurchasedProducts([
          { id: 999, name: 'Sample Product 1', image: 'https://via.placeholder.com/80' },
          { id: 998, name: 'Sample Product 2', image: 'https://via.placeholder.com/80' }
        ]);
      } else {
        setPurchasedProducts([]);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateStats = (reviewData) => {
    const calculatedStats = reviewData.reduce((acc, review) => {
      const rating = review.rating || 0;
      acc.total++;
      if (rating === 5) acc.fiveStar++;
      else if (rating === 4) acc.fourStar++;
      else if (rating === 3) acc.threeStar++;
      else if (rating === 2) acc.twoStar++;
      else if (rating === 1) acc.oneStar++;
      acc.totalRating += rating;
      if (review.images?.length > 0) acc.withPhotos++;
      return acc;
    }, {
      total: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
      withPhotos: 0,
      totalRating: 0
    });

    const average = calculatedStats.total > 0 
      ? (calculatedStats.totalRating / calculatedStats.total).toFixed(1) 
      : '0.0';

    setStats({
      total: calculatedStats.total || 0,
      average: parseFloat(average) || 0,
      fiveStar: calculatedStats.fiveStar || 0,
      fourStar: calculatedStats.fourStar || 0,
      threeStar: calculatedStats.threeStar || 0,
      twoStar: calculatedStats.twoStar || 0,
      oneStar: calculatedStats.oneStar || 0,
      withPhotos: calculatedStats.withPhotos || 0
    });
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setEditForm({
      rating: review.rating || 5,
      comment: review.comment || '',
      images: review.images || []
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await reviewAPI.deleteReview(selectedReview.id);
      const updatedReviews = reviews.filter(r => r.id !== selectedReview.id);
      setReviews(updatedReviews);
      calculateStats(updatedReviews);
      toast.success('Review deleted successfully');
      setShowDeleteModal(false);
      // Refresh purchasable products
      await fetchPurchasableProducts(updatedReviews);
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    } finally {
      setDeleteLoading(false);
      setSelectedReview(null);
    }
  };

  const handleUpdateReview = async () => {
    if (!editForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    try {
      await reviewAPI.updateReview(selectedReview.id, editForm);
      const updatedReviews = reviews.map(r => 
        r.id === selectedReview.id 
          ? { 
              ...r, 
              rating: editForm.rating, 
              comment: editForm.comment,
              images: editForm.images,
              updated_at: new Date().toISOString()
            }
          : r
      );
      setReviews(updatedReviews);
      calculateStats(updatedReviews);
      toast.success('Review updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleAddReview = async () => {
    if (!addForm.productId) {
      toast.error('Please select a product');
      return;
    }

    if (!addForm.comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    
    try {
      const reviewData = {
        product_id: parseInt(addForm.productId),
        rating: addForm.rating,
        comment: addForm.comment,
        images: addForm.images || []
      };
      
      const response = await reviewAPI.createReview(reviewData);
      
      if (response.data && (response.data.success || response.data.id)) {
        const newReview = response.data.data || response.data;
        setReviews([newReview, ...reviews]);
        calculateStats([newReview, ...reviews]);
        await fetchPurchasableProducts([newReview, ...reviews]);
        toast.success('Review submitted successfully!');
        setShowAddModal(false);
        setAddForm({ productId: '', productName: '', productImage: '', rating: 5, comment: '', images: [] });
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Failed to add review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const selectedProduct = purchasedProducts.find(p => p.id.toString() === productId);
    setAddForm({
      ...addForm,
      productId: productId,
      productName: selectedProduct?.name || '',
      productImage: selectedProduct?.image || ''
    });
  };

  const handleImageUpload = (e, form, setForm) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setForm({
      ...form,
      images: [...(form.images || []), ...newImages]
    });
  };

  const removeImage = (index, form, setForm) => {
    const currentImages = form.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages });
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const reviewDate = new Date(date);
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getStatusBadge = (status) => {
    const configs = {
      approved: { bg: 'success', icon: FaCheckCircle, text: 'Approved' },
      pending: { bg: 'warning', icon: FaClock, text: 'Pending Review' },
      rejected: { bg: 'danger', icon: FaTimesCircle, text: 'Rejected' }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge bg={config.bg} className="d-inline-flex align-items-center gap-1 px-3 py-2">
        <Icon size={12} /> {config.text}
      </Badge>
    );
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    if (filter === 'with-photos') {
      filtered = filtered.filter(review => review.images?.length > 0);
    } else if (filter === 'highest') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filter === 'lowest') {
      filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else {
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    
    return filtered;
  };

  const filteredReviews = getFilteredReviews();
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const getPercentage = (count) => {
    const total = formatNumber(stats.total);
    if (total === 0) return 0;
    return (formatNumber(count) / total) * 100;
  };

  const hasProductsToReview = purchasedProducts.length > 0;

  return (
    <DashboardLayout>
      <div className="user-reviews-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">My Reviews</h4>
            <p className="text-muted mb-0">Manage your product reviews and ratings</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={() => fetchReviews(true)} 
              disabled={refreshing}
            >
              <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowAddModal(true)}
              disabled={!hasProductsToReview || loadingProducts}
            >
              <FaPlus className="me-2" /> Write a Review
              {hasProductsToReview && purchasedProducts.length > 0 && (
                <Badge bg="light" text="dark" className="ms-2">
                  {purchasedProducts.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Loading Products Indicator */}
        {loadingProducts && (
          <Alert variant="info" className="mb-4">
            <FaSpinner className="spin me-2" />
            Loading products available for review...
          </Alert>
        )}

        {/* No Products to Review Alert */}
        {!hasProductsToReview && !loadingProducts && reviews.length > 0 && (
          <Alert variant="info" className="mb-4">
            <FaShoppingBag className="me-2" />
            You've reviewed all your purchased products! Shop more to write new reviews.
          </Alert>
        )}

        {/* Error Alert */}
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
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FaStar className="text-primary" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Reviews</h6>
                    <h3 className="mb-0">{formatNumber(stats.total)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <FaStar className="text-warning" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Average Rating</h6>
                    <h3 className="mb-0">{formatNumber(stats.average).toFixed(1)} ★</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FaCheckCircle className="text-success" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">5-Star Reviews</h6>
                    <h3 className="mb-0">{formatNumber(stats.fiveStar)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                    <FaCamera className="text-info" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">With Photos</h6>
                    <h3 className="mb-0">{formatNumber(stats.withPhotos)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Rating Distribution */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h6 className="mb-3">Rating Distribution</h6>
            {[5, 4, 3, 2, 1].map(star => {
              const count = star === 5 ? stats.fiveStar : 
                           star === 4 ? stats.fourStar :
                           star === 3 ? stats.threeStar :
                           star === 2 ? stats.twoStar : stats.oneStar;
              const percentage = getPercentage(count);
              
              return (
                <div key={star} className="d-flex align-items-center mb-2">
                  <span className="me-2" style={{ width: '40px' }}>{star} ★</span>
                  <div className="flex-grow-1 me-2">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-muted">{formatNumber(count)}</span>
                </div>
              );
            })}
          </Card.Body>
        </Card>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All Reviews</option>
                  <option value="with-photos">With Photos</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <FaStar size={50} className="text-muted mb-3" />
              <h5>No reviews yet</h5>
              <p className="text-muted mb-4">You haven't reviewed any products yet</p>
              {hasProductsToReview ? (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  Write Your First Review
                </Button>
              ) : (
                <Button variant="primary" as="a" href="/products">
                  Shop Now
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredReviews.map((review, index) => (
              <Col key={review.id} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm h-100 review-card">
                    <Card.Body>
                      <Row>
                        <Col xs={3}>
                          <img 
                            src={review.product_image || review.productImage || 'https://via.placeholder.com/80'} 
                            alt={review.product_name}
                            className="img-fluid rounded"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                            }}
                          />
                        </Col>
                        <Col xs={9}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{review.product_name}</h6>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Rating value={review.rating || 0} readonly={true} size={16} />
                                <small className="text-muted">
                                  <FaClock className="me-1" size={12} />
                                  {getTimeAgo(review.created_at)}
                                </small>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => handleEdit(review)}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>
                          <p className="mb-2">{review.comment}</p>
                          
                          {review.images?.length > 0 && (
                            <div className="mt-2">
                              <div className="d-flex gap-2">
                                {review.images.slice(0, 3).map((img, i) => (
                                  <img 
                                    key={i} 
                                    src={img} 
                                    alt={`review-${i}`}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                    onClick={() => {
                                      setSelectedImages(review.images);
                                      setShowImageModal(true);
                                    }}
                                  />
                                ))}
                                {review.images.length > 3 && (
                                  <div 
                                    className="bg-light d-flex align-items-center justify-content-center rounded"
                                    style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                                    onClick={() => {
                                      setSelectedImages(review.images);
                                      setShowImageModal(true);
                                    }}
                                  >
                                    <span className="fw-bold">+{review.images.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-2">
                            {getStatusBadge(review.status || 'pending')}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}

        {/* Add Review Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Write a Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select Product</Form.Label>
                <Form.Select
                  value={addForm.productId}
                  onChange={handleProductSelect}
                >
                  <option value="">Choose a product to review...</option>
                  {purchasedProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Form.Select>
                {purchasedProducts.length === 0 && !loadingProducts && (
                  <Form.Text className="text-warning d-block mt-2">
                    You have no products to review. Purchase and receive delivered orders to write reviews.
                  </Form.Text>
                )}
              </Form.Group>

              {addForm.productId && (
                <>
                  <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                    <img 
                      src={addForm.productImage || 'https://via.placeholder.com/60'} 
                      alt={addForm.productName}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                      }}
                    />
                    <div className="ms-3">
                      <h6 className="mb-0">{addForm.productName}</h6>
                      <small className="text-muted">Selected Product</small>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <Rating 
                      value={addForm.rating || 5} 
                      onChange={(value) => setAddForm({...addForm, rating: value})}
                      size={30}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Your Review</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={addForm.comment}
                      onChange={(e) => setAddForm({...addForm, comment: e.target.value})}
                      placeholder="Share your experience with this product... What did you like or dislike?"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Add Photos (Optional)</Form.Label>
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      {(addForm.images || []).map((img, index) => (
                        <div key={index} className="position-relative">
                          <img 
                            src={img} 
                            alt={`upload-${index}`}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 rounded-circle p-0"
                            style={{ width: '20px', height: '20px' }}
                            onClick={() => removeImage(index, addForm, setAddForm)}
                          >
                            <FaTimes size={12} />
                          </Button>
                        </div>
                      ))}
                      {(addForm.images || []).length < 5 && (
                        <label className="border rounded d-flex align-items-center justify-content-center"
                               style={{ width: '80px', height: '80px', cursor: 'pointer' }}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(e, addForm, setAddForm)}
                            style={{ display: 'none' }}
                          />
                          <FaCamera className="text-muted" size={24} />
                        </label>
                      )}
                    </div>
                    <Form.Text className="text-muted">
                      You can upload up to 5 photos (max 2MB each)
                    </Form.Text>
                  </Form.Group>
                </>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddReview}
              disabled={!addForm.productId || !addForm.comment.trim() || submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="spin me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Review Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <Rating 
                  value={editForm.rating || 5} 
                  onChange={(value) => setEditForm({...editForm, rating: value})}
                  size={30}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editForm.comment}
                  onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Photos</Form.Label>
                <div className="d-flex gap-2 flex-wrap mb-2">
                  {(editForm.images || []).map((img, index) => (
                    <div key={index} className="position-relative">
                      <img 
                        src={img} 
                        alt={`edit-${index}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle p-0"
                        style={{ width: '20px', height: '20px' }}
                        onClick={() => removeImage(index, editForm, setEditForm)}
                      >
                        <FaTimes size={12} />
                      </Button>
                    </div>
                  ))}
                  {(editForm.images || []).length < 5 && (
                    <label className="border rounded d-flex align-items-center justify-content-center"
                           style={{ width: '80px', height: '80px', cursor: 'pointer' }}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, editForm, setEditForm)}
                        style={{ display: 'none' }}
                      />
                      <FaCamera className="text-muted" size={24} />
                    </label>
                  )}
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateReview}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Delete Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            {selectedReview && (
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                <img 
                  src={selectedReview.product_image || selectedReview.productImage || 'https://via.placeholder.com/50'} 
                  alt={selectedReview.product_name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div>
                  <h6 className="mb-1">{selectedReview.product_name}</h6>
                  <Rating value={selectedReview.rating || 0} readonly={true} size={14} />
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete Review'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Image Gallery Modal */}
        <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Review Photos</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              {selectedImages.map((img, index) => (
                <Col key={index} md={4}>
                  <img 
                    src={img} 
                    alt={`gallery-${index}`}
                    className="img-fluid rounded"
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                </Col>
              ))}
            </Row>
          </Modal.Body>
        </Modal>
      </div>

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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .progress {
          background-color: #e9ecef;
          border-radius: 4px;
        }
        
        .progress-bar {
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default UserReviews;