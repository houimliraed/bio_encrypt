'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const baseNavItems = [
  { key: 'home', label: 'Home' },
  { key: 'register', label: 'Register Or Login' },
  { key: 'encrypt', label: 'Encrypt' },
  { key: 'decrypt', label: 'Decrypt' },
  { key: 'admin', label: 'Admin Dashboard' },
];

const Navbar = ({ activePage, setActivePage, isRegistered }) => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('username', user);
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('admin-token');
    setUsername('');
    setIsLoggedIn(false);
    setActivePage('home');
  };

  const navItems = baseNavItems.filter(item => item.key !== 'register' || !isLoggedIn);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-0 w-full z-50 bg-gradient-to-r from-white via-blue-50 to-white backdrop-blur-lg shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="text-3xl font-bold text-blue-700 tracking-wide drop-shadow-md animate-pulse">
            BioCrypt
          </div>

          {/* Navigation Items */}
          <ul className="flex space-x-6">
            {navItems.map(({ key, label }) => (
              <li
                key={key}
                onClick={() => setActivePage(key)}
                className={clsx(
                  'cursor-pointer text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:text-blue-800',
                  activePage === key
                    ? 'bg-blue-200 text-blue-900 shadow-md'
                    : 'text-gray-700 hover:bg-blue-100'
                )}
              >
                {label}
              </li>
            ))}
          </ul>

          {/* User Section */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-800 font-semibold animate-fadeIn">
                👋 Welcome, <span className="font-bold">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-2 bg-white border border-blue-300 text-blue-600 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className="text-sm italic text-gray-500">Not logged in</span>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
