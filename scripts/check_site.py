"""Check every static page and internal anchor without submitting external forms."""
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
import re,json,sys
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
pages={p.relative_to(ROOT).as_posix():BeautifulSoup(p.read_text(),'html5lib') for p in ROOT.rglob('*.html')}
errors=[]; links=0
config=json.loads((ROOT/'content/launch.json').read_text())
for file,soup in pages.items():
    ids=[n['id'] for n in soup.select('[id]')]
    if len(ids)!=len(set(ids)): errors.append(f'{file}: duplicate IDs')
    text=soup.get_text(' ',strip=True)
    if re.search(r'October|oktober|preparing for its 2026 launch|getting ready for release|Watch in Action|Build CP058|Free plan|Start for free|Trusted by organizers worldwide|Join organizers around the world|That.s it — no more, no less',text,re.I): errors.append(f'{file}: stale public copy')
    for a in soup.select('a[href]'):
        links+=1
        href=a['href']
        if not href or href=='#': errors.append(f'{file}: empty link');continue
        url=urlsplit(urljoin('https://camp-planner.online/'+file,href))
        if url.scheme not in ['http','https'] or url.netloc!='camp-planner.online':continue
        dest=unquote(url.path).lstrip('/') or 'index.html'
        if dest.endswith('/'):dest+='index.html'
        if dest not in pages and (ROOT/dest).is_dir(): dest+='/index.html'
        if not (ROOT/dest).exists():errors.append(f'{file}: missing {href}');continue
        if url.fragment and dest in pages and not pages[dest].find(id=unquote(url.fragment)):
            errors.append(f'{file}: missing anchor {href}')
        if a.get_text(strip=True) in ['Pricing','Priser','Preise'] and href!='/index.html#pricing':errors.append(f'{file}: pricing destination')
    for n in soup.select('img[src], script[src], link[rel="stylesheet"], source[src]'):
        href=n.get('src',n.get('href','')); u=urlsplit(urljoin('https://camp-planner.online/'+file,href))
        if u.netloc=='camp-planner.online' and not (ROOT/unquote(u.path).lstrip('/')).exists():errors.append(f'{file}: missing asset {href}')
    if soup.select_one('.launch-bar'):
        lang=soup.html.get('lang','en');t=config['locales'].get(lang,config['locales']['en'])
        if t['label'] not in text or t['text'] not in text:errors.append(f'{file}: launch mismatch')
        if soup.select_one('meta[name="camp-planner-launch-date"]')['content']!=config['launchDate']:errors.append(f'{file}: metadata date')
    for node in soup.select('.feature-matrix td[data-feature], .cp-feature-status[data-feature]'):
        lang=soup.html.get('lang','en');t=config['locales'].get(lang,config['locales']['en'])
        expected=t[config['featureStatus'][node['data-feature']]['status']]
        if node.get_text(strip=True)!=expected:errors.append(f'{file}: inconsistent feature status')
print(json.dumps({'pages':len(pages),'links':links,'errors':errors},indent=2))
sys.exit(bool(errors))
