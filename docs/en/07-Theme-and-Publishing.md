# 07. Theme and publishing

🇧🇷 [Português](../07-Tema-e-Publicação.md) · 🇺🇸 **English**

[Documentation index](README.md) · ← [06. Quality and tests](06-Quality-and-Tests.md)

> BIOS palette on Material 3 and static publishing on Vercel.

## Theme

The colors come from the project's presentation (`bios-docs/assets/BIOS - PPTX.pptx`). The Material 3
palettes (`src/styles/_theme-colors.scss`) were generated with `ng generate @angular/material:theme-color`,
and the exact colors are CSS variables for the brand and the charts:

| Variable             | Color     | Use                        |
| -------------------- | --------- | -------------------------- |
| `--bios-brand-green` | `#2C5F2D` | Primary: top bar, headings |
| `--bios-brand-leaf`  | `#97BC62` | Tertiary: highlights       |
| `--bios-brand-moss`  | `#5B6B5B` | Secondary text             |
| `--bios-brand-ink`   | `#1A1A1A` | Text                       |
| `--bios-brand-paper` | `#F5F5F5` | Surfaces, footer           |

## Publishing (Vercel)

The presentation version is static and is published on Vercel (Hobby plan) on every merge into
`main`. `vercel.json` defines the install (the same npm 11 as CI), the build (`npm run build`), the
published folder (`dist/bios-webapp/browser`) and the rewrite of every route to `index.html`, so a deep
link (`/empresas/<cnpj>`) opens directly. The footer says the data is captured, and an E2E test checks
that the site makes no request outside its own origin: there is no real API and no secret in the build.

To create the project (once):

1. On vercel.com, **Add New → Project → Import** the `odavibatista/bios-webapp` repository.
2. **Framework Preset:** Other (`vercel.json` already sets install, build and output). No environment
   variables.
3. Once created: **Settings → Git → Production Branch:** `main`; **Settings → Build and Deployment →
   Node.js Version:** 22.x, the same as Volta.
4. Check the public address: the home page opens, and a route that does not exist
   (`/rota-que-nao-existe`) shows the app's "not found" page, not Vercel's 404.
