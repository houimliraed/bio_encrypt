'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const baseNavItems = [
  { key: 'home', label: 'Home' },
  { key: 'register', label: 'Register' },
  { key: 'encrypt', label: 'Encrypt' },
  { key: 'decrypt', label: 'Decrypt' },
  { key: 'admin', label: 'Admin Dashboard' },
  { key: 'DeleteUser', label: 'DeleteUser' }
];

const Navbar = ({ activePage, setActivePage, isRegistered }) => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load username and login state from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true); // User is logged in
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Handle login (registration in this case) by setting localStorage and updating state
  const handleLogin = (user) => {
    localStorage.setItem('username', user);
    setUsername(user);
    setIsLoggedIn(true);
  };

  // Handle logout by clearing localStorage and resetting state
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('admin-token');
    setUsername('');
    setIsLoggedIn(false);
    setActivePage('home');  // Redirect to home after logout
  };

  // Show "Register" only if the user is NOT logged in
  const navItems = baseNavItems.filter(item => item.key !== 'register' || !isLoggedIn);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 space-x-8 w-full">
          {/* Logo Section */}
          <h1 className="text-xl font-bold text-blue-700 text-center">
            BioCrypt
          </h1>

          {/* Navigation Items */}
          <ul className="flex space-x-8">
            {navItems.map(({ key, label }) => (
              <li
                key={key}
                onClick={() => setActivePage(key)}  // Set active page on click
                className={clsx(
                  'cursor-pointer text-sm font-medium px-3 py-2 rounded-md transition duration-150 ease-in-out',
                  activePage === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                )}
              >
                {label}
              </li>
            ))}
          </ul>

          {/* Display username if user is logged in */}
          {isLoggedIn && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-700 font-semibold">
                Welcome, {username}!
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
