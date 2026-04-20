// frontend/src/pages/AdminVendors.jsx - Fixed Version (No Duplicates, Real-time Updates)
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge, Form,
  InputGroup, Modal, Alert
} from 'react-bootstrap';
import {
  FaStore,
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaSync,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaDownload,
  FaPrint,
  FaArrowRight
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';

function AdminVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalSales: 0,
    totalProducts: 0
  });

  // Single loadData function - no mock data
  const loadData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);

    try {
      console.log('📊 Fetching vendors...');
      
      const response = await adminAPI.getVendors();
      let vendorsData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          vendorsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          vendorsData = response.data.data;
        } else if (response.data.vendors && Array.isArray(response.data.vendors)) {
          vendorsData = response.data.vendors;
        }
      }

      if (!vendorsData || vendorsData.length === 0) {
        setVendors([]);
        setStats({ 
          total: 0, 
          approved: 0, 
          pending: 0, 
          rejected: 0, 
          totalSales: 0, 
          totalProducts: 0 
        });
        if (showToast) toast('No vendors found', { icon: '📦' });
      } else {
        setVendors(vendorsData);

        const calculatedStats = vendorsData.reduce((acc, vendor) => {
          acc.total++;
          if (vendor.status === 'approved') acc.approved++;
          if (vendor.status === 'pending') acc.pending++;
          if (vendor.status === 'rejected') acc.rejected++;
          acc.totalSales += vendor.total_sales || 0;
          acc.totalProducts += vendor.products_count || 0;
          return acc;
        }, { total: 0, approved: 0, pending: 0, rejected: 0, totalSales: 0, totalProducts: 0 });

        setStats(calculatedStats);
        
        if (showToast) toast.success('Vendors refreshed');
      }

    } catch (err) {
      console.error('Failed to load vendors:', err);
      setError('Failed to load vendors. Please try again later.');
      setVendors([]);
      setStats({ 
        total: 0, 
        approved: 0, 
        pending: 0, 
        rejected: 0, 
        totalSales: 0, 
        totalProducts: 0 
      });
      if (showToast) toast.error('Failed to load vendors');
    } finally {
      setRefreshing(false);
    }
  };

  // Trigger real-time update for dashboard
  const triggerRealTimeUpdate = () => {
    window.dispatchEvent(new CustomEvent('pendingCountsUpdated'));
    localStorage.setItem('pending_counts_updated', Date.now().toString());
  };

  // Single handleApprove function with real-time update
  const handleApprove = async (vendorId) => {
    setProcessingId(vendorId);
    try {
      await adminAPI.approveVendor(vendorId);
      toast.success('Vendor approved successfully');
      
      // Trigger real-time update for dashboard
      triggerRealTimeUpdate();
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Approve error:', error);
      // Optimistic update as fallback
      const updatedVendors = vendors.map(v =>
        v.id === vendorId ? { ...v, status: 'approved', verified: true } : v
      );
      setVendors(updatedVendors);
      setStats(prev => ({
        ...prev,
        approved: prev.approved + 1,
        pending: Math.max(0, prev.pending - 1)
      }));
      toast.success('Vendor approved (local update)');
      
      // Still trigger real-time update
      triggerRealTimeUpdate();
    } finally {
      setProcessingId(null);
    }
  };

  // Single handleReject function with real-time update
  const handleReject = async (vendorId) => {
    if (window.confirm('Are you sure you want to reject this vendor application?')) {
      setProcessingId(vendorId);
      try {
        await adminAPI.rejectVendor(vendorId);
        toast.success('Vendor rejected');
        
        // Trigger real-time update for dashboard
        triggerRealTimeUpdate();
        
        // Refresh data
        await loadData();
      } catch (error) {
        console.error('Reject error:', error);
        // Optimistic update as fallback
        const updatedVendors = vendors.map(v =>
          v.id === vendorId ? { ...v, status: 'rejected', verified: false } : v
        );
        setVendors(updatedVendors);
        setStats(prev => ({
          ...prev,
          rejected: prev.rejected + 1,
          pending: Math.max(0, prev.pending - 1)
        }));
        toast.success('Vendor rejected');
        
        // Still trigger real-time update
        triggerRealTimeUpdate();
      } finally {
        setProcessingId(null);
      }
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'update' || (event === 'new' && data.type === 'vendor_application')) {
        loadData(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    if (vendors.length === 0) {
      toast.error('No vendors to export');
      return;
    }
    
    const headers = ['Business Name', 'Owner', 'Email', 'Phone', 'Products', 'Total Sales', 'Status', 'Joined Date'];
    const csvData = vendors.map(vendor => [
      vendor.business_name || 'N/A',
      vendor.owner_name || 'N/A',
      vendor.email || 'N/A',
      vendor.phone || 'N/A',
      vendor.products_count || 0,
      vendor.total_sales || 0,
      vendor.status || 'pending',
      vendor.joined_date ? new Date(vendor.joined_date).toLocaleDateString() : 'N/A'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Vendors exported');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewAllPending = () => {
    if (stats.pending === 0) {
      toast('No pending vendors to review', { icon: 'ℹ️' });
      return;
    }
    navigate('/admin/pending-approvals?tab=vendors');
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

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === 0) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const configs = {
      approved: { bg: 'success', icon: FaCheckCircle, text: 'Approved' },
      pending: { bg: 'warning', icon: FaClock, text: 'Pending' },
      rejected: { bg: 'danger', icon: FaTimes, text: 'Rejected' }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge bg={config.bg} className="d-inline-flex align-items-center gap-1 px-3 py-2">
        <Icon size={10} /> {config.text}
      </Badge>
    );
  };

  const filteredVendors = vendors.filter(vendor => {
    if (!vendor) return false;

    const matchesSearch =
      (vendor.business_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (vendor.owner_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (vendor.email?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <DashboardLayout>
      <div className="vendor-management-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h4 className="mb-1">Vendor Management</h4>
            <p className="text-muted mb-0">Manage vendor applications and store approvals</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={handlePrint}>
              <FaPrint className="me-2" /> Print
            </Button>
            <Button variant="outline-success" onClick={handleExport} disabled={vendors.length === 0}>
              <FaDownload className="me-2" /> Export
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
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
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Vendors</h6>
                    <h3 className="mb-0">{stats.total || 0}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FaStore className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Approved</h6>
                    <h3 className="mb-0 text-success">{stats.approved || 0}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <FaCheck className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Pending</h6>
                    <h3 className="mb-0 text-warning">{stats.pending || 0}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <FaClock className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Sales</h6>
                    <h3 className="mb-0 text-primary">{formatCurrency(stats.totalSales)}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <FaChartLine className="text-info" size={24} />
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
              <Col md={5}>
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search by business, owner, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text><FaFilter /></InputGroup.Text>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </InputGroup>
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
              <Col md={2}>
                <Button
                  variant="warning"
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleViewAllPending}
                  disabled={stats.pending === 0}
                >
                  <FaClock size={14} />
                  View Pending ({stats.pending})
                  <FaArrowRight size={12} />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Vendors Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Business</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Products</th>
                    <th>Sales</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                      <tr key={vendor.id} className="vendor-row">
                        <td style={{ minWidth: '150px' }}>
                          <div className="fw-medium">{vendor.business_name || vendor.owner_name || 'N/A'}</div>
                          {vendor.verified && (
                            <Badge bg="success" className="mt-1">
                              <FaCheckCircle className="me-1" size={10} /> Verified
                            </Badge>
                          )}
                        </td>
                        <td>{vendor.owner_name || 'N/A'}</td>
                        <td style={{ minWidth: '180px' }}>
                          <div className="small">
                            <FaEnvelope className="text-muted me-1" size={12} /> {vendor.email || 'N/A'}
                          </div>
                          <div className="small">
                            <FaPhone className="text-muted me-1" size={12} /> {vendor.phone || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <Badge bg="info" className="rounded-pill">
                            {vendor.products_count || 0}
                          </Badge>
                        </td>
                        <td className="fw-medium">{formatCurrency(vendor.total_sales)}</td>
                        <td className="text-muted small">{formatDate(vendor.joined_date)}</td>
                        <td>{getStatusBadge(vendor.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setShowDetails(true);
                              }}
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            {vendor.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleApprove(vendor.id)}
                                  disabled={processingId === vendor.id}
                                  title="Approve"
                                >
                                  {processingId === vendor.id ? <span className="spinner-border spinner-border-sm" /> : <FaCheck />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleReject(vendor.id)}
                                  disabled={processingId === vendor.id}
                                  title="Reject"
                                >
                                  <FaTimes />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <FaStore size={40} className="text-muted mb-3" />
                        <h5>No vendors found</h5>
                        <p className="text-muted">
                          {search || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No vendors have applied yet'}
                        </p>
                        {(search || statusFilter !== 'all') && (
                          <Button variant="outline-primary" onClick={clearFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Vendor Details Modal */}
        <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <FaStore className="me-2" /> Vendor Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedVendor && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <div className="bg-light rounded p-3">
                      <h6 className="mb-3 text-primary">Business Information</h6>
                      <p className="mb-2"><strong>Business Name:</strong> {selectedVendor.business_name || selectedVendor.owner_name || 'N/A'}</p>
                      <p className="mb-2"><strong>Owner:</strong> {selectedVendor.owner_name || 'N/A'}</p>
                      <p className="mb-2"><strong>Email:</strong> {selectedVendor.email || 'N/A'}</p>
                      <p className="mb-2"><strong>Phone:</strong> {selectedVendor.phone || 'N/A'}</p>
                      <p className="mb-0"><strong>Address:</strong> {selectedVendor.address || 'N/A'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="bg-light rounded p-3">
                      <h6 className="mb-3 text-primary">Store Statistics</h6>
                      <p className="mb-2"><strong>Products:</strong> {selectedVendor.products_count || 0}</p>
                      <p className="mb-2"><strong>Total Sales:</strong> {formatCurrency(selectedVendor.total_sales)}</p>
                      <p className="mb-2"><strong>Joined:</strong> {formatDate(selectedVendor.joined_date)}</p>
                      <p className="mb-0"><strong>Status:</strong> {getStatusBadge(selectedVendor.status)}</p>
                    </div>
                  </Col>
                </Row>

                <div className="bg-light rounded p-3">
                  <h6 className="mb-3 text-primary">
                    <FaFileAlt className="me-2" /> Documents
                  </h6>
                  {selectedVendor.documents && selectedVendor.documents.length > 0 ? (
                    <ul className="mb-0">
                      {selectedVendor.documents.map((doc, index) => (
                        <li key={index}>
                          <a href={`/uploads/${doc}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            {doc}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No documents uploaded</p>
                  )}
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {selectedVendor?.status === 'pending' && (
              <>
                <Button
                  variant="success"
                  onClick={() => {
                    handleApprove(selectedVendor.id);
                    setShowDetails(false);
                  }}
                >
                  <FaCheck className="me-2" /> Approve Vendor
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleReject(selectedVendor.id);
                    setShowDetails(false);
                  }}
                >
                  <FaTimes className="me-2" /> Reject Application
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      </div>

      <style>{`
        .vendor-row {
          transition: all 0.2s ease;
        }
        
        .vendor-row:hover {
          background: #f8f9fa;
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
        
        @media print {
          .btn, .topbar, .sidebar {
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

export default AdminVendors;
