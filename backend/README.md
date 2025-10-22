# Reclaim Backend

Express + TypeScript + Prisma backend for the Reclaim lost-and-found platform.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and add your Neon PostgreSQL connection string.

3. **Generate Prisma client:**
   ```bash
   pnpm prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   pnpm prisma:migrate
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

The server will start at `http://localhost:3000`.

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   └── item.controller.ts
│   ├── services/          # Business logic
│   │   └── item.service.ts
│   ├── routes/            # Route definitions
│   │   ├── index.ts
│   │   └── item.routes.ts
│   ├── types/             # TypeScript types/interfaces
│   │   └── item.types.ts
│   └── index.ts           # Application entry point
├── prisma/
│   └── schema.prisma
└── package.json
```

## API Routes

### Health
- `GET /health` - Health check endpoint

### Items
- `GET /items` - Get all items
- `GET /items/:id` - Get item by ID
- `POST /items` - Create new item
  - Body: `{ title, description, status }`
  - Status: `LOST`, `FOUND`, or `CLAIMED`
- `PATCH /items/:id/status` - Update item status
  - Body: `{ status }`
- `DELETE /items/:id` - Delete item

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm lint` - Run ESLint

## Database Schema

### User
- `id` - String (CUID)
- `email` - String (unique)
- `name` - String
- `createdAt` - DateTime

### Item
- `id` - String (CUID)
- `title` - String
- `description` - String
- `status` - Enum (LOST, FOUND, CLAIMED)
- `createdAt` - DateTime
- `userId` - String (FK to User)

