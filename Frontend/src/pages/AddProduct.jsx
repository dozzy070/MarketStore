import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaUpload, 
  FaSave, 
  FaTimes, 
  FaBox, 
  FaDollarSign, 
  FaTag, 
  FaImage, 
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { productAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

function AddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [categoriesError, setCategoriesError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock_quantity: '',
    published: true
  });

  // Mock categories in case API fails
  const mockCategories = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Fashion' },
    { id: '3', name: 'Home & Living' },
    { id: '4', name: 'Sports' },
    { id: '5', name: 'Beauty' },
    { id: '6', name: 'Books' }
  ];

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      setCategoriesError(null);
      const response = await categoryAPI.getCategories();
      console.log('Categories API response:', response.data);
      
      // Handle different response formats
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else {
        console.warn('Unexpected categories format, using mock data');
        categoriesData = mockCategories;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategoriesError('Could not load categories from server');
      // Use mock categories as fallback
      setCategories(mockCategories);
      toast.error('Using offline categories');
    }
  };

  const fetchProduct = async () => {
    setFetchLoading(true);
    try {
      const response = await productAPI.getProduct(id);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity || '',
        published: product.published !== false
      });

      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product data');
      navigate('/products');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.stock_quantity && (isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity) < 0)) {
      newErrors.stock_quantity = 'Please enter a valid stock quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity) || 0);
      formDataToSend.append('published', formData.published);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (isEditMode) {
        response = await productAPI.updateProduct(id, formDataToSend);
        toast.success('Product updated successfully!');
      } else {
        response = await productAPI.createProduct(formDataToSend);
        toast.success('Product added successfully!');
      }

      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (error) {
      console.error('Failed to save product:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to save product. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (fetchLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading product data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Safely check if categories is array before using map
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  return (
    <DashboardLayout>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h4 className="mb-4">{isEditMode ? 'Edit Product' : 'Add New Product'}</h4>

              {/* Categories Error Alert */}
              {categoriesError && (
                <Alert variant="warning" className="mb-4">
                  <FaExclamationTriangle className="me-2" />
                  {categoriesError} - Using offline categories
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert variant="success" className="mb-4">
                  <FaCheckCircle className="me-2" />
                  Product {isEditMode ? 'updated' : 'added'} successfully! Redirecting...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Product Image */}
                <Form.Group className="mb-4">
                  <Form.Label>Product Image</Form.Label>
                  <div 
                    className="border rounded-3 p-4 text-center"
                    style={{ 
                      background: '#f8f9fa',
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('imageInput').click()}
                  >
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        fluid 
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <>
                        <FaUpload size={40} className="text-muted mb-2" />
                        <p className="text-muted mb-0">Click to upload image</p>
                        <small className="text-muted">PNG, JPG up to 5MB</small>
                      </>
                    )}
                    <Form.Control
                      id="imageInput"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                  </div>
                </Form.Group>

                {/* Product Name */}
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="e.g., Wireless Headphones"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Category and Price Row */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        isInvalid={!!errors.category_id}
                        required
                      >
                        <option value="">Select a category</option>
                        {hasCategories ? (
                          categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          // Fallback options if categories array is empty
                          mockCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} (offline)
                            </option>
                          ))
                        )}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>₦</InputGroup.Text>
                        <Form.Control
                          type="number"
                          name="price"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleChange}
                          isInvalid={!!errors.price}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.price}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Stock Quantity */}
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_quantity"
                    placeholder="0"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    isInvalid={!!errors.stock_quantity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.stock_quantity}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-4">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    rows={4}
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={handleChange}
                    isInvalid={!!errors.description}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Published Status */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="switch"
                    id="published-switch"
                    name="published"
                    label="Publish product immediately"
                    checked={formData.published}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Form Actions */}
                <div className="d-flex gap-3">
                  <Button 
                    variant="secondary" 
                    className="flex-grow-1"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <FaTimes className="me-2" /> Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-grow-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        {isEditMode ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default AddProduct;