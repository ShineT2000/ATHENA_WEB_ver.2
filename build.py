"""Build ATHENA ver.CTRP with Python 3.11+, without third-party dependencies."""
from pathlib import Path
from html import escape as esc
from string import Template
import csv
import hashlib
import json
import os
import re
import shutil
import tomllib
import content

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
BASE = os.environ.get('SITE_BASE', '').rstrip('/')
SITE = tomllib.loads((ROOT / 'data/site.toml').read_text(encoding='utf-8'))
NEWS = tomllib.loads((ROOT / 'data/news.toml').read_text(encoding='utf-8'))['news']

FIELDS = [
    ('reactor-design', 'Reactor Design', 'SMR · MSR · Natural circulation', '차세대 원자로 설계', 'Conceptual design, helium-bubble lift and coupled thermal-hydraulic analysis of advanced reactors.', 'reactor-design-pmfr-1.png'),
    ('safety-analysis', 'Safety Analysis', 'Passive safety · Heat transfer', '실험과 해석을 통한 안전성 평가', 'Experimental validation of passive cooling systems and thermal-hydraulic safety performance.', 'safety-analysis-mcv-3.png'),
    ('severe-accident', 'Severe Accident', 'MELCOR · MAAP · CINEMA', '중대사고 해석과 대응 전략', 'Accident progression, source terms, hydrogen risk and mitigation strategies for nuclear systems.', 'severe-accident-integrated-1.png'),
    ('ai-for-nuclear-safety', 'AI for Nuclear Safety', 'Surrogate models · Trustworthy AI', '원자력 안전을 위한 인공지능', 'Data-driven accident diagnosis, progression prediction and decision support for operators.', 'ai-for-nuclear-safety-prediction-1.png'),
]
MENU = [
    ('Home', '/', []),
    ('People', '/people/', [(p['title'], p['url'] + '/') for p in SITE['page'] if p['type'] in ('people', 'alumni')]),
    ('Research', '/research/', [(f[1], '/research/' + f[0] + '/') for f in FIELDS] + [('Research History', '/about/')]),
    ('Publications', '/publication/', [('Journal', '/publication/journal/'), ('Conference', '/publication/conference/'), ('Awards', '/publication/award/')]),
    ('News', '/news/', [('All News', '/news/'), ('Projects', '/news/project/'), ('Events', '/news/event/'), ('Gallery', '/news/gallery/')]),
    ('Contact', '/contact-us/', []),
]


def read_csv(name):
    with (ROOT / 'data' / name).open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def people_count(name):
    d = tomllib.loads((ROOT / f'data/people/{name}.toml').read_text(encoding='utf-8'))
    return sum(len(g['people']) for g in content.groups_of(d))


def arrow():
    return '<span aria-hidden="true">↗</span>'


def nav(current):
    out = []
    for title, url, children in MENU:
        selected = current == url or (url != '/' and current.startswith(url))
        attrs = ' aria-current="page"' if selected else ''
        links = ''.join(f'<a href="{u}"' + (' aria-current="page"' if current == u else '') + f'>{esc(t)}</a>' for t, u in children)
        dropdown = f'<button class="nav-toggle" aria-expanded="false" aria-label="Open {title} submenu"><span aria-hidden="true">⌄</span></button><div class="nav-dropdown">{links}</div>' if children else ''
        out.append(f'<div class="nav-item"><a class="nav-link" href="{url}"{attrs}>{title}</a>{dropdown}</div>')
    return ''.join(out)


def research_cards():
    cards = []
    for i, (slug, title, tags, ko, desc, photo) in enumerate(FIELDS, 1):
        cards.append(f'<a class="research-card" href="/research/{slug}/"><div class="research-image"><img src="/static/img/research/{photo}" alt="{esc(title)} research diagram" loading="lazy"><span class="card-index">0{i}</span></div><div class="research-copy"><p class="small-label">{esc(tags)}</p><h3>{title} {arrow()}</h3><p>{desc}</p><span class="ko">{ko}</span></div></a>')
    return '<div class="research-grid">' + ''.join(cards) + '</div>'


def news_cards(limit=None):
    items = NEWS[:limit] if limit else NEWS
    out = []
    for i, n in enumerate(items):
        image = f'<img src="/static/img/news/{esc(n["photo"])}" alt="{esc(n["title"])}" loading="lazy">' if n.get('photo') else '<div class="news-placeholder"><span>ATHENA</span><small>LABORATORY NEWS</small></div>'
        excerpt = content.plain_text(' '.join(n.get('body', [])))
        out.append(f'<a class="news-card" href="/news/#news-{i}"><div class="news-image">{image}</div><div class="news-copy"><time>{esc(n["date"])}</time><h3>{esc(n["title"])} {arrow()}</h3><p>{esc(excerpt[:160])}{"…" if len(excerpt)>160 else ""}</p></div></a>')
    return '<div class="news-grid">' + ''.join(out) + '</div>'


def timeline():
    return '''<div class="timeline">
      <article><span>2011</span><h3>The beginning</h3><p>ATHENA is established at Hanyang University. Research begins in boiling heat transfer, thermal-hydraulics and reactor safety.</p></article>
      <article><span>2016–2021</span><h3>Passive safety &amp; SMRs</h3><p>Natural-circulation SMR concepts, passive cooling and severe accident analysis become central research directions.</p></article>
      <article><span>2021–2026</span><h3>Molten salt &amp; multi-physics</h3><p>i-SAFE-MSR research expands into PMFR design, helium bubbling, fission product removal and coupled simulation.</p></article>
      <article><span>2026 &amp; beyond</span><h3>The next phase</h3><p>Advanced reactor development, maritime SMRs and AI for accident prediction and nuclear safety regulation.</p></article>
    </div>'''


def home():
    counts = [(people_count('research-professors'), 'Research Professors', '/people/research-professors/'), (people_count('graduate-students'), 'Graduate Students', '/people/graduate-students/'), (people_count('undergraduate-students'), 'Undergraduate Student', '/people/undergraduate-students/'), (people_count('alumni'), 'Alumni', '/people/alumni/')]
    people = ''.join(f'<a href="{u}"><strong>{n:02d}</strong><span>{t}</span>{arrow()}</a>' for n, t, u in counts)
    pubs = ''.join(f'<a href="{u}"><strong>{len(read_csv(f))}</strong><span>{t}</span>{arrow()}</a>' for f, t, u in [('journal.csv','Journal Articles','/publication/journal/'), ('conference.csv','Conference Papers','/publication/conference/'), ('awards.csv','Awards','/publication/award/')])
    return f'''<section class="hero" aria-labelledby="hero-title"><div class="hero-inner wrap">
      <div class="hero-copy"><p class="eyebrow"><span></span> HANYANG UNIVERSITY · NUCLEAR ENGINEERING</p>
      <h1 id="hero-title">Welcome to<br><em>ATHENA Lab.</em></h1>
      <p class="hero-fullname">Advanced Thermal Hydraulic Engineering<br>for Nuclear Application Laboratory</p>
      <p class="hero-description">We combine thermal-hydraulic experiments and numerical analysis to develop advanced reactors and improve nuclear safety.</p>
      <p class="hero-korean" lang="ko">한양대학교 원자력 열수력 연구실에 오신 것을 환영합니다.<br>실험과 전산 해석으로 차세대 원자로의 안전을 연구합니다.</p>
      <div class="hero-actions"><a class="button primary" href="/research/">Explore our research <span>↗</span></a><a class="text-link light" href="/people/principal-investigator/">Meet Prof. Sung Joong Kim <span>→</span></a></div>
      </div>
      <div class="hero-visual"><div class="visual-heading"><span class="small-label">NATURAL CIRCULATION</span><div class="reactor-switch" role="group" aria-label="Reactor concept"><button data-reactor="smr" aria-pressed="true">SMR</button><button data-reactor="msr" aria-pressed="false">MSR</button></div></div>
      <canvas id="reactor-canvas" width="640" height="530" role="img" aria-label="Illustrative natural circulation loop: heat rises from the reactor core and is removed at a heat exchanger."></canvas>
      <div class="visual-caption"><span><i class="hot"></i> Heat source</span><span><i class="cold"></i> Heat removal</span><button id="motion-toggle" aria-pressed="false">Pause animation</button></div>
      <p id="reactor-description">SMR · Passive heat removal by natural circulation</p><span class="concept-note">Conceptual illustration</span></div>
      <div class="hero-bottom"><span><b>2011 — 2026</b> &nbsp; 15 years of ATHENA</span><a href="#research">Discover the laboratory <span>↓</span></a></div>
    </div></section>
    <section class="section wrap" id="research"><div class="section-heading"><div><p class="eyebrow">WHAT WE DO</p><h2>Research Fields</h2></div><a class="text-link" href="/research/">All research {arrow()}</a></div>{research_cards()}</section>
    <section class="community-section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">THE PEOPLE &amp; THE WORK</p><h2>A community of researchers.</h2></div><a class="text-link" href="/people/">Meet our people {arrow()}</a></div><div class="people-stats">{people}</div><div class="publication-strip"><div><p class="eyebrow">RESEARCH OUTPUT</p><h3>From ideas to evidence.</h3><small>Publication and people counts from the ATHENA repository.</small></div><div class="pub-stats">{pubs}</div></div></div></section>
    <section class="section wrap"><div class="section-heading"><div><p class="eyebrow">FROM THE LAB</p><h2>Latest News</h2></div><a class="text-link" href="/news/">All news {arrow()}</a></div>{news_cards(3)}</section>
    <section class="history-section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">OUR RESEARCH HISTORY</p><h2>15 years. Still moving forward.</h2></div><a class="text-link light" href="/about/">Our story {arrow()}</a></div>{timeline()}<p class="source-note">Research history based on the ATHENA Lab. introduction, September 30, 2026.</p></div></section>
    <section class="section wrap"><div class="join-layout"><div><p class="eyebrow">BUILD YOUR NEXT CHAPTER</p><h2>Join ATHENA.</h2><p>We welcome motivated undergraduate and graduate students interested in SMRs, MSRs, nuclear safety and advanced numerical simulation.</p><p class="ko" lang="ko">차세대 원자력 기술을 함께 연구할 학생을 기다립니다.<br>학부생을 위한 ATHENA 인턴십 프로그램도 운영합니다.</p><a class="button dark" href="mailto:sungjkim@hanyang.ac.kr">Get in touch {arrow()}</a></div><div class="contact-panel"><span class="small-label">VISIT &amp; CONTACT</span><h3>Hanyang University<br>International Building, Room 402</h3><p>222 Wangsimni-ro, Seongdong-gu<br>Seoul 04763, Republic of Korea</p><a href="mailto:sungjkim@hanyang.ac.kr">sungjkim@hanyang.ac.kr {arrow()}</a><a href="tel:+82222204667">+82-2-2220-4667</a><a class="contact-directions" href="/contact-us/">Location &amp; directions →</a></div></div></section>'''


def hub(page):
    route = page['url']
    if route == '/research':
        return '<p class="page-lead">Experiments and numerical methods for safer nuclear systems.</p>' + research_cards() + '<div class="callout"><h2>Experimental &amp; numerical</h2><p>Our work connects two-phase heat transfer experiments, CFD, system codes and machine learning. Explore the development of these research directions over 15 years.</p><a class="text-link" href="/about/">Research history →</a></div>'
    if route == '/news':
        articles = []
        for i, n in enumerate(NEWS):
            pic = f'<img src="/static/img/news/{esc(n["photo"])}" alt="{esc(n["title"])}" loading="lazy">' if n.get('photo') else ''
            body = ''.join('<p>' + content.format_citation(p) + '</p>' for p in n.get('body', []))
            articles.append(f'<article class="news-entry" id="news-{i}"><time>{esc(n["date"])}</time><h2>{esc(n["title"])}</h2>{pic}{body}</article>')
        return '<p class="page-lead">Conferences, achievements and updates from ATHENA.</p>' + ''.join(articles)
    entry = next(m for m in MENU if m[1].rstrip('/') == route)
    cards = []
    for i, (title, url) in enumerate(entry[2], 1):
        description = ''
        if route == '/people':
            slug = url.strip('/').split('/')[-1]
            description = f'{people_count(slug)} members' if slug != 'alumni' else f'{people_count(slug)} graduates'
        elif route == '/publication':
            file = {'Journal':'journal.csv','Conference':'conference.csv','Awards':'awards.csv'}[title]
            description = f'{len(read_csv(file))} entries'
        cards.append(f'<a class="hub-card" href="{url}"><span class="small-label">{i:02}</span><h2>{title} {arrow()}</h2><p>{description}</p></a>')
    return '<div class="hub-grid">' + ''.join(cards) + '</div>'


def gallery():
    data = [
        ('kns-spring.jpeg','Korean Nuclear Society Spring Meeting','Conference presentations and participation'),
        ('melcor-training.jpeg','MELCOR Training','Learning tools for severe accident analysis'),
        ('nureth-21.jpeg','NURETH-21','International exchange in nuclear thermal-hydraulics'),
        ('severe-accident-workshop.jpeg','Severe Accident Workshop','Technical workshops and collaboration'),
        ('isafe-conference.jpeg','The 4th i-SAFE-MSR Conference','Bringing the MSR research community together'),
        ('source-term-workshop.jpeg','International Source Term Workshop','LWR and non-LWR source term research'),
        ('lab-dinner.jpg','Life beyond the laboratory','Group dinner'),
        ('team-outing.jpg','Time together','ATHENA team outing'),
    ]
    return '<p class="page-lead">Research brings us together. A look at conferences, workshops and everyday life at ATHENA.</p><div class="gallery-grid">' + ''.join(f'<figure><button class="gallery-open" data-image="/static/img/lab-life/{photo}" data-caption="{esc(title)}" aria-label="Enlarge: {esc(title)}"><img src="/static/img/lab-life/{photo}" alt="{esc(title)}" loading="lazy"><span aria-hidden="true">↗</span></button><figcaption><h2>{title}</h2><p>{caption}</p></figcaption></figure>' for photo, title, caption in data) + '</div><p class="source-note">Photographs from the supplied ATHENA Lab. introduction, September 30, 2026, slide 20.</p>'


def projects():
    return '''<p class="page-lead">Research programs connecting advanced reactor design, experiments and computation.</p>
    <article class="project-entry"><span class="eyebrow">2024.03 — 2029.12</span><h2>HPC-based Nuclear Multi-physics Research</h2><p>High-Performance Computing-Based Next-Generation Nuclear Power Multi-Physics Analysis Innovation Research Center.</p><p>Research team: ATHENA, Hanyang University, KAIST, Hyundai Engineering &amp; Construction Co., Ltd.</p><a class="text-link" href="/research/reactor-design/#multiphysics">Explore multi-physics research →</a></article>
    <article class="project-entry"><span class="eyebrow">2021.04 — 2026.12</span><h2>i-SAFE-MSR Research</h2><p>Thermal-hydraulic design and safety of the Passive Molten Salt Fast Reactor (PMFR). Research covers natural circulation, fission product behavior, helium bubbling and passive safety concepts.</p><p>Research team: ATHENA, Hanyang University, KAIST, Gachon University.</p><a class="text-link" href="/research/reactor-design/#pmfr">Explore PMFR research →</a></article>
    <article class="project-entry"><span class="eyebrow">RESEARCH DIRECTION · SEPTEMBER 2026</span><h2>Maritime Molten Salt Reactor Safety</h2><p>Research on the MARS-100 concept, marine motion effects, freeze-valve behavior, and spreading and solidification of spilled molten salt.</p><a class="text-link" href="/research/severe-accident/">Explore safety research →</a></article>
    <p class="source-note">Project periods and teams: ATHENA repository news. Maritime research: supplied presentation, slides 16–17.</p>'''


def contact_page():
    return '''<div class="contact-page-grid"><div><p class="eyebrow">HANYANG UNIVERSITY · SEOUL</p><h2>Let's talk research.</h2><p>For research inquiries, graduate admissions or the ATHENA undergraduate internship, contact Prof. Sung Joong Kim.</p><dl class="contact-details"><dt>EMAIL</dt><dd><a href="mailto:sungjkim@hanyang.ac.kr">sungjkim@hanyang.ac.kr ↗</a></dd><dt>TELEPHONE</dt><dd><a href="tel:+82222204667">+82-2-2220-4667</a></dd><dt>LABORATORY</dt><dd>International Building, Room 402<br>222 Wangsimni-ro, Seongdong-gu<br>Seoul 04763, Republic of Korea</dd></dl><p lang="ko" class="ko">서울특별시 성동구 왕십리로 222<br>한양대학교 국제관 402호</p><a class="button dark" href="https://www.google.com/maps/search/?api=1&amp;query=Hanyang+University+International+Building+Seoul" target="_blank" rel="noopener">Open map ↗</a></div><div class="location-card"><span class="location-pin" aria-hidden="true">◎</span><span class="eyebrow">ATHENA LABORATORY</span><h3>International<br>Building <em>402</em></h3><p>Hanyang University<br>Seoul Campus</p><a class="text-link" href="https://www.hanyang.ac.kr/" target="_blank" rel="noopener">University website ↗</a></div></div><div class="callout"><h2>Join us</h2><p>We are looking for highly motivated students with an interest in small modular reactors, molten salt reactors, nuclear safety and advanced numerical simulations. Undergraduate students are welcome to participate in the ATHENA internship program.</p><a class="text-link" href="mailto:sungjkim@hanyang.ac.kr">Contact Prof. Sung Joong Kim →</a></div>'''


def tools(kind):
    placeholder = 'Search by title, author or year' if kind == 'publications' else 'Search by name or research interest'
    more = '<button id="expand-years" class="button subtle">Expand all years</button>' if kind == 'publications' else ''
    return f'<div class="filter-bar"><label class="filter-field"><span class="sr-only">Filter page content</span><input id="content-filter" type="search" placeholder="{placeholder}"><span aria-hidden="true">⌕</span></label>{more}<span id="filter-count" aria-live="polite"></span></div><p id="filter-empty" hidden>No matching results. Try another search.</p>'


def side_links(route):
    entry = next((m for m in MENU if m[1] != '/' and route.startswith(m[1])), None)
    if route == '/about/':
        entry = MENU[2]
    if not entry or not entry[2]:
        return ''
    return '<aside class="section-nav"><span class="small-label">' + entry[0].upper() + '</span>' + ''.join(f'<a href="{u}"' + (' aria-current="page"' if route == u else '') + f'>{esc(t)} <span>↗</span></a>' for t,u in entry[2]) + '</aside>'


def main():
    DIST.mkdir(exist_ok=True)
    shutil.copytree(ROOT / 'static', DIST / 'static', dirs_exist_ok=True)
    template = Template((ROOT / 'templates/base.html').read_text(encoding='utf-8'))
    pages = [*SITE['page'], {'url':'/about','title':'Research History','type':'history'}]
    index = []
    css_hash = hashlib.sha256((ROOT / 'static/css/style.css').read_bytes()).hexdigest()[:10]
    for page in pages:
        route = page['url'] + '/'
        title = page['title'].title() if page['title'].isupper() else page['title']
        kind = page['type']
        if kind == 'home':
            title, route, body = 'Home', '/', home()
        else:
            if kind == 'hub':
                body = hub(page)
            elif kind == 'history':
                body = '<p class="page-lead">Experimental and numerical research in nuclear thermal-hydraulics since 2011.</p>' + timeline() + '<div class="callout"><h2>Experimental &amp; numerical</h2><p>From boiling and condensation heat transfer to SMR passive safety, PMFR multi-physics and AI-assisted accident management, ATHENA brings experimental evidence and computational analysis together.</p><a class="text-link" href="/research/">Explore our research →</a></div><p class="source-note">Adapted from the supplied September 30, 2026 ATHENA Lab. introduction, slides 2, 5–17. The timeline summarizes research phases, rather than individual project start dates.</p>'
            elif page['url'] == '/news/project':
                title, body = 'Projects', projects()
            elif page['url'] == '/news/event':
                title, body = 'Events', news_cards(2) + '<div class="callout"><h2>Conference participation &amp; workshops</h2><p>ATHENA researchers take part in KNS, NURETH and severe accident workshops, and organize international exchanges on molten salt reactors and source terms.</p><a class="text-link" href="/news/gallery/">View lab life →</a></div>'
            elif page['url'] == '/news/gallery':
                title, body = 'Gallery', gallery()
            elif page['url'] == '/contact-us':
                title, body = 'Contact Us', contact_page()
            else:
                body = content.RENDERERS[kind](page, SITE)['body']
                if kind in ('publications','people','alumni'):
                    body = tools(kind) + body
                if kind == 'publications':
                    body = f'<p class="page-lead">{len(read_csv(page["data"]))} entries. Browse by year or search the collection.</p>' + body
            section = next((m[0] for m in MENU if m[1] != '/' and route.startswith(m[1])), 'ATHENA LABORATORY')
            body = f'<section class="page-banner"><div class="wrap"><div class="breadcrumbs"><a href="/">Home</a><span>/</span><span>{esc(section)}</span></div><p class="eyebrow">ATHENA LABORATORY</p><h1>{esc(title)}</h1></div></section><div class="wrap content-layout">{side_links(route)}<div class="page-content" data-content-kind="{kind}">{body}</div></div>'
        sitemap = ''.join(f'<div><a href="{url}">{t}</a>' + ''.join(f'<a href="{u}">{esc(n)}</a>' for n,u in children) + '</div>' for t,url,children in MENU)
        doc = template.substitute(title=esc(title), description=esc(SITE['description']), nav=nav(route), body=body, version=css_hash, sitemap=sitemap)
        if BASE:
            doc = re.sub(r'((?:href|src|data-image)=")/(?!/)', rf'\g<1>{BASE}/', doc)
        doc = doc.replace('data-base=""', f'data-base="{esc(BASE)}"')
        target = DIST / page.get('output', (page['url'].strip('/') + '/index.html'))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(doc, encoding='utf-8')
        if kind == 'home':
            (DIST/'index.html').write_text(doc, encoding='utf-8')
        if page['url'] != '/404':
            parser = content.TextOnly(); parser.feed(body)
            index.append({'route':route,'title':title,'text':' '.join(parser.parts)})
        print(f'Built {route}')
    (DIST/'search-index.json').write_text(json.dumps(index, ensure_ascii=False), encoding='utf-8')
    print(f'Completed: {len(pages)} pages, {DIST}')


if __name__ == '__main__':
    main()
