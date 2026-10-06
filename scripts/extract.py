import pdfplumber, fitz, re, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
choice=Path('/workspace/attachments/f86965b2-8600-436b-9c17-dbb43277de97/IPMA-D 選擇題.pdf')
calc=Path('/workspace/attachments/97c4178c-4d11-467b-86c0-dc4dea3afa60/IPMA-D 計算題.pdf')
questions=[]
with pdfplumber.open(choice) as pdf:
 for pi,page in enumerate(pdf.pages):
  tables=page.find_tables()
  if pi and tables:
   top=tables[0].bbox[1]
   if top>95:
    for column,cell in enumerate(tables[0].rows[0].cells):
     if not cell or column==0 or column==6: continue
     extra=page.crop((cell[0],90,cell[2],top)).extract_text() or ''
     extra=extra.replace('\n','').strip()
     if extra:
      if column==1: questions[-1]['text']+=extra
      else: questions[-1]['options'][column-2]+=extra
      print('Continuation',pi+1,column,extra)
  for table in tables:
   for row in table.extract():
    if row[0] and re.match(r'^\d+\.',row[0]):
     clean=lambda s:(s or '').replace('\n','').strip()
     questions.append(dict(id='choice-'+str(int(row[0].rstrip('.'))),number=int(row[0].rstrip('.')),kind='choice',text=clean(row[1]),options=[clean(s) for s in row[2:6]],answer=clean(row[6]),page=pi+1))
assert len(questions)==313
assert all(q['answer'] in 'ABCD' and len(q['answer'])==1 and all(q['options']) for q in questions)
doc=fitz.open(calc)
starts=[]
for pi,page in enumerate(doc):
 for block in page.get_text('dict')['blocks']:
  for line in block.get('lines',[]):
   text=''.join(s['text'] for s in line['spans'])
   m=re.match(r'^(\d+)\.',text.strip())
   b=line['bbox']
   if m and b[0]<80 and b[1]<780: starts.append((int(m[1]),pi,b[1]-3))
assert [s[0] for s in starts]==list(range(1,31)),starts
for idx,(n,pi,y) in enumerate(starts):
 end=starts[idx+1][1:] if idx+1<len(starts) else (len(doc)-1,780)
 solution=None
 for pn in range(pi,end[0]+1):
  for block in doc[pn].get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    b=line['bbox']; text=''.join(s['text'] for s in line['spans'])
    if (pn>pi or b[1]>=y) and (pn<end[0] or b[1]<end[1]) and re.match(r'^解\s*[：:]',text.strip()): solution=(pn,b[1]-3);break
   if solution: break
  if solution: break
 assert solution, n
 def render(a,z,label):
  paths=[]
  for pn in range(a[0],z[0]+1):
   lo=a[1] if pn==a[0] else 108
   hi=z[1] if pn==z[0] else 780
   if hi-lo<2: continue
   name=f'assets/calc-{n}-{label}-{pn+1}.png'
   doc[pn].get_pixmap(matrix=fitz.Matrix(1.65,1.65),clip=fitz.Rect(40,lo,560,hi)).save(root/'public'/name)
   paths.append(name)
  return paths
 text=doc[pi].get_text(clip=fitz.Rect(40,y,560,solution[1] if solution[0]==pi else 780)).strip()
 questions.append(dict(id=f'calc-{n}',number=n,kind='calc',text=text,images=render((pi,y),solution,'question'),solutions=render(solution,end,'solution'),page=pi+1))
(root/'public/questions.json').write_text(json.dumps(questions,ensure_ascii=False),encoding='utf8')
print('Exported',len(questions),'questions')
