import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.expenseAssignment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.person.deleteMany();

  // Create people
  const jenny = await prisma.person.create({
    data: {
      name: 'Jenny',
      isParent: true,
      income: 3500, // Monthly income in EUR
    },
  });

  const eric = await prisma.person.create({
    data: {
      name: 'Eric',
      isParent: true,
      income: 4500, // Monthly income in EUR
    },
  });

  const melina = await prisma.person.create({
    data: {
      name: 'Melina',
      isParent: false,
    },
  });

  const matheo = await prisma.person.create({
    data: {
      name: 'Matheo',
      isParent: false,
    },
  });

  // Create categories
  const lebensmittel = await prisma.category.create({
    data: { name: 'Lebensmittel' },
  });

  const miete = await prisma.category.create({
    data: { name: 'Miete' },
  });

  const transport = await prisma.category.create({
    data: { name: 'Transport' },
  });

  const kinderkosten = await prisma.category.create({
    data: { name: 'Kinderkosten' },
  });

  const sonstiges = await prisma.category.create({
    data: { name: 'Sonstiges' },
  });

  console.log('Created:', {
    persons: [jenny.name, eric.name, melina.name, matheo.name],
    categories: [lebensmittel.name, miete.name, transport.name, kinderkosten.name, sonstiges.name],
  });

  // Create a sample recurring expense (rent)
  await prisma.recurringExpense.create({
    data: {
      amount: 1500,
      description: 'Monatsmiete',
      payerId: jenny.id,
      categoryId: miete.id,
      splitType: 'WEIGHTED',
      frequency: 'monthly',
      startDate: new Date('2026-01-01'),
      isActive: true,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
