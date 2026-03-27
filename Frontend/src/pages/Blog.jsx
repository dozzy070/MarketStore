import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Image, Badge } from 'react-bootstrap';
import { 
  FaBookOpen, FaSearch, FaFacebook, FaTwitter, FaLinkedin, 
  FaEnvelope, FaUser, FaCalendarAlt, FaTag, FaShareAlt, FaComment 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Full blog posts data (extended for modals)
  const blogPosts = [
    {
      id: 1,
      title: "How Local Artisans Are Redefining African Fashion",
      excerpt: "Meet the designers behind the vibrant Ankara prints you love, and learn how they're blending tradition with modern style.",
      image: "https://images.unsplash.com/photo-1589167731396-9da2d4c649fe?w=800",
      date: "March 15, 2026",
      author: "Amara Okafor",
      category: "Fashion",
      fullContent: `
        The world is finally waking up to the richness of African fashion. From Lagos to London, designers are showcasing Ankara, Adire, and Kente like never before. 
        We sat down with three local artisans who are at the forefront of this movement. 
        <br/><br/>
        <strong>Amina’s Story</strong><br/>
        Amina started her brand in a small Lagos studio, hand-dyeing fabrics using traditional techniques passed down for generations. Today, her pieces are worn by celebrities and featured in international magazines. 
        <br/><br/>
        <strong>The Fusion of Modern and Traditional</strong><br/>
        Young designers are experimenting with cuts, blending Western silhouettes with African prints. The result is a fresh, contemporary look that appeals to a global audience.
        <br/><br/>
        <img src="https://images.unsplash.com/photo-1561287643-2cfe4c6f1f10?w=600" class="img-fluid rounded mb-3" alt="Fashion show" />
        <br/><br/>
        The industry is also embracing sustainability. Many artisans use natural dyes and upcycled materials, making African fashion both beautiful and eco‑conscious. 
        <br/><br/>
        As one designer put it: “Our fabrics tell stories. When you wear them, you carry a piece of African heritage with you.”
      `,
    },
    {
      id: 2,
      title: "The Rise of E‑commerce in Nigeria: Opportunities and Challenges",
      excerpt: "Exploring the booming online marketplace and what it means for vendors and consumers alike.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
      date: "March 10, 2026",
      author: "Chidi Nwosu",
      category: "Business",
      fullContent: `
        Nigeria's e‑commerce sector is growing at an unprecedented rate, driven by increasing internet penetration, mobile payments, and a young, tech‑savvy population. 
        <br/><br/>
        Platforms like MarketStore are empowering small businesses to reach customers beyond their local communities. 
        <br/><br/>
        However, challenges remain: logistics, trust, and payment security are areas where continuous improvement is needed. 
        <br/><br/>
        <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600" class="img-fluid rounded mb-3" alt="E-commerce in Nigeria" />
        <br/><br/>
        Despite these hurdles, the future is bright. Experts predict the market will be worth over $50 billion by 2030, creating jobs and transforming the economy.
      `,
    },
    {
      id: 3,
      title: "5 Tips for Sustainable Shopping in Africa",
      excerpt: "How to make eco‑conscious choices without compromising on style or quality.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      date: "March 5, 2026",
      author: "Fatima Bello",
      category: "Sustainability",
      fullContent: `
        Sustainable shopping isn't just a trend; it's a necessity. Here are five tips to reduce your environmental footprint while still enjoying great products:
        <br/><br/>
        <strong>1. Buy Less, Choose Well</strong> – Invest in high‑quality items that last longer.
        <br/><br/>
        <strong>2. Support Local Artisans</strong> – Reduce shipping emissions by buying from local makers.
        <br/><br/>
        <strong>3. Look for Eco‑friendly Materials</strong> – Cotton, hemp, and recycled materials are great options.
        <br/><br/>
        <img src="https://images.unsplash.com/photo-1542838132-92c5e80c07f9?w=600" class="img-fluid rounded mb-3" alt="Sustainable shopping" />
        <br/><br/>
        <strong>4. Use Reusable Bags</strong> – Avoid single‑use plastics.
        <br/><br/>
        <strong>5. Repair and Reuse</strong> – Mend clothes instead of throwing them away.
        <br/><br/>
        Small changes add up. Together we can make African commerce more sustainable.
      `,
    },
    {
      id: 4,
      title: "The Power of Women Entrepreneurs in West Africa",
      excerpt: "How female founders are driving innovation and creating jobs across the region.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
      date: "February 28, 2026",
      author: "Ngozi Adebayo",
      category: "Empowerment",
      fullContent: `
        From tech startups to agribusiness, women in West Africa are reshaping the business landscape. 
        <br/><br/>
        Meet Nkechi, who founded a solar energy company that provides affordable lighting to rural communities. 
        <br/><br/>
        Then there's Amara, whose online marketplace for handcrafted goods has helped over 500 artisans earn a living. 
        <br/><br/>
        <img src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600" class="img-fluid rounded mb-3" alt="Women entrepreneurs" />
        <br/><br/>
        Despite challenges like access to funding, these women are proving that determination and innovation can overcome any obstacle. Their stories inspire the next generation.
      `,
    },
    {
      id: 5,
      title: "From Farm to Table: The Impact of Digital Platforms",
      excerpt: "How technology is helping farmers get better prices and consumers get fresher food.",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
      date: "February 20, 2026",
      author: "Tunde Ogunlesi",
      category: "Agriculture",
      fullContent: `
        Digital platforms are revolutionising agriculture in Nigeria. Farmers can now sell directly to consumers, cutting out middlemen and earning up to 40% more. 
        <br/><br/>
        MarketStore's Farm to Market initiative connects small‑scale farmers with urban buyers, ensuring fresh produce reaches tables faster. 
        <br/><br/>
        <img src="https://images.unsplash.com/photo-1542838132-92c5e80c07f9?w=600" class="img-fluid rounded mb-3" alt="Farming" />
        <br/><br/>
        The result: farmers thrive, consumers enjoy quality food, and food waste is reduced. It's a win‑win.
      `,
    },
  ];

  // Categories for sidebar
  const categories = [
    "Fashion", "Business", "Sustainability", "Empowerment", "Agriculture", "Technology"
  ];

  // Filter posts based on search
  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal with selected post
  const openModal = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  // Newsletter submission
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      toast.success('Successfully subscribed to our blog newsletter!');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 3000);
    }
  };

  // Social share (simple placeholder)
  const shareOnSocial = (platform, url) => {
    const shareUrl = encodeURIComponent(window.location.href);
    let shareLink = '';
    if (platform === 'facebook') shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    if (platform === 'twitter') shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(selectedPost?.title)}`;
    if (platform === 'linkedin') shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(selectedPost?.title)}`;
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  // Featured post (first one)
  const featuredPost = blogPosts[0];

  return (
    <>
      <style>{`
        .blog-hero {
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 80px 0;
          text-align: center;
        }
        .featured-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          cursor: pointer;
        }
        .featured-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .blog-card {
          transition: all 0.3s ease;
          overflow: hidden;
          cursor: pointer;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1);
        }
        .blog-img {
          transition: transform 0.5s ease;
        }
        .blog-card:hover .blog-img {
          transform: scale(1.05);
        }
        .category-badge {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .category-badge:hover {
          transform: translateX(3px);
          background-color: #0d6efd !important;
          color: white !important;
        }
        @media (max-width: 768px) {
          .blog-hero {
            padding: 60px 0;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="blog-hero">
        <Container>
          <h1 className="display-4 fw-bold mb-3">MarketStore Blog</h1>
          <p className="lead mb-4">Stories, insights, and trends from the heart of African commerce</p>
          <div className="mx-auto" style={{ maxWidth: '500px' }}>
            <InputGroup>
              <InputGroup.Text className="bg-white border-0">
                <FaSearch className="text-primary" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 shadow-sm py-3"
              />
            </InputGroup>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row>
          {/* Main Content */}
          <Col lg={8}>
            {/* Featured Post */}
            <h2 className="h3 fw-bold mb-4">Featured Story</h2>
            <Card className="border-0 shadow-sm mb-5 featured-card" onClick={() => openModal(featuredPost)}>
              <Row className="g-0">
                <Col md={6}>
                  <Card.Img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    style={{ height: '100%', objectFit: 'cover', minHeight: '250px' }}
                  />
                </Col>
                <Col md={6}>
                  <Card.Body className="p-4">
                    <Badge bg="primary" className="mb-2">{featuredPost.category}</Badge>
                    <Card.Title className="h4 fw-bold mb-2">{featuredPost.title}</Card.Title>
                    <Card.Text className="text-muted">{featuredPost.excerpt}</Card.Text>
                    <div className="d-flex align-items-center text-muted small mb-3">
                      <FaUser className="me-1" /> {featuredPost.author}
                      <FaCalendarAlt className="ms-3 me-1" /> {featuredPost.date}
                    </div>
                    <Button variant="primary" size="sm">Read Full Story →</Button>
                  </Card.Body>
                </Col>
              </Row>
            </Card>

            {/* All Posts Grid */}
            <h2 className="h3 fw-bold mb-4">Latest Articles</h2>
            <Row className="g-4">
              {filteredPosts.map(post => (
                <Col md={6} key={post.id}>
                  <Card className="border-0 shadow-sm h-100 blog-card" onClick={() => openModal(post)}>
                    <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                      <Card.Img 
                        variant="top" 
                        src={post.image} 
                        className="blog-img" 
                        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                      />
                    </div>
                    <Card.Body>
                      <Badge bg="secondary" className="mb-2">{post.category}</Badge>
                      <Card.Title className="h5 fw-bold mb-2">{post.title}</Card.Title>
                      <Card.Text className="text-muted small">{post.excerpt}</Card.Text>
                      <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                        <span><FaUser className="me-1" /> {post.author}</span>
                        <span><FaCalendarAlt className="me-1" /> {post.date}</span>
                      </div>
                      <Button variant="link" className="p-0 text-primary">Read more →</Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            {filteredPosts.length === 0 && (
              <div className="text-center py-5">
                <h5>No articles found</h5>
                <p className="text-muted">Try adjusting your search</p>
              </div>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Newsletter */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Subscribe to Our Newsletter</h5>
                <p className="text-muted small">Get the latest blog posts delivered to your inbox.</p>
                {newsletterSubscribed ? (
                  <div className="alert alert-success p-2 text-center small">✅ Thanks for subscribing!</div>
                ) : (
                  <Form onSubmit={handleNewsletterSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="email"
                        placeholder="Your email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">
                      <FaEnvelope className="me-2" /> Subscribe
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>

            {/* Categories */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Categories</h5>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((cat, idx) => (
                    <Badge
                      key={idx}
                      bg="light"
                      text="dark"
                      className="category-badge py-2 px-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSearchTerm(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* About the Blog */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">About This Blog</h5>
                <p className="text-muted small">
                  MarketStore Blog explores the stories, people, and trends shaping African commerce. 
                  From artisan profiles to e‑commerce insights, we bring you content that informs and inspires.
                </p>
                <hr />
                <div className="d-flex justify-content-around">
                  <a href="#" className="text-secondary" onClick={() => window.open('https://facebook.com', '_blank')}><FaFacebook size={20} /></a>
                  <a href="#" className="text-secondary" onClick={() => window.open('https://twitter.com', '_blank')}><FaTwitter size={20} /></a>
                  <a href="#" className="text-secondary" onClick={() => window.open('https://linkedin.com', '_blank')}><FaLinkedin size={20} /></a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Blog Post Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        {selectedPost && (
          <>
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="h4 fw-bold">{selectedPost.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
              <div className="mb-3">
                <Badge bg="primary" className="me-2">{selectedPost.category}</Badge>
                <small className="text-muted"><FaUser className="me-1" /> {selectedPost.author}</small>
                <small className="text-muted ms-3"><FaCalendarAlt className="me-1" /> {selectedPost.date}</small>
              </div>
              <img src={selectedPost.image} alt={selectedPost.title} className="img-fluid rounded mb-4 w-100" style={{ maxHeight: '400px', objectFit: 'cover' }} />
              <div dangerouslySetInnerHTML={{ __html: selectedPost.fullContent }} />
              <hr />
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <span className="text-muted me-2">Share this post:</span>
                  <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => shareOnSocial('facebook')}><FaFacebook /></Button>
                  <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => shareOnSocial('twitter')}><FaTwitter /></Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => shareOnSocial('linkedin')}><FaLinkedin /></Button>
                </div>
                <Button variant="primary" size="sm" onClick={closeModal}>Close</Button>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </>
  );
}

export default Blog;