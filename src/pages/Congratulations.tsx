import React from 'react';
import { useNavigate } from 'react-router-dom';

function Congratulations() {
  const navigate = useNavigate();

  const handleClose = () => {
    // Redirect to the login page
    navigate('/login');
    // Close the current tab
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Congratulations!</h1>
        <p className="text-white mb-6">Your account was created successfully.</p>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default Congratulations;