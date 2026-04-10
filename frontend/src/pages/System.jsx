import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Server, Cpu, HardDrive, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const System = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await apiClient.get('/system');
        setInfo(res.data);
      } catch (err) {
        toast.error('Failed to load system information');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading system information...</div>;
  }

  if (!info) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>System Information</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hardware and OS details of the host server</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* OS / Generic Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Operating System</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Hostname</span>
              <span style={{ fontWeight: 500 }}>{info.hostname}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Distribution</span>
              <span style={{ fontWeight: 500 }}>{info.os}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform</span>
              <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{info.platform}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kernel Version</span>
              <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{info.kernel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Architecture</span>
              <span style={{ fontWeight: 500 }}>{info.arch}</span>
            </div>
          </div>
        </div>

        {/* Hardware Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Hardware Specifications</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Manufacturer</span>
              <span style={{ fontWeight: 500 }}>{info.manufacturer}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Model</span>
              <span style={{ fontWeight: 500 }}>{info.model}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>CPU Vendor</span>
              <span style={{ fontWeight: 500 }}>{info.cpu.manufacturer}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>CPU Model</span>
              <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '200px' }}>{info.cpu.brand}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>CPU Cores</span>
              <span style={{ fontWeight: 500 }}>{info.cpu.cores} Physical</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Clock Speed</span>
              <span style={{ fontWeight: 500 }}>{info.cpu.speed} GHz</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default System;
