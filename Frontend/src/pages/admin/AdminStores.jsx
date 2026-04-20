import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { 
  FaStore, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaCalendar,
  FaUser,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStores = [
        {
          id: 1,
          store_name: "Tech Haven",
          owner_name: "John Doe",
          email: "john@techhaven.com",
          phone: "+234 801 234 5678",
          location: "Lagos, Nigeria",
          applied_date: "2024-02-15T10:30:00Z",
          status: "pending",
          products: 0,
          documents_verified: false,
          priority: "high"
        },
        {
          id: 2,
          store_name: "Fashion Forward",
          owner_name: "Jane Smith",
          email: "jane@fashionforward.com",
          phone: "+234 802 345 6789",
          location: "Abuja, Nigeria",
          applied_date: "2024-02-10T14:20:00Z",
          status: "approved",
          products: 45,
          documents_verified: true,
          priority: "normal"
        },
        {
          id: 3,
          store_name: "Home Essentials",
          owner_name: "Bob Johnson",
          email: "bob@homeessentials.com",
          phone: "+234 803 456 7890",
          location: "Port Harcourt, Nigeria",
          applied_date: "2024-02-05T09:15:00Z",
          status: "pending",
          products: 0,
          documents_verified: false,
          priority: "normal"
        },
        {
          id: 4,
          store_name: "Sports World",
          owner_name: "Alice Brown",
          email: "alice@Sportsworld.com",
          phone: "+234 804 567 8901",
          location: "Ibadan, Nigeria",
          applied_date: "2024-01-28T16:45:00Z",
          status: "rejected",
          products: 0,
          documents_verified: false,
          priority: "low"
        },
        {
          id: 5,
          store_name: "Book Nook",
          owner_name: "Charlie Wilson",
          email: "charlie@booknook.com",
          phone: "+234 805 678 9012",
          location: "Kano, Nigeria",
          applied_date: "2024-01-20T11:30:00Z",
          status: "approved",
          products: 128,
          documents_verified: true,
          priority: "normal"
        }
      ];

      setStores(mockStores);
      
      const stats = mockStores.reduce((acc, store) => {
        acc.total++;
        acc[store.status]++;
        return acc;
      }, { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 });

      setStats(stats);
    } catch (error) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.store_name.toLowerCase().includes(search.toLowerCase()) ||
      store.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      store.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      suspended: 'secondary'
    };
    return <Badge bg={colors[status]}>{status}</Badge>;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <FaExclamationTriangle className="text-danger" />;
    if (priority === 'normal') return <FaClock className="text-info" />;
    return null;
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Store Management</h4>
          <p className="text-muted mb-0">Manage and approve vendor stores</p>
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

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FaStore className="text-primary" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Stores</h6>
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
                  <FaClock className="text-warning" />
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
                  <FaCheckCircle className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Approved</h6>
                  <h3 className="mb-0">{stats.approved}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                  <FaTimes className="text-danger" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Rejected</h6>
                  <h3 className="mb-0">{stats.rejected}</h3>
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
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search stores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Stores</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stores Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Store</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Applied</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(store => (
                <tr key={store.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {getPriorityIcon(store.priority)}
                      <span className="ms-2 fw-medium">{store.store_name}</span>
                    </div>
                  </td>
                  <td>{store.owner_name}</td>
                  <td>
                    <div>{store.email}</div>
                    <small className="text-muted">{store.phone}</small>
                  </td>
                  <td>{store.location}</td>
                  <td>
                    <FaCalendar className="text-muted me-1" size={10} />
                    {new Date(store.applied_date).toLocaleDateString()}
                  </td>
                  <td>
                    <Badge bg="light" text="dark">{store.products}</Badge>
                  </td>
                  <td>{getStatusBadge(store.status)}</td>
                  <td>
                    <Link to={`/admin/stores/${store.id}`}>
                      <Button size="sm" variant="link" className="p-0 me-2">
                        <FaEye /> View
                      </Button>
                    </Link>
                    {store.status === 'pending' && (
                      <Link to={`/admin/stores/${store.id}/approve`}>
                        <Button size="sm" variant="link" className="p-0 text-success">
                          <FaCheck /> Review
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default AdminStores;
