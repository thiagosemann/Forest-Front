import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../shared/utilitarios/user';
import { PdfService } from '../shared/service/Pdf-Service/pdfService';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  mesAtual: string = '';
  valorTotal: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Se não existe um token, redirecione para a página de login
      this.router.navigate(['/login']);
    }

    const rateioData = {
      month: '8',
      apartment: '11',
      condoTotal: 395.56,
      fraction: '0,043335',
      summary: {
        individualExpenses: 134.13,
        collectiveExpenses: 261.43,
        totalCondo: 395.56,
      },
      individualExpenses: [
        { category: 'Água', value: 93.28, consumption: 1.88 },
        { category: 'Gás', value: 15.85, consumption: 2.9 },
        { category: 'Garagem', value: 25.0, consumption: null },
      ],
      collectiveExpenses: [
        { category: 'Água', value: 0, fraction: 0 },
        { category: 'Energia', value: -388.58, fraction: -16.84 },
      ],
      reserves: [
        { category: 'Provisão Alvará Bombeiros', value: -33.33, fraction: -1.44 },
        { category: 'Fundo de Reserva', value: -463.29, fraction: -20.08 },
      ],
      financial: {
        provisions: 5961.33,
        reserveFund: 20015.55,
        worksFund: 9922.28,
      },
      cash: {
        currentAccount: 9440.0,
        invested: 37713.77,
        total: 47153.77,
      },
    };

    // Gera o PDF com base nos dados formatados
    this.pdfService.generateCondoStatement(rateioData);
  }

  getCurrentUser(): User | null {
    let user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    user = sessionStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
}
