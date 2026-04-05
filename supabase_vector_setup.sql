-- Legal Buddy - RAG Vector Setup
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS legal_documents (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_type        TEXT NOT NULL CHECK (doc_type IN ('court_decision', 'law', 'statute')),
  source          TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  court           TEXT,
  decision_date   DATE,
  file_number     TEXT,
  legal_area      TEXT,
  url             TEXT,
  embedding       vector(768),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS legal_docs_embedding_idx
  ON legal_documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS legal_docs_area_idx ON legal_documents (legal_area);
CREATE INDEX IF NOT EXISTS legal_docs_type_idx ON legal_documents (doc_type);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_legal_docs" ON legal_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_legal_docs" ON legal_documents
  FOR ALL USING (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'service_role'
  );

CREATE OR REPLACE FUNCTION search_legal_documents(
  query_embedding  vector(768),
  match_threshold  FLOAT   DEFAULT 0.65,
  match_count      INT     DEFAULT 8,
  filter_area      TEXT    DEFAULT NULL,
  filter_doc_type  TEXT    DEFAULT NULL
)
RETURNS TABLE (
  id UUID, doc_type TEXT, source TEXT, title TEXT, content TEXT,
  court TEXT, decision_date DATE, file_number TEXT, legal_area TEXT,
  url TEXT, similarity FLOAT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ld.id, ld.doc_type, ld.source, ld.title, ld.content, ld.court,
    ld.decision_date, ld.file_number, ld.legal_area, ld.url,
    1 - (ld.embedding <=> query_embedding) AS similarity
  FROM legal_documents ld
  WHERE (filter_area IS NULL OR ld.legal_area ILIKE '%' || filter_area || '%')
    AND (filter_doc_type IS NULL OR ld.doc_type = filter_doc_type)
    AND 1 - (ld.embedding <=> query_embedding) > match_threshold
  ORDER BY ld.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_legal_documents TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','error')),
  docs_total INTEGER DEFAULT 0, docs_done INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ, error_msg TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_ingestion_jobs" ON ingestion_jobs
  FOR ALL USING (coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin');
