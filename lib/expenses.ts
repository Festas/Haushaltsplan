import { prisma } from './db';

export type SplitType = 'EQUAL' | 'WEIGHTED' | 'ASSIGNED';

export interface ExpenseShare {
  personId: string;
  personName: string;
  share: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

/**
 * Calculate expense shares based on split type
 */
export async function calculateExpenseShares(
  amount: number,
  splitType: SplitType,
  assignedPersonIds?: string[]
): Promise<ExpenseShare[]> {
  const persons = await prisma.person.findMany();
  const parents = persons.filter(p => p.isParent);
  const kids = persons.filter(p => !p.isParent);

  switch (splitType) {
    case 'EQUAL':
      // Split equally between parents only
      const equalShare = amount / parents.length;
      return parents.map(p => ({
        personId: p.id,
        personName: p.name,
        share: equalShare,
      }));

    case 'WEIGHTED':
      // Split based on income ratio
      const totalIncome = parents.reduce((sum, p) => sum + (p.income || 0), 0);
      return parents.map(p => ({
        personId: p.id,
        personName: p.name,
        share: totalIncome > 0 ? (amount * (p.income || 0)) / totalIncome : 0,
      }));

    case 'ASSIGNED':
      // Assigned to specific people
      if (!assignedPersonIds || assignedPersonIds.length === 0) {
        return [];
      }

      const assignedPersons = persons.filter(p => assignedPersonIds.includes(p.id));
      const assignedKids = assignedPersons.filter(p => !p.isParent);
      const assignedParents = assignedPersons.filter(p => p.isParent);

      // If kids are assigned, parents split 50:50
      if (assignedKids.length > 0 && parents.length > 0) {
        const sharePerParent = amount / parents.length;
        return parents.map(p => ({
          personId: p.id,
          personName: p.name,
          share: sharePerParent,
        }));
      }

      // Otherwise split among assigned persons
      const sharePerPerson = amount / assignedPersons.length;
      return assignedPersons.map(p => ({
        personId: p.id,
        personName: p.name,
        share: sharePerPerson,
      }));

    default:
      return [];
  }
}

/**
 * Calculate settlement between Jenny and Eric
 */
export async function calculateSettlement(): Promise<Settlement[]> {
  const expenses = await prisma.expense.findMany({
    include: {
      payer: true,
      assignments: {
        include: {
          person: true,
        },
      },
    },
  });

  const persons = await prisma.person.findMany({
    where: { isParent: true },
  });

  if (persons.length !== 2) {
    return [];
  }

  const [person1, person2] = persons;
  
  // Track what each person paid and owes
  const balances: Record<string, number> = {
    [person1.id]: 0,
    [person2.id]: 0,
  };

  expenses.forEach(expense => {
    // Add what the payer paid
    balances[expense.payerId] = (balances[expense.payerId] || 0) + expense.amount;

    // Subtract what each person owes
    expense.assignments.forEach(assignment => {
      if (assignment.person.isParent) {
        balances[assignment.personId] = (balances[assignment.personId] || 0) - assignment.share;
      }
    });
  });

  // Calculate net settlement
  const netBalance = balances[person1.id] - balances[person2.id];
  
  if (Math.abs(netBalance) < 0.01) {
    return []; // No settlement needed
  }

  if (netBalance > 0) {
    return [{
      from: person2.name,
      to: person1.name,
      amount: Math.abs(netBalance),
    }];
  } else {
    return [{
      from: person1.name,
      to: person2.name,
      amount: Math.abs(netBalance),
    }];
  }
}

/**
 * Process recurring expenses
 */
export async function processRecurringExpenses() {
  const now = new Date();
  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: { isActive: true },
  });

  for (const recurring of recurringExpenses) {
    const shouldCreate = shouldCreateExpense(recurring, now);
    
    if (shouldCreate) {
      // Calculate shares
      const shares = await calculateExpenseShares(
        recurring.amount,
        recurring.splitType as SplitType
      );

      // Create expense
      const expense = await prisma.expense.create({
        data: {
          amount: recurring.amount,
          description: recurring.description,
          payerId: recurring.payerId,
          categoryId: recurring.categoryId,
          splitType: recurring.splitType,
          recurringExpenseId: recurring.id,
          date: now,
        },
      });

      // Create assignments
      await Promise.all(
        shares.map(share =>
          prisma.expenseAssignment.create({
            data: {
              expenseId: expense.id,
              personId: share.personId,
              share: share.share,
            },
          })
        )
      );

      // Update lastCreated
      await prisma.recurringExpense.update({
        where: { id: recurring.id },
        data: { lastCreated: now },
      });
    }
  }
}

function shouldCreateExpense(recurring: any, now: Date): boolean {
  if (!recurring.lastCreated) {
    return true;
  }

  const lastCreated = new Date(recurring.lastCreated);
  const daysSince = Math.floor((now.getTime() - lastCreated.getTime()) / (1000 * 60 * 60 * 24));

  switch (recurring.frequency) {
    case 'daily':
      return daysSince >= 1;
    case 'weekly':
      return daysSince >= 7;
    case 'monthly':
      return daysSince >= 30;
    case 'yearly':
      return daysSince >= 365;
    default:
      return false;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}
