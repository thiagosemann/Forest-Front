import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { Building } from '../shared/utilitarios/building';
import { ToastrService } from 'ngx-toastr';
import { Apartamento } from '../shared/utilitarios/apartamento';
import { GastoIndividual } from '../shared/utilitarios/gastoIndividual';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { Rateio } from '../shared/utilitarios/rateio';
import { RateioService } from '../shared/service/Banco_de_Dados/rateio_service';

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
  loading: boolean = false;
  mensagemErro: string = '';

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
    private rateioService: RateioService 

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




  changeSelect(): void {
    this.buildingId = Number(this.myForm.get('building_id')?.value);
    const month = this.myForm.get('months')?.value;
    const year = this.myForm.get('years')?.value;
    
    if (month != 0 && year != 0 && this.buildingId != 0) {
      this.loading = true; // Iniciar o loading
      this.mensagemErro = ''; // Limpar mensagem de erro
  
      this.rateioService.getRateioByBuildingAndMonth(this.buildingId, Number(month), Number(year)).subscribe(
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
