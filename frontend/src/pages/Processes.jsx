import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Cpu, Search, Trash2, RefreshCw } from 'lucide-react';

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [terminating, setTerminating] = useState(null);

  const fetchProcesses = async () => {
    try {
      const res = await apiClient.get('/process');
      setProcesses(res.data.list);
    } catch (err) {
      toast.error('Failed to fetch processes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid, name) => {
    if (!window.confirm(`Are you sure you want to kill process ${name} (PID: ${pid})?`)) return;
    
    setTerminating(pid);
    try {
      await apiClient.post('/process/kill', { pid });
      toast.success(`Process ${name} killed`);
      fetchProcesses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to kill process');
    } finally {
      setTerminating(null);
    }
  };

  const filtered = processes.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.pid.toString().includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Process Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monitor and control system processes</p>
        </div>
        <button className="btn" onClick={() => { setLoading(true); fetchProcesses(); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search running processes by name or PID..." 
              style={{ paddingLeft: '44px', background: 'var(--bg-dark)' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Name</th>
                <th>CPU %</th>
                <th>Memory %</th>
                <th>User</th>
                <th>State</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && processes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading processes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No processes found</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.pid}>
                    <td style={{ fontWeight: 500 }}>{p.pid}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={16} color="var(--primary)" />
                        {p.name}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: p.cpu > 50 ? 'var(--warning)' : p.cpu > 80 ? 'var(--danger)' : 'inherit' }}>
                        {p.cpu.toFixed(1)}%
                      </span>
                    </td>
                    <td>{p.mem.toFixed(1)}%</td>
                    <td>{p.user || '-'}</td>
                    <td>
                      <span className={`badge ${p.state === 'running' || p.state === 'R' ? 'badge-success' : 'badge-warning'}`}>
                        {p.state}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleKill(p.pid, p.name)}
                        disabled={terminating === p.pid}
                      >
                        {terminating === p.pid ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Kill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <style>{`.animate-spin { animation: spin 1s linear infinite; }`}</style>
        </div>
      </div>
    </div>
  );
};

export default Processes;
