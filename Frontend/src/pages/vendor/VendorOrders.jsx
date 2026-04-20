import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Alert } from 'react-bootstrap';
import { 
  FaEye, 
  FaCheck, 
  FaTruck, 
  FaBox, 
  FaCalendar, 
  FaUser, 
  FaSearch,
  FaFilter,
  FaSync,
  FaPrint,
  FaDownload,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

function VendorOrders() {
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // track first fetch completion

  // Compute stats dynamically from orders
  const stats = useMemo(() => {
    const totals = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0
    };
    orders.forEach(order => {
      const status = order.status || 'pending';
      if (totals[status] !== undefined) totals[status]++;
      if (status === 'delivered') totals.revenue += parseFloat(order.total) || 0;
    });
    return totals;
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrdersList();
  }, [search, statusFilter, orders]);

  const fetchOrders = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('Fetching orders...');
      const response = await orderAPI.getOrders();
      console.log('Full response:', JSON.stringify(response, null, 2));
      
      let ordersData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else {
          console.log('Available keys:', Object.keys(response.data));
        }
      }
      
      console.log('Final orders data:', ordersData);
      setOrders(ordersData);
      setHasLoaded(true);
      
      if (showToast) {
        if (ordersData.length === 0) {
          toast('No orders found', { icon: '📦' });
        } else {
          toast.success('Orders refreshed');
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Unable to load orders. Please try again later.');
      if (showToast) toast.error('Failed to load orders');
      setHasLoaded(true);
    } finally {
      if (showToast) setRefreshing(false);
    }
  };

  const filterOrdersList = () => {
    let filtered = [...orders];

    if (search) {
      filtered = filtered.filter(order =>
        (order?.id?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (order?.customer_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (order?.user?.name?.toLowerCase() || '').includes(search.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order?.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await orderAPI.updateStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      
      const updatedOrders = orders.map(order => 
        order?.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status || 'unknown'}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Orders</h4>
          <p className="text-muted mb-0">Manage and process customer orders</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => window.print()}>
            <FaPrint className="me-2" /> Print
          </Button>
          <Button variant="outline-success">
            <FaDownload className="me-2" /> Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3" size={24} />
            <div>
              <strong>Error loading orders</strong>
              <p className="mb-0">{error}</p>
            </div>
          </div>
          <Button variant="outline-danger" size="sm" onClick={fetchOrders} className="mt-2">
            <FaSync className="me-2" /> Retry
          </Button>
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FaBox className="text-primary" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Orders</h6>
                  <h3 className="mb-0">{stats.total}</h3>
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
                  <FaBox className="text-warning" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Pending</h6>
                  <h3 className="mb-0">{stats.pending}</h3>
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
                  <FaCheck className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Delivered</h6>
                  <h3 className="mb-0">{stats.delivered}</h3>
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
                  <FaBox className="text-info" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Revenue</h6>
                  <h3 className="mb-0">₦{stats.revenue.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <div className="position-relative">
                <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="primary" 
                onClick={() => fetchOrders(true)} 
                disabled={refreshing}
                className="d-flex align-items-center gap-2"
              >
                <FaSync />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
               </tr>
            </thead>
            <tbody>
              {hasLoaded && filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id?.slice(0, 8) || 'N/A'}</td>
                    <td>{order.customer_name || order.user?.name || 'Guest'}</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₦{parseFloat(order.total || 0).toLocaleString()}</td>
                    <td>
                      <Form.Select 
                        size="sm"
                        value={order.status || 'pending'}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        style={{ width: '130px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="p-0 me-2"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?.id?.slice(0, 8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Customer Information</h6>
                  <p><strong>Name:</strong> {selectedOrder.customer_name || selectedOrder.user?.name || 'Guest'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                </Col>
                <Col md={6}>
                  <h6>Shipping Address</h6>
                  <p>{selectedOrder.shipping_address || 'No address provided'}</p>
                </Col>
              </Row>

              <h6 className="mb-3">Order Items</h6>
              <Table size="sm" className="mb-4">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                   </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>₦{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>₦{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td><strong>₦{parseFloat(selectedOrder.total || 0).toLocaleString()}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default VendorOrders;
