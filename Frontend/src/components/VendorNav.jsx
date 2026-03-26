import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaStore, 
  FaWallet,
  FaCog,
  FaPlus,
  FaUser,
  FaQuestionCircle,
  FaSignOutAlt
} from 'react-icons/fa';

function VendorNav() {
  const location = useLocation();

  const navItems = [
    { path: '/vendor/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/vendor/profile', icon: FaUser, label: 'Profile' },
    { path: '/vendor/products', icon: FaBox, label: 'Products' },
    { path: '/vendor/products/add', icon: FaPlus, label: 'Add Product' },
    { path: '/vendor/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/vendor/store', icon: FaStore, label: 'My Store' },
    { path: '/vendor/payouts', icon: FaWallet, label: 'Payouts' },
    { path: '/vendor/settings', icon: FaCog, label: 'Settings' },
    { path: '/help', icon: FaQuestionCircle, label: 'Help' }
  ];

  return (
    <Nav className="flex-column">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || 
                        (item.path !== '/vendor/dashboard' && location.pathname.startsWith(item.path));

        return (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded ${
              isActive ? 'bg-primary text-white' : 'text-dark'
            }`}
          >
            <Icon /> {item.label}
          </Nav.Link>
        );
      })}
    </Nav>
  );
}

export default VendorNav;