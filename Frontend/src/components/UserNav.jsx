import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaShoppingBag, FaHeart, FaUser, FaCog, FaStar } from 'react-icons/fa';

function UserNav() {
  const location = useLocation();

  const navItems = [
    { path: '/user/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/user/orders', icon: FaShoppingBag, label: 'My Orders' },
    { path: '/user/wishlist', icon: FaHeart, label: 'Wishlist' },
    { path: '/user/reviews', icon: FaStar, label: 'My Reviews' },
    { path: '/user/profile', icon: FaUser, label: 'Profile' },
    { path: '/user/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <Nav className="flex-column">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
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

export default UserNav;