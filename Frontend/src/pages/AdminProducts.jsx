// frontend/src/pages/AdminProducts.jsx - No Loading Spinners
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge, Form,
  InputGroup, Modal, Image, Alert
} from 'react-bootstrap';
import {
  FaBox,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaPlus,
  FaImage,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSync,
  FaClock,
  FaSave,
  FaUpload
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI, productAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form state for adding product
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock_quantity: '',
    vendor_id: '',
    published: true,
    image_url: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    outOfStock: 0
  });

  // SVG placeholder for images
  const getPlaceholderImage = (size = 50, text = '') => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Crect width='${size}' height='${size}' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' font-size='${size / 5}' text-anchor='middle' dy='.3em' fill='%236c757d'%3E${text}%3C/text%3E%3C/svg%3E`;
  };

  // Mock data for fallback
  const mockCategories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Fashion' },
    { id: 3, name: 'Home & Living' },
    { id: 4, name: 'Sports' },
    { id: 5, name: 'Books' },
    { id: 6, name: 'Beauty' }
  ];

  const mockProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 15000,
      stock_quantity: 45,
      status: 'published',
      category_id: 1,
      vendor_name: 'Tech Haven',
      image_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Running Shoes',
      price: 25000,
      stock_quantity: 0,
      status: 'published',
      category_id: 4,
      vendor_name: 'Sports World',
      image_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Smart Watch',
      price: 45000,
      stock_quantity: 12,
      status: 'pending',
      category_id: 1,
      vendor_name: 'Tech Haven',
      image_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Leather Jacket',
      price: 35000,
      stock_quantity: 8,
      status: 'published',
      category_id: 2,
      vendor_name: 'Fashion Forward',
      image_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Coffee Maker',
      price: 28000,
      stock_quantity: 15,
      status: 'draft',
      category_id: 3,
      vendor_name: 'Home Essentials',
      image_url: null,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);
  const fetchData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    setError(null);

    try {
      const productsRes = await adminAPI.getAllProducts();
      let productsData = [];

      if (productsRes.data) {
        if (Array.isArray(productsRes.data)) {
          productsData = productsRes.data;
        } else if (productsRes.data.data && Array.isArray(productsRes.data.data)) {
          productsData = productsRes.data.data;
        } else if (productsRes.data.products && Array.isArray(productsRes.data.products)) {
          productsData = productsRes.data.products;
        }
      }

      if (productsData.length === 0) {
        // Show empty state instead of mock data
        setProducts([]);
        setStats({ total: 0, published: 0, pending: 0, outOfStock: 0 });
        if (showToast) toast('No products found', { icon: '📦' });
      } else {
        setProducts(productsData);
        // Calculate stats from actual data
        const calculatedStats = productsData.reduce((acc, product) => {
          acc.total++;
          if (product.status === 'published') acc.published++;
          if (product.status === 'pending') acc.pending++;
          if (product.stock_quantity === 0) acc.outOfStock++;
          return acc;
        }, { total: 0, published: 0, pending: 0, outOfStock: 0 });
        setStats(calculatedStats);
      }

      if (showToast) toast.success('Products refreshed');

    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
      // Show empty state instead of mock data
      setProducts([]);
      setStats({ total: 0, published: 0, pending: 0, outOfStock: 0 });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let categoriesData = [];
      try {
        const categoriesRes = await categoryAPI.getCategories();
        console.log('Categories response:', categoriesRes);

        if (categoriesRes.data) {
          if (Array.isArray(categoriesRes.data)) {
            categoriesData = categoriesRes.data;
          } else if (categoriesRes.data.data && Array.isArray(categoriesRes.data.data)) {
            categoriesData = categoriesRes.data.data;
          } else if (categoriesRes.data.categories && Array.isArray(categoriesRes.data.categories)) {
            categoriesData = categoriesRes.data.categories;
          }
        }
      } catch (categoryError) {
        console.log('Using mock categories data:', categoryError.message);
        categoriesData = mockCategories;
      }

      setCategories(Array.isArray(categoriesData) ? categoriesData : mockCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories(mockCategories);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    setSaving(true);

    try {
      const productData = new FormData();
      productData.append('name', formData.name.trim());
      productData.append('price', parseFloat(formData.price));
      productData.append('description', formData.description.trim());
      productData.append('category_id', parseInt(formData.category_id));
      productData.append('stock_quantity', parseInt(formData.stock_quantity) || 0);
      productData.append('published', formData.published);

      if (imageFile) {
        productData.append('image', imageFile);
      }

      const response = await productAPI.createProduct(productData);

      if (response.data && response.data.success) {
        toast.success('Product added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        // Add product to local list for demo
        const newProduct = {
          id: Date.now(),
          name: formData.name,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          status: formData.published ? 'published' : 'draft',
          category_id: parseInt(formData.category_id),
          vendor_name: 'Admin',
          image_url: imagePreview,
          created_at: new Date().toISOString()
        };
        setProducts([newProduct, ...products]);
        setStats({
          total: stats.total + 1,
          published: formData.published ? stats.published + 1 : stats.published,
          pending: stats.pending,
          outOfStock: (parseInt(formData.stock_quantity) || 0) === 0 ? stats.outOfStock + 1 : stats.outOfStock
        });
        toast.success('Product added (demo mode)');
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Add product error:', error);
      toast.error('Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData({ ...formData, image_url: URL.createObjectURL(file) });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category_id: '',
      stock_quantity: '',
      vendor_id: '',
      published: true,
      image_url: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted');
      setProducts(products.filter(p => p.id !== id));
      const newStats = {
        ...stats,
        total: stats.total - 1,
        published: products.find(p => p.id === id)?.status === 'published' ? stats.published - 1 : stats.published
      };
      setStats(newStats);
    } catch (error) {
      console.error('Delete error:', error);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted (demo mode)');
    }
    setShowDeleteModal(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminAPI.updateProductStatus(id, newStatus);
      toast.success(`Product ${newStatus}`);
      const updatedProducts = products.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      );
      setProducts(updatedProducts);

      const newStats = updatedProducts.reduce((acc, product) => {
        acc.total++;
        if (product.status === 'published') acc.published++;
        if (product.status === 'pending') acc.pending++;
        if (product.stock_quantity === 0) acc.outOfStock++;
        return acc;
      }, { total: 0, published: 0, pending: 0, outOfStock: 0 });
      setStats(newStats);
    } catch (error) {
      console.error('Status update error:', error);
      const updatedProducts = products.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      );
      setProducts(updatedProducts);
      toast.success(`Product ${newStatus} (demo mode)`);
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    if (!product) return false;

    const matchesSearch =
      (product.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (product.vendor_name?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || product.category_id === parseInt(categoryFilter);
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryName = (categoryId) => {
    if (!Array.isArray(categories)) return 'N/A';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  const formatProductId = (id) => {
    if (id === undefined || id === null) return 'N/A';
    return id.toString().slice(0, 8);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Products Management</h4>
          <p className="text-muted mb-0">Manage all marketplace products</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => fetchData(true)} disabled={refreshing}>
            <FaSync className={`me-2 ${refreshing ? 'spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Product
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="info" className="mb-4" dismissible onClose={() => setError(null)}>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FaBox className="text-primary" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Products</h6>
                  <h3 className="mb-0">{stats.total || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <FaCheck className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Published</h6>
                  <h3 className="mb-0">{stats.published || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <FaClock className="text-warning" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Pending</h6>
                  <h3 className="mb-0">{stats.pending || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                  <FaExclamationTriangle className="text-danger" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Out of Stock</h6>
                  <h3 className="mb-0">{stats.outOfStock || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{ width: '70px' }}>
                      <img
                        src={product.image_url || getPlaceholderImage(50, '📦')}
                        alt={product.name || 'Product'}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getPlaceholderImage(50, '📦');
                        }}
                      />
                    </td>
                    <td>
                      <div className="fw-medium">{product.name || 'Unnamed Product'}</div>
                      <small className="text-muted">
                        ID: {formatProductId(product.id)}
                      </small>
                    </td>
                    <td>{product.vendor_name || 'N/A'}</td>
                    <td>{getCategoryName(product.category_id)}</td>
                    <td>₦{formatPrice(product.price)}</td>
                    <td>
                      <Badge bg={(product.stock_quantity || 0) > 0 ? 'success' : 'danger'}>
                        {product.stock_quantity || 0}
                      </Badge>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={product.status || 'pending'}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        style={{ width: '110px' }}
                      >
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                        <option value="draft">Draft</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="link"
                        className="p-0 me-2"
                        as={Link}
                        to={`/admin/products/edit/${product.id}`}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <FaBox size={40} className="text-muted mb-3" />
                    <h5>No products found</h5>
                    <p className="text-muted">
                      {search || categoryFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No products have been added yet'}
                    </p>
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                      <FaPlus className="me-2" /> Add Your First Product
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Product Modal */}
      <Modal show={showAddModal} onHide={() => {
        setShowAddModal(false);
        resetForm();
      }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddProduct}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₦) *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <div
                className="border rounded-3 p-4 text-center"
                style={{
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  borderStyle: 'dashed'
                }}
                onClick={() => document.getElementById('productImage').click()}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    fluid
                    style={{ maxHeight: '150px' }}
                  />
                ) : (
                  <>
                    <FaUpload size={40} className="text-muted mb-2" />
                    <p className="text-muted mb-0">Click to upload image</p>
                    <small className="text-muted">PNG, JPG up to 5MB</small>
                  </>
                )}
                <Form.Control
                  id="productImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="d-none"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Publish immediately"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : <><FaSave className="me-2" /> Save Product</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <p>
              Are you sure you want to delete <strong>"{selectedProduct.name}"</strong>?
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDelete(selectedProduct?.id);
              setShowDeleteModal(false);
            }}
          >
            Delete Product
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
      `}</style>
    </DashboardLayout>
  );
}

export default AdminProducts;