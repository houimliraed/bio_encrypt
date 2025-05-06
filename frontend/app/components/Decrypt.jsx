'use client'
import React, { useState, useEffect } from 'react'
import Layout from '../layout'
import axios from 'axios'

const Decrypt = () => {
  const [username, setUsername] = useState('')
  const [fingerprint, setFingerprint] = useState(null)
  const [encryptedData, setEncryptedData] = useState('')
  const [salt, setSalt] = useState('')
  const [nonce, setNonce] = useState('')
  const [tag, setTag] = useState('')
  const [message, setMessage] = useState('')
  const [decrypted, setDecrypted] = useState('')

  // On component mount, check if user is logged in
  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const handleDecrypt = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('fingerprint', fingerprint)
    formData.append('encrypted_data', encryptedData)
    formData.append('salt', salt)
    formData.append('nonce', nonce)
    formData.append('tag', tag)

    try {
      const res = await axios.post('http://127.0.0.1:5000/decrypt', formData)
      setDecrypted(res.data.decrypted_data)
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Decryption failed')
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">🔐 Decrypt File</h2>
        <form
          onSubmit={handleDecrypt}
          className="bg-white p-6 rounded-lg shadow space-y-4"
        >
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
              className="mt-1"
            />
          </div>

          <div>
            <label className="block font-semibold">Encrypted Data</label>
            <textarea
              value={encryptedData}
              onChange={(e) => setEncryptedData(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              placeholder="Paste encrypted content here"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold">Salt (hex)</label>
              <input
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Nonce (hex)</label>
              <input
                type="text"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Tag (hex)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Decrypt
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}

        {decrypted && (
          <div className="mt-6 bg-gray-100 p-4 rounded shadow">
            <h4 className="font-bold mb-2">✅ Decrypted Output:</h4>
            <pre className="whitespace-pre-wrap">{decrypted}</pre>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Decrypt
