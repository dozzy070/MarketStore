import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Image, Form, Table, Modal } from 'react-bootstrap';
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
  FaInfoCircle,
  FaDownload,
  FaPrint,
  FaHistory,
  FaBox,
  FaShoppingBag,
  FaStar,
  FaComment
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function ApproveStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [store, setStore] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('pending'); // pending, approved, rejected

  useEffect(() => {
    fetchStoreApplication();
  }, [id]);

  const fetchStoreApplication = async () => {
    try {
      // Mock data - replace with actual API call
      const mockApplication = {
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
        description: "Your one-stop shop for electronics and gadgets. We offer the latest tech products at competitive prices with excellent customer service.",
        established: "2023",
        employees: "5-10",
        annual_revenue: "₦50M - ₦100M",
        
        // Documents
        documents: {
          business_registration: "https://example.com/docs/rc1234567.pdf",
          tax_clearance: "https://example.com/docs/tax_clearance.pdf",
          id_proof: "https://example.com/docs/id_proof.pdf",
          bank_statement: "https://example.com/docs/bank_statement.pdf",
          utility_bill: "https://example.com/docs/utility_bill.pdf"
        },

        // Social Media
        social_media: {
          facebook: "https://facebook.com/techhaven",
          twitter: "https://twitter.com/techhaven",
          instagram: "https://instagram.com/techhaven",
          linkedin: "https://linkedin.com/company/techhaven"
        },

        // Products/Services
        product_categories: ["Electronics", "Computers", "Phones", "Accessories"],
        sample_products: [
          { name: "Wireless Headphones", price: 15000 },
          { name: "Smart Watch", price: 45000 },
          { name: "Laptop Backpack", price: 12000 }
        ],

        // Bank Details
        bank_details: {
          bank_name: "First Bank",
          account_name: "Tech Haven Enterprises Ltd",
          account_number: "0123456789",
          sort_code: "011"
        },

        // Application Info
        applied_date: "2024-02-15T10:30:00Z",
        status: "pending",
        reviewed_by: null,
        reviewed_date: null,
        notes: "",

        // Verification Status
        email_verified: true,
        phone_verified: true,
        address_verified: false,
        documents_verified: false,

        // Stats (if applicable)
        existing_products: 0,
        existing_orders: 0,
        existing_reviews: 0
      };

      setStore(mockApplication);
      setReviewStatus(mockApplication.status);
    } catch (error) {
      toast.error('Failed to load store application');
      navigate('/admin/stores');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      // await adminAPI.approveStore(id, { notes: verificationNotes });
      toast.success('Store approved successfully!');
      setReviewStatus('approved');
      setTimeout(() => {
        navigate('/admin/stores');
      }, 1500);
    } catch (error) {
      toast.error('Failed to approve store');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      // await adminAPI.rejectStore(id, { reason: rejectionReason });
      toast.success('Store application rejected');
      setShowRejectModal(false);
      setReviewStatus('rejected');
      setTimeout(() => {
        navigate('/admin/stores');
      }, 1500);
    } catch (error) {
      toast.error('Failed to reject store');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!verificationNotes.trim()) {
      toast.error('Please specify what information is needed');
      return;
    }

    setProcessing(true);
    try {
      // await adminAPI.requestMoreInfo(id, { message: verificationNotes });
      toast.success('Information requested from vendor');
      navigate('/admin/stores');
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyDocument = (docType) => {
    setSelectedDocument({ type: docType, url: store.documents[docType] });
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-3">Loading store application...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Approve Store Application</h4>
          <p className="text-muted mb-0">Review and verify vendor store details</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => window.print()}>
            <FaPrint className="me-2" /> Print
          </Button>
          <Button variant="outline-primary">
            <FaDownload className="me-2" /> Download
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className={`border-0 shadow-sm mb-4 ${
        reviewStatus === 'approved' ? 'bg-success' :
        reviewStatus === 'rejected' ? 'bg-danger' : 'bg-warning'
      } text-white`}>
        <Card.Body>
          <div className="d-flex align-items-center">
            {reviewStatus === 'approved' ? (
              <FaCheckCircle size={30} className="me-3" />
            ) : reviewStatus === 'rejected' ? (
              <FaBan size={30} className="me-3" />
            ) : (
              <FaClock size={30} className="me-3" />
            )}
            <div>
              <h5 className="mb-1">
                Application {reviewStatus === 'pending' ? 'Pending Review' : reviewStatus}
              </h5>
              <p className="mb-0 opacity-75">
                {reviewStatus === 'pending' 
                  ? 'Please review all documents and information below'
                  : reviewStatus === 'approved'
                  ? 'This store has been approved and is now live'
                  : 'This application has been rejected'}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8}>
          {/* Store Information */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Store Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
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
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td className="border-0 fw-medium">Annual Revenue:</td>
                        <td className="border-0">{store.annual_revenue}</td>
                      </tr>
                      <tr>
                        <td className="border-0 fw-medium">Applied Date:</td>
                        <td className="border-0">{formatDate(store.applied_date)}</td>
                      </tr>
                      <tr>
                        <td className="border-0 fw-medium">Website:</td>
                        <td className="border-0">
                          <a href={store.website} target="_blank" rel="noopener noreferrer">
                            {store.website}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>

              <h6 className="mt-3 mb-2">Business Description</h6>
              <p className="text-muted">{store.description}</p>

              <h6 className="mt-3 mb-2">Product Categories</h6>
              <div className="d-flex gap-2 mb-3">
                {store.product_categories.map(cat => (
                  <Badge key={cat} bg="info">{cat}</Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Owner Information */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Owner Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
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
                    </tbody>
                  </table>
                </Col>
                <Col md={6}>
                  <table className="table table-sm">
                    <tbody>
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
                        <td className="border-0 fw-medium">Alt Phone:</td>
                        <td className="border-0">{store.alternative_phone}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>

              <h6 className="mt-3 mb-2">Business Address</h6>
              <p className="text-muted d-flex align-items-center">
                {store.business_address}
                {store.address_verified ? (
                  <FaCheckCircle className="text-success ms-2" size={14} />
                ) : (
                  <FaExclamationTriangle className="text-warning ms-2" size={14} />
                )}
              </p>
            </Card.Body>
          </Card>

          {/* Documents */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Supporting Documents</h5>
              {store.documents_verified ? (
                <Badge bg="success">All Verified</Badge>
              ) : (
                <Badge bg="warning">Pending Verification</Badge>
              )}
            </Card.Header>
            <Card.Body>
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
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="p-0 me-2"
                        onClick={() => handleVerifyDocument('business_registration')}
                      >
                        <FaEye /> View
                      </Button>
                      <Button size="sm" variant="link" className="p-0 text-success">
                        <FaCheck /> Verify
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Tax Clearance</td>
                    <td>
                      <code>{store.documents.tax_clearance.split('/').pop()}</code>
                    </td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="link" className="p-0 me-2">
                        <FaEye /> View
                      </Button>
                      <Button size="sm" variant="link" className="p-0 text-success">
                        <FaCheck /> Verify
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>ID Proof</td>
                    <td>
                      <code>{store.documents.id_proof.split('/').pop()}</code>
                    </td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="link" className="p-0 me-2">
                        <FaEye /> View
                      </Button>
                      <Button size="sm" variant="link" className="p-0 text-success">
                        <FaCheck /> Verify
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Bank Statement</td>
                    <td>
                      <code>{store.documents.bank_statement.split('/').pop()}</code>
                    </td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="link" className="p-0 me-2">
                        <FaEye /> View
                      </Button>
                      <Button size="sm" variant="link" className="p-0 text-success">
                        <FaCheck /> Verify
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Utility Bill</td>
                    <td>
                      <code>{store.documents.utility_bill.split('/').pop()}</code>
                    </td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="link" className="p-0 me-2">
                        <FaEye /> View
                      </Button>
                      <Button size="sm" variant="link" className="p-0 text-success">
                        <FaCheck /> Verify
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Bank Details */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Bank Details</h5>
            </Card.Header>
            <Card.Body>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="border-0 fw-medium">Bank:</td>
                    <td className="border-0">{store.bank_details.bank_name}</td>
                  </tr>
                  <tr>
                    <td className="border-0 fw-medium">Account Name:</td>
                    <td className="border-0">{store.bank_details.account_name}</td>
                  </tr>
                  <tr>
                    <td className="border-0 fw-medium">Account Number:</td>
                    <td className="border-0">
                      <code>{store.bank_details.account_number}</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-0 fw-medium">Sort Code:</td>
                    <td className="border-0">
                      <code>{store.bank_details.sort_code}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>

          {/* Social Media */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Social Media</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                {store.social_media.facebook && (
                  <a href={store.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    Facebook: {store.social_media.facebook}
                  </a>
                )}
                {store.social_media.twitter && (
                  <a href={store.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    Twitter: {store.social_media.twitter}
                  </a>
                )}
                {store.social_media.instagram && (
                  <a href={store.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    Instagram: {store.social_media.instagram}
                  </a>
                )}
                {store.social_media.linkedin && (
                  <a href={store.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    LinkedIn: {store.social_media.linkedin}
                  </a>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Sample Products */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Sample Products</h5>
            </Card.Header>
            <Card.Body>
              {store.sample_products.map((product, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{product.name}</span>
                  <Badge bg="light" text="dark">₦{product.price.toLocaleString()}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Verification Notes */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Verification Notes</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Add notes about this verification..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </Form.Group>

              {reviewStatus === 'pending' && (
                <div className="d-flex flex-column gap-2">
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Approve Store'}
                  </Button>
                  <Button 
                    variant="warning" 
                    size="lg" 
                    className="w-100"
                    onClick={handleRequestMoreInfo}
                    disabled={processing}
                  >
                    Request More Info
                  </Button>
                  <Button 
                    variant="danger" 
                    size="lg" 
                    className="w-100"
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                  >
                    Reject Application
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Store Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide detailed reason for rejection..."
            />
            <Form.Text className="text-muted">
              This will be sent to the vendor via email.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={processing}>
            {processing ? 'Processing...' : 'Reject Application'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <div className="text-center">
              <p className="mb-3">Document: <strong>{selectedDocument.type}</strong></p>
              <div className="border rounded p-4 bg-light">
                <FaFileAlt size={100} className="text-primary mb-3" />
                <p className="text-muted">Document preview not available</p>
                <Button variant="primary" href={selectedDocument.url} target="_blank">
                  Download Document
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={() => {
            toast.success('Document verified');
            setShowDetailsModal(false);
          }}>
            <FaCheck className="me-2" /> Mark as Verified
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default ApproveStore;