"""Check generated pages, local assets, links, fragments and source coverage."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import csv
import json
import re
import sys

DIST = Path(__file__).resolve().parent / 'dist'


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.h1 = path, set(), [], 0
        self.base = ''
        self.duplicates = []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == 'html':
            self.base = attrs.get('data-base', '').rstrip('/')
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        self.h1 += tag == 'h1'
        for attr in ('href', 'src', 'data-image'):
            if attrs.get(attr):
                self.links.append(attrs[attr])


def main():
    pages = {p.resolve(): Page(p) for p in DIST.rglob('*.html')}
    errors, links = [], 0
    for path, page in pages.items():
        if page.h1 != 1:
            errors.append(f'{path}: expected 1 h1, got {page.h1}')
        if page.duplicates:
            errors.append(f'{path}: duplicate IDs {page.duplicates}')
        if 'Content coming soon' in path.read_text(encoding='utf-8'):
            errors.append(f'{path}: placeholder content')
        for link in page.links:
            u = urlsplit(link)
            if u.scheme or u.netloc:
                continue
            links += 1
            local = unquote(u.path)
            if page.base and local.startswith('/'):
                if local != page.base and not local.startswith(page.base + '/'):
                    errors.append(f'{path.relative_to(DIST)}: link outside site base {link}')
                    continue
                local = local[len(page.base):] or '/'
            target = (DIST / local.lstrip('/')) if local.startswith('/') else (path.parent / local)
            if not local:
                target = path
            if target.is_dir():
                target /= 'index.html'
            target = target.resolve()
            if not target.is_relative_to(DIST.resolve()) or not target.is_file():
                errors.append(f'{path.relative_to(DIST)}: missing {link}')
            elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
                errors.append(f'{path.relative_to(DIST)}: missing fragment {link}')
    for css in (DIST/'static/css').glob('*.css'):
        for src in re.findall(r'url\([\'"]?([^\)\'\"]+)',css.read_text(encoding='utf-8')):
            if not (css.parent/src).resolve().is_file():
                errors.append(f'Missing font or CSS asset: {src}')
    search = json.loads((DIST/'search-index.json').read_text(encoding='utf-8'))
    for item in search:
        target = DIST/item['route'].strip('/')/'index.html'
        if not target.is_file():
            errors.append(f'Search links to missing page: {item["route"]}')
    for name in ('journal','conference'):
        source = DIST.parent/'data'/f'{name}.csv'
        with source.open(encoding='utf-8-sig',newline='') as f:
            expected = len(list(csv.DictReader(f)))
        page = (DIST/'publication'/name/'index.html').read_text(encoding='utf-8')
        actual = len(re.findall(r'<li>',page))
        if actual != expected:
            errors.append(f'{name}: {actual} rendered, {expected} source rows')
    if errors:
        print('\n'.join(errors)); sys.exit(1)
    print(f'PASS: {len(pages)} HTML files, {links} local links/assets, {len(search)} searchable pages.')
    print('PASS: complete journal/conference source coverage, unique IDs, page headings and CSS assets.')


if __name__ == '__main__':
    main()
