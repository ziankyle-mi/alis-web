export const FINE_PER_DAY = 5;

export interface FineCalculationResult {
  daysOverdue: number;
  overdueFine: number;
  customFine: number;
  totalFine: number;
  statusDisplay: string;
}

export function calculateFine(
  returnDateStr: string | Date,
  actualReturnDateStr?: string | Date | null,
  customFine: number = 0,
  finePaid: boolean = false,
  status: string = 'borrowed'
): FineCalculationResult {
  const returnDate = new Date(returnDateStr);
  const endDate = actualReturnDateStr ? new Date(actualReturnDateStr) : new Date();

  // Reset time portions to compare calendar dates
  returnDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let daysOverdue = 0;
  if (endDate > returnDate) {
    const diffTime = Math.abs(endDate.getTime() - returnDate.getTime());
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const overdueFine = daysOverdue * FINE_PER_DAY;
  const totalFine = overdueFine + customFine;

  let statusDisplay = 'Active';
  if (status === 'damaged') {
    statusDisplay = '⚠ Damaged';
  } else if (status === 'lost') {
    statusDisplay = '✗ Lost';
  } else if (daysOverdue > 0 && !finePaid) {
    statusDisplay = 'Overdue';
  } else if (finePaid) {
    statusDisplay = 'Paid';
  }

  return {
    daysOverdue,
    overdueFine,
    customFine,
    totalFine,
    statusDisplay,
  };
}
