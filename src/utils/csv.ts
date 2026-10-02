import { Transaction } from '../types';

/**
 * Escapes a single CSV value according to RFC 4180 standards:
 * - Wrap in quotes if it contains commas, double quotes, or newlines
 * - Double quotes inside are escaped with two double quotes ("")
 */
export function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates valid CSV string containing EXACTLY the 5 specified columns:
 * Date,Amount,Description,Category,Notes
 */
export function generateTransactionsCsv(transactions: Transaction[]): string {
  const headers = ['Date', 'Amount', 'Description', 'Category', 'Notes'];
  const headerLine = headers.join(',');

  const rows = transactions.map(tx => {
    // Ensure amount is formatted as clean number (e.g. -5000 or 150000 or -25.50)
    const amountVal = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0));
    const safeAmount = isNaN(amountVal) ? '0' : amountVal.toString();

    return [
      escapeCsvValue(tx.date || ''),
      safeAmount,
      escapeCsvValue(tx.description || ''),
      escapeCsvValue(tx.category || 'Other'),
      escapeCsvValue(tx.notes || ''),
    ].join(',');
  });

  return [headerLine, ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the CSV file
 */
export function downloadCsv(
  transactions: Transaction[],
  fileName: string = 'bank-statement-transactions.csv'
): void {
  const csvContent = generateTransactionsCsv(transactions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a currency amount with symbol and thousands separators
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isNegative) {
    return `-${symbol}${formatted}`;
  }
  return `+${symbol}${formatted}`;
}
