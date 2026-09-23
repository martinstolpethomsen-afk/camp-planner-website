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

## Version 1 readiness (corrected 23 September 2026)

The product owner confirmed that Camp-Planner version 1 is ready for use. The
previous blanket Coming soon labels were incorrect: missing evidence in the
marketing repository was not evidence that the product lacked these features.

Status is now cross-checked against the application's main commit
`b190942e5a0518197ca35c6f82cb56ebb2b479f0`, especially `docs/FUNCTION_MATRIX.md`
(17 September 2026), `docs/USER_GUIDE.md` and the actual module implementations.
Source references are recorded for each capability in `content/launch.json`.

Active version 1 features: event setup, registration, scheduling, participants,
instructors, volunteers, areas, check-in/QR, badge printing, accommodation,
finance/exports/feedback, LiveBoard and responsive public schedule views. Active
cards have no Coming soon badge; the pricing matrix identifies version 1 features.
Module access still depends on organization configuration, event type and roles.

Keep the documented scope precise:
- Check-in is online, without offline queuing or instant synchronization between stations.
- Badge printing uses event printing profiles and the operating system print dialog;
  do not invent a separate Badge Studio design product.
- Mobile views show published schedules; do not promise a personalized schedule.
- Planning automation supports the existing Training/Meeting templates.
- Event finance does not automatically reconcile external payment providers.
- Communication Hub is planned; SMS and Web Push are later adapters, per
  `docs/COMMUNICATION_HUB_V1_SPEC.md`. Existing invitations/email functions do not
  imply a complete automated communications module or bulk thank-you delivery.
- API, SSO and custom integrations, plus Club/Federation/Enterprise plans, remain
  future product directions. Version 1 readiness does not assert those are included.

Selected application regression checks passed: check-in (24 required scenarios),
schedule grid/drag-and-drop, accommodation save and registration guardrails. These
are repository checks, not a new full production acceptance test. No app files,
databases or deployments were modified by this marketing correction.

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
