import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Network as NetworkIcon, Shield, Radio, Activity } from 'lucide-react';

const Network = () => {
  const [connections, setConnections] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const [connRes, portsRes] = await Promise.all([
          apiClient.get('/network/connections'),
          apiClient.get('/network/ports')
        ]);
        setConnections(connRes.data.slice(0, 50)); // limit for UI
        setPorts(portsRes.data);
      } catch (err) {
        toast.error('Failed to load network information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Network Management</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View open ports and active connections</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Open Ports */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--success)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Listening Services</h3>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Protocol</th>
                  <th>Process</th>
                </tr>
              </thead>
              <tbody>
                {loading && ports.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                ) : ports.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No listening ports found</td></tr>
                ) : (
                  ports.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{p.localPort}</td>
                      <td>
                        <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                          {p.protocol.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.process || 'System'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Connections */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Connections</h3>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Local</th>
                  <th>Peer</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {loading && connections.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                ) : connections.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No active connections</td></tr>
                ) : (
                  connections.filter(c => c.state !== 'LISTEN').map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.85rem' }}>{c.localAddress}:{c.localPort}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.peerAddress}:{c.peerPort}</td>
                      <td>
                        <span className="badge" style={{ 
                          background: c.state === 'ESTABLISHED' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                          color: c.state === 'ESTABLISHED' ? 'var(--primary)' : 'var(--text-muted)',
                          border: `1px solid ${c.state === 'ESTABLISHED' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                        }}>
                          {c.state || 'UNKNOWN'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Network;
