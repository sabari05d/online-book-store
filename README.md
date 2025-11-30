# Online Book Store

A complete online book store built with Next.js 14 (App Router), Supabase, and Tailwind CSS.

## Features

- **Public Storefront**: Browse books, filter by genre, search, view details.
- **Shopping Cart**: Add items, update quantities, remove items.
- **Checkout**: Mock payment flow with address capture.
- **Admin Panel**: Manage books (CRUD + Image Upload), genres, and orders.
- **Authentication**: Secure login/signup via Supabase Auth.

## Prerequisites

- Node.js 18+
- Supabase Project (or local instance)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd online-book-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create `.env.local` with the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # For seeding only
   ```

4. **Database Setup**
   - Run the SQL migrations in `supabase/migrations` in your Supabase SQL Editor.
   - Run the seed script to populate data:
     ```bash
     npx tsx scripts/seed.ts
     ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Admin Access

- **Email**: `admin@example.com`
- **Password**: `password123`
- Login at `/login` and navigate to `/admin`.

## Testing

Run unit tests:
```bash
npm test
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Testing**: Vitest

## License

MIT
