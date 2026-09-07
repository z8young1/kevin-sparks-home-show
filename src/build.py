#!/usr/bin/env python3
"""Assemble the landing pages into self-contained HTML (images inlined as data URIs).

Every outward-facing URL is declared once in URLS below. The pages are hosted on
kevinsparkshottubs.com, a different domain from the main kevinsparkssignaturepools.com
site, so nothing may be a relative link. check_absolute() enforces that at build time.
"""
import base64, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
src, img, out = root / 'src', root / 'img', root
css = (src / 'shared.css').read_text()
js = (src / 'shared.js').read_text()


# ---------------------------------------------------------------- URLs
# The landing pages live here. Paths must match the GHL funnel paths exactly.
LP = 'https://kevinsparkshottubs.com'
SITE = 'https://kevinsparkssignaturepools.com/'

# Paste the GoHighLevel inbound webhook URL between the quotes. Until it is set the
# forms stay in demo mode and hand off to the thank-you page without sending anything.
GHL_WEBHOOK = ''

URLS = {
    'site': SITE,
    'event': f'{LP}/nashville-home-show',
    'post': f'{LP}/POST-nashville-home-show',
    'thanks': f'{LP}/thank-you',
    'webhook': GHL_WEBHOOK,
}

THANKS_ARTIFACT = 'https://claude.ai/code/artifact/b1b17ccb-f42e-4e98-a0fe-0fb5042047bb'
PAGES = ['nashville-home-show', 'post-nashville-home-show', 'thank-you']


def data_uri(name):
    return 'data:image/webp;base64,' + base64.b64encode((img / name).read_bytes()).decode()


def apply_urls(html, overrides=None):
    table = dict(URLS, **(overrides or {}))
    def sub(m):
        key = m.group(1)
        if key not in table:
            raise KeyError(f'unknown url token {{{{url:{key}}}}}')
        return table[key]
    return re.sub(r'\{\{url:([a-z_]+)\}\}', sub, html)


# A link is fine if it is absolute, a fragment, a scheme we control, or an inlined asset.
OK_LINK = re.compile(r'^(https?://|tel:|mailto:|sms:|#|data:|$)')

def check_absolute(html, label):
    """Fail the build on any relative href/src/action, which would break off-domain."""
    bad = [
        f'{a}="{v}"'
        for a, v in re.findall(r'\b(href|src|action|data-thanks|data-webhook)="([^"]*)"', html)
        if not OK_LINK.match(v)
    ]
    if bad:
        print(f'BUILD FAILED: relative link in {label}:', file=sys.stderr)
        for b in sorted(set(bad)):
            print(f'  {b}', file=sys.stderr)
        sys.exit(1)


# ---------------------------------------------------------------- builds
(out / 'dist').mkdir(exist_ok=True)

for page in PAGES:
    raw = (src / f'{page}.html').read_text()
    html = raw.replace('/*SHARED_CSS*/', css).replace('/*SHARED_JS*/', js)
    html = re.sub(r'\{\{img:([^}]+)\}\}', lambda m: data_uri(m.group(1)), html)

    for ch, label in ((chr(8212), 'em'), (chr(8211), 'en')):
        if ch in html:
            print(f'WARNING: {label} dash in {page}', file=sys.stderr)

    # artifact version: content only (the Artifact host supplies the document skeleton),
    # and the thank-you handoff points at the published artifact instead of the live path
    art = apply_urls(html, {'thanks': THANKS_ARTIFACT})
    check_absolute(art, f'{page}.artifact.html')
    (out / 'dist' / f'{page}.artifact.html').write_text(art)

    # deployable version: a complete document
    body = apply_urls(html)
    check_absolute(body, f'{page}.html')
    full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            + body.split('<header', 1)[0] + '</head>\n<body>\n<header'
            + body.split('<header', 1)[1] + '\n</body>\n</html>\n')
    (out / 'dist' / f'{page}.html').write_text(full)
    print(page, f'{len(full)/1024:.0f} KB')


# ---- GoHighLevel embed: live image URLs instead of data URIs, plus the container reset ----
KSSP = 'https://kevinsparkssignaturepools.com/wp-content/uploads'
GEN = 'https://generationhottubs.com/wp-content/uploads'
LIVE = {
    'logo.webp':          f'{KSSP}/2025/08/KSSP-Logo-1024x333.webp',
    'hero-tub.webp':      f'{KSSP}/2026/06/Hot-Tub-Image-1024x790.png',
    'hero-showroom.webp': f'{KSSP}/2026/07/DSC00877-Enhanced-NR-Edit.png',
    'portrait.webp':      f'{KSSP}/2026/07/DSC00780-Enhanced-NR-683x1024.jpg',
    'alpha1.webp':        f'{GEN}/2024/02/Alpha-1024x683.png',
    'alpha2.webp':        f'{KSSP}/2026/07/Alpha2-1024x683.png',
    'gh500.webp':         f'{KSSP}/2026/07/gh500-1024x1020.webp',
    'gh550.webp':         f'{KSSP}/2026/07/GH550-Img.webp',
    'millennial.webp':    f'{KSSP}/2026/07/Millennial-1024x1024.png',
    'boomer.webp':        f'{KSSP}/2026/07/Boomer-1024x1024.png',
    'silent.webp':        f'{KSSP}/2026/07/Silent-1024x1024.png',
    'genx.webp':          f'{KSSP}/2026/07/GenX-1024x1024.png',
    'genz.webp':          f'{KSSP}/2026/07/GenZ-2-1024x1024.png',
    'pool-twilight.webp': f'{KSSP}/2025/07/KevinSparksSignaturePools_LeisureFiberglassPool_Allure_WEB-NIGHT-17-of-24-1024x683.jpg',
    'pool-day.webp':      f'{KSSP}/2025/05/ms2308152-2036-1024x684.jpg',
    # swimspa.webp is a rotated, background-removed edit of gh-1200.webp and has no live URL yet, so it is inlined.
}
GHL_RESET = """
/* GoHighLevel container reset: GHL wraps a Custom HTML element in section/row/column
   wrappers that cap width, add padding and set overflow:hidden (which kills the sticky header). */
.c-section,.c-section > .inner,.c-row,.c-row > .inner,.c-column,.c-wrapper,.c-html,.hl_page-preview--content{
  max-width:100% !important;width:100% !important;padding:0 !important;margin:0 !important;
  overflow:visible !important;background:transparent !important;
}
"""

for page in PAGES:
    html = (src / f'{page}.html').read_text()
    html = html.replace('/*SHARED_CSS*/', css + GHL_RESET).replace('/*SHARED_JS*/', js)
    html = re.sub(r'\{\{img:([^}]+)\}\}', lambda m: LIVE.get(m.group(1)) or data_uri(m.group(1)), html)
    html = apply_urls(html)
    check_absolute(html, f'{page}.ghl-embed.html')
    (out / 'dist' / f'{page}.ghl-embed.html').write_text(html)
    print(page, 'ghl-embed', f'{len(html)/1024:.0f} KB')

# ---- GitHub Pages: copy the standalone documents into docs/ ----
(out / 'docs').mkdir(exist_ok=True)
for page in PAGES:
    (out / 'docs' / f'{page}.html').write_text((out / 'dist' / f'{page}.html').read_text())
print('docs/ updated')

print('webhook:', GHL_WEBHOOK or 'NOT SET (forms run in demo mode)')
