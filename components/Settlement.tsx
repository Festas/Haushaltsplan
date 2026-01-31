'use client';

import { formatCurrency } from '@/lib/expenses';

interface SettlementItem {
  from: string;
  to: string;
  amount: number;
}

interface SettlementProps {
  settlements: SettlementItem[];
}

export default function Settlement({ settlements }: SettlementProps) {
  if (settlements.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-700/50">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        💰 Abrechnung
      </h2>
      
      <div className="space-y-3">
        {settlements.map((settlement, index) => (
          <div
            key={index}
            className="bg-gray-900/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-lg">{settlement.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-lg">{settlement.to}</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(settlement.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
