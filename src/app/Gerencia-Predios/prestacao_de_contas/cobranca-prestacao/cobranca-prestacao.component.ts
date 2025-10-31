import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PrestacaoCobrancaBoletoService } from 'src/app/shared/service/Banco_de_Dados/prestacaoCobrancaBoletos_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { PrestacaoCobrancaBoleto } from 'src/app/shared/utilitarios/prestacaoCobrancaBoleto';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cobranca-prestacao',
  templateUrl: './cobranca-prestacao.component.html',
  styleUrls: ['./cobranca-prestacao.component.css']
})
export class CobrancaPrestacaoComponent {

  selectedBuildingId: number = 0;
  selectedMonth: number = 0;
  selectedYear: number = 0;
  existingBoleto!: PrestacaoCobrancaBoleto | null;

  constructor(
    private selectionService: SelectionService,
    private toastr: ToastrService,
    private prestacaoCobrancaBoletoService: PrestacaoCobrancaBoletoService
  ) {}

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.checkExistingBoleto();
    });
  }

  // ------------------------------ MODELO DE PLANILHA ------------------------------ //
  downloadModeloPlanilha(): void {
    // Caminho relativo dentro de /assets
    const modeloUrl = 'assets/templates/prestacao-de-contas-modelo.xlsx';
    // Cria dinamicamente um <a> para forçar o download
    const link = document.createElement('a');
    link.href = modeloUrl;
    // O atributo download define o nome do arquivo quando baixado
    link.download = 'modelo-prestacao-de-contas.xlsx';
    // Anexa temporariamente ao DOM e dispara o clique
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  // -------------------------------------------------------------------------------- //

  // ------------------------------ PDF COBRANCA ------------------------------------ //
  uploadBoletoPdf(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      this.toastr.warning('Por favor, selecione um arquivo PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString();
      if (result) {
        const fileContentBase64 = result.split(',')[1];
        const newBoleto: PrestacaoCobrancaBoleto = {
          pdf: fileContentBase64,
          predio_id: this.selectedBuildingId,
          month: this.selectedMonth,
          year: this.selectedYear
        };

        this.prestacaoCobrancaBoletoService.createPrestacaoCobrancaBoleto(newBoleto).subscribe(
          (response) => {
            this.toastr.success(`Arquivo "${file.name}" enviado com sucesso!`);
            this.existingBoleto = response;
          },
          (error) => {
            this.toastr.error('Erro ao enviar o arquivo. Tente novamente.');
            console.error('Erro no upload do boleto:', error);
          }
        );
      } else {
        this.toastr.error('Falha ao ler o arquivo PDF.');
      }
    };
    reader.readAsDataURL(file);
  }

  checkExistingBoleto(): void {
    this.prestacaoCobrancaBoletoService
      .getPrestacaoCobrancaBoletoByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
      .subscribe(
        (boletos: PrestacaoCobrancaBoleto[]) => {
          if (boletos && boletos.length > 0) {
            this.existingBoleto = boletos[0];
          } else {
            this.existingBoleto = null;
          }
        },
        (error) => {
          console.error('Erro ao consultar boleto:', error);
          this.existingBoleto = null;
        }
      );
  }

  downloadBoleto(): void {
    if (!this.existingBoleto?.id) {
      this.toastr.warning('Nenhum boleto encontrado para download.');
      return;
    }
    this.prestacaoCobrancaBoletoService.getPrestacaoCobrancaBoletoById(this.existingBoleto.id).subscribe(
      (response) => {
        if (!response || !response.pdf) {
          this.toastr.error('Boleto não contém dados para download.');
          return;
        }
        const byteArray = new Uint8Array(atob(response.pdf).split('').map(char => char.charCodeAt(0)));
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `boleto_${this.existingBoleto!.id}.pdf`;
        link.click();
      },
      (error) => {
        console.error('Erro ao efetuar download do boleto:', error);
        this.toastr.error('Erro no download do boleto.');
      }
    );
  }

  deleteBoleto(): void {
    if (!this.existingBoleto?.id) {
      this.toastr.warning('Nenhum boleto encontrado para exclusão.');
      return;
    }
    this.prestacaoCobrancaBoletoService.deletePrestacaoCobrancaBoleto(this.existingBoleto.id).subscribe(
      () => {
        this.toastr.success('Boleto excluído com sucesso!');
        this.existingBoleto = null;
      },
      (error) => {
        console.error('Erro ao excluir boleto:', error);
        this.toastr.error('Erro ao excluir boleto.');
      }
    );
  }
  // -------------------------------------------------------------------------------- //
}
