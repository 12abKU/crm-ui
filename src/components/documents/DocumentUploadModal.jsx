import { useState, useRef, useCallback } from 'react';
import { documentAPI } from '../../api/documents';
import { T } from '../../constants/theme';
import api, { extractApiErrorMessage } from '../../api';
import SearchableSelect from '../SearchableSelect';

export default function DocumentUploadModal({ open, onClose, entityType, entityId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Link to section states
  const [linkType, setLinkType] = useState(''); // '', 'deal', 'account', 'contact'
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [dealOptions, setDealOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [contactOptions, setContactOptions] = useState([]);

  const loadDealOptions = useCallback(async (query = '') => {
    const params = new URLSearchParams({ page: '0', size: '10' });
    if (query.trim()) params.set('search', query.trim());
    const r = await api.get(`/api/deals/all?${params}`);
    const content = r.data.content ?? [];
    setDealOptions(content);
    return content.map(d => ({ id: String(d.id), label: d.title }));
  }, []);

  const loadAccountOptions = useCallback(async (query = '') => {
    const params = new URLSearchParams({ page: '0', size: '10' });
    if (query.trim()) params.set('search', query.trim());
    const r = await api.get(`/api/accounts?${params}`);
    const content = r.data.content ?? [];
    setAccountOptions(content);
    return content.map(a => ({ id: String(a.id), label: a.name }));
  }, []);

  const loadContactOptions = useCallback(async (query = '') => {
    const params = new URLSearchParams({ page: '0', size: '10' });
    if (query.trim()) params.set('search', query.trim());
    const r = await api.get(`/api/contacts?${params}`);
    const content = r.data.content ?? [];
    setContactOptions(content);
    return content.map(c => ({ id: String(c.id), label: `${c.firstName} ${c.lastName}` }));
  }, []);

  if (!open) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (uploading) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) setName(droppedFile.name);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) setName(selectedFile.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    if (linkType && !selectedEntityId) {
      setError(`Please select a ${linkType} to link`);
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('description', description);

    if (entityType) {
      if (entityType === 'deal') {
        formData.append('dealId', entityId);
      } else if (entityType === 'account') {
        formData.append('accountId', entityId);
      } else if (entityType === 'contact') {
        formData.append('contactId', entityId);
      }
    } else if (linkType && selectedEntityId) {
      if (linkType === 'deal') {
        formData.append('dealId', selectedEntityId);
      } else if (linkType === 'account') {
        formData.append('accountId', selectedEntityId);
      } else if (linkType === 'contact') {
        formData.append('contactId', selectedEntityId);
      }
    }

    try {
      // Simulate progress bar increments
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 100);

      await documentAPI.upload(formData);
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        onUploadSuccess();
        handleClose();
      }, 300);
    } catch (err) {
      setError(extractApiErrorMessage(err));
      setProgress(0);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setName('');
    setDescription('');
    setLinkType('');
    setSelectedEntityId('');
    setProgress(0);
    setError(null);
    setUploading(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start md:items-center p-4">
      <div 
        className="w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 border relative my-auto"
        style={{ background: T.surface, borderColor: T.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border, background: T.primaryFaint, borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]" style={{ color: T.primary }}>upload_file</span>
            <h3 className="text-sm font-black" style={{ color: T.textPrimary }}>Upload Document</h3>
          </div>
          <button 
            onClick={handleClose} 
            disabled={uploading}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 text-gray-500"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpload} className="p-6 flex flex-col gap-4">
          
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:opacity-90 flex flex-col items-center justify-center gap-2"
            style={{ 
              borderColor: file ? T.primary : T.border, 
              background: file ? T.primaryFaint : T.borderSubtle 
            }}
          >
            <span 
              className={`material-symbols-outlined text-[36px] ${uploading ? 'animate-bounce' : ''}`}
              style={{ color: file ? T.primary : T.textMuted }}
            >
              cloud_upload
            </span>
            {file ? (
              <div>
                <p className="text-xs font-bold truncate max-w-[300px]" style={{ color: T.textPrimary }}>{file.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{formatFileSize(file.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold" style={{ color: T.textPrimary }}>Drag & drop file here, or click to browse</p>
                <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>Max upload size: 50MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Document Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Defaults to original file name"
                disabled={uploading}
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  background: T.surface, 
                  borderColor: T.border, 
                  color: T.textPrimary,
                  '--tw-ring-color': T.primary 
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this document..."
                disabled={uploading}
                rows={3}
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                style={{ 
                  background: T.surface, 
                  borderColor: T.border, 
                  color: T.textPrimary,
                  '--tw-ring-color': T.primary 
                }}
              />
            </div>

            {/* Link to Entity Option (Only when uploaded from main Documents page) */}
            {!entityType && (
              <div className="flex flex-col gap-3 border-t pt-3" style={{ borderColor: T.borderSubtle }}>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textMuted }}>Link to Entity (Optional)</label>
                  <select
                    value={linkType}
                    onChange={(e) => {
                      setLinkType(e.target.value);
                      setSelectedEntityId('');
                    }}
                    disabled={uploading}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      background: T.surface,
                      borderColor: T.border,
                      color: T.textPrimary,
                      '--tw-ring-color': T.primary
                    }}
                  >
                    <option value="">Do not link</option>
                    <option value="deal">Deal</option>
                    <option value="account">Account</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>

                {linkType === 'deal' && (
                  <SearchableSelect
                    label="Select Deal *"
                    value={selectedEntityId}
                    onChange={(v) => setSelectedEntityId(v)}
                    options={dealOptions.map(d => ({ id: String(d.id), label: d.title }))}
                    onSearch={loadDealOptions}
                    placeholder="Type to search deals..."
                    disabled={uploading}
                    menuPlacement="top"
                  />
                )}

                {linkType === 'account' && (
                  <SearchableSelect
                    label="Select Account *"
                    value={selectedEntityId}
                    onChange={(v) => setSelectedEntityId(v)}
                    options={accountOptions.map(a => ({ id: String(a.id), label: a.name }))}
                    onSearch={loadAccountOptions}
                    placeholder="Type to search accounts..."
                    disabled={uploading}
                    menuPlacement="top"
                  />
                )}

                {linkType === 'contact' && (
                  <SearchableSelect
                    label="Select Contact *"
                    value={selectedEntityId}
                    onChange={(v) => setSelectedEntityId(v)}
                    options={contactOptions.map(c => ({ id: String(c.id), label: `${c.firstName} ${c.lastName}` }))}
                    onSearch={loadContactOptions}
                    placeholder="Type to search contacts..."
                    disabled={uploading}
                    menuPlacement="top"
                  />
                )}
              </div>
            )}
          </div>

          {/* Progress or Error */}
          {uploading && (
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ background: T.primary, width: `${progress}%` }}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs font-semibold" style={{ background: T.errorDim, color: T.error }}>
              <span className="material-symbols-outlined text-[16px]">error</span>
              <p>{error}</p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 border-t pt-4" style={{ borderColor: T.border }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all border hover:bg-black/5"
              style={{ color: T.textPrimary, borderColor: T.border }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-white hover:opacity-90 disabled:opacity-50"
              style={{ background: T.primary, boxShadow: `0 2px 8px ${T.primary}30` }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
