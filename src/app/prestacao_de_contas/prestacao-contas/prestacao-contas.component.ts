import { Component } from '@angular/core';

@Component({
  selector: 'app-prestacao-contas',
  templateUrl: './prestacao-contas.component.html',
  styleUrls: ['./prestacao-contas.component.css']
})
export class PrestacaoContasComponent {
  steps = [
    { label: '1 - Saldos', open: false, completed: false },
    { label: '2 - Fundos', open: false, completed: false },
    { label: '3 - Comprovantes', open: false, completed: false },
    { label: '4 - Cobrança', open: false, completed: false },
    { label: '5 - PDF Prestação', open: false, completed: false },
  ];

  toggleStep(index: number): void {
    this.steps[index].open = !this.steps[index].open;
  }

  markAsCompleted(index: number): void {
    this.steps[index].completed = true;
    this.steps[index].open = false;
  }
}

/*
    { label: '1 - Inserir Gastos Comuns', open: false, completed: false },
    { label: '2 - Inserir Gastos Individuais', open: false, completed: false },
    { label: '3 - Saldos Conta Corrente e Investimentos', open: false, completed: false },
    { label: '4 - Saldo Fundos', open: false, completed: false },
    { label: '5 - Rateio', open: false, completed: false },
    { label: '6 - Envio Rateio', open: false, completed: false },
*/