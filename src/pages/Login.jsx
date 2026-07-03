import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States cho trường hợp phải đổi mật khẩu lần đầu
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Nếu mật khẩu đăng nhập là 123456 (mặc định), yêu cầu đổi ngay
      if (password === '123456') {
        setNeedsPasswordChange(true);
        setLoading(false);
        return;
      }

      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('Đổi mật khẩu thành công! Chào mừng bạn vào hệ thống.');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '30px' }}>
          Đăng Nhập Quản Trị
        </h2>
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee', color: 'red', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {!needsPasswordChange ? (
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Email (hoặc SĐT@tocdao.com)</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="VD: admin@tocdao.com"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label">Mật khẩu</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <strong>Lưu ý:</strong> Đây là lần đăng nhập đầu tiên bằng mật khẩu mặc định. Yêu cầu bạn đổi mật khẩu mới để bảo mật!
            </div>
            
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label">Mật khẩu Mới</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '12px', fontSize: '1.1rem', backgroundColor: 'var(--accent-green)' }}
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Đổi Mật Khẩu & Truy Cập'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
