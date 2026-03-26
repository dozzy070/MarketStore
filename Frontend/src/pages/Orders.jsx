import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { FaEye, FaCheck, FaTruck, FaBox, FaCalendar, FaUser, FaMapMarker, FaPhone, FaFilter, FaSync } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { TableRowSkeleton, OrderCardSkeleton } from '../components/SkeletonLoader';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Orders</h4>
          <p className="text-muted mb-0">{loading ? 'Loading...' : `${filteredOrders.length} orders`}</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select 
            size="sm" 
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </Form.Select>
          <Button variant="outline-primary" size="sm" onClick={fetchOrders}>
            <FaSync /> Refresh
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">No orders found</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>₦{order.total?.toLocaleString()}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td><Button variant="link" className="p-0"><FaEye /></Button></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default Orders;