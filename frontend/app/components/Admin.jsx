import { useEffect, useState } from 'react'
import axios from 'axios'

const AdminDashboard = ({ setIsAuthorized }) => {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  

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
    window.location.reload() // 👈 Reload to go back to login screen
  }

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Timestamp</th>
            <th className="p-2">User</th>
            <th className="p-2">Action</th>
            <th className="p-2">Status</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboard
