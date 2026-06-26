# CP-001 – Camp-Planner Homepage v1

Upload-ready static website package.

## Files
- `index.html` – homepage
- `login.html` – temporary login page / login mockup
- `styles.css` – all styling
- `script.js` – simple reveal animations + mobile menu
- `assets/` – logos, icons and images

## Upload to GitHub Pages
1. Copy the contents of this folder into your GitHub repository root or `/public` folder.
2. If using GitHub Pages from root: make sure `index.html` is at the root.
3. Commit and push.
4. In GitHub: Settings → Pages → Deploy from branch → main → root.

## Suggested domain setup
- Main site: `camp-planner.online`
- Danish site later: `camp-planner.dk`
- App later: `app.camp-planner.online`

## Current links
- `Login` points to `login.html` until Claude connects authentication.
- `Book Demo` points to the demo form on the homepage.

## Next production steps
- CP-002 Platform page
- CP-003 Solutions page
- CP-004 Pricing page
- CP-005 Dashboard / Event Planner UI


## v1.1 update
- Demo/contact email: `hello@camp-planner.online`
- Header login button target: `https://camp-planner.dk`


## CP-002 Platform Page
New file added:
- `platform.html`

Upload all files to the same GitHub repository root and replace existing files when asked.


## CP-003 Visual Fix
Updates:
- Sport category icons lifted and refined visually.
- Trusted section changed from text names to logo image slots.
- Placeholder partner SVG logos added in `assets/logos/partners/`.

Replace placeholder SVG files with real transparent SVG/PNG logos later using the same filenames, or update the paths in `index.html`.


## CP-004 Launch + Trusted Update
Updates:
- Added top launch announcement bar: "Launching this October".
- Added newsletter signup section on homepage.
- Added real MAAS, Tora Ryu/Nivå and Nivå Budoklub logos to Trusted section.
- Kept placeholder logo slots for Budo Nord, WUKF and IKF until real logos are provided.

Static-site note:
The newsletter form currently uses `mailto:hello@camp-planner.online`. For real list capture, connect it later to Mailchimp, Brevo, Formspree, HubSpot or the app backend.


## CP-005 Top Logo Fix
The top navigation logo has been replaced with a robust text/icon brand mark:
`CP Camp-Planner`

This avoids the logo disappearing if the image is too dark, cached, or visually unclear.
