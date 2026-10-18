import re,glob,os,json,collections,math
posts={}
def base(n):
    while n.startswith('re-'): n=n[3:]
    return n
threads=collections.OrderedDict()
for f in sorted(glob.glob('src/content/posts/*.md')):
    t=open(f,encoding='utf-8').read()
    m=re.match(r'---\n(.*?)\n---\n?(.*)',t,re.S)
    fm,body=m.group(1),m.group(2)
    slug=os.path.basename(f)[:-3]
    g=lambda k:(re.search(k+r':\s*"?(.*?)"?\s*$',fm,re.M) or [None,''])[1]
    d=dict(slug=slug,subject=g('subject'),frm=g('from'),date=g('date'),tag=g('tag'),body=body)
    b=base(slug)
    th=threads.setdefault(b,dict(base=b,members=[],tag=d['tag']))
    th['members'].append(d)
for th in threads.values():
    th['members'].sort(key=lambda x:len(x['slug']))
    th['date']=max(m['date'] for m in th['members'])
    th['subject']=th['members'][0]['subject']
    txt=' \n'.join(m['subject']+'\n'+m['frm']+'\n'+m['body'] for m in th['members'])
    th['text']=txt
json.dump(threads,open('.work/threads.json','w',encoding='utf-8'),ensure_ascii=False)
print(len(threads))
