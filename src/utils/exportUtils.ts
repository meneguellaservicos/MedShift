import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Shift, Hospital } from '../types';
import { formatDate, formatTime, formatCurrency } from './dateUtils';

interface ExportData {
  shifts: Shift[];
  hospitals: Hospital[];
  showEconomicValues: boolean;
  filterInfo: {
    hospitalName?: string;
    dateRange: string;
    totalShifts: number;
  };
}

// Convert image to base64 for PDF embedding
const getImageAsBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return '';
  }
};

export const exportToPDF = async (data: ExportData): Promise<void> => {
  const { shifts, hospitals, showEconomicValues, filterInfo } = data;
  
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  try {
    // Load and add logo
    const logoBase64 = await getImageAsBase64('/medshift e logo copy.png');
    if (logoBase64) {
      // Add logo (adjust size and position as needed)
      doc.addImage(logoBase64, 'PNG', 15, 15, 60, 20);
    }
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório de Plantões', pageWidth / 2, 50, { align: 'center' });

  // Report info
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Gerado em: ${reportDate}`, 15, 65);
  doc.text(`Período: ${filterInfo.dateRange}`, 15, 75);
  if (filterInfo.hospitalName) {
    doc.text(`Hospital: ${filterInfo.hospitalName}`, 15, 85);
  }
  doc.text(`Total de plantões: ${filterInfo.totalShifts}`, 15, filterInfo.hospitalName ? 95 : 85);

  // Summary statistics
  const totalHours = shifts.reduce((sum, shift) => sum + shift.totalHours, 0);
  const totalEarnings = shifts.reduce((sum, shift) => sum + shift.totalAmount, 0);
  const paidAmount = shifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0);
  const pendingAmount = totalEarnings - paidAmount;

  const startY = filterInfo.hospitalName ? 110 : 100;
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumo Geral', 15, startY);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`• Total de horas trabalhadas: ${totalHours.toFixed(1)}h`, 15, startY + 15);
  
  if (showEconomicValues) {
    doc.text(`• Total ganho: ${formatCurrency(totalEarnings)}`, 15, startY + 25);
    doc.text(`• Valor pago: ${formatCurrency(paidAmount)}`, 15, startY + 35);
    doc.text(`• Valor pendente: ${formatCurrency(pendingAmount)}`, 15, startY + 45);
  }

  // Prepare table data
  const tableStartY = showEconomicValues ? startY + 60 : startY + 30;
  
  const headers = ['Data', 'Hospital', 'Horário', 'Horas', 'Status'];
  if (showEconomicValues) {
    headers.push('Valor');
  }

  const tableData = shifts.map(shift => {
    const hospital = hospitals.find(h => h.id === shift.hospitalId);
    const row = [
      formatDate(shift.startDate),
      hospital?.name || 'N/A',
      `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
      `${shift.totalHours.toFixed(1)}h`,
      shift.isPaid ? 'Pago' : 'Pendente'
    ];
    
    if (showEconomicValues) {
      row.push(formatCurrency(shift.totalAmount));
    }
    
    return row;
  });

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: tableStartY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Data
      1: { cellWidth: 40 }, // Hospital
      2: { cellWidth: 35 }, // Horário
      3: { cellWidth: 20 }, // Horas
      4: { cellWidth: 25 }, // Status
      ...(showEconomicValues && { 5: { cellWidth: 25 } }), // Valor
    },
    margin: { left: 15, right: 15 },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;
  if (finalY < pageHeight - 30) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Relatório gerado pelo MedShift - Sistema de Gestão de Plantões Médicos', 
             pageWidth / 2, pageHeight - 15, { align: 'center' });
  }

  // Save the PDF
  const fileName = `relatorio-plantoes-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportToCSV = (data: ExportData): void => {
  const { shifts, hospitals, showEconomicValues, filterInfo } = data;
  
  // Prepare CSV headers
  const headers = ['Data', 'Hospital', 'Horário Início', 'Horário Fim', 'Total Horas', 'Status'];
  if (showEconomicValues) {
    headers.push('Valor (R$)');
  }
  headers.push('Observações');

  // Prepare CSV data
  const csvData = shifts.map(shift => {
    const hospital = hospitals.find(h => h.id === shift.hospitalId);
    const row = [
      formatDate(shift.startDate),
      hospital?.name || 'N/A',
      formatTime(shift.startTime),
      formatTime(shift.endTime),
      shift.totalHours.toFixed(1),
      shift.isPaid ? 'Pago' : 'Pendente'
    ];
    
    if (showEconomicValues) {
      row.push(shift.totalAmount.toFixed(2).replace('.', ','));
    }
    
    row.push(shift.notes || '');
    
    return row;
  });

  // Add summary information at the top
  const summaryData = [
    ['RELATÓRIO DE PLANTÕES - MEDSHIFT'],
    [''],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`],
    [`Período: ${filterInfo.dateRange}`],
    ...(filterInfo.hospitalName ? [[`Hospital: ${filterInfo.hospitalName}`]] : []),
    [`Total de plantões: ${filterInfo.totalShifts}`],
    [`Total de horas: ${shifts.reduce((sum, shift) => sum + shift.totalHours, 0).toFixed(1)}`],
    ...(showEconomicValues ? [
      [`Total ganho: R$ ${shifts.reduce((sum, shift) => sum + shift.totalAmount, 0).toFixed(2).replace('.', ',')}`],
      [`Valor pago: R$ ${shifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0).toFixed(2).replace('.', ',')}`],
      [`Valor pendente: R$ ${(shifts.reduce((sum, shift) => sum + shift.totalAmount, 0) - shifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0)).toFixed(2).replace('.', ',')}`]
    ] : []),
    [''],
    ['DETALHAMENTO DOS PLANTÕES:'],
    ['']
  ];

  // Combine summary and detail data
  const allData = [
    ...summaryData,
    headers,
    ...csvData
  ];

  // Convert to CSV string
  const csvContent = allData.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio-plantoes-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Hospital breakdown export
export const exportHospitalBreakdownToPDF = async (data: ExportData): Promise<void> => {
  const { shifts, hospitals, showEconomicValues, filterInfo } = data;
  
  // Calculate hospital breakdown
  const hospitalBreakdown = hospitals.map(hospital => {
    const hospitalShifts = shifts.filter(s => s.hospitalId === hospital.id);
    return {
      hospitalName: hospital.name,
      shifts: hospitalShifts.length,
      hours: hospitalShifts.reduce((sum, shift) => sum + shift.totalHours, 0),
      earnings: hospitalShifts.reduce((sum, shift) => sum + shift.totalAmount, 0),
      paidEarnings: hospitalShifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0),
    };
  }).filter(h => h.shifts > 0);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  try {
    // Load and add logo
    const logoBase64 = await getImageAsBase64('/medshift e logo copy.png');
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 15, 60, 20);
    }
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório por Hospital', pageWidth / 2, 50, { align: 'center' });

  // Report info
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Gerado em: ${reportDate}`, 15, 65);
  doc.text(`Período: ${filterInfo.dateRange}`, 15, 75);

  // Prepare table data
  const headers = ['Hospital', 'Plantões', 'Horas'];
  if (showEconomicValues) {
    headers.push('Total Ganho', 'Valor Pago', 'Pendente');
  }

  const tableData = hospitalBreakdown.map(hospital => {
    const row = [
      hospital.hospitalName,
      hospital.shifts.toString(),
      `${hospital.hours.toFixed(1)}h`
    ];
    
    if (showEconomicValues) {
      row.push(
        formatCurrency(hospital.earnings),
        formatCurrency(hospital.paidEarnings),
        formatCurrency(hospital.earnings - hospital.paidEarnings)
      );
    }
    
    return row;
  });

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 90,
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 15, right: 15 },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  if (finalY < pageHeight - 30) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Relatório gerado pelo MedShift - Sistema de Gestão de Plantões Médicos', 
             pageWidth / 2, pageHeight - 15, { align: 'center' });
  }

  // Save the PDF
  const fileName = `relatorio-hospitais-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};