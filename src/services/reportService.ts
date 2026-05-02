import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export const reportService = {
  exportToCSV(data: any[], filename: string) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  },

  exportToExcel(data: any[], filename: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  },

  exportToPDF(data: any[], filename: string, title: string) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    let y = 30;
    data.forEach((item, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const text = Object.entries(item)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      doc.text(text, 14, y);
      y += 10;
    });

    doc.save(`${filename}.pdf`);
  }
};
