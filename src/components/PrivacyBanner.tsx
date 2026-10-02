import React, { useState } from 'react';
import { Lock, Shield, X, Info } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 text-slate-200 text-xs sm:text-sm py-2.5 px-4 sm:px-6 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-blue-500/20 text-blue-400 shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <p className="leading-snug">
            <strong className="font-semibold text-white">Bank-Grade Privacy:</strong>{' '}
            Bank statements contain sensitive financial data. Uploaded documents are processed in-memory for transaction extraction only and are never permanently stored or shared.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
          aria-label="Dismiss privacy notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
