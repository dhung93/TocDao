import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft } from 'lucide-react';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setPost(data);
    }
    setLoading(false);
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải bài viết...</div>;
  if (!post) return <div style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy bài viết.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--white)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--country-earth)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1rem', padding: 0 }}
      >
        <ArrowLeft size={18} style={{ marginRight: '5px' }} /> Quay lại
      </button>
      
      <h1 style={{ color: 'var(--dark-blue)', marginBottom: '10px', fontSize: '2.2rem', lineHeight: 1.3 }}>{post.title}</h1>
      <div style={{ color: '#666', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
        <span style={{ margin: '0 10px' }}>•</span>
        <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>{post.category}</span>
      </div>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#333' }}></div>
    </div>
  );
}

export default PostDetail;
