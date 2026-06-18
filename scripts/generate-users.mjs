import bcrypt from 'bcryptjs';

async function generateUserSQL() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const gudangHash = await bcrypt.hash('gudang123', 10);
  
  console.log('Hash admin123:', adminHash);
  console.log('Hash gudang123:', gudangHash);
  console.log('\n--- SQL untuk Supabase ---\n');
  
  console.log(`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'gudang',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, password, nama, role) VALUES
('admin', '${adminHash}', 'Administrator Gudang', 'admin'),
('gudang', '${gudangHash}', 'Staff Gudang MBG', 'gudang');`);
}

generateUserSQL();
