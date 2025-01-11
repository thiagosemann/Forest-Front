import { Component } from '@angular/core';
import { SaldoPredio } from '../shared/utilitarios/saldoPredio';
import { SaldoPorPredioService } from '../shared/service/Banco_de_Dados/saldo_por_predio_service';
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
  showModal: boolean = false;
  editingBalance: boolean = false;
  isBuildingBalance: boolean = true;
  currentBalance: any = {};
  buildings: Building[] = [];
  buildingId: number | null = null;
  myGroup: FormGroup;
  selectedBuildingName: string = '';
  modalClass: string = '';  // Adiciona a declaração da variável modalClass

  constructor(
    private saldoPorPredioService: SaldoPorPredioService,
    private buildingService: BuildingService,
    private toastr: ToastrService,
  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''),
    });
  }

  ngOnInit(): void {
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
    this.selectedBuildingName = selectedBuilding ? selectedBuilding.nome : '';
    this.loadBuildingBalances();
  }

  loadBuildingBalances(): void {
    if (this.buildingId) {
      this.saldoPorPredioService.getSaldosByBuildingId(this.buildingId).subscribe(
        (data) => {
          this.saldoPredios = data;
        },
        (error: any) => {
          console.error('Erro ao carregar saldos de prédios:', error);
        }
      );
    } else {
      this.toastr.warning("Selecione um prédio!");
    }
  }
  

  addBuildingBalance(): void {
    this.isBuildingBalance = true;
    this.editingBalance = false;

    if(!this.buildingId){
      this.toastr.warning("Selecione um prédio!")
      return
    }
    this.currentBalance = { predio_id: this.buildingId, buildingName: '', valor: 0, data: '', type: 'conta' };
    this.openModal();
  }

  editBuildingBalance(saldo: SaldoPredio): void {
    this.isBuildingBalance = true;
    this.currentBalance = { ...saldo };
    this.editingBalance = true;
    // Converte a data para o formato yyyy-mm-dd para o input de data
    this.currentBalance.data = this.formatDateForSelect(this.currentBalance.data);
    this.openModal();
  }
  

  saveBalance(): void {
    if (this.isBuildingBalance) {
      // Converte a data para o formato dd/mm/yyyy
      this.currentBalance.data = this.formatDate(this.currentBalance.data);
  
      this.saldoPorPredioService.createSaldo(this.currentBalance).subscribe(
        () => {
          this.closeModal();
          this.loadBuildingBalances();
        },
        (error) => console.error('Erro ao salvar saldo de prédio:', error)
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
    }
  }

  deleteBuildingBalance(id: number): void {
    this.saldoPorPredioService.deleteSaldo(id).subscribe(
      () => this.loadBuildingBalances(),
      (error) => console.error('Erro ao excluir saldo de prédio:', error)
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
  formatDateForSelect(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }


  formatReal(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
