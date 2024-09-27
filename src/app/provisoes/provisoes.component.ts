import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Building } from '../shared/utilitarios/building';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { Provisao } from '../shared/utilitarios/provisao';
import { CommonExpenseService } from '../shared/service/Banco_de_Dados/commonExpense_service';
import { CommonExpense } from '../shared/utilitarios/commonExpense';
import { ExpenseType } from '../shared/utilitarios/expenseType';
import { ExpenseTypeService } from '../shared/service/Banco_de_Dados/tipoGasto_service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-provisoes',
  templateUrl: './provisoes.component.html',
  styleUrls: ['./provisoes.component.css']
})
export class ProvisoesComponent implements OnInit {
  rotaAtual: string = '';
  myForm!: FormGroup; // Initialize myForm as a FormGroup
  buildings: Building[] = [];
  loading: boolean = false;
  provisoes: Provisao[]=[];
  provisoesUtilizadas: CommonExpense[] = [];
  expenseTypes:ExpenseType[]=[];

  constructor(private formBuilder: FormBuilder,
              private buildingService: BuildingService,
              private commonExepenseService: CommonExpenseService,
              private expenseTypeService: ExpenseTypeService,
              private toastr: ToastrService
            ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    this.getAllProvisoes()
    this.getAllExpenses();
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

  getAllProvisoes(): void {
    this.provisoes = [
      { id: 1, detalhe: 'Provisão 1', predio_id: 1, predioName: 'Prédio A', valor: 1000, frequencia: "Mensal" },
      { id: 2, detalhe: 'Provisão 2', predio_id: 1, predioName: 'Prédio A', valor: 1500, frequencia: "Bimenstral" },
      { id: 3, detalhe: 'Provisão 3', predio_id: 2, predioName: 'Prédio B', valor: 2000, frequencia: "Trimenstral" },
    ];
  }
  getAllProvisoesUtilizadas(): void {
    let buildingId = this.myForm.get('building_id')?.value;
    this.commonExepenseService.getProvisoesByBuilding(buildingId).subscribe(
      (expenses: CommonExpense[]) => {
        this.provisoesUtilizadas = expenses
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
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

  getAllExpenses(): void {
    this.expenseTypeService.getAllExpenseTypes().subscribe(
      (expenseTypes: ExpenseType[]) => {
        this.expenseTypes = expenseTypes;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  }
  loadFundos():void{
    
      this.getAllProvisoesUtilizadas()
    
   

  }

  loadingToFalse():void{
    this.loading = false;
  }

  getProvisoesDetalhes(provisao:CommonExpense):string{
    let expenseAux = this.expenseTypes.find(expense=>expense.id === provisao.tipoGasto_id)
    return expenseAux?.detalhes || ""
  }


  formatarData(data: string): string {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }


  deleteExpense(expense: CommonExpense): void {
    console.log(expense)
    
    if (confirm("Tem certeza que deseja excluir esta despesa comum?") && expense.id ) {
      this.commonExepenseService.deleteCommonExpense(expense.id).subscribe(
        () => {
          // Remover a despesa excluída do array local
          const index = this.provisoes.findIndex(e => e.id === expense.id);
          console.log(index)
          if (index !== -1) {
            this.provisoes.splice(index, 1);
            this.toastr.success('Despesa excluída com sucesso.');
          }
        },
        (error) => {
          console.error('Erro ao excluir despesa:', error);
          this.toastr.error('Erro ao excluir despesa. Por favor, tente novamente mais tarde.');
        }
      );
    }
  }


}