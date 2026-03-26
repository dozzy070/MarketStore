// frontend/src/pages/AdminAuditLog.jsx - No Loading Spinner, No Mock Data
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { 
  FaHistory, 
  FaUser, 
  FaBox, 
  FaShoppingCart, 
  FaCog,
  FaSignInAlt,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTimes,
  FaFileExport
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    actions: {}
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (showToast = false) => {
    setError(null);
    
    try {
      console.log('Fetching audit logs...');
      
      // Check if adminAPI and getAuditLogs exist
      if (!adminAPI || typeof adminAPI.getAuditLogs !== 'function') {
        console.log('Audit log endpoint not implemented yet');
        setLogs([]);
        setStats({ total: 0, actions: {} });
        return;
      }
      
      const response = await adminAPI.getAuditLogs({
        filter,
        search,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      let logsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          logsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          logsData = response.data.data;
        } else if (response.data.logs && Array.isArray(response.data.logs)) {
          logsData = response.data.logs;
        }
      }
      
      if (logsData.length === 0) {
        setLogs([]);
        setStats({ total: 0, actions: {} });
      } else {
        setLogs(logsData);
        
        // Calculate stats
        const actions = {};
        logsData.forEach(log => {
          const action = log.action || log.type;
          actions[action] = (actions[action] || 0) + 1;
        });
        
        setStats({
          total: logsData.length,
          actions
        });
        
        if (showToast) toast.success('Audit logs refreshed');
      }
      
    } catch (err) {
      // Handle 404 gracefully - just show empty state, not an error
      if (err.response?.status === 404) {
        console.log('Audit log endpoint not available (404)');
        setLogs([]);
        setStats({ total: 0, actions: {} });
      } else {
        console.error('Failed to load audit logs:', err);
        setError('Failed to load audit logs. Please try again later.');
        if (showToast) toast.error('Failed to load audit logs');
      }
    }
  };

  const handleExport = async () => {
    if (!adminAPI || typeof adminAPI.exportAuditLogs !== 'function') {
      toast.error('Export feature coming soon');
      return;
    }
    
    setExporting(true);
    try {
      const response = await adminAPI.exportAuditLogs({
        filter,
        search,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit log exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export audit log');
    } finally {
      setExporting(false);
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'login':
        return <FaSignInAlt className="text-success" />;
      case 'logout':
        return <FaSignOutAlt className="text-secondary" />;
      case 'create':
      case 'add':
        return <FaPlus className="text-success" />;
      case 'update':
      case 'edit':
        return <FaEdit className="text-info" />;
      case 'delete':
      case 'remove':
        return <FaTrash className="text-danger" />;
      case 'order':
        return <FaShoppingCart className="text-primary" />;
      case 'product':
        return <FaBox className="text-warning" />;
      case 'settings':
        return <FaCog className="text-secondary" />;
      default:
        return <FaHistory className="text-secondary" />;
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      login: 'success',
      logout: 'secondary',
      create: 'success',
      add: 'success',
      update: 'info',
      edit: 'info',
      delete: 'danger',
      remove: 'danger',
      order: 'primary',
      product: 'warning',
      settings: 'secondary'
    };
    return colors[action] || 'secondary';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.action?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (log.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (log.user?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (log.details?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || log.action === filter;
    
    if (dateRange.start || dateRange.end) {
      const logDate = new Date(log.timestamp);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && logDate < startDate) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (logDate > endOfDay) return false;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'login', label: 'Logins' },
    { value: 'logout', label: 'Logouts' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'delete', label: 'Deleted' },
    { value: 'order', label: 'Orders' },
    { value: 'product', label: 'Products' }
  ];

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">Audit Log</h4>
          <p className="text-muted mb-0">Track all system activities and changes</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-success" 
            onClick={handleExport}
            disabled={exporting || logs.length === 0}
          >
            {exporting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Exporting...
              </>
            ) : (
              <>
                <FaFileExport className="me-2" /> Export
              </>
            )}
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => fetchLogs(true)}
          >
            <FaHistory className="me-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3" size={24} />
            <div>
              <strong>Error</strong>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Stats Cards - Only show if there are logs */}
      {logs.length > 0 && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FaHistory className="text-primary" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Events</h6>
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
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FaPlus className="text-success" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Creations</h6>
                    <h3 className="mb-0">{stats.actions?.create || stats.actions?.add || 0}</h3>
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
                    <FaEdit className="text-info" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Updates</h6>
                    <h3 className="mb-0">{stats.actions?.update || stats.actions?.edit || 0}</h3>
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
                    <FaTrash className="text-danger" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Deletions</h6>
                    <h3 className="mb-0">{stats.actions?.delete || stats.actions?.remove || 0}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by action, user, or details..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  {actionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Form.Select>
              </InputGroup>
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
                className="w-100"
                onClick={clearFilters}
              >
                <FaTimes className="me-1" /> Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-5">
              <FaHistory size={50} className="text-muted mb-3" />
              <h5>No audit logs found</h5>
              <p className="text-muted">
                {search || filter !== 'all' || dateRange.start || dateRange.end
                  ? 'Try adjusting your filters'
                  : 'No activities have been recorded yet'}
              </p>
              {(search || filter !== 'all' || dateRange.start || dateRange.end) && (
                <Button variant="outline-primary" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '100px' }}>Time</th>
                    <th style={{ width: '100px' }}>Action</th>
                    <th>Description</th>
                    <th style={{ width: '150px' }}>User</th>
                    <th style={{ width: '120px' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td className="text-muted small">{formatTimestamp(log.timestamp)}</td>
                      <td>
                        <Badge bg={getActionBadge(log.action)} className="d-inline-flex align-items-center gap-1 px-3 py-2">
                          {getActionIcon(log.action)}
                          <span className="ms-1 text-capitalize">{log.action}</span>
                        </Badge>
                      </td>
                      <td>
                        <div className="fw-medium">{log.description}</div>
                        {log.details && (
                          <small className="text-muted">{log.details}</small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUser className="text-muted me-2" size={12} />
                          {log.user || log.user_name || 'System'}
                        </div>
                      </td>
                      <td>
                        <code className="small">{log.ip || log.ip_address || 'N/A'}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        {filteredLogs.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3 text-muted">
            Showing {filteredLogs.length} of {logs.length} events
          </Card.Footer>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default AdminAuditLog;