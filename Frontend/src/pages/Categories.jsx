import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { categoryService } from '../services/categoryService';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [search, categories]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categories-page py-5">
      <Container>
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Shop by Category</h1>
          <p className="lead text-muted">
            Browse thousands of products across {categories.length} categories
          </p>
        </div>

        {/* Search Bar */}
        <div className="d-flex justify-content-center mb-5">
          <InputGroup style={{ maxWidth: '500px' }}>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Categories Grid */}
        <Row className="g-4">
          {filteredCategories.map((category, index) => (
            <Col key={category.id} lg={3} md={4} sm={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link to={`/category/${category.id}`} className="text-decoration-none">
                  <Card className="border-0 shadow-sm h-100 category-card">
                    <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                      <Card.Img 
                        variant="top" 
                        src={category.image_url || categoryService.getCategoryImage(category.name)}
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-20" />
                      <div className="position-absolute bottom-0 start-0 p-4 text-white">
                        <h5 className="mb-2">{category.name}</h5>
                        <p className="small mb-3 opacity-75">
                          {category.description?.substring(0, 60)}...
                        </p>
                        <Button variant="light" size="sm">
                          Browse <FaArrowRight className="ms-2" size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* No Results */}
        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-5">
            <h5>No categories found</h5>
            <p className="text-muted">Try a different search term</p>
          </div>
        )}
      </Container>

      <style jsx="true">{`
        .category-card {
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important;
        }
        .category-card img {
          transition: transform 0.5s;
        }
        .category-card:hover img {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

export default Categories;