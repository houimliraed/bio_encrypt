'use client'
import React, { useState } from 'react'
import Layout from '../layout'
import axios from 'axios'

const Register = () => {
  const [username, setUsername] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [statusColor, setStatusColor] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('fingerprint', file)

    try {
      const res = await axios.post('http://127.0.0.1:5000/register', formData)
      setMessage(res.data.message)
      localStorage.setItem('username', username) // ✅ Save username
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed")
    }
    
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">👤 Register Fingerprint</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block font-semibold mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Fingerprint Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center font-medium ${statusColor}`}>
            {message}
          </p>
        )}
      </div>
    </Layout>
  )
}

export default Register
