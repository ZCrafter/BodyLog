from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

DB_PATH      = 'data/life_stats.db'
CONFIG_PATH  = 'data/config.json'

# ── Config helpers ────────────────────────────────────────────────

DEFAULT_CONFIG = {
    'setup_complete': False,
    'user_name':      '',
    'track_pee':      True,
    'track_poo':      True,
    'track_brush':    True,
    'track_floss':    True,
}

def load_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r') as f:
                cfg = json.load(f)
            # Back-fill any missing keys
            for k, v in DEFAULT_CONFIG.items():
                cfg.setdefault(k, v)
            return cfg
        except Exception:
            pass
    return dict(DEFAULT_CONFIG)

def save_config(cfg):
    os.makedirs('data', exist_ok=True)
    with open(CONFIG_PATH, 'w') as f:
        json.dump(cfg, f, indent=2)

# ── DB helpers ────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def event_exists(cursor, event_type, timestamp):
    cursor.execute(
        'SELECT id FROM bathroom_events WHERE event_type=? AND timestamp=?',
        (event_type, timestamp))
    return cursor.fetchone() is not None

def dental_event_exists(cursor, timestamp):
    cursor.execute('SELECT id FROM dental_events WHERE timestamp=?', (timestamp,))
    return cursor.fetchone() is not None

# ── Routes ────────────────────────────────────────────────────────

@app.route('/')
def index():
    cfg = load_config()
    if request.host.endswith(':5003'):
        return redirect('/home-tracker')
    if request.host.endswith(':5004'):
        return redirect('/all-events')
    return render_template('index.html', config=cfg)

@app.route('/home-tracker')
def home_tracker():
    cfg = load_config()
    return render_template('home_tracker.html', config=cfg)

@app.route('/all-events')
def all_events_page():
    cfg = load_config()
    return render_template('all_events.html', config=cfg)

# ── Config API ────────────────────────────────────────────────────

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def update_config():
    data = request.json
    cfg  = load_config()
    allowed = ('user_name','track_pee','track_poo','track_brush','track_floss','setup_complete')
    for k in allowed:
        if k in data:
            cfg[k] = data[k]
    save_config(cfg)
    return jsonify({'success': True, 'config': cfg})

# ── Bathroom CRUD ─────────────────────────────────────────────────

@app.route('/api/bathroom', methods=['POST'])
def add_bathroom_event():
    data = request.json
    conn = get_db(); c = conn.cursor()
    c.execute(
        'INSERT INTO bathroom_events (event_type, timestamp, location) VALUES (?,?,?)',
        (data['event_type'], data['timestamp'], data.get('location')))
    conn.commit(); eid = c.lastrowid; conn.close()
    return jsonify({'success': True, 'id': eid})

@app.route('/api/bathroom/<int:eid>', methods=['PUT'])
def update_bathroom_event(eid):
    data = request.json
    conn = get_db(); c = conn.cursor()
    c.execute(
        'UPDATE bathroom_events SET event_type=?,timestamp=?,location=? WHERE id=?',
        (data['event_type'], data['timestamp'], data.get('location'), eid))
    conn.commit(); conn.close()
    return jsonify({'success': True})

@app.route('/api/bathroom/<int:eid>', methods=['DELETE'])
def delete_bathroom_event(eid):
    conn = get_db(); c = conn.cursor()
    c.execute('DELETE FROM bathroom_events WHERE id=?', (eid,))
    conn.commit(); conn.close()
    return jsonify({'success': True})

# ── Dental CRUD ───────────────────────────────────────────────────

@app.route('/api/dental', methods=['POST'])
def add_dental_event():
    data = request.json
    conn = get_db(); c = conn.cursor()
    c.execute(
        'INSERT INTO dental_events (timestamp, used_flosser) VALUES (?,?)',
        (data['timestamp'], data.get('used_flosser', 0)))
    conn.commit(); eid = c.lastrowid; conn.close()
    return jsonify({'success': True, 'id': eid})

@app.route('/api/dental/<int:eid>', methods=['PUT'])
def update_dental_event(eid):
    data = request.json
    conn = get_db(); c = conn.cursor()
    c.execute(
        'UPDATE dental_events SET timestamp=?,used_flosser=? WHERE id=?',
        (data['timestamp'], data.get('used_flosser', 0), eid))
    conn.commit(); conn.close()
    return jsonify({'success': True})

@app.route('/api/dental/<int:eid>', methods=['DELETE'])
def delete_dental_event(eid):
    conn = get_db(); c = conn.cursor()
    c.execute('DELETE FROM dental_events WHERE id=?', (eid,))
    conn.commit(); conn.close()
    return jsonify({'success': True})

# ── Streak helpers ────────────────────────────────────────────────

def _calc_streaks(date_strings):
    if not date_strings:
        return {'current_streak': 0, 'current_gap': 0,
                'longest_streak': 0, 'longest_gap': 0}
    dates    = sorted({datetime.strptime(d, '%Y-%m-%d').date() for d in date_strings})
    date_set = set(dates)
    today    = datetime.now().date()
    td1      = timedelta(days=1)

    # Current streak (consecutive days with events ending today)
    cur_streak = 0
    d = today
    while d in date_set:
        cur_streak += 1
        d -= td1

    # Current gap (days since last event)
    cur_gap = max(0, (today - dates[-1]).days)

    # Longest streak
    lng_streak, run = (1, 1) if dates else (0, 0)
    for i in range(1, len(dates)):
        if (dates[i] - dates[i-1]).days == 1:
            run += 1
            lng_streak = max(lng_streak, run)
        else:
            run = 1

    # Longest gap
    lng_gap = cur_gap
    for i in range(1, len(dates)):
        lng_gap = max(lng_gap, (dates[i] - dates[i-1]).days - 1)

    return {'current_streak': cur_streak, 'current_gap': cur_gap,
            'longest_streak': lng_streak, 'longest_gap': lng_gap}

def _get_streaks(c):
    c.execute("SELECT DISTINCT DATE(timestamp) FROM bathroom_events WHERE event_type='poo'")
    poo_dates = [r[0] for r in c.fetchall()]
    c.execute("SELECT DISTINCT DATE(timestamp) FROM dental_events")
    brush_dates = [r[0] for r in c.fetchall()]
    c.execute("SELECT DISTINCT DATE(timestamp) FROM bathroom_events WHERE event_type='pee'")
    pee_dates = [r[0] for r in c.fetchall()]
    return {
        'pee':   _calc_streaks(pee_dates),
        'poo':   _calc_streaks(poo_dates),
        'brush': _calc_streaks(brush_dates),
    }

# ── Averages ──────────────────────────────────────────────────────

def _compute_averages(c):
    c.execute('''SELECT MIN(DATE(timestamp)) FROM
                 (SELECT timestamp FROM bathroom_events
                  UNION ALL SELECT timestamp FROM dental_events)''')
    row        = c.fetchone()
    start_str  = row[0] if row and row[0] else None
    total_days = (datetime.now() - datetime.strptime(start_str, '%Y-%m-%d')).days + 1 \
                 if start_str else 1
    ago3m = (datetime.now() - timedelta(days=91)).strftime('%Y-%m-%d')
    ago7d = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

    def bc(et, start=None):
        if start:
            c.execute("SELECT COUNT(*) FROM bathroom_events WHERE event_type=? AND DATE(timestamp)>=?", (et, start))
        else:
            c.execute("SELECT COUNT(*) FROM bathroom_events WHERE event_type=?", (et,))
        return c.fetchone()[0]

    def dc(start=None):
        q = "SELECT COUNT(*) FROM dental_events"
        if start: c.execute(q + " WHERE DATE(timestamp)>=?", (start,))
        else:     c.execute(q)
        return c.fetchone()[0]

    def fc(start=None):
        q = "SELECT COUNT(*) FROM dental_events WHERE used_flosser=1"
        if start: c.execute(q + " AND DATE(timestamp)>=?", (start,))
        else:     c.execute(q)
        return c.fetchone()[0]

    def r(n, d): return round(n / d, 2) if d > 0 else 0

    return {
        'all_time':      {'pee': r(bc('pee'), total_days),  'poo': r(bc('poo'), total_days),
                          'brush': r(dc(), total_days),      'floss': r(fc(), total_days)},
        'last_3_months': {'pee': r(bc('pee', ago3m), 91),   'poo': r(bc('poo', ago3m), 91),
                          'brush': r(dc(ago3m), 91),         'floss': r(fc(ago3m), 91)},
        'last_7_days':   {'pee': r(bc('pee', ago7d), 7),    'poo': r(bc('poo', ago7d), 7),
                          'brush': r(dc(ago7d), 7),          'floss': r(fc(ago7d), 7)},
    }

# ── Stats API ─────────────────────────────────────────────────────

@app.route('/api/stats')
def get_stats():
    conn = get_db(); c = conn.cursor()

    c.execute('''SELECT event_type, COUNT(*) as count, DATE(timestamp) as date
                 FROM bathroom_events GROUP BY event_type, DATE(timestamp) ORDER BY date DESC''')
    bathroom_stats = [dict(r) for r in c.fetchall()]

    c.execute('''SELECT event_type, location, COUNT(*) as count FROM bathroom_events
                 WHERE location IS NOT NULL AND location != ''
                 GROUP BY event_type, location''')
    location_stats = [dict(r) for r in c.fetchall()]

    c.execute('''SELECT DATE(timestamp) as date, COUNT(*) as brush_count,
                 SUM(used_flosser) as floss_count
                 FROM dental_events GROUP BY DATE(timestamp) ORDER BY date DESC''')
    dental_stats = [dict(r) for r in c.fetchall()]

    c.execute('''SELECT id, event_type, timestamp, location
                 FROM bathroom_events ORDER BY timestamp DESC LIMIT 50''')
    recent_bathroom = [dict(r) for r in c.fetchall()]

    c.execute('SELECT id, timestamp, used_flosser FROM dental_events ORDER BY timestamp DESC LIMIT 50')
    recent_dental = [dict(r) for r in c.fetchall()]

    def last_ts(query, params=()):
        c.execute(query, params); row = c.fetchone(); return row[0] if row else None

    last_pee   = last_ts("SELECT timestamp FROM bathroom_events WHERE event_type='pee' ORDER BY timestamp DESC LIMIT 1")
    last_poo   = last_ts("SELECT timestamp FROM bathroom_events WHERE event_type='poo' ORDER BY timestamp DESC LIMIT 1")
    last_brush = last_ts("SELECT timestamp FROM dental_events ORDER BY timestamp DESC LIMIT 1")

    averages = _compute_averages(c)
    streaks  = _get_streaks(c)

    c.execute('''SELECT MIN(DATE(timestamp)) FROM
                 (SELECT timestamp FROM bathroom_events
                  UNION ALL SELECT timestamp FROM dental_events)''')
    row = c.fetchone(); start_date = row[0] if row and row[0] else None
    days_tracked = (datetime.now() - datetime.strptime(start_date, '%Y-%m-%d')).days + 1 \
                   if start_date else 0

    conn.close()
    return jsonify({
        'bathroom_stats':  bathroom_stats,
        'location_stats':  location_stats,
        'dental_stats':    dental_stats,
        'recent_bathroom': recent_bathroom,
        'recent_dental':   recent_dental,
        'last_pee':        last_pee,
        'last_poo':        last_poo,
        'last_brush':      last_brush,
        'averages':        averages,
        'streaks':         streaks,
        'days_tracked':    days_tracked,
        'start_date':      start_date,
    })

@app.route('/api/averages')
def get_averages():
    conn = get_db(); c = conn.cursor()
    result = _compute_averages(c)
    conn.close()
    return jsonify(result)

@app.route('/api/streaks')
def get_streaks_endpoint():
    conn = get_db(); c = conn.cursor()
    result = _get_streaks(c)
    conn.close()
    return jsonify(result)

# ── All events (paginated) ────────────────────────────────────────

@app.route('/api/all-events')
def get_all_events():
    page     = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    offset   = (page - 1) * per_page
    conn = get_db(); c = conn.cursor()

    c.execute('''SELECT id, event_type, timestamp, location FROM bathroom_events
                 ORDER BY timestamp DESC LIMIT ? OFFSET ?''', (per_page, offset))
    bathroom = [dict(r) for r in c.fetchall()]
    c.execute('SELECT COUNT(*) FROM bathroom_events')
    total_bathroom = c.fetchone()[0]

    c.execute('''SELECT id, timestamp, used_flosser FROM dental_events
                 ORDER BY timestamp DESC LIMIT ? OFFSET ?''', (per_page, offset))
    dental = [dict(r) for r in c.fetchall()]
    c.execute('SELECT COUNT(*) FROM dental_events')
    total_dental = c.fetchone()[0]

    conn.close()
    return jsonify({'bathroom': bathroom, 'total_bathroom': total_bathroom,
                    'dental': dental,    'total_dental':    total_dental,
                    'page': page,        'per_page':        per_page})

# ── Import (CSV) ──────────────────────────────────────────────────

@app.route('/api/import/bathroom', methods=['POST'])
def import_bathroom():
    data = request.json; conn = get_db(); c = conn.cursor()
    count = skipped = 0
    for ev in data:
        if event_exists(c, ev['event_type'], ev['timestamp']): skipped += 1; continue
        c.execute('INSERT INTO bathroom_events (event_type, timestamp, location) VALUES (?,?,?)',
                  (ev['event_type'], ev['timestamp'], ev.get('location')))
        count += 1
    conn.commit(); conn.close()
    return jsonify({'success': True, 'imported': count, 'skipped_duplicates': skipped})

@app.route('/api/import/dental', methods=['POST'])
def import_dental():
    data = request.json; conn = get_db(); c = conn.cursor()
    count = skipped = 0
    for ev in data:
        if dental_event_exists(c, ev['timestamp']): skipped += 1; continue
        c.execute('INSERT INTO dental_events (timestamp, used_flosser) VALUES (?,?)',
                  (ev['timestamp'], ev.get('used_flosser', 0)))
        count += 1
    conn.commit(); conn.close()
    return jsonify({'success': True, 'imported': count, 'skipped_duplicates': skipped})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
