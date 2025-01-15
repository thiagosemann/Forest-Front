import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonExpenseService } from 'src/app/shared/service/Banco_de_Dados/commonExpense_service';
import { NotaGastoComumService } from 'src/app/shared/service/Banco_de_Dados/notasGastosComuns_service';
import { ExpenseTypeService } from 'src/app/shared/service/Banco_de_Dados/tipoGasto_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { CommonExpense } from 'src/app/shared/utilitarios/commonExpense';
import { ExpenseType } from 'src/app/shared/utilitarios/expenseType';
import { NotaGastoComum } from 'src/app/shared/utilitarios/notasGastosComuns';

@Component({
  selector: 'app-nota-fiscal-gastos-comuns',
  templateUrl: './nota-fiscal-gastos-comuns.component.html',
  styleUrls: ['./nota-fiscal-gastos-comuns.component.css']
})
export class NotaFiscalGastosComunsComponent {
  commonExepenses: CommonExpense[] = [];
  expenseTypes:ExpenseType[]=[];
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;

  constructor(
    private toastr: ToastrService,
    private notaGastoComumService:NotaGastoComumService,
    private expenseTypeService: ExpenseTypeService,
    private selectionService: SelectionService,
    private commonExepenseService: CommonExpenseService

  ) {}

  ngOnInit(): void {
    this.getAllExpenses();
    this.loadExpenses();

    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.loadExpenses();
    });

  }

  loadExpenses(): void {
    this.commonExepenses = [];  
    if ( this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
      this.commonExepenseService.getExpensesByBuildingAndMonth( this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
        (expenses: any[]) => {
          console.log(expenses)
          expenses.forEach(expense=>{
            expense.valor = parseFloat(expense.valor);
              this.commonExepenses.push(expense);
          })
        },
        (error) => {
          console.error('Error fetching expenses:', error);
          this.commonExepenses = [];
        }
      );
    }
  }
  getAllExpenses(): void {
    this.expenseTypeService.getAllExpenseTypes().subscribe(
      (expenseTypes: ExpenseType[]) => {
        this.expenseTypes = expenseTypes;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  }
  getExpenseDetalhes(commonExpense:CommonExpense):string{
    let expenseAux = this.expenseTypes.find(expense=>expense.id === commonExpense.tipoGasto_id)
    return expenseAux?.detalhes || ""
  }
  formatarData(data: string): string {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
  criarNotaGastoComumSelected(event: any, expense: CommonExpense): void {
    const files: FileList = event.target.files;
    if (!expense.id) {
      return;
    }
  
    if (files.length > 0) {
      const file = files[0];
  
      // Verifica se o arquivo selecionado é um PDF
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
  
        reader.onload = () => {
          // Converte o conteúdo do arquivo para Base64
          const fileContentBase64 = reader.result?.toString().split(',')[1];
  
          if (fileContentBase64) {
            // Cria o objeto NotaGastoComum
            const newDocumento: NotaGastoComum = {
              documentBlob: fileContentBase64, // Conteúdo Base64 do arquivo
              commonExpense_id: expense.id || 0, // ID do gasto comum
            };
  
            console.log(newDocumento);
  
            // Envia o FormData com o arquivo para o backend
            this.notaGastoComumService.createNotaGastoComum(newDocumento).subscribe(
              (response) => {
                // Após o sucesso, você pode atualizar o objeto de documento na interface
                expense.documento = newDocumento;
                expense.nota_id = response.id;
  
                this.toastr.success(`Arquivo "${file.name}" adicionado com sucesso!`);
              },
              (error) => {
                this.toastr.error('Erro ao adicionar o arquivo. Tente novamente.');
              }
            );
          }
        };
  
        // Inicia a leitura do arquivo
        reader.readAsDataURL(file);
      } else {
        this.toastr.warning('Por favor, selecione um arquivo PDF.');
      }
    }
  }
  
  downloadNotaFiscal(expense: CommonExpense): void {
    if (expense && expense.nota_id) {
      console.log(`Iniciando download da nota fiscal. Nota ID: ${expense.nota_id}`);
  
      this.notaGastoComumService.getNotaGastoComumById(expense.nota_id).subscribe(
        (response: any) => {
          console.log('Resposta recebida do backend:', response);
  
          // Verificar se a resposta contém o campo 'document' com a string Base64
          if (!response || !response.document) {
            console.error('A resposta não contém o campo "document". Resposta:', response);
            return;
          }
  
          const base64Data = response.document; // A string Base64 recebida no campo 'document'
  
          // Verificar se 'base64Data' é uma string válida e não está truncada
          if (!base64Data || typeof base64Data !== 'string' || base64Data.length < 100) {
            console.error('O campo "document" não contém dados Base64 válidos. Valor:', base64Data);
            return;
          }
  
          // Converter a string Base64 para um array de bytes
          const byteArray = new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)));
  
          // Criar o Blob a partir do array de bytes
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          console.log('Blob criado com sucesso.');
  
          // Criar o link para download
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `nota_fiscal_${expense.nota_id}.pdf`; // Nome do arquivo
          link.click();
  
          console.log('Download iniciado com sucesso.');
        },
        (error) => {
          console.error('Erro ao solicitar a nota fiscal ao backend:', error);
        }
      );
    } else {
      console.warn('Parâmetro "expense" inválido ou "nota_id" ausente.', expense);
    }
  }
  
  
  
    deleteNotaFiscal(expense: CommonExpense): void {
    if (expense && expense.nota_id) {
      this.notaGastoComumService.deleteNotaGastoComum(expense.nota_id).subscribe(
        () => {
          // Remover a referência da nota fiscal na despesa
  
          this.toastr.success('Nota fiscal excluída com sucesso!');
        },
        (error) => {
          this.toastr.error('Erro ao excluir a nota fiscal. Tente novamente.');
        }
      );
    } else {
      this.toastr.warning('Não há nota fiscal associada a essa despesa.');
    }
  }
}
