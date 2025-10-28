-- memory_votes_table.sql
\c engx;

CREATE TABLE IF NOT EXISTS memory_votes (
    id SERIAL PRIMARY KEY,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    value SMALLINT NOT NULL, -- 1 for upvote, -1 for downvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(memory_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_votes_memory_id ON memory_votes(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_votes_user_id ON memory_votes(user_id);
