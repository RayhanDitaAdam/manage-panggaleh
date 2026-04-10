import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Cpu, HardDrive, Clock, Activity, Loader2 } from 'lucide-react';

const MetricCard = ({ title, value, subValue, icon, color = 'var(--primary)' }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `rgba(79, 70, 229, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { color, size: 28 })}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 2px 0' }}>{value}</h3>
      {subValue && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subValue}</span>}
    </div>
  </div>
);

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds) => {
  if (!seconds) return '0m';
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await apiClient.get('/status');
        if (!mounted) return;
        
        const data = res.data;
        setStatus(data);
        setLoading(false);
        
        // Update history for chart
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: parseFloat(data.cpu.toFixed(1)),
          ram: parseFloat(data.ram.percent.toFixed(1))
        };
        
        setHistory(prev => {
          const updated = [...prev, newPoint];
          if (updated.length > 20) return updated.slice(updated.length - 20); // Keep last 20 points
          return updated;
        });
      } catch (err) {
        console.error('Failed to fetch status', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // 5 sec interval

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !status) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <style>{`.animate-spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <MetricCard 
          title="CPU Usage" 
          value={`${status?.cpu.toFixed(1)}%`} 
          subValue={`Load Avg: ${status?.loadAverage[0].toFixed(2)}`}
          icon={<Cpu />} 
        />
        <MetricCard 
          title="RAM Usage" 
          value={`${status?.ram.percent.toFixed(1)}%`} 
          subValue={`${formatBytes(status?.ram.used)} / ${formatBytes(status?.ram.total)}`}
          icon={<Activity />} 
        />
        <MetricCard 
          title="Disk Space" 
          value={`${status?.disk.percent.toFixed(1)}%`} 
          subValue={`${formatBytes(status?.disk.used)} / ${formatBytes(status?.disk.total)}`}
          icon={<HardDrive />} 
        />
        <MetricCard 
          title="Uptime" 
          value={formatUptime(status?.uptime)} 
          subValue="Server running smooth"
          icon={<Clock />} 
        />
      </div>

      <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Resource Usage (Real-time)</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Area type="monotone" dataKey="cpu" name="CPU %" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              <Area type="monotone" dataKey="ram" name="RAM %" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
