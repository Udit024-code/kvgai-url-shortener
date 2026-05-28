import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_report():
    pdf_filename = "Project_Report.pdf"
    doc = SimpleDocTemplate(pdf_filename, pagesize=letter,
                            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1A365D"),
        spaceAfter=12
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=24
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#2B6CB0"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#2D3748"),
        spaceAfter=10
    )

    # Header / Title Block
    story.append(Paragraph("SECUREPATH AI — TECHNICAL EVALUATION REPORT", title_style))
    meta_text = """
    <b>Author:</b> Udit Chaudhary &nbsp;&nbsp;|&nbsp;&nbsp; 
    <b>Institution:</b> BITS Pilani &nbsp;&nbsp;|&nbsp;&nbsp; 
    <b>Date:</b> May 28, 2026<br/>
    <b>Program:</b> KVGAI Tech Evaluation Phase 2 &nbsp;&nbsp;|&nbsp;&nbsp; 
    <b>Track:</b> Full-Stack Development
    """
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 10))
    
    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    exec_text = """
    SecurePath AI is a production-ready, full-stack web application designed modernly to address link utility and web destination security. 
    It serves as a secure URL shortener utilizing an automated microservice workflow to ensure that malicious links, adult content, 
    or phishing portals are programmatically filtered out via predictive AI evaluations before database writes occur.
    """
    story.append(Paragraph(exec_text, body_style))
    
    # 2. Technical System Architecture
    story.append(Paragraph("2. Technical System Architecture", h1_style))
    arch_text = """
    The platform is engineered as a decoupled client-server architecture built to maximize edge performance and minimize latency:<br/><br/>
    • <b>Client Application:</b> Built using optimized HTML5, CSS3, and modern JavaScript (ES6+) hosted globally on Vercel's edge network distribution lines.<br/>
    • <b>API Endpoint Processing:</b> Built on Python's high-performance FastAPI framework, utilizing asynchronous event loops to handle high-concurrency routing.<br/>
    • <b>Security Vetting Engine:</b> Integrates directly with the Google Gemini Pro API to evaluate targeted URLs programmatically.<br/>
    • <b>Data Persistency Engine:</b> Powered by an online serverless Neon PostgreSQL database instance utilizing SQLAlchemy ORM schemas and regional connection pooling.
    """
    story.append(Paragraph(arch_text, body_style))
    
    # 3. Engineering Challenges & Solutions
    story.append(Paragraph("3. Engineering Challenges & Solutions Overcome", h1_style))
    challenges_text = """
    During initial cloud containerization and delivery onto Render, the build pipeline failed due to rigid, environment-specific dependency conflicts 
    within the package configuration layers. This roadblock was methodically resolved by auditing package version locks, isolating requirements, 
    and streamlining the requirements.txt configuration file to ensure seamless deployment across cloud environments.
    """
    story.append(Paragraph(challenges_text, body_style))
    
    # 4. Verification Metadata
    story.append(Paragraph("4. Verification Links & Metadata", h1_style))
    
    data = [
        [Paragraph("<b>Resource</b>", body_style), Paragraph("<b>Location URL</b>", body_style)],
        [Paragraph("Repository Codebase", body_style), Paragraph("https://github.com/Udit024-code/kvgai-url-shortener", body_style)],
        [Paragraph("Live Gateway Frontend", body_style), Paragraph("https://securepath-ai.vercel.app/", body_style)],
        [Paragraph("Live Gateway API Docs", body_style), Paragraph("https://securepath-backend.onrender.com/docs", body_style)]
    ]
    
    t = Table(data, colWidths=[130, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.HexColor("#EDF2F7")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(t)

    doc.build(story)
    print("Success: 'Project_Report.pdf' has been generated in your directory!")

if __name__ == "__main__":
    create_report()