import json,re,sys
T=json.load(open('.work/threads.json',encoding='utf-8'))
def ctx(stem,w=70):
    out=[]
    for b,th in T.items():
        t=re.sub(r'<[^>]+>',' ',th['text']); t=re.sub(r'\s+',' ',t)
        ms=[m for m in re.finditer(re.escape(stem),t,re.I)]
        if ms:
            m=ms[0]; out.append(f"  {b} [{th['date'][:10]}] …{t[max(0,m.start()-w):m.end()+w]}…")
    return out
for s in sys.argv[1:]:
    print('##',s); print('\n'.join(ctx(s)))
