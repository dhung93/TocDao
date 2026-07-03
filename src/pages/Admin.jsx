import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { supabase } from '../supabaseClient';

function Admin() {
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
      const { data, error } = await supabase
        .from('posts')
        .insert([
          { title, category, content }
        ]);

      if (error) throw error;
      
      setSuccess(true);
      // Reset form after a delay
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
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '2rem' }}>Viết Bài Mới</h2>
      
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
              config={{
                placeholder: 'Nhập nội dung bài viết vào đây...'
              }}
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu Bài Viết'}
        </button>
      </form>
    </div>
  );
}

export default Admin;
