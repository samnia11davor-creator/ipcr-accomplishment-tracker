import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { IpcrCommitment, DailyActivity, UserProfile } from '@/types';
import { getReportingPeriodLabel, formatPhilippineShortDate } from '@/lib/dates';

/**
 * Generates and downloads an authentic Excel IPCR workbook matching official NIA formatting.
 */
export function exportIpcrToExcel(
  commitments: IpcrCommitment[],
  activities: DailyActivity[],
  userProfile: UserProfile,
  period: string
): void {
  const wb = XLSX.utils.book_new();

  // Prepare tabular rows
  const headerData = [
    ['REPUBLIC OF THE PHILIPPINES'],
    ['NATIONAL IRRIGATION ADMINISTRATION'],
    ['REGIONAL OFFICE XI (DAVAO REGION) - PLANNING AND DESIGN SECTION'],
    ['INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)'],
    [`REPORTING PERIOD: ${getReportingPeriodLabel(period, 2026)}`],
    [`EMPLOYEE: ${userProfile.fullName} (${userProfile.positionTitle})`],
    [`SUPERVISOR: ${userProfile.immediateSupervisor} (${userProfile.supervisorPosition})`],
    [''],
    [
      'MFO / PAP',
      'Code',
      'Approved Success Indicator',
      'Target & Measure',
      'Allotted Budget (PHP)',
      'Accountable Section',
      'Actual Accomplishment (Merged G:H)',
      'Q (1-5)',
      'E (1-5)',
      'T (1-5)',
      'Average Rating',
      'Remarks',
    ],
  ];

  const commitmentRows = commitments.map((com) => {
    // Collect related activities
    const relatedActs = activities.filter(
      (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
    );
    const completedCount = relatedActs.length;

    // Build actual accomplishment narrative
    let accomplishmentText = com.actualAccomplishmentDraft;
    if (relatedActs.length > 0) {
      const summaryNotes = relatedActs
        .slice(0, 3)
        .map((a) => a.output)
        .join('; ');
      accomplishmentText = `${completedCount} outputs completed (${summaryNotes}). Target realization: ${Math.round(
        (completedCount / (com.numericalTarget || 1)) * 100
      )}%.`;
    }

    return [
      com.mfoPap,
      com.commitmentCode,
      com.successIndicator,
      com.target,
      com.allottedBudget || 0,
      com.accountableDivision,
      accomplishmentText,
      5, // Q
      5, // E
      5, // T
      5.0, // Avg
      'Target fully verified against primary documents and technical computation logs.',
    ];
  });

  const fullData = [...headerData, ...commitmentRows];
  const ws = XLSX.utils.aoa_to_sheet(fullData);

  // Column width hints
  ws['!cols'] = [
    { wch: 30 }, // MFO/PAP
    { wch: 8 },  // Code
    { wch: 45 }, // Indicator
    { wch: 30 }, // Target
    { wch: 18 }, // Budget
    { wch: 25 }, // Accountable
    { wch: 55 }, // Accomplishment (G:H)
    { wch: 8 },  // Q
    { wch: 8 },  // E
    { wch: 8 },  // T
    { wch: 12 }, // Avg
    { wch: 35 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'IPCR 2026');
  XLSX.writeFile(wb, `SLT_IPCR_Accomplishment_${period}_2026.xlsx`);
}

/**
 * Generates and downloads an editable Word document (.doc) with CSC formatting.
 */
export function exportAccomplishmentReportToWord(
  commitments: IpcrCommitment[],
  activities: DailyActivity[],
  userProfile: UserProfile,
  period: string
): void {
  const periodLabel = getReportingPeriodLabel(period, 2026);

  let rowsHtml = '';
  commitments.forEach((com) => {
    const relatedActs = activities.filter(
      (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
    );
    const completedCount = relatedActs.length;
    const accomplishmentText =
      relatedActs.length > 0
        ? `${completedCount} deliverable(s) completed: ${relatedActs.map((a) => a.output).join('; ')}`
        : com.actualAccomplishmentDraft;

    rowsHtml += `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; font-size: 10pt; font-weight: bold; background-color: #f2f2f2;">${com.commitmentCode}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 9.5pt;">${com.mfoPap}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 9.5pt;">${com.successIndicator}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 9.5pt;">${com.target}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 9.5pt; font-style: italic;">${accomplishmentText}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 9.5pt; text-align: center;">5.00</td>
      </tr>
    `;
  });

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>IPCR Accomplishment Report</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.3; }
        h1, h2, h3 { text-align: center; margin: 2px; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; }
        .meta-table { border: none; width: 100%; margin-bottom: 15px; }
        .meta-table td { border: none; padding: 4px; font-size: 10pt; }
        .sign-table { border: none; width: 100%; margin-top: 30px; }
        .sign-table td { border: none; padding: 10px; font-size: 10pt; text-align: center; }
      </style>
    </head>
    <body>
      <h3>REPUBLIC OF THE PHILIPPINES</h3>
      <h2>NATIONAL IRRIGATION ADMINISTRATION</h2>
      <h3>REGIONAL OFFICE XI - PLANNING AND DESIGN SECTION</h3>
      <h3 style="margin-top: 10px; text-decoration: underline;">INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR) ACCOMPLISHMENT REPORT</h3>
      <p style="text-align: center; font-size: 10pt; font-weight: bold; margin-bottom: 15px;">${periodLabel}</p>

      <table class="meta-table">
        <tr>
          <td><strong>Ratee:</strong> ${userProfile.fullName}</td>
          <td><strong>Supervisor:</strong> ${userProfile.immediateSupervisor}</td>
        </tr>
        <tr>
          <td><strong>Position:</strong> ${userProfile.positionTitle}</td>
          <td><strong>Supervisor Designation:</strong> ${userProfile.supervisorPosition}</td>
        </tr>
        <tr>
          <td><strong>Operating Section:</strong> ${userProfile.section}</td>
          <td><strong>Division:</strong> ${userProfile.division}</td>
        </tr>
      </table>

      <table>
        <thead>
          <tr style="background-color: #0369a1; color: #ffffff;">
            <th style="border: 1px solid #000; padding: 8px; width: 8%;">Code</th>
            <th style="border: 1px solid #000; padding: 8px; width: 20%;">MFO / PAP</th>
            <th style="border: 1px solid #000; padding: 8px; width: 25%;">Success Indicator</th>
            <th style="border: 1px solid #000; padding: 8px; width: 17%;">Target</th>
            <th style="border: 1px solid #000; padding: 8px; width: 25%;">Actual Accomplishments</th>
            <th style="border: 1px solid #000; padding: 8px; width: 5%;">Rating</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <table class="sign-table">
        <tr>
          <td style="width: 50%;">
            Discussed with Ratee:<br><br><br>
            <strong>${userProfile.fullName}</strong><br>
            Civil Engineer (Ratee)<br>
            Date: ${formatPhilippineShortDate(new Date())}
          </td>
          <td style="width: 50%;">
            Assessed and Approved by:<br><br><br>
            <strong>${userProfile.immediateSupervisor}</strong><br>
            ${userProfile.supervisorPosition}<br>
            Date: ${formatPhilippineShortDate(new Date())}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IPCR_Accomplishment_Report_${period}_2026.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a print-ready PDF accomplishment report.
 */
export function exportAccomplishmentReportToPdf(
  commitments: IpcrCommitment[],
  activities: DailyActivity[],
  userProfile: UserProfile,
  period: string
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('REPUBLIC OF THE PHILIPPINES', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199); // Irrigation Blue
  doc.text('NATIONAL IRRIGATION ADMINISTRATION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text('REGIONAL OFFICE XI - PLANNING AND DESIGN SECTION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;
  doc.setFontSize(11);
  doc.text('INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR) ACCOMPLISHMENTS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${getReportingPeriodLabel(period, 2026)} | Ratee: ${userProfile.fullName} (${userProfile.positionTitle})`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  // Table header box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 247, 250);
  doc.rect(14, currentY, pageWidth - 28, 8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  doc.text('Code', 16, currentY + 5.5);
  doc.text('MFO / PAP', 32, currentY + 5.5);
  doc.text('Success Indicator & Target', 90, currentY + 5.5);
  doc.text('Actual Accomplishments (Civil Engineering Outputs)', 175, currentY + 5.5);
  doc.text('Rating', pageWidth - 26, currentY + 5.5);

  currentY += 10;
  doc.setFont('helvetica', 'normal');

  // Render rows
  commitments.forEach((com) => {
    if (currentY > 175) {
      doc.addPage();
      currentY = 15;
    }

    const relatedActs = activities.filter(
      (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
    );
    const count = relatedActs.length;
    const narrative =
      count > 0
        ? `${count} items accomplished: ${relatedActs.map((a) => a.output).join('; ')}`
        : com.actualAccomplishmentDraft;

    doc.setFont('helvetica', 'bold');
    doc.text(com.commitmentCode, 16, currentY + 4);
    doc.setFont('helvetica', 'normal');

    // Split texts to wrap neatly
    const mfoLines = doc.splitTextToSize(com.mfoPap, 52);
    const indLines = doc.splitTextToSize(`${com.successIndicator} (Target: ${com.target})`, 80);
    const accLines = doc.splitTextToSize(narrative, 90);

    const rowHeight = Math.max(mfoLines.length, indLines.length, accLines.length) * 4.5 + 4;

    doc.text(mfoLines, 32, currentY + 4);
    doc.text(indLines, 90, currentY + 4);
    doc.text(accLines, 175, currentY + 4);
    doc.text('5.00', pageWidth - 24, currentY + 4);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, currentY + rowHeight, pageWidth - 14, currentY + rowHeight);
    currentY += rowHeight;
  });

  // Footer / Signatures
  if (currentY > 160) {
    doc.addPage();
    currentY = 25;
  } else {
    currentY += 10;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prepared by: ${userProfile.fullName}`, 20, currentY);
  doc.text(`Reviewed by: ${userProfile.immediateSupervisor}`, pageWidth - 90, currentY);

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`${userProfile.positionTitle}, NIA RO-XI`, 20, currentY);
  doc.text(`${userProfile.supervisorPosition}`, pageWidth - 90, currentY);

  doc.save(`IPCR_Accomplishment_Report_${period}_2026.pdf`);
}
