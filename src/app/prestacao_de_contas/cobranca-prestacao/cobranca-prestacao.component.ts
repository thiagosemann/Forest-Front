import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BuildingService } from 'src/app/shared/service/Banco_de_Dados/buildings_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { Building } from 'src/app/shared/utilitarios/building';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cobranca-prestacao',
  templateUrl: './cobranca-prestacao.component.html',
  styleUrls: ['./cobranca-prestacao.component.css']
})
export class CobrancaPrestacaoComponent {
  pagamentosEmAtraso: { apartamento: string; data: string; valor: string }[] = [];
  pagamentosAtrasadosPagos: { apartamento: string; data: string; valor: string }[] = [];
  condominiosPagos: { apartamento: string; data: string; valor: string }[] = [];
  cnpj:string="";
  uploading: boolean = false;
  pagamentosXls: Array<{
    cliente: string;
    coibranca: string;
    cod: string;
    identificador: string;
    emissao: string;
    vencimento: string;
    valor: string;
    status: string;
    dataRecebimento: string;
    valorRecebido: string;
    finalidade: string;
  }> = [];
  selectedBuildingId: number = 0;
  selectedMonth: number = 0;
  selectedYear: number = 0;
  predioSelecionado: boolean = true;

  constructor(
    private selectionService: SelectionService,
    private toastr: ToastrService,
    private buildingService: BuildingService

  ) {}

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.verifySelected();
    });
  }

  getBuildingById(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.buildingService.getBuildingById(this.selectedBuildingId).subscribe(
        (building: Building) => {
          this.cnpj = building.CNPJ
          resolve(); // Resolve a Promise quando a requisição é bem-sucedida
        },
        (error) => {
          console.error('Error fetching buildings:', error);
          reject(error); // Rejeita a Promise em caso de erro
        }
      );
    });
  }

  verifySelected(): void {
    if (this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
      this.predioSelecionado = true;
      this.getBuildingById()
    } else {
      this.toastr.warning('Selecione o prédio, o mês e o ano!');
    }
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      this.pagamentosXls = jsonData.slice(1).map((row: any) => ({
        cliente: row[0] || '',
        coibranca: row[1] || '',
        cod: row[2] || '',
        identificador: row[3] || '',
        emissao: row[4] || '',
        vencimento: row[5] || '',
        valor: row[6] || '',
        status: row[7] || '',
        dataRecebimento: row[8] || '',
        valorRecebido: row[9] || '',
        finalidade: row[10] || ''
      }));

      this.pagamentosXls.forEach(pagamento => {
        let month = pagamento.cod.slice(-2);
        let year = pagamento.vencimento.slice(-4);
        let apartamento = pagamento.cod.slice(0, -2);

        if (month == this.selectedMonth.toString().padStart(2) &&  year == this.selectedYear.toString() ) {
          if (pagamento.status.toUpperCase() == 'EXPIRADO') {
            // Não pagos mesmo mês
          } else {
            // Pagos mesmo mês
            this.condominiosPagos.push({
              apartamento: apartamento,
              data: pagamento.dataRecebimento,
              valor: pagamento.valorRecebido
            });
          }
        } else {
          if (pagamento.status.toUpperCase() == 'EXPIRADO') {
            // Não pagos outro mês
          } else {
            // Pagos outro mês
            this.pagamentosAtrasadosPagos.push({
              apartamento: apartamento,
              data: pagamento.dataRecebimento,
              valor: pagamento.valorRecebido
            });
          }
        }
      });
      // Ordenando os arrays por apartamento em ordem crescente
      this.condominiosPagos.sort((a, b) => Number(a.apartamento) - Number(b.apartamento));
      this.pagamentosAtrasadosPagos.sort((a, b) => Number(a.apartamento) - Number(b.apartamento));
      this.pagamentosEmAtraso.sort((a, b) => Number(a.apartamento) - Number(b.apartamento));
    };

    reader.readAsArrayBuffer(file);
  }
}
