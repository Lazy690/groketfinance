import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function AdditionalInfo() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      if (!session || !session.user) {
        throw new Error('Usuário não autenticado');
      }

      // Save the profile data to the Supabase profiles table
      const { error } = await supabase.from('profiles').insert({
        id: session.user.id, // Link to the auth.users table
        name,
        surname,
      });

      if (error) throw error;

      navigate('/'); // Redirect to the dashboard or homepage
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar informações adicionais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Informações Adicionais</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Sobrenome</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdditionalInfo;