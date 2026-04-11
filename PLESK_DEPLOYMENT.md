# PFS Portal on Plesk

This project can run on Plesk because the server must host it as a real Node.js application, not as static files only.

## Recommended hosting shape

- Use a dedicated subdomain such as `hub.pfs-system.com`
- Prefer Node.js `20.9+` or Node.js `22`
- Deploy the app as a Node.js application in Plesk
- Do not rely on File Manager or `smb/web/view` alone without enabling Node.js runtime

## Why this is required

`PFS Portal` uses:

- Next.js App Router
- API routes under `src/app/api`
- runtime auth proxy in `src/proxy.ts`
- dynamic routes like sitemap, robots, and Open Graph image generation

Because of this, the app must run through Node.js.

## Plesk values

In the Plesk Node.js application screen, use these values:

- Application Root: the folder where this project is uploaded
- Document Root: leave at the default for the domain/subdomain
- Application Startup File: `server.js`
- Application Mode: `production`

Then run:

```bash
npm install
npm run build
```

After that, restart the Node.js application from Plesk.

## Environment variables

Set these in the Plesk Node.js environment section:

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://your-hub-domain`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SSO_SECRET=...`
- `HR_SUPABASE_URL=...`
- `HR_SUPABASE_ANON_KEY=...`

Optional:

- `HOST=0.0.0.0`
- `PORT=3000`

Plesk may inject `PORT` automatically. If it does, keep the Plesk value.

## Suggested deployment flow

1. Create a subdomain for the Hub.
2. Upload this repository to the subdomain's application root.
3. Open the Node.js settings in Plesk.
4. Set `server.js` as the startup file.
5. Add the environment variables.
6. Run `npm install`.
7. Run `npm run build`.
8. Restart the app.
9. Open the site and verify login, admin, sitemap, and SSO routes.

## Sanity checks after deploy

Verify these URLs:

- `/`
- `/sso-docs`
- `/robots.txt`
- `/sitemap.xml`
- `/opengraph-image`
- `/twitter-image`
- `/api/health`

Expected:

- the home page renders without 500 errors
- `/robots.txt` returns text
- `/sitemap.xml` returns XML
- `/api/health` returns a healthy response
- login, admin, and SSO routes work with Supabase cookies

## Important notes

- If you deploy under a subdirectory instead of a subdomain, you will likely need extra `basePath` work.
- A subdomain deployment is much simpler and safer.
- Uploading files through Plesk File Manager alone is not enough until the Node.js app is enabled and started.
