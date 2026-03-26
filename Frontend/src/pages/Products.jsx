import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Form, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaCopy,
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaDollarSign,
  FaExclamationTriangle
} from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { productAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

function Products() {
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    outOfStock: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError(null);
    
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getProducts(),
        categoryAPI.getCategories()
      ]);
      
      const productsData = productsRes.data || [];
      const productsArray = Array.isArray(productsData) ? productsData : 
                           (productsData.products ? productsData.products : []);
      
      const categoriesData = categoriesRes.data || [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData :
                             (categoriesData.categories ? categoriesData.categories : []);
      
      setProducts(productsArray);
      setCategories(categoriesArray);

      setStats({
        total: productsArray.length,
        published: productsArray.filter(p => p?.published).length,
        draft: productsArray.filter(p => !p?.published).length,
        outOfStock: productsArray.filter(p => (p?.stock_quantity || 0) === 0).length
      });

    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try refreshing.');
      toast.error('Failed to load products');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    setDeleting(true);
    try {
      await productAPI.deleteProduct(selectedProduct.id);
      const updatedProducts = products.filter(p => p.id !== selectedProduct.id);
      setProducts(updatedProducts);
      
      setStats({
        total: updatedProducts.length,
        published: updatedProducts.filter(p => p?.published).length,
        draft: updatedProducts.filter(p => !p?.published).length,
        outOfStock: updatedProducts.filter(p => (p?.stock_quantity || 0) === 0).length
      });
      
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setSelectedProduct(null);
    }
  };

  const handleTogglePublish = async (product) => {
    try {
      await productAPI.updateProduct(product.id, { published: !product.published });
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, published: !p.published } : p
      );
      setProducts(updatedProducts);
      
      setStats({
        total: updatedProducts.length,
        published: updatedProducts.filter(p => p?.published).length,
        draft: updatedProducts.filter(p => !p?.published).length,
        outOfStock: updatedProducts.filter(p => (p?.stock_quantity || 0) === 0).length
      });
      
      toast.success(`Product ${!product.published ? 'published' : 'unpublished'}`);
    } catch (error) {
      console.error('Failed to update product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleDuplicate = async (product) => {
    try {
      const newProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        published: false,
        id: undefined
      };
      await productAPI.createProduct(newProduct);
      toast.success('Product duplicated');
      fetchData();
    } catch (error) {
      console.error('Failed to duplicate product:', error);
      toast.error('Failed to duplicate product');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    if (search) {
      filtered = filtered.filter(p => 
        (p?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p?.description?.toLowerCase() || '').includes(search.toLowerCase())
      );
    }

    if (filter === 'published') {
      filtered = filtered.filter(p => p?.published);
    } else if (filter === 'draft') {
      filtered = filtered.filter(p => !p?.published);
    } else if (filter === 'out') {
      filtered = filtered.filter(p => (p?.stock_quantity || 0) === 0);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a?.price || 0) - (b?.price || 0);
        case 'price-high':
          return (b?.price || 0) - (a?.price || 0);
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '');
        default:
          return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
      }
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Products</h4>
          <p className="text-muted mb-0">
            {filteredProducts.length} products found
          </p>
        </div>
        <Link to="/vendor/products/add">
          <Button variant="primary">
            <FaPlus className="me-2" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3" size={24} />
            <div>
              <strong>Error loading products</strong>
              <p className="mb-0">{error}</p>
            </div>
          </div>
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
                  <h3 className="mb-0">{stats.total}</h3>
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
                  <FaCheckCircle className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Published</h6>
                  <h3 className="mb-0">{stats.published}</h3>
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
                  <FaTimesCircle className="text-warning" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Draft</h6>
                  <h3 className="mb-0">{stats.draft}</h3>
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
                  <FaBox className="text-danger" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Out of Stock</h6>
                  <h3 className="mb-0">{stats.outOfStock}</h3>
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
              <div className="position-relative">
                <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Products</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="out">Out of Stock</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </Form.Select>
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
                <th>Product</th>
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
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', marginRight: '10px' }}
                        />
                        <div>
                          <div className="fw-medium">{product.name}</div>
                          <small className="text-muted">ID: {product.id?.slice(0, 8)}</small>
                        </div>
                      </div>
                    </td>
                    <td>{getCategoryName(product.category_id)}</td>
                    <td>₦{(product.price || 0).toLocaleString()}</td>
                    <td>
                      <Badge bg={product.stock_quantity > 0 ? 'success' : 'danger'}>
                        {product.stock_quantity || 0}
                      </Badge>
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={product.published}
                        onChange={() => handleTogglePublish(product)}
                        label={product.published ? 'Live' : 'Draft'}
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="p-0 text-info"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowViewModal(true);
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Link to={`/vendor/products/edit/${product.id}`}>
                          <Button size="sm" variant="link" className="p-0 text-primary">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="p-0 text-success"
                          onClick={() => handleDuplicate(product)}
                        >
                          <FaCopy />
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* View Product Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row>
              <Col md={4}>
                <img
                  src={selectedProduct.image_url || 'https://via.placeholder.com/300'}
                  alt={selectedProduct.name}
                  className="img-fluid rounded"
                />
              </Col>
              <Col md={8}>
                <h5>{selectedProduct.name}</h5>
                <p className="text-muted">{selectedProduct.description}</p>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Price:</strong></td>
                      <td>₦{(selectedProduct.price || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><strong>Category:</strong></td>
                      <td>{getCategoryName(selectedProduct.category_id)}</td>
                    </tr>
                    <tr>
                      <td><strong>Stock:</strong></td>
                      <td>
                        <Badge bg={selectedProduct.stock_quantity > 0 ? 'success' : 'danger'}>
                          {selectedProduct.stock_quantity || 0} units
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <Badge bg={selectedProduct.published ? 'success' : 'secondary'}>
                          {selectedProduct.published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Link to={`/vendor/products/edit/${selectedProduct?.id}`}>
            <Button variant="primary">
              <FaEdit className="me-2" /> Edit Product
            </Button>
          </Link>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</p>
          <p className="text-danger small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default Products;