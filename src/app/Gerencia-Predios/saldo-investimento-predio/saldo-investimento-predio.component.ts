import { Component } from '@angular/core';
import { SaldoPredio } from '../../shared/utilitarios/saldoPredio';
import { SaldoPorPredioService } from '../../shared/service/Banco_de_Dados/saldo_por_predio_service';
import { Building } from '../../shared/utilitarios/building';
import { FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SelectionService } from '../../shared/service/selectionService';
import { ExtratoPdfService } from 'src/app/shared/service/Banco_de_Dados/extratopdf_service';
import { ExtratoPdf } from 'src/app/shared/utilitarios/extratoPdf';

@Component({
  selector: 'app-saldo-investimento-predio',
  templateUrl: './saldo-investimento-predio.component.html',
  styleUrls: ['./saldo-investimento-predio.component.css']
})
export class SaldoInvestimentoPredioComponent {
  saldoPredios: SaldoPredio[] = [];
  showModal: boolean = false;
  isBuildingBalance: boolean = true;
  currentBalance: any = {};
  buildings: Building[] = [];
  myGroup: FormGroup;
  selectedBuildingName: string = '';
  modalClass: string = '';
  selectedBuildingId: number = 0;
  selectedMonth: number = 0;
  selectedYear: number = 0;

  saldoAtualizado: number = 0;
  saldoAtualizadoisEditing: boolean = false;
  investimento1Atualizado: number = 0;
  investimento1AtualizadoisEditing: boolean = false;
  investimento2Atualizado: number = 0;
  investimento2AtualizadoisEditing: boolean = false;
  showHistoryConta: boolean = false;
  showHistoryInvestimento1: boolean = false;
  showHistoryInvestimento2: boolean = false;
  currentPdfType: string = '';
  selectedPdfFile: File | null = null;

  // Propriedades para armazenar os PDFs enviados
  uploadedFileConta: any = null;
  uploadedFileInvestimento1: any = null;
  uploadedFileInvestimento2: any = null;

  // Propriedade para indicar se está carregando os extratos
  isLoadingExtratos: boolean = false;

  constructor(
    private saldoPorPredioService: SaldoPorPredioService,
    private toastr: ToastrService,
    private selectionService: SelectionService,
    private extratoPdfService: ExtratoPdfService
  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.onBuildingSelect();
    });
  }

  onBuildingSelect(): void {
    const selectedBuilding = this.buildings.find(building => building.id === Number(this.selectedBuildingId));
    this.selectedBuildingName = selectedBuilding ? selectedBuilding.nome : '';
    this.loadBuildingBalances();
    this.loadExtratos(); // Carrega os PDFs associados ao prédio
  }

  loadBuildingBalances(): void {
    if (this.selectedBuildingId) {
      this.saldoPorPredioService.getSaldosByBuildingId(this.selectedBuildingId).subscribe(
        (data) => {
          this.saldoPredios = data.reverse();
          const ultimoInvestimento1 = this.saldoPredios.find(item => item.type === 'investimento1');
          if (ultimoInvestimento1) {
            this.investimento1Atualizado = Number(ultimoInvestimento1.valor);
          }
          const ultimoInvestimento2 = this.saldoPredios.find(item => item.type === 'investimento2');
          if (ultimoInvestimento2) {
            this.investimento2Atualizado = Number(ultimoInvestimento2.valor);
          }
          const ultimaConta = this.saldoPredios.find(item => item.type === 'conta');
          if (ultimaConta) {
            this.saldoAtualizado = Number(ultimaConta.valor);
          }
        },
        (error: any) => {
          console.error('Erro ao carregar saldos de prédios:', error);
        }
      );
    } else {
      this.toastr.warning("Selecione um prédio!");
    }
  }

  editSaldoAtualizado(): void {
    this.saldoAtualizadoisEditing = !this.saldoAtualizadoisEditing;
  }

  editInvestimento1Atualizado(): void {
    this.investimento1AtualizadoisEditing = !this.investimento1AtualizadoisEditing;
  }

  editInvestimento2Atualizado(): void {
    this.investimento2AtualizadoisEditing = !this.investimento2AtualizadoisEditing;
  }

  toggleHistoryInvestimento1(): void {
    this.showHistoryInvestimento1 = !this.showHistoryInvestimento1;
  }

  toggleHistoryInvestimento2(): void {
    this.showHistoryInvestimento2 = !this.showHistoryInvestimento2;
  }

  toggleHistoryConta(): void {
    this.showHistoryConta = !this.showHistoryConta;
  }

  addBuildingBalance(type: string): void {
    if (!this.selectedBuildingId) {
      this.toastr.warning("Selecione um prédio!");
      return;
    }
    this.isBuildingBalance = type === 'conta';

    let contaValor = 0;

    if (type === 'conta') {
      this.saldoAtualizadoisEditing = !this.saldoAtualizadoisEditing;
      contaValor = this.saldoAtualizado;
      const ultimaConta = this.saldoPredios.find(item => item.type === 'conta');
      if (ultimaConta && Number(ultimaConta.valor) === contaValor) {
        return;
      }
    }

    if (type === 'investimento1') {
      this.investimento1AtualizadoisEditing = !this.investimento1AtualizadoisEditing;
      contaValor = this.investimento1Atualizado;
      const ultimoInvestimento = this.saldoPredios.find(item => item.type === 'investimento1');
      if (ultimoInvestimento && Number(ultimoInvestimento.valor) === contaValor) {
        return;
      }
    }

    if (type === 'investimento2') {
      this.investimento2AtualizadoisEditing = !this.investimento2AtualizadoisEditing;
      contaValor = this.investimento2Atualizado;
      const ultimoInvestimento = this.saldoPredios.find(item => item.type === 'investimento2');
      if (ultimoInvestimento && Number(ultimoInvestimento.valor) === contaValor) {
        return;
      }
    }

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    this.currentBalance = {
      predio_id: this.selectedBuildingId,
      buildingName: '',
      valor: contaValor,
      data: `${year}-${month}-${day}`,
      type: type,
    };

    this.saveBalance();
  }

  editBuildingBalance(saldo: SaldoPredio): void {
    this.isBuildingBalance = true;
    this.currentBalance = { ...saldo };
    this.currentBalance.data = this.formatDateForSelect(this.currentBalance.data);
    this.openModal();
  }

  saveBalance(): void {
    this.currentBalance.data = this.formatDate(this.currentBalance.data);
    this.saldoPorPredioService.createSaldo(this.currentBalance).subscribe(
      () => {
        this.closeModal();
        this.loadBuildingBalances();
      },
      (error) => console.error('Erro ao salvar saldo de prédio:', error)
    );
  }

  updateBalance(): void {
    if (this.isBuildingBalance) {
      this.currentBalance.data = this.formatDate(this.currentBalance.data);
      this.saldoPorPredioService.updateSaldo(this.currentBalance).subscribe(
        () => {
          this.closeModal();
          this.loadBuildingBalances();
        },
        (error) => console.error('Erro ao atualizar saldo de prédio:', error)
      );
    }
  }

  deleteBuildingBalance(id: number): void {
    this.saldoPorPredioService.deleteSaldo(id).subscribe(
      () => this.loadBuildingBalances(),
      (error) => console.error('Erro ao excluir saldo de prédio:', error)
    );
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentBalance = {};
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  formatDateForSelect(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  formatReal(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  uploadPdf(event: any, type: string): void {
    this.currentPdfType = type;
    this.selectedPdfFile = event.target.files[0];

    if (!this.selectedBuildingId) {
      this.toastr.warning("Selecione um prédio primeiro!");
      return;
    }

    if (this.selectedPdfFile) {
      if (this.selectedPdfFile.type !== 'application/pdf') {
        this.toastr.warning('Apenas arquivos PDF são permitidos!');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileContentBase64 = reader.result?.toString().split(',')[1];
        if (fileContentBase64) {
          const today = new Date();
          const formattedDate = `${this.selectedYear}-${this.selectedMonth}-${today.getDate().toString().padStart(2, '0')}`;

          const extrato: ExtratoPdf = {
            documento: fileContentBase64,
            data_gasto: formattedDate,
            tipo: type,
            predio_id: this.selectedBuildingId
          };
          console.log(extrato)
          this.extratoPdfService.createExtratoPdf(extrato).subscribe({
            next: () => {
              this.toastr.success('PDF enviado com sucesso!');
              this.loadExtratos();
              this.selectedPdfFile = null;
            },
            error: (err) => {
              console.error('Erro ao enviar PDF:', err);
              this.toastr.error('Erro ao enviar PDF!');
            }
          });
        }
      };
      reader.readAsDataURL(this.selectedPdfFile);
    }
  }

  // Carrega os extratos (PDFs) do prédio para o mês/ano selecionado
  loadExtratos(): void {
    if (this.selectedBuildingId) {
      this.isLoadingExtratos = true;
      this.extratoPdfService.getExtratosPdfByBuildingMonthYear(
        this.selectedBuildingId,
        this.selectedMonth,
        this.selectedYear
      ).subscribe({
        next: (extratos: ExtratoPdf[]) => {
          this.uploadedFileConta = extratos.find(e => e.tipo === 'conta') || null;
          this.uploadedFileInvestimento1 = extratos.find(e => e.tipo === 'investimento1') || null;
          this.uploadedFileInvestimento2 = extratos.find(e => e.tipo === 'investimento2') || null;
          this.isLoadingExtratos = false;
         
        },
        error: (err) => {
          this.isLoadingExtratos = false;
        }
      });
    }
  }

  // Função para baixar o PDF usando a resposta do backend com dados em Base64
  downloadFile(file: any): void {
    if (!file || !file.id) {
      this.toastr.error('Arquivo inválido!');
      return;
    }
    this.extratoPdfService.getExtratoPdfById(file.id).subscribe({
      next: (response: any) => {
        console.log(response)
        // Verifica se a resposta contém o campo 'documento' com a string Base64
        if (!response || !response.documento) {
          console.error('A resposta não contém o campo "documento". Resposta:', response);
          this.toastr.error('Resposta inválida do backend!');
          return;
        }

        const base64Data = response.documento;
        // Valida se o base64Data é uma string razoável (não truncada)
        if (!base64Data || typeof base64Data !== 'string' || base64Data.length < 100) {
          console.error('O campo "documento" não contém dados Base64 válidos. Valor:', base64Data);
          this.toastr.error('Dados inválidos para o PDF!');
          return;
        }

        // Converte a string Base64 para um array de bytes
        const byteArray = new Uint8Array(
          atob(base64Data)
            .split('')
            .map(char => char.charCodeAt(0))
        );

        // Cria o Blob a partir do array de bytes
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.nome || 'download.pdf'; // Utilize a propriedade correta para o nome do arquivo
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao baixar PDF:', err);
        this.toastr.error('Erro ao baixar PDF!');
      }
    });
  }

  // Função para excluir o PDF
  deleteFile(file: any): void {
    if (!file || !file.id) {
      this.toastr.error('Arquivo inválido!');
      return;
    }
    console.log(file)
    this.extratoPdfService.deleteExtratoPdf(file.id).subscribe({
      next: () => {
        this.toastr.success('PDF excluído com sucesso!');
        this.loadExtratos();
      },
      error: (err) => {
        console.error('Erro ao excluir PDF:', err);
        this.toastr.error('Erro ao excluir PDF!');
      }
    });
  }
}
