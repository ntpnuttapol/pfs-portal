## PFS Portal

PFS Portal is a Next.js internal portal directory and SSO hub for Polyfoam Suvarnabhumi. It provides:

- a public-facing portal directory
- sign-in and access request flows
- admin approval and user management
- SSO documentation for connected systems

## Local Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Checks

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

## Environment Variables

Use [env.template](/Users/mynutntp/Desktop/PFS-Portal/env.template) as the reference for local and production environment variables.

For production SEO and correct canonical URLs, set:

```bash
NEXT_PUBLIC_APP_URL=https://polyfoampfs-hub.vercel.app
```

## Deployment

The project is deployed on Vercel. Use the release checklist in [DEPLOYMENT.md](/Users/mynutntp/Desktop/PFS-Portal/DEPLOYMENT.md) after each production deploy.

For Plesk-based self-hosting, use [PLESK_DEPLOYMENT.md](/Users/mynutntp/Desktop/PFS-Portal/PLESK_DEPLOYMENT.md).

Key live checks:

- `/robots.txt`
- `/sitemap.xml`
- `/opengraph-image`
- `/twitter-image`
- `/sso-docs`

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase
- Vercel

## Notes

- public SEO pages are `/` and `/sso-docs`
- private routes such as `/login`, `/dashboard`, and `/admin/*` are configured as `noindex`
- metadata, sitemap, robots, and social image routes are generated through the App Router
