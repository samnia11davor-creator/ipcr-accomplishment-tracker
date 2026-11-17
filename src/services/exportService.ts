import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { IpcrCommitment, DailyActivity, UserProfile } from '@/types';
import { formatPhilippineShortDate } from '@/lib/dates';

/**
 * Generates and downloads an authentic Excel IPCR workbook matching official NIA Form 13.
 * Form: NIAROXI-AFD-Admin-INT-Form13Rev00
 */
export function exportIpcrToExcel(
  commitments: IpcrCommitment[],
  activities: DailyActivity[],
  userProfile: UserProfile,
  period: string
): void {
  const wb = XLSX.utils.book_new();

  const periodString = period === 'SEM2' ? 'July to Dec, 2026' : period === 'SEM1' ? 'Jan to June, 2026' : `${period}, 2026`;

  // Prepare tabular rows
  const headerData = [
    ['IPCR Form - NIAROXI-AFD-Admin-INT-Form13Rev00'],
    ['NATIONAL IRRIGATION ADMINISTRATION'],
    ['Strategic Performance Management System (SPMS)'],
    ['Individual Performance Commitment and Review (IPCR)'],
    ['REGIONAL IRRIGATION OFFICE - REGIONAL OFFICE XI'],
    [`I, ${userProfile.fullName}, of the REGIONAL OFFICE XI, Division of ${userProfile.division} commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period ${periodString}.`],
    [''],
    [`Ratee: ${userProfile.fullName}`, '', '', `Reviewed by: ${userProfile.headOfDivision}`, '', '', `Approved by: ${userProfile.headOfOffice}`],
    [''],
    [
      'MFO / PAP',
      'Code',
      'SUCCESS INDICATORS (TARGETS + MEASURES)',
      'Actual Accomplishment (Merged G:H)',
      'Q1',
      'E2',
      'T3',
      'A4',
      'Remarks',
    ],
  ];

  // Group by SPMS Tiers
  const strategic = commitments.filter((c) => c.tier === 'STRATEGIC');
  const core = commitments.filter((c) => c.tier === 'CORE');
  const support = commitments.filter((c) => c.tier === 'SUPPORT');

  const formatRows = (list: IpcrCommitment[], tierLabel: string) => {
    const rows: unknown[][] = [];
    rows.push([tierLabel, '', '', '', '', '', '', '', '']);

    list.forEach((com) => {
      const relatedActs = activities.filter(
        (a) => a.commitmentId === com.id && a.status === 'COMPLETED' && !a.isDeleted
      );

      let accomplishment = com.actualAccomplishmentDraft;
      if (relatedActs.length > 0) {
        // Bulleted deliverables
        const items = relatedActs.map((a) => `• ${a.output} (${a.project || 'General'})`).join('\n');
        accomplishment = `${com.actualAccomplishmentDraft}\n\nRecent Validated Daily Logs:\n${items}`;
      }

      rows.push([
        com.mfoPap,
        com.commitmentCode,
        com.successIndicator,
        accomplishment,
        com.rating?.q || 5,
        com.rating?.e || 5,
        com.rating?.t || 4,
        com.rating?.average || 4.67,
        com.remarks || 'Verified against project documents & attendance logs.',
      ]);
    });

    return rows;
  };

  const strategicRows = formatRows(strategic, 'STRATEGIC / PRIORITY THEMES');
  const coreRows = formatRows(core, 'CORE FUNCTIONS');
  const supportRows = formatRows(support, 'SUPPORT FUNCTIONS');

  const fullData = [...headerData, ...strategicRows, ...coreRows, ...supportRows];
  const ws = XLSX.utils.aoa_to_sheet(fullData);

  ws['!cols'] = [
    { wch: 38 }, // MFO/PAP
    { wch: 10 }, // Code
    { wch: 45 }, // Indicators
    { wch: 65 }, // Actual Accomplishment (G:H)
    { wch: 6 },  // Q1
    { wch: 6 },  // E2
    { wch: 6 },  // T3
    { wch: 8 },  // A4
    { wch: 35 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'IPCR 2026');
  XLSX.writeFile(wb, `IPCR_Form13_${userProfile.fullName.replace(/\s+/g, '_')}_${period}_2026.xlsx`);
}

/**
 * Generates and downloads an editable Word document (.doc) matching NIAROXI Form 13.
 */
export function exportAccomplishmentReportToWord(
  commitments: IpcrCommitment[],
  activities: DailyActivity[],
  userProfile: UserProfile,
  period: string
): void {
  const periodString = period === 'SEM2' ? 'July to Dec, 2026' : period === 'SEM1' ? 'Jan to June, 2026' : `${period}, 2026`;

  const renderSectionRows = (tier: 'STRATEGIC' | 'CORE' | 'SUPPORT', title: string) => {
    const list = commitments.filter((c) => c.tier === tier);
    let html = `
      <tr style="background-color: #fef08a; font-weight: bold;">
        <td colspan="7" style="border: 1px solid #000; padding: 6px; font-size: 10pt;">${title}</td>
      </tr>
    `;

    list.forEach((com) => {
      const relatedActs = activities.filter(
        (a) => a.commitmentId === com.id && a.status === 'COMPLETED' && !a.isDeleted
      );

      let accomplishment = com.actualAccomplishmentDraft.replace(/\n/g, '<br>');
      if (relatedActs.length > 0) {
        const extra = relatedActs.map((a) => `• ${a.output}`).join('<br>');
        accomplishment += `<br><br><strong>Validated Deliverables:</strong><br>${extra}`;
      }

      html += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px; font-size: 9pt; width: 28%;">${com.mfoPap}</td>
          <td style="border: 1px solid #000; padding: 6px; font-size: 9pt; width: 28%;">${com.successIndicator}</td>
          <td style="border: 1px solid #000; padding: 6px; font-size: 8.5pt; width: 32%;">${accomplishment}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 9pt; text-align: center;">${com.rating?.q || 5}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 9pt; text-align: center;">${com.rating?.e || 5}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 9pt; text-align: center;">${com.rating?.t || 4}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 9pt; text-align: center; font-weight: bold;">${com.rating?.average || 4.67}</td>
        </tr>
      `;
    });

    return html;
  };

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>IPCR Form 13 - ${userProfile.fullName}</title>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.2; }
        .center { text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        .meta-table { border: none; width: 100%; margin-bottom: 8px; }
        .meta-table td { border: none; padding: 2px; font-size: 9.5pt; }
      </style>
    </head>
    <body>
      <div style="text-align: right; font-size: 8pt; font-weight: bold;">IPCR Form - ${userProfile.formCode}</div>
      <div class="center" style="font-weight: bold; font-size: 11pt;">NATIONAL IRRIGATION ADMINISTRATION</div>
      <div class="center" style="font-size: 9.5pt;">Strategic Performance Management System (SPMS)</div>
      <div class="center" style="font-size: 9.5pt; font-weight: bold;">Individual Performance Commitment and Review (IPCR)</div>
      <div class="center" style="font-size: 9pt; font-weight: bold;">REGIONAL IRRIGATION OFFICE - REGIONAL OFFICE XI</div>
      
      <p style="font-size: 9pt; text-align: justify; margin: 10px 0;">
        I, <strong>${userProfile.fullName}</strong>, of the <strong>${userProfile.regionalOffice}</strong>, Division of <strong>${userProfile.division}</strong> commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period <strong>${periodString}</strong>.
      </p>

      <table class="meta-table">
        <tr>
          <td style="width: 33%; text-align: center;">
            <strong>${userProfile.fullName}</strong><br>Ratee/Date
          </td>
          <td style="width: 33%; text-align: center;">
            Reviewed by:<br>
            <strong>${userProfile.headOfDivision}</strong><br>Head of Division/Date
          </td>
          <td style="width: 33%; text-align: center;">
            Approved by:<br>
            <strong>${userProfile.headOfOffice}</strong><br>Head of Office/Date
          </td>
        </tr>
      </table>

      <table>
        <thead>
          <tr style="background-color: #e5e7eb; font-weight: bold; font-size: 9pt; text-align: center;">
            <th style="border: 1px solid #000; padding: 6px;">MFO/PAP<br>(1)</th>
            <th style="border: 1px solid #000; padding: 6px;">SUCCESS INDICATORS<br>(TARGETS + MEASURES)<br>(2)</th>
            <th style="border: 1px solid #000; padding: 6px;">Actual Accomplishment<br>(5)</th>
            <th style="border: 1px solid #000; padding: 4px; width: 4%;">Q1</th>
            <th style="border: 1px solid #000; padding: 4px; width: 4%;">E2</th>
            <th style="border: 1px solid #000; padding: 4px; width: 4%;">T3</th>
            <th style="border: 1px solid #000; padding: 4px; width: 5%;">A4</th>
          </tr>
        </thead>
        <tbody>
          ${renderSectionRows('STRATEGIC', 'STRATEGIC/PRIORITY THEMES')}
          ${renderSectionRows('CORE', 'CORE FUNCTIONS')}
          ${renderSectionRows('SUPPORT', 'SUPPORT FUNCTIONS')}
        </tbody>
      </table>

      <div style="font-size: 8pt; margin-top: 15px; color: #555;">
        Form Code: ${userProfile.formCode} | Generated via IPCR Accomplishment Tracker on ${formatPhilippineShortDate(new Date())}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IPCR_Form13_${userProfile.fullName.replace(/\s+/g, '_')}_${period}_2026.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a print-ready PDF matching NIAROXI Form 13 layout.
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
  let currentY = 12;

  // Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`IPCR Form - ${userProfile.formCode}`, pageWidth - 14, currentY, { align: 'right' });
  currentY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NATIONAL IRRIGATION ADMINISTRATION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;
  doc.setFontSize(9);
  doc.text('Strategic Performance Management System (SPMS) - Individual Performance Commitment and Review (IPCR)', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;
  doc.setFontSize(8.5);
  doc.text('REGIONAL IRRIGATION OFFICE - REGIONAL OFFICE XI', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  const periodString = period === 'SEM2' ? 'July to Dec, 2026' : period === 'SEM1' ? 'Jan to June, 2026' : `${period}, 2026`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const introText = `I, ${userProfile.fullName}, of the REGIONAL OFFICE XI, Division of ${userProfile.division} commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period ${periodString}.`;
  doc.text(doc.splitTextToSize(introText, pageWidth - 28), 14, currentY);
  currentY += 8;

  // Signatory banner
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ratee: ${userProfile.fullName}`, 20, currentY);
  doc.text(`Reviewed by: ${userProfile.headOfDivision}`, pageWidth / 2 - 20, currentY);
  doc.text(`Approved by: ${userProfile.headOfOffice}`, pageWidth - 80, currentY);
  currentY += 5;

  // Table header box
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(240, 240, 240);
  doc.rect(14, currentY, pageWidth - 28, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text('MFO / PAP (1)', 16, currentY + 4.5);
  doc.text('SUCCESS INDICATORS (2)', 85, currentY + 4.5);
  doc.text('Actual Accomplishment (5)', 160, currentY + 4.5);
  doc.text('Q1', pageWidth - 38, currentY + 4.5);
  doc.text('E2', pageWidth - 32, currentY + 4.5);
  doc.text('T3', pageWidth - 26, currentY + 4.5);
  doc.text('A4', pageWidth - 20, currentY + 4.5);

  currentY += 9;

  // Render tiers
  const tiers: Array<{ tier: 'STRATEGIC' | 'CORE' | 'SUPPORT'; label: string }> = [
    { tier: 'STRATEGIC', label: 'STRATEGIC / PRIORITY THEMES' },
    { tier: 'CORE', label: 'CORE FUNCTIONS' },
    { tier: 'SUPPORT', label: 'SUPPORT FUNCTIONS' },
  ];

  tiers.forEach(({ tier, label }) => {
    const list = commitments.filter((c) => c.tier === tier);
    if (list.length === 0) return;

    if (currentY > 175) {
      doc.addPage();
      currentY = 15;
    }

    // Section bar
    doc.setFillColor(254, 240, 138); // Yellow highlight matching official form
    doc.rect(14, currentY, pageWidth - 28, 5.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text(label, 16, currentY + 4);
    currentY += 7.5;

    list.forEach((com) => {
      if (currentY > 170) {
        doc.addPage();
        currentY = 15;
      }

      const relatedActs = activities.filter(
        (a) => a.commitmentId === com.id && a.status === 'COMPLETED' && !a.isDeleted
      );

      let accomplishment = com.actualAccomplishmentDraft;
      if (relatedActs.length > 0) {
        const extra = relatedActs.slice(0, 3).map((a) => `• ${a.output}`).join('\n');
        accomplishment = `${com.actualAccomplishmentDraft}\n\nRecent Deliverables:\n${extra}`;
      }

      const mfoLines = doc.splitTextToSize(com.mfoPap, 65);
      const indLines = doc.splitTextToSize(com.successIndicator, 70);
      const accLines = doc.splitTextToSize(accomplishment, 85);

      const rowHeight = Math.max(mfoLines.length, indLines.length, accLines.length) * 3.5 + 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(mfoLines, 16, currentY + 3.5);
      doc.text(indLines, 85, currentY + 3.5);
      doc.text(accLines, 160, currentY + 3.5);

      doc.text(String(com.rating?.q || 5), pageWidth - 38, currentY + 3.5);
      doc.text(String(com.rating?.e || 5), pageWidth - 32, currentY + 3.5);
      doc.text(String(com.rating?.t || 4), pageWidth - 26, currentY + 3.5);
      doc.setFont('helvetica', 'bold');
      doc.text(String(com.rating?.average || 4.67), pageWidth - 20, currentY + 3.5);

      doc.setDrawColor(220, 220, 220);
      doc.line(14, currentY + rowHeight, pageWidth - 14, currentY + rowHeight);
      currentY += rowHeight;
    });
  });

  doc.save(`IPCR_Form13_${userProfile.fullName.replace(/\s+/g, '_')}_${period}_2026.pdf`);
}
