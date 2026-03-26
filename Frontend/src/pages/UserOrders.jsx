// frontend/src/pages/UserOrders.jsx - Integrated Version (No Loading Spinners)
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Alert, Form, InputGroup } from 'react-bootstrap';
import { 
  FaBox, 
  FaEye, 
  FaStar, 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaDownload,
  FaSync,
  FaSearch,
  FaFilter,
  FaArrowRight,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaShoppingBag,
  FaPrint,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('📦 Fetching orders...');
      
      const response = await orderAPI.getOrders();
      let ordersData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
      }
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setStats({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, totalSpent: 0 });
        if (showToast) toast('No orders found', { icon: '📦' });
      } else {
        setOrders(ordersData);
        
        // Calculate stats
        const calculatedStats = ordersData.reduce((acc, order) => {
          acc.total++;
          if (order.status === 'pending') acc.pending++;
          else if (order.status === 'processing') acc.processing++;
          else if (order.status === 'shipped') acc.shipped++;
          else if (order.status === 'delivered') acc.delivered++;
          else if (order.status === 'cancelled') acc.cancelled++;
          if (order.status === 'delivered') {
            acc.totalSpent += parseFloat(order.total || 0);
          }
          return acc;
        }, { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, totalSpent: 0 });
        
        setStats(calculatedStats);
        
        if (showToast) toast.success('Orders refreshed');
      }
      
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again later.');
      if (showToast) toast.error('Failed to load orders');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { badge: 'warning', icon: FaClock, text: 'Pending', bgColor: '#fef3c7', textColor: '#d97706' },
      processing: { badge: 'info', icon: FaSync, text: 'Processing', bgColor: '#e0f2fe', textColor: '#0284c7' },
      shipped: { badge: 'primary', icon: FaTruck, text: 'Shipped', bgColor: '#dbeafe', textColor: '#2563eb' },
      delivered: { badge: 'success', icon: FaCheckCircle, text: 'Delivered', bgColor: '#d1fae5', textColor: '#059669' },
      cancelled: { badge: 'danger', icon: FaTimesCircle, text: 'Cancelled', bgColor: '#fee2e2', textColor: '#dc2626' }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return {
      ...config,
      badgeComponent: (
        <Badge bg={config.badge} className="d-inline-flex align-items-center gap-1 px-3 py-2">
          <Icon size={12} /> {config.text}
        </Badge>
      )
    };
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.items?.some(item => item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
                               item.name?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const orderDate = new Date(order.created_at || order.date);
    const matchesDate = (!dateRange.start || orderDate >= new Date(dateRange.start)) &&
                       (!dateRange.end || orderDate <= new Date(dateRange.end));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        // await orderAPI.cancelOrder(orderId);
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, status: 'cancelled' } : o
        ));
        toast.success('Order cancelled successfully');
        fetchOrders();
      } catch (error) {
        console.error('Failed to cancel order:', error);
        toast.error('Failed to cancel order');
      }
    }
  };

  const handleExport = () => {
    const headers = ['Order ID', 'Date', 'Items', 'Total', 'Status', 'Payment Status'];
    const csvData = filteredOrders.map(order => [
      order.id,
      formatDate(order.created_at || order.date),
      order.items?.map(item => `${item.quantity}x ${item.product_name || item.name}`).join('; '),
      order.total,
      order.status,
      order.payment_status || 'Pending'
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported');
  };

  const handlePrint = () => {
    window.print();
  };

  const statCards = [
    { label: 'Total Orders', value: stats.total, icon: FaShoppingBag, color: '#4361ee', bg: 'primary' },
    { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: FaMoneyBillWave, color: '#10b981', bg: 'success' },
    { label: 'Active Orders', value: stats.processing + stats.shipped, icon: FaTruck, color: '#f59e0b', bg: 'warning' },
    { label: 'Delivered', value: stats.delivered, icon: FaCheckCircle, color: '#3b82f6', bg: 'info' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Orders</h1>
            <p style={styles.subtitle}>Track and manage your orders</p>
          </div>
          <div style={styles.headerActions}>
            <Button 
              variant="outline-secondary" 
              onClick={handlePrint}
              className="d-flex align-items-center gap-2"
            >
              <FaPrint /> Print
            </Button>
            <Button 
              variant="outline-success" 
              onClick={handleExport}
              className="d-flex align-items-center gap-2"
            >
              <FaDownload /> Export
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => fetchOrders(true)} 
              disabled={refreshing}
              className="d-flex align-items-center gap-2"
            >
              <FaSync className={refreshing ? 'spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" style={styles.errorAlert} onClose={() => setError(null)} dismissible>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                style={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div style={{ ...styles.statIcon, background: `${stat.color}20`, color: stat.color }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statValue}>{stat.value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={styles.filtersCard}>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by order ID or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                type="date"
                placeholder="From"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="date"
                placeholder="To"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </Col>
            <Col md={1}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="w-100"
              >
                Clear
              </Button>
            </Col>
          </Row>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <FaShoppingBag size={50} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No orders found</h3>
            <p style={styles.emptyText}>
              {search || statusFilter !== 'all' || dateRange.start || dateRange.end 
                ? 'Try adjusting your filters to see more results' 
                : 'You haven\'t placed any orders yet'}
            </p>
            {(search || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDateRange({ start: '', end: '' });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredOrders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card style={styles.orderCard}>
                  <Card.Body style={styles.orderCardBody}>
                    <Row className="align-items-center">
                      <Col lg={3} md={12} style={styles.orderInfoCol}>
                        <div style={styles.orderHeader}>
                          <div style={styles.orderIcon}>
                            <StatusIcon size={24} style={{ color: statusConfig.textColor }} />
                          </div>
                          <div>
                            <strong style={styles.orderId}>#{order.id?.slice(0, 12)}</strong>
                            <small style={styles.orderDate}>
                              <FaCalendarAlt style={{ marginRight: '4px' }} size={12} />
                              {formatDate(order.created_at || order.date)}
                            </small>
                          </div>
                        </div>
                      </Col>
                      <Col lg={4} md={7} style={styles.orderItemsCol}>
                        <div style={styles.orderItems}>
                          {(order.items || []).slice(0, 2).map((item, idx) => (
                            <div key={idx} style={styles.orderItem}>
                              <span style={styles.itemQuantity}>{item.quantity}x</span>
                              <span style={styles.itemName}>{item.product_name || item.name}</span>
                              <span style={styles.itemPrice}>{formatCurrency(item.price)}</span>
                            </div>
                          ))}
                          {(order.items || []).length > 2 && (
                            <div style={styles.moreItems}>
                              +{(order.items || []).length - 2} more items
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col lg={2} md={5} style={styles.orderTotalCol}>
                        <div>
                          <small style={styles.totalLabel}>Total Amount</small>
                          <strong style={styles.totalAmount}>{formatCurrency(order.total)}</strong>
                        </div>
                      </Col>
                      <Col lg={2} style={styles.orderStatusCol}>
                        <div>
                          {statusConfig.badgeComponent}
                          {order.tracking_number && (
                            <div style={styles.trackingInfo}>
                              <FaTruck size={10} style={{ marginRight: '4px' }} />
                              Tracking: {order.tracking_number}
                            </div>
                          )}
                          {order.estimated_delivery && order.status !== 'delivered' && (
                            <div style={styles.deliveryInfo}>
                              Est. delivery: {formatDate(order.estimated_delivery)}
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col lg={1} style={styles.orderActionsCol}>
                        <div style={styles.orderActions}>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            style={styles.viewButton}
                          >
                            <FaEye /> View
                          </Button>
                          {order.status === 'pending' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              style={styles.cancelButton}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>Order Information</h6>
                      <p className="mb-1"><strong>Order ID:</strong> {selectedOrder.id}</p>
                      <p className="mb-1"><strong>Date:</strong> {formatDate(selectedOrder.created_at || selectedOrder.date)}</p>
                      <p className="mb-0"><strong>Status:</strong> {getStatusConfig(selectedOrder.status).badgeComponent}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6>Payment Information</h6>
                      <p className="mb-1"><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                      <p className="mb-1"><strong>Payment Status:</strong> {selectedOrder.payment_status || 'Pending'}</p>
                      <p className="mb-0"><strong>Payment Method:</strong> {selectedOrder.payment_method || 'Not specified'}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="border-0 bg-light mb-4">
                <Card.Body>
                  <h6>Shipping Address</h6>
                  <p className="mb-0">
                    {selectedOrder.shipping_address || 'No address provided'}
                  </p>
                </Card.Body>
              </Card>

              <h6>Order Items</h6>
              <div className="table-responsive">
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                      </tr>
                    </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_name || item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                       </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                      <td><strong>{formatCurrency(selectedOrder.total)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            <FaDownload /> Download Invoice
          </Button>
        </Modal.Footer>
      </Modal>

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

// Styles object
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  subtitle: {
    color: '#6b7280',
    margin: 0
  },
  errorAlert: {
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937'
  },
  filtersCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  orderCard: {
    border: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '16px',
    transition: 'all 0.3s ease'
  },
  orderCardBody: {
    padding: '20px'
  },
  orderInfoCol: {
    marginBottom: '12px'
  },
  orderHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  orderIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '40px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orderId: {
    fontSize: '14px',
    fontWeight: '600',
    display: 'block'
  },
  orderDate: {
    color: '#6b7280',
    fontSize: '12px',
    display: 'block'
  },
  orderItemsCol: {
    marginBottom: '12px'
  },
  orderItems: {
    maxHeight: '80px',
    overflowY: 'auto'
  },
  orderItem: {
    fontSize: '13px',
    marginBottom: '4px'
  },
  itemQuantity: {
    fontWeight: '500',
    color: '#667eea',
    marginRight: '8px'
  },
  itemName: {
    color: '#374151'
  },
  itemPrice: {
    float: 'right',
    color: '#6b7280'
  },
  moreItems: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  orderTotalCol: {
    marginBottom: '12px'
  },
  totalLabel: {
    fontSize: '12px',
    color: '#6b7280',
    display: 'block'
  },
  totalAmount: {
    fontSize: '18px',
    color: '#667eea'
  },
  orderStatusCol: {
    marginBottom: '12px'
  },
  trackingInfo: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px'
  },
  deliveryInfo: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px'
  },
  orderActionsCol: {
    textAlign: 'right'
  },
  orderActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  viewButton: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  cancelButton: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    color: '#d1d5db',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '18px',
    marginBottom: '8px'
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: '16px'
  }
};

export default UserOrders;