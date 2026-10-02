import React, { useState } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, FileText, Maximize2, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  previewUrl?: string;
  fileName?: string;
  fileType?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  previewUrl,
  fileName,
  fileType,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const isPdf = fileType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');

  if (!previewUrl) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800 truncate" title={fileName}>
            {fileName || 'Original Statement'}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
            {isPdf ? 'PDF Document' : 'Image'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {!isPdf && (
            <>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 25, 250))}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer text-[10px] font-mono"
                title="Reset zoom"
              >
                {zoomLevel}%
              </button>
            </>
          )}

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            title="Open document in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            title={isCollapsed ? 'Show document' : 'Hide document'}
          >
            {isCollapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Document content */}
      {!isCollapsed && (
        <div className="relative flex-1 min-h-[420px] max-h-[680px] bg-slate-100 overflow-auto flex flex-col items-center justify-center p-2">
          {isPdf ? (
            <div className="w-full h-full flex flex-col">
              <div className="mb-2 p-2 rounded-lg bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{fileName}</span>
                </span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Full PDF</span>
                </a>
              </div>
              <object
                data={previewUrl}
                type="application/pdf"
                className="w-full flex-1 min-h-[480px] rounded-lg bg-white shadow-2xs border border-slate-200"
              >
                <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800">
                    PDF Document Loaded
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Your browser sandbox restricts embedded PDF rendering. You can view or download the full statement in a new tab:
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open {fileName || 'Statement PDF'}</span>
                  </a>
                </div>
              </object>
            </div>
          ) : (
            <div className="overflow-auto max-h-[640px] flex items-center justify-center p-2 w-full h-full">
              <img
                src={previewUrl}
                alt="Statement Preview"
                style={{ width: `${zoomLevel}%`, maxWidth: 'none' }}
                className="rounded-lg shadow-sm border border-slate-200 object-contain transition-all duration-150"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
