/**
 * Central type definitions based on Prisma schema
 */

export interface Person {
  id: string;
  name: string;
  isParent: boolean;
  income?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ExpenseAssignment {
  id: string;
  expenseId: string;
  personId: string;
  share: number;
  createdAt: Date;
  person: Person;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Date | string;
  payerId: string;
  categoryId: string;
  splitType: string;
  recurringExpenseId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  payer: Person;
  category: Category;
  assignments: ExpenseAssignment[];
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  payerId: string;
  categoryId: string;
  splitType: string;
  frequency: string;
  startDate: Date;
  endDate?: Date | null;
  lastCreated?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Stats {
  total: number;
  thisMonth: number;
}
