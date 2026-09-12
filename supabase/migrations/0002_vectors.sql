CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE TABLE dealr.listing_embeddings(listing_id text PRIMARY KEY REFERENCES dealr.listings(id),embedding public.vector(1536) NOT NULL,content_hash text NOT NULL,model text NOT NULL,updated_at text NOT NULL);
CREATE INDEX idx_listing_embeddings_vector ON dealr.listing_embeddings USING hnsw(embedding public.vector_cosine_ops);
