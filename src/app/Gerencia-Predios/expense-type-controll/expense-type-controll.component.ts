import { Component, OnInit } from '@angular/core';
import { ExpenseTypeService } from '../../shared/service/Banco_de_Dados/tipoGasto_service';
import { ExpenseType } from '../../shared/utilitarios/expenseType';

@Component({
  selector: 'app-expense-type-controll',
  templateUrl: './expense-type-controll.component.html',
  styleUrls: ['./expense-type-controll.component.css']
})
export class ExpenseTypeControllComponent implements OnInit {
  expenseTypes: ExpenseType[] = [];
  showModal: boolean = false;
  currentExpense: ExpenseType = { id: 0, detalhes: '' };
  editingExpense: boolean = false;

  constructor(private expenseTypeService: ExpenseTypeService) {}

  ngOnInit(): void {
    this.loadExpenseTypes();
  }

  loadExpenseTypes(): void {
    this.expenseTypeService.getAllExpenseTypes().subscribe(
      (data) => (this.expenseTypes = data),
      (error) => console.error('Erro ao carregar tipos de despesas:', error)
    );
  }

  addExpenseType(): void {
    this.currentExpense = { id: 0, detalhes: '' };
    this.editingExpense = false;
    this.showModal = true;
  }

  editExpenseType(expense: ExpenseType): void {
    this.currentExpense = { ...expense };
    this.editingExpense = true;
    this.showModal = true;
  }

  deleteExpenseType(id: number): void {
    if (confirm('Tem certeza que deseja excluir este tipo de despesa?')) {
      this.expenseTypeService.deleteExpenseType(id).subscribe(
        () => this.loadExpenseTypes(),
        (error) => console.error('Erro ao excluir tipo de despesa:', error)
      );
    }
  }

  saveExpenseType(): void {
    if (this.editingExpense) {
      this.expenseTypeService.updateExpenseType(this.currentExpense).subscribe(
        () => {
          this.loadExpenseTypes();
          this.closeModal();
        },
        (error) => console.error('Erro ao atualizar tipo de despesa:', error)
      );
    } else {
      this.expenseTypeService.createExpenseType(this.currentExpense).subscribe(
        () => {
          this.loadExpenseTypes();
          this.closeModal();
        },
        (error) => console.error('Erro ao criar tipo de despesa:', error)
      );
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentExpense = { id: 0, detalhes: '' };
  }
}


