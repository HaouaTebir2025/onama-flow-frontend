import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportToExcel(data: any[], fileName: string, sheetName: string = 'Données') {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportStagiairesToExcel(stagiaires: any[], fileName: string = 'liste_stagiaires') {
    const data = stagiaires.map(s => ({
      'ID': s.id,
      'Nom': s.nom,
      'Prénom': s.prenom,
      'Email': s.email || '',
      'Téléphone': s.telephone || '',
      'Université': s.universite || '',
      'Type': s.type === 'ACADEMIQUE' ? 'Académique' : 'Perfectionnement',
      'Statut': s.statut,
      'Direction': s.direction || '',
      'Service': s.service || '',
      'Date dépôt': s.dateDepot || ''
    }));
    
    this.exportToExcel(data, fileName, 'Stagiaires');
  }
}