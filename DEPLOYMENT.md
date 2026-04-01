# PFS Portal Deployment Checklist

## Before push

- Confirm `npm run lint` passes
- Confirm `npx tsc --noEmit --incremental false` passes
- Confirm `npm run build` passes

## Vercel environment variables

Set these in the Vercel project before promoting to production:

- `NEXT_PUBLIC_APP_URL=https://polyfoampfs-hub.vercel.app`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SSO_SECRET`
- `HR_SUPABASE_URL`
- `HR_SUPABASE_ANON_KEY`

## After deploy

Open and verify:

- `https://polyfoampfs-hub.vercel.app/`
- `https://polyfoampfs-hub.vercel.app/sso-docs`
- `https://polyfoampfs-hub.vercel.app/robots.txt`
- `https://polyfoampfs-hub.vercel.app/sitemap.xml`
- `https://polyfoampfs-hub.vercel.app/opengraph-image`
- `https://polyfoampfs-hub.vercel.app/twitter-image`
- `https://polyfoampfs-hub.vercel.app/sso-docs/opengraph-image`
- `https://polyfoampfs-hub.vercel.app/sso-docs/twitter-image`

Expected results:

- `/robots.txt` returns plain text, not a 404 page
- `/sitemap.xml` returns XML with the public URLs
- home page canonical points to the production URL
- admin, dashboard, login pages remain `noindex`
- social image routes render actual image cards

## Search Console

After the production deploy is healthy:

- add the production site to Google Search Console
- submit `https://polyfoampfs-hub.vercel.app/sitemap.xml`
- request indexing for `/` and `/sso-docs`

## Optional production hardening

- move from the Vercel subdomain to a company-owned custom domain
- configure a single canonical hostname (`www` or non-`www`)
- connect analytics and error monitoring
