// frontend/src/pages/VendorPayouts.jsx - Professional & Real-time Functional
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { 
  FaWallet, 
  FaUniversity, 
  FaMoneyBillWave, 
  FaHistory, 
  FaSync, 
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
  FaPhone,
  FaSpinner
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { vendorAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function VendorPayouts() {
  const [earnings, setEarnings] = useState({
    total_earned: 0,
    total_paid: 0,
    pending_earnings: 0,
    available_balance: 0,
    total_withdrawn: 0
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    successRate: 0,
    averageWithdrawal: 0,
    lastWithdrawal: null
  });

  useEffect(() => {
    fetchData();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (withdrawals.length > 0) {
      const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved');
      const successRate = withdrawals.length ? (approvedWithdrawals.length / withdrawals.length) * 100 : 0;
      const averageWithdrawal = approvedWithdrawals.length 
        ? approvedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0) / approvedWithdrawals.length 
        : 0;
      const lastWithdrawal = withdrawals[0]?.created_at || null;
      
      setStats({
        successRate: Math.round(successRate),
        averageWithdrawal,
        lastWithdrawal
      });
    }
  }, [withdrawals]);

  const fetchData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError('');
    
    try {
      const [earningsRes, withdrawalsRes] = await Promise.all([
        vendorAPI.getEarnings().catch(() => ({ data: { success: false } })),
        vendorAPI.getWithdrawals().catch(() => ({ data: { success: false } }))
      ]);
      
      if (earningsRes.data?.success) {
        setEarnings(earningsRes.data.data);
      }
      
      if (withdrawalsRes.data?.success) {
        setWithdrawals(withdrawalsRes.data.withdrawals || []);
      }
      
      if (showToast) toast.success('Data refreshed');
    } catch (error) {
      console.error('Fetch error:', error);
      if (showToast) toast.error('Failed to load data');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await vendorAPI.getBanks();
      if (response.data?.success && response.data.data) {
        setBanks(response.data.data);
      }
    } catch (error) {
      console.error('Bank fetch error:', error);
    }
  };

  const verifyAccount = async () => {
    if (!accountNumber || !bankCode) {
      toast.error('Please enter account number and select bank');
      return;
    }
    
    if (accountNumber.length < 10) {
      toast.error('Please enter a valid 10-digit account number');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      const response = await vendorAPI.verifyAccount({
        accountNumber,
        bankCode
      });
      
      if (response.data?.success) {
        setAccountName(response.data.data.account_name);
        toast.success('Account verified successfully');
      } else {
        setError(response.data?.error || 'Account verification failed');
        toast.error(response.data?.error || 'Account verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify account. Please try again.');
      toast.error('Failed to verify account');
    } finally {
      setVerifying(false);
    }
  };

  const requestWithdrawal = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (numAmount < 1000) {
      toast.error('Minimum withdrawal amount is ₦1,000');
      return;
    }
    
    if (numAmount > earnings.available_balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    if (!bankName || !bankCode || !accountNumber || !accountName) {
      toast.error('Please complete bank details and verify account');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await vendorAPI.requestPayout({
        amount: numAmount,
        bankName,
        bankCode,
        accountNumber,
        accountName
      });
      
      if (response.data?.success) {
        toast.success('Withdrawal request submitted successfully');
        setShowModal(false);
        setAmount('');
        setBankName('');
        setBankCode('');
        setAccountNumber('');
        setAccountName('');
        fetchData(true);
      } else {
        setError(response.data?.message || 'Failed to submit request');
        toast.error(response.data?.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError('Failed to submit withdrawal request');
      toast.error('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'warning', icon: FaClock, text: 'Pending' },
      approved: { bg: 'success', icon: FaCheckCircle, text: 'Approved' },
      rejected: { bg: 'danger', icon: FaTimesCircle, text: 'Rejected' }
    };
    const { bg, icon: Icon, text } = config[status] || config.pending;
    return (
      <Badge bg={bg} className="d-inline-flex align-items-center gap-1 px-3 py-2">
        <Icon size={12} /> {text}
      </Badge>
    );
  };

  const progress = Math.min((earnings.available_balance / earnings.total_earned) * 100, 100);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Payouts & Withdrawals</h4>
            <p style={{ color: '#6b7280', margin: 0 }}>Manage your earnings and withdraw funds</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              variant="outline-primary" 
              onClick={() => fetchData(true)} 
              disabled={refreshing}
            >
              <FaSync className={refreshing ? 'spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaMoneyBillWave className="me-2" /> Request Withdrawal
            </Button>
          </div>
        </div>

        {/* Earnings Summary Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Earned</h6>
                    <h3 className="mb-0">{formatCurrency(earnings.total_earned)}</h3>
                    <small className="text-muted">Lifetime earnings</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FaWallet className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Available Balance</h6>
                    <h3 className="mb-0 text-success">{formatCurrency(earnings.available_balance)}</h3>
                    <small className="text-muted">Ready to withdraw</small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <FaMoneyBillWave className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Pending Earnings</h6>
                    <h3 className="mb-0 text-warning">{formatCurrency(earnings.pending_earnings)}</h3>
                    <small className="text-muted">Awaiting clearance</small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <FaClock className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Total Withdrawn</h6>
                    <h3 className="mb-0 text-info">{formatCurrency(earnings.total_withdrawn)}</h3>
                    <small className="text-muted">Successfully withdrawn</small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <FaUniversity className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Row */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Success Rate</h6>
                    <h3 className="mb-0">{stats.successRate}%</h3>
                    <small className="text-muted">Approved withdrawals</small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <FaChartLine className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Average Withdrawal</h6>
                    <h3 className="mb-0">{formatCurrency(stats.averageWithdrawal)}</h3>
                    <small className="text-muted">Per successful request</small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <FaMoneyBillWave className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">Last Withdrawal</h6>
                    <h3 className="mb-0" style={{ fontSize: '18px' }}>
                      {stats.lastWithdrawal ? formatDate(stats.lastWithdrawal) : 'N/A'}
                    </h3>
                    <small className="text-muted">Most recent request</small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <FaCalendarAlt className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Withdrawal Progress */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-1">Withdrawal Progress</h6>
                <small className="text-muted">
                  {formatCurrency(earnings.withdrawn || 0)} of {formatCurrency(earnings.total_earned)} withdrawn
                </small>
              </div>
              <span className="fw-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
              <div 
                className="progress-bar bg-success" 
                style={{ width: `${progress}%`, borderRadius: '4px' }}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Withdrawal History */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">Withdrawal History</h6>
              <p className="text-muted small mb-0 mt-1">Track your withdrawal requests</p>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none"
              onClick={() => fetchData(true)}
            >
              <FaSync size={12} className="me-1" /> Refresh
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            {withdrawals.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaHistory size={40} className="mb-3" />
                <p>No withdrawal requests yet</p>
                <Button variant="outline-primary" size="sm" onClick={() => setShowModal(true)}>
                  Request Your First Withdrawal
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Bank</th>
                      <th>Account</th>
                      <th>Status</th>
                      <th>Reference</th>
                      </tr>
                    </thead>
                  <tbody>
                    {withdrawals.map((w, index) => (
                      <motion.tr
                        key={w.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td style={{ padding: '16px' }}>
                          <FaCalendarAlt className="me-2 text-muted" size={12} />
                          {formatDate(w.created_at)}
                        </td>
                        <td className="fw-bold">{formatCurrency(w.amount)}</td>
                        <td>{w.bank_name}</td>
                        <td>{w.account_number}</td>
                        <td>{getStatusBadge(w.status)}</td>
                        <td>
                          <code className="small">{w.reference?.slice(0, 12)}...</code>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          {withdrawals.length > 0 && (
            <Card.Footer className="bg-white border-0 py-3 text-muted">
              Showing {withdrawals.length} withdrawal requests
            </Card.Footer>
          )}
        </Card>
      </div>

      {/* Withdrawal Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Available Balance:</strong> {formatCurrency(earnings.available_balance)}
                <br />
                <small>Minimum withdrawal: ₦1,000</small>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => fetchData()}
                className="text-info p-0"
              >
                <FaSync size={12} className="me-1" /> Refresh
              </Button>
            </div>
          </Alert>
          
          {error && (
            <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Amount (₦)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              max={earnings.available_balance}
            />
            <Form.Text className="text-muted">
              Minimum: ₦1,000
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Bank</Form.Label>
            <Form.Select 
              value={bankCode} 
              onChange={(e) => {
                const selected = banks.find(b => b.code === e.target.value);
                setBankCode(e.target.value);
                setBankName(selected?.name || '');
                setAccountName('');
              }}
            >
              <option value="">Select Bank</option>
              {banks.map(bank => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setAccountName('');
                }}
                maxLength="10"
              />
              <Button 
                variant="outline-primary" 
                onClick={verifyAccount} 
                disabled={verifying || !accountNumber || !bankCode}
              >
                {verifying ? <FaSpinner className="spin" /> : 'Verify'}
              </Button>
            </div>
            <Form.Text className="text-muted">
              Enter a valid 10-digit account number
            </Form.Text>
          </Form.Group>
          
          {accountName && (
            <Alert variant="success" className="mt-3">
              <FaCheckCircle className="me-2" />
              <strong>Account Name:</strong> {accountName}
            </Alert>
          )}
          
          <Alert variant="warning" className="mt-3">
            <FaClock className="me-2" />
            <small>Withdrawal requests are processed within 1-3 business days after approval.</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={requestWithdrawal} 
            disabled={loading || !accountName || !amount || parseFloat(amount) < 1000 || parseFloat(amount) > earnings.available_balance}
          >
            {loading ? (
              <>
                <FaSpinner className="spin me-2" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
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
        
        .progress {
          background-color: #e9ecef;
        }
        
        .progress-bar {
          transition: width 0.3s ease;
        }
      `}</style>
    </DashboardLayout>
  );
}

export default VendorPayouts;