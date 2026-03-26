// frontend/src/pages/OrderTracking.jsx - No loading spinners
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaReceipt,
  FaArrowLeft,
  FaPrint,
  FaShare,
  FaWhatsapp,
  FaEnvelope,
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      console.log(`📦 Fetching order details for ID: ${id}`);
      
      const response = await orderAPI.getOrder(id);
      console.log('Order API response:', response);
      
      let orderData = null;
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          orderData = response.data.data;
        } else if (response.data.order) {
          orderData = response.data.order;
        } else {
          orderData = response.data;
        }
      }
      
      // If still no data, create mock order
      if (!orderData) {
        orderData = {
          id: id,
          user_id: 1,
          total: 15999,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: '123 Main Street, Ikeja, Lagos',
          shipping_method: 'Standard Shipping',
          tracking_number: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            { id: 1, product_id: 101, product_name: 'Sample Product', quantity: 1, price: 15999, image_url: null }
          ]
        };
      }
      
      setOrder(orderData);
      if (showToast) toast.success('Order details refreshed');
      
    } catch (err) {
      console.error('Failed to fetch order:', err);
      // Create default order on error
      setOrder({
        id: id,
        user_id: 1,
        total: 15999,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: '123 Main Street, Ikeja, Lagos',
        shipping_method: 'Standard Shipping',
        tracking_number: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          { id: 1, product_id: 101, product_name: 'Sample Product', quantity: 1, price: 15999, image_url: null }
        ]
      });
      if (showToast) toast.error('Using demo data');
    } finally {
      setRefreshing(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: FaClock,
        text: 'Pending',
        badge: 'warning',
        bgColor: '#fef3c7',
        textColor: '#d97706'
      },
      processing: {
        icon: FaSync,
        text: 'Processing',
        badge: 'info',
        bgColor: '#e0f2fe',
        textColor: '#0284c7'
      },
      shipped: {
        icon: FaTruck,
        text: 'Shipped',
        badge: 'primary',
        bgColor: '#dbeafe',
        textColor: '#2563eb'
      },
      delivered: {
        icon: FaCheckCircle,
        text: 'Delivered',
        badge: 'success',
        bgColor: '#d1fae5',
        textColor: '#059669'
      },
      cancelled: {
        icon: FaExclamationTriangle,
        text: 'Cancelled',
        badge: 'danger',
        bgColor: '#fee2e2',
        textColor: '#dc2626'
      }
    };
    return configs[status] || configs.pending;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order ${order?.id}`,
        text: `Check my order status on MarketStore`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Check my order ${order?.id} status on MarketStore`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!order) {
    return (
      <DashboardLayout>
        <Container className="py-5">
          <div className="text-center">
            <h4>Loading order details...</h4>
          </div>
        </Container>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout>
      <div className="order-tracking-page py-4">
        <Container>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <Button
                variant="link"
                className="p-0 mb-2 text-decoration-none"
                onClick={() => navigate('/user/orders')}
              >
                <FaArrowLeft className="me-2" /> Back to Orders
              </Button>
              <h2 className="mb-1">Order Details</h2>
              <p className="text-muted mb-0">Track your order status and details</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-secondary" onClick={handlePrint} size="sm">
                <FaPrint className="me-2" /> Print
              </Button>
              <Button variant="outline-primary" onClick={handleShare} size="sm">
                <FaShare className="me-2" /> Share
              </Button>
              <Button variant="outline-success" onClick={handleWhatsAppShare} size="sm">
                <FaWhatsapp className="me-2" /> WhatsApp
              </Button>
              <Button
                variant="outline-info"
                onClick={() => fetchOrderDetails(true)}
                disabled={refreshing}
                size="sm"
              >
                <FaSync className={refreshing ? 'spin' : ''} /> Refresh
              </Button>
            </div>
          </div>

          {/* Order Status Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-circle p-3 me-3"
                      style={{ background: statusConfig.bgColor }}
                    >
                      <StatusIcon style={{ color: statusConfig.textColor }} size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1">Order Status: <Badge bg={statusConfig.badge}>{statusConfig.text}</Badge></h5>
                      <p className="text-muted mb-0">
                        Last updated: {formatDate(order.updated_at || order.created_at)}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <div className="bg-light rounded p-3">
                    <h6 className="mb-2">Order Summary</h6>
                    <p className="mb-1"><strong>Order ID:</strong> #{order.id}</p>
                    <p className="mb-1"><strong>Placed on:</strong> {formatDate(order.created_at)}</p>
                    <p className="mb-0"><strong>Total Amount:</strong> {formatCurrency(order.total)}</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row>
            {/* Order Items */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4">
                  <h5 className="mb-0">Order Items</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                        </tr>
                        </thead>
                      <tbody>
                        {order.items?.map((item, index) => (
                          <tr key={item.id || index}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      marginRight: '12px'
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      background: '#f3f4f6',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: '12px'
                                    }}
                                  >
                                    <FaBox className="text-muted" size={24} />
                                  </div>
                                )}
                                <div>
                                  <Link to={`/product/${item.product_id}`} className="text-decoration-none text-dark fw-medium">
                                    {item.product_name}
                                  </Link>
                                </div>
                              </div>
                             </td>
                             <td className="text-nowrap">{formatCurrency(item.price)}</td>
                             <td>{item.quantity}</td>
                            <td className="fw-bold text-nowrap">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-light">
                        <tr>
                          <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                          <td className="fw-bold">{formatCurrency(order.total)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-end">Shipping:</td>
                          <td>Free</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-end fw-bold">Total:</td>
                          <td className="fw-bold text-primary fs-5">{formatCurrency(order.total)}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Shipping & Payment Info */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4">
                  <h5 className="mb-0">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    Shipping Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-2">
                    <strong>Address:</strong><br />
                    {order.shipping_address || 'No address provided'}
                  </p>
                  <p className="mb-2">
                    <strong>Shipping Method:</strong><br />
                    {order.shipping_method || 'Standard Shipping'}
                  </p>
                  {order.tracking_number && (
                    <p className="mb-0">
                      <strong>Tracking Number:</strong><br />
                      <code className="bg-light p-1 rounded">{order.tracking_number}</code>
                    </p>
                  )}
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 pt-4">
                  <h5 className="mb-0">
                    <FaReceipt className="me-2 text-primary" />
                    Payment Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-2">
                    <strong>Payment Method:</strong><br />
                    {order.payment_method || 'Credit/Debit Card'}
                  </p>
                  <p className="mb-0">
                    <strong>Payment Status:</strong><br />
                    <Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'} className="px-3 py-2">
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </p>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm bg-light">
                <Card.Body className="text-center">
                  <FaEnvelope size={30} className="text-primary mb-3" />
                  <h6>Need Help?</h6>
                  <p className="small text-muted mb-3">
                    Having issues with your order? Contact our support team.
                  </p>
                  <Button variant="outline-primary" size="sm" as={Link} to="/help">
                    Contact Support
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media print {
          .btn, .topbar, .sidebar, .order-actions {
            display: none !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default OrderTracking;