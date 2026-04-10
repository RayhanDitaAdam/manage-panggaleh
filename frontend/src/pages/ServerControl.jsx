import React, { useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Server, Power, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ServerControl = () => {
  const [loading, setLoading] = useState(null); // 'restart' or 'shutdown'
  const { user } = useAuth();
  
  // Important safety guard - only admins can control the server
  const isAdmin = user?.role === 'admin';

  const handleAction = async (action) => {
    if (!isAdmin) {
      toast.error('Insufficient permissions');
      return;
    }

    const confirmMsg = action === 'restart' 
      ? 'Are you absolutely sure you want to RESTART the server? This will disconnect all users.'
      : 'Are you absolutely sure you want to SHUT DOWN the server? You will need physical/console access to start it again.';

    if (!window.confirm(confirmMsg)) return;
    
    // Double confirmation for production controls
    if (window.prompt(`Type "${action}" to confirm`) !== action) {
      toast.error('Action cancelled: Confirmation text did not match');
      return;
    }

    setLoading(action);
    try {
      await apiClient.post(`/server/${action}`);
      toast.success(`Server ${action} initiated successfully!`);
      // Optional: Auto redirect to local login page or show disconnected state
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to initiate ${action}`);
      setLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Server Power Control</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management of host machine power states</p>
      </div>

      <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
            <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', color: 'var(--danger)' }}>Danger Zone</h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.6 }}>
              These controls directly interact with the host operating system. Executing these commands will terminate all active connections, background processes, and may cause data loss if not done safely.
            </p>
            
            {!isAdmin && (
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: 'var(--warning)', display: 'inline-block', marginBottom: '20px', fontSize: '0.85rem' }}>
                You do not have permission to access these controls. Contact an Administrator.
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                className="btn" 
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                onClick={() => handleAction('restart')}
                disabled={!isAdmin || loading !== null}
              >
                {loading === 'restart' ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                Restart Server
              </button>
              
              <button 
                className="btn btn-danger" 
                onClick={() => handleAction('shutdown')}
                disabled={!isAdmin || loading !== null}
                style={{ opacity: (!isAdmin || loading !== null) ? 0.5 : 1 }}
              >
                {loading === 'shutdown' ? <RefreshCw className="animate-spin" size={18} /> : <Power size={18} />}
                Shutdown Server
              </button>
            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; }`}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerControl;
