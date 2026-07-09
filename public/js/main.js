// ===== PPS SCHOOL MAIN JS =====

// Socket.io connection
let socket;
try {
  socket = io();
  socket.on('online-count', count => {
    const el = document.getElementById('online-count');
    if (el) el.textContent = count + ' online';
  });
  socket.on('announcements-update', data => {
    renderAnnouncements(data);
  });
  socket.on('new-post', () => {
    if (window.loadPosts) window.loadPosts();
  });
} catch(e) {}

// ===== NAVBAR =====
const navbar = document.querySelector('.navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
});

function toggleMenu() {
  if (hamburger) hamburger.classList.toggle('open');
  if (navLinks) navLinks.classList.toggle('open');
}

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    if (hamburger) hamburger.classList.remove('open');
    if (navLinks) navLinks.classList.remove('open');
  });
});

// Active nav link
(function setActiveNav() {
  const path = window.location.pathname.replace('/', '').replace('.html', '') || 'index';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace('.html', '').replace('/', '');
    if (href === path || (path === '' && href === 'index') || (path === 'index' && href === '')) {
      a.classList.add('active');
    }
  });
})();

// ===== ANNOUNCEMENTS =====
async function loadAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    renderAnnouncements(data);
  } catch(e) {}
}

function renderAnnouncements(items) {
  const el = document.getElementById('announce-text');
  if (!el) return;
  const text = items.map(i => `• ${i}`).join('   ');
  el.innerHTML = `<span>${text}   ${text}</span>`;
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== TOAST =====
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.className = 'toast';
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ===== LIGHTBOX =====
function openLightbox(src) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML = `<button class="lightbox-close" onclick="closeLightbox()">✕</button><img id="lb-img" src="" alt="">`;
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.body.appendChild(lb);
  }
  document.getElementById('lb-img').src = src;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ===== FABs =====
function openWhatsApp() {
  fetch('/api/settings').then(r => r.json()).then(s => {
    window.open(`https://wa.me/${s.whatsapp || '233554797913'}?text=Hello%20Pentecost%20Preparatory%20School`, '_blank');
  }).catch(() => window.open('https://wa.me/233554797913', '_blank'));
}
function callSchool() {
  fetch('/api/settings').then(r => r.json()).then(s => {
    window.location.href = `tel:${s.phone || '+233554797913'}`;
  }).catch(() => { window.location.href = 'tel:+233554797913'; });
}

// ===== COUNTERS =====
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const dur = 2000;
    const step = target / (dur / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); counterObserver.disconnect(); } });
}, { threshold: 0.3 });
const counterSection = document.querySelector('.hero-stats');
if (counterSection) counterObserver.observe(counterSection);

// ===== MODAL =====
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}

// ===== FORMAT DATE =====
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(dateStr);
}

// ===== ADMISSIONS FORM =====
async function submitAdmission(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch('/api/admissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await res.json();
    if (result.success) {
      showToast('Application submitted! We\'ll be in touch soon.', 'success');
      form.reset();
    }
  } catch(e) { showToast('Error submitting. Please try again.', 'error'); }
  btn.textContent = 'Submit Application';
  btn.disabled = false;
}

// ===== CONTACT FORM =====
async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await res.json();
    if (result.success) { showToast('Message sent! We\'ll reply soon.', 'success'); form.reset(); }
  } catch(e) { showToast('Error. Please try again.', 'error'); }
  btn.textContent = 'Send Message';
  btn.disabled = false;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadAnnouncements();
  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
