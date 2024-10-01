import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Building } from '../shared/utilitarios/building';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { Provisao } from '../shared/utilitarios/provisao';
import { CommonExpenseService } from '../shared/service/Banco_de_Dados/commonExpense_service';
import { ProvisaoService } from '../shared/service/Banco_de_Dados/provisao_service'; // Novo service importado
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
  manualProvisaoForm!: FormGroup;
  buildings: Building[] = [];
  loading: boolean = true;
  provisoes: Provisao[] = [];
  provisoesUtilizadas: CommonExpense[] = [];
  expenseTypes: ExpenseType[] = [];
  isManualInsertVisible: boolean = false; // Controla a exibição do formulário de inserção manual

  constructor(
    private formBuilder: FormBuilder,
    private buildingService: BuildingService,
    private commonExepenseService: CommonExpenseService,
    private provisaoService: ProvisaoService, // Injeta o novo service
    private expenseTypeService: ExpenseTypeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
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
    this.manualProvisaoForm = this.formBuilder.group({
      predio_id: ['0', Validators.required],
      detalhe: ['', Validators.required],
      valor: [null, Validators.required],
      frequencia: ['', Validators.required],
    });
  }

  getAllProvisoes(): void {
    let buildingId = this.myForm.get('building_id')?.value;
    this.provisaoService.getProvisoesByBuildingId(buildingId).subscribe(
      (provisoes: Provisao[]) => {
        this.provisoes = provisoes;
      },
      (error) => {
        console.error('Error fetching provisoes:', error);
      }
    );
  }

  getAllProvisoesUtilizadas(): void {
    let buildingId = this.myForm.get('building_id')?.value;
    this.commonExepenseService.getProvisoesByBuilding(buildingId).subscribe(
      (expenses: CommonExpense[]) => {
        this.provisoesUtilizadas = expenses;
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
        console.error('Error fetching expense types:', error);
      }
    );
  }

  loadFundos(): void {
    this.getAllProvisoesUtilizadas();
    this.getAllProvisoes();
    this.loading = false;
  }



  getProvisoesDetalhes(provisao: CommonExpense): string {
    let expenseAux = this.expenseTypes.find(expense => expense.id === provisao.tipoGasto_id);
    return expenseAux?.detalhes || "";
  }

  formatarData(data: string): string {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  deleteExpense(expense: CommonExpense): void {
    console.log(expense);

    if (confirm("Tem certeza que deseja excluir esta despesa comum?") && expense.id) {
      this.commonExepenseService.deleteCommonExpense(expense.id).subscribe(
        () => {
          // Remover a despesa excluída do array local
          const index = this.provisoes.findIndex(e => e.id === expense.id);
          console.log(index);
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

  // Exibir formulário de inserção manual
  showManualInsertForm(): void {
    this.isManualInsertVisible = true;
  }
  // Submeter a nova provisão
  submitManualProvisao(): void {
    if (this.manualProvisaoForm.invalid) {
      this.toastr.error('Preencha todos os campos corretamente.');
      return;
    }

    const novaProvisao: Provisao = this.manualProvisaoForm.value;

    this.provisaoService.createProvisao(novaProvisao).subscribe(
      () => {
        this.toastr.success('Provisão inserida com sucesso.');
        this.manualProvisaoForm.reset(); // Limpar o formulário
        this.isManualInsertVisible = false; // Ocultar o formulário após o envio
        this.getAllProvisoes(); // Atualizar a lista de provisões
      },
      (error) => {
        console.error('Erro ao inserir provisão:', error);
        this.toastr.error('Erro ao inserir provisão. Tente novamente.');
      }
    );
  }
  voltar(): void {
    this.isManualInsertVisible = false;
  }
  deleteProvisao(provisao: Provisao): void {
    if (confirm('Tem certeza que deseja excluir esta provisão?') && provisao.id) {
      this.provisaoService.deleteProvisao(provisao.id).subscribe(
        () => {
          // Remover a provisão excluída do array local
          const index = this.provisoes.findIndex(p => p.id === provisao.id);
          if (index !== -1) {
            this.provisoes.splice(index, 1);
            this.toastr.success('Provisão excluída com sucesso.');
          }
        },
        (error) => {
          console.error('Erro ao excluir provisão:', error);
          this.toastr.error('Erro ao excluir provisão. Tente novamente.');
        }
      );
    }
  }
    
}
