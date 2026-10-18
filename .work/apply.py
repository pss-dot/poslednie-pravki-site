import re,sys,glob,os,importlib.util
spec=importlib.util.spec_from_file_location('links','.work/links.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
dry='--dry' in sys.argv
ok=bad=0
bases=set(os.path.basename(f)[:-3] for f in glob.glob('src/content/posts/*.md'))
for src,phrase,target in m.LINKS:
    f=f'src/content/posts/{src}.md'
    if not os.path.exists(f): print('NOFILE',src); bad+=1; continue
    if target not in bases: print('NOTARGET',target,'from',src); bad+=1; continue
    t=open(f,encoding='utf-8').read()
    mm=re.match(r'(---\n.*?\n---\n?)(.*)',t,re.S)
    head,body=mm.group(1),mm.group(2)
    link=f'<a href="/letter/{target}/">{phrase}</a>'
    if link in body: continue  # already applied
    # phrase must occur, not already inside an <a>…</a> or a tag
    positions=[x.start() for x in re.finditer(re.escape(phrase),body)]
    pos=None
    for p in positions:
        before=body[:p]
        if before.rfind('<a ')>before.rfind('</a>'): continue   # inside existing link
        if before.rfind('<')>before.rfind('>'): continue          # inside a tag
        pos=p;break
    if pos is None: print('NOPHRASE',src,'|',phrase); bad+=1; continue
    body=body[:pos]+link+body[pos+len(phrase):]
    if not dry: open(f,'w',encoding='utf-8').write(head+body)
    ok+=1
print('applied',ok,'problems',bad,'(dry)' if dry else '')
