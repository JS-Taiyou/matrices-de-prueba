import { Database } from "bun:sqlite";

const db = new Database("src/db/fields.db");

db.run(`
  CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    is_optional BOOLEAN DEFAULT true,
    type VARCHAR(50) NOT NULL,
    helper TEXT,
    father_field INTEGER,
    is_composite BOOLEAN DEFAULT false,
    default_value TEXT,
    output_label TEXT,
    FOREIGN KEY (father_field) REFERENCES fields(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS field_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value VARCHAR(255) NOT NULL,
    field_id INTEGER NOT NULL,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
  )
`);

export { db };
