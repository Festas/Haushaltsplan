import { NextResponse } from 'next/server';
import { calculateSettlement } from '@/lib/expenses';

export async function GET() {
  try {
    const settlements = await calculateSettlement();
    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Error calculating settlement:', error);
    return NextResponse.json({ error: 'Failed to calculate settlement' }, { status: 500 });
  }
}
