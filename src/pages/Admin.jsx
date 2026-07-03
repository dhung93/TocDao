import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { supabase } from '../supabaseClient';
import MemberManager from './admin/MemberManager';

function Admin({ session }) {
  const [activeTab, setActiveTab] = useState('members');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkRole();
  }, [session]);

  const checkRole = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('user_roles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .single();
    
    if (data && data.is_admin) {
      setIsAdmin(true);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'var(--white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>Bảng Điều Khiển Quản Trị</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
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
      </div>

      {activeTab === 'posts' && <PostManager session={session} />}
      {activeTab === 'members' && <MemberManager session={session} />}

    </div>
  );
}

function PostManager({ session }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tin tức');
  const [content, setContent] = useState('');
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
          { title, category, content, author_id: session?.user?.id }
        ]);

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setContent('');
      }, 3000);
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu bài viết. Bạn có quyền viết bài không?');
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
            <option value="Tin tức">Tin tức</option>
            <option value="Sự kiện">Sự kiện</option>
            <option value="Phong trào">Phong trào</option>
            <option value="Khuyến học">Khuyến học</option>
          </select>
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
              config={{ placeholder: 'Nhập nội dung bài viết vào đây...' }}
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

export default Admin;
