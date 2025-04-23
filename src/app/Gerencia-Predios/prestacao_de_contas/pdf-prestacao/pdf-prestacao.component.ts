import { Component, OnInit } from '@angular/core';
import { PdfPrestacaoService } from 'src/app/shared/service/Pdf-Service/pdfPrestacaoService';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { NotaGastoComumService } from 'src/app/shared/service/Banco_de_Dados/notasGastosComuns_service';
import { PDFDocument } from 'pdf-lib'; // Certifique-se de ter instalado o pdf-lib
import { BuildingService } from 'src/app/shared/service/Banco_de_Dados/buildings_service';
import { Building } from 'src/app/shared/utilitarios/building';
import { CommonExpenseService } from 'src/app/shared/service/Banco_de_Dados/commonExpense_service';
import { CommonExpense } from 'src/app/shared/utilitarios/commonExpense';
import { ToastrService } from 'ngx-toastr';
import { ProvisaoService } from 'src/app/shared/service/Banco_de_Dados/provisao_service';
import { FundoService } from 'src/app/shared/service/Banco_de_Dados/fundo_service';
import { SaldoPorPredioService } from 'src/app/shared/service/Banco_de_Dados/saldo_por_predio_service';
import { GastosIndividuaisService } from 'src/app/shared/service/Banco_de_Dados/gastosIndividuais_service';
import { ExtratoPdfService } from 'src/app/shared/service/Banco_de_Dados/extratopdf_service';
import { ExtratoPdf } from 'src/app/shared/utilitarios/extratoPdf';
import { firstValueFrom } from 'rxjs';
import { RateioPorApartamentoService } from 'src/app/shared/service/Banco_de_Dados/rateioPorApartamento_service';
import { PrestacaoCobrancaBoletoService } from 'src/app/shared/service/Banco_de_Dados/prestacaoCobrancaBoletos_service';

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
    private extratoPdfService: ExtratoPdfService,
    private rateioPorApartamentoService:RateioPorApartamentoService,
    private prestacaoCobrancaBoletoService: PrestacaoCobrancaBoletoService

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
      this.isLoading = true; // Inicia o carregamento
  
      if (this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
        // Inicializa o objeto data com todas as propriedades necessárias
        let data: any = {
          selectedBuildingId: this.selectedBuildingId,
          selectedMonth: this.selectedMonth,
          selectedYear: this.selectedYear,
          notaFiscalList: [] as NotaFiscal[],
          extratosList: [] as ExtratoPdf[],
          building: {},
          commonExpenses: [] as any[],
          gastosIndividuais: [] as any[],
          provisoes: [] as any[],
          fundos: [] as any[],
          saldos: [] as any[],
          rateiosNaoPagos: [] as any[],
          rateiosGeradosEPagosNoMesCorreto: [] as any[],
          rateiosPagosGeradosEmMesesDiferentes: [] as any[]
        };
  
        // Adiciona as notas fiscais e os PDFs de extrato
        await this.addNotasFiscais(data);
        await this.addPdfExtrato(data);
        await this.getBuildingById(data);
  
        // Carrega os demais valores e os rateios, atribuindo ao objeto data
        const {
          expenses,
          provisoes,
          fundos,
          saldos,
          gastosIndividuais,
          rateiosNaoPagos,
          rateiosGeradosEPagosNoMesCorreto,
          rateiosPagosGeradosEmMesesDiferentes,
          pdfCobrancaBoletos
        } = await this.loadValues();
  
        data.commonExpenses = expenses;
        data.provisoes = provisoes;
        data.fundos = fundos;
        data.saldos = saldos;
        data.gastosIndividuais = gastosIndividuais;
        data.rateiosNaoPagos = rateiosNaoPagos;
        data.rateiosGeradosEPagosNoMesCorreto = rateiosGeradosEPagosNoMesCorreto;
        data.rateiosPagosGeradosEmMesesDiferentes = rateiosPagosGeradosEmMesesDiferentes;
        data.pdfCobrancaBoletos = pdfCobrancaBoletos;
  
        // Gera o PDF da capa (cover)
        const capaPdf = await this.pdfPrestacaoService.generatePdfPrestacao(data);
        // Remove a parte "data:application/pdf;filename=generated.pdf;base64," da string base64
        const base64Capa = capaPdf.split(',')[1];
  
        // Cria um array que armazena os PDFs na ordem desejada:
        // 1. Capa
        // 2. PDFs do Extrato
        // 3. PDFs das Notas Fiscais
        const pdfOrder: any[] = [];
        pdfOrder.push({ arquivoPdfBase64: base64Capa });
        if( data.pdfCobrancaBoletos.length>0){
          pdfOrder.push({ arquivoPdfBase64: data.pdfCobrancaBoletos[0].pdf });
        }
        data.extratosList.forEach((pdf: any) => pdfOrder.push(pdf));
        data.notaFiscalList.forEach((pdf: any) => pdfOrder.push(pdf));

        // Mescla os PDFs na ordem definida
        const mergedPdfBlob = await this.mergePdfBlobs(pdfOrder);
        if (mergedPdfBlob) {
          const url = window.URL.createObjectURL(mergedPdfBlob);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      } else {
        this.toastr.warning("Selecione o prédio, o mês e o ano!");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      this.isLoading = false; // Finaliza o carregamento
    }
  }
  

  async loadValues(): Promise<{ 
    expenses: any[]; 
    provisoes: any[]; 
    fundos: any[]; 
    saldos: any[]; 
    gastosIndividuais: any[];
    rateiosNaoPagos: any[];
    rateiosGeradosEPagosNoMesCorreto: any[];
    rateiosPagosGeradosEmMesesDiferentes: any[];
    pdfCobrancaBoletos: any[];
  }> {
    // Cada chamada é envelopada em um catch para retornar [] em caso de erro.
    const expensesPromise = firstValueFrom(
      this.commonExepenseService.getExpensesByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
    ).catch(error => {
      console.error("Erro em getExpensesByBuildingAndMonth:", error);
      return [];
    });
  
    const provisoesPromise = firstValueFrom(
      this.provisaoService.getProvisoesByBuildingId(this.selectedBuildingId)
    ).catch(error => {
      console.error("Erro em getProvisoesByBuildingId:", error);
      return [];
    });
  
    const fundosPromise = firstValueFrom(
      this.fundoService.getFundosByBuildingId(this.selectedBuildingId)
    ).catch(error => {
      console.error("Erro em getFundosByBuildingId:", error);
      return [];
    });
  
    const saldosPromise = firstValueFrom(
      this.saldoPorPredioService.getSaldosByBuildingId(this.selectedBuildingId)
    ).catch(error => {
      console.error("Erro em getSaldosByBuildingId:", error);
      return [];
    });
  
    const gastosIndividuaisPromise = firstValueFrom(
      this.gastosIndividuaisService.getIndividualExpensesByPredioMonthAndYear(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
    ).catch(error => {
      console.error("Erro em getIndividualExpensesByPredioMonthAndYear:", error);
      return [];
    });
  
    const rateiosNaoPagosPromise = firstValueFrom(
      this.rateioPorApartamentoService.getRateiosNaoPagosPorPredioId(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
    ).catch(error => {
      console.error("Erro em getRateiosNaoPagosPorPredioId:", error);
      return [];
    });
  
    const rateiosGeradosEPagosNoMesCorretoPromise = firstValueFrom(
      this.rateioPorApartamentoService.getRateiosGeradosEPagosNoMesCorreto(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
    ).catch(error => {
      console.error("Erro em getRateiosGeradosEPagosNoMesCorreto:", error);
      return [];
    });
  
    const pdfCobrancaBoletosPromise = firstValueFrom(
      this.prestacaoCobrancaBoletoService.getPrestacaoCobrancaBoletoByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
    ).catch(error => {
      console.error("Erro em getRateiosGeradosEPagosNoMesCorreto:", error);
      return [];
    });
    const rateiosPagosGeradosEmMesesDiferentesPromise = firstValueFrom(
      this.rateioPorApartamentoService.getRateiosPagosGeradosEmMesesDiferentes(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
    ).catch(error => {
      console.error("Erro em getRateiosPagosGeradosEmMesesDiferentes:", error);
      return [];
    });
  
    // Executa todas as promises em paralelo
    const [
      expenses, 
      provisoes, 
      fundos, 
      saldos, 
      gastosIndividuais,
      rateiosNaoPagos,
      rateiosGeradosEPagosNoMesCorreto,
      rateiosPagosGeradosEmMesesDiferentes,
      pdfCobrancaBoletos
    ] = await Promise.all([
      expensesPromise,
      provisoesPromise,
      fundosPromise,
      saldosPromise,
      gastosIndividuaisPromise,
      rateiosNaoPagosPromise,
      rateiosGeradosEPagosNoMesCorretoPromise,
      rateiosPagosGeradosEmMesesDiferentesPromise,
      pdfCobrancaBoletosPromise
    ]);
  
    return { 
      expenses, 
      provisoes, 
      fundos, 
      saldos, 
      gastosIndividuais,
      rateiosNaoPagos,
      rateiosGeradosEPagosNoMesCorreto,
      rateiosPagosGeradosEmMesesDiferentes,
      pdfCobrancaBoletos
    };
  }
  

  getBuildingById(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.buildingService.getBuildingById(this.selectedBuildingId).subscribe(
        (building: Building) => {
          data.building = building;
          resolve();
        },
        (error) => {
          console.error('Error fetching buildings:', error);
          reject(error);
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
      ).toPromise();

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
      console.error('Error fetching notas fiscais:', error);
    }
  }

  // Método para buscar e adicionar os PDFs de extrato
  async addPdfExtrato(data: any): Promise<void> {
    try {
      const extratos = await this.extratoPdfService.getExtratosPdfByBuildingMonthYear(
        data.selectedBuildingId,
        data.selectedMonth,
        data.selectedYear
      ).toPromise();
      if (extratos && extratos.length > 0) {
        // Ordena os extratos para que os do tipo 'conta' fiquem por último
        extratos.sort((a, b) => {
          if (a.tipo === 'conta' && b.tipo !== 'conta') {
            return 1;
          }
          if (b.tipo === 'conta' && a.tipo !== 'conta') {
            return -1;
          }
          return 0;
        });

        extratos.forEach(extrato => {
          if (extrato) {
            data.extratosList.push({
              arquivoPdfBase64: extrato.documento
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching extratos:', error);
    }
  }


  // Método para mesclar blobs de PDF usando PDF-lib
  async mergePdfBlobs(pdfs: any[]): Promise<Blob | null> {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfs) {
        if (item.arquivoPdfBase64 && typeof item.arquivoPdfBase64 === 'string') {
          // Converte Base64 para Uint8Array
          const pdfBytes = new Uint8Array(atob(item.arquivoPdfBase64).split('').map(c => c.charCodeAt(0)));
          const pdfDoc = await PDFDocument.load(pdfBytes);
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
