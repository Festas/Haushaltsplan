import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

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
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        description: body.description,
        payerId: body.payerId,
        categoryId: body.categoryId,
        splitType: body.splitType,
        frequency: body.frequency,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined,
        isActive: body.isActive,
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
