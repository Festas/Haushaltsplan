'use client';

import { Calendar, Filter } from 'lucide-react';

export type FilterPeriod = 'all' | 'thisMonth' | 'lastMonth' | 'thisYear';

interface ExpenseFilterProps {
  selectedPeriod: FilterPeriod;
  onPeriodChange: (period: FilterPeriod) => void;
}

export default function ExpenseFilter({ selectedPeriod, onPeriodChange }: ExpenseFilterProps) {
  const filters: { value: FilterPeriod; label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: 'thisMonth', label: 'Dieser Monat' },
    { value: 'lastMonth', label: 'Letzter Monat' },
    { value: 'thisYear', label: 'Dieses Jahr' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm transition-smooth hover:border-primary-500/50 hover:shadow-glow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <Filter className="w-5 h-5 text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold">Zeitraum filtern</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onPeriodChange(filter.value)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth flex items-center gap-2 ${
              selectedPeriod === filter.value
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow'
                : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
