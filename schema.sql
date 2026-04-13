DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  industry TEXT NOT NULL,
  summary TEXT NOT NULL,
  logoUrl TEXT,
  tags TEXT NOT NULL, -- Stored as JSON string
  status TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

DROP TABLE IF EXISTS facts;
CREATE TABLE facts (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  content TEXT NOT NULL,
  evidenceUrl TEXT,
  remark TEXT,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS timeline_events;
CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  evidenceUrl TEXT,
  impact TEXT,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS contract_terms;
CREATE TABLE contract_terms (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  originalText TEXT NOT NULL,
  problem TEXT NOT NULL,
  risk TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  evidenceUrl TEXT,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Initialize default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('disclaimer', '本站内容均为个人经历陈述与公开材料索引。本站不对其中提到的任何公司或个人做最终法律定性。请阅读者注意甄别事实与主观观点，一切以法律裁判为准。');
INSERT OR IGNORE INTO settings (key, value) VALUES ('homeTitle', '公开的[秘密]，不再被掩盖');
INSERT OR IGNORE INTO settings (key, value) VALUES ('homeDescription', '关于劣质公司欠薪、强制996与霸王条款的公开材料整理（持续更新）');
INSERT OR IGNORE INTO settings (key, value) VALUES ('footerDescription', '本站内容性质：信息整理 / 个人经历陈述 / 材料索引\n所有内容仅陈述可核验事实，并附有相应证据。请明确观点与事实的边界。');
INSERT OR IGNORE INTO settings (key, value) VALUES ('footerCopyright', '© 2026 Norest. All Rights Reserved.');

-- Initialize default admin user (admin / 123456)
INSERT OR IGNORE INTO users (id, username, password) VALUES ('admin-id', 'admin', '$2b$10$X1ijB8lUkyK2rYU50KdkcuKv87nSYytQr2/nicpjymHbrUCaT55Lu');
