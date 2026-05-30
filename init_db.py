import sqlite3
import os

def init_database():
    os.makedirs('data', exist_ok=True)
    conn = sqlite3.connect('data/life_stats.db')
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS bathroom_events (
                 id         INTEGER PRIMARY KEY AUTOINCREMENT,
                 event_type TEXT    NOT NULL,
                 timestamp  TEXT    NOT NULL,
                 location   TEXT,
                 created_at TEXT    DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS dental_events (
                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                 timestamp    TEXT    NOT NULL,
                 used_flosser INTEGER DEFAULT 0,
                 created_at   TEXT    DEFAULT CURRENT_TIMESTAMP)''')

    conn.commit()
    conn.close()
    print("✅  Database initialised successfully!")

if __name__ == '__main__':
    init_database()
