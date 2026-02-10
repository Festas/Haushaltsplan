import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateExpenseShares } from '@/lib/expenses';
import { validateExpenseWithAssignment } from '@/lib/validations';
import { z } from 'zod';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Ausgabe nicht gefunden' }, { status: 404 });
    }

    // Calculate new shares
    const shares = await calculateExpenseShares(
      parseFloat(amount),
      splitType,
      assignedPersonIds
    );

    // Update expense and delete old assignments in a transaction
    const updatedExpense = await prisma.$transaction(async (tx) => {
      // Delete old assignments
      await tx.expenseAssignment.deleteMany({
        where: { expenseId: id },
      });

      // Update expense
      const expense = await tx.expense.update({
        where: { id },
        data: {
          amount: parseFloat(amount),
          description,
          payerId,
          categoryId,
          splitType,
        },
      });

      // Create new assignments
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

      return expense;
    });

    // Fetch the complete updated expense with assignments
    const completeExpense = await prisma.expense.findUnique({
      where: { id },
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

    return NextResponse.json(completeExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Ausgabe' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Ausgabe nicht gefunden' }, { status: 404 });
    }

    // Delete expense (cascade will handle assignments)
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Ausgabe erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen der Ausgabe' }, { status: 500 });
  }
}
