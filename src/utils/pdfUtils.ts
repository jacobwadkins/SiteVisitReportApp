import jsPDF from 'jspdf';
import { Visit } from '../types';

// Add Roboto font (ensure jsPDF is configured with Roboto or use a CDN with custom fonts)
const addRobotoFont = (pdf: jsPDF) => {
  // Placeholder: In practice, add Roboto via jsPDF custom font support or ensure it's available
  // For now, we'll fall back to Helvetica which is similar and widely supported
  try {
    pdf.setFont('Roboto', 'normal');
    pdf.setFont('Roboto', 'bold');
  } catch (error) {
    // Fallback to Helvetica if Roboto is not available
    pdf.setFont('Helvetica', 'normal');
    pdf.setFont('Helvetica', 'bold');
  }
};

export const generatePDF = async (visit: Visit): Promise<void> => {
  // Create PDF with 8.5" x 11" dimensions (612 x 792 points)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [612, 792]
  });

  // Constants for styling
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 36;
  const contentWidth = pageWidth - (margin * 2);
  const colors = {
    navy: { r: 23, g: 37, b: 84 },
    lightGray: { r: 245, g: 245, b: 245 },
    borderGray: { r: 200, g: 200, b: 200 },
    textGray: { r: 80, g: 80, b: 80 },
    footerGray: { r: 128, g: 128, b: 128 }
  };

  // Set default font to Roboto
  addRobotoFont(pdf);

  // Header: Title bar with company branding and date
  pdf.setFillColor(colors.navy.r, colors.navy.g, colors.navy.b);
  pdf.rect(0, 0, pageWidth, 90, 'F');
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Site Visit Report', margin, 50);
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');
  pdf.text('Haskell', pageWidth - margin, 50, { align: 'right' });

  // Placeholder for company logo (uncomment and add actual image if available)
  // pdf.addImage(logoSrc, 'PNG', margin, 20, 60, 40);

  // Info Box: Clean grid layout
  pdf.setDrawColor(colors.borderGray.r, colors.borderGray.g, colors.borderGray.b);
  pdf.setLineWidth(0.5);
  pdf.setFillColor(colors.lightGray.r, colors.lightGray.g, colors.lightGray.b);
  pdf.rect(margin, 110, contentWidth, 90, 'FD');

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const labelWidth = 80;

  // Client
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Client:', margin + 10, 130);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(visit.clientName, margin + 10 + labelWidth, 130);

  // Site
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Site:', margin + 10, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(visit.siteName, margin + 10 + labelWidth, 150);

  // Project No.
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Project No.:', margin + 10, 170);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(visit.projectNo, margin + 10 + labelWidth, 170);

  // Date
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Date:', margin + 300, 130);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(new Date(visit.visitDate).toLocaleDateString(), margin + 300 + labelWidth, 130);

  // Engineer
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Prepared by:', margin + 300, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(visit.preparedBy, margin + 300 + labelWidth, 150);

  let yPosition = 232; // 200 (gray box end) + 32 (margin)

  // Background Section
  if (visit.background) {
    pdf.setFontSize(14);
    pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('1. Background & Purpose', margin, yPosition);
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.line(margin, yPosition + 5, margin + contentWidth, yPosition + 5);
    yPosition += 25;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    const backgroundLines = pdf.splitTextToSize(visit.background, contentWidth - 20);
    pdf.text(backgroundLines, margin + 10, yPosition);
    yPosition += backgroundLines.length * 14 + 20;

    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 60;
    }
  }

  // Observations Section
  if (visit.observations) {
    pdf.setFontSize(14);
    pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('2. Site Observations', margin, yPosition);
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.line(margin, yPosition + 5, margin + contentWidth, yPosition + 5);
    yPosition += 25;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    const observationLines = visit.observations.split('\n');
    let observationNumber = 1;
    observationLines.forEach((line) => {
      if (!line.trim()) return; // Skip empty lines
      
      // Check if line starts with tab character (indicating it should be a bullet point)
      if (line.startsWith('\t')) {
        // This is a tabbed line - use bullet point
        const cleanLine = line.substring(1); // Remove the tab character
        const bulletLine = `• ${cleanLine}`;
        const wrappedLines = pdf.splitTextToSize(bulletLine, contentWidth - 50);
        pdf.text(wrappedLines, margin + 30, yPosition); // Indent bullet points
        yPosition += wrappedLines.length * 14 + 5;
      } else {
        // This is a main line - use number
        const numberedLine = `${observationNumber}. ${line}`;
        const wrappedLines = pdf.splitTextToSize(numberedLine, contentWidth - 20);
        pdf.text(wrappedLines, margin + 10, yPosition);
        yPosition += wrappedLines.length * 14 + 5;
        observationNumber++;
      }

      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 60;
      }
    });
    yPosition += 15;
  }

  // Follow-ups Section
  if (visit.followups) {
    pdf.setFontSize(14);
    pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('3. Recommendations & Follow-up Actions', margin, yPosition);
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.line(margin, yPosition + 5, margin + contentWidth, yPosition + 5);
    yPosition += 25;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    const followupLines = visit.followups.split('\n');
    let followupLetter = 97; // Start with 'a'
    followupLines.forEach((line) => {
      if (!line.trim()) return; // Skip empty lines
      
      // Check if line starts with tab character (indicating it should be a bullet point)
      if (line.startsWith('\t')) {
        // This is a tabbed line - use bullet point
        const cleanLine = line.substring(1); // Remove the tab character
        const bulletLine = `• ${cleanLine}`;
        const wrappedLines = pdf.splitTextToSize(bulletLine, contentWidth - 50);
        pdf.text(wrappedLines, margin + 30, yPosition); // Indent bullet points
        yPosition += wrappedLines.length * 14 + 5;
      } else {
        // This is a main line - use letter
        const letter = String.fromCharCode(followupLetter);
        const letteredLine = `${letter}. ${line}`;
        const wrappedLines = pdf.splitTextToSize(letteredLine, contentWidth - 20);
        pdf.text(wrappedLines, margin + 10, yPosition);
        yPosition += wrappedLines.length * 14 + 5;
        followupLetter++;
      }

      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 60;
      }
    });
    yPosition += 15;
  }

  // Photos Section
  if (visit.photos && visit.photos.length > 0) {
    pdf.addPage();
    let yPosition = 60;

    pdf.setFontSize(14);
    pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Site Photos', margin, yPosition);
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.line(margin, yPosition + 5, margin + contentWidth, yPosition + 5);
    yPosition += 30;

    const photoWidth = 226; // Increased by 15% from 207pt
    const photoHeight = 170; // 4:3 aspect ratio, increased by 15% from 155pt
    const photosPerPage = 6; // 2 columns × 3 rows
    const photosPerRow = 2;
    const photoSpacing = 40; // Horizontal spacing between photos
    const rowSpacing = 228; // Photo (178) + caption (20) + notes (2 × 10 spacing) + 10pt margin

    for (let i = 0; i < visit.photos.length; i += photosPerPage) {
      if (i > 0) {
        pdf.addPage();
        yPosition = 60;
        
        // Add page header for subsequent photo pages
        pdf.setFontSize(14);
        pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Site Photos (continued)', margin, yPosition);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
        pdf.line(margin, yPosition + 5, margin + contentWidth, yPosition + 5);
        yPosition += 30;
      }

      // Process up to 6 photos on this page
      const photosOnThisPage = Math.min(photosPerPage, visit.photos.length - i);

      for (let j = 0; j < photosOnThisPage; j++) {
        const photoIndex = i + j;
        const photo = visit.photos[photoIndex];

        // Calculate position: 2 photos per row, 3 rows per page
        const row = Math.floor(j / photosPerRow); // 0, 1, or 2
        const col = j % photosPerRow; // 0 or 1

        const xPos = margin + (col * (photoWidth + photoSpacing));
        const yPos = yPosition + (row * rowSpacing);

        try {
          pdf.addImage(photo.src, 'JPEG', xPos, yPos, photoWidth, photoHeight);

          // Photo caption
          pdf.setFillColor(colors.navy.r, colors.navy.g, colors.navy.b);
          pdf.rect(xPos, yPos + photoHeight, photoWidth, 20, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          const label = photo.description 
            ? `Photo ${photoIndex + 1}: ${photo.description.substring(0, 35)}${photo.description.length > 35 ? '...' : ''}`
            : `Photo ${photoIndex + 1}`;
          pdf.text(label, xPos + 5, yPos + photoHeight + 14, { align: 'left' });

          // Photo notes
          if (photo.notes) {
            pdf.setFontSize(9);
            pdf.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
            const notesLines = pdf.splitTextToSize(photo.notes, photoWidth - 10);
            const maxLines = Math.min(2, notesLines.length);
            for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
              pdf.text(notesLines[lineIndex], xPos + 5, yPos + photoHeight + 30 + (lineIndex * 10));
            }
          }
        } catch (error) {
          console.error(`Error adding photo ${photoIndex + 1} to PDF:`, error);
          pdf.setFontSize(10);
          pdf.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
          pdf.text(`[Photo ${photoIndex + 1} failed to load]`, xPos, yPos + photoHeight / 2);
        }
      }
    }
  }

  // Footer: Add on every page
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(colors.footerGray.r, colors.footerGray.g, colors.footerGray.b);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 20);
    pdf.text('Haskell', pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  // Save PDF with sanitized file name
  const safeSiteName = visit.siteName.replace(/[^a-zA-Z0-9-_]/g, '');
  const safeDate = new Date(visit.visitDate).toISOString().split('T')[0].replace(/-/g, '');
  const fileName = `Site_Visit_Report_${safeSiteName}_${safeDate}.pdf`;
  try {
    pdf.save(fileName);
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw new Error('Failed to save PDF document');
  }
};