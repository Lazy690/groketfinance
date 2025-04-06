import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

function ConfirmEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      const { error } = await supabase.auth.getSessionFromUrl();
      if (error) {
        console.error('Error confirming email:', error.message);
        return;
      }
      // Redirect to the Congratulations page
      navigate('/congratulations');
    };

    confirmEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/10 w-full max-w-md text-center"
      >
        <h1 className="text-2xl font-bold text-white mb-4">Confirming your email...</h1>
        <p className="text-white">Please wait while we confirm your email.</p>
      </motion.div>
    </div>
  );
}

export default ConfirmEmail;