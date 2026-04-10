import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Folder, File, FileText, CornerLeftUp, Upload, Type, Download, Trash2, Eye } from 'lucide-react';

const Files = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchFiles = async (path = currentPath) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/files?path=${encodeURIComponent(path)}`);
      setFiles(res.data.sort((a, b) => {
        // Folders first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      }));
      setCurrentPath(path);
    } catch (err) {
      toast.error('Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles('/');
  }, []);

  const handleNavigate = (path) => {
    fetchFiles(path);
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    const upPath = '/' + parts.join('/');
    fetchFiles(upPath || '/');
  };

  const handleViewFile = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large to view (max 5MB)');
      return;
    }

    try {
      const res = await apiClient.get(`/files/read?path=${encodeURIComponent(file.path)}`);
      setFileContent(res.data.content);
      setViewingFile(file);
    } catch (err) {
      toast.error('Failed to read file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);

    const toastId = toast.loading('Uploading file...');
    try {
      await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('File uploaded successfully', { id: toastId });
      fetchFiles(currentPath); // Refresh
    } catch (err) {
      toast.error('Failed to upload file', { id: toastId });
    } finally {
      e.target.value = null; // reset
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // If viewing a file, show the file reader instead of explorer
  if (viewingFile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="var(--primary)" /> {viewingFile.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{viewingFile.path}</p>
          </div>
          <button className="btn" onClick={() => setViewingFile(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
            Back to Explorer
          </button>
        </div>
        
        <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-dark)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Size: {formatSize(viewingFile.size)}</span>
            <span>Last modified: {new Date(viewingFile.modifiedAt).toLocaleString()}</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#050505', color: '#ccc', fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
            {fileContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Files Explorer</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Browse and manage server files</p>
        </div>
        
        <div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
          <button className="btn btn-primary" onClick={handleUploadClick}>
            <Upload size={16} />
            Upload File
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Breadcrumb Path */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-dark)' }}>
          <button 
            className="btn" 
            style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            onClick={handleGoUp}
            disabled={currentPath === '/'}
          >
            <CornerLeftUp size={16} />
          </button>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.9rem' }}>
            {currentPath}
          </div>
        </div>

        {/* File List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Name</th>
                <th>Size</th>
                <th>Modified</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading directory...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Directory is empty</td></tr>
              ) : (
                files.map((file, i) => (
                  <tr key={i} style={{ cursor: file.isDirectory ? 'pointer' : 'default' }} onClick={() => {
                    if (file.isDirectory) handleNavigate(file.path);
                  }}>
                    <td style={{ color: file.isDirectory ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {file.isDirectory ? <Folder size={20} /> : <File size={20} />}
                    </td>
                    <td style={{ fontWeight: 500 }}>{file.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{file.isDirectory ? '-' : formatSize(file.size)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(file.modifiedAt).toLocaleDateString()} {new Date(file.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      {!file.isDirectory && (
                        <button 
                          className="btn" 
                          style={{ padding: '6px 12px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.2)', fontSize: '0.8rem' }}
                          onClick={() => handleViewFile(file)}
                        >
                          <Eye size={14} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Files;
