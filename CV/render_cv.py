"""Render the accompanying Markdown CV. Requires reportlab; Arial from Windows."""
import re
import sys
from pathlib import Path
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak

src = Path(sys.argv[1])
out = Path(sys.argv[2])
for name, file in [('Arial','arial.ttf'),('Arial-Bold','arialbd.ttf'),('Arial-Italic','ariali.ttf'),('Arial-BoldItalic','arialbi.ttf')]:
    pdfmetrics.registerFont(TTFont(name, 'C:/Windows/Fonts/' + file))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='Arial-Bold',italic='Arial-Italic',boldItalic='Arial-BoldItalic')
styles = {
    'body': ParagraphStyle('body',fontName='Arial',fontSize=10.2,leading=14,spaceAfter=6),
    'section': ParagraphStyle('section',fontName='Arial-Bold',fontSize=12,leading=15,spaceBefore=13,spaceAfter=5,keepWithNext=True),
    'title': ParagraphStyle('title',fontName='Arial-Bold',fontSize=25,leading=30,alignment=1,spaceAfter=7),
    'contact': ParagraphStyle('contact',fontName='Arial',fontSize=10,leading=14,alignment=1,spaceAfter=5),
    'label': ParagraphStyle('label',fontName='Arial',fontSize=10.2,leading=14,spaceBefore=3,spaceAfter=4,keepWithNext=True),
}
def fmt(s):
    s=s.replace('&','&amp;')
    s=re.sub(r'\[([^]]+)\]\(([^)]+)\)',r'<link href="\2" color="#0563C1"><u>\1</u></link>',s)
    return re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
story=[]
for i,block in enumerate(src.read_text(encoding='utf-8').split('\n\n')):
    block=block.strip()
    if not block: continue
    if block=='<!-- pagebreak -->': story.append(PageBreak()); continue
    if block.startswith('# '): story.append(Paragraph(fmt(block[2:]),styles['title'])); continue
    if block.startswith('## '):
        story.extend([Paragraph(fmt(block[3:]),styles['section']),HRFlowable(width='100%',thickness=.45,color=colors.HexColor('#999999'),spaceAfter=7)])
        continue
    style='contact' if i<3 else ('label' if block.startswith('**') and (' | ' in block or block.endswith('**')) else 'body')
    story.append(Paragraph(fmt(block),styles[style]))
def footer(c,d):
    c.setFont('Arial',8)
    c.setFillColor(colors.HexColor('#777777'))
    c.drawString(50,29,'Youngjin Yang | Curriculum Vitae')
    c.drawRightString(562,29,str(d.page))
doc=SimpleDocTemplate(str(out),pagesize=(612,792),rightMargin=50,leftMargin=50,topMargin=39,bottomMargin=45,title='Youngjin Yang CV',author='Youngjin Yang')
doc.build(story,onFirstPage=footer,onLaterPages=footer)