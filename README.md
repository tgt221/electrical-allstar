# Electrical Allstar — Website

Award-style single-page site for **Electrical Allstar**, a residential electrician
serving the East Bay, CA. Built with plain HTML/CSS/JS plus [GSAP](https://gsap.com/)
(ScrollTrigger) and [Three.js](https://threejs.org/) via CDN — no build step.

> **Brand:** Allstar Red `#C8102E` · Black `#1A1A1A` · Gold `#F5C518` · Steel `#A8B2BD`
> **Type:** Bebas Neue · Montserrat · Open Sans · **Tagline:** _We Build Trust In Every Home_

## Concept variants

All three pages share `css/style.css`, `js/main.js`, and `assets/`. Each layers a
small flag/override on top:

| Page             | Concept                    | How it differs |
|------------------|----------------------------|----------------|
| `index.html`     | **Light** (live homepage)  | Adds `css/light.css` + `window.ALLSTAR_LIGHT` (Three.js scene switches to normal blending / deeper tones for a white background). Served at the site root. |
| `dark.html`      | **Dark — breaker box**     | 3D electrical breaker panel in the hero. |
| `dark-star.html` | **Dark — Allstar star**    | Sets `window.ALLSTAR_SCENE = "star"`; hero centerpiece becomes a spinning 3D star with orbiting energy rings. |

> ⚠️ The variants share `css/style.css`, `js/main.js`, and `assets/`. If you change
> shared content in `index.html`, mirror the edit into `dark.html` and `dark-star.html`.

## Run locally

Any static file server works. This repo includes a dependency-free PowerShell server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1 -Port 8321
```

Then open <http://localhost:8321/> (light homepage), `/dark.html`, or `/dark-star.html`.

## Structure

```
index.html        # LIGHT concept — live homepage (served at root)
dark.html         # dark breaker-box concept
dark-star.html    # dark Allstar-star concept
css/  style.css   # shared theme
      light.css   # light-concept overrides
js/   main.js     # GSAP scroll + Three.js hero scenes
assets/           # logo (transparent PNG + original JPG), truck wrap, project photos
      unused/     # project photos not used on the site
serve.ps1         # local static server
```

## Contact

Electrical Allstar · 510-993-6764 · info@electricalallstar.com
