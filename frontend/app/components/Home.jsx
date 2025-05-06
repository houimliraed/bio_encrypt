'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="h-[calc(100vh-6rem)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl shadow-glow max-w-xl w-full p-10 text-center"
      >
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-transparent bg-clip-text mb-4">
          Welcome to BioCrypt!
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          Register as a new user or explore encryption, decryption, and admin features.  
          Your privacy starts here — secure and simple.
        </p>
      </motion.div>
    </div>
  );
};

export default Home;
