"""Generate the downloadable CV draft from the same data used by the site."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_LEFT

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'src/resumeData.json').read_text())
OUT = ROOT / 'output/pdf/Maksym-CV-draft.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
PAGE_W, PAGE_H = 595.28, 841.89
INK = HexColor('#263028'); MUTED = HexColor('#697263'); ACCENT = HexColor('#596b45'); LINE = HexColor('#d5dccc')
c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
c.setTitle('Maksym - Curriculum Vitae (Working Draft)')
c.setAuthor('Maksym')
left, right = 48, PAGE_W - 48
y = PAGE_H - 48

def ascii_text(text):
    return text.replace('’', "'").replace('–', '-').replace('—', '-').replace('→', 'to')

def paragraph(text, size=9.5, color=INK, leading=14, after=8, font='Helvetica'):
    global y
    style = ParagraphStyle('body', fontName=font, fontSize=size, leading=leading, textColor=color, alignment=TA_LEFT)
    p = Paragraph(escape(ascii_text(text)), style)
    _, height = p.wrap(right-left, PAGE_H)
    p.drawOn(c, left, y-height)
    y -= height + after

def heading(text):
    global y
    y -= 9
    c.setStrokeColor(LINE); c.setLineWidth(.6); c.line(left, y, right, y)
    y -= 19
    paragraph(text.upper(), size=8, color=ACCENT, leading=10, after=11, font='Helvetica-Bold')

def row(title, status):
    global y
    c.setFillColor(INK); c.setFont('Helvetica-Bold', 10); c.drawString(left, y-10, ascii_text(title))
    c.setFillColor(MUTED); c.setFont('Helvetica', 8); c.drawRightString(right, y-10, ascii_text(status))
    y -= 19

c.setFillColor(ACCENT); c.setFont('Helvetica-Bold', 7.5); c.drawString(left, y, 'CURRICULUM VITAE / WORKING DRAFT')
y -= 38
paragraph(data['name'], 30, INK, 34, 7, 'Helvetica-Bold')
paragraph(data['title'], 12, MUTED, 16, 11)
paragraph(data['email'] + '   |   github.com/iiMaximus', 8.5, MUTED, 12, 18)
c.linkURL(data['github'], (left+115,y+18,right,y+30), relative=0)
paragraph(data['summary'], 10, INK, 15, 2)
heading('Education')
row(data['education']['institution'], data['education']['status'])
paragraph(data['education']['degree'], 9.5, INK, 14, 3)
paragraph(data['education']['dates'], 8.5, MUTED, 12, 4)
paragraph(data['education']['details'], 8.5, MUTED, 12, 2)
heading('Selected projects')
for project in data['projects']:
    row(project['name'], project['status'])
    paragraph(project['description'], 9, INK, 13, 4)
    paragraph(project['evidence'], 8.2, MUTED, 11.5, 10)
heading('Academic direction')
paragraph(data['direction'], 9, INK, 13, 2)
heading('Technical skills & languages')
paragraph(data['skills'], 8.5, MUTED, 12, 5)
paragraph(data['languages'], 8.5, MUTED, 12, 2)
heading('Experience & activities')
paragraph(data['experience'], 8.5, MUTED, 12, 2)
if y < 63:
    raise ValueError(f'CV content exceeds one-page layout: y={y}')
c.setStrokeColor(LINE); c.line(left, 46, right, 46)
c.setFillColor(MUTED); c.setFont('Helvetica', 7)
c.drawString(left, 32, 'Draft - October 2026 - Complete bracketed fields before use.')
c.drawRightString(right, 32, '1 / 1')
c.showPage(); c.save()
public = ROOT / 'public/resume'; public.mkdir(parents=True, exist_ok=True)
(public / OUT.name).write_bytes(OUT.read_bytes())
# Editable companion, with deliberate placeholders and no invented qualifications.
lines = [data['name'], data['title'], data['email'], data['phone'], data['github'], '', data['summary'], '', 'EDUCATION', data['education']['institution'], data['education']['degree'], data['education']['dates'], data['education']['details'], '', 'SELECTED PROJECTS']
for project in data['projects']:
    lines.extend([project['name'] + ' - ' + project['status'], project['description'], project['evidence'], ''])
lines.extend(['ACADEMIC DIRECTION', data['direction'], '', 'TECHNICAL SKILLS', data['skills'], '', 'LANGUAGES', data['languages'], '', 'EXPERIENCE & ACTIVITIES', data['experience'], '', 'WORKING DRAFT - October 2026. Complete all bracketed fields before applying.'])
(public / 'Maksym-CV-editable.txt').write_text('\n'.join(lines) + '\n')
print(f'Created {OUT.name}; content ends at {y:.1f} pt.')
