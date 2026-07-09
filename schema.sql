CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  category TEXT,
  content TEXT,
  date DATE DEFAULT CURRENT_DATE,
  author TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT,
  date DATE,
  time TEXT,
  location TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  dept TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT
);

CREATE TABLE IF NOT EXISTS admissions (
  id TEXT PRIMARY KEY,
  data JSONB,
  date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  data JSONB,
  date TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  content TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  data JSONB
);

CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  data JSONB
);
