# 🏫 Pentecost Preparatory School – Full Stack Website v2.0

**God Our Victory** | TnA Stadium, Western Region, Ghana

---

## 🚀 Quick Start

### Termux (Android)
```bash
pkg install nodejs
cd pps-school
bash install.sh
```

### Linux / macOS
```bash
cd pps-school
bash install.sh
```

### Windows
```
Double-click install.bat
```

**Then open:** `http://localhost:3000`  
**Admin Panel:** `http://localhost:3000/admin`  
**Login:** `admin` / `pps2025`

---

## ✨ Features

### 🌐 Public Website
| Page | Features |
|------|---------|
| **Home** | Animated hero, live stats counters, featured news, events calendar, gallery preview, testimonials, CTAs |
| **News & Blog** | Category filters (News/Announcements/Events), post cards with views counter, real-time updates |
| **Single Post** | Full blog post view, breadcrumbs, category badge |
| **Admissions** | Online application form, requirements list, scholarship info |
| **Staff Directory** | Live search, staff cards with avatars, department badges |
| **Gallery** | Masonry grid, lightbox viewer, all campus images |
| **Campus Tours** | Photo tour grid with lightbox |
| **House Badges** | All 4 school houses + main badge showcase |
| **Contact** | Contact form, office details, map link |

### 🔐 Admin Panel (`/admin`)
| Section | Features |
|---------|---------|
| **Dashboard** | Stats overview, recent applications & messages |
| **Live Activity** | Real-time online users, live feed, built-in admin chat (Socket.io) |
| **Blog & News** | Create/edit/delete posts, image upload, featured toggle, category |
| **Events** | Full CRUD calendar management |
| **Gallery** | Upload new images |
| **Admissions** | View all applications, approve/reject, filter by status |
| **Messages** | Read/delete contact messages, unread badges |
| **Staff** | Full CRUD staff directory management |
| **Announcements** | Edit the scrolling announcement bar live |
| **Site Settings** | School name, phone, email, WhatsApp, address |
| **Statistics** | Edit homepage stat counters |

### ⚡ Technical Features
- **Real-time** with Socket.IO (live online count, notifications, admin chat)
- **PWA** – installable as an app with school badge icon
- **Service Worker** – works offline
- **Responsive** – mobile-first design
- **JSON Database** – lowdb (no setup needed)
- **Image Uploads** – multer file handling
- **Session Auth** – bcrypt password hashing
- **WhatsApp & Call FABs** – floating action buttons

---

## 🗂️ Project Structure

```
pps-school/
├── server.js              # Express + Socket.IO backend
├── package.json           # Dependencies
├── install.sh             # Linux/Termux installer
├── install.bat            # Windows installer
├── data/
│   └── db.json            # Auto-created JSON database
└── public/
    ├── index.html         # Homepage
    ├── news.html          # News & Events
    ├── post.html          # Single post view
    ├── admissions.html    # Admissions form
    ├── staff.html         # Staff directory
    ├── gallery.html       # Photo gallery
    ├── tours.html         # Campus tours
    ├── badges.html        # House badges
    ├── contact.html       # Contact page
    ├── admin.html         # Admin panel
    ├── manifest.json      # PWA manifest
    ├── sw.js              # Service Worker
    ├── css/
    │   ├── main.css       # Public site styles
    │   └── admin.css      # Admin panel styles
    ├── js/
    │   └── main.js        # Public site JavaScript
    ├── assets2/           # School images & badges
    └── uploads/           # User-uploaded files
```

---

## 🔑 Default Credentials
- **Username:** `admin`
- **Password:** `pps2025`

> Change the password via the Settings panel after first login.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create post (admin) |
| PUT | `/api/posts/:id` | Update post (admin) |
| DELETE | `/api/posts/:id` | Delete post (admin) |
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create event (admin) |
| GET | `/api/staff` | Get all staff |
| POST | `/api/staff` | Add staff (admin) |
| POST | `/api/admissions` | Submit application |
| GET | `/api/admissions` | Get applications (admin) |
| POST | `/api/contact` | Send message |
| GET | `/api/messages` | Get messages (admin) |
| GET | `/api/announcements` | Get announcements |
| PUT | `/api/announcements` | Update announcements (admin) |
| GET | `/api/stats` | Get homepage stats |
| GET | `/api/settings` | Get site settings |
| GET | `/api/dashboard` | Admin dashboard data |

---

## 📱 Install as App (PWA)

1. Open `http://localhost:3000` in Chrome/Edge
2. Tap the **"Install"** banner or browser menu → "Install App"
3. The school badge will appear as the app icon on your home screen

---

## 🛠️ Customization

Edit `server.js` default data to change school info, or use the Admin Panel:
- **School name, motto, contact** → Admin → Settings
- **Homepage numbers** → Admin → Statistics  
- **Announcement bar** → Admin → Announcements
- **News posts** → Admin → Blog & News
- **Events** → Admin → Events

---

*Built for Pentecost Preparatory School © 2025. All rights reserved.*
