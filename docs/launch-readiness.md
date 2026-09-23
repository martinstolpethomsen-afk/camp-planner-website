# Launch content maintenance

The official launch date is **1 November 2026**. This repository is the public
marketing website only. No application code on camp-planner.dk is changed.

## Shared content and build

Edit `content/launch.json`, then run:

```sh
python3 -m pip install -r scripts/requirements.txt
python3 scripts/render_launch.py
python3 scripts/check_site.py
node --check script.js
```

Commit the generated HTML alongside the configuration. Hosting serves the checked-in
HTML directly: navigation, launch dates, feature status and prices do not depend on
client-side JavaScript. The renderer is idempotent. No pre-existing package build,
lint or test command was present; these checks cover the static-site delivery model.

The renderer owns shared header/footer navigation, launch banners, conversion links,
homepage pricing and workflow sections, feature badges and consent translations.
It preserves page-specific content and image assets. English-only destination pages
retain localized link text on local pages, with `hreflang="en"` and localized titles.
Pricing links deliberately point to `/index.html#pricing`; localized homepages also
contain the translated launch offer.

## Feature readiness

The marketing repository contains descriptions and mockups, not production code,
acceptance-test evidence or a signed-off launch feature list. Therefore these
capabilities are conservatively **Coming soon** (localized on local pages): event
setup, registration, automated scheduling, people/venue management, SMS, push,
CheckPoint/QR check-in, badges, accommodation, finance/reporting, LiveBoard,
instant updates, participant mobile views and communications.

API, SSO and custom integrations remain **Planned**, as in the existing roadmap.
Club, Federation and Enterprise remain non-binding product directions. Their matrix
cells say Planned rather than Included. Nothing is marked Available at launch.
CheckPoint and badges are not asserted to be included, and their commercial module
packaging is not invented. Confirm production readiness, scope and module pricing
before changing the central statuses. Record evidence in `featureStatus` first.

## HubSpot actions outside this repository

The existing calendar URL and form IDs are preserved. The homepage and pilot page
already use the same HubSpot form ID. External scripts remain blocked until consent.
No test applications or bookings should be submitted during smoke tests.

The meeting owner must configure **Camp-Planner introduction – 30 minutes** in
HubSpot and verify that the calendar shows the visitor's local timezone. The public
website continues to describe an introduction of approximately 30 minutes. No
frontend override attempts to alter or conceal the external meeting settings.

## Deployment

Review and merge the marketing-only change through the repository's normal hosting
workflow. A local successful build is not proof of a production deployment. Repeat
calendar/form checks on the deployed origin because external services can apply
origin-specific settings. Existing legal documents and organization logos are kept;
this change does not establish new evidence of logo-use rights.

Browser verification on 23 September 2026 confirmed that the embedded HubSpot
calendar offers 15, 30 and 60 minutes, with **15 minutes selected by default**.
It displayed UTC+02:00 Central European time in the Copenhagen test environment;
automatic timezone detection for other visitor locations still needs verification
in HubSpot. The pilot embed loads a generic **Contact Us** form. Update its title
and introduction in HubSpot to match “Apply for Pilot Access” if that form is to
remain the dedicated pilot application. Its existing fields and consent controls
were preserved and no form was submitted.
