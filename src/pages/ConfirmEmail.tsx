
import { motion } from 'framer-motion';

function ConfirmEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/10 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Quase lá!</h2>
        <p className="text-white text-center mb-6">
          Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
        </p>
        <p className="text-white/70 text-center">
          Você pode fechar esta página após confirmar seu email.
        </p>
      </motion.div>
    </div>
  );
}

export default ConfirmEmail;