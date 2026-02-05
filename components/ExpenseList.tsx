'use client';

import { formatCurrency, formatDate } from '@/lib/expenses';
import { Calendar, User, PieChart, Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: any[];
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm transition-smooth hover:border-primary-500/50 hover:shadow-glow text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-gray-500" aria-hidden="true" />
        </div>
        <p className="text-gray-400 text-lg">Noch keine Ausgaben vorhanden</p>
        <p className="text-gray-500 text-sm mt-2">Fügen Sie Ihre erste Ausgabe hinzu</p>
      </div>
    );
  }

  const getSplitTypeLabel = (type: string) => {
    switch (type) {
      case 'EQUAL':
        return '50:50';
      case 'WEIGHTED':
        return 'Gewichtet';
      case 'ASSIGNED':
        return 'Zugewiesen';
      default:
        return type;
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      'Lebensmittel': 'from-green-500 to-emerald-600',
      'Miete': 'from-blue-500 to-cyan-600',
      'Transport': 'from-yellow-500 to-orange-600',
      'Kinderkosten': 'from-pink-500 to-rose-600',
      'Sonstiges': 'from-purple-500 to-indigo-600',
    };
    return colors[categoryName] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-accent-400" />
        </div>
        <h2 className="text-2xl font-bold">Ausgaben</h2>
        <div className="ml-auto px-4 py-1.5 bg-gray-800/50 rounded-xl text-sm text-gray-400 border border-gray-700/50">
          {expenses.length} {expenses.length === 1 ? 'Eintrag' : 'Einträge'}
        </div>
      </div>
      
      {expenses.map((expense, index) => (
        <div
          key={expense.id}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm transition-smooth hover:border-primary-500/50 hover:shadow-glow group animate-fade-in"
          style={index < 10 ? { animationDelay: `${index * 50}ms` } : undefined}
        >
          <div className="flex items-start gap-4">
            {/* Category Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(expense.category.name)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Receipt className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-white mb-1 truncate">
                    {expense.description}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getCategoryColor(expense.category.name)} text-white`}>
                      {expense.category.name}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-700/50 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Bezahlt von:</span>
                  <span className="font-medium text-gray-200">{expense.payer.name}</span>
                </div>
                <span className="text-gray-700">|</span>
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Aufteilung:</span>
                  <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-xs font-medium border border-primary-500/20">
                    {getSplitTypeLabel(expense.splitType)}
                  </span>
                </div>
              </div>

              {/* Assignments */}
              {expense.assignments && expense.assignments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="text-xs font-medium text-gray-400 mb-2.5">Anteil:</div>
                  <div className="flex flex-wrap gap-2">
                    {expense.assignments.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        className="px-3 py-2 bg-gray-800/50 rounded-xl text-sm border border-gray-700/50 hover:border-primary-500/30 transition-smooth"
                      >
                        <span className="font-medium text-gray-200">{assignment.person.name}</span>
                        <span className="text-gray-500 mx-1.5">·</span>
                        <span className="text-primary-400 font-semibold">{formatCurrency(assignment.share)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
