# Kevin Sparks · Nashville Home Show landing pages

Two self-contained landing pages for the Official Nashville Home Show, September 11 to 13, 2026, Music City Center Hall D, Booth 1238.

| Page | Purpose | Live URL to replace |
|---|---|---|
| `dist/nashville-home-show.html` | Event page for Meta and programmatic geofencing traffic before and during the show. Drives booth visits and pre-registration for the backyard upgrade credit. | kevinsparkshottubs.com/nashville-home-show |
| `dist/thank-you.html` | Confirmation page both forms redirect to. Reads `from`, `name`, `interest`, `day`, `model` and `code` from the URL and adapts: event registrants get their day, a calendar button, directions and ticket tips; post-show bookers get the credit countdown, showroom directions and what to bring. Conversion pixels belong here. | kevinsparkshottubs.com/thank-you (new) |
| `dist/post-nashville-home-show.html` | 30-day retargeting page for people who attended or visited the booth. Routes them to a pool consultation, a swim spa visit, or a hot tub showroom appointment. | kevinsparkshottubs.com/post-nashville-home-show |

## Share links (GitHub Pages, public)

- Index: https://z8young1.github.io/kevin-sparks-home-show/
- Event page: https://z8young1.github.io/kevin-sparks-home-show/nashville-home-show.html
- Post-show page: https://z8young1.github.io/kevin-sparks-home-show/post-nashville-home-show.html
- Thank-you page (example): https://z8young1.github.io/kevin-sparks-home-show/thank-you.html?from=event&name=Jeremy&interest=Hot+tub&day=Saturday%2C+Sept+12&code=KS-1238-DEMO

Pages serves the `docs/` folder on `main`. `build.py` refreshes `docs/` on every run, so edit, build, commit, push.

## Files

- `src/` is what you edit: `shared.css`, `shared.js`, and the two page bodies. Images are referenced as `{{img:name.webp}}`.
- `img/` holds the resized WebP photography and product cutouts pulled from the live site.
- `dist/*.html` are complete standalone documents with images inlined (about 1 MB each). Open in any browser, or host anywhere.
- `dist/*.ghl-embed.html` are the GoHighLevel versions (about 48 KB). Images point at the already-public WordPress URLs and a container reset is included, same approach as the earlier kssp-hot-tubs build. Paste into a GHL Custom HTML element.
- `dist/*.artifact.html` are the Claude artifact previews.

Rebuild after any edit:

```bash
python3 src/build.py
```

## Before launch

1. **Wire the forms.** Both forms have `action="#"`, which in demo mode redirects straight to `thank-you.html` with the answers in the URL. In GoHighLevel, set each form's redirect to the thank-you page URL and pass `from` (`event` or `post`), `name`, `interest`, `day`, `model` and `code` as query parameters using GHL's merge fields, or leave the parameters off and the page falls back to generic copy. Point `action` at the GHL form endpoint or webhook, or swap in the GHL form embed. Field names: `first_name`, `last_name`, `email`, `phone`, `zip`, `interest`, `timeline`, `visit_day` (event page), `model`, `next_step`, `best_time` (post page). Hidden fields capture `utm_*`, `fbclid`, `gclid`, `referrer`, and `page`.
2. **Confirmation code.** The `KS-1238-XXXX` code shown after submit is generated in the browser. If the booth will validate codes, generate them in the CRM instead and send by SMS.
3. **QR code.** Point the booth QR at the event page with `?utm_source=booth&utm_medium=qr&utm_campaign=nhs2026#credit` so booth scans are tracked separately from ad clicks and land on the form.
4. **Conversion tracking.** Put the Meta Pixel `Lead` event, the Google Ads tag and the geofencing vendor's pixel on the thank-you page (there is a marked spot near the bottom of the file). It only loads after a successful submit, so counts stay clean.
5. **Clocks.** The event page counts down to Friday 10 AM Central, switches to "Open right now" during show hours, highlights the current day in the hours table, and after Sunday 5 PM rewrites the secondary button to send people to the post page. The post page counts days down to October 13.

## Assumptions to confirm with Kevin

- **Credit window.** The post page says the credit is held through **October 13, 2026** (30 days after the show closes). Change the date in `src/post-nashville-home-show.html` if the real window differs.
- **Credit tiers.** The brief says $1,000 to $2,500. The pool card on the post page says "up to $2,500 toward your pool" and the other cards say "applies to your swim spa / hot tub" without an amount. If there is a fixed tier per product, those lines can be made specific.
- **Booth inventory.** The pages say hot tubs, a swim spa and a pool display are all at Booth 1238, matching the brief. The models rail shows all nine Generation tubs; if only certain models will be on the show floor, tell me which and I will tag them.
- **Swim spa and pool imagery.** No swim spa or pool photography exists on the live site, so those cards use an animated water treatment. Real photos of a Kevin Sparks pool and swim spa would be a clear upgrade.
- **Design consultation.** Described as complimentary, at the customer's home, about an hour. Confirm that matches how the team actually runs pool consults.

## Design system

Carried from the live Kevin Sparks hot tub page: Oswald display, DM Sans body, IBM Plex Mono for data. Navy #0A1128, cyan #009EF0, blue #005091, and the ember #F2A33C reserved for the show elements: booth number, credit, primary buttons.
