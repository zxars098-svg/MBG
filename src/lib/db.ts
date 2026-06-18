import bcrypt from 'bcryptjs';
import type { Database } from './types';

const DB_KEY = 'mbg_inventory_db_v1';

const seedUsers = async (): Promise<Database['users']> => {
  const adminHash = await bcrypt.hash('admin123', 10);
  return [
    { id: 1, username: 'admin', password: adminHash, nama: 'Administrator Gudang', role: 'admin' },
    { id: 2, username: 'gudang', password: await bcrypt.hash('gudang123', 10), nama: 'Staff Gudang MBG', role: 'gudang' },
  ];
};

const seedBarang = [
  { id: 1, kode_barang: 'BRG-001', nama_barang: 'Beras Premium', satuan: 'Kg', stok_minimum: 50 },
  { id: 2, kode_barang: 'BRG-002', nama_barang: 'Minyak Goreng', satuan: 'Liter', stok_minimum: 30 },
  { id: 3, kode_barang: 'BRG-003', nama_barang: 'Gula Pasir', satuan: 'Kg', stok_minimum: 40 },
  { id: 4, kode_barang: 'BRG-004', nama_barang: 'Telur Ayam', satuan: 'Kg', stok_minimum: 25 },
  { id: 5, kode_barang: 'BRG-005', nama_barang: 'Tepung Terigu', satuan: 'Kg', stok_minimum: 35 },
  { id: 6, kode_barang: 'BRG-006', nama_barang: 'Ayam Fillet', satuan: 'Kg', stok_minimum: 20 },
  { id: 7, kode_barang: 'BRG-007', nama_barang: 'Wortel', satuan: 'Kg', stok_minimum: 15 },
  { id: 8, kode_barang: 'BRG-008', nama_barang: 'Bawang Merah', satuan: 'Kg', stok_minimum: 10 },
  { id: 9, kode_barang: 'BRG-009', nama_barang: 'Bawang Putih', satuan: 'Kg', stok_minimum: 10 },
  { id: 10, kode_barang: 'BRG-010', nama_barang: 'Cabai Merah', satuan: 'Kg', stok_minimum: 8 },
  { id: 11, kode_barang: 'BRG-011', nama_barang: 'Susu UHT', satuan: 'Liter', stok_minimum: 30 },
  { id: 12, kode_barang: 'BRG-012', nama_barang: 'Mentega', satuan: 'Kg', stok_minimum: 12 },
];

const seedSupplier = [
  { id: 1, nama_supplier: 'PT Sumber Pangan Jaya', alamat: 'Jl. Industri No. 12, Jakarta Barat', no_hp: '081234567890' },
  { id: 2, nama_supplier: 'CV Berkah Tani', alamat: 'Jl. Pertanian No. 8, Bogor', no_hp: '081298765432' },
  { id: 3, nama_supplier: 'PT Sembako Nusantara', alamat: 'Jl. Raya Bekasi KM 15, Bekasi', no_hp: '082145678901' },
  { id: 4, nama_supplier: 'UD Sumber Rejeki', alamat: 'Jl. Pasar Lama No. 22, Tangerang', no_hp: '083312345678' },
];

const seedDapur = [
  { id: 1, nama_dapur: 'Dapur A' },
  { id: 2, nama_dapur: 'Dapur B' },
  { id: 3, nama_dapur: 'Dapur C' },
];

const seedStok = [
  { id_barang: 1, stok_gudang: 320 },
  { id_barang: 2, stok_gudang: 180 },
  { id_barang: 3, stok_gudang: 240 },
  { id_barang: 4, stok_gudang: 95 },
  { id_barang: 5, stok_gudang: 160 },
  { id_barang: 6, stok_gudang: 70 },
  { id_barang: 7, stok_gudang: 45 },
  { id_barang: 8, stok_gudang: 18 },
  { id_barang: 9, stok_gudang: 14 },
  { id_barang: 10, stok_gudang: 9 },
  { id_barang: 11, stok_gudang: 110 },
  { id_barang: 12, stok_gudang: 28 },
];

const seedStokDapur = [
  { id: 1, id_dapur: 1, id_barang: 1, qty: 80 },
  { id: 2, id_dapur: 1, id_barang: 2, qty: 40 },
  { id: 3, id_dapur: 1, id_barang: 3, qty: 35 },
  { id: 4, id_dapur: 1, id_barang: 4, qty: 20 },
  { id: 5, id_dapur: 2, id_barang: 1, qty: 60 },
  { id: 6, id_dapur: 2, id_barang: 2, qty: 30 },
  { id: 7, id_dapur: 2, id_barang: 5, qty: 25 },
  { id: 8, id_dapur: 3, id_barang: 1, qty: 50 },
  { id: 9, id_dapur: 3, id_barang: 6, qty: 18 },
  { id: 10, id_dapur: 3, id_barang: 7, qty: 12 },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const seedBarangMasuk = [
  { id: 1, tanggal: isoDaysAgo(6), id_supplier: 1, id_barang: 1, qty: 200, harga: 13500, subtotal: 2700000 },
  { id: 2, tanggal: isoDaysAgo(6), id_supplier: 1, id_barang: 2, qty: 100, harga: 16000, subtotal: 1600000 },
  { id: 3, tanggal: isoDaysAgo(5), id_supplier: 2, id_barang: 3, qty: 150, harga: 14000, subtotal: 2100000 },
  { id: 4, tanggal: isoDaysAgo(4), id_supplier: 3, id_barang: 4, qty: 80, harga: 28000, subtotal: 2240000 },
  { id: 5, tanggal: isoDaysAgo(3), id_supplier: 2, id_barang: 5, qty: 120, harga: 12000, subtotal: 1440000 },
  { id: 6, tanggal: isoDaysAgo(2), id_supplier: 1, id_barang: 6, qty: 60, harga: 45000, subtotal: 2700000 },
  { id: 7, tanggal: isoDaysAgo(1), id_supplier: 4, id_barang: 7, qty: 40, harga: 9000, subtotal: 360000 },
  { id: 8, tanggal: isoDaysAgo(1), id_supplier: 3, id_barang: 11, qty: 90, harga: 18000, subtotal: 1620000 },
];

const seedBarangKeluar = [
  { id: 1, tanggal: isoDaysAgo(5), id_dapur: 1, id_barang: 1, qty: 80 },
  { id: 2, tanggal: isoDaysAgo(5), id_dapur: 1, id_barang: 2, qty: 40 },
  { id: 3, tanggal: isoDaysAgo(4), id_dapur: 2, id_barang: 1, qty: 60 },
  { id: 4, tanggal: isoDaysAgo(4), id_dapur: 2, id_barang: 2, qty: 30 },
  { id: 5, tanggal: isoDaysAgo(3), id_dapur: 3, id_barang: 1, qty: 50 },
  { id: 6, tanggal: isoDaysAgo(2), id_dapur: 1, id_barang: 3, qty: 35 },
  { id: 7, tanggal: isoDaysAgo(2), id_dapur: 3, id_barang: 6, qty: 18 },
  { id: 8, tanggal: isoDaysAgo(1), id_dapur: 2, id_barang: 5, qty: 25 },
  { id: 9, tanggal: isoDaysAgo(1), id_dapur: 3, id_barang: 7, qty: 12 },
  { id: 10, tanggal: isoDaysAgo(1), id_dapur: 1, id_barang: 4, qty: 20 },
];

const seedPemakaian = [
  { id: 1, tanggal: isoDaysAgo(4), id_dapur: 1, id_barang: 1, qty: 15 },
  { id: 2, tanggal: isoDaysAgo(4), id_dapur: 1, id_barang: 2, qty: 8 },
  { id: 3, tanggal: isoDaysAgo(3), id_dapur: 2, id_barang: 1, qty: 12 },
  { id: 4, tanggal: isoDaysAgo(3), id_dapur: 3, id_barang: 1, qty: 10 },
  { id: 5, tanggal: isoDaysAgo(2), id_dapur: 1, id_barang: 3, qty: 6 },
  { id: 6, tanggal: isoDaysAgo(2), id_dapur: 3, id_barang: 6, qty: 4 },
  { id: 7, tanggal: isoDaysAgo(1), id_dapur: 2, id_barang: 5, qty: 5 },
  { id: 8, tanggal: isoDaysAgo(1), id_dapur: 1, id_barang: 4, qty: 3 },
];

const seedHistori = [
  { id: 1, tanggal: isoDaysAgo(6), jenis_transaksi: 'Barang Masuk' as const, id_barang: 1, qty: 200, keterangan: 'Pembelian dari PT Sumber Pangan Jaya' },
  { id: 2, tanggal: isoDaysAgo(6), jenis_transaksi: 'Barang Masuk' as const, id_barang: 2, qty: 100, keterangan: 'Pembelian dari PT Sumber Pangan Jaya' },
  { id: 3, tanggal: isoDaysAgo(5), jenis_transaksi: 'Distribusi' as const, id_barang: 1, qty: 80, keterangan: 'Distribusi ke Dapur A' },
  { id: 4, tanggal: isoDaysAgo(5), jenis_transaksi: 'Distribusi' as const, id_barang: 2, qty: 40, keterangan: 'Distribusi ke Dapur A' },
  { id: 5, tanggal: isoDaysAgo(4), jenis_transaksi: 'Pemakaian' as const, id_barang: 1, qty: 15, keterangan: 'Pemakaian Dapur A' },
  { id: 6, tanggal: isoDaysAgo(4), jenis_transaksi: 'Distribusi' as const, id_barang: 1, qty: 60, keterangan: 'Distribusi ke Dapur B' },
  { id: 7, tanggal: isoDaysAgo(3), jenis_transaksi: 'Pemakaian' as const, id_barang: 1, qty: 12, keterangan: 'Pemakaian Dapur B' },
  { id: 8, tanggal: isoDaysAgo(3), jenis_transaksi: 'Distribusi' as const, id_barang: 1, qty: 50, keterangan: 'Distribusi ke Dapur C' },
  { id: 9, tanggal: isoDaysAgo(2), jenis_transaksi: 'Pemakaian' as const, id_barang: 3, qty: 6, keterangan: 'Pemakaian Dapur A' },
  { id: 10, tanggal: isoDaysAgo(1), jenis_transaksi: 'Pemakaian' as const, id_barang: 5, qty: 5, keterangan: 'Pemakaian Dapur B' },
];

const seedAudit = [
  { id: 1, timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), username: 'admin', aksi: 'Login', modul: 'Auth', detail: 'Login berhasil' },
  { id: 2, timestamp: new Date(Date.now() - 86400000 * 6).toISOString(), username: 'admin', aksi: 'Tambah', modul: 'Barang Masuk', detail: 'Input 200 Kg Beras Premium' },
  { id: 3, timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), username: 'admin', aksi: 'Distribusi', modul: 'Barang Keluar', detail: 'Distribusi 80 Kg Beras ke Dapur A' },
];

export async function initDatabase(): Promise<Database> {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as Database;
    } catch {
      // fall through to seed
    }
  }
  const users = await seedUsers();
  const db: Database = {
    users,
    barang: seedBarang,
    supplier: seedSupplier,
    dapur: seedDapur,
    stok: seedStok,
    stok_dapur: seedStokDapur,
    barang_masuk: seedBarangMasuk,
    barang_keluar: seedBarangKeluar,
    pemakaian_dapur: seedPemakaian,
    histori: seedHistori,
    audit_log: seedAudit,
  };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

export function saveDatabase(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDatabase(): void {
  localStorage.removeItem(DB_KEY);
}

export function nextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

export function nextStokDapurId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}
