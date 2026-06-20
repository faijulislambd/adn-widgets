# Next.js + shadcn/ui + Redux Starter

Ready-to-install boilerplate with:

- Next.js App Router and TypeScript
- shadcn-style components and theme tokens
- Light/dark mode toggle with light as the default
- Redux Toolkit and React Redux preinstalled
- Collapsible icon sidebar based on shadcn `sidebar-07`
- Password fetch helper with `"techops2026"` fallback

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Password Source

Set `NEXT_PUBLIC_PASSWORD_URL` in `.env.local` to the address that returns the password:

```bash
NEXT_PUBLIC_PASSWORD_URL=https://example.com/password
```

The helper accepts either plain text or JSON:

```json
{ "password": "your-password" }
```

If the address is missing, unreachable, or does not return a usable password, the app uses:

```text
techops2026
```
