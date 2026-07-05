import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Navbar({ session }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Users size={28} />
        <span>Gia Tộc Họ Đào</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={isActive('/')}>
          HOME
        </Link>
        <Link to="/sodo" className={isActive('/sodo')}>
          Phổ hệ
        </Link>
        <Link to="/sodophohe" className={isActive('/sodophohe')}>
          Phổ Hệ Truyền Thống
        </Link>
        <Link to="/hoatdong" className={isActive('/hoatdong')}>
          Hoạt động
        </Link>
        <Link to="/thongbao" className={isActive('/thongbao')}>
          Thông báo
        </Link>
        
        {session ? (
          <>
            <Link to="/admin" className={isActive('/admin')}>
              Quản trị
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '15px', background: 'rgba(255,255,255,0.8)', padding: '5px 15px', borderRadius: '20px' }}>
              <User size={16} style={{ marginRight: '5px', color: 'var(--primary-blue)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', marginRight: '10px', fontWeight: 'bold' }}>
                {session.user.email}
              </span>
              <button 
                onClick={handleLogout} 
                style={{ background: 'var(--primary-blue)', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'background 0.2s' }}
              >
                Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className={isActive('/login')}>
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
