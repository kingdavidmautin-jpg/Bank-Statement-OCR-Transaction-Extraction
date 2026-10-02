import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, Building2, Calendar, Scale } from 'lucide-react';
import { StatementMetadata, Transaction } from '../types';
import { formatCurrency } from '../utils/csv';

interface SummaryCardsProps {
  metadata: StatementMetadata;
  transactions: Transaction[];
  onFilterReview: () => void;
  reviewFilterActive: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metadata,
  transactions,
  onFilterReview,
  reviewFilterActive,
}) => {
  const currencySymbol = metadata.currencySymbol || '$';

  // Calculate totals
  const totalCredits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const netCashflow = totalCredits - totalDebits;
  const reviewCount = transactions.filter(t => t.needsReview).length;

  return (
    <div className="space-y-4">
      {/* Top Meta Strip: Bank Name & Statement Period */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block font-medium">Institution</span>
            <span className="font-bold text-slate-900">{metadata.bankName || 'Bank Statement'}</span>
          </div>
        </div>

        {metadata.statementPeriod && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-medium">Statement Period</span>
              <span className="font-semibold text-slate-800">{metadata.statementPeriod}</span>
            </div>
          </div>
        )}

        {metadata.accountHolder && (
          <div className="hidden md:flex items-center gap-2">
            <div>
              <span className="text-slate-400 text-xs block font-medium">Account</span>
              <span className="font-semibold text-slate-800">{metadata.accountHolder}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            OCR Extraction Complete
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Transactions Found */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Transactions Found
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {transactions.length}
            </span>
            <span className="text-xs text-slate-500">records</span>
          </div>
        </div>

        {/* Total Inflows / Credits */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Total Credits (Inflow)
            </span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
              +{currencySymbol}
              {totalCredits.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {transactions.filter(t => t.amount > 0).length} deposits
            </span>
          </div>
        </div>

        {/* Total Outflows / Debits */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Total Debits (Outflow)
            </span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600 tracking-tight">
              -{currencySymbol}
              {totalDebits.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {transactions.filter(t => t.amount < 0).length} withdrawals
            </span>
          </div>
        </div>

        {/* Net Flow / Review Alert */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Cashflow
            </span>
            <Scale className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2">
            <span
              className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                netCashflow >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {netCashflow >= 0 ? '+' : '-'}
              {currencySymbol}
              {Math.abs(netCashflow).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {reviewCount > 0 && (
            <button
              onClick={onFilterReview}
              className={`mt-2 flex items-center justify-between text-xs font-medium px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                reviewFilterActive
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{reviewCount} flagged for review</span>
              </span>
              <span className="underline font-bold">
                {reviewFilterActive ? 'View all' : 'Review'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
