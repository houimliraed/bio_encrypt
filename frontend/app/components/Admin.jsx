'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

const AdminDashboard = ({ setIsAuthorized }) => {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      setError('Unauthorized access')
      return
    }

    axios.get('http://127.0.0.1:5000/logs', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setLogs(res.data))
      .catch(() => setError('Access denied or invalid token'))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    setIsAuthorized(false)
  }

  const handleDeleteUser = async (username) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete all fingerprint data for user "${username}". This action cannot be undone.\n\nDo you want to proceed?`
    )

    if (!confirmed) return

    try {
      const res = await axios.post('http://127.0.0.1:5000/delete_user', { username })
      setMessage(`✅ ${res.data.message}`)
      setLogs(logs.filter(log => log.username !== username))
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Failed to delete user'}`)
    }
  }

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {message && (
        <p className="text-center text-sm text-blue-600 mb-4">{message}</p>
      )}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Timestamp</th>
            <th className="p-2">User</th>
            <th className="p-2">Action</th>
            <th className="p-2">Status</th>
            <th className="p-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{log.timestamp}</td>
              <td className="p-2">{log.username}</td>
              <td className="p-2">{log.action}</td>
              <td className={`p-2 font-bold ${log.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {log.status}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleDeleteUser(log.username)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboard
