import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { TerminalSquare, Filter, Play, Pause, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [filters, setFilters] = useState([]); // 'error', 'warn', 'info'
  const endRef = useRef(null);

  const fetchLogs = async () => {
    if (isPaused) return;
    try {
      const filtersParam = filters.length > 0 ? `?filters=${filters.join(',')}` : '';
      const res = await apiClient.get(`/logs${filtersParam}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch logs', { id: 'log-error' }); // Use ID to prevent spamming
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [filters, isPaused]);

  useEffect(() => {
    if (!isPaused && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const toggleFilter = (f) => {
    setFilters(prev => 
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>System Logs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time system events and application logs</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn" 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play size={16} color="var(--success)" /> : <Pause size={16} color="var(--warning)" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button 
            className="btn" 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            onClick={downloadLogs}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '8px' }}>
          <Filter size={14} /> Filters:
        </div>
        {['error', 'warn', 'info'].map(f => (
          <button 
            key={f}
            style={{ 
              padding: '4px 12px', 
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${filters.includes(f) ? `var(--${f === 'error' ? 'danger' : f === 'warn' ? 'warning' : 'primary'})` : 'var(--border-color)'}`,
              background: filters.includes(f) ? `rgba(${f === 'error' ? '239, 68, 68' : f === 'warn' ? '245, 158, 11' : '79, 70, 229'}, 0.1)` : 'var(--bg-card)',
              color: filters.includes(f) ? `var(--${f === 'error' ? 'danger' : f === 'warn' ? 'warning' : 'primary'})` : 'var(--text-muted)'
            }}
            onClick={() => toggleFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', background: '#050505', borderColor: '#222' }}>
        <div style={{ background: '#111', padding: '10px 20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TerminalSquare size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/var/log/syslog -- tail</span>
          {isPaused && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>PAUSED</span>}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', fontSize: '0.85rem', lineHeight: 1.6 }}>
          {loading && logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No logs matched the current filters.</div>
          ) : (
            logs.map((log, i) => {
              const date = new Date(log.timestamp);
              const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
              
              let color = '#ccc';
              if (log.level === 'error') color = 'var(--danger)';
              else if (log.level === 'warn') color = 'var(--warning)';
              else if (log.level === 'info') color = '#61afef';

              return (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '8px', wordBreak: 'break-all' }}>
                  <span style={{ color: '#5c6370', flexShrink: 0, width: '70px' }}>{timeStr}</span>
                  <span style={{ color, flexShrink: 0, width: '40px', fontWeight: 600 }}>{log.level.toUpperCase()}</span>
                  <span style={{ color: '#abb2bf', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};

export default Logs;
