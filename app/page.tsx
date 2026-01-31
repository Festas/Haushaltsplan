'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Settlement from '@/components/Settlement';
import { formatCurrency } from '@/lib/expenses';
import { TrendingUp, Wallet, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });

  useEffect(() => {
    loadData();
    // Process recurring expenses on load
    fetch('/api/recurring/process', { method: 'POST' }).catch(console.error);
  }, []);

  async function loadData() {
    try {
      const [expensesRes, settlementRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/settlement'),
      ]);

      const expensesData = await expensesRes.json();
      const settlementData = await settlementRes.json();

      setExpenses(expensesData);
      setSettlement(settlementData);

      // Calculate stats
      const total = expensesData.reduce((sum: number, e: any) => sum + e.amount, 0);
      const now = new Date();
      const thisMonthExpenses = expensesData.filter((e: any) => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      });
      const thisMonth = thisMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

      setStats({ total, thisMonth });
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  }

  async function handleExpenseCreated() {
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
          <div className="text-xl text-gray-400">Lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-12 animate-fade-in">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <HomeIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Haushaltsplan</h1>
            <p className="text-gray-400 text-sm mt-1">Familienausgaben-Tracker</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-slide-up">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm transition-smooth hover:border-primary-500/50 hover:shadow-glow group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                </div>
                <div className="text-sm font-medium text-gray-400">Dieser Monat</div>
              </div>
              <div className="text-3xl font-bold text-primary-400 tracking-tight">
                {formatCurrency(stats.thisMonth)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">Laufende Ausgaben</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm transition-smooth hover:border-primary-500/50 hover:shadow-glow group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-sm font-medium text-gray-400">Gesamt</div>
              </div>
              <div className="text-3xl font-bold text-green-400 tracking-tight">
                {formatCurrency(stats.total)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">Alle Ausgaben</div>
          </div>
        </div>
      </div>

      {/* Settlement */}
      {settlement.length > 0 && (
        <div className="mb-8 animate-slide-up">
          <Settlement settlements={settlement} />
        </div>
      )}

      {/* Expense Form */}
      <div className="mb-8 animate-slide-up">
        <ExpenseForm onExpenseCreated={handleExpenseCreated} />
      </div>

      {/* Expense List */}
      <div className="animate-slide-up">
        <ExpenseList expenses={expenses} />
      </div>
    </main>
  );
}
