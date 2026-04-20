import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaStore,
  FaBox,
  FaShoppingCart,
  FaTags,
  FaStar,
  FaChartLine,
  FaCog,
  FaHistory,
  FaPlus
} from 'react-icons/fa';

function AdminNav() {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/vendors', icon: FaStore, label: 'Vendors' },
    { path: '/admin/products', icon: FaBox, label: 'Products' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/admin/categories', icon: FaTags, label: 'Categories' },
    { path: '/admin/reviews', icon: FaStar, label: 'Reviews' },
    { path: '/admin/audit-log', icon: FaHistory, label: 'Audit Log' },
    { path: '/admin/analytics', icon: FaChartLine, label: 'Analytics' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <Nav className="flex-column p-3">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path ||
          (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

        return (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded mb-1 ${isActive ? 'bg-primary text-white' : 'text-dark hover-bg-light'
              }`}
            style={{
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            {item.badge && (
              <span className={`badge bg-${item.badge.color} ms-auto`}>
                {item.badge.count}
              </span>
            )}
          </Nav.Link>
        );
      })}
    </Nav>
  );
}

export default AdminNav;