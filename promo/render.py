"""Render promo.html to PNG frames, then to MP4 with soundtrack.
Usage: python render.py [--preview t1,t2,...] [--fps 30] [--chromium PATH]"""
import argparse, os, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--preview', default='')
ap.add_argument('--fps', type=int, default=30)
ap.add_argument('--dur', type=float, default=15.0)
ap.add_argument('--chromium', default=os.environ.get('CHROMIUM_PATH', ''))
ap.add_argument('--out', default='out')
a = ap.parse_args()

here = pathlib.Path(__file__).resolve().parent
out = here / a.out
(out / 'frames').mkdir(parents=True, exist_ok=True)
url = (here / 'promo.html').as_uri()

with sync_playwright() as p:
    kw = {'executable_path': a.chromium} if a.chromium else {}
    b = p.chromium.launch(args=['--allow-file-access-from-files'], **kw)
    pg = b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    pg.goto(url)
    pg.evaluate('document.fonts.ready')
    pg.wait_for_timeout(400)
    if a.preview:
        for t in a.preview.split(','):
            pg.evaluate(f'render({float(t)})')
            pg.screenshot(path=str(out / f'prev_{t}.png'))
        b.close(); sys.exit(0)
    n = int(a.dur * a.fps)
    for i in range(n):
        pg.evaluate(f'render({i / a.fps})')
        pg.screenshot(path=str(out / 'frames' / f'{i:04d}.png'))
    b.close()

subprocess.run([sys.executable, str(here / 'music.py'), str(out / 'music.wav'), str(a.dur)], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(a.fps), '-i', str(out / 'frames' / '%04d.png'),
                '-i', str(out / 'music.wav'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(out / 'makwad-promo.mp4')], check=True)
print('done', out / 'makwad-promo.mp4')
