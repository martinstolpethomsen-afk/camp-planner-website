"""Verify approved launch copy without sending forms or publishing."""
import json
from pathlib import Path
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
c=json.loads((root/'content/launch.json').read_text(encoding='utf-8'))
assert c['launchDate']=='2026-11-01'
assert c['commercialDecision']['freeAccessThrough']=='2026-12-31'
assert c['commercialDecision']['support']=='limited'
assert c['commercialDecision']['packages']==['Core','Pro','Premium']
assert c['commercialDecision']['separateAddOn']=='Competition'
for lang,t in c['locales'].items():
 path=root/('index.html' if lang=='en' else lang+'/index.html')
 soup=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
 text=soup.select_one('#pricing').get_text(' ',strip=True)
 assert t['support'] in text,(lang,'missing free period/support')
 assert t['planNote'] in text,(lang,'missing separate add-on statement')
 assert all(name in text for name in ['Core','Pro','Premium']),lang
 assert not any(old in text for old in ['€2','2 €','Launch Plan','Enterprise','Federation']),lang
print('Approved launch decision verified on all five generated homepages.')
