-- Migration RAG: bang tai_lieu_chunks cho vector store (bge-m3, 1024 chieu)
-- KHONG dung 9 bang nghiep vu cu. Chi bang tri thuc rieng cho chatbot RAG.
-- 1024 < 2000 nen tao duoc HNSW index (nhanh hon brute-force khi nhieu chunk).

CREATE EXTENSION IF NOT EXISTS vector;

DROP TABLE IF EXISTS tai_lieu_chunks;

CREATE TABLE tai_lieu_chunks (
  id SERIAL PRIMARY KEY,
  noi_dung TEXT NOT NULL,
  embedding VECTOR(1024),
  vai_tro VARCHAR(20) DEFAULT 'chung',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_chunks_hnsw
  ON tai_lieu_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_tai_lieu_chunks_vai_tro
  ON tai_lieu_chunks (vai_tro);
