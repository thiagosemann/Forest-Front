import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { Building } from '../shared/utilitarios/building';
import { ToastrService } from 'ngx-toastr';
import { Apartamento } from '../shared/utilitarios/apartamento';
import { GastoIndividual } from '../shared/utilitarios/gastoIndividual';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { Rateio } from '../shared/utilitarios/rateio';
import { RateioService } from '../shared/service/Banco_de_Dados/rateio_service';
import { SelectionService } from '../shared/service/selectionService';
import { PdfService } from '../shared/service/Pdf-Service/pdfService';
import { CommonExpenseService } from '../shared/service/Banco_de_Dados/commonExpense_service';
import { GastosIndividuaisService } from '../shared/service/Banco_de_Dados/gastosIndividuais_service';


@Component({
  selector: 'app-rateio',
  templateUrl: './rateio.component.html',
  styleUrls: ['./rateio.component.css']
})
export class RateioComponent implements OnInit {
  buildings: Building[] = [];
  gastoComumValor : number=0;
  gastoComumValorTotal: number=0;
  gastoIndividualValorTotal:number=0;
  apartamentos: Apartamento[] = [];
  gastosIndividuais:GastoIndividual[]=[];
  usersRateio:any[]=[];
  provisoesRateadas:number=0;
  fundosRateados:number=0;
  mensagemErro: string = '';
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;
  loading: boolean = false;
  textoLoading:string="Carregando...";
  loadingPercentage: number = 0;  // Nova variável para a porcentagem de carregamento
  cancelDownload: boolean = false;  // Variável para controlar o cancelamento
  downloading: boolean = false;
  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private rateioService: RateioService, 
    private selectionService: SelectionService,
    private pdfService: PdfService,
    private commonExepenseService: CommonExpenseService,
    private gastosIndividuaisService: GastosIndividuaisService,

  ) {}
  ngOnInit(): void {
    this.getAllBuildings();

    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.changeSelect();
    });
  }
  
  getAllBuildings(): void {
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  }




  changeSelect(): void {
    if(this.selectedBuildingId==0 || this.selectedMonth==0 || this.selectedYear==0){
      return
    }
    
    if (this.selectedMonth != 0 && this.selectedYear != 0 && this.selectedBuildingId != 0) {
      this.loading = true; // Iniciar o loading
      this.mensagemErro = ''; // Limpar mensagem de erro
  
      this.rateioService.getRateioByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
        (resp: any) => {
          this.loading = false; // Encerrar o loading
          if (resp.rateio) {
            this.usersRateio = resp.rateio;
          } else {
            this.mensagemErro = 'Insira todos os dados necessários para se realizar o rateio.';
            this.usersRateio = [];
          }
        },
        (error) => {
          this.loading = false; // Encerrar o loading
          this.mensagemErro = 'Erro ao carregar os dados: ' + error.message;
          this.usersRateio = [];
        }
      );
    }
  }
  
  async generateRateio(user: any): Promise<Blob | null> {
    try {
      const rateio = user;
      const valorComum = rateio.valorComum + rateio.valorFundos + rateio.valorProvisoes;
      const valorIndividual = rateio.valorIndividual;
      const totalCondo = valorComum + valorIndividual;
      let vagas_fracao = 0;
  
      rateio.vagas.forEach((vaga: { fracao: any }) => {
        vagas_fracao += Number(vaga.fracao);
      });
  
      // Obtendo despesas comuns
      let expenses = await this.commonExepenseService
        .getExpensesByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
        .toPromise();
  
      if (expenses) {
        expenses = expenses.filter((expense) => expense.tipo === 'Rateio');
        const gastosIndividuais = await this.gastosIndividuaisService
          .getGastosIndividuaisByApartment(rateio.apt_id)
          .toPromise();
  
        if (gastosIndividuais) {
          const gastoIndividual = gastosIndividuais.find((gasto) => {
            const dataGasto = new Date(gasto.data_gasto);
            return (
              dataGasto.getMonth() + 1 === Number(this.selectedMonth) &&
              dataGasto.getFullYear() === Number(this.selectedYear)
            );
          });
  
          if (gastoIndividual) {
            const rateioData = {
              month: this.selectedMonth,
              apartment: rateio.apt_name,
              condoTotal: totalCondo,
              apt_fracao: rateio.apt_fracao,
              fracao_total: rateio.fracao_total,
              vagas_fracao: vagas_fracao.toString(),
              summary: {
                individualExpenses: valorIndividual,
                collectiveExpenses: valorComum,
                totalCondo: totalCondo,
              },
              individualExpenses: [
                { category: 'Água', value: gastoIndividual.aguaValor },
                { category: 'Gás', value: gastoIndividual.gasValor },
                { category: 'Lavanderia', value: gastoIndividual.lavanderia },
                { category: 'Lazer', value: gastoIndividual.lazer },
                { category: 'Multa', value: gastoIndividual.multa },
                { category: 'Total', value: valorIndividual },
              ],
              collectiveExpenses: expenses,
              individualExpensesHistory: gastosIndividuais,
            };
  
            // Gere o PDF e retorne como Blob
            const pdfBlob = await this.pdfService.generateCondoStatement(rateioData);
            return pdfBlob;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error generating rateio:', error);
      return null;
    }
  }
  

  async downloadAllRateios(): Promise<void> {
    // Adiciona a confirmação antes de iniciar o processo
    const confirmacao = window.confirm('Você tem certeza que deseja gerar os rateios?');

    if (!confirmacao) {
      // Se o usuário não confirmar, a função será interrompida
      return;
    }
    this.loading = true;  // Ativar estado de carregamento
    this.downloading = true;
    this.loadingPercentage = 0;  // Iniciar com 0%
    this.textoLoading = "Preparando para gerar rateios...";  // Mensagem inicial
    this.cancelDownload = false;  // Resetando o estado de cancelamento
  
    if (this.usersRateio.length === 0) {
      this.loading = false;
      this.textoLoading = "Carregando dados...";
      this.toastr.warning('Nenhum rateio disponível para download.');
      return;
    }
  
    const zip = new JSZip();
    let index = 1;
    const totalUsers = this.usersRateio.length;
  
    for (const user of this.usersRateio) {
      if (this.cancelDownload) {
        this.textoLoading = "Download cancelado.";
        this.loading = false;
        this.downloading = false;

        return;  // Interrompe o loop se o cancelamento for solicitado
      }
  
      this.textoLoading = `Gerando arquivos PDF... (${index}/${totalUsers})`;
      this.loadingPercentage = (index / totalUsers) * 100;
  
      const pdfBlob = await this.generateRateio(user);
      if (pdfBlob) {
        zip.file(`Rateio_${user.apt_name || 'User'}_${index}.pdf`, pdfBlob);
        index++;
      }
    }
  
    this.textoLoading = "Compactando arquivos no formato ZIP...";
    this.loadingPercentage = 100;
  
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Rateios_${this.selectedMonth}_${this.selectedYear}.zip`);
      this.toastr.success('Download concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar arquivo zip:', error);
      this.toastr.error('Erro ao criar o arquivo zip.');
    } finally {
      this.textoLoading = "Carregando dados...";
      this.loading = false;
      this.downloading = false;

    }
  }
  // Método para gerar e baixar o PDF para um único usuário
  async generateAndDownloadPDF(user: any): Promise<void> {
    try {
      const pdfBlob = await this.generateRateio(user);  // Gera o PDF para esse usuário específico
      
      if (pdfBlob) {
        // Nome do arquivo PDF
        const fileName = `Rateio_${user.apt_name}.pdf`;

        // Salva o PDF gerado
        saveAs(pdfBlob, fileName);
        this.toastr.success('PDF gerado com sucesso!');
      } else {
        this.toastr.error('Não foi possível gerar o PDF para este usuário.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF para o usuário:', error);
      this.toastr.error('Erro ao gerar o PDF.');
    }
  }


  cancelDownloadProcess(): void {
    // Define a flag para cancelar o download
    this.cancelDownload = true;
    this.loading = false;
    this.downloading = false;
  }
  
  formatCurrency(value: number| undefined): string {
    if(value){
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return "R$ 0,00"
  }

  returnValorTotal(rateio:Rateio): string {
    if(rateio && rateio.valorComum && rateio.valorFundos && rateio.valorProvisoes && rateio.valorIndividual){
      return this.formatCurrency(rateio.valorComum + rateio.valorFundos + rateio.valorProvisoes + rateio.valorIndividual )
    }
    return "R$ 0,00"
  }




}
