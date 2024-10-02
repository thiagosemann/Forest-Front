import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { Building } from '../shared/utilitarios/building';
import { ToastrService } from 'ngx-toastr';
import { ExpenseTypeService } from '../shared/service/Banco_de_Dados/tipoGasto_service';
import { CommonExpense } from '../shared/utilitarios/commonExpense';
import { Apartamento } from '../shared/utilitarios/apartamento';
import { GastoIndividual } from '../shared/utilitarios/gastoIndividual';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { CommonExpenseService } from '../shared/service/Banco_de_Dados/commonExpense_service';
import { ApartamentoService } from '../shared/service/Banco_de_Dados/apartamento_service';
import { GastosIndividuaisService } from '../shared/service/Banco_de_Dados/gastosIndividuais_service';
import { VagaService } from '../shared/service/Banco_de_Dados/vagas_service';
import { Vaga } from '../shared/utilitarios/vaga';
import { Rateio } from '../shared/utilitarios/rateio';
import { ProvisaoService } from '../shared/service/Banco_de_Dados/provisao_service';
import { Provisao } from '../shared/utilitarios/provisao';
import { FundoService } from '../shared/service/Banco_de_Dados/fundo_service';
import { Fundo } from '../shared/utilitarios/fundo';

@Component({
  selector: 'app-rateio',
  templateUrl: './rateio.component.html',
  styleUrls: ['./rateio.component.css']
})
export class RateioComponent implements OnInit {
  myForm!: FormGroup; // Initialize myForm as a FormGroup
  buildings: Building[] = [];
  gastoComumValor : number=0;
  gastoComumValorTotal: number=0;
  gastoIndividualValorTotal:number=0;
  apartamentos: Apartamento[] = [];
  gastosIndividuais:GastoIndividual[]=[];
  usersRateio:any[]=[];
  buildingId:number=0;
  provisoesRateadas:number=0;
  fundosRateados:number=0;
  

  months: { monthNumber: number, monthName: string }[] = [
    { monthNumber: 1, monthName: "Janeiro" },
    { monthNumber: 2, monthName: "Fevereiro" },
    { monthNumber: 3, monthName: "Março" },
    { monthNumber: 4, monthName: "Abril" },
    { monthNumber: 5, monthName: "Maio" },
    { monthNumber: 6, monthName: "Junho" },
    { monthNumber: 7, monthName: "Julho" },
    { monthNumber: 8, monthName: "Agosto" },
    { monthNumber: 9, monthName: "Setembro" },
    { monthNumber: 10, monthName: "Outubro" },
    { monthNumber: 11, monthName: "Novembro" },
    { monthNumber: 12, monthName: "Dezembro" }
  ];
  years: string[] = ["2022", "2023","2024", "2025", "2026", "2027", "2028", "2029","2030" ];

  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private formBuilder: FormBuilder,
    private commonExepenseService: CommonExpenseService,
    private expenseTypeService: ExpenseTypeService,
    private apartamentoService: ApartamentoService,
    private gastosIndividuaisService: GastosIndividuaisService,
    private vagasService: VagaService,
    private provisaoService: ProvisaoService,
    private fundoService: FundoService 


  ) {}
  ngOnInit(): void {
    this.getAllBuildings();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Os meses são indexados de 0 a 11, então somamos 1 para obter o mês atual
    const currentYear = currentDate.getFullYear().toString(); // Obter o ano atual como uma string

    this.myForm = this.formBuilder.group({
      building_id: [0, Validators.required], // Defina o prédio com id=1 como selecionado por padrão
      months: [currentMonth, Validators.required], // Defina o mês atual como selecionado por padrão
      years: [currentYear, Validators.required] // Defina o ano atual como selecionado por padrão
      // Adicione outros controles de formulário conforme necessário
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

  getFundosByBuildingID():void{
    this.fundoService.getFundosByBuildingId(this.buildingId).subscribe(
      (fundos:Fundo[])=>{
        console.log(fundos)
        fundos.forEach(fundo=>{
          this.fundosRateados+=fundo.porcentagem*this.gastoComumValorTotal;
        })
      },
      (error)=>{
        console.error('Error fetching provisoes:', error);
      }
    )
  }

  getProvisoesByBuildingID():void{
    this.provisaoService.getProvisoesByBuildingId(this.buildingId).subscribe(
      (provisoes:Provisao[])=>{
        console.log(provisoes)
        provisoes.forEach(provisao=>{
          let auxProvisao =0;
          if(provisao.frequencia=="Mensal"){
            auxProvisao = Number(provisao.valor);
          }else if(provisao.frequencia=="Bimensal"){
            auxProvisao = Number(provisao.valor)/2;
          }else if(provisao.frequencia=="Trimestral"){
            auxProvisao = Number(provisao.valor)/3;
          }else if(provisao.frequencia=="Semestral"){
            auxProvisao = Number(provisao.valor)/6;
          }else if(provisao.frequencia=="Anual"){
            auxProvisao = Number(provisao.valor)/12;
          }
          this.provisoesRateadas+=auxProvisao;
        })
        console.log(this.provisoesRateadas)
      },
      (error)=>{
        console.error('Error fetching provisoes:', error);
      }
    )
  }


  changeSelect(): void {
   this.buildingId = Number(this.myForm.get('building_id')?.value);
    this.loadExpenses();
    this.loadExpensesIndividuais();
    this.getProvisoesByBuildingID();

  }

  loadExpenses(): void {
    this.gastoComumValor = 0;
    const month = this.myForm.get('months')?.value;
    const year = this.myForm.get('years')?.value;
    if (this.buildingId && month && year) {
      this.commonExepenseService.getExpensesByBuildingAndMonth(this.buildingId, month, year).subscribe(
        (expenses: any[]) => {
          expenses.forEach(expense=>{
            expense.valor = parseFloat(expense.valor);
            this.gastoComumValor += expense.valor;
          })
        },
        (error) => {
          console.error('Error fetching expenses:', error);
        }
      );
    }
  }
  loadExpensesIndividuais(): void {
    this.gastoComumValorTotal = 0;
    this.gastoIndividualValorTotal = 0;
    const month = this.myForm.get('months')?.value;
    const year = this.myForm.get('years')?.value;
    this.gastosIndividuais = [];
    this.usersRateio = []; // Limpar o array antes de adicionar novos valores
  
    if (this.buildingId && month && year) {
      this.gastosIndividuaisService.getIndividualExpensesByAptMonthAndYear(this.buildingId, month, year).subscribe(
        (gastosIndividuais: GastoIndividual[]) => {
          console.log(gastosIndividuais);
          this.gastosIndividuais = gastosIndividuais;
  
          // Processa cada gasto individualmente
          this.gastosIndividuais.forEach(gasto => {
            if (gasto && gasto.apt_fracao) {
              gasto.valorTotal = Number(gasto.aguaValor) + Number(gasto.gasValor) + Number(gasto.lavanderia) + Number(gasto.multa) + Number(gasto.lazer);
              this.gastoComumValorTotal += this.gastoComumValor * gasto.apt_fracao;
              this.gastoIndividualValorTotal += gasto.valorTotal;
              if(gasto &&  gasto.apt_name && gasto.apt_fracao && gasto.valorTotal && gasto.valorTotal && gasto.apt_id){
                let userRateioAux:Rateio = {
                  apt_name: gasto.apt_name,
                  apt_fracao: gasto.apt_fracao,
                  valorIndividual: gasto.valorTotal,
                  apt_id: gasto.apt_id,
                  fracao_total:Number(gasto.apt_fracao),
                  vagas: [] 
                };
                // Busca as vagas do apartamento e só então adiciona ao array usersRateio
                this.vagasService.getVagasByApartamentId(userRateioAux.apt_id).subscribe({
                  next: (vagas) => {
                    userRateioAux.vagas = vagas; // Atribui as vagas ao objeto auxiliar
                    vagas.forEach(vaga=>{
                      userRateioAux.fracao_total += Number(vaga.fracao)
                    })
                    this.usersRateio.push(userRateioAux); // Agora adiciona ao array após obter as vagas
                    console.log(vagas)
                  },
                  error: (error) => {
                    console.error(`Error fetching vagas for apt ${gasto.apt_id}:`, error);
                  }
                });

              }
   
    
            }
          });
          this.getFundosByBuildingID();
        },
        (error) => {
          this.toastr.error(error.error.message);
          console.error('Error fetching individual expenses:', error);
        }
      );
    }
  }
  
  formatCurrency(value: number| undefined): string {
    if(value){
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return "R$ 0,00"
  }

}
