import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Settings, Play, Square, RotateCw, RefreshCw, Search } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actioning, setActioning] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await apiClient.get('/services');
      setServices(res.data);
    } catch (err) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAction = async (service, action) => {
    setActioning(`${service}-${action}`);
    try {
      await apiClient.post(`/services/${action}`, { service });
      toast.success(`Service ${service} ${action}ed`);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} service`);
    } finally {
      setActioning(null);
    }
  };

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>System Services</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage background services and daemons</p>
        </div>
        <button className="btn" onClick={() => { setLoading(true); fetchServices(); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
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
              placeholder="Search services..." 
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
                <th>Name</th>
                <th>Status</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && services.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading services...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No services found</td>
                </tr>
              ) : (
                filtered.map(s => {
                  const isRunning = s.active === 'active' || s.running === true;
                  return (
                    <tr key={s.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                          <Settings size={16} color="var(--primary)" />
                          {s.name}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isRunning ? 'badge-success' : 'badge-danger'}`}>
                          {isRunning ? 'Running' : 'Stopped'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {s.description || '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {!isRunning ? (
                            <button 
                              className="btn" 
                              style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                              onClick={() => handleAction(s.name, 'start')}
                              disabled={actioning}
                              title="Start"
                            >
                              <Play size={14} />
                            </button>
                          ) : (
                            <button 
                              className="btn" 
                              style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                              onClick={() => handleAction(s.name, 'stop')}
                              disabled={actioning}
                              title="Stop"
                            >
                              <Square size={14} />
                            </button>
                          )}
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleAction(s.name, 'restart')}
                            disabled={actioning}
                            title="Restart"
                          >
                            <RotateCw size={14} className={actioning === `${s.name}-restart` ? 'animate-spin' : ''} />
                            Restart
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <style>{`.animate-spin { animation: spin 1s linear infinite; }`}</style>
        </div>
      </div>
    </div>
  );
};

export default Services;
