# E-commerce Application with Real-Time Chat

A full-stack e-commerce application built with NestJS (backend) and React + TypeScript (frontend), featuring real-time chat functionality.

## Features

- 🛒 E-commerce functionality (products, cart, checkout)
- 💬 Real-time chat system (WebSocket-based)
- 📁 File upload support in chat
- 🔐 JWT authentication
- 👥 Role-based access (Admin/User)
- 💳 Stripe payment integration
- 🔔 Notifications system

## Documentation

- **[Chat System Documentation](./CHAT_SYSTEM_DOCUMENTATION.md)** - Complete guide to the real-time chat system

## Quick Start

### Backend
```bash
cd server
npm install
npm run start:dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Tech Stack

**Backend:** NestJS, TypeORM, MySQL, Socket.IO, Stripe  
**Frontend:** React, TypeScript, Tailwind CSS, Socket.IO Client

---

For detailed chat system documentation, see [CHAT_SYSTEM_DOCUMENTATION.md](./CHAT_SYSTEM_DOCUMENTATION.md)
