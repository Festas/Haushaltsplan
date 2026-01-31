'use client';

import { formatCurrency } from '@/lib/expenses';
import { ArrowRight, DollarSign, Sparkles } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-2xl">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-accent-900/40" />
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-accent-500/30 shadow-accent-glow" />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-pink-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Abrechnung
              <Sparkles className="w-5 h-5 text-accent-400 animate-pulse" aria-hidden="true" />
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Offene Beträge</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {settlements.map((settlement, index) => (
            <div
              key={index}
              className="glass rounded-xl p-5 border border-white/5 hover:border-accent-500/30 transition-smooth group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* From Person */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-red-400">
                        {settlement.from.charAt(0)}
                      </span>
                    </div>
                    <span className="font-semibold text-lg text-white">{settlement.from}</span>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex items-center gap-2 px-3">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-accent-500/50 to-green-500/50 group-hover:from-accent-500 group-hover:to-green-500 transition-smooth" />
                    <ArrowRight className="w-5 h-5 text-accent-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  {/* To Person */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-400">
                        {settlement.to.charAt(0)}
                      </span>
                    </div>
                    <span className="font-semibold text-lg text-white">{settlement.to}</span>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="flex-shrink-0 ml-4">
                  <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400 tracking-tight">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Info Footer */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" aria-hidden="true" />
            Automatisch berechnet basierend auf allen Ausgaben
          </p>
        </div>
      </div>
    </div>
  );
}
