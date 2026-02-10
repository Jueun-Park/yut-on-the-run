# yut-on-the-run

React + TypeScript + Vite scaffold for the single-player 윷놀이 MVP (see `mvp-spec.md` and `NEXT_STEPS.md`).

## Local development
- `pnpm install`
- `pnpm run dev` for HMR
- `pnpm run lint` to check code style
- `pnpm run build` to validate the production bundle

## Deployment (GitHub Pages)
- GitHub Actions workflow `.github/workflows/deploy.yml` builds on `main` with `pnpm@10.29.2` and publishes the `dist` output to Pages.
- Vite `base` is set to `/yut-on-the-run/`; the published site will be served from `https://jueun-park.github.io/yut-on-the-run/`.
- To preview the production build locally: `pnpm run build && pnpm run preview --host`.
