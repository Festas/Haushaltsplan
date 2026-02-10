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

    const { amount, description, payerId, categoryId, splitType, assignedPersonIds } = validatedData;

    // Calculate shares
    const shares = await calculateExpenseShares(
      parseFloat(amount),
      splitType,
      assignedPersonIds
    );

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        payerId,
        categoryId,
        splitType,
      },
      include: {
        payer: true,
        category: true,
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

    // Fetch the complete expense with assignments
    const completeExpense = await prisma.expense.findUnique({
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

    return NextResponse.json(completeExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Ausgabe' }, { status: 500 });
  }
}
