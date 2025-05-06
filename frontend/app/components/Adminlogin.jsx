import React, { useState } from 'react'
import axios from 'axios'
import Layout from '../layout'
import Logs from './Admin'

const AdminLogin = () => {
  const [secretKey, setSecretKey] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:5000/admin-login', {
        secret_key: secretKey
      })
  
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('admin-token', response.data.token)
        window.location.reload()  // 👈 Reload to trigger admin view
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }
  

  if (isAuthorized) {
    return <Logs setIsAuthorized={setIsAuthorized} />
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
        <h5>Access the logs if you have aws database permission</h5>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter AWS Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </Layout>
  )
}

export default AdminLogin
