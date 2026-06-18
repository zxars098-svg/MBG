export type Role = 'admin' | 'gudang';

export interface User {
  id: number;
  username: string;
  password: string; // bcrypt hash
  nama: string;
  role: Role;
}

export interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  stok_minimum: number;
}

export interface Supplier {
  id: number;
  nama_supplier: string;
  alamat: string;
  no_hp: string;
}

export interface Dapur {
  id: number;
  nama_dapur: string;
}

export interface StokGudang {
  id_barang: number;
  stok_gudang: number;
}

export interface StokDapur {
  id: number;
  id_dapur: number;
  id_barang: number;
  qty: number;
}

export interface BarangMasuk {
  id: number;
  tanggal: string; // ISO date
  id_supplier: number;
  id_barang: number;
  qty: number;
  harga: number;
  subtotal: number;
}

export interface BarangKeluar {
  id: number;
  tanggal: string;
  id_dapur: number;
  id_barang: number;
  qty: number;
}

export interface PemakaianDapur {
  id: number;
  tanggal: string;
  id_dapur: number;
  id_barang: number;
  qty: number;
}

export interface HistoriTransaksi {
  id: number;
  tanggal: string;
  jenis_transaksi: 'Barang Masuk' | 'Distribusi' | 'Pemakaian';
  id_barang: number;
  qty: number;
  keterangan: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  aksi: string;
  modul: string;
  detail: string;
}

export interface Database {
  users: User[];
  barang: Barang[];
  supplier: Supplier[];
  dapur: Dapur[];
  stok: StokGudang[];
  stok_dapur: StokDapur[];
  barang_masuk: BarangMasuk[];
  barang_keluar: BarangKeluar[];
  pemakaian_dapur: PemakaianDapur[];
  histori: HistoriTransaksi[];
  audit_log: AuditLog[];
}

export type StockStatus = 'aman' | 'menipis' | 'habis';
