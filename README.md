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


## CP-006 Performance + CTA Fix
- Optimized image assets for faster loading.
- Fixed event card CTA overlap.
- Improved card text spacing and mobile responsiveness.
- Added hero image preload.


## CP-007 Event Cards No Arrow
Updates:
- Removed the white circular arrow CTA dots from event cards.
- Made the full event card act as the visual CTA.
- Improved card spacing after removing the arrow.


## CP-008 Founder Flip Cards + About Page
Updates:
- Added founder flip-card section to homepage.
- Added `about.html`.
- Added professional founder image and sports/action founder image.
- Updated founder story:
  - Founder, Camp-Planner
  - Former CEO of a software development company
  - Founder and Kancho of Nivå Budoklub
  - Kancho of MAAS Denmark
  - International teaching and camp support experience


## CP-009 Readability + Single Founder Card
Updates:
- Fixed event card readability after CTA arrow removal.
- Removed the white round arrows completely.
- Changed founder section from two flip-cards to one single flip-card:
  - front: professional side
  - back: sports/event organizer side


## CP-010 Owner Footer
Updates:
- Added brand and product owner information to website footer:
  TK Virksomhedsservice
  Solager 7
  DK-2990 Nivaa
  Denmark
  Org. no: 42123242


## CP-011 Front Box Hover Readability
Updates:
- Improved front page 6-box / sport-card readability.
- Added hover lightening effect.
- Kept the white round arrow CTA removed.


## CP-012 HubSpot Lead Capture
- Added book-demo.html
- Added pilot-program.html
- Added HubSpot placeholders for Book Demo, Join Launch List, Pilot Program
- Added setup guide


## CP-013 Bottom Bar + Single Founder Fix
- Moved red launch bar to fixed bottom position.
- Rebuilt homepage founder section as one single flip-card.
- Hid old double flip-card markup/CSS.
- Ensured correct founder images are included.


## CP-014 Topbar + Founder Text + Links
Updates:
- Reduced topbar logo size.
- Slowed founder flip animation.
- Sharpened founder copy.
- Added link buttons:
  - LinkedIn profile placeholder
  - Nivå Budoklub
  - MAAS
Note: Replace LinkedIn and MAAS URLs with the final official links if needed.


## CP-015 Remove Founder Links
Updates:
- Removed founder card link buttons again.
- Kept improved founder text.
- Kept smaller topbar logo.
- Kept slower founder flip animation.


## CP-016 Founder Headline Two Lines
Updates:
- Changed founder headline to a clean two-line break:
  Built from the floor.
  Designed for the future.


## CP-017 Event Headline + Participant Flow
Updates:
- Split headline into two lines:
  Build your event once.
  Run it everywhere.
- Added participant invitation / participant registration focus.
- Added volunteer management focus.
- Added people-flow section to platform page.


## CP-018 Topbar Logo Hard Fix
Updates:
- Increased topbar height slightly.
- Locked logo image height to 30px.
- Locked text/logo fallback mark to 30px.
- Added fixed brand container height to stop logo from pushing layout.
