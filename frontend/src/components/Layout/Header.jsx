import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Welcome back, {user?.username || 'Admin'}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)' }}>
            <User size={16} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {user?.role === 'admin' ? 'Administrator' : 'Viewer'}
          </span>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, { color: 'var(--danger)' })}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, { color: 'var(--text-muted)' })}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
