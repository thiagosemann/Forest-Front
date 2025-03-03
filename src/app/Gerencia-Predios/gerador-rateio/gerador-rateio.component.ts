import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SelectionService } from 'src/app/shared/service/selectionService';

@Component({
  selector: 'app-gerador-rateio',
  templateUrl: './gerador-rateio.component.html',
  styleUrls: ['./gerador-rateio.component.css']
})
export class GeradorRateioComponent  implements OnInit {
  steps = [
    { label: '1 - Gastos Comuns', open: false, completed: false },
    { label: '2 - Gastos Individuais', open: false, completed: false },
    { label: '3 - Fundos', open: false, completed: false },
    { label: '4 - Provisões', open: false, completed: false },
    { label: '5 - Saldos', open: false, completed: false },
    { label: '6 - Rateio', open: false, completed: false },
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
