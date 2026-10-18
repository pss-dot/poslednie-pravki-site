import re,sys
t=open('.work/read.txt',encoding='utf-8').read()
blocks=re.split(r'\n\n(?=### \d+ )',t)
idx={re.match(r'### \d+ (\S+)',b).group(1):b for b in blocks}
for a in sys.argv[1:]:
    print(idx.get(a,'MISSING '+a)); print()
