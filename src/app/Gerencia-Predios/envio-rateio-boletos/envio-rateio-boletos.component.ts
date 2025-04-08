import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApartamentoService } from 'src/app/shared/service/Banco_de_Dados/apartamento_service';
import { RateioService } from 'src/app/shared/service/Banco_de_Dados/rateio_service';
import { RateioPorApartamentoService } from 'src/app/shared/service/Banco_de_Dados/rateioPorApartamento_service';
import { RateioBoletoEmailService } from 'src/app/shared/service/Banco_de_Dados/rateiosBoletosEmail_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { Apartamento } from 'src/app/shared/utilitarios/apartamento';
import { Rateio } from 'src/app/shared/utilitarios/rateio';
import { RateioBoletoEmail } from 'src/app/shared/utilitarios/rateioBoletoEmail';

@Component({
  selector: 'app-envio-rateio-boletos',
  templateUrl: './envio-rateio-boletos.component.html',
  styleUrls: ['./envio-rateio-boletos.component.css']
})
export class EnvioRateioBoletosComponent implements OnInit {
  showModal: boolean = false;
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;
  apartamentos: Apartamento[] = [];
  rateios:Rateio[] = [];
  rateiosBoletos:any[] = [];
  uploadedFiles: any[] = [];
  groupedFiles: any[] = [];
  rateioId:number=0;
  constructor(
    private toastr: ToastrService,
    private apartamentoService: ApartamentoService,
    private selectionService: SelectionService,
    private rateioService: RateioService,
    private rateioPorApartamentoService: RateioPorApartamentoService,
    private rateioBoletoEmailService: RateioBoletoEmailService


  ) {}


  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.getAllRateiosByBuildingId();

    });

  }

  changeValues():void{

  }
    
  getAllRateiosByBuildingId(): void {
    if (this.selectedBuildingId == 0) {
      this.toastr.warning("Selecione um prédio primeiro!");
      return
    }
    this.rateioService.getRateiosByBuildingIdAndMonthAndYear(this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.rateioId = resp[0].id;
        if (resp.length == 0) {
          this.toastr.warning("Nenhum rateio encontrado para o periodo selecionado!");
        } else {
          this.rateioPorApartamentoService.getRateiosEPdfsNamesByRateioId(this.rateioId).subscribe({
              next: (resp: any) => {
                this.rateiosBoletos = resp;
                console.log(this.rateiosBoletos);
              },
              error: () => {
                // Handle error if needed
              }
            });
        }
      },
      error: () => {
        // Handle error if needed
      }
    });



  }
  
  uploadPdf(event: any, rateio: any, tipo: 'rateio' | 'boleto'): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.toastr.warning('Por favor, selecione um arquivo PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result?.toString().split(',')[1];
      if (!base64Data) return;

      const payload: RateioBoletoEmail = {
        rateioApartamento_id: rateio.apartamento_id,
        rateio_id: rateio.rateio_id,
        [tipo + 'Pdf']: base64Data,
        [tipo + 'PdfFileName']: file.name,
      };

      this.rateioBoletoEmailService.create(payload).subscribe({
        next: () => {
          this.toastr.success('Arquivo enviado com sucesso!');
          this.getAllRateiosByBuildingId();
        },
        error: () => this.toastr.error('Erro ao enviar arquivo.')
      });
      
    };
    reader.readAsDataURL(file);
  }

  downloadPdf(rateioId: number, tipo: 'rateio' | 'boleto'): void {
    this.rateioBoletoEmailService.getById(rateioId).subscribe({
      next: (response) => {
        const pdfData = response[`${tipo}Pdf` as keyof typeof response];
        const fileName = response[`${tipo}PdfFileName` as keyof typeof response];

        if (!pdfData || !fileName) {
          this.toastr.warning('Arquivo não encontrado.');
          return;
        }

        const byteArray = new Uint8Array(atob(pdfData as string).split('').map(char => char.charCodeAt(0)));
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName as string;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: () => this.toastr.error('Erro ao baixar o arquivo.')
    });
  }
  /** Deleta o PDF do servidor */
  deletePdf(rateioId: number, tipo: 'rateio' | 'boleto'): void {
    this.rateioBoletoEmailService.delete(rateioId, tipo).subscribe({
      next: () => {
        this.toastr.success(`Arquivo de ${tipo} excluído com sucesso!`);
        this.getAllRateiosByBuildingId();
      },
      error: () => this.toastr.error(`Erro ao excluir arquivo de ${tipo}.`)
    });
  }

  sendEmail(rateioId: number): void {
    // Implementar lógica de envio de email conforme necessário
    this.toastr.success('Email enviado com sucesso!')
  }

  // Método para formatar valores em Real (R$)
  formatCurrency(value: number| undefined): string {
    if(value){
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return "R$ 0,00"
  }

  closeModal(): void {
    this.showModal = false;
  
  }
  openModal():void{
    this.showModal = true;

  }
// Modifique a função handleFileSelect
handleFileSelect(event: any): void {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  this.uploadedFiles = Array.from(files).map(file => ({
    file,
    type: this.getFileType(file.name),
    apartmentId: null
  }));

  this.groupFiles();
  this.loadApartamentos();

}

// Adicione estas novas funções
private getFileType(filename: string): 'rateio' | 'boleto' | 'other' {
  const lowerName = filename.toLowerCase();
  if (lowerName.includes('rateio')) return 'rateio';
  if (lowerName.includes('boleto')) return 'boleto';
  return 'other';
}

private groupFiles(): void {
  const groups: {
    [key: string]: {
      rateioFiles: File[];
      boletoFiles: File[];
      aptNumber: string | null;
      selectedApartment: any;
    }
  } = {};

  this.uploadedFiles.forEach(fileInfo => {
    if (fileInfo.type === 'other') return;

    // tira "rateio" ou "boleto" e underscores, sobra algo como "-11" ou "11"
    const baseName = fileInfo.file.name
      .replace(/rateio/gi, '')
      .replace(/boleto/gi, '')
      .replace(/_/g, '')
      .trim();

    // extrai apenas os dígitos
    const aptMatch = baseName.match(/(\d+)/);
    const aptNumber = aptMatch ? aptMatch[1] : null;

    // chave de agrupamento (pode usar baseName ou aptNumber)
    const key = aptNumber ?? baseName;

    if (!groups[key]) {
      groups[key] = {
        rateioFiles: [],
        boletoFiles: [],
        aptNumber,
        selectedApartment: null
      };
    }

    if (fileInfo.type === 'rateio') {
      groups[key].rateioFiles.push(fileInfo.file);
    } else {
      groups[key].boletoFiles.push(fileInfo.file);
    }
  });

  this.groupedFiles = Object.values(groups);
  console.log(this.groupedFiles);
}


private loadApartamentos(): void {
  if (this.selectedBuildingId) {
    this.apartamentoService
      .getApartamentosByBuildingId(this.selectedBuildingId)
      .subscribe(apartamentos => {
        this.apartamentos = apartamentos;

        // para cada grupo, tenta achar o apt correspondente
        this.groupedFiles.forEach(group => {
          if (group.aptNumber) {
            const found = this.apartamentos.find(a =>
              a.nome === group.aptNumber
            );
            // **sempre** atribui algo: ou o ID encontrado, ou null
            group.selectedApartment = found ? found.id : null;
            
          } else {
            // se nem veio número, zera também
            group.selectedApartment = null;
          }
        });
      });
  }
}

/** Remove um arquivo de dentro de um grupo */
removeFile(groupIndex: number, tipo: 'rateio' | 'boleto', fileIndex: number): void {
  const group = this.groupedFiles[groupIndex];
  if (!group) return;

  if (tipo === 'rateio') {
    group.rateioFiles.splice(fileIndex, 1);
  } else {
    group.boletoFiles.splice(fileIndex, 1);
  }

  // Se um grupo ficar sem nenhum arquivo, remove o grupo inteiro
  if (group.rateioFiles.length === 0 && group.boletoFiles.length === 0) {
    this.groupedFiles.splice(groupIndex, 1);
  }
}

/** Remove o grupo inteiro */
removeGroup(groupIndex: number): void {
  this.groupedFiles.splice(groupIndex, 1);
}


saveUploads(): void {
  // Implemente a lógica de salvamento aqui
  console.log('Arquivos agrupados:', this.groupedFiles);
  this.toastr.success('Arquivos processados com sucesso!');
  this.closeModal();
}

}
