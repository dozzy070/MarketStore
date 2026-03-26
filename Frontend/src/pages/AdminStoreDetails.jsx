import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaStore, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFileAlt,
  FaUser,
  FaCalendar,
  FaClock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaHistory,
  FaBox,
  FaShoppingBag,
  FaStar,
  FaComment,
  FaDownload,
  FaPrint,
  FaEdit,
  FaSave,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSync,
  FaCog
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Line, Bar } from 'react-chartjs-2';

function AdminStoreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStore = {
        id: id,
        store_name: "Tech Haven",
        business_name: "Tech Haven Enterprises Ltd",
        owner_name: "John Doe",
        owner_email: "john.doe@techhaven.com",
        owner_phone: "+234 801 234 5678",
        alternative_phone: "+234 802 345 6789",
        business_address: "123 Tech Avenue, Ikeja, Lagos",
        registration_number: "RC1234567",
        tax_id: "TAX-98765432-001",
        website: "https://techhaven.com",
        description: "Your one-stop shop for electronics and gadgets...",
        established: "2023",
        employees: "5-10",
        annual_revenue: "₦50M - ₦100M",
        
        status: "active", // active, suspended, pending, rejected
        verified: true,
        email_verified: true,
        phone_verified: true,
        address_verified: true,
        documents_verified: true,
        
        joined_date: "2024-01-15T10:30:00Z",
        last_active: "2024-02-26T09:15:00Z",
        
        products_count: 156,
        orders_count: 2341,
        revenue_total: 15200000,
        avg_rating: 4.5,
        reviews_count: 234,
        
        documents: {
          business_registration: "https://example.com/rc1234567.pdf",
          tax_clearance: "https://example.com/tax.pdf",
          id_proof: "https://example.com/id.pdf",
          bank_statement: "https://example.com/bank.pdf"
        },
        
        bank_details: {
          bank_name: "First Bank",
          account_name: "Tech Haven Enterprises Ltd",
          account_number: "0123456789",
          sort_code: "011"
        },
        
        social_media: {
          facebook: "https://facebook.com/techhaven",
          twitter: "https://twitter.com/techhaven",
          instagram: "https://instagram.com/techhaven"
        },
        
        recent_activity: [
          { date: "2024-02-26T09:15:00Z", action: "Added 5 new products" },
          { date: "2024-02-25T14:30:00Z", action: "Processed order #ORD-2024-156" },
          { date: "2024-02-24T11:20:00Z", action: "Updated store banner" }
        ],
        
        flags: [
          { type: "warning", message: "High return rate (15%)", date: "2024-02-20" },
          { type: "info", message: "New product category added", date: "2024-02-18" }
        ]
      };

      setStore(mockStore);
    } catch (error) {
      toast.error('Failed to load store details');
      navigate('/admin/stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    try {
      // await adminAPI.suspendStore(id, { reason: suspendReason });
      toast.success('Store suspended successfully');
      setShowSuspendModal(false);
      setStore({ ...store, status: 'suspended' });
    } catch (error) {
      toast.error('Failed to suspend store');
    }
  };

  const handleVerify = async () => {
    try {
      // await adminAPI.verifyStore(id, { notes: verificationNotes });
      toast.success('Store verified successfully');
      setShowVerifyModal(false);
      setStore({ ...store, verified: true });
    } catch (error) {
      toast.error('Failed to verify store');
    }
  };

  const handleActivate = async () => {
    try {
      // await adminAPI.activateStore(id);
      toast.success('Store activated successfully');
      setStore({ ...store, status: 'active' });
    } catch (error) {
      toast.error('Failed to activate store');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      suspended: 'danger',
      pending: 'warning',
      rejected: 'secondary'
    };
    return <Badge bg={colors[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <h4 className="mb-0">{store.store_name}</h4>
            {getStatusBadge(store.status)}
            {store.verified && (
              <Badge bg="success">
                <FaCheckCircle className="me-1" /> Verified
              </Badge>
            )}
          </div>
          <p className="text-muted mb-0">Store ID: {store.id}</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => window.print()}>
            <FaPrint className="me-2" /> Print
          </Button>
          <Link to={`/admin/stores/${id}/approve`}>
            <Button variant="primary">
              <FaEye className="me-2" /> Review Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant="success" 
              onClick={handleActivate}
              disabled={store.status === 'active'}
            >
              <FaCheck className="me-2" /> Activate Store
            </Button>
            <Button 
              variant="warning" 
              onClick={() => setShowVerifyModal(true)}
              disabled={store.verified}
            >
              <FaShieldAlt className="me-2" /> Verify Store
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowSuspendModal(true)}
              disabled={store.status === 'suspended'}
            >
              <FaBan className="me-2" /> Suspend Store
            </Button>
            <Button variant="info">
              <FaEye className="me-2" /> View as Customer
            </Button>
            <Button variant="secondary">
              <FaHistory className="me-2" /> Activity Log
            </Button>
          </div>
        </Card.Body>
      </Card>

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
                  <h6 className="text-muted mb-1">Products</h6>
                  <h3 className="mb-0">{store.products_count}</h3>
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
                  <FaShoppingBag className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Orders</h6>
                  <h3 className="mb-0">{store.orders_count}</h3>
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
                  <FaShoppingBag className="text-info" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Revenue</h6>
                  <h3 className="mb-0">₦{(store.revenue_total / 1000000).toFixed(1)}M</h3>
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
                  <h6 className="text-muted mb-1">Rating</h6>
                  <h3 className="mb-0">{store.avg_rating} ★</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4">
          <div className="d-flex gap-2">
            <Button 
              variant={activeTab === 'overview' ? 'primary' : 'light'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === 'documents' ? 'primary' : 'light'}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </Button>
            <Button 
              variant={activeTab === 'activity' ? 'primary' : 'light'}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </Button>
            <Button 
              variant={activeTab === 'flags' ? 'primary' : 'light'}
              onClick={() => setActiveTab('flags')}
            >
              Flags & Issues
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Row>
              <Col md={6}>
                <h6 className="mb-3">Store Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="border-0 fw-medium">Store Name:</td>
                      <td className="border-0">{store.store_name}</td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Business Name:</td>
                      <td className="border-0">{store.business_name}</td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Registration #:</td>
                      <td className="border-0">
                        <code>{store.registration_number}</code>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Tax ID:</td>
                      <td className="border-0">
                        <code>{store.tax_id}</code>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Established:</td>
                      <td className="border-0">{store.established}</td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Employees:</td>
                      <td className="border-0">{store.employees}</td>
                    </tr>
                  </tbody>
                </table>
              </Col>
              <Col md={6}>
                <h6 className="mb-3">Owner Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="border-0 fw-medium">Name:</td>
                      <td className="border-0">{store.owner_name}</td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Email:</td>
                      <td className="border-0">
                        <div className="d-flex align-items-center">
                          {store.owner_email}
                          {store.email_verified ? (
                            <FaCheckCircle className="text-success ms-2" size={14} />
                          ) : (
                            <FaExclamationTriangle className="text-warning ms-2" size={14} />
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Phone:</td>
                      <td className="border-0">
                        <div className="d-flex align-items-center">
                          {store.owner_phone}
                          {store.phone_verified ? (
                            <FaCheckCircle className="text-success ms-2" size={14} />
                          ) : (
                            <FaExclamationTriangle className="text-warning ms-2" size={14} />
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-0 fw-medium">Address:</td>
                      <td className="border-0">
                        <div className="d-flex align-items-center">
                          {store.business_address}
                          {store.address_verified ? (
                            <FaCheckCircle className="text-success ms-2" size={14} />
                          ) : (
                            <FaExclamationTriangle className="text-warning ms-2" size={14} />
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Col>
            </Row>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Business Registration</td>
                  <td>
                    <code>{store.documents.business_registration.split('/').pop()}</code>
                  </td>
                  <td>
                    <Badge bg={store.documents_verified ? 'success' : 'warning'}>
                      {store.documents_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="link" className="p-0 me-2">
                      <FaEye /> View
                    </Button>
                    <Button size="sm" variant="link" className="p-0 text-success">
                      <FaDownload /> Download
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Tax Clearance</td>
                  <td>
                    <code>{store.documents.tax_clearance.split('/').pop()}</code>
                  </td>
                  <td>
                    <Badge bg={store.documents_verified ? 'success' : 'warning'}>
                      {store.documents_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="link" className="p-0 me-2">
                      <FaEye /> View
                    </Button>
                    <Button size="sm" variant="link" className="p-0 text-success">
                      <FaDownload /> Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              {store.recent_activity.map((activity, index) => (
                <div key={index} className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                    <FaHistory className="text-primary" />
                  </div>
                  <div>
                    <p className="mb-1">{activity.action}</p>
                    <small className="text-muted">
                      {new Date(activity.date).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flags Tab */}
          {activeTab === 'flags' && (
            <div>
              {store.flags.map((flag, index) => (
                <Card key={index} className={`border-0 bg-${flag.type === 'warning' ? 'warning' : 'info'} bg-opacity-10 mb-3`}>
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <FaExclamationTriangle className={`text-${flag.type === 'warning' ? 'warning' : 'info'}`} />
                      <div>
                        <p className="mb-1">{flag.message}</p>
                        <small className="text-muted">Reported on {flag.date}</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Suspend Modal */}
      <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Suspend Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for Suspension</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Provide detailed reason for suspension..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSuspend}>
            Suspend Store
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verify Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Verification Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add any verification notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleVerify}>
            Verify Store
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default AdminStoreDetails;