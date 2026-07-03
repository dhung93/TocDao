import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

function MemberManager({ session }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  
  // States for form
  const [formData, setFormData] = useState({
    name: '', dob: '', address: '', job: '', education: '', title: '', history: '',
    spouse: '', spouse_dob: '', spouse_job: '', spouse_education: '', spouse_title: '', spouse_history: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*').order('gen', { ascending: true });
    if (data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      dob: member.dob || '',
      address: member.address || '',
      job: member.job || '',
      education: member.education || '',
      title: member.title || '',
      history: member.history || '',
      
      spouse: member.spouse || '',
      spouse_dob: member.spouse_dob || '',
      spouse_job: member.spouse_job || '',
      spouse_education: member.spouse_education || '',
      spouse_title: member.spouse_title || '',
      spouse_history: member.spouse_history || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('members')
        .update(formData)
        .eq('id', editingMember.id);
        
      if (error) {
        if (error.code === '42501') {
          alert('Bạn không có quyền sửa thông tin của người này. Bạn chỉ có thể sửa thông tin của bản thân và con cháu trực hệ.');
        } else {
          alert('Lỗi cập nhật: ' + error.message);
        }
        return;
      }
      
      alert('Cập nhật thành công!');
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Quản lý Thành viên</h3>
      
      {editingMember ? (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--dark-blue)' }}>Chỉnh sửa: {editingMember.name} (Đời {editingMember.gen})</h4>
            <button onClick={() => setEditingMember(null)} className="btn btn-secondary" style={{ padding: '5px 15px' }}>Quay lại</button>
          </div>
          
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              {/* CỘT 1: THÔNG TIN CHÍNH */}
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h5 style={{ color: 'var(--primary-blue)', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Thông tin Bản thân</h5>
                
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-control" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trình độ học vấn</label>
                  <input type="text" className="form-control" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} placeholder="VD: Cử nhân, Thạc sĩ..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Công việc</label>
                  <input type="text" className="form-control" value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Chức vụ / Chức danh</label>
                  <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiểu sử ngắn</label>
                  <textarea className="form-control" rows="3" value={formData.history} onChange={e => setFormData({...formData, history: e.target.value})}></textarea>
                </div>
              </div>

              {/* CỘT 2: THÔNG TIN VỢ/CHỒNG */}
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h5 style={{ color: 'var(--accent-green)', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Thông tin Vợ/Chồng</h5>
                
                <div className="form-group">
                  <label className="form-label">Họ và tên Vợ/Chồng</label>
                  <input type="text" className="form-control" value={formData.spouse} onChange={e => setFormData({...formData, spouse: e.target.value})} placeholder="Bỏ trống nếu chưa có" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-control" value={formData.spouse_dob} onChange={e => setFormData({...formData, spouse_dob: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trình độ học vấn</label>
                  <input type="text" className="form-control" value={formData.spouse_education} onChange={e => setFormData({...formData, spouse_education: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Công việc</label>
                  <input type="text" className="form-control" value={formData.spouse_job} onChange={e => setFormData({...formData, spouse_job: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Chức vụ / Chức danh</label>
                  <input type="text" className="form-control" value={formData.spouse_title} onChange={e => setFormData({...formData, spouse_title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiểu sử ngắn</label>
                  <textarea className="form-control" rows="3" value={formData.spouse_history} onChange={e => setFormData({...formData, spouse_history: e.target.value})}></textarea>
                </div>
              </div>

            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button type="submit" className="btn" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>Lưu Tất Cả Thông Tin</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
            * Chú ý: Bạn chỉ có thể lưu thay đổi đối với thông tin của chính mình và con cháu cấp dưới (Quy định bởi RLS Bảo mật của hệ thống).
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Đời</th>
                <th style={{ padding: '10px' }}>Họ Tên</th>
                <th style={{ padding: '10px' }}>Vợ/Chồng</th>
                <th style={{ padding: '10px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{m.gen}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{m.name}</td>
                  <td style={{ padding: '10px', color: 'var(--accent-green)' }}>{m.spouse}</td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      onClick={() => handleEdit(m)}
                      style={{ padding: '5px 15px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Sửa Hồ Sơ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MemberManager;
