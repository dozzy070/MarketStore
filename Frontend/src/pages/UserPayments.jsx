// frontend/src/pages/UserPayments.jsx - Standalone Version (No DashboardLayout)
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, ProgressBar } from 'react-bootstrap';
import {
    FaWallet,
    FaHistory,
    FaCreditCard,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaSync,
    FaChartLine,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaArrowLeft
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import toast from 'react-hot-toast';

function UserPayments() {
    const [payments, setPayments] = useState([]);
    const [balance, setBalance] = useState({ balance: 0, total_transactions: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalPaid: 0,
        averagePayment: 0,
        highestPayment: 0,
        lastPayment: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (payments.length > 0) {
            const completedPayments = payments.filter(p => p.status === 'success');
            const totalPaid = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const highestPayment = Math.max(...completedPayments.map(p => p.amount || 0), 0);
            const lastPayment = completedPayments[0]?.created_at || null;

            setStats({
                totalPaid,
                averagePayment: completedPayments.length ? totalPaid / completedPayments.length : 0,
                highestPayment,
                lastPayment
            });
        }
    }, [payments]);

    const fetchData = async (showToast = false) => {
        if (showToast) setRefreshing(true);
        setError('');

        try {
            const [paymentsRes, balanceRes] = await Promise.all([
                paymentAPI.getPaymentHistory().catch(() => ({ data: { success: false, payments: [] } })),
                paymentAPI.getBalance().catch(() => ({ data: { success: false, balance: 0, total_transactions: 0 } }))
            ]);

            if (paymentsRes.data?.success) {
                setPayments(paymentsRes.data.payments || []);
            }

            if (balanceRes.data?.success) {
                setBalance({
                    balance: balanceRes.data.balance || 0,
                    total_transactions: balanceRes.data.total_transactions || 0
                });
            }

            if (showToast) toast.success('Data refreshed');
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load payment data');
            if (showToast) toast.error('Failed to load data');
        } finally {
            setRefreshing(false);
        }
    };

    const handlePaymentSuccess = (payment) => {
        toast.success('Payment successful!');
        fetchData();
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
            success: { bg: 'success', icon: FaCheckCircle, text: 'Success' },
            pending: { bg: 'warning', icon: FaClock, text: 'Pending' },
            failed: { bg: 'danger', icon: FaTimesCircle, text: 'Failed' }
        };
        const { bg, icon: Icon, text } = config[status] || config.pending;
        return (
            <Badge bg={bg} className="d-inline-flex align-items-center gap-1 px-3 py-2">
                <Icon size={12} /> {text}
            </Badge>
        );
    };

    const quickPaymentAmounts = [1000, 5000, 10000, 25000, 50000];
    const targetAmount = 100000;
    const progress = Math.min((balance.balance / targetAmount) * 100, 100);

    return (
        <div style={styles.pageContainer}>
            <Container className="py-4">
                {/* Header with Back Button */}
                <div style={styles.header}>
                    <Link to="/dashboard" style={styles.backLink}>
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <div style={styles.headerActions}>
                        <Button
                            variant="outline-primary"
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                        >
                            <FaSync className={refreshing ? 'spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
                            <FaCreditCard className="me-2" /> Make Payment
                        </Button>
                    </div>
                </div>

                {/* Title */}
                <div style={styles.titleSection}>
                    <h2 style={styles.title}>Payments & Wallet</h2>
                    <p style={styles.subtitle}>Manage your payments and transaction history</p>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
                        {error}
                    </Alert>
                )}

                {/* Stats Row */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h6 className="text-muted mb-1">Total Spent</h6>
                                        <h3 className="mb-0">{formatCurrency(balance.balance)}</h3>
                                        <small className="text-muted">{balance.total_transactions} transactions</small>
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
                                        <h6 className="text-muted mb-1">Average Payment</h6>
                                        <h3 className="mb-0">{formatCurrency(stats.averagePayment)}</h3>
                                        <small className="text-muted">Per transaction</small>
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
                                        <h6 className="text-muted mb-1">Highest Payment</h6>
                                        <h3 className="mb-0">{formatCurrency(stats.highestPayment)}</h3>
                                        <small className="text-muted">Max transaction</small>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                                        <FaChartLine className="text-info" size={24} />
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
                                        <h6 className="text-muted mb-1">Last Payment</h6>
                                        <h3 className="mb-0" style={{ fontSize: '18px' }}>
                                            {stats.lastPayment ? formatDate(stats.lastPayment) : 'N/A'}
                                        </h3>
                                        <small className="text-muted">Most recent</small>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                        <FaCalendarAlt className="text-warning" size={24} />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Spending Goal */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <h6 className="mb-1">Spending Goal</h6>
                                <small className="text-muted">Target: {formatCurrency(targetAmount)}</small>
                            </div>
                            <span className="fw-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <ProgressBar now={progress} variant="primary" style={{ height: '8px', borderRadius: '4px' }} />
                        <div className="d-flex justify-content-between mt-2">
                            <small className="text-muted">{formatCurrency(balance.balance)} spent</small>
                            <small className="text-muted">{formatCurrency(targetAmount - balance.balance)} to go</small>
                        </div>
                    </Card.Body>
                </Card>

                {/* Quick Payment */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <h6 className="mb-3">Quick Payment</h6>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {quickPaymentAmounts.map(amount => (
                                <Button
                                    key={amount}
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedAmount(amount);
                                        setShowPaymentModal(true);
                                    }}
                                >
                                    ₦{amount.toLocaleString()}
                                </Button>
                            ))}
                            <Button
                                variant="link"
                                className="text-decoration-none"
                                onClick={() => setShowPaymentModal(true)}
                            >
                                <FaCreditCard className="me-1" /> Custom Amount
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* Payment History */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Payment History</h6>
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
                        {payments.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FaHistory size={40} className="mb-3" />
                                <p>No payment transactions yet</p>
                                <Button variant="primary" size="sm" onClick={() => setShowPaymentModal(true)}>
                                    Make Your First Payment
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Reference</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Order ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(payment => (
                                            <tr key={payment.id}>
                                                <td>{formatDate(payment.created_at)}</td>
                                                <td>
                                                    <code className="small">{payment.reference?.slice(0, 12)}...</code>
                                                </td>
                                                <td className="fw-bold">{formatCurrency(payment.amount)}</td>
                                                <td>{getStatusBadge(payment.status)}</td>
                                                <td>
                                                    {payment.order_id ? (
                                                        <Badge bg="info">#{payment.order_id}</Badge>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                    {payments.length > 0 && (
                        <Card.Footer className="bg-white border-0 py-3 text-muted">
                            Showing {payments.length} transactions
                        </Card.Footer>
                    )}
                </Card>

                {/* Payment Modal */}
                <PaymentModal
                    show={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedAmount(0);
                    }}
                    amount={selectedAmount}
                    onSuccess={handlePaymentSuccess}
                />
            </Container>

            <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        background: '#f8f9fa'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s'
    },
    headerActions: {
        display: 'flex',
        gap: '12px'
    },
    titleSection: {
        marginBottom: '32px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '8px',
        color: '#1f2937'
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        margin: 0
    }
};

export default UserPayments;