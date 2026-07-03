import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
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
          Tổng quan
        </Link>
        <Link to="/sodo" className={isActive('/sodo')}>
          Sơ đồ
        </Link>
        <Link to="/hoatdong" className={isActive('/hoatdong')}>
          Hoạt động
        </Link>
        
        {session ? (
          <>
            <Link to="/admin" className={isActive('/admin')}>
              Quản trị
            </Link>
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}
            >
              Đăng xuất
            </button>
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
