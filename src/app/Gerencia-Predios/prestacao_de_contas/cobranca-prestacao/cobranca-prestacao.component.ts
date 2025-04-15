import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BuildingService } from 'src/app/shared/service/Banco_de_Dados/buildings_service';
import { RateioPorApartamentoService } from 'src/app/shared/service/Banco_de_Dados/rateioPorApartamento_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { Building } from 'src/app/shared/utilitarios/building';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cobranca-prestacao',
  templateUrl: './cobranca-prestacao.component.html',
  styleUrls: ['./cobranca-prestacao.component.css']
})
export class CobrancaPrestacaoComponent {
  pagamentosEmAtraso: { apt_name: string; data_vencimento: string; valor: string }[] = [];
  pagamentosAtrasadosPagos: { apt_name: string; data_vencimento: string; valor: string }[] = [];
  pagamentosMesmoMesPagos: { apt_name: string; data_vencimento: string; valor: string }[] = [];
  condominiosPagos: { apt_name: string; data_vencimento: string; valor: string }[] = [];
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

  constructor(
    private selectionService: SelectionService,
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private rateioPorApartamentoService: RateioPorApartamentoService

  ) {}

  ngOnInit(): void {
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.verifySelected();
      this.getInadimplentesByBuildingId();
    });
  }

getInadimplentesByBuildingId(): void {
  this.pagamentosEmAtraso = [];
  this.rateioPorApartamentoService.getRateiosNaoPagosPorPredioId(this.selectedBuildingId,this.selectedMonth,this.selectedYear).subscribe(
    (rateiosNaoPagos: any) => {
      console.log(rateiosNaoPagos)
      rateiosNaoPagos.forEach((rateio: any) => {
        // Split the due date into day, month, and year
        const [mes, ano] = rateio.data_vencimento.split('/');
        const rateioMonth = parseInt(mes, 10);
        const rateioYear = parseInt(ano, 10);
        this.pagamentosEmAtraso.push({
            apt_name: rateio.apt_name,
            data_vencimento: rateio.data_vencimento,
            valor: rateio.valor
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
      console.log( this.pagamentosXls)
      this.pagamentosXls.forEach(pagamento => {
        let month = pagamento.cod.slice(-2);
        let year = pagamento.vencimento.slice(-4);
        let apartamento = pagamento.cod.slice(0, -2);
      
        // Formatar a data para "mm/yyyy" removendo o dia
     // Garantir que a data tenha o formato mm/yyyy (com dois dígitos no mês)
      const [dia, mes, ano] = pagamento.dataRecebimento.split('/');
      const dataFormatada = `${month}/${ano}`; // Formata a data para "mm/yyyy"
      const valorFormatado = parseFloat(pagamento.valor.replace('R$', '').replace(',', '.'));
      if (pagamento.status.toUpperCase() == 'EXPIRADO') {
        // Não pagos mesmo mês
      } else {
        // Pagos mesmo mês
        this.condominiosPagos.push({
          apt_name: apartamento,
          data_vencimento: dataFormatada, // Data no formato mm/yyyy
          valor: valorFormatado.toString()
        });
  
        // Remover do array pagamentosEmAtraso se a data for igual
        this.procuraPagamentoNosAtrasados({
          apartamento: apartamento,
          data: dataFormatada, // Verifica se a data de recebimento é a mesma, agora no formato mm/yyyy
          valor: pagamento.valor
        });
      }
        
      });
      
      // Ordenando os arrays por apartamento em ordem crescente
      this.pagamentosAtrasadosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.pagamentosEmAtraso.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.pagamentosMesmoMesPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.condominiosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      this.isPlanilhaInserida = true;

    };
    reader.readAsArrayBuffer(file);
  }
  formatCurrencyPTBR(value: string): string {
    const numericValue = parseFloat(value.replace(',', '.')); // Converte a string para número
    if (isNaN(numericValue)) {
      return 'Valor inválido'; // Retorna uma mensagem de erro se o valor não for numérico
    }
    
    return numericValue
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      .replace('R$', 'R$ '); // Adiciona o espaço após o símbolo "R$"
  }

  procuraPagamentoNosAtrasados(pagamento: { apartamento: string; data: string; valor: string }): void {
    const normalizarValor = (valor: string): number => {
      const valorNumerico = parseFloat(valor.replace('R$', '').replace(',', '.').trim());
      return Math.floor(valorNumerico);
    };
  
    let pagamentoRemovido: any | null = null;
    this.pagamentosEmAtraso = this.pagamentosEmAtraso.filter((item) => {
      const valorItemFormatado = normalizarValor(item.valor);
      const valorPagamentoFormatado = normalizarValor(pagamento.valor);
      const corresponde =
        item.apt_name === pagamento.apartamento &&
        item.data_vencimento === pagamento.data &&
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
          valor: pagamentoRemovido.valor
        });
        this.pagamentosAtrasadosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      } else {
        this.pagamentosMesmoMesPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: pagamentoRemovido.data_vencimento,
          valor: pagamentoRemovido.valor
        });
        this.pagamentosMesmoMesPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      }
    }
  }
  

salvarDados(): void {
  // Cria um array consolidado com os pagamentos atrasados pagos e os condomínios pagos
  const pagamentosConsolidados = [
    ...this.pagamentosAtrasadosPagos.map(pagamento => ({
      apt_name: pagamento.apt_name,
      data_vencimento: pagamento.data_vencimento,
      valor: pagamento.valor,
      tipo: 'Atrasado Pago'
    })),
    ...this.pagamentosMesmoMesPagos.map(pagamento => ({
      apt_name: pagamento.apt_name,
      data_vencimento: pagamento.data_vencimento,
      valor: pagamento.valor,
      tipo: 'Condomínio Pago'
    }))
  ];
  console.log(pagamentosConsolidados)

  // Chama a função do service para atualizar a data de pagamento
 this.rateioPorApartamentoService.atualizarDataPagamento(pagamentosConsolidados)
    .subscribe(
      () => {
        console.log('Data de pagamento atualizada com sucesso.');
        this.toastr.success('Dados salvos com sucesso!');
      },
      error => {
        console.error('Erro ao atualizar data de pagamento:', error);
        this.toastr.error('Erro ao salvar os dados.');
      }
    );

  // Resetar o estado após salvar
  this.isPlanilhaInserida = false;
  this.condominiosPagos = [];
  this.pagamentosAtrasadosPagos = [];
  this.pagamentosEmAtraso = [];
  
}

marcarComoPago(pagamento: { apt_name: string; data_vencimento: string; valor: string }, event: any): void {
  if (event.target.checked) {

    let pagamentoRemovido: any | null = null;
    this.pagamentosEmAtraso = this.pagamentosEmAtraso.filter((item) => {
      const corresponde =
        item.apt_name === pagamento.apt_name &&
        item.data_vencimento === pagamento.data_vencimento &&
        item.valor === pagamento.valor;
      if (corresponde) {
        pagamentoRemovido = item;
      }
      return !corresponde;
    });
    if (pagamentoRemovido) {
      if (pagamentoRemovido.data_vencimento !== `${this.selectedMonth.toString().padStart(2, '0')}/${this.selectedYear}`) {
        this.pagamentosAtrasadosPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: `${this.selectedMonth.toString().padStart(2, '0')}/${this.selectedYear}`,
          valor: pagamentoRemovido.valor
        });
        this.pagamentosAtrasadosPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      } else {
        this.pagamentosMesmoMesPagos.push({
          apt_name: pagamentoRemovido.apt_name,
          data_vencimento: pagamentoRemovido.data_vencimento,
          valor: pagamentoRemovido.valor
        });
        this.pagamentosMesmoMesPagos.sort((a, b) => a.apt_name.localeCompare(b.apt_name));
      }
    }

  } else {
    // Se desmarcar o checkbox, talvez você queira desfazer a ação.
    // Opcional: implementar lógica para reverter o pagamento marcado.
  }
  console.log(pagamento)
  // Atualiza a flag com base na existência de pagamentos marcados
  this.isCheckboxMarcado = this.pagamentosAtrasadosPagos.length > 0 || this.pagamentosMesmoMesPagos.length > 0;
}


  
}
