import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SelectionService } from 'src/app/shared/service/selectionService';

@Component({
  selector: 'app-prestacao-contas',
  templateUrl: './prestacao-contas.component.html',
  styleUrls: ['./prestacao-contas.component.css']
})
export class PrestacaoContasComponent implements OnInit {
  steps = [
    { label: '1 - Saldos', open: false, completed: false },
    { label: '2 - Fundos', open: false, completed: false },
    { label: '3 - Comprovantes', open: false, completed: false },
    { label: '4 - Cobrança', open: false, completed: false },
    { label: '5 - PDF Prestação', open: false, completed: false },
  ];
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;

  constructor(
    private selectionService: SelectionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
        this.selectedBuildingId = selecao.predioID;
        this.selectedMonth = selecao.month;
        this.selectedYear = selecao.year;
      });
    }

  toggleStep(index: number): void {
    if ( this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
      this.steps.forEach((step, i) => {
        step.open = i === index ? !step.open : false; // Fecha todos os outros e alterna o atual
      });
    }else{
      this.toastr.warning('Selecione o prédio, o mês e o ano!');

    }

  }

  markAsCompleted(index: number): void {
    this.steps[index].completed = true;
    this.steps[index].open = false;
  }
}

