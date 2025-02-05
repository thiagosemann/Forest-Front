import { Component } from '@angular/core';
import { SaldoPredio } from '../../shared/utilitarios/saldoPredio';
import { SaldoPorPredioService } from '../../shared/service/Banco_de_Dados/saldo_por_predio_service';
import { Building } from '../../shared/utilitarios/building';
import { FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SelectionService } from '../../shared/service/selectionService';

@Component({
  selector: 'app-saldo-investimento-predio',
  templateUrl: './saldo-investimento-predio.component.html',
  styleUrls: ['./saldo-investimento-predio.component.css']
})
export class SaldoInvestimentoPredioComponent {
  saldoPredios: SaldoPredio[] = [];
  showModal: boolean = false;
  isBuildingBalance: boolean = true;
  currentBalance: any = {};
  buildings: Building[] = [];
  myGroup: FormGroup;
  selectedBuildingName: string = '';
  modalClass: string = '';  // Adiciona a declaração da variável modalClass
  selectedBuildingId:number=0;
  saldoAtualizado:number=0;
  saldoAtualizadoisEditing:boolean=false;
  investimento1Atualizado:number=0;
  investimento1AtualizadoisEditing:boolean=false;
  investimento2Atualizado:number=0;
  investimento2AtualizadoisEditing:boolean=false;
  showHistoryConta:boolean=false;
  showHistoryInvestimento1:boolean=false;
  showHistoryInvestimento2:boolean=false;

  constructor(
    private saldoPorPredioService: SaldoPorPredioService,
    private toastr: ToastrService,
    private selectionService: SelectionService

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.onBuildingSelect();
    });
  }



  onBuildingSelect(): void {
    const selectedBuilding = this.buildings.find(building => building.id === Number(this.selectedBuildingId));
    this.selectedBuildingName = selectedBuilding ? selectedBuilding.nome : '';
    this.loadBuildingBalances();
  }

  loadBuildingBalances(): void {
    if (this.selectedBuildingId) {
      this.saldoPorPredioService.getSaldosByBuildingId(this.selectedBuildingId).subscribe(
        (data) => {
          // Inverta o array
          console.log(data)
          this.saldoPredios = data.reverse();
          let ultimoInvestimento1 = this.saldoPredios.find(item => item.type === 'investimento1');
          if(ultimoInvestimento1){
            this.investimento1Atualizado = Number(ultimoInvestimento1.valor) 
          }
          let ultimoInvestimento2 = this.saldoPredios.find(item => item.type === 'investimento2');
          if(ultimoInvestimento2){
            this.investimento2Atualizado = Number(ultimoInvestimento2.valor) 
          }
          let ultimaConta = this.saldoPredios.find(item => item.type === 'conta');
          if(ultimaConta){
            this.saldoAtualizado = Number(ultimaConta.valor) 
          }

        },
        (error: any) => {
          console.error('Erro ao carregar saldos de prédios:', error);
        }
      );
    } else {
      this.toastr.warning("Selecione um prédio!");
    }
  }
  editSaldoAtualizado():void{
    this.saldoAtualizadoisEditing = !this.saldoAtualizadoisEditing;
  }
  editInvestimento1Atualizado():void{
    this.investimento1AtualizadoisEditing = !this.investimento1AtualizadoisEditing;
  }
  editInvestimento2Atualizado():void{
    this.investimento2AtualizadoisEditing = !this.investimento2AtualizadoisEditing;
  }

  toggleHistoryInvestimento1():void{
    this.showHistoryInvestimento1 = !this.showHistoryInvestimento1;
  }
  toggleHistoryInvestimento2():void{
    this.showHistoryInvestimento2 = !this.showHistoryInvestimento2;
  }
  toggleHistoryConta():void{
    this.showHistoryConta = !this.showHistoryConta;
  }

  addBuildingBalance(type: string): void {
    // Define a flag de edição com base no tipo
    // Verifica se o prédio foi selecionado
    if (!this.selectedBuildingId) {
      this.toastr.warning("Selecione um prédio!");
      return;
    }
    this.isBuildingBalance = type === 'conta';
    
    let contaValor = 0;
    
    // Lógica para lidar com o tipo 'conta'
    if (type === 'conta') {
      this.saldoAtualizadoisEditing = !this.saldoAtualizadoisEditing;
      contaValor = this.saldoAtualizado;
      // Encontrar o último valor com o tipo 'conta'
      let ultimaConta = this.saldoPredios.find(item => item.type === 'conta');
      if (ultimaConta && Number(ultimaConta.valor) == contaValor) {
        return
      }
    }
    
    // Lógica para lidar com o tipo 'investimento'
    if (type === 'investimento1') {
      this.investimento1AtualizadoisEditing = !this.investimento1AtualizadoisEditing;
      contaValor = this.investimento1Atualizado;
      // Encontrar o último valor com o tipo 'investimento'
      let ultimaConta = this.saldoPredios.find(item => item.type === 'investimento1');
      if (ultimaConta && Number(ultimaConta.valor) == contaValor) {
        return
      }
    }
    // Lógica para lidar com o tipo 'investimento'
    if (type === 'investimento2') {
      this.investimento2AtualizadoisEditing = !this.investimento2AtualizadoisEditing;
      contaValor = this.investimento2Atualizado;
      // Encontrar o último valor com o tipo 'investimento'
      let ultimaConta = this.saldoPredios.find(item => item.type === 'investimento2');
      if (ultimaConta && Number(ultimaConta.valor) == contaValor) {
        return
      }
    }

    
    // Criação da data formatada
    let date = new Date();
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    
    // Definir o saldo atual com as informações necessárias
    this.currentBalance = {
      predio_id: this.selectedBuildingId,
      buildingName: '',
      valor: contaValor,
      data: `${year}-${month}-${day}`,
      type: type, // Define o tipo (conta ou investimento)
    };
    
    // Salva o saldo
    this.saveBalance();
  }
  


  editBuildingBalance(saldo: SaldoPredio): void {
    this.isBuildingBalance = true;
    this.currentBalance = { ...saldo };
    // Converte a data para o formato yyyy-mm-dd para o input de data
    this.currentBalance.data = this.formatDateForSelect(this.currentBalance.data);
    this.openModal();
  }
  

  saveBalance(): void {
    // Converte a data para o formato dd/mm/yyyy
    this.currentBalance.data = this.formatDate(this.currentBalance.data);
  
    this.saldoPorPredioService.createSaldo(this.currentBalance).subscribe(
      () => {
        this.closeModal();
        this.loadBuildingBalances(); // Recarrega os dados após salvar
      },
      (error) => console.error('Erro ao salvar saldo de prédio:', error)
    );
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
