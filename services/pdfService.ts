/**
 * PDF Generation Service
 * Generates professionally formatted PDF reports from malaria analysis results
 */

import jsPDF from 'jspdf';
import { AnalysisResult } from '../types';

export const generatePDF = async (
  patientName: string,
  patientId: string,
  result: AnalysisResult,
  date: string,
  userName: string = 'ParaDetect AI'
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let pageNumber = 1;
  
  // Helper function for adding page numbers
  const addPageNumber = (pageNum: number) => {
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
  };
  
  // Helper function for section divider
  const addDivider = (y: number) => {
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
  };
  
  // HEADER SECTION - Professional gradient-style header
  pdf.setFillColor(239, 68, 68); // Primary rose
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Accent bar
  pdf.setFillColor(220, 38, 38);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  
  // Logo/Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ParaDetect AI', margin, 25);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Clinical Malaria Detection Report', margin, 35);
  
  // Report ID and Date in header
  pdf.setFontSize(9);
  pdf.text(`Report ID: ${patientId}`, pageWidth - margin, 25, { align: 'right' });
  pdf.text(`Generated: ${new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - margin, 32, { align: 'right' });
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // PATIENT INFORMATION SECTION
  let yPos = 65;
  
  // Section header with background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text('PATIENT INFORMATION', margin + 3, yPos + 2);
  
  yPos += 15;
  
  // Patient details in a structured box
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'D');
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Patient Name:', margin + 5, yPos + 8);
  pdf.text('Report Date:', margin + 5, yPos + 16);
  pdf.text('Validated By:', margin + 5, yPos + 24);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(patientName, margin + 32, yPos + 8);
  pdf.text(new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), margin + 32, yPos + 16);
  pdf.text(userName, margin + 32, yPos + 24);
  
  // Patient ID in second column to prevent collision
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Patient ID:', pageWidth / 2 + 5, yPos + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text(patientId, pageWidth / 2 + 5, yPos + 15);
  pdf.setFontSize(9);
  
  // DIAGNOSTIC SUMMARY - Prominent status banner
  yPos += 45;
  addDivider(yPos);
  yPos += 10;
  
  // Section header
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.text('DIAGNOSTIC SUMMARY', margin + 3, yPos + 2);
  
  yPos += 15;
  
  // Status Banner - Large prominent box
  const bannerHeight = 20;
  if (result.isInfected) {
    pdf.setFillColor(254, 226, 226);
    pdf.setDrawColor(239, 68, 68);
  } else {
    pdf.setFillColor(209, 250, 229);
    pdf.setDrawColor(16, 185, 129);
  }
  pdf.setLineWidth(2);
  pdf.roundedRect(margin, yPos, contentWidth, bannerHeight, 3, 3, 'FD');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  if (result.isInfected) {
    pdf.setTextColor(127, 29, 29);
  } else {
    pdf.setTextColor(6, 78, 59);
  }
  pdf.text(
    result.isInfected ? 'MALARIA POSITIVE' : 'NEGATIVE - NO INFECTION',
    pageWidth / 2,
    yPos + 13,
    { align: 'center' }
  );
  
  pdf.setTextColor(0, 0, 0);
  yPos += bannerHeight + 15;
  
  // ANALYSIS METRICS - Grid layout for infected cases
  if (result.isInfected) {
    // Metrics grid with boxes
    const boxWidth = (contentWidth - 10) / 3;
    const boxHeight = 25;
    
    // Species box
    pdf.setFillColor(255, 247, 237);
    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(1);
    pdf.roundedRect(margin, yPos, boxWidth, boxHeight, 2, 2, 'FD');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 53, 15);
    pdf.text('DETECTED SPECIES', margin + boxWidth / 2, yPos + 8, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    const speciesText = result.species.replace('Plasmodium ', 'P. ');
    pdf.text(speciesText, margin + boxWidth / 2, yPos + 17, { align: 'center' });
    
    // Severity box
    const severityColor = result.severity === 'Severe' ? [220, 38, 38] : 
                         result.severity === 'Moderate' ? [234, 88, 12] : [22, 163, 74];
    pdf.setFillColor(severityColor[0] > 200 ? 254 : 255, 
                     severityColor[1] > 100 ? 237 : 243, 
                     severityColor[2] > 100 ? 220 : 244);
    pdf.setDrawColor(severityColor[0], severityColor[1], severityColor[2]);
    pdf.roundedRect(margin + boxWidth + 5, yPos, boxWidth, boxHeight, 2, 2, 'FD');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(severityColor[0] / 3, severityColor[1] / 3, severityColor[2] / 3);
    pdf.text('SEVERITY LEVEL', margin + boxWidth * 1.5 + 5, yPos + 8, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(result.severity, margin + boxWidth * 1.5 + 5, yPos + 17, { align: 'center' });
    
    // Parasitemia box
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.roundedRect(margin + boxWidth * 2 + 10, yPos, boxWidth, boxHeight, 2, 2, 'FD');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 64, 175);
    pdf.text('PARASITEMIA', margin + boxWidth * 2.5 + 10, yPos + 8, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${result.parasitemia?.toFixed(1)}%`, margin + boxWidth * 2.5 + 10, yPos + 17, { align: 'center' });
    
    yPos += boxHeight + 10;
  }
  
  // AI Metrics box
  const metricsBoxHeight = 20;
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(209, 213, 219);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, yPos, contentWidth, metricsBoxHeight, 2, 2, 'FD');
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('AI Confidence:', margin + 5, yPos + 10);
  pdf.text(`${result.confidence?.toFixed(1)}%`, margin + 35, yPos + 10);
  
  if (result.dlMetadata?.processingTime) {
    pdf.text('Processing Time:', margin + 60, yPos + 10);
    pdf.text(`${result.dlMetadata.processingTime}ms`, margin + 95, yPos + 10);
  }
  
  pdf.text('Stage:', margin + 120, yPos + 10);
  pdf.text(result.stage !== 'None' ? result.stage : 'N/A', margin + 140, yPos + 10);
  
  yPos += metricsBoxHeight + 5;
  
  // CLINICAL INTERPRETATION
  if (result.explanation) {
    yPos += 10;
    addDivider(yPos);
    yPos += 10;
    
    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    // Section header
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('CLINICAL INTERPRETATION', margin + 3, yPos + 2);
    
    yPos += 15;
    
    // Content box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    
    const splitText = pdf.splitTextToSize(result.explanation, contentWidth - 10);
    const textHeight = splitText.length * 5 + 10;
    pdf.roundedRect(margin, yPos, contentWidth, textHeight, 2, 2, 'D');
    pdf.text(splitText, margin + 5, yPos + 7);
    yPos += textHeight + 5;
  }
  
  // TREATMENT RECOMMENDATION
  if (result.treatmentRecommendation) {
    yPos += 10;
    
    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    addDivider(yPos);
    yPos += 10;
    
    // Section header with warning icon for infected cases
    if (result.isInfected) {
      pdf.setFillColor(254, 242, 242);
    } else {
      pdf.setFillColor(248, 250, 252);
    }
    pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    if (result.isInfected) {
      pdf.setTextColor(185, 28, 28);
    } else {
      pdf.setTextColor(30, 41, 59);
    }
    pdf.text(result.isInfected ? 'TREATMENT RECOMMENDATION' : 'RECOMMENDATIONS', margin + 3, yPos + 2);
    
    yPos += 15;
    
    // Treatment box with color coding
    if (result.isInfected) {
      pdf.setFillColor(255, 251, 235);
      pdf.setDrawColor(245, 158, 11);
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(226, 232, 240);
    }
    pdf.setLineWidth(1);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    
    const splitTreatment = pdf.splitTextToSize(result.treatmentRecommendation, contentWidth - 10);
    const treatmentHeight = splitTreatment.length * 5 + 10;
    
    // Check if treatment box fits on page
    if (yPos + treatmentHeight > pageHeight - 50) {
      pdf.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    pdf.roundedRect(margin, yPos, contentWidth, treatmentHeight, 2, 2, 'FD');
    pdf.text(splitTreatment, margin + 5, yPos + 7);
    yPos += treatmentHeight + 5;
  }
  
  // CLINICAL NOTES & FOLLOW-UP
  if (result.clinicalNotes) {
    yPos += 10;
    
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    addDivider(yPos);
    yPos += 10;
    
    // Section header
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('CLINICAL NOTES & FOLLOW-UP', margin + 3, yPos + 2);
    
    yPos += 15;
    
    // Notes box
    pdf.setFillColor(245, 247, 250);
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    
    const splitNotes = pdf.splitTextToSize(result.clinicalNotes, contentWidth - 10);
    const notesHeight = splitNotes.length * 5 + 10;
    
    // Check if notes box fits on page
    if (yPos + notesHeight > pageHeight - 50) {
      pdf.addPage();
      pageNumber++;
      yPos = 20;
    }
    
    pdf.roundedRect(margin, yPos, contentWidth, notesHeight, 2, 2, 'FD');
    pdf.text(splitNotes, margin + 5, yPos + 7);
    yPos += notesHeight + 10;
  }
  
  // DISCLAIMER SECTION
  yPos += 5;
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    pageNumber++;
    yPos = 20;
  }
  
  addDivider(yPos);
  yPos += 10;
  
  pdf.setFillColor(254, 252, 232);
  pdf.setDrawColor(250, 204, 21);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'FD');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(113, 63, 18);
  pdf.text('IMPORTANT DISCLAIMER', margin + 5, yPos + 7);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 53, 15);
  const disclaimer = 'This report is generated by AI-assisted analysis and should be reviewed by a qualified healthcare professional. ' +
                    'Treatment decisions should only be made by licensed medical practitioners after comprehensive clinical evaluation. ' +
                    'This is not a substitute for professional medical diagnosis.';
  const splitDisclaimer = pdf.splitTextToSize(disclaimer, contentWidth - 10);
  pdf.text(splitDisclaimer, margin + 5, yPos + 13);
  
  // FOOTER on all pages
  const totalPages = pageNumber;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Footer text
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'ParaDetect AI',
      margin,
      pageHeight - 12
    );
    pdf.text(
      `Validated by: ${userName}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    pdf.text(
      `Copyright ${new Date().getFullYear()}`,
      pageWidth - margin,
      pageHeight - 12,
      { align: 'right' }
    );
    
    // Page number
    addPageNumber(i);
  }
  
  // Save the PDF with enhanced filename
  const fileName = `ParaDetect_Report_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export default generatePDF;
