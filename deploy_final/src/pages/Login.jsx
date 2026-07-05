import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginMode) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (password === '123456') {
          setNeedsPasswordChange(true);
          setLoading(false);
          return;
        }

        navigate('/admin');
      } else {
        // REGISTER
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (err) {
      if (err.message.includes('Email not confirmed')) {
        setError('Tài khoản chưa được xác nhận. Vui lòng liên hệ Admin hoặc check email.');
      } else {
        setError(err.message || 'Thao tác thất bại. Kiểm tra lại thông tin.');
      }
    } finally {
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
        <h2 style={{ textAlign: 'center', color: 'var(--primary-blue)', marginBottom: '10px' }}>
          {isLoginMode ? 'Đăng Nhập Hệ Thống' : 'Tạo Tài Khoản Mới'}
        </h2>
        {!needsPasswordChange && (
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>
            {isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
                setMessage(null);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}
            >
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        )}
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee', color: 'red', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        {!needsPasswordChange ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="VD: nguyenvan_a@gmail.com"
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
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (isLoginMode ? 'Đăng Nhập' : 'Đăng Ký')}
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
