import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      where: { isParent: true },
    });

    const expenses = await prisma.expense.findMany({
      include: {
        payer: true,
        assignments: {
          include: { person: true },
        },
      },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const perPerson = persons.map((person) => {
      // Total paid by this person
      const totalPaid = expenses
        .filter((e) => e.payerId === person.id)
        .reduce((sum, e) => sum + e.amount, 0);

      // Total owed by this person (from assignments)
      const totalOwed = expenses.reduce((sum, e) => {
        const assignment = e.assignments.find(
          (a) => a.personId === person.id
        );
        return sum + (assignment?.share ?? 0);
      }, 0);

      // This month stats
      const thisMonthExpenses = expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const thisMonthPaid = thisMonthExpenses
        .filter((e) => e.payerId === person.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const thisMonthOwed = thisMonthExpenses.reduce((sum, e) => {
        const assignment = e.assignments.find(
          (a) => a.personId === person.id
        );
        return sum + (assignment?.share ?? 0);
      }, 0);

      return {
        personId: person.id,
        personName: person.name,
        totalPaid,
        totalOwed,
        balance: totalPaid - totalOwed,
        thisMonthPaid,
        thisMonthOwed,
        expenseCount: expenses.filter((e) => e.payerId === person.id).length,
      };
    });

    return NextResponse.json(perPerson);
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { error: 'Fehler beim Berechnen der Statistiken' },
      { status: 500 }
    );
  }
}
