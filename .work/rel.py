import re,glob,json,os
def base(stem):
    while stem.startswith('re-'): stem=stem[3:]
    return stem
rel={}
for f in glob.glob('src/content/posts/*.md'):
    stem=os.path.basename(f)[:-3]; s=base(stem)
    for t in re.findall(r'href="/letter/([^/"]+)/"',open(f,encoding='utf-8').read()):
        if t==s: continue
        rel.setdefault(s,[]); rel.setdefault(t,[])
        if t not in rel[s]: rel[s].append(t)
        if s not in rel[t]: rel[t].append(s)
rel={k:v[:4] for k,v in rel.items()}
valid={base(os.path.basename(f)[:-3]) for f in glob.glob('src/content/posts/*.md')}
rel={k:[x for x in v if x in valid] for k,v in rel.items() if k in valid}
json.dump(rel,open('src/data/related.json','w'),ensure_ascii=False,indent=1)
print(len(rel))
