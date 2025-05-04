'use client'
import React from 'react'
import Layout from '../layout';
import { useState } from 'react';

const Header = () => {
    const [username, setUsername] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('username', username);
      formData.append('fingerprint', file);  // now correctly defined
      
      try {
        const res = await axios.post('http://127.0.0.1:5000/register', formData);
        setMessage(res.data.message);
      } catch (err) {
        setMessage(err.response?.data?.error || "Failed to register");
      }
    };

    return (
        
        <Layout>
          <h2>Register Fingerprint</h2>
          <form onSubmit={handleSubmit}>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required />
      <button type="submit">Register</button>
    </form>
          <p>{message}</p>
        </Layout>
      );
}
export default Header
