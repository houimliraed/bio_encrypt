'use client'
import React, { useState, useEffect } from 'react'
import Layout from '../layout'
import axios from 'axios'

const Encrypt = () => {
  const [username, setUsername] = useState('')
  const [fingerprint, setFingerprint] = useState(null)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)

  // On component mount, check if user is logged in
  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const handleEncrypt = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('fingerprint', fingerprint)
    formData.append('file', file)

    try {
      const res = await axios.post('http://127.0.0.1:5000/encrypt', formData)
      setResult(res.data)
      setMessage("✅ Encryption successful!")
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Encryption failed")
    }
  }

  const handleDownload = () => {
    if (!result) return;

    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `encrypted_data_${username || 'user'}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">🔐 Encrypt File</h2>
        <form onSubmit={handleEncrypt} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block font-semibold">Username</label>
            <input
              type="text"
              value={username}
              disabled // Make the username field read-only
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-200"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block font-semibold">Fingerprint</label>
            <input
              type="file"
              onChange={(e) => setFingerprint(e.target.files[0])}
              required
              className="w-full mt-1"
            />
          </div>

          <div>
            <label className="block font-semibold">Choose what to Encrypt</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Encrypt
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-blue-600">{message}</p>
        )}

        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded shadow">
            <h4 className="font-bold mb-2">🧾 Encrypted Output:</h4>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
            <button
              onClick={handleDownload}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Download Encrypted Data
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Encrypt
