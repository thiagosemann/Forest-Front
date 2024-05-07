import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver'; // Importando corretamente

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

exportToExcel(data: any[], fileName: string) {
    // Criar uma planilha a partir dos dados fornecidos
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      header: [
        "Apartamento", "Água(m3)", "Gás(m3)","Lazer", "Lavanderia", "Multa"]
    });
    // Definir largura de coluna para a coluna A (Apartamento) como 20
    const columnWidths = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]; // Definir larguras para cada coluna, você pode ajustar conforme necessário

    // Aplicar as larguras das colunas
    worksheet['!cols'] = columnWidths;

    // Criar o livro de trabalho
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Converter o livro de trabalho em uma matriz de bytes
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Criar um blob a partir dos bytes
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Salvar o arquivo
    FileSaver.saveAs(blob, fileName + '.xlsx');
}

  
  
}
