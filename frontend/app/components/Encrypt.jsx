'use client'
import React, { useState } from 'react'
import Layout from '../layout'
import axios from 'axios'

const Encrypt = () => {
  const [username, setUsername] = useState('')
  const [fingerprint, setFingerprint] = useState(null)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)

  const handleEncrypt = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('fingerprint', fingerprint)
    formData.append('file', file)

    try {
      const res = await axios.post('http://127.0.0.1:5000/encrypt', formData)
      setResult(res.data)
      setMessage("Encryption successful")
    } catch (err) {
      setMessage(err.response?.data?.error || "Encryption failed")
    }
  }

  return (
    <Layout>
      <h2>Encrypt File</h2>
      <form onSubmit={handleEncrypt}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="file" onChange={e => setFingerprint(e.target.files[0])} required />
        <input type="file" onChange={e => setFile(e.target.files[0])} required />
        <button type="submit">Encrypt</button>
      </form>
      <p>{message}</p>
      {result && (
        <div>
          <h4>Encrypted Output:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Layout>
  )
}

export default Encrypt
