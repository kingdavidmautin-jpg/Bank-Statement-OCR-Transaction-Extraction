import { ExtractionResult, Transaction } from '../types';

export const NIGERIAN_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-s-1',
    date: '2026-09-01',
    amount: -14500,
    description: 'POS PURCHASE - SHOPRITE IKEJA MALL',
    category: 'Food',
    notes: 'POS Ref: 20492819001 • Terminal ID: 203GTB',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-2',
    date: '2026-09-02',
    amount: 450000,
    description: 'SALARY CREDIT - TECHCORP WEST AFRICA',
    category: 'Salary',
    notes: 'NIP Inward Batch 9948271 • Sep 2026 Payroll',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-3',
    date: '2026-09-03',
    amount: -50000,
    description: 'TRANSFER TO BABATUNDE OLUWASEUN',
    category: 'Transfer',
    notes: 'Mobile App Transfer to Access Bank (0123984712)',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-4',
    date: '2026-09-05',
    amount: -25000,
    description: 'ATM CASH WITHDRAWAL - GTB MARINA BRANCH',
    category: 'ATM Withdrawal',
    notes: 'Card ending in 4921 • ATM Terminal 092',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-5',
    date: '2026-09-07',
    amount: -12500,
    description: 'IKEDC PREPAID ELECTRICITY TOKEN',
    category: 'Bills & Utilities',
    notes: 'Meter No: 0418299104 • Token sent via SMS',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-6',
    date: '2026-09-09',
    amount: -4500,
    description: 'AIRTIME PURCHASE - MTN VTU',
    category: 'Bills & Utilities',
    notes: 'Mobile Top-up to 08031234567',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-7',
    date: '2026-09-12',
    amount: 120000,
    description: 'INWARD TRANSFER FROM KUNLE ADESINA',
    category: 'Transfer',
    notes: 'Consulting services invoice settlement #402',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-8',
    date: '2026-09-14',
    amount: -8500,
    description: 'POS PURCHASE - HEALTHPLUS PHARMACY',
    category: 'Healthcare',
    notes: 'Medications and wellness vitamins',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-9',
    date: '2026-09-17',
    amount: -5500,
    description: 'UBER TRIP - VICTORIA ISLAND TO IKEJA',
    category: 'Transportation',
    notes: 'Ride ID: ng-ub-881920',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-10',
    date: '2026-09-20',
    amount: -4500,
    description: 'NETFLIX NIGERIA SUBSCRIPTION',
    category: 'Entertainment',
    notes: 'Monthly recurring card payment',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-11',
    date: '2026-09-22',
    amount: -53.75,
    description: 'ELECTRONIC MONEY TRANSFER LEVY (EMTL)',
    category: 'Fees & Charges',
    notes: 'Statutory CBN electronic levy on transfers',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-12',
    date: '2026-09-24',
    amount: -78500,
    description: 'PAYMENT TO SPAR SUPERMARKET LEKKI',
    category: 'Food',
    notes: 'Groceries & Household supplies',
    confidence: 'medium',
    needsReview: true,
    reviewReason: 'Faint ink on thermal slip line item',
  },
  {
    id: 'tx-s-13',
    date: '2026-09-27',
    amount: -180000,
    description: 'ANNUAL RESIDENTIAL SERVICE CHARGE',
    category: 'Rent',
    notes: 'Estate maintenance & security Q4 payment',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-s-14',
    date: '2026-09-29',
    amount: 35000,
    description: 'CASH DEPOSIT - MARINA BRANCH COUNTER',
    category: 'Cash Deposit',
    notes: 'Branch Teller Ref: TL-094821',
    confidence: 'high',
    needsReview: false,
  },
];

export const COMMERCIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-c-1',
    date: '2026-09-02',
    amount: 14500.0,
    description: 'CLIENT WIRE SETTLEMENT - ACME CORP',
    category: 'Business',
    notes: 'Invoice #2026-884 • Wire Ref: WIR99381',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-c-2',
    date: '2026-09-04',
    amount: -1850.5,
    description: 'AMAZON WEB SERVICES (AWS) CLOUD HOSTING',
    category: 'Bills & Utilities',
    notes: 'Account: 9481-9920-112 • Monthly compute fees',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-c-3',
    date: '2026-09-08',
    amount: -3400.0,
    description: 'WEWORK CO-WORKING OFFICE LEASE',
    category: 'Rent',
    notes: 'Dedicated desk & team room rental',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-c-4',
    date: '2026-09-11',
    amount: -450.0,
    description: 'GOOGLE WORKSPACE & CLOUD APPS',
    category: 'Bills & Utilities',
    notes: '15 Enterprise seats subscription',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-c-5',
    date: '2026-09-15',
    amount: 8250.0,
    description: 'STRIPE PAYOUT - ECOMMERCE SALES',
    category: 'Business',
    notes: 'Payout ID: po_1Mks8392 • Net platform sales',
    confidence: 'high',
    needsReview: false,
  },
  {
    id: 'tx-c-6',
    date: '2026-09-18',
    amount: -325.8,
    description: 'OFFICE DEPOT - STATIONERY & ERGONOMIC CHAIR',
    category: 'Shopping',
    notes: 'Card ending 8812 • Store 449',
    confidence: 'medium',
    needsReview: true,
    reviewReason: 'Tax split combined on single statement line',
  },
  {
    id: 'tx-c-7',
    date: '2026-09-22',
    amount: -12000.0,
    description: 'STAFF PAYROLL DISBURSEMENT',
    category: 'Salary',
    notes: 'Direct ACH Batch #09281',
    confidence: 'high',
    needsReview: false,
  },
];

/**
 * Creates an SVG bank statement visual representation for mock document preview
 */
export function generateSampleStatementSvg(
  bankName: string,
  currencySymbol: string,
  transactions: Transaction[]
): string {
  const rowsSvg = transactions
    .slice(0, 10)
    .map((tx, i) => {
      const y = 230 + i * 32;
      const isCredit = tx.amount > 0;
      const formattedAmount = Math.abs(tx.amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const debitText = !isCredit ? `${currencySymbol}${formattedAmount}` : '-';
      const creditText = isCredit ? `${currencySymbol}${formattedAmount}` : '-';

      return `
        <rect x="20" y="${y - 18}" width="760" height="26" fill="${i % 2 === 0 ? '#f8fafc' : '#ffffff'}" />
        <text x="30" y="${y}" font-family="monospace" font-size="11" fill="#334155">${tx.date}</text>
        <text x="120" y="${y}" font-family="sans-serif" font-weight="500" font-size="11" fill="#0f172a">${tx.description.substring(0, 36)}</text>
        <text x="460" y="${y}" font-family="monospace" font-size="11" fill="#b91c1c" text-anchor="end">${debitText}</text>
        <text x="580" y="${y}" font-family="monospace" font-size="11" fill="#15803d" text-anchor="end">${creditText}</text>
        <text x="700" y="${y}" font-family="monospace" font-size="11" fill="#64748b" text-anchor="end">${currencySymbol}1,240,500.00</text>
      `;
    })
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <rect width="800" height="600" fill="#ffffff" />
      <!-- Header -->
      <rect x="0" y="0" width="800" height="80" fill="#0f172a" />
      <text x="30" y="45" font-family="sans-serif" font-weight="700" font-size="20" fill="#ffffff">${bankName.toUpperCase()}</text>
      <text x="30" y="65" font-family="sans-serif" font-size="12" fill="#94a3b8">OFFICIAL ACCOUNT STATEMENT • CONFIDENTIAL</text>
      <text x="770" y="45" font-family="sans-serif" font-weight="600" font-size="13" fill="#38bdf8" text-anchor="end">STATEMENT PERIOD: SEP 01 - SEP 30, 2026</text>

      <!-- Account Info Cards -->
      <rect x="20" y="95" width="240" height="75" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
      <text x="35" y="118" font-family="sans-serif" font-size="10" fill="#64748b" font-weight="600">ACCOUNT HOLDER</text>
      <text x="35" y="138" font-family="sans-serif" font-size="14" fill="#0f172a" font-weight="700">DAVID A. MAUTIN</text>
      <text x="35" y="155" font-family="monospace" font-size="11" fill="#475569">ACCT: *******4920</text>

      <rect x="280" y="95" width="240" height="75" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
      <text x="295" y="118" font-family="sans-serif" font-size="10" fill="#64748b" font-weight="600">BRANCH &amp; CURRENCY</text>
      <text x="295" y="138" font-family="sans-serif" font-size="14" fill="#0f172a" font-weight="700">MARINA MAIN • ${currencySymbol}</text>
      <text x="295" y="155" font-family="sans-serif" font-size="11" fill="#475569">CLEARED FUNDS</text>

      <rect x="540" y="95" width="240" height="75" rx="6" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" />
      <text x="555" y="118" font-family="sans-serif" font-size="10" fill="#1e40af" font-weight="600">CLOSING BALANCE</text>
      <text x="555" y="142" font-family="sans-serif" font-size="18" fill="#1e3a8a" font-weight="800">${currencySymbol}1,240,500.00</text>
      <text x="555" y="158" font-family="sans-serif" font-size="10" fill="#3b82f6">AS OF 30-SEP-2026</text>

      <!-- Table Header -->
      <rect x="20" y="185" width="760" height="30" fill="#e2e8f0" rx="3" />
      <text x="30" y="205" font-family="sans-serif" font-weight="700" font-size="11" fill="#334155">VALUE DATE</text>
      <text x="120" y="205" font-family="sans-serif" font-weight="700" font-size="11" fill="#334155">NARRATION / REMARKS</text>
      <text x="460" y="205" font-family="sans-serif" font-weight="700" font-size="11" fill="#334155" text-anchor="end">DEBITS (${currencySymbol})</text>
      <text x="580" y="205" font-family="sans-serif" font-weight="700" font-size="11" fill="#334155" text-anchor="end">CREDITS (${currencySymbol})</text>
      <text x="700" y="205" font-family="sans-serif" font-weight="700" font-size="11" fill="#334155" text-anchor="end">BALANCE</text>

      <!-- Transaction Rows -->
      ${rowsSvg}

      <!-- Footer -->
      <line x1="20" y1="565" x2="780" y2="565" stroke="#e2e8f0" stroke-width="1" />
      <text x="30" y="582" font-family="sans-serif" font-size="10" fill="#94a3b8">PAGE 1 OF 1 • COMPUTER GENERATED STATEMENT OF ACCOUNT</text>
      <text x="770" y="582" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="end">SECURE BANKING SERVICES</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSampleNigerianStatement(): ExtractionResult {
  const transactions = [...NIGERIAN_SAMPLE_TRANSACTIONS];
  const totalCredits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  return {
    metadata: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountHolder: 'David A. Mautin',
      currency: 'NGN',
      currencySymbol: '₦',
      statementPeriod: '01 Sep 2026 - 30 Sep 2026',
      summaryDetected: {
        totalCredits,
        totalDebits,
        closingBalance: 1240500.0,
      },
    },
    transactions,
    originalFile: {
      name: 'gtbank-september-statement.pdf',
      size: 418290,
      type: 'image/svg+xml',
      previewUrl: generateSampleStatementSvg(
        'Guaranty Trust Bank',
        '₦',
        transactions
      ),
    },
  };
}

export function getSampleCommercialStatement(): ExtractionResult {
  const transactions = [...COMMERCIAL_SAMPLE_TRANSACTIONS];
  const totalCredits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  return {
    metadata: {
      bankName: 'JPMorgan Chase Commercial',
      accountHolder: 'Apex Digital LLC',
      currency: 'USD',
      currencySymbol: '$',
      statementPeriod: '01 Sep 2026 - 30 Sep 2026',
      summaryDetected: {
        totalCredits,
        totalDebits,
        closingBalance: 48920.0,
      },
    },
    transactions,
    originalFile: {
      name: 'chase-business-statement-sep.pdf',
      size: 320140,
      type: 'image/svg+xml',
      previewUrl: generateSampleStatementSvg(
        'JPMorgan Chase Bank',
        '$',
        transactions
      ),
    },
  };
}
