import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BuildingService } from 'src/app/shared/service/Banco_de_Dados/buildings_service';
import { PrestacaoCobrancaBoletoService } from 'src/app/shared/service/Banco_de_Dados/prestacaoCobrancaBoletos_service';
import { RateioPorApartamentoService } from 'src/app/shared/service/Banco_de_Dados/rateioPorApartamento_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { Building } from 'src/app/shared/utilitarios/building';
import { Pagamento } from 'src/app/shared/utilitarios/pagamento';
import { PrestacaoCobrancaBoleto } from 'src/app/shared/utilitarios/prestacaoCobrancaBoleto';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cobranca-prestacao',
  templateUrl: './cobranca-prestacao.component.html',
  styleUrls: ['./cobranca-prestacao.component.css']
})
export class CobrancaPrestacaoComponent {
  pagamentosEmAtraso: Pagamento[] = [];
  pagamentosAtrasadosPagos: Pagamento[] = [];
  pagamentosMesmoMesPagos: Pagamento[] = [];
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
  isPlanilhaInserida: boolean = false;
  isCheckboxMarcado: boolean = false;
  existingBoleto!: PrestacaoCobrancaBoleto | null;

  constructor(
    private selectionService: SelectionService,
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private rateioPorApartamentoService: RateioPorApartamentoService,
    private prestacaoCobrancaBoletoService: PrestacaoCobrancaBoletoService

  ) {}

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.getInadimplentesByBuildingId();
      this.verifySelected();
      this.checkExistingBoleto();

      // Consulta se existe boleto para o prédio, mês e ano selecionados

    });
  }

getInadimplentesByBuildingId(): void {
  this.pagamentosEmAtraso = [];
  this.rateioPorApartamentoService.getRateiosNaoPagosPorPredioId(this.selectedBuildingId,this.selectedMonth,this.selectedYear).subscribe(
    (rateiosNaoPagos: any) => {

      rateiosNaoPagos.forEach((rateio: any) => {
        // Split the due date into day, month, and year
        const [mes, ano] = rateio.data_vencimento.split('/');
        this.pagamentosEmAtraso.push({
            apt_name: rateio.apt_name,
            data_vencimento: rateio.data_vencimento,
            data_pagamento: rateio.data_pagamento,
            valor: rateio.valor,
            valor_pagamento: rateio.valor_pagamento,
            id:rateio.id
        });
        
      });
      this.pagamentosEmAtraso.sort((a, b) => a.apt_name.localeCompare(b.apt_name));

    },
    (error) => {
      console.error('Error fetching buildings:', error);
    }
  );
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
        let apartamento = pagamento.cod.slice(0, -2);
        // Formatar a data para "mm/yyyy" removendo o dia
       // Garantir que a data tenha o formato mm/yyyy (com dois dígitos no mês)
        const [dia,mes,ano] = pagamento.dataRecebimento.split('/');
        const dataFormatada = `${month}/${ano}`; // Formata a data para "mm/yyyy"

      
        const dataFormatada2 = `${mes}/${ano}`; // Formata a data para "mm/yyyy"

        if (pagamento.status.toUpperCase() != 'EXPIRADO') {
          // Remover do array pagamentosEmAtraso se a data for igual
          let pagamentoAux:Pagamento = {
            apt_name: apartamento,
            data_vencimento: dataFormatada,
            data_pagamento: dataFormatada2,
            valor: pagamento.valor,
            valor_pagamento: pagamento.valorRecebido,
            
          }
          if(pagamentoAux.apt_name !=""){
            this.procuraPagamentoNosAtrasados(pagamentoAux);
          }
        }
        
      });
      
      // Ordenando os arrays por apartamento em ordem crescente
      this.pagamentosAtrasadosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.pagamentosEmAtraso.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.pagamentosMesmoMesPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.isPlanilhaInserida = true;

    };
    reader.readAsArrayBuffer(file);
  }

  procuraPagamentoNosAtrasados(pagamento: Pagamento): void {
    const normalizarValor = (valor: string): number => {
      const valorNumerico = parseFloat(valor.replace('R$', '').replace(',', '.').trim());
      return Math.floor(valorNumerico);
    };
  
    let pagamentoRemovido: any | null = null;
    this.pagamentosEmAtraso = this.pagamentosEmAtraso.filter((item) => {
      const valorItemFormatado = normalizarValor(item.valor);
      const valorPagamentoFormatado = normalizarValor(pagamento.valor);
      const corresponde =
        item.apt_name === pagamento.apt_name &&
        item.data_vencimento === pagamento.data_vencimento &&
        valorItemFormatado === valorPagamentoFormatado;
      if (corresponde) {
        pagamentoRemovido = item;
      }
      return !corresponde;
    });
  
    if (pagamentoRemovido) {
      if (pagamentoRemovido.data_vencimento !== `${this.selectedMonth.toString().padStart(2, '0')}/${this.selectedYear}`) {
        this.pagamentosAtrasadosPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: pagamentoRemovido.data_vencimento,
          data_pagamento: pagamento.data_pagamento,
          valor_pagamento:  pagamento.valor_pagamento ? pagamento.valor_pagamento.replace('R$', '').replace(',', '.').trim() : "0.00",
          valor: pagamentoRemovido.valor,
          id:pagamentoRemovido.id
        });
        this.pagamentosAtrasadosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      } else {
        this.pagamentosMesmoMesPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: pagamentoRemovido.data_vencimento,
          data_pagamento: pagamento.data_pagamento,
          valor_pagamento:  pagamento.valor_pagamento ? pagamento.valor_pagamento.replace('R$', '').replace(',', '.').trim() : "0.00",
          valor: pagamentoRemovido.valor,
          id:pagamentoRemovido.id
        });
        this.pagamentosMesmoMesPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      }
    }
  }

 
  formatCurrencyPTBR(value: string | undefined): string {
    if(!value){
      return 'R$ 0,00'; // Retorna um valor padrão se o valor for indefinido
    }
    const numericValue = parseFloat(value.replace(',', '.')); // Converte a string para número
    if (isNaN(numericValue)) {
      console.log(value)
      return 'Valor inválido'; // Retorna uma mensagem de erro se o valor não for numérico
    }
    
    return numericValue
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      .replace('R$', 'R$ '); // Adiciona o espaço após o símbolo "R$"
  }


marcarComoPago(pagamento: Pagamento): void {
  let dataSelects = `${this.selectedMonth.toString().padStart(2, '0')}/${this.selectedYear}`;
  let pagamentoRemovido: any | null = null;
    this.pagamentosEmAtraso = this.pagamentosEmAtraso.filter((item) => {
      const corresponde =
        item.id === pagamento.id
      if (corresponde) {
        pagamentoRemovido = item;
      }
      return !corresponde;
    });
    if (pagamentoRemovido) {
      if (pagamentoRemovido.data_vencimento !== `${this.selectedMonth.toString().padStart(2, '0')}/${this.selectedYear}`) {
        this.pagamentosAtrasadosPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: pagamentoRemovido.data_vencimento,
          data_pagamento: dataSelects,
          valor_pagamento: pagamentoRemovido.valor,
          valor: pagamentoRemovido.valor,
          id:pagamentoRemovido.id
        });
        this.pagamentosAtrasadosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      } else {
        this.pagamentosMesmoMesPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: pagamentoRemovido.data_vencimento,
          data_pagamento: pagamentoRemovido.data_vencimento,
          valor_pagamento: pagamentoRemovido.valor,
          valor: pagamentoRemovido.valor,
          id:pagamentoRemovido.id
        });
        this.pagamentosMesmoMesPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      }
    }

  
  // Atualiza a flag com base na existência de pagamentos marcados
  this.isCheckboxMarcado = this.pagamentosAtrasadosPagos.length > 0 || this.pagamentosMesmoMesPagos.length > 0;
}


salvarDados(): void {
  // Cria um array consolidado com os pagamentos atrasados pagos e os condomínios pagos
  let pagamentosConsolidados:any[]=[]

  this.pagamentosAtrasadosPagos.forEach(pagamento=>{
    pagamentosConsolidados.push({
      data_pagamento: pagamento.data_pagamento,
      valor_pagamento: pagamento.valor_pagamento,
      id:pagamento.id
    })
  })
  this.pagamentosMesmoMesPagos.forEach(pagamento=>{
    pagamentosConsolidados.push({
      data_pagamento: pagamento.data_pagamento,
      valor_pagamento: pagamento.valor_pagamento,
      id:pagamento.id
    })
  })
  console.log("pagamentosAtrasadosPagos",this.pagamentosAtrasadosPagos)
  console.log("pagamentosMesmoMesPagos",this.pagamentosMesmoMesPagos)
  console.log("pagamentosConsolidados",pagamentosConsolidados)

  this.rateioPorApartamentoService.atualizarDataPagamentoEValor(pagamentosConsolidados)
    .subscribe(
      () => {
        this.toastr.success('Pagamentos atualizados com sucesso!');
        // Resetar o estado após salvar
        this.pagamentosAtrasadosPagos = [];
        this.pagamentosMesmoMesPagos = [];
        this.isPlanilhaInserida = false;
        this.isCheckboxMarcado = false;
        this.getInadimplentesByBuildingId(); // Atualiza os inadimplentes na tela
      },
      error => {
        console.error('Erro ao atualizar os pagamentos:', error);
        this.toastr.error('Erro ao salvar os pagamentos.');
      }
    );
    
 
}
 // ----------------------------------------------------PDF COBRANCA------------------------------------------------------------------------------------------//
// ------------------------------------------------------------------------------------------------------------------------------------------------------------//
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
        // Remove a parte do prefixo base64 e obtém somente a string codificada
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
            // Atualiza a variável para que apareçam as opções de download e delete
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
  
}
