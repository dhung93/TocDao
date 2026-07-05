import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Vercel sets these automatically if configured, or we can use the ones from process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Bật CORS cho phép gọi từ Frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { title, content, category } = req.body;

  try {
    // 1. Lấy thông tin cấu hình mail từ Supabase
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('gmail_address, gmail_app_password')
      .single();

    if (settingsError || !settings?.gmail_address || !settings?.gmail_app_password) {
      console.error('Lỗi cấu hình email:', settingsError);
      return res.status(500).json({ message: 'Chưa cấu hình tài khoản Gmail trong quản trị.' });
    }

    // 2. Lấy danh sách email của tất cả user
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('email');

    if (usersError || !users || users.length === 0) {
      return res.status(500).json({ message: 'Không lấy được danh sách email người dùng.' });
    }

    const emailList = users.map(u => u.email).filter(Boolean);

    if (emailList.length === 0) {
      return res.status(200).json({ message: 'Không có email nào để gửi.' });
    }

    // 3. Cấu hình Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.gmail_address,
        pass: settings.gmail_app_password,
      },
    });

    // 4. Gửi mail
    const mailOptions = {
      from: `"Gia Tộc Họ Đào" <${settings.gmail_address}>`,
      bcc: emailList.join(','),
      subject: `[Thông báo mới] ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Gia Tộc Họ Đào có bài viết mới: ${title}</h2>
          <p><strong>Danh mục:</strong> ${category}</p>
          <hr/>
          <div style="margin-top: 20px;">
            ${content}
          </div>
          <hr/>
          <p style="font-size: 12px; color: #777;">
            Đây là email thông báo tự động từ hệ thống Gia Phả Gia Tộc Họ Đào. Vui lòng không trả lời email này.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Đã gửi email:', info.messageId);

    return res.status(200).json({ message: 'Đã gửi email thành công!', messageId: info.messageId });

  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi email', error: error.toString() });
  }
}
