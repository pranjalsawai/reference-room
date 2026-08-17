# The Reference Room

An invitation-only visual library for collecting useful websites, branding,
typography, motion, books, tools, portfolios, and other creative references.

## Access model

- Owners can view, add, edit, delete, and manage invitations.
- Contributors can view the full shared library and add references, but cannot edit or delete.
- Shared-password visitors use one dedicated contributor account and provide their name when entering.
- Personal users join with a one-time invitation code and receive an isolated private workspace.

Each submission can include the contributor's name and a short note explaining
why they shared the reference.

## Safe setup order

1. Back up the Supabase database.
2. Run `supabase-schema.sql` in the Supabase SQL editor. Existing resources are preserved.
3. Create a dedicated Auth user such as `shared@reference-room.local` with the desired shared password.
4. Find the shared workspace ID and the dedicated user's ID, then add that user to `workspace_members` with role `contributor` and add a matching `profiles` row.
5. Add the variables from `.env.example` to Vercel. `SUPABASE_SERVICE_ROLE_KEY` must remain server-only.
6. Deploy the feature branch to a Vercel preview and test every role before promoting it to production.

The owner can use `/manage-access` to email a contributor invitation or generate
a one-time code for a new personal room.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
