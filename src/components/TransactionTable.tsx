import React, { useState, useMemo } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Check,
  CheckCheck,
  Copy,
  FileSpreadsheet,
  Split,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  CATEGORIES,
  Category,
  FilterType,
  SortDirection,
  SortField,
  Transaction,
} from '../types';
import { downloadCsv, formatCurrency, generateTransactionsCsv } from '../utils/csv';

interface TransactionTableProps {
  transactions: Transaction[];
  currencySymbol: string;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  hasDocument: boolean;
  isDocumentOpen: boolean;
  onToggleDocument: () => void;
  externalFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currencySymbol,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddTransaction,
  onEditTransaction,
  hasDocument,
  isDocumentOpen,
  onToggleDocument,
  externalFilter,
  onFilterChange,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [internalFilter, setInternalFilter] = useState<FilterType>('all');

  const activeFilter = externalFilter !== undefined ? externalFilter : internalFilter;
  const handleFilterChange = (filter: FilterType) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
    setInternalFilter(filter);
    setCurrentPage(1);
  };

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);

  // Copy feedback state
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Inline editing row state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState<Partial<Transaction>>({});

  // Duplicate detection map
  const duplicateKeys = useMemo(() => {
    const counts = new Map<string, number>();
    transactions.forEach(t => {
      const key = `${t.date}_${t.amount}_${t.description.toLowerCase().trim()}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [transactions]);

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            tx.description.toLowerCase().includes(q) ||
            tx.date.toLowerCase().includes(q) ||
            (tx.category || '').toLowerCase().includes(q) ||
            (tx.notes || '').toLowerCase().includes(q) ||
            tx.amount.toString().includes(q);
          if (!matches) return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) {
          return false;
        }

        // Type filter
        if (activeFilter === 'credits' && tx.amount <= 0) return false;
        if (activeFilter === 'debits' && tx.amount >= 0) return false;
        if (activeFilter === 'needsReview' && !tx.needsReview) return false;

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = a.date.localeCompare(b.date);
        } else if (sortField === 'amount') {
          cmp = a.amount - b.amount;
        } else if (sortField === 'description') {
          cmp = a.description.localeCompare(b.description);
        } else if (sortField === 'category') {
          cmp = (a.category || '').localeCompare(b.category || '');
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [transactions, searchQuery, selectedCategory, activeFilter, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, safeCurrentPage, pageSize]);

  // Bulk selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedTransactions.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setConfirmingBulkDelete(true);
  };

  const confirmAndExecuteBulkDelete = () => {
    selectedIds.forEach(id => onDeleteTransaction(id));
    setSelectedIds(new Set());
    setConfirmingBulkDelete(false);
  };

  const handleMarkAllReviewed = () => {
    transactions.forEach(tx => {
      if (tx.needsReview) {
        onUpdateTransaction({ ...tx, needsReview: false });
      }
    });
  };

  // Inline editing actions
  const startInlineEdit = (tx: Transaction) => {
    setInlineEditingId(tx.id);
    setInlineForm({ ...tx });
  };

  const saveInlineEdit = () => {
    if (!inlineEditingId) return;
    const original = transactions.find(t => t.id === inlineEditingId);
    if (original) {
      onUpdateTransaction({
        ...original,
        ...inlineForm,
        amount:
          typeof inlineForm.amount === 'number'
            ? inlineForm.amount
            : parseFloat(String(inlineForm.amount || 0)) || original.amount,
      });
    }
    setInlineEditingId(null);
    setInlineForm({});
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineForm({});
  };

  // CSV Export & Copy Handlers
  const handleDownloadCsv = () => {
    downloadCsv(transactions, 'bank-statement-transactions.csv');
  };

  const handleCopyCsv = () => {
    const csv = generateTransactionsCsv(transactions);
    navigator.clipboard.writeText(csv);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1 inline opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 ml-1 inline font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 ml-1 inline font-bold" />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Toolbar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Extracted Transactions
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'record' : 'records'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and edit data before exporting. Outgoing debits are negative, incoming credits are positive.
            </p>
          </div>

          {/* Action Buttons: Add, Split View, Download CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {hasDocument && (
              <button
                type="button"
                onClick={onToggleDocument}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isDocumentOpen
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>{isDocumentOpen ? 'Hide Document' : 'View Original Document'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onAddTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              title="Copy CSV to clipboard for Excel / Google Sheets"
            >
              {copiedCsv ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CSV</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search narration, ref, amount, or notes..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('credits')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'credits'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Credits ({transactions.filter(t => t.amount > 0).length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('debits')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'debits'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Debits ({transactions.filter(t => t.amount < 0).length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('needsReview')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'needsReview'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Flagged ({transactions.filter(t => t.needsReview).length})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedIds.size > 0 && (
          <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-400">{selectedIds.size}</span>
              <span>selected</span>
            </div>
            {confirmingBulkDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-rose-300 font-semibold">Delete {selectedIds.size} transaction(s)?</span>
                <button
                  type="button"
                  onClick={confirmAndExecuteBulkDelete}
                  className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingBulkDelete(false)}
                  className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedTransactions.length > 0 &&
                    paginatedTransactions.every(t => selectedIds.has(t.id))
                  }
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              {/* Exactly requested columns: Date, Amount, Description, Category, Notes */}
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap min-w-[110px]"
              >
                <span>Date</span>
                {renderSortIndicator('date')}
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none text-right whitespace-nowrap min-w-[130px]"
              >
                <span>Amount</span>
                {renderSortIndicator('amount')}
              </th>
              <th
                onClick={() => handleSort('description')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none min-w-[240px]"
              >
                <span>Description</span>
                {renderSortIndicator('description')}
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none min-w-[140px]"
              >
                <span>Category</span>
                {renderSortIndicator('category')}
              </th>
              <th className="py-3 px-3 min-w-[200px]">
                <span>Notes</span>
              </th>
              <th className="py-3 px-3 text-center w-20 whitespace-nowrap">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <FileSpreadsheet className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing search filters or add a transaction manually.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map(tx => {
                const isSelected = selectedIds.has(tx.id);
                const isInline = inlineEditingId === tx.id;
                const isCredit = tx.amount > 0;
                const dupCount =
                  duplicateKeys.get(
                    `${tx.date}_${tx.amount}_${tx.description.toLowerCase().trim()}`
                  ) || 0;
                const isDuplicate = dupCount > 1;

                if (isInline) {
                  return (
                    <tr key={tx.id} className="bg-blue-50/60 border-y border-blue-200">
                      <td className="py-3 px-3 text-center">
                        <CheckCheck className="w-4 h-4 text-blue-600 inline" />
                      </td>
                      {/* Date */}
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={inlineForm.date || ''}
                          onChange={e =>
                            setInlineForm(prev => ({ ...prev, date: e.target.value }))
                          }
                          className="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded font-mono"
                        />
                      </td>
                      {/* Amount */}
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setInlineForm(prev => ({
                                ...prev,
                                amount: -(prev.amount ?? tx.amount),
                              }))
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              (inlineForm.amount ?? tx.amount) < 0
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {(inlineForm.amount ?? tx.amount) < 0 ? 'DR (-)' : 'CR (+)'}
                          </button>
                          <input
                            type="number"
                            step="any"
                            value={inlineForm.amount ?? tx.amount}
                            onChange={e =>
                              setInlineForm(prev => ({
                                ...prev,
                                amount: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-24 px-2 py-1 text-xs bg-white border border-blue-300 rounded text-right font-mono font-bold"
                          />
                        </div>
                      </td>
                      {/* Description */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={inlineForm.description || ''}
                          onChange={e =>
                            setInlineForm(prev => ({ ...prev, description: e.target.value }))
                          }
                          className="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded"
                        />
                      </td>
                      {/* Category */}
                      <td className="py-2 px-3">
                        <select
                          value={inlineForm.category || 'Other'}
                          onChange={e =>
                            setInlineForm(prev => ({ ...prev, category: e.target.value }))
                          }
                          className="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Notes */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={inlineForm.notes || ''}
                          onChange={e =>
                            setInlineForm(prev => ({ ...prev, notes: e.target.value }))
                          }
                          className="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded"
                        />
                      </td>
                      {/* Actions */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={saveInlineEdit}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            title="Save inline edit"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelInlineEdit}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors group hover:bg-slate-50/80 ${
                      isSelected ? 'bg-blue-50/40' : ''
                    } ${tx.needsReview ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(tx.id)}
                        className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700 text-xs">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(tx.amount, currencySymbol)}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 leading-tight">
                          {tx.description}
                        </span>
                        {isDuplicate && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800"
                            title="Duplicate detected: multiple identical transactions found"
                          >
                            Duplicate
                          </span>
                        )}
                      </div>
                      {tx.needsReview && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 mt-0.5 font-medium">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{tx.reviewReason || 'Flagged for verification'}</span>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.category || 'Other'}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3 text-slate-500 text-xs truncate max-w-xs" title={tx.notes}>
                      {tx.notes || <span className="text-slate-300 italic">—</span>}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-slate-800">
              {filteredAndSorted.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800">
              {Math.min(safeCurrentPage * pageSize, filteredAndSorted.length)}
            </strong>{' '}
            of <strong className="text-slate-800">{filteredAndSorted.length}</strong> transactions
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-800">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
