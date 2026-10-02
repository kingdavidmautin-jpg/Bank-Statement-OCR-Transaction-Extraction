export type Category =
  | 'Salary'
  | 'Transfer'
  | 'Food'
  | 'Shopping'
  | 'Transportation'
  | 'Bills & Utilities'
  | 'Rent'
  | 'Banking'
  | 'ATM Withdrawal'
  | 'Cash Deposit'
  | 'Healthcare'
  | 'Education'
  | 'Entertainment'
  | 'Business'
  | 'Investment'
  | 'Fees & Charges'
  | 'Government'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Salary',
  'Transfer',
  'Food',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Rent',
  'Banking',
  'ATM Withdrawal',
  'Cash Deposit',
  'Healthcare',
  'Education',
  'Entertainment',
  'Business',
  'Investment',
  'Fees & Charges',
  'Government',
  'Other',
];

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // Negative for debits/outflow, positive for credits/inflow
  description: string;
  category: Category | string;
  notes: string;
  confidence?: 'high' | 'medium' | 'low';
  needsReview?: boolean;
  reviewReason?: string;
}

export interface StatementMetadata {
  bankName: string;
  accountHolder?: string;
  currency: string;
  currencySymbol: string;
  statementPeriod?: string;
  summaryDetected?: {
    totalDebits?: number;
    totalCredits?: number;
    closingBalance?: number;
  };
}

export interface ExtractionResult {
  metadata: StatementMetadata;
  transactions: Transaction[];
  originalFile?: {
    name: string;
    size: number;
    type: string;
    previewUrl: string;
    base64?: string;
  };
}

export type SortField = 'date' | 'amount' | 'description' | 'category';
export type SortDirection = 'asc' | 'desc';

export type FilterType = 'all' | 'credits' | 'debits' | 'needsReview';
