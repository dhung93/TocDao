import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { supabase } from '../supabaseClient';
import MemberManager from './admin/MemberManager';

class SupabaseUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file
      .then(file => new Promise(async (resolve, reject) => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `posts/${fileName}`;

          const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            alert('Lỗi tải ảnh lên Supabase: ' + error.message);
            return reject(error.message);
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          resolve({
            default: publicUrlData.publicUrl
          });
        } catch (err) {
          alert('Lỗi không xác định: ' + err.message);
          reject(err.message);
        }
      }));
  }

  abort() {}
}

function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new SupabaseUploadAdapter(loader);
  };
}

function Admin({ session }) {
  const [activeTab, setActiveTab] = useState('account');
  const [userRoles, setUserRoles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, [session]);

  const checkRole = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (data) {
      setUserRoles(data);
      if (data.is_admin || data.menu_tree) {
        setActiveTab('members');
      }
    }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải cấu hình...</div>;

  const isAdmin = userRoles?.is_admin || false;
  const canSeeTree = isAdmin || userRoles?.menu_tree;
  const canSeePost = isAdmin || userRoles?.menu_post;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'var(--white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>Bảng Điều Khiển Quản Trị</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '10px', flexWrap: 'wrap' }}>
        
        <button 
          onClick={() => setActiveTab('account')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'account' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'account' ? 'white' : '#555',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Tài khoản của tôi
        </button>

        {canSeeTree && (
          <button 
            onClick={() => setActiveTab('members')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'members' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'members' ? 'white' : '#555',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Quản lý Gia phả
          </button>
        )}

        {canSeePost && (
          <button 
            onClick={() => setActiveTab('posts')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'posts' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'posts' ? 'white' : '#555',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Đăng bài viết
          </button>
        )}

        {isAdmin && (
          <button 
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'users' ? 'var(--accent-green)' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#555',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Phân quyền User
          </button>
        )}

        {isAdmin && (
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'settings' ? 'var(--dark-blue)' : 'transparent',
              color: activeTab === 'settings' ? 'white' : '#555',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cấu hình Hệ thống
          </button>
        )}
      </div>

      {activeTab === 'posts' && <PostManager session={session} />}
      {activeTab === 'members' && <MemberManager session={session} userRoles={userRoles} />}
      {activeTab === 'account' && <AccountManager session={session} userRoles={userRoles} />}
      {activeTab === 'users' && isAdmin && <UserManager session={session} />}
      {activeTab === 'settings' && isAdmin && <SettingsManager session={session} />}

    </div>
  );
}

function PostManager({ session }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tin tức');
  const [content, setContent] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          { title, category, content }
        ]);

      if (error) throw error;
      
      // Nếu có chọn gửi email
      if (sendEmail) {
        try {
          const emailRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, category })
          });
          const emailData = await emailRes.json();
          if (!emailRes.ok) {
            throw new Error(emailData.message || 'Lỗi gửi email');
          }
        } catch (emailErr) {
          console.error('Email error:', emailErr);
          alert('Đăng bài thành công nhưng gửi email thất bại: ' + emailErr.message);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setContent('');
      }, 3000);
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu bài viết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Viết Bài Mới</h3>
      
      {success && (
        <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '1.5rem' }}>
          Lưu bài viết thành công!
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tiêu đề bài viết</label>
          <input 
            type="text" 
            className="form-control" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Nhập tiêu đề..."
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Danh mục</label>
          <select 
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Thông báo">Thông báo</option>
            <option value="Tin tức">Tin tức</option>
            <option value="Sự kiện">Sự kiện</option>
            <option value="Phong trào">Phong trào</option>
            <option value="Khuyến học">Khuyến học</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem', marginBottom: '1.5rem', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
          <input 
            type="checkbox" 
            id="sendEmail" 
            checked={sendEmail} 
            onChange={(e) => setSendEmail(e.target.checked)} 
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="sendEmail" style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--country-earth)', margin: 0 }}>
            Gửi email thông báo ngay cho toàn bộ thành viên gia tộc
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Nội dung</label>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={(event, editor) => {
                const data = editor.getData();
                setContent(data);
              }}
              config={{ 
                placeholder: 'Nhập nội dung bài viết vào đây...',
                extraPlugins: [CustomUploadAdapterPlugin]
              }}
            />
          </div>
        </div>

        <button type="submit" className="btn" style={{ marginTop: '1.5rem' }} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Đăng Bài Viết'}
        </button>
      </form>
    </div>
  );
}

function AccountManager({ session, userRoles }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = userRoles?.is_admin || false;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError('Lỗi khi đổi mật khẩu: ' + error.message);
    } else {
      setMessage('Đổi mật khẩu thành công!');
      setNewPassword('');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
      <h3 style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>Thông tin Tài khoản</h3>
      <div style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
        <strong>Email đăng nhập:</strong> {session?.user?.email}
      </div>
      <div style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
        <strong>Quyền hạn:</strong> {isAdmin ? <span style={{ color: 'red', fontWeight: 'bold' }}>Quản trị viên cấp cao (Admin)</span> : <span style={{ color: 'green', fontWeight: 'bold' }}>Thành viên</span>}
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#ddd' }} />

      <h4 style={{ marginBottom: '15px' }}>Đổi mật khẩu</h4>
      {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleUpdatePassword} style={{ maxWidth: '400px' }}>
        <div className="form-group">
          <label className="form-label">Mật khẩu mới</label>
          <input 
            type="password" 
            className="form-control" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu mới..."
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật Mật khẩu'}
        </button>
      </form>
    </div>
  );
}

function UserManager() {
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch users
    const resUsers = await supabase.from('user_roles').select('*').order('email', { ascending: true });
    // Fetch members for linking
    const resMembers = await supabase.from('members').select('id, name, gen, user_id').order('gen', { ascending: true });
    
    if (resUsers.data) setUsers(resUsers.data);
    if (resMembers.data) setMembers(resMembers.data);
    
    setLoading(false);
  };

  const handleToggleRole = async (userId, field, currentValue) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ [field]: !currentValue })
      .eq('user_id', userId);
    
    if (error) {
      alert('Lỗi cập nhật quyền: ' + error.message);
    } else {
      fetchData(); // refresh
    }
  };

  const handleLinkMember = async (userId, newMemberId) => {
    try {
      // 1. Clear any existing link for this user
      await supabase.from('members').update({ user_id: null }).eq('user_id', userId);
      
      // 2. Set the new link if a member was selected
      if (newMemberId) {
        const { error } = await supabase.from('members').update({ user_id: userId }).eq('id', newMemberId);
        if (error) throw error;
      }
      
      alert('Đã cập nhật liên kết thành công!');
      fetchData();
    } catch (err) {
      alert('Lỗi liên kết: ' + err.message);
    }
  };

  if (loading) return <div>Đang tải danh sách tài khoản...</div>;

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-green)' }}>Phân Quyền Chi Tiết & Phân Nhánh</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
        Tick chọn các quyền tương ứng. Bảng "Liên kết Thành viên" dùng để cấp quyền RLS (chỉ được sửa con cháu của người đó).
      </p>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Email Đăng nhập</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Admin</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Menu<br/>Gia phả</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Menu<br/>Bài viết</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Quyền<br/>Thêm</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Quyền<br/>Sửa</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Quyền<br/>Xóa</th>
              <th style={{ padding: '10px' }}>Liên kết với Thành viên (RLS)</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              // Tìm xem user này đang liên kết với member nào
              const linkedMember = members.find(m => m.user_id === u.user_id);
              return (
                <tr key={u.user_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.email || 'N/A'}</td>
                  
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={u.is_admin} onChange={() => handleToggleRole(u.user_id, 'is_admin', u.is_admin)} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={u.menu_tree} onChange={() => handleToggleRole(u.user_id, 'menu_tree', u.menu_tree)} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={u.menu_post} onChange={() => handleToggleRole(u.user_id, 'menu_post', u.menu_post)} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={u.can_add} onChange={() => handleToggleRole(u.user_id, 'can_add', u.can_add)} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={u.can_edit} onChange={() => handleToggleRole(u.user_id, 'can_edit', u.can_edit)} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input type="checkbox" checked={u.can_delete} onChange={() => handleToggleRole(u.user_id, 'can_delete', u.can_delete)} />
                  </td>
                  
                  <td style={{ padding: '10px' }}>
                    <select 
                      className="form-control" 
                      style={{ padding: '5px', fontSize: '0.8rem', width: '200px' }}
                      value={linkedMember ? linkedMember.id : ''}
                      onChange={(e) => handleLinkMember(u.user_id, e.target.value)}
                    >
                      <option value="">-- Chọn thành viên (Chưa liên kết) --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          Đời {m.gen} - {m.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center' }}>Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsManager() {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').single();
    if (data) {
      setEmail(data.gmail_address || '');
      setAppPassword(data.gmail_app_password || '');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, gmail_address: email, gmail_app_password: appPassword });
      
      if (error) throw error;
      setMessage('Lưu cấu hình thành công!');
    } catch (err) {
      alert('Lỗi lưu cấu hình: ' + err.message + '\n\n(Lưu ý: Bạn cần tạo bảng site_settings trong Supabase trước!)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
      <h3 style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>Cấu hình Email (SMTP Gmail)</h3>
      <p style={{ marginBottom: '15px', color: '#555', fontSize: '0.9rem' }}>
        Nhập địa chỉ Gmail và <strong>Mật khẩu Ứng dụng (App Password)</strong> để hệ thống có thể tự động gửi email thông báo.
      </p>
      
      {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}

      <form onSubmit={handleSave} style={{ maxWidth: '400px' }}>
        <div className="form-group">
          <label className="form-label">Địa chỉ Gmail</label>
          <input 
            type="email" 
            className="form-control" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ví dụ: giatoc@gmail.com"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Mật khẩu Ứng dụng (App Password)</label>
          <input 
            type="password" 
            className="form-control" 
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            placeholder="16 ký tự viết liền không dấu cách"
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu Cấu Hình'}
        </button>
      </form>
    </div>
  );
}

export default Admin;
