import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaImage,
  FaSave,
  FaTimes,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);
    
    try {
      console.log('Fetching categories...');
      
      let categoriesData = [];
      
      try {
        const response = await categoryAPI.getCategories();
        console.log('Categories API response:', response);
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data;
          } else if (response.data.categories && Array.isArray(response.data.categories)) {
            categoriesData = response.data.categories;
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Don't use mock data - just set empty array
        categoriesData = [];
      }
      
      setCategories(categoriesData);
      
      if (showToast) {
        if (categoriesData.length === 0) {
          toast('No categories found', { icon: '📁' });
        } else {
          toast.success('Categories refreshed');
        }
      }
      
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories. Please try again.');
      if (showToast) toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      if (editing) {
        await categoryAPI.updateCategory(editing.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.createCategory(formData);
        toast.success('Category created successfully');
      }
      
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', description: '', image_url: '' });
      await fetchCategories();
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category? Products in this category will become uncategorized.')) {
      try {
        await categoryAPI.deleteCategory(id);
        toast.success('Category deleted');
        await fetchCategories();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const placeholderImage = () => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3E%3Crect width='300' height='150' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E`;
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Categories</h4>
          <p className="text-muted mb-0">Manage product categories</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
          >
            <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" onClick={() => {
            setEditing(null);
            setFormData({ name: '', description: '', image_url: '' });
            setShowModal(true);
          }}>
            <FaPlus className="me-2" /> New Category
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <FaExclamationTriangle className="me-2" /> {error}
        </Alert>
      )}

      <Row className="g-4">
        {categories.length === 0 ? (
          <Col md={12}>
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <FaImage size={40} className="text-muted mb-3" />
                <h5>No categories found</h5>
                <p className="text-muted mb-3">Create your first category to organize products</p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  <FaPlus className="me-2" /> Create First Category
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          categories.map(category => (
            <Col key={category.id} md={4}>
              <Card className="border-0 shadow-sm h-100 category-card">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={category.image_url || placeholderImage()} 
                    style={{ height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImage();
                    }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge bg="primary">{category.product_count || 0} products</Badge>
                  </div>
                </div>
                <Card.Body>
                  <Card.Title>{category.name}</Card.Title>
                  <Card.Text className="text-muted small">
                    {category.description || 'No description'}
                  </Card.Text>
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      onClick={() => {
                        setEditing(category);
                        setFormData({
                          name: category.name,
                          description: category.description || '',
                          image_url: category.image_url || ''
                        });
                        setShowModal(true);
                      }}
                    >
                      <FaEdit /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      onClick={() => handleDelete(category.id)}
                    >
                      <FaTrash /> Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Category Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Category' : 'Create New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Electronics"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe this category..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Form.Text className="text-muted">
                    Provide a URL for the category image (optional)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={5}>
                <div className="border rounded-3 p-3 text-center bg-light" style={{ minHeight: '200px' }}>
                  <Form.Label className="text-muted">Image Preview</Form.Label>
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Preview"
                      style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }}
                      className="mt-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImage();
                        e.target.style.objectFit = 'cover';
                      }}
                    />
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center mt-4">
                      <FaImage size={48} className="text-muted mb-2" />
                      <p className="text-muted small mb-0">No image preview</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              <FaTimes /> Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaSave /> {editing ? 'Update Category' : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .category-card {
          transition: all 0.3s ease;
        }
        
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default AdminCategories;