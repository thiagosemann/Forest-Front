import { Component, OnInit } from '@angular/core';
import { PdfPrestacaoService } from 'src/app/shared/service/Pdf-Service/pdfPrestacaoService';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { NotaGastoComumService } from 'src/app/shared/service/Banco_de_Dados/notasGastosComuns_service';
import { PDFDocument } from 'pdf-lib'; // Adicione PDF-lib no seu projeto.

// Definição da interface para tipar a nota fiscal
interface NotaFiscal {
  arquivoPdfBase64: string;
}

@Component({
  selector: 'app-pdf-prestacao',
  templateUrl: './pdf-prestacao.component.html',
  styleUrls: ['./pdf-prestacao.component.css']
})
export class PdfPrestacaoComponent implements OnInit {

  pdfSrc: SafeResourceUrl | null = null;
  selectedBuildingId: number = 0;
  selectedMonth: number = 0;
  selectedYear: number = 0;
  isLoading: boolean = false;  // Variável para controle de loading

  constructor(
    private pdfPrestacaoService: PdfPrestacaoService,
    private sanitizer: DomSanitizer,
    private selectionService: SelectionService,
    private notaGastoComumService: NotaGastoComumService
  ) {}

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.previewPDF();
    });
  }

  async previewPDF(): Promise<void> {
    try {
      this.isLoading = true;  // Inicia o carregamento

      let data = {
        selectedBuildingId: this.selectedBuildingId,
        selectedMonth: this.selectedMonth,
        selectedYear: this.selectedYear,
        notaFiscalList: [] as NotaFiscal[] // Tipagem explícita da lista de notas fiscais
      };
  
      if (this.selectedBuildingId !== 0 && this.selectedMonth !== 0 && this.selectedYear !== 0) {
        // Busca e adiciona notas fiscais
        await this.addNotasFiscais(data);
  
        if (data.notaFiscalList.length > 0) {
          // Gera o PDF da capa e remove a parte do cabeçalho
          const capaPdf = await this.pdfPrestacaoService.generatePdfPrestacao(data);
  
          // Remove a parte "data:application/pdf;filename=generated.pdf;base64," da string base64
          const base64Pdf = capaPdf.split(',')[1];
  
          // Adiciona o PDF gerado da capa na primeira posição da lista
          data.notaFiscalList.unshift({ arquivoPdfBase64: base64Pdf }); // Usando unshift para colocar no início
          
          console.log(data); // Verifica o conteúdo da variável 'data'
  
          // Mescla os blobs em um único PDF
          const mergedPdfBlob = await this.mergePdfBlobs(data.notaFiscalList);
  
          if (mergedPdfBlob) {
            const url = window.URL.createObjectURL(mergedPdfBlob);
            this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isLoading = false;  // Finaliza o carregamento
    }
  }
  
  

  // Método para buscar e adicionar as notas fiscais
  async addNotasFiscais(data: any): Promise<void> {
    try {
      const notas = await this.notaGastoComumService.getNotasByBuildingAndMonth(
        data.selectedBuildingId,
        data.selectedMonth,
        data.selectedYear
      ).toPromise(); // Converte para Promise usando toPromise()

      if (notas) {
        notas.forEach(nota => {
          if (nota.documentBlob) {
            data.notaFiscalList.push({
              arquivoPdfBase64: nota.documentBlob
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  // Método para mesclar blobs de PDF
  async mergePdfBlobs(notaFiscalList: NotaFiscal[]): Promise<Blob | null> {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const nota of notaFiscalList) {
        if (nota.arquivoPdfBase64 && typeof nota.arquivoPdfBase64 === 'string') {
          // Decodifica Base64 para Uint8Array
          const pdfBytes = new Uint8Array(atob(nota.arquivoPdfBase64).split('').map(c => c.charCodeAt(0)));

          const pdfDoc = await PDFDocument.load(pdfBytes); // Passa o Uint8Array para o PDF-lib

          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      return new Blob([mergedPdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return null;
    }
  }
}
