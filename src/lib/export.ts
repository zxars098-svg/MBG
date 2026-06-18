import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDate } from './utils';

interface ReportMeta {
  title: string;
  periode: string;
  adminName: string;
  gudangName?: string;
}

function pdfHeader(doc: jsPDF, meta: ReportMeta) {
  const gudang = meta.gudangName ?? 'Gudang MBG';
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(gudang, pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Inventory Gudang MBG', pageWidth / 2, 22, { align: 'center' });

  doc.setDrawColor(220);
  doc.line(14, 27, pageWidth - 14, 27);

  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.text(meta.title, 14, 36);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90);
  doc.text('Periode: ' + meta.periode, 14, 42);
}

function pdfFooter(doc: jsPDF, meta: ReportMeta) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(14, pageHeight - 28, pageWidth - 14, pageHeight - 28);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    doc.text('Dicetak: ' + new Date().toLocaleString('id-ID'), 14, pageHeight - 21);
    doc.text('Admin: ' + meta.adminName, pageWidth / 2, pageHeight - 21, { align: 'center' });
    doc.text('Halaman ' + i + ' / ' + pageCount, pageWidth - 14, pageHeight - 21, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor(40);
    doc.text('Mengetahui,', pageWidth - 70, pageHeight - 14);
    doc.text('Kepala Gudang', pageWidth - 70, pageHeight - 10);
    doc.text('(________________)', pageWidth - 70, pageHeight - 4);
  }
}

export function exportPDF(
  meta: ReportMeta,
  columns: string[],
  rows: (string | number)[][],
  orientation: 'portrait' | 'landscape' = 'portrait',
  summary?: { label: string; value: string }[]
) {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  pdfHeader(doc, meta);
  autoTable(doc, {
    head: [columns],
    body: rows.map((r) => r.map((c) => String(c))),
    startY: 48,
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [230, 230, 230], lineWidth: 0.1 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });
  if (summary && summary.length) {
    let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    summary.forEach((s) => {
      doc.text(s.label + ': ' + s.value, 14, y);
      y += 5;
    });
  }
  pdfFooter(doc, meta);
  doc.save(meta.title.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
}

export function exportExcel(meta: ReportMeta, columns: string[], rows: (string | number)[][], sheetName = 'Laporan') {
  const wsData = [
    [meta.gudangName ?? 'Gudang MBG'],
    ['Sistem Inventory Gudang MBG'],
    [meta.title],
    ['Periode: ' + meta.periode],
    ['Dicetak: ' + new Date().toLocaleString('id-ID'), 'Admin: ' + meta.adminName],
    [],
    columns,
    ...rows,
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, meta.title.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}

export function buildPrintHTML(meta: ReportMeta, columns: string[], rows: (string | number)[][], orientation: 'portrait' | 'landscape' = 'portrait'): string {
  const ths = columns.map((c) => '<th>' + c + '</th>').join('');
  const trs = rows.map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('');
  const orient = orientation === 'landscape' ? 'landscape' : 'portrait';
  return [
    '<!doctype html><html><head><meta charset="utf-8"><title>' + meta.title + '</title>',
    '<style>',
    '@page { size: A4 ' + orient + '; margin: 14mm; }',
    '* { box-sizing: border-box; }',
    "body { font-family: 'Inter','Segoe UI',Arial,sans-serif; color:#1f2937; margin:0; }",
    '.print-header { text-align:center; border-bottom:2px solid #2563EB; padding-bottom:8px; margin-bottom:14px; }',
    '.print-header h1 { font-size:18px; color:#2563EB; margin:0; }',
    '.print-header p { font-size:11px; color:#6b7280; margin:2px 0; }',
    '.print-title { font-size:15px; font-weight:700; margin:10px 0 2px; }',
    '.print-periode { font-size:11px; color:#6b7280; margin-bottom:10px; }',
    'table { width:100%; border-collapse:collapse; font-size:11px; }',
    'thead th { background:#2563EB; color:#fff; padding:7px 8px; text-align:left; font-weight:600; border:1px solid #1d4ed8; }',
    'tbody td { padding:6px 8px; border:1px solid #e5e7eb; }',
    'tbody tr:nth-child(even){ background:#f8fafc; }',
    '.print-footer { margin-top:18px; border-top:1px solid #e5e7eb; padding-top:8px; display:flex; justify-content:space-between; font-size:10px; color:#6b7280; }',
    '.sign { margin-top:30px; text-align:right; font-size:11px; }',
    '.sign .line { margin-top:40px; }',
    '@media print { .no-print { display:none; } }',
    '</style></head><body>',
    '<div class="print-header"><h1>' + (meta.gudangName ?? 'Gudang MBG') + '</h1><p>Sistem Inventory Gudang MBG</p></div>',
    '<div class="print-title">' + meta.title + '</div>',
    '<div class="print-periode">Periode: ' + meta.periode + '</div>',
    '<table><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table>',
    '<div class="print-footer"><span>Dicetak: ' + formatDate(new Date().toISOString()) + '</span><span>Admin: ' + meta.adminName + '</span></div>',
    '<div class="sign">Mengetahui,<br>Kepala Gudang<br><div class="line">(________________)</div></div>',
    '<script>window.onload=function(){window.print();}</script>',
    '</body></html>',
  ].join('');
}

export function printReport(meta: ReportMeta, columns: string[], rows: (string | number)[][], orientation: 'portrait' | 'landscape' = 'portrait') {
  const html = buildPrintHTML(meta, columns, rows, orientation);
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
