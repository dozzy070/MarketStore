import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaQuestionCircle } from 'react-icons/fa';

function FAQ() {
  const [search, setSearch] = useState('');

  const faqs = [
    {
      category: 'Account',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on the "Register" button in the top right corner and fill in your details. You\'ll receive a verification email to complete the registration.'
        },
        {
          q: 'How do I reset my password?',
          a: 'Click on "Forgot Password" on the login page and enter your email address. You\'ll receive a link to reset your password.'
        },
        {
          q: 'Can I change my email address?',
          a: 'Yes, you can change your email in your account settings. You\'ll need to verify the new email address.'
        }
      ]
    },
    {
      category: 'Orders',
      questions: [
        {
          q: 'How do I track my order?',
          a: 'Log into your account and go to "My Orders". Click on the order you want to track to see its current status and tracking information.'
        },
        {
          q: 'Can I cancel my order?',
          a: 'Orders can be cancelled within 1 hour of placing them. After that, please contact customer support.'
        },
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.'
        }
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept bank transfers, card payments (Visa, Mastercard), PayPal, and mobile money.'
        },
        {
          q: 'Is it safe to save my card details?',
          a: 'Yes, we use industry-standard encryption to protect your payment information.'
        },
        {
          q: 'When will I be charged?',
          a: 'Your payment method will be charged immediately when you place an order.'
        }
      ]
    },
    {
      category: 'Returns',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy for most items. Products must be unused and in original packaging.'
        },
        {
          q: 'How do I return an item?',
          a: 'Go to "My Orders", select the item you want to return, and follow the return instructions.'
        },
        {
          q: 'How long do refunds take?',
          a: 'Refunds are processed within 5-7 business days after we receive the returned item.'
        }
      ]
    },
    {
      category: 'Vendors',
      questions: [
        {
          q: 'How do I become a vendor?',
          a: 'Click on "Sell on MarketStore" in the footer and complete the vendor registration form.'
        },
        {
          q: 'What are the vendor fees?',
          a: 'We charge a 5% commission on each sale. There are no monthly fees.'
        },
        {
          q: 'How do I get paid?',
          a: 'Vendor payouts are processed weekly via bank transfer to your registered account.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(search.toLowerCase()) || 
           q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Frequently Asked Questions</h1>
        <p className="lead text-muted mb-4">Find answers to common questions</p>
        
        <div className="mx-auto" style={{ maxWidth: '600px' }}>
          <InputGroup size="lg">
            <InputGroup.Text className="bg-white border-0">
              <FaSearch className="text-primary" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-sm py-3"
            />
          </InputGroup>
        </div>
      </div>

      {filteredFaqs.map((category, idx) => (
        <Card key={idx} className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-0 pt-4">
            <h4 className="mb-0">{category.category}</h4>
          </Card.Header>
          <Card.Body>
            <Accordion defaultActiveKey="0">
              {category.questions.map((faq, index) => (
                <Accordion.Item key={index} eventKey={index.toString()}>
                  <Accordion.Header>
                    <FaQuestionCircle className="text-primary me-2" />
                    {faq.q}
                  </Accordion.Header>
                  <Accordion.Body className="text-muted">
                    {faq.a}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card.Body>
        </Card>
      ))}

      {filteredFaqs.length === 0 && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <h5>No FAQs found</h5>
            <p className="text-muted">Try adjusting your search terms</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default FAQ;
