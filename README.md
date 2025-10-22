# Reclaim

A campus lost-and-found platform built for students to easily report, locate, and recover lost items.

## Features

- 📱 **iOS Mobile App** - Built with React Native and Expo
- 🚀 **Fast API** - Express backend with TypeScript
- 🗄️ **PostgreSQL Database** - Managed on Neon with Prisma ORM
- 🎨 **Modern UI** - NativeWind (Tailwind CSS) for beautiful mobile design
- 🔐 **SSO Ready** - Campus account authentication (to be implemented)
- 🗺️ **Real-time Tracking** - Map-based item location (to be implemented)
- 🤖 **AI Matching** - Smart item matching powered by AI (to be implemented)

## Project Structure

```
reclaim/
├── mobile/          # React Native mobile app (Expo)
├── backend/         # Fastify API server
├── pnpm-workspace.yaml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 8+
- Neon PostgreSQL database account ([neon.tech](https://neon.tech))
- For iOS: macOS with Xcode

### Installation

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   cp env.example .env
   ```
   Edit `backend/.env` and add your Neon PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@host.neon.tech/reclaim?sslmode=require"
   PORT=3000
   ```

3. **Initialize the database:**
   ```bash
   pnpm -C backend prisma:generate
   pnpm -C backend prisma:migrate
   ```

4. **Set up the mobile app:**
   ```bash
   cd ../mobile
   cp env.example .env
   ```
   Edit `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

5. **Start development servers:**

   **Backend:**
   ```bash
   pnpm -C backend dev
   ```

   **Mobile (in a new terminal):**
   ```bash
   pnpm -C mobile dev
   ```

   Then press `i` to open iOS simulator, or scan the QR code with Expo Go app.

## Development

### Run both servers concurrently:
```bash
pnpm dev
```

### Backend Commands
```bash
pnpm -C backend dev              # Start dev server
pnpm -C backend build            # Build for production
pnpm -C backend start            # Start production server
pnpm -C backend prisma:generate  # Generate Prisma client
pnpm -C backend prisma:migrate   # Run database migrations
```

### Mobile Commands
```bash
pnpm -C mobile dev      # Start Expo dev server
pnpm -C mobile ios      # Run on iOS
pnpm -C mobile android  # Run on Android
pnpm -C mobile lint     # Run ESLint
```

## Tech Stack

### Mobile
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS)
- **Routing:** expo-router
- **State Management:** React Hooks

### Backend
- **Framework:** Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)

## API Endpoints

### Health
- `GET /health` - Health check

### Items
- `GET /items` - Get all items
- `GET /items/:id` - Get item by ID
- `POST /items` - Create new item
- `PATCH /items/:id/status` - Update item status
- `DELETE /items/:id` - Delete item

## Database Schema

### User
- `id` - Unique identifier
- `email` - User email (unique)
- `name` - User name
- `createdAt` - Account creation timestamp

### Item
- `id` - Unique identifier
- `title` - Item title
- `description` - Item description
- `status` - LOST | FOUND | CLAIMED
- `createdAt` - Report timestamp
- `userId` - Foreign key to User

## Roadmap

- [ ] Implement SSO authentication with campus accounts
- [ ] Add real-time map tracking for item locations
- [ ] Integrate AI-powered item matching
- [ ] Implement camera functionality for item photos
- [ ] Add push notifications for matches
- [ ] Build admin dashboard
- [ ] Add search and filtering
- [ ] Implement chat between users

## Contributing

This is a campus project. Contributions are welcome!

## License

MIT License - feel free to use this for your campus.

---

**Built with ❤️ for campus communities**

