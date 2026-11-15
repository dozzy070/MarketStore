// frontend/src/pages/admin/AdminCategories.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Row, Col, Card, Badge, Button, Form, Spinner,
  Alert, Modal, Nav, InputGroup, FormControl,
} from 'react-bootstrap';
import {
  FaPlus, FaCheck, FaTimes, FaTrash, FaEdit, FaSync,
  FaSearch, FaTag, FaClock, FaCheckCircle, FaBan, FaBoxes, FaImage, FaSave,
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EMPTY_FORM = { name: '', description: '', icon: '', image_url: '' };

const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3E%3Crect width='300' height='150' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E`;

const STATUS_BADGE = {
  active:   { bg: 'success', label: 'Active',   icon: FaCheckCircle },
  pending:  { bg: 'warning', label: 'Pending',  icon: FaClock },
  rejected: { bg: 'danger',  label: 'Rejected', icon: FaBan },
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | active | rejected
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  // modals
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const token = localStorage.getItem('token');
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  // ── Data loading ───────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/categories/admin/all`, authHeaders);
      const data = res.data?.data ?? res.data ?? [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.response?.data?.message || 'Failed to load categories.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  // ── Actions ────────────────────────────────
  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await axios.patch(
        `${API_BASE_URL}/categories/admin/${id}/status`,
        { status },
        authHeaders
      );
      toast.success(`Category ${status}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setBusyId(null);
    }
  };

  const saveCategory = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const key = editing?.id ?? 'new';
    setBusyId(key);
    try {
      if (editing) {
        await axios.put(`${API_BASE_URL}/categories/admin/${editing.id}`, form, authHeaders);
        toast.success('Category updated');
      } else {
        await axios.post(`${API_BASE_URL}/categories/admin`, form, authHeaders);
        toast.success('Category created');
      }
      setEditing(null);
      setCreating(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setBusyId(null);
    }
  };

  const deleteCategory = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await axios.delete(`${API_BASE_URL}/categories/admin/${confirmDelete.id}`, authHeaders);
      toast.success('Category deleted');
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (c) => {
    setEditing(c);
    setCreating(false);
    setForm({
      name: c.name || '',
      description: c.description || '',
      icon: c.icon || '',
      image_url: c.image_url || '',
    });
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm(EMPTY_FORM);
  };

  const closeFormModal = () => {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  // ── Derived data ───────────────────────────
  const counts = useMemo(() => ({
    all:      categories.length,
    pending:  categories.filter((c) => c.status === 'pending').length,
    active:   categories.filter((c) => c.status === 'active').length,
    rejected: categories.filter((c) => c.status === 'rejected').length,
  }), [categories]);

  const pending = useMemo(
    () => categories.filter((c) => c.status === 'pending'),
    [categories]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (!q) return true;
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.requested_by_name || '').toLowerCase().includes(q)
      );
    });
  }, [categories, filter, search]);

  const formBusy = busyId === (editing?.id ?? 'new') && (creating || editing);
  const deleteBusy = confirmDelete && busyId === confirmDelete.id;

  // ── Render helpers ─────────────────────────
  const renderIconOrImage = (c, size = 44) => {
    if (c.image_url) {
      return (
        <img
          src={c.image_url}
          alt={c.name}
          style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMG;
          }}
        />
      );
    }
    if (c.icon) {
      return <span style={{ fontSize: size * 0.6, lineHeight: 1 }}>{c.icon}</span>;
    }
    return <FaTag className="text-muted" size={size * 0.55} />;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="mb-1">Manage Categories</h4>
          <p className="text-muted mb-0">
            Approve vendor requests or create new product categories.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={load} disabled={loading}>
            {loading
              ? <Spinner size="sm" animation="border" className="me-2" />
              : <FaSync className="me-2" />}
            Refresh
          </Button>
          <Button variant="primary" onClick={startCreate}>
            <FaPlus className="me-2" /> New Category
          </Button>
        </div>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <Alert
          variant="warning"
          className="d-flex justify-content-between align-items-center flex-wrap gap-2"
        >
          <div>
            <FaClock className="me-2" />
            <strong>
              {pending.length} categor{pending.length === 1 ? 'y' : 'ies'} request
              {pending.length === 1 ? '' : 's'} awaiting review.
            </strong>
          </div>
          <Button size="sm" variant="warning" onClick={() => setFilter('pending')}>
            Review now
          </Button>
        </Alert>
      )}

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total',    val: counts.all,      color: 'primary' },
          { label: 'Active',   val: counts.active,   color: 'success' },
          { label: 'Pending',  val: counts.pending,  color: 'warning' },
          { label: 'Rejected', val: counts.rejected, color: 'danger'  },
        ].map((s) => (
          <Col xs={6} md={3} key={s.label}>
            <Card className={`border-0 shadow-sm bg-${s.color} bg-opacity-10`}>
              <Card.Body className="py-3">
                <div className="text-muted small">{s.label}</div>
                <div className={`fw-bold fs-4 text-${s.color}`}>{s.val}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter + search */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={7}>
              <Nav variant="pills" activeKey={filter} onSelect={(k) => setFilter(k || 'all')}>
                <Nav.Item><Nav.Link eventKey="all">All ({counts.all})</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="pending">Pending ({counts.pending})</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="active">Active ({counts.active})</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="rejected">Rejected ({counts.rejected})</Nav.Link></Nav.Item>
              </Nav>
            </Col>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <FormControl
                  placeholder="Search name, description, or requester…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Categories grid */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : visible.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <FaTag size={40} className="text-muted mb-3 opacity-25" />
            <h5>No categories match this filter</h5>
            <p className="text-muted mb-3">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first category to get started.'}
            </p>
            <Button variant="primary" onClick={startCreate}>
              <FaPlus className="me-2" /> Create Category
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {visible.map((c) => {
            const badge = STATUS_BADGE[c.status] || { bg: 'secondary', label: c.status || '—', icon: FaTag };
            const BadgeIcon = badge.icon;
            const busy = busyId === c.id;
            return (
              <Col xs={12} sm={6} lg={4} xl={3} key={c.id}>
                <Card className="border-0 shadow-sm h-100 category-card">
                  <div className="position-relative">
                    {c.image_url ? (
                      <Card.Img
                        variant="top"
                        src={c.image_url}
                        style={{ height: 140, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMG;
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light"
                        style={{ height: 140 }}
                      >
                        {renderIconOrImage(c, 64)}
                      </div>
                    )}
                    <Badge
                      bg={badge.bg}
                      className="position-absolute top-0 end-0 m-2 d-inline-flex align-items-center gap-1"
                    >
                      <BadgeIcon size={10} /> {badge.label}
                    </Badge>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-start justify-content-between mb-1">
                      <Card.Title className="mb-0 small fw-bold">
                        {c.icon && !c.image_url ? <span className="me-1">{c.icon}</span> : null}
                        {c.name}
                      </Card.Title>
                    </div>
                    <Card.Text className="text-muted small mb-2 flex-grow-1">
                      {c.description || <span className="fst-italic">No description</span>}
                    </Card.Text>
                    <div className="small text-muted mb-3">
                      {c.requested_by_name && (
                        <div>Requested by: {c.requested_by_name}</div>
                      )}
                      {typeof c.product_count === 'number' && (
                        <div>
                          <FaBoxes className="me-1" size={10} />
                          {c.product_count} product{c.product_count === 1 ? '' : 's'}
                        </div>
                      )}
                    </div>

                    {/* Status actions */}
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {c.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={busy}
                            onClick={() => updateStatus(c.id, 'active')}
                          >
                            <FaCheck className="me-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={busy}
                            onClick={() => updateStatus(c.id, 'rejected')}
                          >
                            <FaTimes className="me-1" /> Reject
                          </Button>
                        </>
                      )}
                      {c.status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          disabled={busy}
                          onClick={() => updateStatus(c.id, 'active')}
                        >
                          <FaCheck className="me-1" /> Activate
                        </Button>
                      )}
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={busy}
                        onClick={() => startEdit(c)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={busy}
                        onClick={() => setConfirmDelete(c)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create / Edit modal */}
      <Modal show={creating || !!editing} onHide={closeFormModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editing ? 'Edit Category' : 'New Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3">
                <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Baby Food"
                  maxLength={80}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What kinds of products belong here?"
                />
              </Form.Group>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Emoji icon</Form.Label>
                    <Form.Control
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="e.g. 🍼"
                      maxLength={4}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Image URL (optional)</Form.Label>
                    <Form.Control
                      type="url"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://…"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <small className="text-muted d-block mt-2">
                💡 Emoji icons are the fastest way to make the landing page look good — leave
                the image URL blank and the emoji will be used.
              </small>
            </Col>
            <Col md={5}>
              <div
                className="border rounded-3 p-3 text-center bg-light h-100 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: 200 }}
              >
                <Form.Label className="text-muted">Preview</Form.Label>
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    style={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMG;
                    }}
                  />
                ) : form.icon ? (
                  <div style={{ fontSize: 72, lineHeight: 1 }}>{form.icon}</div>
                ) : (
                  <div className="d-flex flex-column align-items-center text-muted">
                    <FaImage size={48} className="mb-2" />
                    <span className="small">No image or emoji</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeFormModal} disabled={formBusy}>
            <FaTimes className="me-2" /> Cancel
          </Button>
          <Button variant="primary" onClick={saveCategory} disabled={formBusy}>
            {formBusy
              ? <Spinner size="sm" animation="border" className="me-2" />
              : <FaSave className="me-2" />}
            {editing ? 'Save Changes' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete confirmation */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Delete this category?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmDelete && (
            <>
              <p className="mb-2">
                You're about to delete <strong>{confirmDelete.name}</strong>. This cannot be
                undone.
              </p>
              <Alert variant="warning" className="small mb-0">
                <strong>Note:</strong> you cannot delete a category still used by products or
                stores — the server will block it and tell you the count.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(null)}
            disabled={deleteBusy}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteCategory} disabled={deleteBusy}>
            {deleteBusy
              ? <Spinner size="sm" animation="border" className="me-2" />
              : <FaTrash className="me-2" />}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .category-card { transition: all 0.3s ease; }
        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </DashboardLayout>
  );
}