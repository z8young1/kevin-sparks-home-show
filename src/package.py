#!/usr/bin/env python3
"""Bundle everything the partner needs to put the pages on GoHighLevel.

Run src/build.py first. Produces kevin-sparks-ghl-package.zip in the repo root.
"""
import pathlib, re, shutil, zipfile

root = pathlib.Path(__file__).resolve().parent.parent
dist, stage = root / 'dist', root / '.package'
if stage.exists():
    shutil.rmtree(stage)
(stage / 'paste-into-ghl').mkdir(parents=True)
(stage / 'preview-in-browser').mkdir(parents=True)

FILES = [
    ('nashville-home-show',      '1-event-page'),
    ('post-nashville-home-show', '2-post-show-page'),
    ('thank-you',                '3-thank-you-page'),
]
for src_name, out_name in FILES:
    shutil.copy(dist / f'{src_name}.ghl-embed.html', stage / 'paste-into-ghl' / f'{out_name}.html')
    shutil.copy(dist / f'{src_name}.html',           stage / 'preview-in-browser' / f'{out_name}.html')

# The evergreen hot tub page is built in ~/kssp-hot-tubs and copied into hot-tubs/.
# See hot-tubs/SOURCE.md. It ships in the same zip so the partner has one download.
ht = root / 'hot-tubs'
missing = [f.name for f in (ht / 'hot-tubs.ghl-embed.html', ht / 'hot-tubs.html') if not f.exists()]
if missing:
    raise SystemExit(f'hot-tubs/ is missing {missing}. Rebuild in ~/kssp-hot-tubs and copy them in '
                     f'(see hot-tubs/SOURCE.md).')
shutil.copy(ht / 'hot-tubs.ghl-embed.html', stage / 'paste-into-ghl' / '4-hot-tubs-page.html')
shutil.copy(ht / 'hot-tubs.html',           stage / 'preview-in-browser' / '4-hot-tubs-page.html')

readme = (root / 'src' / 'DEPLOY.md').read_text()
(stage / 'READ-ME-FIRST.md').write_text(readme)

out = root / 'kevin-sparks-ghl-package.zip'
if out.exists():
    out.unlink()
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in sorted(stage.rglob('*')):
        if p.is_file():
            z.write(p, p.relative_to(stage))
shutil.rmtree(stage)

# Publish on GitHub Pages: the zip as a plain download link, and the hot tub page
# alongside the three that build.py already copies there.
docs = root / 'docs'
docs.mkdir(exist_ok=True)
shutil.copy(out, docs / out.name)
shutil.copy(ht / 'hot-tubs.html', docs / 'hot-tubs.html')

with zipfile.ZipFile(out) as z:
    for i in z.infolist():
        print(f'{i.file_size/1024:8.0f} KB  {i.filename}')
print(f'\n{out.name}  {out.stat().st_size/1024:.0f} KB')
print('download: https://z8young1.github.io/kevin-sparks-home-show/' + out.name)
