# T-Matic

T-Matic is a Next.js thematic analysis tool for qualitative researchers. It uses Tailwind CSS, ShadCN-style components, Neon Postgres, Vercel, and the OpenAI API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and set:

```bash
DATABASE_URL="..."
OPENAI_API_KEY="..."
AUTH_SECRET="use-a-long-random-secret"
NEXTAUTH_SECRET="use-the-same-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

For Google signup, create an OAuth app with this callback URL and add its credentials to `.env.local`:

```text
http://localhost:3000/api/auth/callback/google
```

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

3. Create tables and seed the requested accounts:

```bash
npm run db:migrate
npm run db:seed
```

Default seeded accounts:

```text
Super admin: admin@t-matic.local / ChangeMe123!
User: researcher@t-matic.local / ChangeMe123!
```

Override those credentials with `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`, `SEED_USER_EMAIL`, and `SEED_USER_PASSWORD`.

4. Start the app:

```bash
npm run dev
```

## Routes

- `/` researcher analysis workspace. Login is required before analysis.
- `/login` account login.
- `/signup` account signup with email/password or Google.
- `/admin` super admin dashboard with metrics and user CRUD.
