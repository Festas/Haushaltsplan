'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Settlement from '@/components/Settlement';
import { formatCurrency } from '@/lib/expenses';

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
        <div className="text-xl">Lädt...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏠 Haushaltsplan</h1>
        <p className="text-gray-400">Familienausgaben-Tracker</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Dieser Monat</div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(stats.thisMonth)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Gesamt</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(stats.total)}</div>
        </div>
      </div>

      {/* Settlement */}
      {settlement.length > 0 && (
        <div className="mb-8">
          <Settlement settlements={settlement} />
        </div>
      )}

      {/* Expense Form */}
      <div className="mb-8">
        <ExpenseForm onExpenseCreated={handleExpenseCreated} />
      </div>

      {/* Expense List */}
      <div>
        <ExpenseList expenses={expenses} />
      </div>
    </main>
  );
}
