import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createRecurringSchema = z.object({
  amount: z
    .string()
    .min(1, 'Betrag ist erforderlich')
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'Betrag muss eine Zahl sein',
    })
    .refine((val) => parseFloat(val) > 0, {
      message: 'Betrag muss größer als 0 sein',
    }),
  description: z
    .string()
    .min(1, 'Beschreibung ist erforderlich')
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein'),
  payerId: z.string().min(1, 'Zahler ist erforderlich'),
  categoryId: z.string().min(1, 'Kategorie ist erforderlich'),
  splitType: z.enum(['EQUAL', 'WEIGHTED', 'ASSIGNED'], {
    message: 'Ungültiger Aufteilungstyp',
  }),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    message: 'Ungültige Häufigkeit',
  }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ungültiges Startdatum',
  }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Ungültiges Enddatum',
    }),
});

export async function GET() {
  try {
    const recurringExpenses = await prisma.recurringExpense.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(recurringExpenses);
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der wiederkehrenden Ausgaben' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let validatedData;
    try {
      validatedData = createRecurringSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      return NextResponse.json({ error: 'Ungültige Eingabedaten' }, { status: 400 });
    }

    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        amount: parseFloat(validatedData.amount),
        description: validatedData.description,
        payerId: validatedData.payerId,
        categoryId: validatedData.categoryId,
        splitType: validatedData.splitType,
        frequency: validatedData.frequency,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isActive: true,
      },
    });

    return NextResponse.json(recurringExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der wiederkehrenden Ausgabe' },
      { status: 500 }
    );
  }
}
