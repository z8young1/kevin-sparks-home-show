# Kevin Sparks Signature Pools — landing pages

Four pages, ready to paste into GoHighLevel. Nothing needs to be built or compiled.

Three are for the Nashville Home Show, September 11 to 13, 2026. The fourth is the evergreen Generation Hot Tubs page, which runs year round and is not tied to the show.

## What is in this folder

**paste-into-ghl/** — the files you paste into GHL. Each one is a complete page: styles, markup and scripts all in a single file.

| File | Goes live at | Notes |
|---|---|---|
| `1-event-page.html` | `https://kevinsparkshottubs.com/nashville-home-show` | Show offer, has a form |
| `2-post-show-page.html` | `https://kevinsparkshottubs.com/POST-nashville-home-show` | No offer, has a form |
| `3-thank-you-page.html` | `https://kevinsparkshottubs.com/thank-you` | Both forms land here |
| `4-hot-tubs-page.html` | `https://kevinsparkshottubs.com/hot-tubs` | Evergreen, has a form. **Confirm this path with Jeremy.** |

**preview-in-browser/** — the same four pages, but with every image baked in so they work offline. Double-click any of them to see the page in Chrome. Do not paste these into GHL, they are much larger files.

---

## Step 1: Build each page in GHL

Do this four times, once per file.

1. **Sites → Websites → New Page.** Use a blank template.
2. Set the page path to match the table above. The second one has **POST in capital letters**. URL paths are case sensitive, so copy it exactly.
3. Add one section, one row, one column.
4. Set the section to **Full Width**, then set padding and margin to **0** on the section, the row and the column. These pages run edge to edge and GHL adds gutters by default.
5. Drag in a **Custom JS/HTML** element.
6. Open the matching file in a text editor, select all, copy, and paste the whole thing into that element.
7. Save.

**Do not judge the page inside the GHL builder.** The builder canvas renders custom HTML badly. Use the Preview button or the live URL.

If you see gutters down the sides after publishing, open the page in Chrome, right-click the white space, choose Inspect, find the wrapper element that is capping the width, and add its class name to the reset block at the bottom of the CSS in the file. That block is commented and explains what it does.

---

## Step 2: Connect the form to GoHighLevel

Pages 1, 2 and 4. Their forms are custom-built to match the design. They send their data to a **GHL inbound webhook**. Until you do this step, the forms still work and still forward people to the thank-you page, but nothing is saved anywhere.

### Create the webhook

1. **Automation → Workflows → Create Workflow.**
2. Add trigger: **Inbound Webhook**.
3. GHL gives you a webhook URL. Copy it.

### Put the URL into the pages

In `1-event-page.html`, `2-post-show-page.html` and `4-hot-tubs-page.html`, find this exact text:

```
data-webhook=""
```

Paste the URL between the two quote marks so it reads:

```
data-webhook="https://services.leadconnectorhq.com/hooks/YOUR-URL-HERE"
```

It appears **once per file**, in all three. Save, then re-paste each updated file into GHL.

All three post to the same webhook, so one workflow handles every lead. Tell them apart with the `page` field: `nashville-home-show`, `post-nashville-home-show`, or `hot-tubs`.

### What the webhook receives

Submit the form once yourself so GHL can capture a sample payload and let you map the fields. The pages send JSON with these keys:

| Key | What it is |
|---|---|
| `firstName`, `lastName` | Name |
| `email`, `phone` | Contact |
| `postalCode` | Home ZIP |
| `timeline` | How soon they are planning |
| `interest` | Hot tub, Swim spa, Pool, or Not sure |
| `visitDay` | Which show day (event page only) |
| `page` | `nashville-home-show`, `post-nashville-home-show`, or `hot-tubs` |
| `model` | Which hot tub they picked, if any |
| `pageUrl` | Full URL including any ad parameters |
| `code` | The reference code shown on screen |
| `submittedAt` | Timestamp |
| `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm` | Ad tracking |
| `fbclid`, `gclid` | Facebook and Google click IDs |
| `referrer` | Where they came from |

### Then build the rest of the workflow

1. **Create or update the contact** from those fields.
2. **Send a confirmation email.** The pages promise a phone call or an email, never a text, so an email with the `code` value in it closes that loop. Do not add an SMS step unless the copy is changed to promise one.
3. **Notify the team** so the booth knows a registration came in.

Once that works, connect Make.com to this workflow to push each lead into Monday.com, and write a copy to a Google Sheet as a backup. If the Monday connection ever breaks mid-show, the sheet means nothing is lost.

---

## Step 3: Check it works

- Submit all three forms once on a phone, not just a desktop.
- Confirm each contact appears in GHL with the right `page` value.
- Confirm the confirmation email actually arrives.
- On the hot tub page, click a model's "See It" button first and check that model rides along on the lead.
- Confirm you land on the thank-you page afterward, and that it greets you by name.

If the webhook is unreachable, the form shows an error and tells the person to call 615.238.4144. It will not silently swallow a lead.

---

## Notes

**Logos link home.** The header and footer logos on every page go to `https://kevinsparkssignaturepools.com/`, opening the client's main site.

**Images** load from the client's existing WordPress site at kevinsparkssignaturepools.com. They are public and work fine from this domain. One swim spa image has no live URL and is embedded directly in the file.

**The offer differs by page, on purpose.**
- Page 1 (event) states the $1,000 to $2,500 credit is available **during the show only**, September 11 to 13, and must be claimed in person at Booth 1238.
- Page 2 (post-show) has **no offer on it at all**. It runs on the showroom visit instead.
- Page 3 (thank-you) shows the credit only when someone arrives from page 1. Coming from page 2, no offer is mentioned.
- Page 4 (hot tubs) is evergreen and mentions no show offer at all.

**No page promises a text message.** Follow-up is by phone or email, and the copy says so. If that changes, the copy has to change with it.

**The thank-you path** is set to `/thank-you`. If you use a different path in GHL, search both page files for `data-thanks=` and update the URL there.
