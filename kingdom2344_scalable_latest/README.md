# Kingdom 2344 — Scalable Royal Archive

This package is based on the latest supplied website backup.

Main navigation:
- Home
- Kingdom
- Alliances
- Ranking
- Migration

Structure:
- pages/ = individual site categories
- css/ = shared design
- js/ = shared behavior
- data/ = manually maintained site data
- assets/ = images and icons
- api/ = external/server data endpoints

The current working `api/ranking.js` is preserved.
Keep the Vercel environment variable `MIGHTPULSE_API_KEY`.

To add a new top-level category later:
1. Create `pages/<category>/index.html`
2. Add its link to the shared navigation
3. Add page-specific CSS/JS only if needed
