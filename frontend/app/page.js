'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Encrypt from './components/Encrypt';
import Decrypt from './components/Decrypt';
import AdminDashboard from './components/Admin';
import AdminLogin from './components/Adminlogin';
import Home from './components/Home';

export default function HomePage() {
  const [activePage, setActivePage] = useState('home');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsRegistered(true); // User is registered if username exists
    }
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'register':
        return <Register />;
      case 'encrypt':
        return <Encrypt />;
      case 'decrypt':
        return <Decrypt />;
      case 'admin':
        const token = localStorage.getItem('admin-token');
        if (token) {
          return <AdminDashboard />;
        } else {
          return <AdminLogin setActivePage={setActivePage} />;
        }
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar setActivePage={setActivePage} activePage={activePage} isRegistered={isRegistered} />
      <main className="pt-28 px-4 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
