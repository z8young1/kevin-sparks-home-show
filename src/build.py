#!/usr/bin/env python3
"""Assemble the two landing pages into self-contained HTML (images inlined as data URIs)."""
import base64, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
src, img, out = root/'src', root/'img', root
css = (src/'shared.css').read_text()
js  = (src/'shared.js').read_text()
def data_uri(name):
    p = img/name
    return 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode()
THANKS_ARTIFACT = 'https://claude.ai/code/artifact/b1b17ccb-f42e-4e98-a0fe-0fb5042047bb'
PAGES = ['nashville-home-show','post-nashville-home-show','thank-you']
for page in PAGES:
    html = (src/f'{page}.html').read_text()
    html = html.replace('/*SHARED_CSS*/', css).replace('/*SHARED_JS*/', js)
    html = re.sub(r'\{\{img:([^}]+)\}\}', lambda m: data_uri(m.group(1)), html)
    for ch,label in ((chr(8212),'em'),(chr(8211),'en')):
        if ch in html: print(f'WARNING: {label} dash in {page}', file=sys.stderr)
    # artifact version: content only (the Artifact host supplies the document skeleton)
    (out/'dist').mkdir(exist_ok=True)
    (out/'dist'/f'{page}.artifact.html').write_text(html.replace('data-thanks="thank-you.html"', 'data-thanks="'+THANKS_ARTIFACT+'"'))
    # deployable version: a complete document
    full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            + html.split('<header',1)[0] + '</head>\n<body>\n<header' + html.split('<header',1)[1]
            + '\n</body>\n</html>\n')
    (out/'dist'/f'{page}.html').write_text(full)
    print(page, f'{len(full)/1024:.0f} KB')

# ---- GoHighLevel embed: live image URLs instead of data URIs, plus the container reset ----
KSSP = 'https://kevinsparkssignaturepools.com/wp-content/uploads'
GEN  = 'https://generationhottubs.com/wp-content/uploads'
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
    html = (src/f'{page}.html').read_text()
    html = html.replace('/*SHARED_CSS*/', css + GHL_RESET).replace('/*SHARED_JS*/', js)
    html = re.sub(r'\{\{img:([^}]+)\}\}', lambda m: LIVE[m.group(1)], html)
    (out/'dist'/f'{page}.ghl-embed.html').write_text(html)
    print(page, 'ghl-embed', f'{len(html)/1024:.0f} KB')

# ---- GitHub Pages: copy the standalone documents into docs/ ----
(out/'docs').mkdir(exist_ok=True)
for page in PAGES:
    (out/'docs'/f'{page}.html').write_text((out/'dist'/f'{page}.html').read_text())
print('docs/ updated')
