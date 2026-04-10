import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateRecurringSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'Betrag muss eine Zahl sein',
    })
    .refine((val) => parseFloat(val) > 0, {
      message: 'Betrag muss größer als 0 sein',
    })
    .optional(),
  description: z
    .string()
    .min(1, 'Beschreibung ist erforderlich')
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .optional(),
  payerId: z.string().min(1, 'Zahler ist erforderlich').optional(),
  categoryId: z.string().min(1, 'Kategorie ist erforderlich').optional(),
  splitType: z.enum(['EQUAL', 'WEIGHTED', 'ASSIGNED']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Ungültiges Startdatum',
    })
    .optional(),
  endDate: z
    .string()
    .nullable()
    .refine((val) => val === null || !val || !isNaN(Date.parse(val)), {
      message: 'Ungültiges Enddatum',
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let validatedData;
    try {
      validatedData = updateRecurringSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      return NextResponse.json({ error: 'Ungültige Eingabedaten' }, { status: 400 });
    }

    const existing = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Wiederkehrende Ausgabe nicht gefunden' },
        { status: 404 }
      );
    }

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: {
        amount: validatedData.amount !== undefined ? parseFloat(validatedData.amount) : undefined,
        description: validatedData.description,
        payerId: validatedData.payerId,
        categoryId: validatedData.categoryId,
        splitType: validatedData.splitType,
        frequency: validatedData.frequency,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate !== undefined
          ? (validatedData.endDate ? new Date(validatedData.endDate) : null)
          : undefined,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der wiederkehrenden Ausgabe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Wiederkehrende Ausgabe nicht gefunden' },
        { status: 404 }
      );
    }

    await prisma.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Wiederkehrende Ausgabe erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der wiederkehrenden Ausgabe' },
      { status: 500 }
    );
  }
}
