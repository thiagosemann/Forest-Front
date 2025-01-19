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
    this.steps.forEach((step, i) => {
      step.open = i === index ? !step.open : false; // Fecha todos os outros e alterna o atual
    });
  }
  

  markAsCompleted(index: number): void {
    this.steps[index].completed = true;
    this.steps[index].open = false;
  }
}

