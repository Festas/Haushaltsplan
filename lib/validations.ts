import { z } from 'zod';

/**
 * Validation schemas for expense management
 * All error messages are in German
 */

// Expense creation schema
export const createExpenseSchema = z.object({
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
  assignedPersonIds: z.array(z.string()).optional(),
});

// Expense assignment validation
export const expenseAssignmentSchema = z.object({
  assignedPersonIds: z
    .array(z.string())
    .min(1, 'Mindestens eine Person muss ausgewählt werden'),
});

// Validate ASSIGNED split type requires assignedPersonIds
export function validateExpenseWithAssignment(data: unknown) {
  const parsed = createExpenseSchema.parse(data);
  
  if (parsed.splitType === 'ASSIGNED') {
    if (!parsed.assignedPersonIds || parsed.assignedPersonIds.length === 0) {
      throw new Error('Bei "Zugewiesen" muss mindestens eine Person ausgewählt werden');
    }
  }
  
  return parsed;
}

// Type inference from schemas
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
