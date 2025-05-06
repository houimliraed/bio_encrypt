'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Layout from '../layout'

const DeleteUser = () => {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  const handleDelete = async (e) => {
    e.preventDefault()

    // Create the payload as a JSON object
    const payload = { username }

    try {
      // Send the data as JSON with the correct content-type
      const res = await axios.post('http://127.0.0.1:5000/delete_user', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setMessage(res.data.message || '✅ User deleted successfully')
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Failed to delete user')
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-center mb-6">🗑️ Delete User</h2>
        <form onSubmit={handleDelete} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              placeholder="Enter your username"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Delete User
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-blue-600">{message}</p>
        )}
      </div>
    </Layout>
  )
}

export default DeleteUser
