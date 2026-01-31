'use client';

import { useState, useEffect } from 'react';

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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
      >
        + Neue Ausgabe hinzufügen
      </button>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Neue Ausgabe</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Betrag (€)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Beschreibung</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Einkauf bei Rewe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bezahlt von</label>
          <select
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} {person.isParent ? '(Elternteil)' : '(Kind)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Kategorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Aufteilung</label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSplitType('EQUAL')}
              className={`w-full text-left px-4 py-3 rounded-lg border ${
                splitType === 'EQUAL'
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">Gleichmäßig</div>
              <div className="text-sm text-gray-400">50:50 zwischen Eltern</div>
            </button>

            <button
              type="button"
              onClick={() => setSplitType('WEIGHTED')}
              className={`w-full text-left px-4 py-3 rounded-lg border ${
                splitType === 'WEIGHTED'
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">Gewichtet</div>
              <div className="text-sm text-gray-400">Nach Einkommen aufgeteilt</div>
            </button>

            <button
              type="button"
              onClick={() => setSplitType('ASSIGNED')}
              className={`w-full text-left px-4 py-3 rounded-lg border ${
                splitType === 'ASSIGNED'
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">Zugewiesen</div>
              <div className="text-sm text-gray-400">Für bestimmte Personen</div>
            </button>
          </div>
        </div>

        {splitType === 'ASSIGNED' && (
          <div>
            <label className="block text-sm font-medium mb-2">Personen auswählen</label>
            <div className="space-y-2">
              {persons.map((person) => (
                <label
                  key={person.id}
                  className="flex items-center px-4 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={assignedPersonIds.includes(person.id)}
                    onChange={() => toggleAssignedPerson(person.id)}
                    className="mr-3 w-4 h-4"
                  />
                  <span>{person.name}</span>
                  {!person.isParent && (
                    <span className="ml-2 text-xs text-gray-400">(Kinderkosten 50:50)</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
