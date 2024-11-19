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
  loading: boolean = false;
  mensagemErro: string = '';
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;
  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private rateioService: RateioService, 
    private selectionService: SelectionService,
    private pdfService: PdfService,
    private commonExepenseService: CommonExpenseService,


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
            this.generateRateio();
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
  
  generateRateio():void{
    console.log(this.usersRateio)
    let rateio = this.usersRateio[2];
    let valorComum = rateio.valorComum + rateio.valorFundos + rateio.valorProvisoes;
    let valorIndividual = rateio.valorIndividual;
    let totalCondo = valorComum + valorIndividual;
    let vagas_fracao = 0;
    rateio.vagas.forEach((vaga: { fracao: any; }) => {
      vagas_fracao += Number(vaga.fracao);
    });

    this.commonExepenseService.getExpensesByBuildingAndMonth( this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
      (expenses: any[]) => {
        console.log(expenses)
        const rateioData = {
          month: this.selectedMonth ,
          apartment: rateio.apt_name,
          condoTotal: totalCondo ,
          apt_fracao: rateio.apt_fracao,
          fracao_total: rateio.fracao_total,
          vagas_fracao: vagas_fracao.toString(),
          summary: {
            individualExpenses: valorIndividual,
            collectiveExpenses: valorComum ,
            totalCondo: totalCondo,
          },
          individualExpenses: [
            { category: 'Água', value: 93.28, consumption: 1.88 },
            { category: 'Gás', value: 15.85, consumption: 2.9 },
            { category: 'Garagem', value: 25.0, consumption: null },
          ],
          collectiveExpenses: expenses,
          reserves: [
            { category: 'Provisão Alvará Bombeiros', value: -33.33, fraction: -1.44 },
            { category: 'Fundo de Reserva', value: -463.29, fraction: -20.08 },
          ]
        };
        console.log(rateioData)
        this.pdfService.generateCondoStatement(rateioData);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
  


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
