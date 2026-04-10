import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Server, 
  Activity, 
  Cpu, 
  Settings, 
  TerminalSquare,
  FolderOpen,
  Network,
  Info 
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Monitoring', icon: <Activity size={20} /> },
  { path: '/dashboard/process', label: 'Processes', icon: <Cpu size={20} /> },
  { path: '/dashboard/services', label: 'Services', icon: <Settings size={20} /> },
  { path: '/dashboard/logs', label: 'System Logs', icon: <TerminalSquare size={20} /> },
  { path: '/dashboard/files', label: 'Files Explorer', icon: <FolderOpen size={20} /> },
  { path: '/dashboard/network', label: 'Network', icon: <Network size={20} /> },
  { path: '/dashboard/system', label: 'System Info', icon: <Info size={20} /> },
  { path: '/dashboard/server-control', label: 'Server Control', icon: <Server size={20} /> }
];

const Sidebar = () => {
  return (
    <aside style={{ width: '260px', backgroundColor: 'var(--bg-darker)', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)' }}>
          <Server size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>ServerDash</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Advanced Control</span>
        </div>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, padding: '0 10px', marginBottom: '8px', letterSpacing: '0.05em' }}>Menu</p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: isActive ? 'white' : 'var(--text-muted)',
              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              border: `1px solid ${isActive ? 'rgba(79, 70, 229, 0.3)' : 'transparent'}`,
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            })}
          >
            {React.cloneElement(item.icon, { 
              color: 'currentColor',
              style: { opacity: 0.9 }
            })}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>System Online</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>All services running</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
