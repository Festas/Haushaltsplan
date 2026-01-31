'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check, DollarSign, User, Tag, Split } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  isParent: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  onExpenseCreated: () => void;
}

export default function ExpenseForm({ onExpenseCreated }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payerId, setPayerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [splitType, setSplitType] = useState<'EQUAL' | 'WEIGHTED' | 'ASSIGNED'>('EQUAL');
  const [assignedPersonIds, setAssignedPersonIds] = useState<string[]>([]);
  
  const [persons, setPersons] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [personsRes, categoriesRes] = await Promise.all([
      fetch('/api/persons'),
      fetch('/api/categories'),
    ]);

    const personsData = await personsRes.json();
    const categoriesData = await categoriesRes.json();

    setPersons(personsData);
    setCategories(categoriesData);

    // Set defaults
    if (personsData.length > 0) {
      setPayerId(personsData.find((p: Person) => p.isParent)?.id || personsData[0].id);
    }
    if (categoriesData.length > 0) {
      setCategoryId(categoriesData[0].id);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          payerId,
          categoryId,
          splitType,
          assignedPersonIds: splitType === 'ASSIGNED' ? assignedPersonIds : undefined,
        }),
      });

      if (response.ok) {
        // Reset form
        setAmount('');
        setDescription('');
        setSplitType('EQUAL');
        setAssignedPersonIds([]);
        setShowForm(false);
        onExpenseCreated();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleAssignedPerson(personId: string) {
    setAssignedPersonIds(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-glow transition-smooth hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center gap-3"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span>Neue Ausgabe hinzufügen</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm transition-smooth hover:border-primary-500/50 hover:shadow-glow animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-400" />
          </div>
          Neue Ausgabe
        </h2>
        <button
          onClick={() => setShowForm(false)}
          className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-smooth hover:rotate-90"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
            <DollarSign className="w-4 h-4 text-primary-400" />
            Betrag (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth backdrop-blur-sm"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
            <Tag className="w-4 h-4 text-primary-400" />
            Beschreibung
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth backdrop-blur-sm"
            placeholder="z.B. Einkauf bei Rewe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
            <User className="w-4 h-4 text-primary-400" />
            Bezahlt von
          </label>
          <select
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth backdrop-blur-sm"
          >
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} {person.isParent ? '(Elternteil)' : '(Kind)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
            <Tag className="w-4 h-4 text-primary-400" />
            Kategorie
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth backdrop-blur-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 flex items-center gap-2 text-gray-300">
            <Split className="w-4 h-4 text-primary-400" />
            Aufteilung
          </label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSplitType('EQUAL')}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-smooth ${
                splitType === 'EQUAL'
                  ? 'bg-gradient-to-r from-primary-600/20 to-primary-700/20 border-primary-500/50 shadow-glow'
                  : 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Gleichmäßig</div>
                  <div className="text-sm text-gray-400 mt-1">50:50 zwischen Eltern</div>
                </div>
                {splitType === 'EQUAL' && (
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-400" />
                  </div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSplitType('WEIGHTED')}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-smooth ${
                splitType === 'WEIGHTED'
                  ? 'bg-gradient-to-r from-primary-600/20 to-primary-700/20 border-primary-500/50 shadow-glow'
                  : 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Gewichtet</div>
                  <div className="text-sm text-gray-400 mt-1">Nach Einkommen aufgeteilt</div>
                </div>
                {splitType === 'WEIGHTED' && (
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-400" />
                  </div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSplitType('ASSIGNED')}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-smooth ${
                splitType === 'ASSIGNED'
                  ? 'bg-gradient-to-r from-primary-600/20 to-primary-700/20 border-primary-500/50 shadow-glow'
                  : 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Zugewiesen</div>
                  <div className="text-sm text-gray-400 mt-1">Für bestimmte Personen</div>
                </div>
                {splitType === 'ASSIGNED' && (
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-400" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {splitType === 'ASSIGNED' && (
          <div className="animate-slide-down">
            <label className="block text-sm font-medium mb-3 text-gray-300">Personen auswählen</label>
            <div className="space-y-2">
              {persons.map((person) => (
                <label
                  key={person.id}
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-smooth ${
                    assignedPersonIds.includes(person.id)
                      ? 'bg-primary-600/20 border border-primary-500/50'
                      : 'bg-gray-800/50 border border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={assignedPersonIds.includes(person.id)}
                    onChange={() => toggleAssignedPerson(person.id)}
                    className="mr-3 w-5 h-5 rounded accent-primary-500"
                  />
                  <span className="flex-1 font-medium">{person.name}</span>
                  {!person.isParent && (
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                      Kinderkosten 50:50
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-gray-700/50">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl border border-gray-600 hover:border-gray-500 transition-smooth hover:scale-[1.02] active:scale-[0.98]"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-glow transition-smooth hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Wird gespeichert...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Speichern</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
