'use client';

import { formatCurrency, formatDate } from '@/lib/expenses';

interface ExpenseListProps {
  expenses: any[];
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
        Noch keine Ausgaben vorhanden
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Ausgaben</h2>
      
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-medium text-lg">{expense.description}</div>
              <div className="text-sm text-gray-400 mt-1">
                {formatDate(expense.date)} • {expense.category.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Bezahlt von:</span>
              <span className="font-medium">{expense.payer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Aufteilung:</span>
              <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                {getSplitTypeLabel(expense.splitType)}
              </span>
            </div>
          </div>

          {expense.assignments && expense.assignments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Anteil:</div>
              <div className="flex flex-wrap gap-2">
                {expense.assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                  >
                    {assignment.person.name}: {formatCurrency(assignment.share)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
