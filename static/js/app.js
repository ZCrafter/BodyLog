// ── State ─────────────────────────────────────────────────────────
let cfg             = APP_CONFIG;   // injected by server
let currentEvent    = null;
let currentLocation = null;
let currentFlosser  = 0;
let editingBathId   = null;
let editingDentId   = null;
let cachedBathroom  = [];
let cachedDental    = [];
let cachedStats     = null;

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!cfg.setup_complete) {
        showSetup();
    } else {
        showApp();
    }
});

function showSetup() {
    document.getElementById('setupOverlay').style.display = 'flex';
    document.getElementById('appWrap').style.display      = 'none';
    // Pre-fill if returning to setup
    const n = document.getElementById('setupName');
    if (n && cfg.user_name) n.value = cfg.user_name;
    syncSetupChecks();
}

function showApp() {
    document.getElementById('setupOverlay').style.display = 'none';
    document.getElementById('appWrap').style.display      = 'block';
    applyConfig();
    initApp();
}

// ── Setup page logic ──────────────────────────────────────────────
const setupToggles = {
    optPee:   { chk:'chkPee',   key:'track_pee'   },
    optPoo:   { chk:'chkPoo',   key:'track_poo'   },
    optBrush: { chk:'chkBrush', key:'track_brush' },
    optFloss: { chk:'chkFloss', key:'track_floss' },
};

function syncSetupChecks() {
    Object.entries(setupToggles).forEach(([optId, { chk, key }]) => {
        const check = document.getElementById(chk);
        if (check) check.classList.toggle('active', cfg[key] !== false);
    });
}

// Wire up option rows
Object.entries(setupToggles).forEach(([optId, { chk, key }]) => {
    const opt = document.getElementById(optId);
    if (opt) opt.addEventListener('click', () => {
        cfg[key] = !cfg[key];
        document.getElementById(chk).classList.toggle('active', cfg[key]);
    });
});

async function completeSetup() {
    const nameInput = document.getElementById('setupName');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) { nameInput.focus(); nameInput.placeholder = 'Please enter your name first!'; return; }

    // Must track at least one thing
    if (!cfg.track_pee && !cfg.track_poo && !cfg.track_brush) {
        alert('Please select at least one thing to track!');
        return;
    }

    cfg.user_name      = name;
    cfg.setup_complete = true;
    await fetch('/api/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
    });
    showApp();
}

// ── Apply config to UI ────────────────────────────────────────────
function applyConfig() {
    // Greeting
    const greet = document.getElementById('greeting');
    if (greet) {
        const h = new Date().getHours();
        const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        greet.textContent = `${tod}, ${cfg.user_name || 'there'}! 👋`;
    }

    // Show/hide pee button
    toggleEl('peeBtnWrap',  cfg.track_pee);
    toggleEl('pooBtnWrap',  cfg.track_poo);

    // Dental tab visibility
    const showDental = cfg.track_brush;
    toggleEl('dentalTab', showDental);
    toggleEl('flosserGroup', cfg.track_floss);

    // Stats sections
    toggleEl('recentBathroomSection', cfg.track_pee || cfg.track_poo);
    toggleEl('recentDentalSection',   cfg.track_brush);
    toggleEl('dentalChartSection',     cfg.track_brush);

    // Flosser in dental form
    toggleEl('flosserGroup', cfg.track_floss);
}

function toggleEl(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
}

// ── App init ──────────────────────────────────────────────────────
function initApp() {
    initDateTime();
    setInterval(() => { if (!editingBathId && !editingDentId) initDateTime(); }, 60000);

    // Tabs
    document.querySelectorAll('.tab').forEach(t => {
        if (t.dataset.screen) t.addEventListener('click', () => switchScreen(t.dataset.screen));
    });

    // Theme
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Event buttons
    document.querySelectorAll('.event-btn').forEach(b =>
        b.addEventListener('click', () => selectEvent(b.dataset.event)));

    // Location
    document.querySelectorAll('[data-location]').forEach(b =>
        b.addEventListener('click', () => selectLocation(b.dataset.location)));

    // Flosser
    document.querySelectorAll('[data-flosser]').forEach(b =>
        b.addEventListener('click', () => selectFlosser(parseInt(b.dataset.flosser))));

    document.getElementById('bathroomSubmit').addEventListener('click', submitBathroomEvent);
    document.getElementById('dentalSubmit').addEventListener('click', submitDentalEvent);
    document.getElementById('bathroomCancel').addEventListener('click', cancelBathroomEdit);
    document.getElementById('dentalCancel').addEventListener('click', cancelDentalEdit);

    checkURLParams();
}

function checkURLParams() {
    const p = new URLSearchParams(window.location.search);
    if (p.get('screen'))        switchScreen(p.get('screen'));
    if (p.get('edit_bathroom')) editBathroomEvent(parseInt(p.get('edit_bathroom')));
    if (p.get('edit_dental'))   editDentalEvent(parseInt(p.get('edit_dental')));
}

function initDateTime() {
    const now   = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
    const bd = document.getElementById('bathroomDateTime');
    const dd = document.getElementById('dentalDateTime');
    if (bd && !editingBathId) bd.value = local;
    if (dd && !editingDentId) dd.value = local;
}

// ── Navigation ────────────────────────────────────────────────────
function switchScreen(screen) {
    document.querySelectorAll('.tab[data-screen]').forEach(t =>
        t.classList.toggle('active', t.dataset.screen === screen));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(`${screen}-screen`);
    if (el) el.classList.add('active');
    if (screen === 'stats') loadStats();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeToggle').textContent =
        document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    if (document.getElementById('stats-screen').classList.contains('active')) loadStats();
}

// ── Event selection ───────────────────────────────────────────────
function selectEvent(event) {
    currentEvent = event;
    document.querySelectorAll('.event-btn').forEach(b => b.classList.toggle('active', b.dataset.event === event));
    const card = document.getElementById('logCard');
    card.classList.remove('pee-selected','poo-selected');
    if (event) card.classList.add(`${event}-selected`);
}

function selectLocation(loc) {
    currentLocation = loc;
    document.querySelectorAll('[data-location]').forEach(b => b.classList.toggle('active', b.dataset.location === loc));
}

function selectFlosser(v) {
    currentFlosser = v;
    document.querySelectorAll('[data-flosser]').forEach(b => b.classList.toggle('active', parseInt(b.dataset.flosser) === v));
}

// ── Submit ────────────────────────────────────────────────────────
function flashSuccess(btnId) {
    const btn = document.getElementById(btnId);
    btn.classList.add('success-flash');
    setTimeout(() => btn.classList.remove('success-flash'), 1200);
}

async function submitBathroomEvent() {
    if (!currentEvent) { alert('Please tap Pee or Poo first.'); return; }
    const ts = document.getElementById('bathroomDateTime').value;
    if (!ts) { alert('Please select a date and time.'); return; }
    const data = { event_type: currentEvent, timestamp: ts, location: currentLocation };
    try {
        let res;
        if (editingBathId) {
            res = await fetch(`/api/bathroom/${editingBathId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        } else {
            res = await fetch('/api/bathroom', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        }
        if (res.ok) { flashSuccess('bathroomSubmit'); resetBathroomForm(); }
    } catch (e) { alert('Could not save. Make sure the app is running.'); }
}

async function submitDentalEvent() {
    const ts = document.getElementById('dentalDateTime').value;
    if (!ts) { alert('Please select a date and time.'); return; }
    const data = { timestamp: ts, used_flosser: currentFlosser };
    try {
        let res;
        if (editingDentId) {
            res = await fetch(`/api/dental/${editingDentId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        } else {
            res = await fetch('/api/dental', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        }
        if (res.ok) { flashSuccess('dentalSubmit'); resetDentalForm(); }
    } catch (e) { alert('Could not save. Make sure the app is running.'); }
}

function cancelBathroomEdit() { resetBathroomForm(); }
function cancelDentalEdit()   { resetDentalForm(); }

function resetBathroomForm() {
    editingBathId = null; currentEvent = null; currentLocation = null;
    document.querySelectorAll('.event-btn,[data-location]').forEach(b => b.classList.remove('active'));
    document.getElementById('logCard').classList.remove('pee-selected','poo-selected');
    document.getElementById('bathroomSubmit').textContent = 'Log Event';
    document.getElementById('bathroomCancel').classList.add('hidden');
    initDateTime();
}

function resetDentalForm() {
    editingDentId = null; currentFlosser = 0;
    document.querySelectorAll('[data-flosser]').forEach(b => b.classList.remove('active'));
    document.getElementById('dentalSubmit').textContent = 'Log Brushing';
    document.getElementById('dentalCancel').classList.add('hidden');
    initDateTime();
}

// ── Settings modal ────────────────────────────────────────────────
function openSettings() {
    document.getElementById('settingsName').value    = cfg.user_name || '';
    document.getElementById('sPee').checked          = !!cfg.track_pee;
    document.getElementById('sPoo').checked          = !!cfg.track_poo;
    document.getElementById('sBrush').checked        = !!cfg.track_brush;
    document.getElementById('sFloss').checked        = !!cfg.track_floss;
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

async function saveSettings() {
    const name = document.getElementById('settingsName').value.trim();
    if (!name) { alert('Please enter your name.'); return; }
    cfg.user_name    = name;
    cfg.track_pee   = document.getElementById('sPee').checked;
    cfg.track_poo   = document.getElementById('sPoo').checked;
    cfg.track_brush = document.getElementById('sBrush').checked;
    cfg.track_floss = document.getElementById('sFloss').checked;
    await fetch('/api/config', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(cfg)
    });
    closeSettings();
    applyConfig();
}

// ── Stats ─────────────────────────────────────────────────────────
async function loadStats() {
    try {
        const res  = await fetch('/api/stats');
        const data = await res.json();
        cachedStats    = data;
        cachedBathroom = data.recent_bathroom || [];
        cachedDental   = data.recent_dental   || [];

        renderLastEvents(data);
        renderDaysTracked(data.days_tracked, data.start_date);
        renderStreaks(data.streaks);
        renderAveragesTable(data.averages);
        renderTimelineChart(data.bathroom_stats, data.dental_stats);
        renderLocationChart(data.location_stats);
        renderDentalChart(data.dental_stats);
        renderRecentBathroom(cachedBathroom);
        renderRecentDental(cachedDental);
    } catch (e) { console.error('Stats load error:', e); }
}

// Time-ago helper with decimal hours
function timeAgo(ts) {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const m = diff / 60000, h = m / 60, d = Math.floor(h / 24);
    if (m  <  1) return 'just now';
    if (m  < 60) return `${Math.floor(m)}m ago`;
    if (h  < 24) return `${h.toFixed(1)}h ago`;
    return `${d}d ago`;
}

function renderLastEvents(data) {
    if (cfg.track_pee)   setText('lastPeeChip',   `💛 ${timeAgo(data.last_pee)}`);
    else                 hideEl('lastPeeChip');
    if (cfg.track_poo)   setText('lastPooChip',   `🟤 ${timeAgo(data.last_poo)}`);
    else                 hideEl('lastPooChip');
    if (cfg.track_brush) setText('lastBrushChip', `🦷 ${timeAgo(data.last_brush)}`);
    else                 hideEl('lastBrushChip');
}

function renderDaysTracked(days, startDate) {
    const el = document.getElementById('daysTrackedBadge');
    if (!el || !days) return;
    const d = startDate ? new Date(startDate).toLocaleDateString([], { month:'short', day:'numeric', year:'numeric' }) : '';
    el.textContent = `📅 Tracking for ${days} day${days!==1?'s':''} (since ${d})`;
    el.style.display = '';
}

// ── Streaks ───────────────────────────────────────────────────────
function dayLabel(n) { return n===1 ? '1 day' : `${n} days`; }

function renderStreaks(s) {
    const c = document.getElementById('streaksContent');
    if (!c || !s) return;
    let html = '';
    const blocks = [];
    if (cfg.track_poo   && s.poo)   blocks.push({ label:'Poo',           emoji:'🟤', data:s.poo,   color:'#A0522D' });
    if (cfg.track_brush && s.brush) blocks.push({ label:'Tooth Brushing', emoji:'🦷', data:s.brush, color:'#3498db' });
    if (cfg.track_pee   && s.pee)   blocks.push({ label:'Pee',            emoji:'💛', data:s.pee,   color:'#FFD93D' });

    blocks.forEach(({ label, emoji, data, color }) => {
        html += `
        <div class="streak-block" style="border-left:3px solid ${color}">
            <div class="streak-title">${emoji} ${label}</div>
            <div class="streak-grid">
                <div class="streak-stat">
                    <span class="streak-val ${data.current_streak>0?'streak-active':''}">${dayLabel(data.current_streak)}</span>
                    <span class="streak-key">Current streak</span>
                </div>
                <div class="streak-stat">
                    <span class="streak-val ${data.current_gap>3?'streak-gap':''}">${dayLabel(data.current_gap)}</span>
                    <span class="streak-key">Days since last</span>
                </div>
                <div class="streak-stat">
                    <span class="streak-val">${dayLabel(data.longest_streak)}</span>
                    <span class="streak-key">Best streak ever</span>
                </div>
                <div class="streak-stat">
                    <span class="streak-val">${dayLabel(data.longest_gap)}</span>
                    <span class="streak-key">Longest gap ever</span>
                </div>
            </div>
        </div>`;
    });
    c.innerHTML = html || '<p style="color:var(--text-secondary)">Log some events to see streaks!</p>';
}

// ── Averages ──────────────────────────────────────────────────────
function renderAveragesTable(avgs) {
    const c = document.getElementById('averagesTable');
    if (!c || !avgs) return;
    const rows = [];
    if (cfg.track_pee)   rows.push({ emoji:'💛', label:'Pee',   key:'pee'   });
    if (cfg.track_poo)   rows.push({ emoji:'🟤', label:'Poo',   key:'poo'   });
    if (cfg.track_brush) rows.push({ emoji:'🦷', label:'Brush', key:'brush' });
    if (cfg.track_floss) rows.push({ emoji:'💧', label:'Floss', key:'floss' });
    if (!rows.length) { c.innerHTML=''; return; }
    function trendCls(recent, allTime) {
        if (!allTime) return '';
        const d = (recent-allTime)/allTime;
        return d>0.15?'trend-up':d<-0.15?'trend-down':'';
    }
    c.innerHTML = `
        <table class="averages-table">
            <thead><tr><th></th><th>All Time</th><th>Last 3 Mo</th><th>Last 7 Days</th></tr></thead>
            <tbody>${rows.map(r=>`<tr>
                <td class="avg-label">${r.emoji} ${r.label}</td>
                <td class="avg-val">${avgs.all_time[r.key]}<span class="avg-unit">/day</span></td>
                <td class="avg-val">${avgs.last_3_months[r.key]}<span class="avg-unit">/day</span></td>
                <td class="avg-val ${trendCls(avgs.last_7_days[r.key],avgs.all_time[r.key])}">${avgs.last_7_days[r.key]}<span class="avg-unit">/day</span></td>
            </tr>`).join('')}</tbody>
        </table>`;
}

// ── Chart helpers ─────────────────────────────────────────────────
const isDark = () => document.body.classList.contains('dark-mode');
const COLORS  = { pee:'#FFD93D', poo:'#A0522D', brush:'#3498db', floss:'#2ecc71' };
const CFG_PLY  = { responsive:true, displayModeBar:false };

function baseLayout(extra={}) {
    const dark=isDark(), txt=dark?'#b0b0b0':'#4a4a4a', grid=dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
    return {
        paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:dark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)',
        font:{ color:txt, size:11, family:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
        margin:{ t:14,r:10,b:44,l:44 },
        legend:{ orientation:'h', y:-0.24, x:0.5, xanchor:'center', font:{size:11} },
        xaxis:{ gridcolor:grid, linecolor:grid, zeroline:false, ...(extra.xaxis||{}) },
        yaxis:{ gridcolor:grid, linecolor:grid, zeroline:false, ...(extra.yaxis||{}) },
        ...extra
    };
}

function hexRgba(hex, a) {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
}

function renderTimelineChart(bathroom, dental) {
    const cutStr = new Date(Date.now()-90*864e5).toISOString().slice(0,10);
    const g = {};
    bathroom.forEach(i => {
        if (i.date<cutStr) return;
        if (!g[i.event_type]) g[i.event_type]={};
        g[i.event_type][i.date]=i.count;
    });
    if (cfg.track_brush) dental.forEach(i => {
        if (i.date<cutStr) return;
        if (!g.brush) g.brush={};
        g.brush[i.date]=i.brush_count;
    });
    const dates=[...new Set(Object.values(g).flatMap(d=>Object.keys(d)))].sort();
    const types=[...((cfg.track_pee&&g.pee)?['pee']:[]),...((cfg.track_poo&&g.poo)?['poo']:[]),...((cfg.track_brush&&g.brush)?['brush']:[])];
    const traces=types.map(t=>({
        x:dates, y:dates.map(d=>g[t][d]||0), type:'scatter', mode:'lines',
        name:t.charAt(0).toUpperCase()+t.slice(1),
        line:{color:COLORS[t],width:2,shape:'spline',smoothing:0.6},
        fill:'tozeroy', fillcolor:hexRgba(COLORS[t],0.1),
        hovertemplate:`%{x}<br>${t}: %{y}<extra></extra>`,
    }));
    Plotly.newPlot('timelineChart', traces, baseLayout({ xaxis:{type:'date',tickformat:'%b %d'}, yaxis:{title:{text:'Count',font:{size:10}}}, hovermode:'x unified' }), CFG_PLY);
}

function renderLocationChart(data) {
    if (!data||!data.length) { toggleEl('locationSection',false); return; }
    const f=data.filter(d=>d.event_type==='pee'||d.event_type==='poo');
    const locs=[...new Set(f.map(d=>d.location))].filter(Boolean);
    if (!locs.length) { toggleEl('locationSection',false); return; }
    toggleEl('locationSection',true);
    const traces=['pee','poo'].filter(t=>cfg[`track_${t}`]).map(t=>({
        name:t.charAt(0).toUpperCase()+t.slice(1),
        x:locs.map(l=>{ const r=f.find(d=>d.event_type===t&&d.location===l); return r?r.count:0; }),
        y:locs, type:'bar', orientation:'h', marker:{color:COLORS[t],opacity:0.85},
        hovertemplate:`%{y}: %{x}<extra>${t}</extra>`,
    }));
    Plotly.newPlot('locationChart', traces, baseLayout({ barmode:'group', xaxis:{title:{text:'Count',font:{size:10}}}, yaxis:{automargin:true}, margin:{t:10,r:10,b:40,l:60} }), CFG_PLY);
}

function renderDentalChart(data) {
    if (!data||!data.length||!cfg.track_brush) return;
    const r=data.slice(0,60).reverse();
    const nums=r.map(d=>d.brush_count);
    const avg=nums.map((_,i)=>{ const w=nums.slice(Math.max(0,i-6),i+1); return +(w.reduce((a,b)=>a+b,0)/w.length).toFixed(2); });
    Plotly.newPlot('dentalChart',
        [
            { x:r.map(d=>d.date), y:nums, type:'bar', name:'Brushings', marker:{color:COLORS.brush,opacity:0.85}, hovertemplate:'%{x}<br>Brushings: %{y}<extra></extra>' },
            ...(cfg.track_floss?[{ x:r.map(d=>d.date), y:r.map(d=>d.floss_count||0), type:'bar', name:'Flossed', marker:{color:COLORS.floss,opacity:0.85}, hovertemplate:'%{x}<br>Flossed: %{y}<extra></extra>' }]:[]),
            { x:r.map(d=>d.date), y:avg, type:'scatter', mode:'lines', name:'7-day avg', line:{color:'#e74c3c',width:1.5,dash:'dot'}, hovertemplate:'%{x}<br>Avg: %{y}<extra></extra>' },
        ],
        baseLayout({ barmode:'group', xaxis:{type:'date',tickformat:'%b %d'}, yaxis:{title:{text:'Count',font:{size:10}}}, hovermode:'x unified' }), CFG_PLY);
}

// ── Recent events lists ───────────────────────────────────────────
const TYPE_LABEL = { pee:'💛 Pee', poo:'🟤 Poo' };

function renderRecentBathroom(events) {
    const c=document.getElementById('recentBathroomEvents'); if(!c) return;
    c.innerHTML='';
    const filtered=events.filter(e=>e.event_type!=='cum');
    if (!filtered.length) { c.innerHTML='<p class="empty-msg">No events logged yet. Use the Log tab to get started!</p>'; return; }
    filtered.slice(0,10).forEach(ev=>{
        const d=document.createElement('div'); d.className='event-item';
        let label=TYPE_LABEL[ev.event_type]||ev.event_type;
        if (ev.location) label+=` · ${ev.location}`;
        d.innerHTML=`<span>${label} · ${new Date(ev.timestamp).toLocaleString()}</span>
            <div class="event-actions">
                <button class="edit-btn"   onclick="editBathroomEvent(${ev.id})">Edit</button>
                <button class="delete-btn" onclick="deleteBathroomEvent(${ev.id})">Delete</button>
            </div>`;
        c.appendChild(d);
    });
}

function renderRecentDental(events) {
    const c=document.getElementById('recentDentalEvents'); if(!c) return;
    c.innerHTML='';
    if (!events.length) { c.innerHTML='<p class="empty-msg">No dental events yet. Use the Dental tab to get started!</p>'; return; }
    events.slice(0,10).forEach(ev=>{
        const d=document.createElement('div'); d.className='event-item';
        d.innerHTML=`<span>🦷 Brushed${ev.used_flosser?' + 💧 Flossed':''} · ${new Date(ev.timestamp).toLocaleString()}</span>
            <div class="event-actions">
                <button class="edit-btn"   onclick="editDentalEvent(${ev.id})">Edit</button>
                <button class="delete-btn" onclick="deleteDentalEvent(${ev.id})">Delete</button>
            </div>`;
        c.appendChild(d);
    });
}

// ── Edit / Delete ─────────────────────────────────────────────────
async function editBathroomEvent(id) {
    try {
        const res=await fetch('/api/stats'); const data=await res.json();
        const ev=data.recent_bathroom.find(e=>e.id===id);
        if (!ev) { alert('Event not found.'); return; }
        switchScreen('log');
        editingBathId=id;
        document.getElementById('bathroomDateTime').value=ev.timestamp;
        selectEvent(ev.event_type);
        if (ev.location) selectLocation(ev.location);
        document.getElementById('bathroomSubmit').textContent='Save Changes';
        document.getElementById('bathroomCancel').classList.remove('hidden');
        window.scrollTo(0,0);
    } catch(e){ alert('Could not load event.'); }
}

async function editDentalEvent(id) {
    try {
        const res=await fetch('/api/stats'); const data=await res.json();
        const ev=data.recent_dental.find(e=>e.id===id);
        if (!ev) { alert('Event not found.'); return; }
        switchScreen('dental');
        editingDentId=id;
        document.getElementById('dentalDateTime').value=ev.timestamp;
        selectFlosser(ev.used_flosser||0);
        document.getElementById('dentalSubmit').textContent='Save Changes';
        document.getElementById('dentalCancel').classList.remove('hidden');
        window.scrollTo(0,0);
    } catch(e){ alert('Could not load event.'); }
}

async function deleteBathroomEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try { await fetch(`/api/bathroom/${id}`,{method:'DELETE'}); loadStats(); }
    catch(e){ alert('Could not delete event.'); }
}

async function deleteDentalEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try { await fetch(`/api/dental/${id}`,{method:'DELETE'}); loadStats(); }
    catch(e){ alert('Could not delete event.'); }
}

// ── Utility ───────────────────────────────────────────────────────
function setText(id, text) { const e=document.getElementById(id); if(e) e.textContent=text; }
function hideEl(id)         { const e=document.getElementById(id); if(e) e.style.display='none'; }
