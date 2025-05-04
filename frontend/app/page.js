'use client'

import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Register from './components/Register'
import Encrypt from './components/Encrypt'
import Decrypt from './components/Decrypt'
import AdminDashboard from './components/Admin'

export default function HomePage() {
  const [activePage, setActivePage] = useState('register')

  const renderPage = () => {
    switch (activePage) {
      case 'register':
        return <Register />
      case 'encrypt':
        return <Encrypt />
      case 'decrypt':
        return <Decrypt />
      case 'admin':
        return <AdminDashboard />
      default:
        return <Register />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar setActivePage={setActivePage} activePage={activePage} />
      <main className="pt-28 px-4 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
