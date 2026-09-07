# Generation Hot Tubs page (evergreen)

These two files are **built output copied in from another project**. Do not edit them here.

Source lives at `~/kssp-hot-tubs`:

```bash
cd ~/kssp-hot-tubs
# edit landing-page.src.html
python3 build.py        # standalone + artifact
python3 build-ghl.py    # ghl-embed, live image URLs
cp ghl-embed.html                 ~/kevin-sparks-home-show/hot-tubs/hot-tubs.ghl-embed.html
cp kssp-hot-tubs-standalone.html  ~/kevin-sparks-home-show/hot-tubs/hot-tubs.html
```

They are copied here so `src/package.py` can build the partner handoff zip from one place.

Unlike the Home Show pages, this page has **no embedded form**. Every call to action links out
to the client's existing Monday.com forms, so its leads land in Monday directly and never touch
GoHighLevel. That means no GHL contact record and no confirmation SMS for this page. See the
note in `src/DEPLOY.md`.
