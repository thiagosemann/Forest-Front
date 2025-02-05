import { Component, OnInit } from '@angular/core';
import { PdfPrestacaoService } from 'src/app/shared/service/Pdf-Service/pdfPrestacaoService';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { NotaGastoComumService } from 'src/app/shared/service/Banco_de_Dados/notasGastosComuns_service';
import { PDFDocument } from 'pdf-lib'; // Adicione PDF-lib no seu projeto.
import { BuildingService } from 'src/app/shared/service/Banco_de_Dados/buildings_service';
import { Building } from 'src/app/shared/utilitarios/building';
import { CommonExpenseService } from 'src/app/shared/service/Banco_de_Dados/commonExpense_service';
import { CommonExpense } from 'src/app/shared/utilitarios/commonExpense';
import { ToastrService } from 'ngx-toastr';
import { ProvisaoService } from 'src/app/shared/service/Banco_de_Dados/provisao_service';
import { FundoService } from 'src/app/shared/service/Banco_de_Dados/fundo_service';
import { SaldoPorPredioService } from 'src/app/shared/service/Banco_de_Dados/saldo_por_predio_service';
import { GastosIndividuaisService } from 'src/app/shared/service/Banco_de_Dados/gastosIndividuais_service';

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
  commonExepenses: CommonExpense[] = [];

  constructor(
    private pdfPrestacaoService: PdfPrestacaoService,
    private sanitizer: DomSanitizer,
    private selectionService: SelectionService,
    private notaGastoComumService: NotaGastoComumService,
    private buildingService: BuildingService,
    private commonExepenseService: CommonExpenseService,
    private toastr: ToastrService,
    private provisaoService: ProvisaoService, // Injeta o novo service
    private fundoService: FundoService,
    private saldoPorPredioService: SaldoPorPredioService,
    private gastosIndividuaisService: GastosIndividuaisService,

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
      if ( this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
        let data = {
          selectedBuildingId: this.selectedBuildingId,
          selectedMonth: this.selectedMonth,
          selectedYear: this.selectedYear,
          notaFiscalList: [] as NotaFiscal[], // Tipagem explícita da lista de notas fiscais
          building:{},
          commonExpenses:{},
          gastosIndividuais:{},
          provisoes:{},
          fundos:{},
          saldos:{}
        };
    
        if (this.selectedBuildingId !== 0 && this.selectedMonth !== 0 && this.selectedYear !== 0) {
          // Busca e adiciona notas fiscais
          await this.addNotasFiscais(data);
          await this.getBuildingById(data);
          const { expenses, provisoes, fundos, saldos, gastosIndividuais } =  await this.loadValues();
          if(expenses){
            data.commonExpenses = expenses;
          }
          if(provisoes){
            data.provisoes = provisoes;
          }
          if(fundos){
            data.fundos = fundos;
          }
          if(saldos){
            data.saldos = saldos;
          }
          if(gastosIndividuais){
            data.gastosIndividuais = gastosIndividuais;
          }
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
      }else{
        this.toastr.warning("Selecione o prédio, o mês e o ano!")
      }
     
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isLoading = false;  // Finaliza o carregamento
    }
  }
  
  
  async loadValues(): Promise<{expenses: any[] | undefined; provisoes: any[] | undefined; fundos: any[] | undefined;saldos: any[] | undefined; gastosIndividuais: any[] | undefined;}> {
    try {
      const [expenses, provisoes, fundos, saldos,gastosIndividuais] = await Promise.all([
        this.commonExepenseService
          .getExpensesByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
          .toPromise(),
        this.provisaoService.getProvisoesByBuildingId(this.selectedBuildingId).toPromise(),
        this.fundoService.getFundosByBuildingId(this.selectedBuildingId).toPromise(),
        this.saldoPorPredioService.getSaldosByBuildingId(this.selectedBuildingId).toPromise(),
        this.gastosIndividuaisService.getIndividualExpensesByPredioMonthAndYear(this.selectedBuildingId, this.selectedMonth, this.selectedYear).toPromise(),
      ]);
  
      return { expenses, provisoes, fundos, saldos, gastosIndividuais };
    } catch (error) {
      console.error("Erro ao carregar valores:", error);
      // Retorne valores padrão ou propague o erro, conforme necessário
      return { expenses: [], provisoes: [], fundos: [], saldos: [], gastosIndividuais: [] };
    }
  }
  
  

  getBuildingById(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.buildingService.getBuildingById(this.selectedBuildingId).subscribe(
        (building: Building) => {
          data.building = building;
          resolve(); // Resolve a Promise quando a requisição é bem-sucedida
        },
        (error) => {
          console.error('Error fetching buildings:', error);
          reject(error); // Rejeita a Promise em caso de erro
        }
      );
    });
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
