#!/usr/bin/env python3
"""Pages statiques indexables de Khatmah (SEO) : 114 sourates, adhkar et douas.

Sources (aucun texte inventé) :
  - Coran : texte uthmani de quran.com (seo/data/quran-uthmani.json), infos des sourates (chapters.json).
  - Adhkar : « Hisn al-Muslim » (حصن المسلم) de Sa'id ibn Wahf al-Qahtani, avec la référence de chaque texte
    (seo/data/adhkar.json).
  - Douas du Coran : versets coraniques cités avec leur référence (sourate:verset).

Usage : python3 scripts/gen_seo.py   → écrit dans public/ (sourate/, adhkar/, douas, sitemap.xml).
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'seo', 'data')
PUB = os.path.join(ROOT, 'public')
SITE = 'https://khatmah.fumaops.com'
UPDATED = '2026-11-10'

Q = json.load(open(os.path.join(DATA, 'quran-uthmani.json'), encoding='utf-8'))
META = json.load(open(os.path.join(DATA, 'chapters.json'), encoding='utf-8'))
CH = META['chapters']
JUZ = {int(k): v for k, v in META['juz'].items()}
ADHKAR = json.load(open(os.path.join(DATA, 'adhkar.json'), encoding='utf-8'))

e = lambda s: html.escape(str(s), quote=True)
AR_DIGITS = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')
ar_num = lambda n: str(n).translate(AR_DIGITS)


def slugify(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower().replace("'", ''))).strip('-')


for c in CH:
    c['slug'] = slugify(c['name_simple'])
BY_ID = {c['id']: c for c in CH}

POPULAR = [18, 36, 67, 56, 55, 2, 1, 112, 32, 48]  # liens « sourates les plus lues »


def juz_of(sid):
    out = []
    for j in range(1, 31):
        if str(sid) in JUZ[j]:
            out.append(j)
    return out


# ─── Gabarit commun ───────────────────────────────────────────────────────────────────────────
CSS = """
:root{--bg:#FAF7EE;--ink:#1C1917;--muted:#57534e;--brand:#064e3b;--brand2:#065f46;--gold:#b7791f;--card:#fff;--line:#E8DFC9;--soft:#f3efe2}
@media (prefers-color-scheme:dark){:root{--bg:#141210;--ink:#f5f5f4;--muted:#a8a29e;--brand:#6ee7b7;--brand2:#34d399;--gold:#fbbf24;--card:#1c1917;--line:#2c2825;--soft:#1f1c19}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.7 "Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--brand)}
.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top .in{max-width:900px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.top .logo{display:flex;align-items:center;gap:8px;font-weight:800;text-decoration:none;color:var(--brand)}
.top .logo img{width:32px;height:32px;border-radius:8px}
.top nav{display:flex;gap:4px;flex-wrap:wrap;margin-inline-start:auto}
.top nav a{font-size:14px;font-weight:700;text-decoration:none;padding:6px 10px;border-radius:10px;color:var(--ink)}
.top nav a:hover,.top nav a[aria-current]{background:var(--soft);color:var(--brand)}
main{max-width:900px;margin:0 auto;padding:18px 16px 96px}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:6px}.crumbs a{text-decoration:none}
h1{font-family:"Amiri",serif;font-size:2rem;line-height:1.35;margin:.2em 0;color:var(--brand)}
h2{font-size:1.15rem;margin:1.8em 0 .6em}
.lead{color:var(--muted);margin:.4em 0 1em}
.facts{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.facts span{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:13px;font-weight:600}
.mushaf{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:22px 18px;margin:16px 0}
.quran{font-family:"Amiri Quran","Scheherazade New","Amiri",serif;font-size:27px;line-height:2.25;text-align:justify;direction:rtl}
.ayn{color:var(--gold);font-size:.8em;white-space:nowrap}
.basmala{font-family:"Amiri Quran","Amiri",serif;text-align:center;font-size:26px;color:var(--brand);margin:0 0 10px}
.cta{position:fixed;inset-inline:0;bottom:14px;display:flex;justify-content:center;z-index:6;pointer-events:none}
.cta a{pointer-events:auto;background:var(--brand);color:#fff;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:16px;box-shadow:0 10px 30px rgba(6,78,59,.35);animation:breathe 3s ease-in-out infinite}
@media (prefers-color-scheme:dark){.cta a{color:#052e22;background:#6ee7b7}}
@keyframes breathe{50%{transform:scale(1.04)}}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;padding:0;list-style:none}
.grid a{display:block;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;text-decoration:none;color:var(--ink);transition:transform .15s,box-shadow .15s}
.grid a:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.08)}
.grid b{font-family:"Amiri",serif;font-size:20px;color:var(--brand);display:block}
.grid small{color:var(--muted)}
.pager{display:flex;justify-content:space-between;gap:10px;margin:18px 0}
.pager a{flex:1;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;text-decoration:none;font-weight:700}
.zikr{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:16px 18px;margin:12px 0;cursor:pointer;user-select:none;transition:opacity .3s}
.zikr .t{font-family:"Amiri",serif;font-size:22px;line-height:2;direction:rtl;white-space:pre-line}
.zikr .meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;font-size:13px;color:var(--muted)}
.zikr .n{background:var(--brand);color:#fff;border-radius:999px;padding:3px 12px;font-weight:800}
@media (prefers-color-scheme:dark){.zikr .n{color:#052e22}}
.zikr .f{display:block;margin-top:8px;font-size:15px;color:var(--ink);direction:rtl;font-family:"Amiri",serif}
.zikr .r{display:block;margin-top:6px;font-size:13px;direction:rtl}
.zikr.done{opacity:.45}
.note{font-size:13px;color:var(--muted);border-top:1px solid var(--line);margin-top:28px;padding-top:12px}
.lead:not([lang=fr]),h2{font-family:"Amiri",serif}
"""

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">'

COUNTER_JS = """<script>document.querySelectorAll('.zikr[data-n]').forEach(function(c){var n=+c.dataset.n,b=c.querySelector('.n');c.addEventListener('click',function(){if(n<=0)return;n--;if(b)b.textContent=n>0?n+' ×':'✓';if(n===0)c.classList.add('done')})});</script>"""


def page(path, title, desc, body, crumbs, active='', jsonld=None, lang='ar', extra_js=''):
    url = SITE + path
    ld = [{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + h} for i, (n, h) in enumerate(crumbs)],
    }] + (jsonld or [])
    nav = ''.join(
        f'<a href="{h}"{" aria-current=page" if k == active else ""}>{t}</a>'
        for k, h, t in [('sourates', '/sourates', 'السور'), ('adhkar', '/adhkar', 'الأذكار'), ('douas', '/douas', 'الأدعية'), ('app', '/', 'ختمة')]
    )
    crumb_html = ' › '.join(f'<a href="{h}">{e(n)}</a>' for n, h in crumbs[:-1]) + (f' › <span>{e(crumbs[-1][0])}</span>' if crumbs else '')
    out = f"""<!doctype html>
<html lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="Khatmah">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/og-khatmah.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#064e3b">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
{FONTS}
<style>{CSS}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="top"><div class="in"><a class="logo" href="/"><img src="/icon-192.png" alt="">ختمة · Khatmah</a><nav>{nav}</nav></div></header>
<main>
<div class="crumbs">{crumb_html}</div>
{body}
<p class="note">Khatmah (ختمة) — application gratuite pour lire tout le Coran à votre rythme, sans compte. <a href="/">Ouvrir l’application</a> · <a href="/confidentialite">Confidentialité</a></p>
</main>
<div class="cta"><a href="/">📖 اقرأ في تطبيق ختمة · Lire dans Khatmah</a></div>
{extra_js}
</body>
</html>
"""
    dest = os.path.join(PUB, path.strip('/') + '.html')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(out)
    return path


URLS = []

# ─── Sourates ─────────────────────────────────────────────────────────────────────────────────
PLACE = {'makkah': ('مكية', 'mecquoise'), 'madinah': ('مدنية', 'médinoise')}
for c in CH:
    sid, n = c['id'], c['verses']
    place_ar, place_fr = PLACE[c['place']]
    juz = juz_of(sid)
    verses = ''.join(f'{e(Q[f"{sid}:{v}"])} <span class="ayn">﴿{ar_num(v)}﴾</span> ' for v in range(1, n + 1))
    basmala = '<p class="basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>' if c['bismillah'] and sid != 1 else ''
    prev_c, next_c = BY_ID.get(sid - 1), BY_ID.get(sid + 1)
    pager = '<div class="pager">' + (
        f'<a href="/sourate/{prev_c["slug"]}">→ سورة {e(prev_c["name_ar"])}</a>' if prev_c else '<span></span>') + (
        f'<a href="/sourate/{next_c["slug"]}" style="text-align:left">سورة {e(next_c["name_ar"])} ←</a>' if next_c else '<span></span>') + '</div>'
    juz_txt = '، '.join(ar_num(j) for j in juz)
    pages_txt = f'{ar_num(c["pages"][0])}' if c['pages'][0] == c['pages'][1] else f'{ar_num(c["pages"][0])}–{ar_num(c["pages"][1])}'
    pop = ''.join(f'<li><a href="/sourate/{BY_ID[p]["slug"]}"><b>سورة {e(BY_ID[p]["name_ar"])}</b><small>{e(BY_ID[p]["name_simple"])}</small></a></li>' for p in POPULAR if p != sid)[:4000]
    body = f"""<h1>سورة {e(c['name_ar'])} مكتوبة كاملة</h1>
<p class="lead">سورة {e(c['name_ar'])} {place_ar}، عدد آياتها {ar_num(n)} آية، وترتيبها في المصحف {ar_num(sid)}. نصّ السورة كاملاً بالرسم العثماني مع أرقام الآيات.</p>
<p class="lead" dir="ltr" lang="fr" style="text-align:left">Sourate {sid} <strong>{e(c['name_simple'])}</strong> ({e(c['name_fr'])}) en arabe, texte complet en écriture uthmanie : sourate {place_fr}, {n} versets.</p>
<div class="facts"><span>{place_ar}</span><span>{ar_num(n)} آية</span><span>الجزء {juz_txt}</span><span>صفحات المصحف {pages_txt}</span><span>ترتيب النزول {ar_num(c['order'])}</span></div>
<div class="mushaf">{basmala}<p class="quran">{verses}</p></div>
{pager}
<h2>سور يكثر البحث عنها</h2><ul class="grid">{pop}</ul>
<h2>أذكار وأدعية</h2><ul class="grid"><li><a href="/adhkar/sabah"><b>أذكار الصباح</b></a></li><li><a href="/adhkar/masa"><b>أذكار المساء</b></a></li><li><a href="/douas"><b>أدعية من القرآن</b></a></li></ul>
<p class="note">النص القرآني بالرسم العثماني من quran.com. Texte coranique : quran.com (écriture uthmanie).</p>"""
    title = f'سورة {c["name_ar"]} مكتوبة كاملة بالرسم العثماني | Sourate {c["name_simple"]} — Khatmah'
    desc = f'سورة {c["name_ar"]} مكتوبة كاملة بالتشكيل والرسم العثماني ({n} آية، {place_ar}). Sourate {c["name_simple"]} ({c["name_fr"]}) en arabe, texte complet.'
    ld = [{'@context': 'https://schema.org', '@type': 'Chapter', 'name': f'سورة {c["name_ar"]}', 'alternateName': c['name_simple'],
           'position': sid, 'inLanguage': 'ar', 'isPartOf': {'@type': 'Book', 'name': 'القرآن الكريم'}, 'url': SITE + f'/sourate/{c["slug"]}'}]
    URLS.append(page(f'/sourate/{c["slug"]}', title, desc, body,
                     [('ختمة', '/'), ('السور', '/sourates'), (f'سورة {c["name_ar"]}', f'/sourate/{c["slug"]}')], 'sourates', ld))

items = ''.join(
    f'<li><a href="/sourate/{c["slug"]}"><b>{ar_num(c["id"])}. سورة {e(c["name_ar"])}</b><small>{e(c["name_simple"])} · {ar_num(c["verses"])} آية · {PLACE[c["place"]][0]}</small></a></li>' for c in CH)
URLS.append(page('/sourates', 'سور القرآن الكريم مكتوبة كاملة (114 سورة) | Les 114 sourates du Coran — Khatmah',
                 'فهرس سور القرآن الكريم الـ114 مكتوبة كاملة بالرسم العثماني: عدد الآيات، مكية أو مدنية. Les 114 sourates du Coran en arabe, texte complet.',
                 f'<h1>سور القرآن الكريم مكتوبة كاملة</h1><p class="lead">فهرس السور الـ١١٤ بالرسم العثماني مع عدد الآيات ومكان النزول. Les 114 sourates du Coran en arabe.</p><ul class="grid">{items}</ul>',
                 [('ختمة', '/'), ('السور', '/sourates')], 'sourates'))

# ─── Adhkar ───────────────────────────────────────────────────────────────────────────────────
TIMES = {1: 'مرة واحدة', 2: 'مرتان'}


def times_ar(n):
    if n in TIMES:
        return TIMES[n]
    return f'{ar_num(n)} مرات' if 3 <= n <= 10 else f'{ar_num(n)} مرة'


SOURCE_NOTE = '<p class="note">النصوص والتخريج من كتاب «حصن المسلم من أذكار الكتاب والسنة» للشيخ سعيد بن علي بن وهف القحطاني. Textes et références : « Hisn al-Muslim » de Sa‘id al-Qahtani. اضغط على الذكر لعدّ التكرار.</p>'

for cat in ADHKAR:
    cards = []
    for it in cat['items']:
        n = it['count'] or 1
        fadl = f'<span class="f">{e(it["fadl"])}</span>' if it['fadl'] else ''
        ref = f'<span class="r">📚 {e(it["ref"])}</span>' if it['ref'] else ''
        cards.append(f'<div class="zikr" data-n="{n}"><div class="t">{e(it["text"])}</div><div class="meta"><span class="n">{n} ×</span><span>{times_ar(n)}</span></div>{fadl}{ref}</div>')
    others = ''.join(f'<li><a href="/adhkar/{o["slug"]}"><b>{e(o["ar"])}</b><small>{e(o["fr"])}</small></a></li>' for o in ADHKAR if o['slug'] != cat['slug'])
    body = f"""<h1>{e(cat['ar'])} مكتوبة كاملة</h1>
<p class="lead" dir="ltr" lang="fr" style="text-align:left"><strong>{e(cat['fr'])}</strong> — {e(cat['intro_fr'])} {len(cat['items'])} invocations en arabe, avec le nombre de répétitions et la référence de chaque texte.</p>
{''.join(cards)}
{SOURCE_NOTE}
<h2>أذكار أخرى</h2><ul class="grid">{others}</ul>"""
    title = f'{cat["ar"]} مكتوبة كاملة مع المصدر | {cat["fr"]} — Khatmah'
    desc = f'{cat["ar"]} مكتوبة بالتشكيل مع عدد التكرار والتخريج من حصن المسلم. {cat["fr"]} : {len(cat["items"])} invocations en arabe avec leurs sources.'
    ld = [{'@context': 'https://schema.org', '@type': 'Article', 'headline': f'{cat["ar"]} مكتوبة كاملة', 'inLanguage': 'ar',
           'dateModified': UPDATED, 'publisher': {'@type': 'Organization', 'name': 'Khatmah'},
           'citation': 'حصن المسلم من أذكار الكتاب والسنة — سعيد بن علي بن وهف القحطاني'}]
    URLS.append(page(f'/adhkar/{cat["slug"]}', title, desc, body,
                     [('ختمة', '/'), ('الأذكار', '/adhkar'), (cat['ar'], f'/adhkar/{cat["slug"]}')], 'adhkar', ld, extra_js=COUNTER_JS))

items = ''.join(f'<li><a href="/adhkar/{c["slug"]}"><b>{e(c["ar"])}</b><small>{e(c["fr"])} · {len(c["items"])}</small></a></li>' for c in ADHKAR)
URLS.append(page('/adhkar', 'الأذكار اليومية مكتوبة: أذكار الصباح والمساء والنوم | Adhkar — Khatmah',
                 'أذكار الصباح والمساء والنوم وبعد الصلاة وأدعية اليوم مكتوبة بالتشكيل مع التخريج من حصن المسلم. Adhkar du matin, du soir et du quotidien en arabe avec leurs sources.',
                 f'<h1>الأذكار اليومية</h1><p class="lead">أذكار الصباح والمساء والنوم وبعد الصلاة وأذكار اليوم والليلة، مكتوبة بالتشكيل مع عدد التكرار وتخريج كل ذكر.</p><p class="lead" dir="ltr" lang="fr" style="text-align:left">Les adhkar du quotidien en arabe, avec le nombre de répétitions et la source de chaque texte (Hisn al-Muslim).</p><ul class="grid">{items}</ul>{SOURCE_NOTE}',
                 [('ختمة', '/'), ('الأذكار', '/adhkar')], 'adhkar'))

# ─── Douas du Coran ───────────────────────────────────────────────────────────────────────────
DOUAS = [
    ('2:127-128', 'دعاء إبراهيم وإسماعيل عليهما السلام عند رفع قواعد البيت', 'Invocation d’Ibrahim et d’Ismaïl'),
    ('2:201', 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة', 'Le bien ici-bas et dans l’au-delà'),
    ('2:250', 'دعاء طلب الصبر والثبات', 'Demander la patience et la fermeté'),
    ('2:286', 'خواتيم سورة البقرة', 'Fin de la sourate Al-Baqara'),
    ('3:8-9', 'ربنا لا تزغ قلوبنا بعد إذ هديتنا', 'Ne fais pas dévier nos cœurs'),
    ('3:16', 'ربنا إننا آمنا فاغفر لنا ذنوبنا', 'Pardonne-nous nos péchés'),
    ('3:38', 'دعاء زكريا عليه السلام بالذرية الطيبة', 'Invocation de Zakariya pour une descendance pieuse'),
    ('3:53', 'دعاء الحواريين', 'Invocation des apôtres'),
    ('3:147', 'ربنا اغفر لنا ذنوبنا وإسرافنا في أمرنا', 'Pardon et fermeté'),
    ('3:191-194', 'دعاء أولي الألباب', 'Invocation des doués d’intelligence'),
    ('7:23', 'دعاء آدم وحواء عليهما السلام: ربنا ظلمنا أنفسنا', 'Invocation d’Adam et Hawwa'),
    ('7:89', 'ربنا افتح بيننا وبين قومنا بالحق', 'Invocation de Chou‘ayb'),
    ('7:126', 'ربنا أفرغ علينا صبرا وتوفنا مسلمين', 'Mourir soumis à Allah'),
    ('10:85-86', 'ربنا لا تجعلنا فتنة للقوم الظالمين', 'Protection contre les injustes'),
    ('14:40-41', 'دعاء إبراهيم عليه السلام لنفسه وذريته ووالديه', 'Invocation d’Ibrahim pour sa descendance et ses parents'),
    ('17:24', 'الدعاء للوالدين: رب ارحمهما كما ربياني صغيرا', 'Invocation pour les parents'),
    ('17:80', 'رب أدخلني مدخل صدق وأخرجني مخرج صدق', 'Une entrée et une sortie de vérité'),
    ('18:10', 'دعاء أصحاب الكهف', 'Invocation des gens de la caverne'),
    ('20:25-28', 'دعاء موسى عليه السلام: رب اشرح لي صدري', 'Invocation de Moussa : ouvre-moi ma poitrine'),
    ('20:114', 'رب زدني علما', 'Seigneur, accrois mon savoir'),
    ('21:83', 'دعاء أيوب عليه السلام', 'Invocation d’Ayyoub'),
    ('21:87', 'دعاء يونس عليه السلام (ذي النون)', 'Invocation de Younous'),
    ('21:89', 'دعاء زكريا عليه السلام: رب لا تذرني فردا', 'Invocation de Zakariya'),
    ('23:29', 'رب أنزلني منزلا مباركا', 'Une demeure bénie'),
    ('23:97-98', 'الاستعاذة من همزات الشياطين', 'Protection contre les suggestions des démons'),
    ('23:109', 'ربنا آمنا فاغفر لنا وارحمنا', 'Pardon et miséricorde'),
    ('23:118', 'رب اغفر وارحم وأنت خير الراحمين', 'Pardonne et fais miséricorde'),
    ('25:65', 'ربنا اصرف عنا عذاب جهنم', 'Protection contre l’Enfer'),
    ('25:74', 'ربنا هب لنا من أزواجنا وذرياتنا قرة أعين', 'Pour les conjoints et les enfants'),
    ('26:83', 'دعاء إبراهيم عليه السلام: رب هب لي حكما', 'Invocation d’Ibrahim pour la sagesse'),
    ('27:19', 'دعاء سليمان عليه السلام بالشكر', 'Invocation de Soulayman pour la gratitude'),
    ('28:16', 'دعاء موسى عليه السلام بالمغفرة', 'Invocation de Moussa pour le pardon'),
    ('28:24', 'رب إني لما أنزلت إلي من خير فقير', 'Invocation de Moussa dans le besoin'),
    ('40:7-8', 'دعاء حملة العرش للمؤمنين', 'Invocation des porteurs du Trône'),
    ('46:15', 'دعاء الشكر وصلاح الذرية', 'Gratitude et descendance pieuse'),
    ('59:10', 'ربنا اغفر لنا ولإخواننا الذين سبقونا بالإيمان', 'Pour nos frères croyants'),
    ('60:4-5', 'ربنا عليك توكلنا وإليك أنبنا', 'Confiance et retour vers Allah'),
    ('66:8', 'ربنا أتمم لنا نورنا واغفر لنا', 'Parfais pour nous notre lumière'),
    ('71:28', 'دعاء نوح عليه السلام: رب اغفر لي ولوالدي', 'Invocation de Nouh pour ses parents et les croyants'),
]
cards = []
for ref, ar_title, fr_title in DOUAS:
    s, r = ref.split(':')
    a, b = (r.split('-') + [r])[:2]
    a, b = int(a), int(b)
    c = BY_ID[int(s)]
    text = ''.join(f'{e(Q[f"{s}:{v}"])} <span class="ayn">﴿{ar_num(v)}﴾</span> ' for v in range(a, b + 1))
    where = f'سورة {c["name_ar"]}، الآية {ar_num(a)}' + (f'–{ar_num(b)}' if b != a else '')
    cards.append(f'<div class="zikr"><div class="meta" style="margin:0 0 6px"><strong style="color:var(--brand);font-size:16px;font-family:Amiri,serif">{e(ar_title)}</strong></div><div class="t quran" style="font-size:24px">{text}</div><span class="r">📖 <a href="/sourate/{c["slug"]}">{e(where)}</a> · {e(fr_title)}</span></div>')
sunna = ''.join(f'<li><a href="/adhkar/{c["slug"]}"><b>{e(c["ar"])}</b><small>{e(c["fr"])}</small></a></li>' for c in ADHKAR if c['slug'] in ('hamm-karb', 'istikhara', 'safar', 'marid', 'istighfar', 'taam', 'matar'))
URLS.append(page('/douas', 'أدعية من القرآن الكريم مكتوبة (ربنا آتنا…) | Douas du Coran — Khatmah',
                 f'{len(DOUAS)} دعاء من القرآن الكريم مكتوبة بالرسم العثماني مع السورة ورقم الآية: أدعية الأنبياء والصالحين. Douas du Coran en arabe avec leur référence.',
                 f'<h1>أدعية من القرآن الكريم</h1><p class="lead">أدعية الأنبياء والصالحين كما وردت في القرآن الكريم، بالرسم العثماني مع اسم السورة ورقم الآية.</p><p class="lead" dir="ltr" lang="fr" style="text-align:left">Les invocations du Coran (Rabbana…) en arabe, avec la sourate et le numéro de chaque verset.</p>{"".join(cards)}<h2>أدعية من السنة</h2><ul class="grid">{sunna}</ul>',
                 [('ختمة', '/'), ('الأدعية', '/douas')], 'douas'))

# ─── Sitemap ──────────────────────────────────────────────────────────────────────────────────
all_urls = ['/', '/confidentialite'] + sorted(URLS, key=lambda u: (u.count('/'), u))
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url><loc>{SITE}{u}</loc><lastmod>{UPDATED}</lastmod></url>\n' for u in all_urls) + '</urlset>\n'
open(os.path.join(PUB, 'sitemap.xml'), 'w', encoding='utf-8').write(xml)
print(f'{len(URLS)} pages, sitemap {len(all_urls)} URL')
