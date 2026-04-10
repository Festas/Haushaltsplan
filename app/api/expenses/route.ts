import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateExpenseShares } from '@/lib/expenses';
import { validateExpenseWithAssignment } from '@/lib/validations';
import { z } from 'zod';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        payer: true,
        category: true,
        assignments: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Ausgaben' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    let validatedData;
    try {
      validatedData = validateExpenseWithAssignment(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(e => e.message).join(', ');
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Ungültige Eingabedaten' }, { status: 400 });
    }

    const { amount, description, date, payerId, categoryId, splitType, assignedPersonIds } = validatedData;

    // Calculate shares
    const shares = await calculateExpenseShares(
      parseFloat(amount),
      splitType,
      assignedPersonIds
    );

    // Create expense and assignments atomically
    const completeExpense = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          amount: parseFloat(amount),
          description,
          date: date ? new Date(date) : new Date(),
          payerId,
          categoryId,
          splitType,
        },
      });

      await Promise.all(
        shares.map(share =>
          tx.expenseAssignment.create({
            data: {
              expenseId: expense.id,
              personId: share.personId,
              share: share.share,
            },
          })
        )
      );

      return tx.expense.findUnique({
        where: { id: expense.id },
        include: {
          payer: true,
          category: true,
          assignments: {
            include: {
              person: true,
            },
          },
        },
      });
    });

    return NextResponse.json(completeExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Ausgabe' }, { status: 500 });
  }
}
