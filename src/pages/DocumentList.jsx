import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { documentAPI } from '../api/documents';
import { T } from '../constants/theme';
import { extractApiErrorMessage } from '../api';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';


export default function DocumentList({ entityType, entityId }) {
  const isNested = !!entityType;
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  if (!isNested && role === 'AGENT') {
    return <Navigate to="/" replace />;
  }
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [error, setError] = useState(null);

  // Custom preview and popup states
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocForDelete, setSelectedDocForDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [entityType, entityId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      let docs = [];
      if (entityType === 'deal') {
        response = await documentAPI.getByDeal(entityId);
        docs = response.data;
      } else if (entityType === 'account') {
        response = await documentAPI.getByAccount(entityId);
        docs = response.data;
      } else if (entityType === 'contact') {
        response = await documentAPI.getByContact(entityId);
        docs = response.data;
      } else {
        response = await documentAPI.getAll({ search });
        docs = response.data?.content || response.data;
      }
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleDownload = async (doc) => {
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
      triggerAlert('Download Failed', 'Failed to download file: ' + extractApiErrorMessage(err));
    }
  };

  const confirmDelete = (doc) => {
    setSelectedDocForDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    setDeleteConfirmOpen(false);
    if (!selectedDocForDelete) return;
    try {
      await documentAPI.delete(selectedDocForDelete.id);
      loadDocuments();
    } catch (err) {
      triggerAlert('Delete Failed', 'Failed to delete document: ' + extractApiErrorMessage(err));
    } finally {
      setSelectedDocForDelete(null);
    }
  };

  const triggerPreview = (doc) => {
    setSelectedDocForPreview(doc);
    setPreviewOpen(true);
  };

  const handleLinkedToClick = (doc, e) => {
    e.stopPropagation();
    if (doc.dealId) {
      navigate(`/deals?dealId=${doc.dealId}`);
    } else if (doc.accountId) {
      navigate(`/accounts/${doc.accountId}`);
    } else if (doc.contactId) {
      navigate(`/contacts/${doc.contactId}`);
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading && !isNested) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-bold" style={{ color: T.textMuted }}>
        Loading documents…
      </div>
    );
  }

  return (
    <div className={isNested ? "flex flex-col gap-4" : "p-6 flex flex-col gap-6"}>
      
      {/* Page Header (Only when full page) */}
      {!isNested && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black" style={{ color: T.textPrimary, letterSpacing: '-0.02em' }}>Documents</h1>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>Manage files and attachments across your CRM.</p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-white hover:opacity-95 self-start sm:self-auto"
            style={{ background: T.primary, boxShadow: `0 4px 12px ${T.primary}20` }}
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Upload Document
          </button>
        </div>
      )}

      {/* Toolbar / Search (Only when full page) */}
      {!isNested && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: T.textMuted }}>search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadDocuments()}
            placeholder="Search documents by name..."
            className="flex-1 text-xs font-semibold bg-transparent outline-none"
            style={{ color: T.textPrimary }}
          />
          <button 
            onClick={loadDocuments} 
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
            style={{ background: T.primaryDim, color: T.primaryText }}
          >
            Search
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-xs font-bold flex items-center gap-2" style={{ background: T.errorDim, color: T.error }}>
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed flex flex-col items-center justify-center p-12 text-center gap-3" 
             style={{ borderColor: T.border, background: T.borderSubtle }}>
          <span className="material-symbols-outlined text-[36px]" style={{ color: T.textMuted }}>folder_open</span>
          <div>
            <p className="text-xs font-bold" style={{ color: T.textPrimary }}>No documents uploaded</p>
            <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>Add attachments to keep your files organized.</p>
          </div>
          {isNested && (
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
              style={{ background: T.primaryDim, color: T.primaryText }}
            >
              <span className="material-symbols-outlined text-[14px]">upload</span>Upload File
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isNested && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                Files ({documents.length})
              </span>
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-white hover:opacity-90"
                style={{ background: T.primary }}
              >
                <span className="material-symbols-outlined text-[14px]">upload_file</span>
                Upload File
              </button>
            </div>
          )}

          {/* 📱 Card View for Mobile/Tablet or Nested Panel */}
          <div className={isNested ? "block" : "block md:hidden"}>
            <div className={isNested ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="p-4 rounded-2xl border flex flex-col gap-3 transition-all hover:shadow-md"
                  style={{ background: T.surface, borderColor: T.border }}
                >
                  {/* Top row: Icon and Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.primaryDim }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>
                        {getFileIcon(doc.fileType)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 
                        className="text-xs font-bold truncate cursor-pointer hover:underline" 
                        style={{ color: T.textPrimary }} 
                        onClick={() => triggerPreview(doc)} 
                        title={doc.name}
                      >
                        {doc.name}
                      </h4>
                      {doc.description && (
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: T.textMuted }}>
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Linked to Section */}
                  {(doc.dealId || doc.accountId || doc.contactId) && (
                    <div className="flex flex-wrap gap-1.5">
                      {doc.dealId && (
                        <span 
                          onClick={(e) => handleLinkedToClick(doc, e)}
                          className="px-2 py-0.5 rounded text-[9px] font-bold truncate max-w-full cursor-pointer hover:opacity-80 transition-opacity" 
                          style={{ background: 'rgba(37,99,235,0.1)', color: T.chartBlue }}
                        >
                          Deal: {doc.dealTitle}
                        </span>
                      )}
                      {doc.accountId && (
                        <span 
                          onClick={(e) => handleLinkedToClick(doc, e)}
                          className="px-2 py-0.5 rounded text-[9px] font-bold truncate max-w-full cursor-pointer hover:opacity-80 transition-opacity" 
                          style={{ background: 'rgba(83,141,141,0.1)', color: T.chartTeal }}
                        >
                          Account: {doc.accountName}
                        </span>
                      )}
                      {doc.contactId && (
                        <span 
                          onClick={(e) => handleLinkedToClick(doc, e)}
                          className="px-2 py-0.5 rounded text-[9px] font-bold truncate max-w-full cursor-pointer hover:opacity-80 transition-opacity" 
                          style={{ background: 'rgba(219,39,119,0.1)', color: T.chartPink }}
                        >
                          Contact: {doc.contactName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata section */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t text-[10px] font-semibold" style={{ borderColor: T.borderSubtle, color: T.textSecondary }}>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-bold" style={{ color: T.textMuted }}>Uploaded By</span>
                      <span className="truncate block mt-0.5">{doc.uploaderName || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-bold" style={{ color: T.textMuted }}>Size</span>
                      <span className="block mt-0.5">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[8px] uppercase tracking-wider font-bold" style={{ color: T.textMuted }}>Date</span>
                      <span className="block mt-0.5">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-end gap-1.5 pt-2.5 border-t" style={{ borderColor: T.borderSubtle }}>
                    <button
                      onClick={() => triggerPreview(doc)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: T.primary }}
                      title="Preview"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: T.primary }}
                      title="Download"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(doc)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                      style={{ color: T.error }}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 💻 Table View for Desktop (Only when not nested) */}
          {!isNested && (
            <div className="hidden md:block overflow-hidden rounded-2xl border" style={{ background: T.surface, borderColor: T.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: T.primaryFaint, borderBottom: `1px solid ${T.border}` }}>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Document</th>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Linked To</th>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Uploaded By</th>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Size</th>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Date</th>
                      <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: T.border }}>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5 cursor-pointer group" onClick={() => triggerPreview(doc)}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.primaryDim }}>
                              <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>
                                {getFileIcon(doc.fileType)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate max-w-[200px] group-hover:underline" style={{ color: T.textPrimary }} title={doc.name}>
                                {doc.name}
                              </p>
                              {doc.description && (
                                <p className="text-[10px] mt-0.5 truncate max-w-[200px]" style={{ color: T.textMuted }}>
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {doc.dealId ? (
                            <span 
                              onClick={(e) => handleLinkedToClick(doc, e)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity" 
                              style={{ background: 'rgba(37,99,235,0.1)', color: T.chartBlue }}
                            >
                              Deal: {doc.dealTitle}
                            </span>
                          ) : doc.accountId ? (
                            <span 
                              onClick={(e) => handleLinkedToClick(doc, e)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity" 
                              style={{ background: 'rgba(83,141,141,0.1)', color: T.chartTeal }}
                            >
                              Account: {doc.accountName}
                            </span>
                          ) : doc.contactId ? (
                            <span 
                              onClick={(e) => handleLinkedToClick(doc, e)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity" 
                              style={{ background: 'rgba(219,39,119,0.1)', color: T.chartPink }}
                            >
                              Contact: {doc.contactName}
                            </span>
                          ) : (
                            <span className="text-[10px]" style={{ color: T.textMuted }}>—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: T.textSecondary }}>
                          {doc.uploaderName || 'Unknown'}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: T.textSecondary }}>
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: T.textMuted }}>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => triggerPreview(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              style={{ color: T.primary }}
                              title="Preview"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              style={{ color: T.primary }}
                              title="Download"
                            >
                              <span className="material-symbols-outlined text-[18px]">download</span>
                            </button>
                            <button
                              onClick={() => confirmDelete(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                              style={{ color: T.error }}
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        entityType={entityType}
        entityId={entityId}
        onUploadSuccess={loadDocuments}
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedDocForPreview(null);
        }}
        doc={selectedDocForPreview}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDocForDelete?.name || 'this document'}"? This action cannot be undone.`}
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedDocForDelete(null);
        }}
        confirmText="Delete"
        confirmColor={T.error}
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertOpen(false)}
        confirmText="OK"
        confirmColor={T.primary}
      />
    </div>
  );
}
