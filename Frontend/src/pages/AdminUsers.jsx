// frontend/src/pages/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, InputGroup, Alert } from 'react-bootstrap';
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaSearch,
  FaShieldAlt,
  FaStore,
  FaUserTag,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaSync,
  FaExclamationTriangle,
  FaEye
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import AdminCreateUser from './AdminCreateUser';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    vendors: 0,
    customers: 0,
    pending: 0
  });

  // Fetch all users from API
  const fetchUsers = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('📊 Fetching all users...');
      
      const response = await adminAPI.getUsers();
      let usersData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          usersData = response.data.users;
        }
      }
      
      if (!usersData || usersData.length === 0) {
        setUsers([]);
        setStats({ total: 0, admins: 0, vendors: 0, customers: 0, pending: 0 });
        if (showToast) toast('No users found', { icon: '👥' });
      } else {
        setUsers(usersData);
        
        // Calculate stats from actual data
        const calculatedStats = usersData.reduce((acc, user) => {
          acc.total++;
          if (user.role === 'admin') acc.admins++;
          else if (user.role === 'vendor') acc.vendors++;
          else acc.customers++;
          if (!user.verified) acc.pending++;
          return acc;
        }, { total: 0, admins: 0, vendors: 0, customers: 0, pending: 0 });
        
        setStats(calculatedStats);
        
        if (showToast) toast.success('Users refreshed');
      }
      
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again later.');
      setUsers([]);
      setStats({ total: 0, admins: 0, vendors: 0, customers: 0, pending: 0 });
      if (showToast) toast.error('Failed to load users');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      // Update stats
      const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      const updatedStats = updatedUsers.reduce((acc, user) => {
        acc.total++;
        if (user.role === 'admin') acc.admins++;
        else if (user.role === 'vendor') acc.vendors++;
        else acc.customers++;
        if (!user.verified) acc.pending++;
        return acc;
      }, { total: 0, admins: 0, vendors: 0, customers: 0, pending: 0 });
      setStats(updatedStats);
      
      // Trigger real-time update for sidebar
      window.dispatchEvent(new CustomEvent('pendingCountsUpdated'));
      
    } catch (error) {
      console.error('Role update error:', error);
      toast.error('Failed to update role');
    }
  };

  // Verify/Unverify user
  const handleVerifyUser = async (userId, verified) => {
    try {
      // You'll need to add this endpoint to your adminAPI
      await adminAPI.verifyUser?.(userId, verified) || Promise.resolve();
      toast.success(`User ${verified ? 'verified' : 'unverified'}`);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, verified } : u));
      
      // Update stats
      const updatedUsers = users.map(u => u.id === userId ? { ...u, verified } : u);
      const updatedStats = updatedUsers.reduce((acc, user) => {
        acc.total++;
        if (user.role === 'admin') acc.admins++;
        else if (user.role === 'vendor') acc.vendors++;
        else acc.customers++;
        if (!user.verified) acc.pending++;
        return acc;
      }, { total: 0, admins: 0, vendors: 0, customers: 0, pending: 0 });
      setStats(updatedStats);
      
      // Trigger real-time update for sidebar
      window.dispatchEvent(new CustomEvent('pendingCountsUpdated'));
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to update verification');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        
        // Update local state
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        
        // Update stats
        const updatedStats = updatedUsers.reduce((acc, user) => {
          acc.total++;
          if (user.role === 'admin') acc.admins++;
          else if (user.role === 'vendor') acc.vendors++;
          else acc.customers++;
          if (!user.verified) acc.pending++;
          return acc;
        }, { total: 0, admins: 0, vendors: 0, customers: 0, pending: 0 });
        setStats(updatedStats);
        
        // Trigger real-time update for sidebar
        window.dispatchEvent(new CustomEvent('pendingCountsUpdated'));
        
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  // Approve vendor (if user is a vendor and pending)
  const handleApproveVendor = async (userId) => {
    try {
      await adminAPI.approveVendor(userId);
      toast.success('Vendor approved successfully');
      await fetchUsers(false);
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('pendingCountsUpdated'));
      
    } catch (error) {
      console.error('Approve vendor error:', error);
      toast.error('Failed to approve vendor');
    }
  };

  // Filter users based on search, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.phone_number?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && user.verified) ||
      (statusFilter === 'pending' && !user.verified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getRoleBadge = (role) => {
    const configs = {
      admin: { bg: 'danger', icon: FaShieldAlt, text: 'Admin' },
      vendor: { bg: 'success', icon: FaStore, text: 'Vendor' },
      user: { bg: 'info', icon: FaUser, text: 'Customer' }
    };
    const config = configs[role] || configs.user;
    const Icon = config.icon;
    return (
      <Badge bg={config.bg} className="d-inline-flex align-items-center gap-1 px-3 py-2">
        <Icon size={12} /> {config.text}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="user-management-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h4 className="mb-1">User Management</h4>
            <p className="text-muted mb-0">Manage all users, roles, and permissions</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={() => fetchUsers(true)} 
              disabled={refreshing}
            >
              <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FaPlus className="me-2" /> Create New User
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col sm={6} md={3}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FaUser className="text-primary" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Users</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={3}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                    <FaShieldAlt className="text-danger" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Admins</h6>
                    <h3 className="mb-0">{stats.admins}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={3}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FaStore className="text-success" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Vendors</h6>
                    <h3 className="mb-0">{stats.vendors}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={3}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <FaUserTag className="text-warning" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Pending Approval</h6>
                    <h3 className="mb-0">{stats.pending}</h3>
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
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="vendor">Vendors</option>
                  <option value="user">Customers</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <FaUser size={50} className="text-muted mb-3" />
                <h5>No users found</h5>
                <p className="text-muted">
                  {search || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No users have registered yet'}
                </p>
                {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <Button variant="outline-primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px' }}>
                              <FaUser className="text-primary" />
                            </div>
                            <div>
                              <div className="fw-medium">{user.full_name || 'N/A'}</div>
                              <small className="text-muted">ID: {user.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FaEnvelope className="text-muted" size={12} />
                            {user.email}
                          </div>
                        </td>
                        <td>
                          {user.phone_number ? (
                            <div className="d-flex align-items-center gap-2">
                              <FaPhone className="text-muted" size={12} />
                              {user.phone_number}
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>
                          <Form.Select 
                            size="sm"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            style={{ width: '120px' }}
                          >
                            <option value="user">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </Form.Select>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={user.verified ? 'success' : 'warning'}>
                              {user.verified ? 'Verified' : 'Pending'}
                            </Badge>
                            {!user.verified && user.role === 'vendor' && (
                              <Button
                                size="sm"
                                variant="success"
                                className="py-0 px-2"
                                onClick={() => handleApproveVendor(user.id)}
                                title="Approve Vendor"
                              >
                                <FaCheck size={12} className="me-1" /> Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0"
                              onClick={() => handleVerifyUser(user.id, !user.verified)}
                              title={user.verified ? 'Unverify' : 'Verify'}
                            >
                              {user.verified ? 
                                <FaToggleOn className="text-success" size={18} /> : 
                                <FaToggleOff className="text-secondary" size={18} />
                              }
                            </Button>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            <FaCalendar className="me-1" size={10} />
                            {formatDate(user.created_at)}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailsModal(true);
                              }}
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          {filteredUsers.length > 0 && (
            <Card.Footer className="bg-white border-0 py-3 text-muted">
              Showing {filteredUsers.length} of {users.length} users
            </Card.Footer>
          )}
        </Card>

        {/* User Details Modal */}
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <FaUser className="me-2" /> User Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedUser && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <div className="bg-light rounded p-3">
                      <h6 className="mb-3 text-primary">Personal Information</h6>
                      <p className="mb-2"><strong>Full Name:</strong> {selectedUser.full_name || 'N/A'}</p>
                      <p className="mb-2"><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
                      <p className="mb-2"><strong>Phone:</strong> {selectedUser.phone_number || 'N/A'}</p>
                      <p className="mb-0"><strong>Location:</strong> {selectedUser.location || 'N/A'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="bg-light rounded p-3">
                      <h6 className="mb-3 text-primary">Account Information</h6>
                      <p className="mb-2"><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                      <p className="mb-2"><strong>Status:</strong> {selectedUser.verified ? 'Verified' : 'Pending'}</p>
                      <p className="mb-2"><strong>Joined:</strong> {formatDate(selectedUser.created_at)}</p>
                      {selectedUser.vendor_status && (
                        <p className="mb-0"><strong>Vendor Status:</strong> {selectedUser.vendor_status}</p>
                      )}
                    </div>
                  </Col>
                </Row>
                {selectedUser.business_name && (
                  <div className="bg-light rounded p-3">
                    <h6 className="mb-3 text-primary">
                      <FaStore className="me-2" /> Vendor Information
                    </h6>
                    <p className="mb-2"><strong>Business Name:</strong> {selectedUser.business_name}</p>
                    {selectedUser.bio && <p className="mb-0"><strong>Bio:</strong> {selectedUser.bio}</p>}
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {selectedUser && !selectedUser.verified && selectedUser.role === 'vendor' && (
              <Button 
                variant="success" 
                onClick={() => {
                  handleApproveVendor(selectedUser.id);
                  setShowDetailsModal(false);
                }}
              >
                <FaCheck className="me-2" /> Approve Vendor
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Create User Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AdminCreateUser onSuccess={() => {
              setShowCreateModal(false);
              fetchUsers(false);
            }} />
          </Modal.Body>
        </Modal>
      </div>

      <style>{`
        .user-management-page {
          padding: 0;
        }
        
        .stat-card {
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .table tbody tr:hover {
          background: #f8f9fa;
          cursor: pointer;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminUsers;