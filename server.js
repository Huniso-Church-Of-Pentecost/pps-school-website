const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Ensure data dir exists
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

// Database
const adapter = new FileSync('./data/db.json');
const db = low(adapter);
db.defaults({
  users: [{ id: 'admin1', username: 'admin', password: bcrypt.hashSync('pps2025', 10), role: 'admin' }],
  posts: [
    { id: '1', title: 'Admissions 2025/2026 Now Open', slug: 'admissions-open-2025', category: 'announcement', content: 'We are pleased to announce that admissions for the 2025/2026 academic year are now officially open. Interested parents are encouraged to visit the school office or apply online through our website. Scholarships are available for top-performing students. Do not miss this opportunity to be part of our great family!', date: '2025-09-15', author: 'Admin', image: '', featured: true, views: 142 },
    { id: '2', title: 'Inter-Schools Quiz Competition Results', slug: 'quiz-results', category: 'news', content: 'Our students represented PPS with distinction at the Regional Inter-Schools Quiz Competition. Team A placed 2nd overall, with individual awards going to students from JHS 2. We are incredibly proud of their hard work and dedication. Special thanks to the ICT Department for their preparation support.', date: '2025-09-10', author: 'Admin', image: '', featured: false, views: 87 },
    { id: '3', title: 'PTA Meeting – September 30, 2025', slug: 'pta-meeting-sept', category: 'event', content: 'Parents and guardians are cordially invited to the upcoming PTA meeting scheduled for September 30, 2025 at 10:00 AM in the school hall. Items on the agenda include academic performance review, upcoming projects, school fees, and school safety measures. Your presence is vital.', date: '2025-09-05', author: 'Admin', image: '', featured: false, views: 63 },
    { id: '4', title: 'Term Resumes September 2, 2025', slug: 'term-resume', category: 'announcement', content: 'This is to notify all students, parents, and staff that the new academic term begins on Monday, September 2, 2025. Students are expected to resume in full school uniform with all required stationery. Latecomers will not be admitted after 7:30 AM. God bless our school!', date: '2025-08-20', author: 'Admin', image: '', featured: true, views: 210 }
  ],
  events: [
    { id: '1', title: 'PTA Meeting', date: '2025-09-30', time: '10:00 AM', location: 'School Hall', description: 'Termly PTA meeting for parents and guardians.' },
    { id: '2', title: 'Sports Day', date: '2025-10-15', time: '8:00 AM', location: 'School Field', description: 'Annual inter-house sports competition.' },
    { id: '3', title: 'Graduation Ceremony', date: '2025-11-20', time: '9:00 AM', location: 'Main Auditorium', description: 'JHS 3 graduation and prize-giving ceremony.' }
  ],
  staff: [
    { id: '1', name: 'Mr. Daniel Nunu', role: 'Headmaster', dept: 'Administration', email: 'danielnunu@gmail.com', phone: '+233554797913', bio: 'Over 20 years in education leadership.' },
    { id: '2', name: 'Aaron Mensah', role: 'Assistant Headmaster', dept: 'Administration', email: '', phone: '', bio: '' },
    { id: '3', name: 'Aaron Mensah', role: 'Head of ICT', dept: 'ICT', email: '', phone: '', bio: 'Specialist in digital education.' },
    { id: '4', name: 'Denis Arkoh', role: 'Head of Department', dept: 'Science', email: '', phone: '', bio: '' },
    { id: '5', name: 'Madam Rita Guri', role: 'Head of Department', dept: 'Primary', email: '', phone: '', bio: '' },
    { id: '6', name: 'Abdullai Raman', role: 'Sports Coordinator', dept: 'Sports', email: '', phone: '', bio: '' },
    { id: '7', name: 'Ps. Ebenezer Tawiah Mensah', role: 'Schools Outreach', dept: 'Administration', email: '', phone: '', bio: '' }
  ],
  admissions: [],
  messages: [],
  announcements: [
    'Admissions for 2025/2026 are open',
    'PTA Meeting on Sept 30, 2025',
    'Inter-Schools Quiz Competition',
    'Term resumes on Sep 2, 2025'
  ],
  stats: { students: 1200, bece_rate: 95, teachers: 40, houses: 4, years: 30 },
  settings: { school_name: 'Pentecost Preparatory School', tagline: 'God Our Victory', address: 'TnA Stadium, Western Region, Ghana', phone: '+233554797913', email: 'info@pps.edu.gh', whatsapp: '233554797913' }
}).write();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'pps-secret-2025', resave: false, saveUninitialized: false, cookie: { maxAge: 86400000 } }));
app.use(express.static('public'));

// Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Auth middleware
const requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// ===================== API ROUTES =====================

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.get('users').find({ username }).value();
  if (!user || !bcrypt.compareSync(password, user.password)) return res.json({ success: false, message: 'Invalid credentials' });
  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ success: true, user: { username: user.username, role: user.role } });
});
app.post('/api/auth/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });
app.get('/api/auth/me', (req, res) => res.json(req.session.user || null));

// Posts/Blog
app.get('/api/posts', (req, res) => {
  const { category, featured, limit } = req.query;
  let posts = db.get('posts').value();
  if (category) posts = posts.filter(p => p.category === category);
  if (featured) posts = posts.filter(p => p.featured);
  if (limit) posts = posts.slice(0, parseInt(limit));
  res.json(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
});
app.get('/api/posts/:id', (req, res) => {
  const post = db.get('posts').find({ id: req.params.id }).value();
  if (!post) return res.status(404).json({ error: 'Not found' });
  db.get('posts').find({ id: req.params.id }).assign({ views: (post.views || 0) + 1 }).write();
  res.json(post);
});
app.post('/api/posts', requireAdmin, upload.single('image'), (req, res) => {
  const post = { id: uuidv4(), ...req.body, image: req.file ? '/uploads/' + req.file.filename : '', date: new Date().toISOString().split('T')[0], views: 0, featured: req.body.featured === 'true' };
  db.get('posts').push(post).write();
  io.emit('new-post', post);
  res.json(post);
});
app.put('/api/posts/:id', requireAdmin, upload.single('image'), (req, res) => {
  const update = { ...req.body, featured: req.body.featured === 'true' };
  if (req.file) update.image = '/uploads/' + req.file.filename;
  db.get('posts').find({ id: req.params.id }).assign(update).write();
  res.json(db.get('posts').find({ id: req.params.id }).value());
});
app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  db.get('posts').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// Events
app.get('/api/events', (req, res) => res.json(db.get('events').value().sort((a, b) => new Date(a.date) - new Date(b.date))));
app.post('/api/events', requireAdmin, (req, res) => {
  const ev = { id: uuidv4(), ...req.body };
  db.get('events').push(ev).write();
  io.emit('new-event', ev);
  res.json(ev);
});
app.put('/api/events/:id', requireAdmin, (req, res) => {
  db.get('events').find({ id: req.params.id }).assign(req.body).write();
  res.json(db.get('events').find({ id: req.params.id }).value());
});
app.delete('/api/events/:id', requireAdmin, (req, res) => {
  db.get('events').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// Staff
app.get('/api/staff', (req, res) => res.json(db.get('staff').value()));
app.post('/api/staff', requireAdmin, (req, res) => {
  const member = { id: uuidv4(), ...req.body };
  db.get('staff').push(member).write();
  res.json(member);
});
app.put('/api/staff/:id', requireAdmin, (req, res) => {
  db.get('staff').find({ id: req.params.id }).assign(req.body).write();
  res.json(db.get('staff').find({ id: req.params.id }).value());
});
app.delete('/api/staff/:id', requireAdmin, (req, res) => {
  db.get('staff').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// Admissions
app.post('/api/admissions', (req, res) => {
  const app_ = { id: uuidv4(), ...req.body, date: new Date().toISOString(), status: 'pending' };
  db.get('admissions').push(app_).write();
  io.emit('new-admission', app_);
  res.json({ success: true, id: app_.id });
});
app.get('/api/admissions', requireAdmin, (req, res) => res.json(db.get('admissions').value().reverse()));
app.put('/api/admissions/:id', requireAdmin, (req, res) => {
  db.get('admissions').find({ id: req.params.id }).assign(req.body).write();
  res.json({ success: true });
});

// Contact/Messages
app.post('/api/contact', (req, res) => {
  const msg = { id: uuidv4(), ...req.body, date: new Date().toISOString(), read: false };
  db.get('messages').push(msg).write();
  io.emit('new-message', msg);
  res.json({ success: true });
});
app.get('/api/messages', requireAdmin, (req, res) => res.json(db.get('messages').value().reverse()));
app.put('/api/messages/:id', requireAdmin, (req, res) => {
  db.get('messages').find({ id: req.params.id }).assign({ read: true }).write();
  res.json({ success: true });
});
app.delete('/api/messages/:id', requireAdmin, (req, res) => {
  db.get('messages').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// Announcements
app.get('/api/announcements', (req, res) => res.json(db.get('announcements').value()));
app.put('/api/announcements', requireAdmin, (req, res) => {
  db.set('announcements', req.body).write();
  io.emit('announcements-update', req.body);
  res.json({ success: true });
});

// Stats & Settings
app.get('/api/stats', (req, res) => res.json(db.get('stats').value()));
app.put('/api/stats', requireAdmin, (req, res) => { db.set('stats', req.body).write(); res.json({ success: true }); });
app.get('/api/settings', (req, res) => res.json(db.get('settings').value()));
app.put('/api/settings', requireAdmin, (req, res) => { db.set('settings', req.body).write(); res.json({ success: true }); });

// Dashboard stats
app.get('/api/dashboard', requireAdmin, (req, res) => {
  res.json({
    posts: db.get('posts').value().length,
    admissions: db.get('admissions').value().length,
    messages: db.get('messages').value().filter(m => !m.read).length,
    events: db.get('events').value().length,
    staff: db.get('staff').value().length,
    recent_admissions: db.get('admissions').value().slice(-5).reverse(),
    recent_messages: db.get('messages').value().slice(-5).reverse()
  });
});

// Gallery upload
app.post('/api/upload-gallery', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// ===================== PAGE ROUTES =====================
const pages = ['index', 'admissions', 'news', 'staff', 'gallery', 'contact', 'tours', 'badges', 'search'];
pages.forEach(p => {
  app.get(p === 'index' ? '/' : `/${p}`, (req, res) => res.sendFile(path.join(__dirname, 'public', `${p}.html`)));
  app.get(`/${p}.html`, (req, res) => res.sendFile(path.join(__dirname, 'public', `${p}.html`)));
});
app.get('/news/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'post.html')));

// Admin routes
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin/*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Change password
app.post('/api/auth/change-password', requireAdmin, async (req, res) => {
  const { current, newPass } = req.body;
  const user = db.get('users').find({ id: req.session.user.id }).value();
  if (!user || !bcrypt.compareSync(current, user.password)) return res.json({ success: false, message: 'Current password incorrect' });
  db.get('users').find({ id: user.id }).assign({ password: bcrypt.hashSync(newPass, 10) }).write();
  res.json({ success: true });
});

// Search across posts and events
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json({ posts: [], events: [] });
  const posts = db.get('posts').value().filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  const events = db.get('events').value().filter(e => e.title.toLowerCase().includes(q) || (e.description||'').toLowerCase().includes(q));
  res.json({ posts, events });
});

// Stats increment (for view tracking via API)
app.post('/api/posts/:id/view', (req, res) => {
  const post = db.get('posts').find({ id: req.params.id }).value();
  if (post) db.get('posts').find({ id: req.params.id }).assign({ views: (post.views || 0) + 1 }).write();
  res.json({ success: true });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ===================== SOCKET.IO =====================
const onlineCount = { count: 0 };
io.on('connection', (socket) => {
  onlineCount.count++;
  io.emit('online-count', onlineCount.count);
  socket.on('disconnect', () => { onlineCount.count = Math.max(0, onlineCount.count - 1); io.emit('online-count', onlineCount.count); });
  socket.on('chat-message', (data) => io.emit('chat-message', data));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`PPS School Server running on http://localhost:${PORT}`));
