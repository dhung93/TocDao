import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { familyData } from './src/pages/data.js';

const SUPABASE_URL = 'https://snpsbbhfngovwkwftluy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6IJvMWBOgWN5WKC6LD9ebA_rPM4F24F';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('1. Đang tạo tài khoản Admin...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'dhung.ou@gmail.com',
    password: 'DuyHung@2026'
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('Tài khoản đã tồn tại, tiếp tục...');
    } else {
        console.error('Lỗi tạo tài khoản:', authError);
        return;
    }
  } else {
    console.log('Tạo tài khoản thành công!');
  }

  console.log('2. Đang tạo SQL migration script...');
  
  let sql = `-- MIGRATION SCRIPT
DO $$
DECLARE
    admin_uid UUID;
`;

  // We need variables to hold the UUIDs for each member to link parent_ids
  // Since we don't know the UUIDs beforehand, we will generate random UUIDs in SQL
  // or we can generate UUIDs in Node.js and just hardcode them in the SQL.
  // Generating them in Node.js is much easier.

  const { v4: uuidv4 } = await import('uuid');

  let members = [];
  
  function traverse(node, parentId = null) {
    const id = uuidv4();
    members.push({
      id: id,
      parent_id: parentId,
      name: node.name,
      spouse: node.spouse || null,
      gen: node.gen
    });
    
    if (node.children) {
      node.children.forEach(child => traverse(child, id));
    }
  }

  traverse(familyData);

  sql += `BEGIN
    -- 1. Set quyền Admin
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'dhung.ou@gmail.com';
    IF admin_uid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, is_admin, can_post) 
        VALUES (admin_uid, TRUE, TRUE) 
        ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE, can_post = TRUE;
    END IF;

    -- Xóa dữ liệu cũ nếu chạy lại
    DELETE FROM public.members;

    -- 2. Chèn 300+ thành viên
`;

  // Generate INSERT statements. We do them in chunks or one by one.
  // One big INSERT is better.
  sql += `    INSERT INTO public.members (id, parent_id, name, spouse, gen, is_alive) VALUES\n`;
  
  const values = members.map(m => {
    const pId = m.parent_id ? `'${m.parent_id}'` : 'NULL';
    const spouse = m.spouse ? `'${m.spouse.replace(/'/g, "''")}'` : 'NULL';
    const name = `'${m.name.replace(/'/g, "''")}'`;
    return `    ('${m.id}', ${pId}, ${name}, ${spouse}, ${m.gen}, TRUE)`;
  });

  sql += values.join(',\n') + ';\n';
  
  sql += `END $$;`;

  fs.writeFileSync('migration.sql', sql);
  console.log('Đã lưu file migration.sql thành công!');
}

run();
