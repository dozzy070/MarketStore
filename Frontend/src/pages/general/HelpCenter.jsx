// frontend/src/pages/HelpCenter.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaQuestionCircle, 
  FaHeadset, 
  FaFileAlt, 
  FaTruck, 
  FaUndo, 
  FaCreditCard,
  FaUser,
  FaStore,
  FaEnvelope,
  FaPhone,
  FaComment,
  FaTimes,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaRobot,
  FaUserCircle,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import toast from 'react-hot-toast';

function HelpCenter() {
  const navigate = useNavigate();
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! 👋 Welcome to MarketStore Support. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quick reply options
  const quickReplies = [
    { text: 'Order Status', action: 'order' },
    { text: 'Return Policy', action: 'return' },
    { text: 'Shipping Info', action: 'shipping' },
    { text: 'Account Help', action: 'account' },
    { text: 'Vendor Questions', action: 'vendor' },
    { text: 'Payment Issues', action: 'payment' }
  ];

  // Bot responses based on user input
  const getBotResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('order') || msg.includes('track')) {
      return "📦 To track your order:\n1. Go to 'My Orders' in your dashboard\n2. Click on the order you want to track\n3. You'll see the tracking number and status\n\nWould you like me to help you with anything else?";
    }
    else if (msg.includes('return') || msg.includes('refund')) {
      return "🔄 Return Policy:\n- 30-day return window\n- Items must be unused and in original packaging\n- Free return shipping for defective items\n- Refunds processed within 5-7 business days\n\nNeed to start a return? I can help you with that!";
    }
    else if (msg.includes('shipping') || msg.includes('delivery')) {
      return "🚚 Shipping Information:\n- Free shipping on orders over ₦50,000\n- Standard delivery: 3-5 business days\n- Express delivery: 1-2 business days\n- International shipping available\n\nWould you like to know shipping cost for your location?";
    }
    else if (msg.includes('account') || msg.includes('login') || msg.includes('profile')) {
      return "👤 Account Help:\n- Forgot password? Click 'Forgot Password' on login page\n- Update profile in Settings\n- Change email/password in Security settings\n- Need to verify your account? Let me know!\n\nHow can I assist you with your account?";
    }
    else if (msg.includes('vendor') || msg.includes('sell')) {
      return "🏪 Vendor Information:\n- Become a vendor: Click 'Become a Vendor' in your profile\n- Commission: 5% per sale\n- Payouts: Weekly to your bank account\n- Need help with products? Our vendor support team is ready!\n\nWould you like to start your vendor application?";
    }
    else if (msg.includes('payment') || msg.includes('pay') || msg.includes('card')) {
      return "💳 Payment Support:\n- We accept: Credit/Debit Cards, Bank Transfer, PayPal\n- Secure encrypted payments\n- Failed payment? Check card details or try another method\n- Refunds processed within 5-7 business days\n\nNeed help with a specific payment issue?";
    }
    else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! 😊 I'm your MarketStore support assistant. How can I help you today? You can ask about orders, returns, shipping, or any other questions!";
    }
    else if (msg.includes('thank')) {
      return "You're welcome! 😊 Is there anything else I can help you with?";
    }
    else {
      return "Thank you for reaching out! 📧 For more detailed assistance:\n\n• Email: support@marketstore.com\n• Phone: +234 800 000 0000\n• Live chat with a human agent (click above)\n\nIs there anything specific I can help you with?";
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: newMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(newMessage);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (action) => {
    const messages = {
      order: "I need help tracking my order",
      return: "What's your return policy?",
      shipping: "Tell me about shipping",
      account: "I need help with my account",
      vendor: "I want to become a vendor",
      payment: "I'm having payment issues"
    };
    setNewMessage(messages[action]);
    handleSendMessage();
  };

  const handleStartChat = () => {
    setShowChatModal(true);
  };

  const helpCategories = [
    {
      icon: <FaUser size={30} />,
      title: 'Account Help',
      description: 'Managing your account, login issues, and profile settings',
      path: '/help/account',
      color: 'primary'
    },
    {
      icon: <FaTruck size={30} />,
      title: 'Orders & Shipping',
      description: 'Track orders, shipping information, and delivery updates',
      path: '/help/orders',
      color: 'success'
    },
    {
      icon: <FaUndo size={30} />,
      title: 'Returns & Refunds',
      description: 'Return policy, refund process, and exchanges',
      path: '/help/returns',
      color: 'warning'
    },
    {
      icon: <FaCreditCard size={30} />,
      title: 'Payments',
      description: 'Payment methods, billing issues, and security',
      path: '/help/payments',
      color: 'info'
    },
    {
      icon: <FaStore size={30} />,
      title: 'Vendor Help',
      description: 'For sellers: managing your store and products',
      path: '/help/vendor',
      color: 'danger'
    },
    {
      icon: <FaFileAlt size={30} />,
      title: 'Policies',
      description: 'Terms of service, privacy policy, and guidelines',
      path: '/help/policies',
      color: 'secondary'
    }
  ];

  const handleLearnMore = (path) => {
    navigate(path);
  };

  return (
    <DashboardLayout>
      <Container className="py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">How can we help you?</h1>
          <p className="lead text-muted">
            Search our help center or browse popular topics below
          </p>
        </div>

        {/* Help Categories */}
        <Row className="g-4 mb-5">
          {helpCategories.map((category, index) => (
            <Col key={index} lg={4} md={6}>
              <Card className="border-0 shadow-sm h-100 help-card">
                <Card.Body className="p-4 text-center">
                  <div className={`bg-${category.color} bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3`}>
                    <div className={`text-${category.color}`}>
                      {category.icon}
                    </div>
                  </div>
                  <h5 className="mb-3">{category.title}</h5>
                  <p className="text-muted mb-4">{category.description}</p>
                  <Button 
                    onClick={() => handleLearnMore(category.path)}
                    variant={`outline-${category.color}`}
                    className="w-100"
                  >
                    Learn More <FaArrowRight className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Contact Support */}
        <Row className="g-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center h-100 support-card">
              <Card.Body className="p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <FaEnvelope size={30} className="text-primary" />
                </div>
                <h5>Email Support</h5>
                <p className="text-muted mb-3">Get a response within 24 hours</p>
                <Button 
                  variant="link" 
                  className="p-0 text-primary"
                  onClick={() => window.location.href = 'mailto:support@marketstore.com?subject=Support Request'}
                >
                  support@marketstore.com
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center h-100 support-card">
              <Card.Body className="p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <FaPhone size={30} className="text-success" />
                </div>
                <h5>Phone Support</h5>
                <p className="text-muted mb-3">Mon-Fri, 9am - 6pm</p>
                <Button 
                  variant="link" 
                  className="p-0 text-success"
                  onClick={() => window.location.href = 'tel:+2348000000000'}
                >
                  +234 800 000 0000
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center h-100 support-card">
              <Card.Body className="p-4">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <FaComment size={30} className="text-info" />
                </div>
                <h5>Live Chat</h5>
                <p className="text-muted mb-3">Chat with our support team</p>
                <Button 
                  variant="info" 
                  className="text-white"
                  onClick={handleStartChat}
                >
                  Start Chat
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Live Chat Modal */}
      <Modal 
        show={showChatModal} 
        onHide={() => setShowChatModal(false)} 
        size="lg"
        className="chat-modal"
        centered
      >
        <Modal.Header className="bg-primary text-white">
          <div className="d-flex align-items-center">
            <FaHeadset className="me-2" />
            <Modal.Title>MarketStore Support</Modal.Title>
          </div>
          <Button 
            variant="link" 
            className="text-white p-0"
            onClick={() => setShowChatModal(false)}
          >
            <FaTimes />
          </Button>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="chat-messages p-4" style={{ height: '400px', overflowY: 'auto' }}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`message-bubble p-3 rounded-3 ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                  style={{ maxWidth: '80%' }}
                >
                  <div className="d-flex align-items-center mb-1">
                    {msg.type === 'bot' ? (
                      <FaRobot size={16} className="me-2 text-primary" />
                    ) : (
                      <FaUserCircle size={16} className="me-2" />
                    )}
                    <small className={msg.type === 'user' ? 'text-white-50' : 'text-muted'}>
                      {msg.type === 'bot' ? 'Support Bot' : 'You'} • 
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start mb-3">
                <div className="bg-light p-3 rounded-3">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="quick-replies p-3 border-top bg-light">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleQuickReply(reply.action)}
                >
                  {reply.text}
                </Button>
              ))}
            </div>
            
            <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </Button>
              </div>
            </Form>
          </div>
        </Modal.Body>
      </Modal>

      <style>
        {`
          .help-card, .support-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .help-card:hover, .support-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
          }
          
          .chat-modal .modal-content {
            border-radius: 16px;
            overflow: hidden;
          }
          
          .message-bubble {
            word-break: break-word;
            animation: fadeIn 0.3s ease;
          }
          
          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 4px 0;
          }
          
          .typing-indicator span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #6c757d;
            animation: typing 1.4s infinite ease-in-out;
          }
          
          .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
          .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
          
          @keyframes typing {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .message-bubble {
              max-width: 90% !important;
            }
            
            .quick-replies .btn {
              font-size: 12px;
              padding: 4px 8px;
            }
          }
        `}
      </style>
    </DashboardLayout>
  );
}

export default HelpCenter;
