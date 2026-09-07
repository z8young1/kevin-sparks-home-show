# Kevin Sparks · Nashville Home Show landing pages

Self-contained landing pages for Kevin Sparks Signature Pools. Three are for the Official Nashville Home Show, September 11 to 13, 2026, Music City Center Hall D, Booth 1238. A fourth, the evergreen Generation Hot Tubs page, is built in a separate project and copied in for the partner handoff.

| Page | Purpose | Live URL to replace |
|---|---|---|
| `dist/nashville-home-show.html` | Event page for Meta and programmatic geofencing traffic before and during the show. Drives booth visits and pre-registration for the backyard upgrade credit, which is available during the show only. | kevinsparkshottubs.com/nashville-home-show |
| `dist/thank-you.html` | Confirmation page both forms redirect to. Reads `from`, `name`, `interest`, `day`, `model` and `code` from the URL and adapts: event registrants get their day, a calendar button, directions and ticket tips; post-show bookers get showroom directions and what to bring. Conversion pixels belong here. | kevinsparkshottubs.com/thank-you |
| `dist/post-nashville-home-show.html` | Retargeting page for people who attended or visited the booth. Carries no offer. Routes them to a pool consultation, a swim spa visit, or a hot tub showroom appointment. | kevinsparkshottubs.com/POST-nashville-home-show (POST is uppercase) |

## Share links (GitHub Pages, public)

- Index: https://z8young1.github.io/kevin-sparks-home-show/
- Event page: https://z8young1.github.io/kevin-sparks-home-show/nashville-home-show.html
- Post-show page: https://z8young1.github.io/kevin-sparks-home-show/post-nashville-home-show.html
- Thank-you page (example): https://z8young1.github.io/kevin-sparks-home-show/thank-you.html?from=event&name=Jeremy&interest=Hot+tub&day=Saturday%2C+Sept+12&code=KS-1238-DEMO

Pages serves the `docs/` folder on `main`. `build.py` refreshes `docs/` on every run, so edit, build, commit, push.

## The hot tub page lives elsewhere

`hot-tubs/` holds **built output copied in from `~/kssp-hot-tubs`**, not source. Edit it there, rebuild, and copy the two files back. See `hot-tubs/SOURCE.md` for the exact commands. `src/package.py` fails loudly if those files are missing.

That page has no embedded form: every call to action links out to the client's existing Monday.com forms, so its leads bypass GoHighLevel entirely and it cannot send a confirmation text. Raised in `src/DEPLOY.md` as a decision for Jeremy.

Intended path is `kevinsparkshottubs.com/hot-tubs`, **not yet confirmed**.

## Files

- `src/` is what you edit: `shared.css`, `shared.js`, and the two page bodies. Images are referenced as `{{img:name.webp}}`.
- `img/` holds the resized WebP photography and product cutouts pulled from the live site.
- `dist/*.html` are complete standalone documents with images inlined (about 1 MB each). Open in any browser, or host anywhere.
- `dist/*.ghl-embed.html` are the GoHighLevel versions (about 48 KB). Images point at the already-public WordPress URLs and a container reset is included, same approach as the earlier kssp-hot-tubs build. Paste into a GHL Custom HTML element.
- `dist/*.artifact.html` are the Claude artifact previews.
- `hot-tubs/` is copied-in build output from `~/kssp-hot-tubs`, see above.

Rebuild after any edit:

```bash
python3 src/build.py
```

## Before launch

1. **Wire the forms.** Both forms POST to a GoHighLevel inbound webhook. Create the webhook trigger in a GHL workflow and paste its URL into `GHL_WEBHOOK` in `src/build.py`, then rebuild. While it is blank the forms stay in demo mode: they validate, then hand off to the thank-you page without sending anything. GHL hook endpoints send no CORS headers, so `shared.js` tries a readable fetch, falls back to an opaque `no-cors` send that still delivers the body, and only surfaces an error (with the phone number) if both fail. Payload keys are camelCase to match GHL contact fields: `firstName`, `lastName`, `email`, `phone`, `postalCode`, `timeline`, `interest`, `visitDay`, `model`, `page`, `pageUrl`, `code`, `submittedAt`, `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `fbclid`, `gclid`, `referrer`. The GHL workflow must send the confirmation SMS and email, because the form copy promises both.
2. **Confirmation code.** The `KS-1238-XXXX` code shown after submit is generated in the browser. If the booth will validate codes, generate them in the CRM instead and send by SMS.
3. **QR code.** Point the booth QR at the event page with `?utm_source=booth&utm_medium=qr&utm_campaign=nhs2026#credit` so booth scans are tracked separately from ad clicks and land on the form.
4. **Conversion tracking.** Put the Meta Pixel `Lead` event, the Google Ads tag and the geofencing vendor's pixel on the thank-you page (there is a marked spot near the bottom of the file). It only loads after a successful submit, so counts stay clean.
5. **Clocks.** The event page counts down to Friday 10 AM Central, switches to "Open right now" during show hours, highlights the current day in the hours table, and after Sunday 5 PM rewrites the secondary button to send people to the post page. The post page has no clock.

## Assumptions to confirm with Kevin

- **Credit tiers.** The brief says $1,000 to $2,500 and the event page states that range. If there is a fixed tier per product, those lines can be made specific.
- **Booth inventory.** The pages say hot tubs, a swim spa and a pool display are all at Booth 1238, matching the brief. The models rail shows all nine Generation tubs; if only certain models will be on the show floor, tell me which and I will tag them.
- **Swim spa and pool imagery.** Pool cards use Kevin Sparks' own photos from kevinsparkssignaturepools.com (the Allure fiberglass pool at twilight, and the daytime lap pool). The swim spa card uses the GH-1200 top-down product shot from their swim spa page, rotated so the lane runs left to right with the studio background removed. Upload `img/swimspa.webp` to the WordPress media library if you want the GHL embed to reference it by URL instead of inline data.
- **Design consultation.** Described as complimentary, at the customer's home, about an hour. Confirm that matches how the team actually runs pool consults.

## Logos link home

The header and footer logos on all four pages are anchors to `https://kevinsparkssignaturepools.com/`. Both are flex items, so they carry `flex:0 0 auto`. Without it the anchor shrinks to zero width, the image overflows, and the logo looks fine while being almost entirely unclickable.

## Links must be absolute

The pages are hosted on kevinsparkshottubs.com, a different domain from the main kevinsparkssignaturepools.com site, so traffic can be tracked separately. Nothing may be a relative link. Every outward URL is declared once in the `URLS` map in `src/build.py` and referenced from the page HTML as `{{url:key}}`. `check_absolute()` fails the build on any relative `href`, `src` or `action`, so a broken cross-domain link cannot ship.

## Offer policy

The offer differs by page on purpose:

- **Event page:** the $1,000 to $2,500 credit is available during the show only, September 11 to 13, and must be claimed in person at Booth 1238.
- **Post-show page:** no offer anywhere. It runs on the showroom visit instead.
- **Thank-you page:** branches on `data-when="event"` and `data-when="post"`, so the credit appears only in the event flow.

## Partner handoff

```bash
python3 src/build.py && python3 src/package.py
```

Produces `kevin-sparks-ghl-package.zip`: the three paste-ready GHL files, offline previews, and `READ-ME-FIRST.md` with step-by-step GHL and webhook instructions. Source for that README is `src/DEPLOY.md`.

## Design system

Carried from the live Kevin Sparks hot tub page: Oswald display, DM Sans body, IBM Plex Mono for data. Navy #0A1128, cyan #009EF0, blue #005091, and the ember #F2A33C reserved for the show elements: booth number, credit, primary buttons.
