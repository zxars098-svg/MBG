-- ============================================================
-- DATABASE SCHEMA — Gudang MBG Inventory Management System
-- Database: MySQL / MariaDB (compatible)
-- ============================================================

CREATE DATABASE IF NOT EXISTS gudang_mbg
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gudang_mbg;

-- ---------- Users ----------
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,           -- bcrypt hash
  nama        VARCHAR(100) NOT NULL,
  role        ENUM('admin','gudang') NOT NULL DEFAULT 'gudang',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Barang ----------
CREATE TABLE barang (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  kode_barang   VARCHAR(20)  NOT NULL UNIQUE,
  nama_barang   VARCHAR(120) NOT NULL,
  satuan        VARCHAR(20)  NOT NULL,
  stok_minimum  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Supplier ----------
CREATE TABLE supplier (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nama_supplier VARCHAR(120) NOT NULL,
  alamat        VARCHAR(255),
  no_hp         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Dapur ----------
CREATE TABLE dapur (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nama_dapur  VARCHAR(50) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Stok Gudang ----------
CREATE TABLE stok (
  id_barang   INT PRIMARY KEY,
  stok_gudang INT NOT NULL DEFAULT 0,
  FOREIGN KEY (id_barang) REFERENCES barang(id) ON DELETE CASCADE
);

-- ---------- Stok Dapur ----------
CREATE TABLE stok_dapur (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  id_dapur  INT NOT NULL,
  id_barang INT NOT NULL,
  qty       INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_dapur_barang (id_dapur, id_barang),
  FOREIGN KEY (id_dapur)  REFERENCES dapur(id)  ON DELETE CASCADE,
  FOREIGN KEY (id_barang) REFERENCES barang(id) ON DELETE CASCADE
);

-- ---------- Barang Masuk ----------
CREATE TABLE barang_masuk (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tanggal     DATE NOT NULL,
  id_supplier INT NOT NULL,
  id_barang   INT NOT NULL,
  qty         INT NOT NULL,
  harga       BIGINT NOT NULL,
  subtotal    BIGINT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_supplier) REFERENCES supplier(id),
  FOREIGN KEY (id_barang)   REFERENCES barang(id)
);

-- ---------- Barang Keluar (Distribusi) ----------
CREATE TABLE barang_keluar (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  tanggal   DATE NOT NULL,
  id_dapur  INT NOT NULL,
  id_barang INT NOT NULL,
  qty       INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_dapur)  REFERENCES dapur(id),
  FOREIGN KEY (id_barang) REFERENCES barang(id)
);

-- ---------- Pemakaian Dapur ----------
CREATE TABLE pemakaian_dapur (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  tanggal   DATE NOT NULL,
  id_dapur  INT NOT NULL,
  id_barang INT NOT NULL,
  qty       INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_dapur)  REFERENCES dapur(id),
  FOREIGN KEY (id_barang) REFERENCES barang(id)
);

-- ---------- Histori Transaksi ----------
CREATE TABLE histori_transaksi (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  tanggal          DATE NOT NULL,
  jenis_transaksi  ENUM('Barang Masuk','Distribusi','Pemakaian') NOT NULL,
  id_barang        INT NOT NULL,
  qty              INT NOT NULL,
  keterangan       VARCHAR(255),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_barang) REFERENCES barang(id)
);

-- ---------- Audit Log ----------
CREATE TABLE audit_log (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  username  VARCHAR(50) NOT NULL,
  aksi      VARCHAR(50) NOT NULL,
  modul     VARCHAR(50) NOT NULL,
  detail    VARCHAR(255)
);

-- ============================================================
-- SEED DATA
-- ============================================================
-- Default admin (password: admin123 — bcrypt hash)
INSERT INTO users (username, password, nama, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3u8hVUdLlG8WQHm6m4QqZJY9eOe', 'Administrator Gudang', 'admin'),
('gudang', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3u8hVUdLlG8WQHm6m4QqZJY9eOe', 'Staff Gudang MBG', 'gudang');

INSERT INTO dapur (nama_dapur) VALUES ('Dapur A'), ('Dapur B'), ('Dapur C');

INSERT INTO barang (kode_barang, nama_barang, satuan, stok_minimum) VALUES
('BRG-001','Beras Premium','Kg',50),
('BRG-002','Minyak Goreng','Liter',30),
('BRG-003','Gula Pasir','Kg',40),
('BRG-004','Telur Ayam','Kg',25),
('BRG-005','Tepung Terigu','Kg',35),
('BRG-006','Ayam Fillet','Kg',20),
('BRG-007','Wortel','Kg',15),
('BRG-008','Bawang Merah','Kg',10),
('BRG-009','Bawang Putih','Kg',10),
('BRG-010','Cabai Merah','Kg',8),
('BRG-011','Susu UHT','Liter',30),
('BRG-012','Mentega','Kg',12);

INSERT INTO supplier (nama_supplier, alamat, no_hp) VALUES
('PT Sumber Pangan Jaya','Jl. Industri No. 12, Jakarta Barat','081234567890'),
('CV Berkah Tani','Jl. Pertanian No. 8, Bogor','081298765432'),
('PT Sembako Nusantara','Jl. Raya Bekasi KM 15, Bekasi','082145678901'),
('UD Sumber Rejeki','Jl. Pasar Lama No. 22, Tangerang','083312345678');

INSERT INTO stok (id_barang, stok_gudang) VALUES
(1,320),(2,180),(3,240),(4,95),(5,160),(6,70),(7,45),(8,18),(9,14),(10,9),(11,110),(12,28);

INSERT INTO stok_dapur (id_dapur, id_barang, qty) VALUES
(1,1,80),(1,2,40),(1,3,35),(1,4,20),
(2,1,60),(2,2,30),(2,5,25),
(3,1,50),(3,6,18),(3,7,12);

-- ============================================================
-- RELATIONS SUMMARY
-- ============================================================
-- barang_masuk.id_supplier  -> supplier.id
-- barang_masuk.id_barang    -> barang.id
-- barang_keluar.id_dapur    -> dapur.id
-- barang_keluar.id_barang   -> barang.id
-- pemakaian_dapur.id_dapur  -> dapur.id
-- pemakaian_dapur.id_barang -> barang.id
-- stok.id_barang            -> barang.id
-- stok_dapur.id_dapur       -> dapur.id
-- stok_dapur.id_barang      -> barang.id
-- histori_transaksi.id_barang -> barang.id
