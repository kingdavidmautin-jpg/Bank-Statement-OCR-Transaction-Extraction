/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { UploadDropzone } from './components/UploadDropzone';
import { ProcessingState } from './components/ProcessingState';
import { SummaryCards } from './components/SummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { DocumentViewer } from './components/DocumentViewer';
import { ExtractionResult, Transaction, StatementMetadata } from './types';
import { getSampleCommercialStatement, getSampleNigerianStatement } from './utils/sampleData';
import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';

// Optimize high-resolution photo/image statements for rapid AI OCR processing
async function getOptimizedFileBase64(file: File, mime: string): Promise<{ base64: string; mimeType: string }> {
  // If it's a PDF, read directly
  if (mime === 'application/pdf') {
    const rawBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
    return { base64: rawBase64, mimeType: 'application/pdf' };
  }

  // If it's an image, optimize high-resolution mobile photos (> 2000px)
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 2200;
      let width = img.width;
      let height = img.height;

      // Only downscale if larger than maxDim or file is large (> 2.5MB)
      if (width > maxDim || height > maxDim || file.size > 2.5 * 1024 * 1024) {
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ base64: optimizedDataUrl, mimeType: 'image/jpeg' });
          return;
        }
      }

      // Fallback: read directly as base64
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result as string, mimeType: mime });
      reader.onerror = () => {
        // If FileReader fails, read through canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve({ base64: canvas.toDataURL('image/jpeg', 0.9), mimeType: 'image/jpeg' });
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback read as raw base64
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result as string, mimeType: mime });
      reader.onerror = () => resolve({ base64: '', mimeType: mime });
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
  } | null>(null);

  const [metadata, setMetadata] = useState<StatementMetadata | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Document preview visibility state
  const [isDocumentOpen, setIsDocumentOpen] = useState(true);

  // Transaction Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter review shortcut
  const [reviewFilterOnly, setReviewFilterOnly] = useState(false);

  // Upload & Extraction Handler
  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setWarningMessage(null);
    setIsProcessing(true);

    let mime = (file.type || '').toLowerCase();
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      mime = 'application/pdf';
    } else if (lowerName.endsWith('.png')) {
      mime = 'image/png';
    } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
      mime = 'image/jpeg';
    } else if (lowerName.endsWith('.webp')) {
      mime = 'image/webp';
    } else if (!mime || mime === 'application/octet-stream') {
      mime = 'application/pdf';
    }

    const previewUrl = URL.createObjectURL(file);
    setCurrentFile({
      name: file.name,
      size: file.size,
      type: mime,
      previewUrl,
    });

    try {
      // Convert and optimize file to base64
      const { base64: base64Data, mimeType: finalMime } = await getOptimizedFileBase64(file, mime);

      // Call Express server-side Gemini OCR endpoint
      const response = await fetch('/api/extract-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileBase64: base64Data,
          mimeType: finalMime,
          fileName: file.name,
        }),
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        throw new Error(
          json.error || 'Failed to extract transactions from the document.'
        );
      }

      const result = json.data;
      setMetadata({
        bankName: result.bankName || 'Detected Statement',
        accountHolder: result.accountHolder || '',
        currency: result.currency || 'USD',
        currencySymbol: result.currencySymbol || '$',
        statementPeriod: result.statementPeriod || '',
        summaryDetected: result.summaryDetected || null,
      });

      if (result.warning) {
        setWarningMessage(result.warning);
      }

      setTransactions(result.transactions || []);
    } catch (err: any) {
      console.error('Error processing document:', err);
      setErrorMessage(
        err.message ||
          'Could not identify transactions. Try uploading a clearer image or a PDF version of your bank statement.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample Data Loaders
  const handleLoadSample = (type: 'nigerian' | 'commercial') => {
    setIsProcessing(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setShowResetConfirm(false);

    const sample =
      type === 'nigerian' ? getSampleNigerianStatement() : getSampleCommercialStatement();

    setCurrentFile({
      name: sample.originalFile!.name,
      size: sample.originalFile!.size,
      type: sample.originalFile!.type,
      previewUrl: sample.originalFile!.previewUrl,
    });

    // Simulate a brief realistic OCR processing experience
    setTimeout(() => {
      setMetadata(sample.metadata);
      setTransactions(sample.transactions);
      setIsProcessing(false);
      setIsDocumentOpen(true);
    }, 1200);
  };

  const handleReset = () => {
    if (transactions.length > 0) {
      setShowResetConfirm(true);
    } else {
      executeReset();
    }
  };

  const executeReset = () => {
    setMetadata(null);
    setTransactions([]);
    setCurrentFile(null);
    setErrorMessage(null);
    setWarningMessage(null);
    setIsProcessing(false);
    setShowResetConfirm(false);
    setReviewFilterOnly(false);
  };

  // Transaction mutations
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveModalTransaction = (tx: Transaction) => {
    if (editingTransaction) {
      handleUpdateTransaction(tx);
    } else {
      setTransactions(prev => [tx, ...prev]);
    }
  };

  const hasExtractedData = transactions.length > 0 && metadata !== null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        onLoadSample={handleLoadSample}
        hasTransactions={hasExtractedData}
        onReset={handleReset}
      />

      {/* Security Banner */}
      <PrivacyBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Could not extract transactions</h4>
              <p className="text-xs sm:text-sm mt-0.5 text-rose-700">{errorMessage}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('nigerian')}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-rose-900 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Try with Sample Statement instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Alert */}
        {warningMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Statement Notice</h4>
              <p className="text-xs sm:text-sm mt-0.5 text-amber-700">{warningMessage}</p>
            </div>
          </div>
        )}

        {/* State 1: Upload Dropzone (When not processing and no data) */}
        {!isProcessing && !hasExtractedData && (
          <UploadDropzone
            onFileSelected={handleFileSelected}
            onLoadSample={handleLoadSample}
            isProcessing={isProcessing}
          />
        )}

        {/* State 2: Processing State */}
        {isProcessing && currentFile && (
          <ProcessingState
            fileName={currentFile.name}
            fileSize={currentFile.size}
            previewUrl={currentFile.previewUrl}
            isPdf={currentFile.type === 'application/pdf'}
          />
        )}

        {/* State 3: Results Section (Summary + Split Document Viewer + Table) */}
        {!isProcessing && hasExtractedData && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Summary Statistics Cards */}
            <SummaryCards
              metadata={metadata}
              transactions={transactions}
              onFilterReview={() => setReviewFilterOnly(prev => !prev)}
              reviewFilterActive={reviewFilterOnly}
            />

            {/* Split Screen Grid (Document Viewer + Transaction Table) */}
            <div
              className={`grid grid-cols-1 ${
                isDocumentOpen && currentFile?.previewUrl ? 'lg:grid-cols-12 gap-6' : 'gap-6'
              }`}
            >
              {/* Document Preview Pane (If Open) */}
              {isDocumentOpen && currentFile?.previewUrl && (
                <div className="lg:col-span-5 flex flex-col">
                  <DocumentViewer
                    previewUrl={currentFile.previewUrl}
                    fileName={currentFile.name}
                    fileType={currentFile.type}
                    isCollapsed={false}
                    onToggleCollapse={() => setIsDocumentOpen(false)}
                  />
                </div>
              )}

              {/* Transactions Table Pane */}
              <div
                className={
                  isDocumentOpen && currentFile?.previewUrl ? 'lg:col-span-7' : 'w-full'
                }
              >
                <TransactionTable
                  transactions={transactions}
                  currencySymbol={metadata.currencySymbol || '$'}
                  onUpdateTransaction={handleUpdateTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onAddTransaction={handleOpenAddModal}
                  onEditTransaction={handleOpenEditModal}
                  hasDocument={Boolean(currentFile?.previewUrl)}
                  isDocumentOpen={isDocumentOpen}
                  onToggleDocument={() => setIsDocumentOpen(prev => !prev)}
                  externalFilter={reviewFilterOnly ? 'needsReview' : undefined}
                  onFilterChange={f => setReviewFilterOnly(f === 'needsReview')}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reset Statement Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Start New Statement?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Any edits to currently extracted transactions will be cleared.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
              >
                Yes, Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModalTransaction}
        initialData={editingTransaction}
        currencySymbol={metadata?.currencySymbol || '$'}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Bank Statement OCR</span>
            <span>•</span>
            <span>Zero permanent storage</span>
            <span>•</span>
            <span>Export to standard CSV (RFC 4180)</span>
          </div>
          <div className="text-slate-400">
            Automate bank reconciliations, expense tracking, and accounting exports.
          </div>
        </div>
      </footer>
    </div>
  );
}
