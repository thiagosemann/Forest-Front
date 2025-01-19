import { Component } from '@angular/core';

@Component({
  selector: 'app-cobranca-prestacao',
  templateUrl: './cobranca-prestacao.component.html',
  styleUrls: ['./cobranca-prestacao.component.css']
})
export class CobrancaPrestacaoComponent {
  pagamentosEmAtraso: { apartamento: string; data: string; valor: string }[] = [];
  pagamentosAtrasadosPagos: { apartamento: string; data: string; valor: string }[] = [];
  condominiosPagos: { apartamento: string; data: string; valor: string }[] = [];

  uploadFile(): void {
    // Simulando o processamento do arquivo XLS. Em uma aplicação real, seria necessário integrar com uma biblioteca para leitura de XLS, como SheetJS (XLSX).
    const mockData = {
      pagamentosEmAtraso: [
        { apartamento: 'Apt 101', data: '2025-01-01', valor: 'R$ 500,00' },
        { apartamento: 'Apt 102', data: '2025-01-02', valor: 'R$ 600,00' }
      ],
      pagamentosAtrasadosPagos: [
        { apartamento: 'Apt 201', data: '2025-01-03', valor: 'R$ 700,00' },
        { apartamento: 'Apt 202', data: '2025-01-04', valor: 'R$ 800,00' }
      ],
      condominiosPagos: [
        { apartamento: 'Apt 301', data: '2025-01-05', valor: 'R$ 900,00' },
        { apartamento: 'Apt 302', data: '2025-01-06', valor: 'R$ 1000,00' }
      ]
    };

    // Simulando a atribuição de dados após o processamento do arquivo
    this.pagamentosEmAtraso = mockData.pagamentosEmAtraso;
    this.pagamentosAtrasadosPagos = mockData.pagamentosAtrasadosPagos;
    this.condominiosPagos = mockData.condominiosPagos;
  }
}
