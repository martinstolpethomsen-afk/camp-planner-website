"""Render shared launch content into checked-in static HTML (no browser JS required).
Run after editing content/launch.json. Generated HTML remains deployable as-is.
"""
from pathlib import Path
import json
import re
from html import escape
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'content/launch.json').read_text())
LINKS = CONFIG['links']

def fragment(html):
    return BeautifulSoup(html, 'html.parser')

def replace_contents(node, html):
    node.clear()
    for child in list(fragment(html).contents):
        node.append(child)

def tag(soup, name, text, **attrs):
    el = soup.new_tag(name, attrs=attrs)
    el.string = text
    return el

def link(href, label, classes=''):
    return f'<a href="{href}" class="{classes}">{escape(label)}</a>'

def ctas(t):
    return link(LINKS['demo'],t['demo'],'btn btn-primary') + '\n' + link(LINKS['pilot'],t['pilot'],'btn btn-dark')

def feature_key(text):
    text = text.lower()
    for pattern,key in [(r'\bsso\b|single sign','sso'),(r'\bapi\b|integration','api'),(r'sms|push|commun|kommun','communications'),(r'badge','badges'),(r'check|waiver','checkPoint'),(r'accommodation|hotel|overnat|unterkunft|boende','accommodation'),(r'finance|outcome|report|rapport|feedback','reporting'),(r'live|mobile|mobil','liveBoard'),(r'regist|tilmeld|anmeld|påmeld','registration'),(r'schedul|program|zeitplan','scheduling'),(r'coach|instruct|people|team|volunt|trainer','people'),(r'area|venue|court|områd','venues')]:
        if re.search(pattern,text): return key
    return 'eventSetup'

def status_badge(soup,key,t):
    return tag(soup,'p',t[CONFIG['featureStatus'][key]['status']],**{'class':'cp-feature-status','data-feature':key})

for path in sorted(ROOT.rglob('*.html')):
    original = path.read_text()
    soup = BeautifulSoup(original.strip(), 'html5lib')
    header = soup.select_one('header.cp31-header')
    if not header:  # Redirect aliases have no duplicated public UI.
        for stamp in soup.select('.cp-build-stamp'): stamp.decompose()
        clean = re.sub(r'<div class="cp-build-stamp">.*?</div>', '', original, flags=re.S)
        if clean != original: path.write_text(clean)
        continue
    lang = soup.html.get('lang','en')
    lang = {'nb':'no','dk':'da'}.get(lang,lang)
    if lang not in CONFIG['locales']: lang='en'
    t = CONFIG['locales'][lang]
    rel = path.relative_to(ROOT).as_posix()
    home = '/index.html' if lang=='en' else f'/{lang}/'
    about = '/about-us.html' if lang=='en' else f'/{lang}/about-us.html'
    is_home = rel in ['index.html',*[f'{x}/index.html' for x in ['da','de','sv','no']]]
    is_legal = rel.startswith('legal/') or rel in ['data-privacy.html','404.html','login.html']
    # All public headers and footer navigation use the same localized source.
    nav_items = [('/platform.html','platform'),('/solutions.html','solutions'),(home+'#features','features'),(about,'about'),(LINKS['demo'],'demo'),(LINKS['pilot'],'program')]
    switches=[]
    for code in CONFIG['locales']:
        target = ('/about-us.html' if code=='en' else f'/{code}/about-us.html') if path.name=='about-us.html' else ('/index.html' if code=='en' else f'/{code}/')
        switches.append(link(target,code.upper(),'active' if code==lang else ''))
    replace_contents(header, f'<a class="cp31-brand" href="{home}" aria-label="Camp-Planner"><img class="cp31-logo" src="/assets/logos/logo-dark.png" alt="Camp-Planner"></a><nav class="cp31-nav" aria-label="{t["nav"]}">'+ '\n'.join(link(url,t[key],'cp31-link') for url,key in nav_items)+'<span class="cp047-lang-switch">'+' '.join(switches)+'</span>'+link(LINKS['app'],t['login'],'cp31-link cp31-login')+'</nav>')
    for nav in soup.select('footer nav'):
        replace_contents(nav,'\n'.join(link(url,t[key]) for url,key in [('/platform.html','platform'),('/solutions.html','solutions'),(LINKS['pricing'],'pricing'),(about,'about'),(LINKS['demo'],'demo'),(LINKS['pilot'],'program'),('/legal/','legal'),('/data-privacy.html','data'),('/legal/privacy-policy.html','privacy'),('/legal/cookie-policy.html','cookies'),(LINKS['app'],'login')]))
    for node in soup.select('.cp-build-stamp'): node.decompose()
    # Banner is server-rendered on all marketing pages, including sports pages.
    bar = soup.select_one('.launch-bar')
    if not bar and not is_legal:
        bar = soup.new_tag('div',attrs={'class':'launch-bar'})
        header.insert_after(bar)
    if bar:
        replace_contents(bar,f'<div class="launch-bar-inner"><span>{t["label"]}</span><strong>{t["text"]}</strong>{link(LINKS["pilot"],t["pilot"])}</div>')
    # Localized strings also support shared consent/skip-link behaviour.
    ui = soup.select_one('#cp-site-copy')
    if not ui:
        ui=soup.new_tag('script',attrs={'id':'cp-site-copy','type':'application/json'})
        soup.head.append(ui)
    ui.string=json.dumps({k:t[k] for k in ['skip','privacy','cookies','cookieSettings','consentTitle','consent','policy','decline','allow']},ensure_ascii=False)
    date = soup.select_one('meta[name="camp-planner-launch-date"]')
    if not date:
        date=soup.new_tag('meta',attrs={'name':'camp-planner-launch-date'})
        soup.head.append(date)
    date['content']=CONFIG['launchDate']
    for meta in soup.select('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]'):
        old = meta.get('content','')
        old = re.sub(r'\s*(LAUNCHING|LANCERES|START AM|LANSERAS|LANSERES).*2026\.?$', '',old)
        if not is_legal: meta['content']=old.rstrip()+' '+t['label']+'.'
    for data in soup.select('script[type="application/ld+json"]'):
        obj=json.loads(data.string)
        if obj.get('@type')=='SoftwareApplication':
            # A planned launch date is not a claim that software was released.
            obj['description']='Planned sports-event management platform. '+t['label']+'. '+t['status']
            data.string=json.dumps(obj,ensure_ascii=False,separators=(',',':'))
    # Normalize competing conversion links while retaining informational links.
    for a in soup.select('a[href]'):
        href=a['href']; text=a.get_text(' ',strip=True)
        if re.search(r'Explore the Platform',text,re.I):
            a['href']='/platform.html'; a.string='Explore the Platform →'; continue
        if re.search(r'Watch in Action',text,re.I):
            a.string=t['see']; a['href']='#chaos-to-control'; continue
        if re.fullmatch(r'Pricing|Priser|Preise',text,re.I):
            a['href']=LINKS['pricing']; a.string=t['pricing']; continue
        if re.search(r'Start for free|Stay tuned',text,re.I):
            a['href']=LINKS['pilot']; a.string=t['pilot']; continue
        if 'book-demo' in href:
            a['href']=LINKS['demo']; a.string=t['demo']
        elif 'pilot-program' in href and not a.find_parent('nav'):
            a['href']=LINKS['pilot']; a.string=t['pilot']
        elif href.rstrip('/')=='https://camp-planner.dk':
            a.string=t['login']; a['href']=LINKS['app']
        elif href in ['#sports','#newsletter','index.html#newsletter','/index.html#newsletter']:
            a['href']=('/solutions.html' if href=='#sports' else LINKS['pilot'])
            if href!='#sports': a.string=t['pilot']
    for node in soup.find_all(string=True):
        if node.parent.name in ['script','style']: continue
        value=str(node)
        value=re.sub(r'Launching this October|Lanceres til oktober|Start im Oktober|Launch im Oktober|Lanseras i oktober|Lanseres i oktober',t['label'],value,flags=re.I)
        value=re.sub(r'Camp-Planner is (?:preparing for its 2026 launch|getting ready for release)\.',t['text'],value,flags=re.I)
        value=value.replace('Trusted by organizers worldwide',t['trust']).replace('Join organizers around the world who use Camp-Planner to plan, manage and deliver unforgettable sports events.',t['experience'])
        value=value.replace('Ready to launch?','Explore Camp-Planner').replace('Ready for launch','Explore Camp-Planner')
        value=value.replace('Everything updates instantly.','A connected event workflow.').replace('When the plan changes, everyone sees it instantly.','A shared view when plans change.')
        value=value.replace('Reduce planning from weeks to hours.','Spend less time coordinating event details.')
        value=value.replace('The Free plan','The Launch Plan').replace('Free plan','Launch Plan')
        if value!=str(node): node.replace_with(value)
    # Every visible demo dashboard carries a label independent of its image.
    for preview in soup.select('.hero-product, .platform-system-card, .module-preview, .cp048-local-product'):
        if not preview.select_one('.cp-demo-label'):
            preview.insert(0,tag(soup,'p',t['example'],**{'class':'cp-demo-label'}))
    for img in soup.select('img[src*="dashboard-mockup"]'):
        if not img.parent.select_one('.cp-demo-label'):
            img.insert_before(tag(soup,'p',t['example'],**{'class':'cp-demo-label'}))
    # Prominent context plus labels directly on each feature card; none is sold
    # as included/launch-ready without recorded production evidence.
    if not is_legal and path.name not in ['about-us.html','about-image-test.html','about.html']:
        notice=soup.select_one('.cp-product-status')
        if not notice:
            notice=soup.new_tag('aside',attrs={'class':'cp-product-status'})
            first=soup.main.find('section')
            if first: first.insert_after(notice)
            else: soup.main.append(notice)
        replace_contents(notice,f'<strong>{t["statusTitle"]}</strong><p>{t["status"]}</p>')
    selectors='.feature-card, .workflow-card, .module-item, .cp26-step, .cp037-pillar-grid article, .cp037-flow-steps article, .platform-extra-flow article, .cp048-local-flow-steps article'
    for card in soup.select(selectors):
        existing=card.select_one('.cp-feature-status')
        key=existing.get('data-feature') if existing else feature_key(card.get_text(' ',strip=True))
        if card.select_one('img[src*="coach"]'): key='people'
        if existing: existing.decompose()
        card.append(status_badge(soup,key,t))
    for card in soup.select('.feature-card'):
        badge=card.select_one('[data-feature="communications"]')
        if badge:
            description=card.find('p')
            email, push = {'en':('Email','push notifications'),'da':('E-mail','pushbeskeder'),'de':('E-Mail','Push-Nachrichten'),'sv':('E-post','pushnotiser'),'no':('E-post','pushvarsler')}[lang]
            description.string=f'{email}. SMS: {t[CONFIG["featureStatus"]["sms"]["status"]]}. {push}: {t[CONFIG["featureStatus"]["push"]["status"]]}.'
    for node in soup.select('.cp-feature-status[data-feature]'):
        node.string=t[CONFIG['featureStatus'][node['data-feature']]['status']]
    for story in soup.select('.platform-copy, .platform-modules .section-head, .platform-hero-copy, .cp26-workflow-copy, .cp037-flow-copy, .platform-hero ~ section .story'):
        if not story.select_one('.cp-feature-status'): story.append(status_badge(soup,'instantUpdates',t))
    if is_home:
        trust=soup.select_one('.trusted > p')
        if trust: trust.string=t['trust']
        hero=soup.select_one('.hero-ctas')
        if hero:
            replace_contents(hero,ctas(t)+link('#chaos-to-control',t['see'],'cp-text-link'))
        # Preserve newsletter form ID/consent, but present it as the same pilot
        # application already used by the pilot page (verified matching form ID).
        for p in soup.select('#newsletter .cp046-launch-copy, #newsletter.cp048-local-cta > div'):
            replace_contents(p,f'<p class="eyebrow red">{t["label"]}</p><h2>{t["pilot"]}</h2><p>{t["text"]}</p>'+link(LINKS['pilot'],t['pilot'],'btn btn-dark'))
        for h in soup.select('#newsletter .hubspot-card h3'): h.string=t['pilot']
        # Replace existing workflow, keeping its target ID and established style.
        flow=soup.select_one('.cp26-workflow-section, .cp048-local-flow')
        if flow:
            flow['id']='workflow'
            flow['class']='section cp26-workflow-section'.split()
            steps=''.join(f'<article class="cp26-step"><span>0{i+1}</span><h3>{title}</h3><p>{desc}</p><p class="cp-feature-status" data-feature="{key}">{t[CONFIG["featureStatus"][key]["status"]]}</p></article>' for i,((title,desc),key) in enumerate(zip(t['steps'],['eventSetup','scheduling','checkPoint'])))
            replace_contents(flow,f'<div class="cp26-workflow-wrap"><div class="cp26-workflow-copy"><p class="eyebrow red">{t["how"]}</p><h2>{t["how"]}</h2><p>{t["status"]}</p></div><div class="cp26-workflow-grid cp-launch-steps">{steps}</div></div>')
        pricing=soup.select_one('#pricing')
        if not pricing:
            pricing=soup.new_tag('section',attrs={'id':'pricing','class':'pricing-preview'})
            soup.select_one('#newsletter').insert_before(pricing)
        inner=pricing.select_one('.pricing-inner')
        if not inner:
            inner=soup.new_tag('div',attrs={'class':'pricing-inner'})
            pricing.insert(0,inner)
        replace_contents(inner,f'<p class="eyebrow">Launch Plan</p><h2>{t["priceHeadline"]}</h2><div class="launch-price" aria-label="{t["price"]}"><span class="launch-price-currency">€</span><strong>2<sup>*</sup></strong><span class="launch-price-unit">{escape(t["price"].replace("€2* ","").replace("2 €* ",""))}</span></div><p class="pricing-promise">{t["support"]}</p><div class="pricing-actions">{ctas(t)}</div><small class="pricing-note">{t["footnote"]}</small><p class="matrix-disclaimer">{t["planNote"]}</p>')
        for matrix in soup.select('.feature-matrix'):
            for row in matrix.select('tbody tr:not(.matrix-group)'):
                for i,cell in enumerate(row.select('td')):
                    if cell.get_text(strip=True)=='—': continue
                    key=feature_key(row.th.get_text())
                    cell.string=t[CONFIG['featureStatus'][key]['status']] if i==0 else t['planned']
                    if i==0: cell['data-feature']=key
            for h in soup.select('.feature-matrix-heading h2'): h.string='Planned features by plan'
            for p in soup.select('.feature-matrix-heading > p:not(.eyebrow)'): p.string=t['planNote']+' '+t['status']
        for p in soup.select('.cp051-about-teaser .eyebrow'): p.string=t['about']
        for a in soup.select('.cp051-about-teaser a'): a['href']=about
    if lang!='en':
        # Keep local About links local; English-only destinations have a single
        # consistent visible indication through the title attribute.
        for a in soup.select('a[href="/about-us.html"]'): a['href']=about
        for a in soup.select('a[href^="/book-demo"], a[href^="/pilot-program"], a[href="/platform.html"], a[href="/solutions.html"]'):
            a['hreflang']='en'
            a['title']={'da':'Siden er på engelsk','de':'Seite auf Englisch','sv':'Sidan är på engelska','no':'Siden er på engelsk'}[lang]
    # Replace launch-list invitations remaining in About page body copy.
    for p in soup.select('.cp050-about-cta p, .cp050-about-closing p'):
        if re.search('launch|Launch',p.get_text()): p.string=t['text']
    # Duplicate workflow IDs were present on Platform before this update.
    ids=set()
    for node in soup.select('[id]'):
        ident=node['id']
        if ident in ids: node['id']=ident+'-details'
        ids.add(node['id'])
    if rel=='book-demo.html':
        wrap=soup.select_one('.cp034-booking-wrap')
        if not wrap.select_one('.cp-demo-duration'):
            wrap.h2.insert_after(tag(soup,'p','Camp-Planner introduction – approximately 30 minutes.',**{'class':'cp-demo-duration'}))
        empty=soup.select_one('.lead-hero .hubspot-card')
        if empty: replace_contents(empty,f'<h2>{t["demo"]}</h2><p>Discuss your event and explore the planned workflows in an introduction of approximately 30 minutes.</p>'+link(LINKS['demo'],t['demo'],'btn btn-primary'))
    for badges in soup.select('.lead-badges'):
        replace_contents(badges,'<span>For event organizers</span><span>Pilot access is open</span>')
    # Make old login landing page useful without changing the app itself.
    if rel=='login.html':
        replace_contents(soup.main,'<section class="lead-hero"><div class="lead-hero-inner"><div><h1>Open Camp-Planner</h1><p>The Camp-Planner application is on camp-planner.dk.</p>'+link(LINKS['app'],t['login'],'btn btn-primary')+'</div></div></section>')
    output='\n'.join(line.rstrip() for line in str(soup).splitlines())+'\n'
    if output!=original: path.write_text(output)
print('Rendered shared launch content into static pages.')
