import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <section className="hero">
        <h1>Gia Tộc Họ Đào</h1>
        <p>Gìn giữ truyền thống, nối kết quá khứ và tương lai. Trang thông tin chính thức của dòng họ, nơi lưu giữ những giá trị văn hóa và kỷ niệm đáng nhớ.</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/sodo" className="btn">Xem Sơ Đồ Gia Tộc</Link>
          <Link to="/hoatdong" className="btn btn-secondary">Hoạt Động Gần Đây</Link>
        </div>
      </section>

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Tin Tức Nổi Bật</h2>
        <div className="grid-cards">
          {/* Mock activities */}
          <div className="card">
            <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop" alt="Họp mặt" className="card-img" />
            <div className="card-content">
              <span className="card-date">15 Tháng 8, 2026</span>
              <h3 className="card-title">Họp mặt toàn tộc thường niên</h3>
              <p className="card-desc">Buổi họp mặt toàn tộc nhằm ôn lại truyền thống lịch sử, trao đổi về các hoạt động của gia tộc trong năm qua và đề ra phương hướng hoạt động năm tới...</p>
              <Link to="/hoatdong" style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>Đọc thêm &rarr;</Link>
            </div>
          </div>
          <div className="card">
            <img src="https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=2015&auto=format&fit=crop" alt="Quỹ khuyến học" className="card-img" />
            <div className="card-content">
              <span className="card-date">2 Tháng 9, 2026</span>
              <h3 className="card-title">Trao học bổng quỹ khuyến học</h3>
              <p className="card-desc">Lễ trao học bổng cho các cháu có thành tích học tập xuất sắc trong năm học 2025-2026. Đây là sự khích lệ tinh thần hiếu học của con em trong họ...</p>
              <Link to="/hoatdong" style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>Đọc thêm &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
