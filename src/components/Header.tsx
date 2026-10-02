import React from 'react';
import { FileSpreadsheet, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  onLoadSample: (type: 'nigerian' | 'commercial') => void;
  hasTransactions: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, hasTransactions, onReset }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Bank Statement OCR
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  AI-Powered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 hidden md:block">
                Upload a bank statement and automatically convert transactions into structured CSV data.
              </p>
            </div>
          </div>

          {/* Right Action / Privacy / Sample triggers */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>In-Memory Private Session</span>
            </div>

            {!hasTransactions && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onLoadSample('nigerian')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                  title="Try sample statement with Nigerian Naira transactions"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sample (₦ NGN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('commercial')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                  title="Try sample statement with USD commercial transactions"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sample ($ USD)</span>
                </button>
              </div>
            )}

            {hasTransactions && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                Upload New Statement
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
