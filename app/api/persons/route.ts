import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      orderBy: {
        isParent: 'desc', // Parents first
      },
    });

    return NextResponse.json(persons);
  } catch (error) {
    console.error('Error fetching persons:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Personen' }, { status: 500 });
  }
}
