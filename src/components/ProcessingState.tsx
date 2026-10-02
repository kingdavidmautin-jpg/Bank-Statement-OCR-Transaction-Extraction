import React, { useEffect, useState } from 'react';
import { Loader2, FileText, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

interface ProcessingStateProps {
  fileName: string;
  fileSize?: number;
  previewUrl?: string;
  isPdf?: boolean;
}

const STEPS = [
  { label: 'Reading file & pre-processing...', duration: 2500 },
  { label: 'Analyzing statement layout & running OCR...', duration: 4000 },
  { label: 'Identifying debit & credit transactions...', duration: 4500 },
  { label: 'Categorizing transactions & normalizing dates...', duration: 3500 },
  { label: 'Preparing results table...', duration: 2000 },
];

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  fileName,
  fileSize,
  previewUrl,
  isPdf,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeoutId: any;
    if (currentStepIndex < STEPS.length - 1) {
      timeoutId = setTimeout(() => {
        setCurrentStepIndex(prev => Math.min(prev + 1, STEPS.length - 1));
      }, STEPS[currentStepIndex].duration);
    }
    return () => clearTimeout(timeoutId);
  }, [currentStepIndex]);

  const formattedSize = fileSize
    ? fileSize > 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(fileSize / 1024)} KB`
    : '';

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        {/* Animated Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-25" />
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
          Analyzing Bank Statement
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Extracting transactions, debits, credits, and details with OCR vision.
        </p>

        {/* Current Document Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-full truncate">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold truncate">{fileName}</span>
          {formattedSize && <span className="text-slate-400">({formattedSize})</span>}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 mb-6">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(95, ((currentStepIndex + 1) / STEPS.length) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400 font-mono">
            <span>Stage {currentStepIndex + 1} of {STEPS.length}</span>
            <span>{elapsedSeconds}s elapsed</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 text-left max-w-md mx-auto pt-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 text-xs sm:text-sm p-2 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-blue-50/80 text-blue-900 font-medium'
                    : isCompleted
                    ? 'text-slate-600'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className="flex-1">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Powered by Gemini document intelligence vision</span>
        </div>
      </div>
    </div>
  );
};
