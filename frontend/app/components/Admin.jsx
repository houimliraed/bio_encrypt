'use client'

import React, { useEffect, useState } from 'react'
import Layout from '../layout'
import axios from 'axios'

const Logs = () => {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/logs')
      .then(res => setLogs(res.data))
      .catch(() => setLogs([]))
  }, [])

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Activity Logs</h2>

      {logs.length === 0 ? (
        <p className="text-center text-gray-500">No logs available.</p>
      ) : (
        <div className="overflow-x-auto ">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Username</th>
                <th className="py-3 px-5">Action</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-5">{log.timestamp}</td>
                  <td className="py-3 px-5">{log.username}</td>
                  <td className="py-3 px-5 capitalize">{log.action}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export default Logs
