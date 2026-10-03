# HAVO 5 Study Calendar

The page design is the original design. The only functional change is that checkbox progress is shared through `/api/progress` instead of being limited to one browser.

## Deploy with GitHub + Vercel

1. Put these files in a GitHub repository.
2. Import the repository into Vercel.
3. In the Vercel project, open **Storage / Marketplace** and add **Neon Postgres**.
4. Make sure the integration adds `DATABASE_URL` to the Vercel project.
5. Redeploy once after connecting the database.

No SQL setup is required. The API creates the `study_progress` table automatically on its first request.

## Shared progress

- Checkbox changes are written to the shared database.
- Every visitor fetches shared progress every 2 seconds.
- A checkbox changed by one visitor will therefore appear for everyone else shortly after.
- `localStorage` is only used as a temporary browser cache/fallback if the API cannot be reached.

## Project structure

- `index.html` — original study calendar design and content
- `api/progress.js` — Vercel Function for shared progress
- `package.json` — Neon serverless database dependency
