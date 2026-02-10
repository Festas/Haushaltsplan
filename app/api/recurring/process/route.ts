import { NextResponse } from 'next/server';
import { processRecurringExpenses } from '@/lib/expenses';

export async function POST() {
  try {
    await processRecurringExpenses();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing recurring expenses:', error);
    return NextResponse.json({ error: 'Fehler beim Verarbeiten wiederkehrender Ausgaben' }, { status: 500 });
  }
}
