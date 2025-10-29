\c engx;

create table filter_catagories (
    filter_id SERIAL PRIMARY KEY,
    filter_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);