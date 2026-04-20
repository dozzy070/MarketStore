// frontend/src/pages/ActivityLog.jsx - No Spinners, No Mock Data
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
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
  FaEye,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaDownload,
  FaExclamationTriangle,
  FaFileExport,
  FaTimes
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { activityAPI } from '../../services/api';
import toast from 'react-hot-toast';

function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('📊 Fetching activity log...');
      
      // Check if activityAPI exists
      if (!activityAPI || typeof activityAPI.getActivities !== 'function') {
        console.warn('Activity API not available yet');
        setActivities([]);
        if (showToast) toast('Activity log feature coming soon', { icon: '📋' });
        return;
      }
      
      const response = await activityAPI.getActivities();
      let activitiesData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          activitiesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          activitiesData = response.data.data;
        } else if (response.data.activities && Array.isArray(response.data.activities)) {
          activitiesData = response.data.activities;
        }
      }
      
      if (!activitiesData || activitiesData.length === 0) {
        setActivities([]);
        if (showToast) toast('No activities found', { icon: '📋' });
      } else {
        setActivities(activitiesData);
        if (showToast) toast.success('Activities refreshed');
      }
      
    } catch (error) {
      console.error('Failed to load activity log:', error);
      // Handle 404 gracefully
      if (error.response?.status === 404) {
        console.log('Activity log endpoint not implemented yet');
        setActivities([]);
        if (showToast) toast('Activity log endpoint not available', { icon: '🔧' });
      } else {
        setError('Failed to load activity log. Please try again later.');
        if (showToast) toast.error('Failed to load activity log');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (!activityAPI || typeof activityAPI.exportActivities !== 'function') {
      toast.error('Export functionality not available yet');
      return;
    }
    
    if (activities.length === 0) {
      toast.error('No activities to export');
      return;
    }
    
    setExporting(true);
    try {
      const response = await activityAPI.exportActivities({
        filter,
        search,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Activity log exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export activity log');
    } finally {
      setExporting(false);
    }
  };

  const getActivityIcon = (activity) => {
    const iconName = activity.icon || activity.type;
    const color = activity.color || getActivityColor(activity.type);
    
    switch(iconName) {
      case 'login':
      case 'FaSignInAlt':
        return <FaSignInAlt className={`text-${color}`} />;
      case 'logout':
      case 'FaSignOutAlt':
        return <FaSignOutAlt className={`text-${color}`} />;
      case 'order':
      case 'FaShoppingCart':
        return <FaShoppingCart className={`text-${color}`} />;
      case 'product_add':
      case 'FaPlus':
        return <FaPlus className={`text-${color}`} />;
      case 'product_update':
      case 'FaEdit':
        return <FaEdit className={`text-${color}`} />;
      case 'product_delete':
      case 'FaTrash':
        return <FaTrash className={`text-${color}`} />;
      case 'settings':
      case 'FaCog':
        return <FaCog className={`text-${color}`} />;
      case 'profile':
      case 'FaUser':
        return <FaUser className={`text-${color}`} />;
      default:
        return <FaHistory className={`text-${color}`} />;
    }
  };

  const getActivityColor = (type) => {
    const colors = {
      login: 'success',
      logout: 'secondary',
      order: 'primary',
      product_add: 'success',
      product_update: 'info',
      product_delete: 'danger',
      profile: 'info',
      settings: 'warning'
    };
    return colors[type] || 'secondary';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.description?.toLowerCase().includes(search.toLowerCase()) ||
                         activity.details?.toLowerCase().includes(search.toLowerCase()) ||
                         activity.user?.toLowerCase().includes(search.toLowerCase());
    
    if (dateRange.start || dateRange.end) {
      const activityDate = new Date(activity.timestamp);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && activityDate < startDate) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (activityDate > endOfDay) return false;
      }
    }
    
    return matchesFilter && matchesSearch;
  });

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Logins' },
    { value: 'logout', label: 'Logouts' },
    { value: 'order', label: 'Orders' },
    { value: 'product_add', label: 'Product Added' },
    { value: 'product_update', label: 'Product Updated' },
    { value: 'product_delete', label: 'Product Deleted' },
    { value: 'profile', label: 'Profile Updates' },
    { value: 'settings', label: 'Settings Changes' }
  ];

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      login: activities.filter(a => a.type === 'login').length,
      order: activities.filter(a => a.type === 'order').length,
      product: activities.filter(a => a.type === 'product_add' || a.type === 'product_update' || a.type === 'product_delete').length
    };
    return stats;
  };

  const stats = getActivityStats();

  const clearFilters = () => {
    setFilter('all');
    setSearch('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">Activity Log</h4>
          <p className="text-muted mb-0">Track all your activities and account changes</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={() => fetchActivities(true)} 
            disabled={refreshing}
          >
            <FaHistory className={`me-2 ${refreshing ? 'spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline-success" 
            onClick={handleExport}
            disabled={exporting || activities.length === 0}
          >
            {exporting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Exporting...
              </>
            ) : (
              <>
                <FaFileExport className="me-2" /> Export Log
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
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

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search activities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
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
                className="w-100"
                onClick={clearFilters}
                title="Clear filters"
              >
                <FaTimes className="me-1" /> Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Activity Stats - Only show if there are activities */}
      {activities.length > 0 && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FaHistory className="text-primary" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Activities</h6>
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
                    <FaSignInAlt className="text-success" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Logins</h6>
                    <h3 className="mb-0">{stats.login}</h3>
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
                    <FaShoppingCart className="text-info" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Orders</h6>
                    <h3 className="mb-0">{stats.order}</h3>
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
                    <h6 className="text-muted mb-1">Products</h6>
                    <h3 className="mb-0">{stats.product}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Activity Timeline */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-5">
              <FaHistory size={50} className="text-muted mb-3" />
              <h5>No activities found</h5>
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
            <div className="activity-timeline">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="timeline-item d-flex gap-3 mb-4">
                  <div className="timeline-icon flex-shrink-0">
                    <div 
                      className={`bg-${getActivityColor(activity.type)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      {getActivityIcon(activity)}
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="timeline-line" style={{ 
                        height: 'calc(100% + 1rem)', 
                        width: '2px', 
                        background: '#e9ecef', 
                        marginLeft: '19px', 
                        marginTop: '5px' 
                      }} />
                    )}
                  </div>
                  <div className="timeline-content flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{activity.description}</h6>
                        {activity.details && (
                          <p className="small text-muted mb-1">{activity.details}</p>
                        )}
                        <div className="d-flex gap-3 small text-muted flex-wrap">
                          <span>
                            <FaCalendarAlt className="me-1" size={10} />
                            {formatTimestamp(activity.timestamp)}
                          </span>
                          {activity.ip && (
                            <span>IP: {activity.ip}</span>
                          )}
                          {activity.device && (
                            <span>Device: {activity.device}</span>
                          )}
                          {activity.user_agent && (
                            <span>Browser: {activity.user_agent}</span>
                          )}
                        </div>
                      </div>
                      <Badge bg={getActivityColor(activity.type)} className="px-3 py-2 text-capitalize">
                        {activity.type?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
        {filteredActivities.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3 text-muted">
            Showing {filteredActivities.length} of {activities.length} activities
          </Card.Footer>
        )}
      </Card>

      <style>{`
        .timeline-item:last-child .timeline-line {
          display: none;
        }
        
        .timeline-icon {
          position: relative;
        }
        
        .timeline-line {
          position: absolute;
          left: 19px;
          top: 45px;
        }
        
        .activity-timeline {
          max-height: 600px;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .activity-timeline::-webkit-scrollbar {
          width: 6px;
        }
        
        .activity-timeline::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .activity-timeline::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .activity-timeline::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .timeline-item {
            flex-direction: column;
          }
          
          .timeline-line {
            display: none;
          }
          
          .timeline-icon {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default ActivityLog;
