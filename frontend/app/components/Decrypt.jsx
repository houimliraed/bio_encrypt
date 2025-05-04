'use client'
import React, { useState } from 'react'
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
      setMessage(err.response?.data?.error || "Decryption failed")
    }
  }

  return (
    <Layout>
      <h2>Decrypt File</h2>
      <form onSubmit={handleDecrypt}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="file" onChange={e => setFingerprint(e.target.files[0])} required />
        <textarea placeholder="Encrypted Data" value={encryptedData} onChange={e => setEncryptedData(e.target.value)} required />
        <input placeholder="Salt (hex)" value={salt} onChange={e => setSalt(e.target.value)} required />
        <input placeholder="Nonce (hex)" value={nonce} onChange={e => setNonce(e.target.value)} required />
        <input placeholder="Tag (hex)" value={tag} onChange={e => setTag(e.target.value)} required />
        <button type="submit">Decrypt</button>
      </form>
      <p>{message}</p>
      {decrypted && (
        <div>
          <h4>Decrypted Output:</h4>
          <pre>{decrypted}</pre>
        </div>
      )}
    </Layout>
  )
}

export default Decrypt
