import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Edit } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
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
        <Link to="/admin" className={isActive('/admin')}>
          Quản trị
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
