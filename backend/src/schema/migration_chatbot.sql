-- Migration chatbot RAG: tao bang tai_lieu_chunks cho vector store
-- KHONG dung 9 bang cu (thon, nguoi_dung, ho_dan, dot_ke_khai, ke_khai_ho, ke_khai_thon, minh_chung, thong_bao, nhat_ky)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS tai_lieu_chunks (
  id SERIAL PRIMARY KEY,
  noi_dung TEXT NOT NULL,
  embedding VECTOR(3072),
  vai_tro VARCHAR(20) DEFAULT 'chung',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3072 dimensions vuot qua gioi han 2000 cua hnsw index
-- Voi ~200 chunks, brute-force cosine du nhanh, khong can index
