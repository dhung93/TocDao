import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function Activities({ session, type = "Hoạt động" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    fetchPosts();
    if (session?.user) {
      checkRole();
    }
  }, [session, type]);

  async function checkRole() {
    const { data } = await supabase
      .from('user_roles')
      .select('is_admin, menu_post')
      .eq('user_id', session.user.id)
      .single();
    
    if (data && (data.is_admin || data.menu_post)) {
      setCanWrite(true);
    }
  }

  async function fetchPosts() {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (type === "Thông báo") {
        query = query.eq('category', 'Thông báo');
      } else {
        query = query.neq('category', 'Thông báo');
      }

      const { data, error } = await query;

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
        <h2>{type === "Thông báo" ? "Bảng Thông Báo" : "Hoạt Động & Phong Trào"}</h2>
        {canWrite && <Link to="/admin" className="btn">Viết {type === "Thông báo" ? "thông báo" : "bài"} mới</Link>}
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
                <Link to={`/post/${post.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', display: 'inline-block', textDecoration: 'none' }}>Đọc thêm</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activities;
