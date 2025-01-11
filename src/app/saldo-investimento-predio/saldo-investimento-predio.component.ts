import { Component } from '@angular/core';
import { SaldoPredio } from '../shared/utilitarios/saldoPredio';
import { SaldoPorPredioService } from '../shared/service/Banco_de_Dados/saldo_por_predio_service';
import { SaldoPorInvestimentoService } from '../shared/service/Banco_de_Dados/saldo_por_investimento_service';
import { SaldoInvestimento } from '../shared/utilitarios/saldoInvestimento';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { Building } from '../shared/utilitarios/building';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-saldo-investimento-predio',
  templateUrl: './saldo-investimento-predio.component.html',
  styleUrls: ['./saldo-investimento-predio.component.css']
})
export class SaldoInvestimentoPredioComponent {
  saldoPredios: SaldoPredio[] = [];
  saldoInvestimentos: SaldoInvestimento[] = [];
  showModal: boolean = false;
  editingBalance: boolean = false;
  isBuildingBalance: boolean = true;
  currentBalance: any = {};
  buildings: Building[] = [];
  buildingId: number | null = null;
  myGroup: FormGroup;
  selectedBuildingName: string = '';  // Adicione esta variável

  constructor(
    private saldoPorPredioService: SaldoPorPredioService,
    private saldoPorInvestimentoService: SaldoPorInvestimentoService,
    private buildingService: BuildingService,
    private toastr: ToastrService,

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.loadBuildingBalances();
    this.loadInvestmentBalances();
    this.getAllBuildings();
  }
  getAllBuildings(): void {
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings;
      },
      (error) => {
        console.error('Erro ao buscar prédios:', error);
      }
    );
  }
  onBuildingSelect(event: any): void {
    this.buildingId = event.target.value;
    const selectedBuilding = this.buildings.find(building => building.id === Number(this.buildingId));
    this.selectedBuildingName = selectedBuilding ? selectedBuilding.nome : '';  // Atribua o nome do prédio selecionado
  }

  loadBuildingBalances(): void {
    this.saldoPorPredioService.getAllSaldos().subscribe(
      (data) => (this.saldoPredios = data),
      (error) => console.error('Erro ao carregar saldos de prédios:', error)
    );
  }

  loadInvestmentBalances(): void {
    this.saldoPorInvestimentoService.getAllInvestimentos().subscribe(
      (data) => (this.saldoInvestimentos = data),
      (error) => console.error('Erro ao carregar saldos de investimentos:', error)
    );
  }

  addBuildingBalance(): void {
    this.isBuildingBalance = true;
    this.editingBalance = false;

    if(!this.buildingId){
      this.toastr.warning("Selecione um prédio!")
      return
    }
    this.currentBalance = {predio_id: this.buildingId, buildingName: '', valor: 0, data: '' };
    this.openModal();
  }


  addInvestmentBalance(): void {
    this.isBuildingBalance = false;
    this.editingBalance = false;
    if(!this.buildingId){
      this.toastr.warning("Selecione um prédio!")
      return
    }
    this.currentBalance =  {predio_id: this.buildingId, buildingName: '', valor: 0, data: '' };
    this.openModal();
  }

  editBuildingBalance(saldo: SaldoPredio): void {
    this.isBuildingBalance = true;
    this.currentBalance = { ...saldo };
    this.editingBalance = true;
    this.openModal();
  }

  editInvestmentBalance(saldo: SaldoInvestimento): void {
    this.isBuildingBalance = false;
    this.currentBalance = { ...saldo };
    this.editingBalance = true;
    this.openModal();
  }

  saveBalance(): void {
    if (this.isBuildingBalance) {
      this.currentBalance.data = this.formatDate(this.currentBalance.data);
      this.saldoPorPredioService.createSaldo(this.currentBalance).subscribe(
        () => {
          this.closeModal();
          this.loadBuildingBalances();
        },
        (error) => console.error('Erro ao salvar saldo de prédio:', error)
      );
    } else {
      this.currentBalance.data = this.formatDate(this.currentBalance.data);
      this.saldoPorInvestimentoService.createInvestimento(this.currentBalance).subscribe(
        () => {
          this.closeModal();
          this.loadInvestmentBalances();
        },
        (error) => console.error('Erro ao salvar saldo de investimento:', error)
      );
    }
  }
  
  updateBalance(): void {
    if (this.isBuildingBalance) {
      this.currentBalance.data = this.formatDate(this.currentBalance.data);
      this.saldoPorPredioService.updateSaldo(this.currentBalance).subscribe(
        () => {
          this.closeModal();
          this.loadBuildingBalances();
        },
        (error) => console.error('Erro ao atualizar saldo de prédio:', error)
      );
    } else {
      this.currentBalance.data = this.formatDate(this.currentBalance.data);
      this.saldoPorInvestimentoService.updateInvestimento(this.currentBalance).subscribe(
        () => {
          this.closeModal();
          this.loadInvestmentBalances();
        },
        (error) => console.error('Erro ao atualizar saldo de investimento:', error)
      );
    }
  }
  

  deleteBuildingBalance(id: number): void {
    this.saldoPorPredioService.deleteSaldo(id).subscribe(
      () => this.loadBuildingBalances(),
      (error) => console.error('Erro ao excluir saldo de prédio:', error)
    );
  }

  deleteInvestmentBalance(id: number): void {
    this.saldoPorInvestimentoService.deleteInvestimento(id).subscribe(
      () => this.loadInvestmentBalances(),
      (error) => console.error('Erro ao excluir saldo de investimento:', error)
    );
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentBalance = {};
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  formatReal(valor: number): string { 
    return  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }


  
  
}
