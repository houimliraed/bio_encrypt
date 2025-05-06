'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Encrypt from './components/Encrypt';
import Decrypt from './components/Decrypt';
import AdminDashboard from './components/Admin';
import AdminLogin from './components/Adminlogin';
import Home from './components/Home';
import DeleteUser from './components/DeleteUser';

export default function HomePage() {
  const [activePage, setActivePage] = useState('home');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsRegistered(true);
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
      case 'DeleteUser':
        return <DeleteUser />;
      case 'admin':
        const token = localStorage.getItem('admin-token');
        return token ? <AdminDashboard /> : <AdminLogin setActivePage={setActivePage} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-800 transition-all duration-500 ease-in-out">
      {/* Navbar */}
      <Navbar
        setActivePage={setActivePage}
        activePage={activePage}
        isRegistered={isRegistered}
      />

      {/* Main Content */}
      <main className="pt-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-glow p-8 animate-fadeIn transition duration-700 ease-in-out">
          {renderPage()}
        </div>
      </main>

      {/* Copyright at the bottom like the Navbar */}
      <footer className="w-full py-1 bg-gray-300 text-center text-xs text-white fixed bottom-0">
  <p>&copy; 2025 SSIR-S. All rights reserved.</p>
</footer>

    </div>
  );
}
