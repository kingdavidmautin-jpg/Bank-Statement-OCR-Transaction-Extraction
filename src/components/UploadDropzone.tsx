import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  onLoadSample: (type: 'nigerian' | 'commercial') => void;
  isProcessing: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  onLoadSample,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = (file: File) => {
    setErrorMsg(null);
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf' || file.type.includes('pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileName);

    if (!isPdf && !isImage) {
      setErrorMsg(
        'Unsupported file format. Please upload a bank statement in PDF, PNG, JPG, or JPEG format.'
      );
      return;
    }

    // Limit to 40MB
    if (file.size > 40 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum supported document size is 40MB.');
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
    // Reset input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Intelligent Document Vision &amp; Extraction</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Upload Bank Statement
        </h2>
        <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
          Extract dates, transaction descriptions, debits, credits, and AI-categorized rows into clean spreadsheet-ready CSV.
        </p>
      </div>

      {/* Main Drag-Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!isProcessing) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01] shadow-lg shadow-blue-500/10'
            : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-slate-50/50 shadow-xs'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
              isDragOver
                ? 'bg-blue-600 text-white scale-110 shadow-md shadow-blue-600/30'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <p className="text-lg font-bold text-slate-900 mb-1">
            Drag and drop your bank statement here
          </p>
          <p className="text-sm text-slate-500 mb-5">
            or click anywhere to browse from your computer
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isProcessing) {
                fileInputRef.current?.click();
              }
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer z-10"
          >
            Select Document File
          </button>

          {/* Formats Info */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
              <FileText className="w-3.5 h-3.5 text-red-500" /> PDF Document
            </span>
            <span className="flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> JPG / JPEG / PNG
            </span>
            <span className="text-slate-400">• Up to 40MB</span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload failed</p>
            <p className="text-xs mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Feature Capabilities Checklist */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Scanned &amp; Digital PDFs
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports scanned multi-page statements, camera photos, and digital e-statements.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Debits vs. Credits
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Accurately extracts amounts and prevents confusing account balances with transaction amounts.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Auto Categorization
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Assigns intelligent categories like Salary, Transfer, Utilities, Food, and Rent.
            </p>
          </div>
        </div>
      </div>

      {/* Sample Statement Testing Callout */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                Instant Demo
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Don&apos;t have a bank statement ready right now?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Try a realistic sample statement to preview extraction, review interface, and CSV download.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onLoadSample('nigerian')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              <span>Load Nigerian Statement (₦)</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => onLoadSample('commercial')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              <span>Load Business Statement ($)</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
