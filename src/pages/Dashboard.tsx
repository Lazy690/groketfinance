import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LogOut,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Euro,
  CircleDollarSign
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Currency = 'KZ' | 'USD' | 'EUR' | 'BRL';
type Period = 'today' | 'yesterday' | '7days' | 'month' | 'custom';

interface Transaction {
  id: string;
  user_id: string;
  type: 'receita' | 'despesa';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

const currencySymbols: Record<Currency, string> = {
  KZ: 'Kz',
  USD: '$',
  EUR: '€',
  BRL: 'R$'
};

const currencyRates: Record<Currency, number> = {
  KZ: 1,
  USD: 0.0012,
  EUR: 0.0011,
  BRL: 0.0060
};

function Dashboard() {
  const { signOut, session } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('KZ');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'receita',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [session?.user?.id, selectedPeriod, customDateRange]);

  const fetchTransactions = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      // Aplicar filtro de período
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      switch (selectedPeriod) {
        case 'today':
          query = query.eq('date', format(today, 'yyyy-MM-dd'));
          break;
        case 'yesterday':
          query = query.eq('date', format(yesterday, 'yyyy-MM-dd'));
          break;
        case '7days':
          query = query.gte('date', format(sevenDaysAgo, 'yyyy-MM-dd'));
          break;
        case 'month':
          query = query.gte('date', format(startOfMonth, 'yyyy-MM-dd'));
          break;
        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            query = query
              .gte('date', customDateRange.start)
              .lte('date', customDateRange.end);
          }
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: session.user.id,
            type: newTransaction.type,
            amount: parseFloat(newTransaction.amount),
            category: newTransaction.category,
            description: newTransaction.description,
            date: newTransaction.date
          }
        ])
        .select();

      if (error) throw error;

      setTransactions([...(data || []), ...transactions]);
      setShowTransactionModal(false);
      setNewTransaction({
        type: 'receita',
        amount: '',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (err) {
      setError('Erro ao adicionar transação');
      console.error('Erro:', err);
    }
  };

  const removeTransaction = async (id: string) => {
    console.log('Deleting transaction with id:', id); // Debugging log
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      setError('Erro ao remover transação');
      console.error('Erro:', err);
    }
  };

  const convertCurrency = (amount: number) => {
    return (amount * currencyRates[selectedCurrency]).toFixed(2);
  };

  const totalRevenue = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalRevenue - totalExpenses;

  const chartData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => ({
      date: format(new Date(t.date), 'dd/MM'),
      valor: t.type === 'receita' ? t.amount : -t.amount
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Groket Finance</h1>
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2">
              {Object.entries(currencySymbols).map(([currency, symbol]) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency as Currency)}
                  className={`p-1.5 rounded transition-all ${
                    selectedCurrency === currency
                      ? 'bg-blue-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut()}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/10"
          >
            <h3 className="text-sm font-medium text-white/70">Saldo</h3>
            <p className="mt-2 text-3xl font-bold text-white">
              {currencySymbols[selectedCurrency]}{convertCurrency(balance)}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/10"
          >
            <h3 className="text-sm font-medium text-white/70">Receitas</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {currencySymbols[selectedCurrency]}{convertCurrency(totalRevenue)}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/10"
          >
            <h3 className="text-sm font-medium text-white/70">Despesas</h3>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {currencySymbols[selectedCurrency]}{convertCurrency(totalExpenses)}
            </p>
          </motion.div>
        </div>

        {/* Period Filter */}
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/10 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedPeriod('yesterday')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === 'yesterday'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Ontem
            </button>
            <button
              onClick={() => setSelectedPeriod('7days')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === '7days'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Este mês
            </button>
            <button
              onClick={() => setSelectedPeriod('custom')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Personalizado
            </button>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="mt-4 flex gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({
                    ...customDateRange,
                    start: e.target.value
                  })}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({
                    ...customDateRange,
                    end: e.target.value
                  })}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/10 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Fluxo de Caixa</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#60A5FA"
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transactions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Transações</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </motion.button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center text-white/70 py-8">Carregando...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                Nenhuma transação encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-white/70">
                      <th className="pb-4">Data</th>
                      <th className="pb-4">Descrição</th>
                      <th className="pb-4">Categoria</th>
                      <th className="pb-4 text-right">Valor</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {transactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm"
                      >
                        <td className="py-4 text-white/70">
                          {format(new Date(transaction.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-4 text-white">{transaction.description}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'receita'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.category}
                          </span>
                        </td>
                        <td className={`py-4 text-right ${
                          transaction.type === 'receita'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}>
                          {currencySymbols[selectedCurrency]}{convertCurrency(transaction.amount)}
                        </td>
                        <td className="py-4 pl-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeTransaction(transaction.id)}
                            className="text-white/50 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Nova Transação</h3>
              <form onSubmit={addTransaction}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Tipo
                    </label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        type: e.target.value as 'receita' | 'despesa'
                      })}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Valor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value
                      })}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        category: e.target.value
                      })}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        description: e.target.value
                      })}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        date: e.target.value
                      })}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowTransactionModal(false)}
                    className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Adicionar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;