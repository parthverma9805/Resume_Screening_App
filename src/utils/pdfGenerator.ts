import { jsPDF } from 'jspdf';
import { Candidate } from '../types';

/**
 * Generates a clean, professional PDF resume & AI Evaluation report for a candidate
 */
export function generateCandidatePdf(candidate: Candidate, jobTitle?: string) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const res = candidate.screeningResult;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Primary Theme Colors
  const primaryColor: [number, number, number] = [30, 41, 59]; // slate-800
  const accentColor: [number, number, number] = [79, 70, 229]; // indigo-600
  const lightBg: [number, number, number] = [248, 250, 252]; // slate-50
  const textColor: [number, number, number] = [51, 65, 85]; // slate-700

  // Helper to add page header line
  const addHeaderBackground = () => {
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, pageWidth, 5, 'F');
  };

  addHeaderBackground();
  y += 6;

  // Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text(candidate.name || 'Candidate Resume', margin, y);
  y += 8;

  // Subtitle / Job Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...accentColor);
  const roleText = jobTitle ? `Applied Role: ${jobTitle}` : (res?.currentRole || 'Candidate Resume');
  doc.text(roleText, margin, y);
  y += 6;

  // Contact Info Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500

  const contactParts: string[] = [];
  if (candidate.email) contactParts.push(`Email: ${candidate.email}`);
  if (candidate.phone) contactParts.push(`Phone: ${candidate.phone}`);
  if (candidate.location) contactParts.push(`Location: ${candidate.location}`);

  if (contactParts.length > 0) {
    doc.text(contactParts.join('  |  '), margin, y);
    y += 6;
  }

  // AI Evaluation Banner (if screened)
  if (res) {
    doc.setFillColor(...lightBg);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...accentColor);
    doc.text(`AI Match Score: ${res.overallScore}/100`, margin + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Recommendation: ${res.recommendation}`, margin + 65, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Screened: ${new Date(res.screenedAt || Date.now()).toLocaleDateString()}`, margin + 130, y + 6);

    if (res.yearsOfExperience) {
      doc.text(`Total Exp: ${res.yearsOfExperience} yrs`, margin + 4, y + 12);
    }

    y += 22;
  }

  // Helper for adding section titles
  const addSectionTitle = (title: string) => {
    checkNewPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(title, margin, y);
    
    // Draw underline
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2, margin + contentWidth, y + 2);
    y += 7;
  };

  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeaderBackground();
      y += 6;
    }
  };

  // Executive Summary / AI Analysis
  if (res?.executiveSummary) {
    addSectionTitle('Executive Summary & AI Analysis');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...textColor);
    
    const lines = doc.splitTextToSize(res.executiveSummary, contentWidth);
    checkNewPage(lines.length * 4.5);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 4;
  }

  // Key Strengths & Skills
  if (res?.keyStrengths && res.keyStrengths.length > 0) {
    addSectionTitle('Key Strengths & Competencies');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);

    for (const strength of res.keyStrengths) {
      checkNewPage(5);
      doc.text(`• ${strength}`, margin + 3, y);
      y += 4.5;
    }
    y += 3;
  }

  // Work Experience
  if (res?.extractedExperience && res.extractedExperience.length > 0) {
    addSectionTitle('Professional Experience');

    for (const exp of res.extractedExperience) {
      checkNewPage(18);
      
      // Role & Company
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(exp.title || 'Role', margin, y);

      if (exp.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(exp.duration, pageWidth - margin - doc.getTextWidth(exp.duration), y);
      }
      y += 4.5;

      if (exp.company) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...accentColor);
        doc.text(exp.company, margin, y);
        y += 4.5;
      }

      if (exp.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...textColor);
        const descLines = doc.splitTextToSize(exp.description, contentWidth);
        checkNewPage(descLines.length * 4);
        doc.text(descLines, margin, y);
        y += descLines.length * 4 + 3;
      } else {
        y += 2;
      }
    }
  }

  // Education
  if (res?.extractedEducation && res.extractedEducation.length > 0) {
    addSectionTitle('Education');

    for (const edu of res.extractedEducation) {
      checkNewPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...primaryColor);
      doc.text(`${edu.degree} - ${edu.institution}`, margin, y);

      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(edu.year, pageWidth - margin - doc.getTextWidth(edu.year), y);
      }
      y += 5.5;
    }
    y += 2;
  }

  // Raw Resume Content Section
  if (candidate.resumeText) {
    addSectionTitle('Original Resume Content');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    const cleanResumeText = candidate.resumeText.replace(/\r/g, '');
    const resumeLines = doc.splitTextToSize(cleanResumeText, contentWidth);

    for (let i = 0; i < resumeLines.length; i++) {
      checkNewPage(3.8);
      doc.text(resumeLines[i], margin, y);
      y += 3.8;
    }
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1; // 1-based internal array length
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `AI Candidate Resume Report • Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger Save
  const safeName = candidate.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
  doc.save(`${safeName}_Resume.pdf`);
}
