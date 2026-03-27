import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { 
  FaHandsHelping, FaCheckCircle, FaHeart, FaUserGraduate, FaSeedling, 
  FaChartLine, FaQuoteLeft, FaHandHoldingHeart, FaExternalLinkAlt 
} from 'react-icons/fa';

function Charity() {
  const [showModal, setShowModal] = useState({ type: null, id: null });

  // Initiative details (for modals)
  const initiativeDetails = {
    school: {
      title: 'School Supply Drive',
      fullDescription: 'Our School Supply Drive provides essential learning materials, uniforms, and books to children in underserved communities across Lagos and rural areas. We partner with local schools and community leaders to identify families in need. In 2025 alone, we distributed over 5,000 backpacks, 10,000 notebooks, and 2,000 school uniforms. Your support ensures that no child is left behind.',
      impact: '1,200+ students reached this year',
      getInvolved: 'Donate ₦5,000 to sponsor a child’s school supplies for a full year.',
    },
    tech: {
      title: 'Women in Tech',
      fullDescription: 'We sponsor coding bootcamps, mentorship programs, and tech scholarships for young women in rural Nigeria. Our goal is to close the gender gap in technology and create pathways to economic independence. Graduates have gone on to work as software developers, data analysts, and tech entrepreneurs. In partnership with local tech hubs, we’ve trained over 300 women in the past two years.',
      impact: '85% of graduates employed in tech within 6 months',
      getInvolved: 'Sponsor a student for ₦50,000 for a full bootcamp.',
    },
    farm: {
      title: 'Farm to Market',
      fullDescription: 'We help small‑scale farmers sell their produce through our platform, ensuring fair prices and direct market access. By cutting out middlemen, farmers earn up to 40% more. We also provide agricultural training, access to quality seeds, and market insights. Currently, we work with over 200 farmers across Nigeria, helping them sell cassava, yams, vegetables, and grains.',
      impact: 'Farmers’ income increased by 35% on average',
      getInvolved: 'Support a farmer for ₦10,000 (covers seeds and tools).',
    },
  };

  // Partners data with working image URLs
  const partners = [
    {
      name: 'The Education Trust Africa',
      logo: 'https://placehold.co/120x60/4CAF50/white?text=Education+Trust',
      description: 'A non‑profit dedicated to improving educational outcomes for children across Nigeria through infrastructure, scholarships, and teacher training.',
      website: 'https://educationtrust.ng',
    },
    {
      name: 'TechHer Nigeria',
      logo: 'https://placehold.co/120x60/2196F3/white?text=TechHer',
      description: 'Empowering women and girls with digital skills, advocacy for safe online spaces, and technology innovation.',
      website: 'https://techher.org',
    },
    {
      name: 'Farmers Hub Cooperative',
      logo: 'https://placehold.co/120x60/FF9800/white?text=Farmers+Hub',
      description: 'A cooperative of small‑scale farmers that provides training, market access, and fair trade practices across West Africa.',
      website: 'https://farmershub.ng',
    },
    {
      name: 'Lagos Food Bank Initiative',
      logo: 'https://placehold.co/120x60/E91E63/white?text=Lagos+Food+Bank',
      description: 'Fighting hunger and malnutrition through sustainable food support and community outreach programmes.',
      website: 'https://lagosfoodbank.org',
    },
  ];

  // Stats data
  const stats = [
    { icon: FaHeart, value: '5,000+', label: 'Families Supported' },
    { icon: FaUserGraduate, value: '1,200+', label: 'Students Empowered' },
    { icon: FaSeedling, value: '45', label: 'Community Projects' },
    { icon: FaChartLine, value: '₦25M+', label: 'Funds Raised' },
  ];

  // Initiatives
  const initiatives = [
    {
      id: 'school',
      icon: FaUserGraduate,
      title: 'School Supply Drive',
      description: 'Providing books, uniforms, and school materials to underprivileged children in Lagos and rural communities.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
    },
    {
      id: 'tech',
      icon: FaHeart,
      title: 'Women in Tech',
      description: 'Sponsoring coding bootcamps and mentorship programs for young women in rural Nigeria.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
    },
    {
      id: 'farm',
      icon: FaSeedling,
      title: 'Farm to Market',
      description: 'Helping small‑scale farmers sell their produce through our platform, ensuring fair prices and market access.',
      image: 'https://images.unsplash.com/photo-1523348837708-15b4ad09c5d0?w=600',
    },
  ];

  // Gallery images
  const galleryImages = [
    'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=400',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400',
    'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "Thanks to MarketStore's School Supply Drive, my children now have the books they need to succeed in school. I'm so grateful!",
      name: "Amina Bello",
      role: "Mother, Lagos",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      quote: "The Women in Tech program changed my life. I'm now a software developer and mentor other girls in my community.",
      name: "Chiamaka Okafor",
      role: "Graduate, Women in Tech",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  ];

  // Modal handlers
  const openInitiativeModal = (id) => {
    setShowModal({ type: 'initiative', id });
  };
  const openPartnerModal = (name, description, website) => {
    setShowModal({ type: 'partner', name, description, website });
  };
  const closeModal = () => setShowModal({ type: null, id: null, name: null, description: null, website: null });

  // Donate / Volunteer handlers
  const handleDonate = () => {
    toast.success('Donation page coming soon! Stay tuned.');
  };
  const handleVolunteer = () => {
    toast.success('Volunteer sign‑up will be available soon!');
  };

  return (
    <>
      <style>{`
        .charity-hero {
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: white;
          padding: 100px 0;
          text-align: center;
        }
        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .initiative-card {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .initiative-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .initiative-img {
          transition: transform 0.5s ease;
        }
        .initiative-card:hover .initiative-img {
          transform: scale(1.05);
        }
        .gallery-img {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        .gallery-img:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .testimonial-card {
          background: #f8f9fa;
          border: none;
          transition: transform 0.3s ease;
        }
        .testimonial-card:hover {
          transform: translateY(-5px);
        }
        .partner-logo {
          filter: grayscale(100%);
          opacity: 0.6;
          transition: all 0.3s ease;
          cursor: pointer;
          max-height: 60px;
          width: auto;
          object-fit: contain;
        }
        .partner-logo:hover {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .charity-hero {
            padding: 60px 0;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="charity-hero">
        <Container>
          <h1 className="display-3 fw-bold mb-3">MarketStore Cares</h1>
          <p className="lead mb-4">Empowering African communities through commerce and giving back.</p>
          <Button variant="light" size="lg" onClick={handleDonate} className="rounded-pill px-4 py-2">
            <FaHandHoldingHeart className="me-2" /> Donate Now
          </Button>
        </Container>
      </div>

      <Container className="py-5">
        {/* Stats Section */}
        <Row className="g-4 mb-5">
          {stats.map((stat, idx) => (
            <Col md={3} key={idx}>
              <Card className="border-0 shadow-sm stat-card h-100 text-center">
                <Card.Body className="p-4">
                  <stat.icon size={40} className="text-primary mb-3" />
                  <h2 className="display-5 fw-bold mb-0">{stat.value}</h2>
                  <p className="text-muted mt-2">{stat.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Our Story / Impact Statement */}
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <h2 className="display-6 fw-bold mb-3">Every Purchase Makes a Difference</h2>
            <p className="lead">
              At MarketStore, we believe that commerce can be a force for good. We partner with local charities across Nigeria and Africa to support education, healthcare, and economic empowerment. With every sale, we donate a percentage to initiatives that matter.
            </p>
            <p>
              Since our founding, we've helped over 5,000 families, built schools in rural communities, and provided technology training to young women. Our commitment to social impact is at the heart of everything we do.
            </p>
          </Col>
          <Col lg={6}>
            <Image 
              src="https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800" 
              alt="Community support" 
              fluid 
              rounded 
              className="shadow-lg"
            />
          </Col>
        </Row>

        {/* Initiatives Section */}
        <h2 className="display-6 fw-bold text-center mb-4">Our Current Initiatives</h2>
        <Row className="g-4 mb-5">
          {initiatives.map((init) => (
            <Col md={4} key={init.id}>
              <Card className="border-0 shadow-sm initiative-card h-100">
                <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                  <Card.Img 
                    variant="top" 
                    src={init.image} 
                    className="initiative-img" 
                    style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                  />
                </div>
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <init.icon size={30} className="text-primary me-2" />
                    <Card.Title className="h5 mb-0">{init.title}</Card.Title>
                  </div>
                  <Card.Text className="text-muted">{init.description}</Card.Text>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => openInitiativeModal(init.id)}
                  >
                    Learn More →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Impact Gallery */}
        <h2 className="display-6 fw-bold text-center mb-4">Impact in Pictures</h2>
        <Row className="g-3 mb-5">
          {galleryImages.map((img, idx) => (
            <Col md={3} key={idx}>
              <Image 
                src={img} 
                fluid 
                rounded 
                className="gallery-img w-100"
                style={{ height: '200px', objectFit: 'cover' }}
              />
            </Col>
          ))}
        </Row>

        {/* Partner Logos */}
        <h2 className="display-6 fw-bold text-center mb-4">Our Partners</h2>
        <Row className="justify-content-center align-items-center g-4 mb-5">
          {partners.map((partner, idx) => (
            <Col xs={6} md={3} key={idx} className="text-center">
              <Image 
                src={partner.logo} 
                fluid 
                className="partner-logo" 
                style={{ maxHeight: '60px', width: 'auto' }}
                onClick={() => openPartnerModal(partner.name, partner.description, partner.website)}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"%3E%3Crect width="120" height="60" fill="%23cccccc"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666"%3EPartner%3C/text%3E%3C/svg%3E';
                }}
              />
              <p className="small text-muted mt-2">{partner.name}</p>
            </Col>
          ))}
        </Row>

        {/* Testimonials */}
        <h2 className="display-6 fw-bold text-center mb-4">Stories of Change</h2>
        <Row className="g-4 mb-5">
          {testimonials.map((test, idx) => (
            <Col md={6} key={idx}>
              <Card className="testimonial-card h-100">
                <Card.Body className="p-4">
                  <div className="d-flex mb-3">
                    <FaQuoteLeft size={30} className="text-primary me-3" />
                    <div>
                      <p className="lead mb-3">"{test.quote}"</p>
                      <div className="d-flex align-items-center">
                        <Image src={test.image} roundedCircle width="50" height="50" className="me-3" />
                        <div>
                          <h6 className="mb-0">{test.name}</h6>
                          <small className="text-muted">{test.role}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to Action */}
        <div className="text-center bg-light p-5 rounded-4 shadow-sm">
          <h2 className="display-6 fw-bold mb-3">Join Us in Making a Difference</h2>
          <p className="lead mb-4">Your support helps us reach more communities and create lasting change.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button variant="primary" size="lg" onClick={handleDonate} className="rounded-pill px-4">
              <FaHandHoldingHeart className="me-2" /> Donate
            </Button>
            <Button variant="outline-primary" size="lg" onClick={handleVolunteer} className="rounded-pill px-4">
              Volunteer
            </Button>
          </div>
          <p className="text-muted mt-4">Or simply shop with us – every purchase helps!</p>
        </div>
      </Container>

      {/* Initiative Modal */}
      <Modal show={showModal.type === 'initiative'} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {showModal.id && initiativeDetails[showModal.id]?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal.id && (
            <>
              <p className="lead">{initiativeDetails[showModal.id]?.fullDescription}</p>
              <div className="bg-light p-3 rounded mt-3">
                <strong>Impact:</strong> {initiativeDetails[showModal.id]?.impact}
              </div>
              <div className="bg-light p-3 rounded mt-3">
                <strong>How to get involved:</strong> {initiativeDetails[showModal.id]?.getInvolved}
              </div>
              <div className="mt-4">
                <Button variant="primary" onClick={handleDonate} className="me-2">
                  Donate to this cause
                </Button>
                <Button variant="outline-primary" onClick={closeModal}>
                  Close
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Partner Modal */}
      <Modal show={showModal.type === 'partner'} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{showModal.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{showModal.description}</p>
          {showModal.website && (
            <Button variant="outline-primary" href={showModal.website} target="_blank" rel="noopener noreferrer">
              Visit Website <FaExternalLinkAlt className="ms-2" size={12} />
            </Button>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Charity;