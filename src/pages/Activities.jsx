import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function Activities() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Hoạt Động & Phong Trào</h2>
        <Link to="/admin" className="btn">Viết bài mới</Link>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="grid-cards">
          {posts.map(post => (
            <div key={post.id} className="card">
              <img src={post.image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop'} alt={post.title} className="card-img" />
              <div className="card-content">
                <span className="card-date">{new Date(post.created_at).toLocaleDateString('vi-VN')} - {post.category}</span>
                <h3 className="card-title">{post.title}</h3>
                <div className="card-desc" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }}></div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Đọc thêm</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activities;
