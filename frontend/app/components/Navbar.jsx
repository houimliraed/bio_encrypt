'use client';

import React from 'react';
import clsx from 'clsx';

const navItems = [
  { key: 'register', label: 'Register' },
  { key: 'encrypt', label: 'Encrypt' },
  { key: 'decrypt', label: 'Decrypt' },
  { key: 'admin', label: 'Admin Dashboard' },
];

const Navbar = ({ activePage, setActivePage }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-blue-700">BioCrypt</h1>
          <ul className="hidden md:flex space-x-8">
            {navItems.map(({ key, label }) => (
              <li
                key={key}
                onClick={() => setActivePage(key)}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
