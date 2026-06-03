import { useState, useEffect } from 'react';
import { documentAPI } from '../../api/documents';
import { T } from '../../constants/theme';
import { extractApiErrorMessage } from '../../api';

export default function DocumentPreviewModal({ open, onClose, doc }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [previewMode, setPreviewMode] = useState(null); // 'image' | 'pdf' | 'text' | 'other'

  useEffect(() => {
    let activeUrl = null;

    const loadPreview = async () => {
      if (!open || !doc) return;

      setLoading(true);
      setError(null);
      setPreviewUrl(null);
      setTextContent(null);
      setPreviewMode(null);

      try {
        const response = await documentAPI.download(doc.id);
        const fileBlob = response.data;
        const type = doc.fileType?.toLowerCase() || '';

        if (type.startsWith('image/')) {
          activeUrl = URL.createObjectURL(fileBlob);
          setPreviewUrl(activeUrl);
          setPreviewMode('image');
        } else if (type === 'application/pdf') {
          activeUrl = URL.createObjectURL(fileBlob);
          setPreviewUrl(activeUrl);
          setPreviewMode('pdf');
        } else if (
          type.startsWith('text/') ||
          doc.name?.endsWith('.txt') ||
          doc.name?.endsWith('.json') ||
          doc.name?.endsWith('.csv') ||
          doc.name?.endsWith('.log') ||
          doc.name?.endsWith('.xml')
        ) {
          const text = await fileBlob.text();
          setTextContent(text);
          setPreviewMode('text');
        } else {
          setPreviewMode('other');
        }
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [open, doc]);

  if (!open || !doc) return null;

  const handleDownload = async () => {
    try {
      const response = await documentAPI.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName || doc.name);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download file: ' + extractApiErrorMessage(err));
    }
  };

  const getFileIcon = (contentType) => {
    if (contentType?.includes('pdf')) return 'picture_as_pdf';
    if (contentType?.includes('word') || contentType?.includes('officedocument.word')) return 'description';
    if (contentType?.includes('excel') || contentType?.includes('sheet') || contentType?.includes('officedocument.spread')) return 'table_chart';
    if (contentType?.includes('image')) return 'image';
    if (contentType?.includes('zip') || contentType?.includes('compressed')) return 'archive';
    return 'insert_drive_file';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border animate-in fade-in zoom-in duration-200"
        style={{ background: T.surface, borderColor: T.border }}
      >
        {/* Header Toolbar */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: T.border, background: T.primaryFaint }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.primaryDim }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>
                {getFileIcon(doc.fileType)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black truncate max-w-[300px] sm:max-w-[500px]" style={{ color: T.textPrimary }}>
                {doc.name}
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
                {formatFileSize(doc.fileSize)} • Uploaded by {doc.uploaderName || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: T.primary }}
              title="Download File"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 text-gray-500"
              title="Close Preview"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content View Area */}
        <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-black/20 p-6 flex flex-col justify-center items-center">
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${T.primary}33`, borderTopColor: T.primary }} />
              <p className="text-xs font-bold" style={{ color: T.textMuted }}>
                Loading preview...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-center max-w-md">
              <span className="material-symbols-outlined text-[48px]" style={{ color: T.error }}>
                error_o
              </span>
              <div>
                <p className="text-sm font-bold" style={{ color: T.textPrimary }}>
                  Unable to load preview
                </p>
                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                  {error}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: T.primary }}
              >
                Download Instead
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="w-full h-full flex justify-center items-center">
              {previewMode === 'image' && (
                <div className="max-w-full max-h-full overflow-auto flex items-center justify-center rounded-xl p-2 bg-white/5 shadow-inner">
                  <img
                    src={previewUrl}
                    alt={doc.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md border"
                    style={{ borderColor: T.border }}
                  />
                </div>
              )}

              {previewMode === 'pdf' && (
                <iframe
                  src={previewUrl}
                  title={doc.name}
                  className="w-full h-full rounded-2xl border shadow-sm"
                  style={{ borderColor: T.border, background: '#fff' }}
                />
              )}

              {previewMode === 'text' && (
                <div
                  className="w-full h-full overflow-auto rounded-2xl border text-left p-5 font-mono text-xs leading-relaxed whitespace-pre"
                  style={{
                    background: T.surfaceRaised,
                    borderColor: T.border,
                    color: T.textPrimary,
                  }}
                >
                  {textContent}
                </div>
              )}

              {previewMode === 'other' && (
                <div
                  className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border gap-4 max-w-md"
                  style={{ background: T.surface, borderColor: T.border }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: T.primaryDim }}>
                    <span className="material-symbols-outlined text-[36px]" style={{ color: T.primary }}>
                      {getFileIcon(doc.fileType)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black" style={{ color: T.textPrimary }}>
                      Preview not available
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: T.textMuted }}>
                      We do not support inline previewing for <strong>{doc.fileType || 'this type of'}</strong> files yet. You can download the file to view it on your device.
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: T.primary, boxShadow: `0 4px 12px ${T.primary}20` }}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download {formatFileSize(doc.fileSize)}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
