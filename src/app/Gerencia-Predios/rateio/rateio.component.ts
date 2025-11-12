import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { Building } from '../../shared/utilitarios/building';
import { ToastrService } from 'ngx-toastr';
import { Apartamento } from '../../shared/utilitarios/apartamento';
import { GastoIndividual } from '../../shared/utilitarios/gastoIndividual';
import { BuildingService } from '../../shared/service/Banco_de_Dados/buildings_service';
import { RateioPorApartamento } from '../../shared/utilitarios/rateioPorApartamento';
import { CalculateRateioService } from '../../shared/service/Banco_de_Dados/calculateRateio_service';
import { SelectionService } from '../../shared/service/selectionService';
import { PdfService } from '../../shared/service/Pdf-Service/pdfService';
import { CommonExpenseService } from '../../shared/service/Banco_de_Dados/commonExpense_service';
import { GastosIndividuaisService } from '../../shared/service/Banco_de_Dados/gastosIndividuais_service';
import { ProvisaoService } from '../../shared/service/Banco_de_Dados/provisao_service';
import { FundoService } from '../../shared/service/Banco_de_Dados/fundo_service';
import { RateioService } from '../../shared/service/Banco_de_Dados/rateio_service';
import { Rateio } from '../../shared/utilitarios/rateio';
import { RateioPorApartamentoService } from '../../shared/service/Banco_de_Dados/rateioPorApartamento_service';
import { SaldoPorPredioService } from '../../shared/service/Banco_de_Dados/saldo_por_predio_service';
import { SaldoPredio } from '../../shared/utilitarios/saldoPredio';
import { UsersApartamentosService } from 'src/app/shared/service/Banco_de_Dados/userApartamento_service';
import { User } from 'src/app/shared/utilitarios/user';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-rateio',
  templateUrl: './rateio.component.html',
  styleUrls: ['./rateio.component.css']
})
export class RateioComponent implements OnInit {
  buildings: Building[] = [];
  gastoComumValor : number=0;
  gastoComumValorTotal: number=0;
  gastoIndividualValorTotal:number=0;
  apartamentos: Apartamento[] = [];
  gastosIndividuais:GastoIndividual[]=[];
  rateiosPorApartamento:any[]=[];
  provisoesRateadas:number=0;
  fundosRateados:number=0;
  mensagemErro: string = '';
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;
  loading: boolean = false;
  textoLoading:string="Carregando...";
  loadingPercentage: number = 0;  // Nova variável para a porcentagem de carregamento
  cancelDownload: boolean = false;  // Variável para controlar o cancelamento
  downloading: boolean = false;
  rateioGerado: boolean = false;
  saldoPredios: SaldoPredio[] = [];
  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private calculateRateioService: CalculateRateioService, 
    private selectionService: SelectionService,
    private pdfService: PdfService,
    private commonExepenseService: CommonExpenseService,
    private gastosIndividuaisService: GastosIndividuaisService,
    private provisaoService: ProvisaoService, // Injeta o novo service
    private fundoService: FundoService,
    private rateioService: RateioService,
    private rateioPorApartamento: RateioPorApartamentoService,
    private saldoPorPredioService: SaldoPorPredioService,
    private userApartamentoService: UsersApartamentosService

  ) {}
  ngOnInit(): void {
    this.getAllBuildings();

    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.changeSelect();
    });
  }
  
  getAllBuildings(): void {
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  }

  getSaldosByBuildingId(): void {
    if (this.selectedBuildingId) {
      this.saldoPorPredioService.getSaldosByBuildingId(this.selectedBuildingId).subscribe(
        (data) => {
          this.saldoPredios = data;
        },
        (error: any) => {
          console.error('Erro ao carregar saldos de prédios:', error);
        }
      );
    } else {
      this.toastr.warning("Selecione um prédio!");
    }
  }

  changeSelect(): void {
    if(this.selectedBuildingId==0 || this.selectedMonth==0 || this.selectedYear==0){
      return
    }
    
    if (this.selectedMonth != 0 && this.selectedYear != 0 && this.selectedBuildingId != 0) {
      this.loading = true; // Iniciar o loading
      this.mensagemErro = ''; // Limpar mensagem de erro
      this.getSaldosByBuildingId();
      this.rateioService.getRateiosByBuildingIdAndMonthAndYear(this.selectedBuildingId,this.selectedMonth,this.selectedYear).subscribe(
        (resp: any) => {
         if (resp.length>0) {
          this.rateioGerado=true;
            this.rateioPorApartamento.getRateiosPorApartamentoByRateioId(resp[resp.length-1].id).subscribe(
              (resp: any) => {
                console.log(resp)
                this.rateiosPorApartamento = resp
                this.rateiosPorApartamento.forEach(user => {
                  // Converte as propriedades 'valorIndividual', 'valorComum', 'valorProvisoes' e 'valorFundos' para Number
                  user.valor = Number(user.valor);
                  user.valorIndividual = Number(user.valorIndividual);
                  user.valorComum = Number(user.valorComum);
                  user.valorProvisoes = Number(user.valorProvisoes);
                  user.valorFundos = Number(user.valorFundos);
                });
                
                this.loading = false; // Encerrar o loading

              },
              (error) => {
                this.loading = false; // Encerrar o loading
                this.mensagemErro = 'Erro ao carregar os dados: ' + error.message;
                this.rateiosPorApartamento = [];
              }
            );
           // this.rateiosPorApartamento = resp.rateio;
          } else {
            this.rateioGerado=false;
            this.calculateRateioService.getRateioByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
              (resp: any) => {
                this.loading = false; // Encerrar o loading
                if (resp.rateio) {
                  this.rateiosPorApartamento = resp.rateio;
                  console.log( this.rateiosPorApartamento)
                } else {
                  this.mensagemErro = 'Insira todos os dados necessários para se realizar o rateio.';
                  this.rateiosPorApartamento = [];
                }
              },
              (error) => {
                this.loading = false; // Encerrar o loading
                this.mensagemErro = 'Erro ao carregar os dados: ' + error.message;
                this.rateiosPorApartamento = [];
              }
            );
          }
        },
        (error) => {
          this.loading = false; // Encerrar o loading
          this.mensagemErro = 'Erro ao carregar os dados: ' + error.message;
          this.rateiosPorApartamento = [];
        }
      );


    }
  }
  
  async generateRateio(user: any,expenses:any[],provisoes:any[],fundos:any[]): Promise<Blob | null> {
    try {
      const {
        apartamento_id,
        apt_name,
        apt_fracao,
        fracao_total,
        vagas,
        valor,
        valorComum,
        valorFundos,
        valorProvisoes,
        valorIndividual,
        fracao_vagas,
      } = user;
      let totalCondo =0;
      if(valor){
        totalCondo = valor;
      }else{
        totalCondo = valorComum + valorFundos + valorProvisoes + valorIndividual;
      }
       
      let vagas_fracao = 0.0; // Defina como número
      // Calcular a fração total das vagas
      if (vagas && vagas.length > 0) {
        vagas_fracao = vagas.reduce((sum: number, { fracao }: { fracao: any }) => sum + Number(fracao), 0);
      } else {
        if (fracao_vagas) {
          vagas_fracao = Number(fracao_vagas); // Assegure-se de que é convertido para número
        } else {
          vagas_fracao = 0.0;
        }
      }
      console.log(vagas_fracao)
  
      let rateiosPorApartamentoId = await this.rateioPorApartamento.getRateioPorApartamentoByAptId(apartamento_id).toPromise();
      
      // Obter despesas individuais de forma simples
      let individualExpenses = await this.gastosIndividuaisService.getGastosIndividuaisByApartment(apartamento_id).toPromise();
     
      if (!expenses || !provisoes || ! fundos ) return null;
    
      // Filtrar apenas as despesas do tipo 'Rateio'
      const collectiveExpenses = expenses;
  

      let gastoIndividual :any ={}
      if(individualExpenses && individualExpenses.length>0){
        if(individualExpenses){
          individualExpenses.sort((a, b) => new Date(a.data_gasto).getTime() - new Date(b.data_gasto).getTime());
        }
          // Encontrar o gasto individual relevante
        gastoIndividual = individualExpenses.find((gasto) => {
          const dataGasto = new Date(gasto.data_gasto);
          return (
            dataGasto.getMonth() + 1 === Number(this.selectedMonth) &&
            dataGasto.getFullYear() === Number(this.selectedYear)
          );
        });
    
        if (!gastoIndividual) return null;
  
      }else{
        gastoIndividual.aguaValor = 0;
        gastoIndividual.gasValor = 0;
        gastoIndividual.lavanderia = 0;
        gastoIndividual.lazer = 0;
        gastoIndividual.multa = 0;
      }
      let building = this.buildings.find((building) => building.id === this.selectedBuildingId);
      // Estruturar os dados para o PDF
      const rateioData = {
        month: this.selectedMonth,
        apartment: apt_name,
        condoTotal: totalCondo,
        apt_fracao,
        fracao_total,
        vagas_fracao: vagas_fracao.toString(),
        building:building,
        summary: {
          individualExpenses: valorIndividual,
          collectiveExpenses: valorComum + valorFundos + valorProvisoes,
          totalCondo,
        },
        individualExpenses: [
          { category: 'Água', value: gastoIndividual.aguaValor },
          { category: 'Gás', value: gastoIndividual.gasValor },
          { category: 'Lavanderia', value: gastoIndividual.lavanderia },
          { category: 'Lazer', value: gastoIndividual.lazer },
          { category: 'Multa', value: gastoIndividual.multa },
        ],
        collectiveExpenses,
        individualExpensesHistory: individualExpenses,
        provisoes:provisoes,
        fundos:fundos,
        saldosPredios:this.saldoPredios,
        rateiosPorApartamentoId
      };
      // Gerar o PDF e retornar como Blob
      return await this.pdfService.generateCondoStatement(rateioData);
    } catch (error) {
      console.error('Error generating rateio:', error);
      return null;
    }
  }
  
  

  async downloadAllRateios(type:string): Promise<void> {
    // Adiciona a confirmação antes de iniciar o processo  
    const confirmacao = window.confirm('Você tem certeza que deseja gerar os rateios?');

    if (!confirmacao) {
      // Se o usuário não confirmar, a função será interrompida
      return;
    }
    this.loading = true;  // Ativar estado de carregamento
    this.downloading = true;
    this.loadingPercentage = 0;  // Iniciar com 0%
    this.textoLoading = "Preparando para gerar rateios...";  // Mensagem inicial
    this.cancelDownload = false;  // Resetando o estado de cancelamento
  
    if (this.rateiosPorApartamento.length === 0) {
      this.loading = false;
      this.textoLoading = "Carregando dados...";
      this.toastr.warning('Nenhum rateio disponível para download.');
      return;
    }
  
    const zip = new JSZip();
    let index = 1;
    const totalUsers = this.rateiosPorApartamento.length;
  
    for (const user of this.rateiosPorApartamento) {
      if (this.cancelDownload) {
        this.textoLoading = "Download cancelado.";
        this.loading = false;
        this.downloading = false;

        return;  // Interrompe o loop se o cancelamento for solicitado
      }
  
      this.textoLoading = `Gerando arquivos PDF... (${index}/${totalUsers})`;
      this.loadingPercentage = (index / totalUsers) * 100;
      // Obter despesas comuns e individuais em paralelo
      const [expenses = [], provisoes = [], fundos = []] = await Promise.all([
        this.commonExepenseService
          .getExpensesByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
          .toPromise(),
        this.provisaoService.getProvisoesByBuildingId(this.selectedBuildingId).toPromise(),
        this.fundoService.getFundosByBuildingId(this.selectedBuildingId).toPromise(),
      ]);
  
      const pdfBlob = await this.generateRateio(user,expenses,provisoes,fundos);
      if (pdfBlob) {
        zip.file(`${user.apt_name}.pdf`, pdfBlob);
        index++;
      }

 
    }
    if (type == 'gerar') {
      // Gerar os rateios
      let rateio: Rateio = {
        mes: this.selectedMonth,
        ano:this.selectedYear,
        predio_id: this.selectedBuildingId,
        rateiosPorApartamento:this.rateiosPorApartamento
      };
      this.rateioService.createRateio(rateio).subscribe(
        (response) => {
          // Trate a resposta aqui, se necessário
        },
        (error) => {
          // Trate o erro aqui, se necessário
        }
      );
    }
  
    this.textoLoading = "Compactando arquivos no formato ZIP...";
    this.loadingPercentage = 100;
  
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Rateios_${this.selectedMonth}_${this.selectedYear}.zip`);
      this.toastr.success('Download concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar arquivo zip:', error);
      this.toastr.error('Erro ao criar o arquivo zip.');
    } finally {
      this.textoLoading = "Carregando dados...";
      this.loading = false;
      this.downloading = false;

    }
  }
  // Método para gerar e baixar o PDF para um único usuário
  async generateAndDownloadPDF(user: any): Promise<void> {
    try {
      // Obter despesas comuns e individuais em paralelo
      const [expenses = [], provisoes = [], fundos = []] = await Promise.all([
        this.commonExepenseService
          .getExpensesByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
          .toPromise(),
        this.provisaoService.getProvisoesByBuildingId(this.selectedBuildingId).toPromise(),
        this.fundoService.getFundosByBuildingId(this.selectedBuildingId).toPromise(),
      ]);
      const pdfBlob = await this.generateRateio(user,expenses,provisoes,fundos); // Gera o PDF para esse usuário específico
      
      if (pdfBlob) {
        // Nome do arquivo PDF
        const fileName = `${user.apt_name}.pdf`;

        // Salva o PDF gerado
        saveAs(pdfBlob, fileName);
        this.toastr.success('PDF gerado com sucesso!');
      } else {
        this.toastr.error('Não foi possível gerar o PDF para este usuário.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF para o usuário:', error);
      this.toastr.error('Erro ao gerar o PDF.');
    }
  }


  cancelDownloadProcess(): void {
    // Define a flag para cancelar o download
    this.cancelDownload = true;
    this.loading = false;
    this.downloading = false;
  }
  
  formatCurrency(value: number| undefined): string {
    if(value){
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return "R$ 0,00"
  }

  returnValorTotal(rateio:RateioPorApartamento): string {
    if(rateio && rateio.valorComum){
      let valorFundos =  rateio.valorFundos|| 0;
      let valorProvisoes =  rateio.valorProvisoes|| 0;
      let valorIndividual =  rateio.valorIndividual|| 0;
      return this.formatCurrency(rateio.valorComum + valorFundos + valorProvisoes + valorIndividual )
    }
    return "R$ 0,00"
  }

  formatFracaoTotal(fracao_total: any): string {
    if (fracao_total === null || fracao_total === undefined || isNaN(fracao_total)) {
      return '0.0000000'; // Valor padrão para valores inválidos
    }
  
    // Certifique-se de que o valor é tratado como número
    const numberValue = Number(fracao_total);
  
    // Retorna o número formatado com 7 casas decimais
    return numberValue.toFixed(7);
  }
  
  somaRateios(): string {
    let soma=0;

    this.rateiosPorApartamento.forEach(user=>{
      let valorFundos =  user.valorFundos|| 0;
      let valorProvisoes =  user.valorProvisoes|| 0;
      let valorIndividual =  user.valorIndividual|| 0;
      let valorComum =  user.valorComum|| 0;
      soma+=valorComum + valorFundos + valorProvisoes + valorIndividual
    })
    return this.formatCurrency(soma)
  }


  

  //-------------------------------------------------CNAB 400-------------------------------------------//
  //-------------------------------------------------CNAB 400-------------------------------------------//
  async getUserFromApartamento(apartamentoId: number): Promise<User[]> {
    return lastValueFrom(
      this.userApartamentoService.getUsersByApartamentoId(apartamentoId)
    );
  }

  async downloadCNAB400(): Promise<void> {
    this.loading = true;
    this.downloading = true;
    this.textoLoading = 'Gerando arquivo CNAB400...';

    try {
      // Agora generateCNAB400Content é async
      const cnabContent = await this.generateCNAB400Content();

      const numeroSequencial = this.getSequencialRemessa();
      const nomeArquivo = `C1400_001_${numeroSequencial}.REM`;

      const blob = new Blob([cnabContent], { type: 'text/plain;charset=iso-8859-1' });
      saveAs(blob, nomeArquivo);

      this.toastr.success('Arquivo CNAB400 gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar CNAB400:', error);
      this.toastr.error('Erro ao gerar arquivo CNAB400');
    } finally {
      this.loading = false;
      this.downloading = false;
    }
  }

  // 2) generateCNAB400Content agora é async
  private async generateCNAB400Content(): Promise<string> {
    const header = this.createCNABHeader();
    const detalhes = await this.createCNABDetails(); // aguarda detalhes
    const trailer = this.createCNABTrailer(detalhes.length);
    return header + '\r\n' + detalhes.join('\r\n') + '\r\n' + trailer;
  }
  
  // HEADER (Posições 1-400)
  private createCNABHeader(): string {
    const dataAtual = new Date();
    const formattedDate = this.formatCNABDate(dataAtual); // Formato DDMMAA
    const numeroSequencial = this.getSequencialRemessa().padStart(7, '0'); // Ex: "0000769"
  
    return [
      '0', // Identificação do Registro (1)
      '1', // Identificação do Arquivo Remessa (2)
      'REMESSA'.padEnd(7, ' '), // Literal Remessa (3-9)
      '01'.padStart(2, '0'), // Código de Serviço (10-11)
      'COBRANCA'.padEnd(15, ' '), // Literal Serviço (12-26)
      ''.padEnd(20, ' '), // Brancos (27-46)
      'Forest'.padEnd(30, ' '), // Nome da Empresa (47-76)
      '077', // Código do Banco (77-79)
      'INTER'.padEnd(15, ' '), // Nome do Banco (80-94)
      formattedDate, // Data de Gravação (95-100)
      ''.padEnd(10, ' '), // Brancos (101-110)
      numeroSequencial, // Número Sequencial da Remessa (111-117)
      ''.padEnd(277, ' '), // Brancos (118-394)
      '000001' // Sequencial do Registro (395-400)
    ].join('');
  }
  
  // DETALHES (Registro Tipo 1 - Posições 1-400)
   // 3) createCNABDetails convertido para async + loop for…of
  private async createCNABDetails(): Promise<string[]> {
    const detalhes: string[] = [];
    const building = this.buildings.find(b => b.id === this.selectedBuildingId);

    for (let index = 0; index < this.rateiosPorApartamento.length; index++) {
      const apartamento = this.rateiosPorApartamento[index];

      // 4) busca usuários e pega o primeiro
      const users = await this.getUserFromApartamento(apartamento.apartamento_id);
      const userToUse = users[0];  // garante que sempre pegue o primeiro
      if (!userToUse) {
        this.toastr.warning(`Apartamento ${apartamento.apt_name} sem usuários.`);
        continue;
      }

      const valorTotal =
        (apartamento.valorComum || 0) +
        (apartamento.valorFundos || 0) +
        (apartamento.valorProvisoes || 0) +
        (apartamento.valorIndividual || 0);

      const valorEmCentavos = Math.round(valorTotal * 100)
        .toString()
        .padStart(13, '0');

      const mesFormatado = this.selectedMonth.toString().padStart(2, '0');
      const codigoBoleto = (
        apartamento.apt_name.slice(0, 8) +
        mesFormatado
      )
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .padEnd(10, ' ');

      const registro = [
        '1', // Identificação do Registro (1)
        ''.padEnd(19, ' '),
        '112', // Carteira
        '0001', // Agência
        '123456789'.padStart(9, '0'), // Conta
        '0', // DV
        apartamento.apt_name.padEnd(25, ' '), // Controle
        ''.padEnd(3, ' '),
        '1', // Multa
        '0000000000000',
        '0002',
        '000000',
        '00000000000',
        ''.padEnd(8, ' '),
        '01', // Ocorrência
        codigoBoleto, // Seu Número
        this.dateVencimentoCNAB(), // Vencimento
        valorEmCentavos,
        '60',
        ''.padEnd(6, ' '),
        '01',
        'N',
        ''.padEnd(6, ' '),
        ''.padEnd(3, ' '),
        '1',
        '0000000000000',
        '0001',
        '000000',
        '0',
        '0000000000000',
        '0000',
        '000000',
        ''.padEnd(13, ' '),
        '01', // Tipo Inscrição Pagador (01 = CPF)
        userToUse.cpf.replace(/\D/g, '').padStart(14, '0'),  // CPF (posições 223–236)
        userToUse.first_name.padEnd(40, ' '),                      // Nome (posições 237–276)
        ''.padEnd(118, ' '),                                 // Endereço(38) + UF(2) + CEP(8) + Mensagem(70)
        (index + 1).toString().padStart(6, '0'),             // Sequencial (395–400)
      ].join('');

      detalhes.push(registro);
    }

    return detalhes;
  }
  // TRAILER (Posições 1-400)
  private createCNABTrailer(totalRegistros: number): string {
    return [
      '9', // Identificação do Registro (1)
      totalRegistros.toString().padStart(6, '0'), // Quantidade de Boletos (2-7)
      ''.padEnd(387, ' '), // Brancos (8-394)
      (totalRegistros + 2).toString().padStart(6, '0') // Sequencial (395-400)
    ].join('');
  }
  
  // Função auxiliar para data DDMMAA
  private formatCNABDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return day + month + year;
  }

  private dateVencimentoCNAB(): string {
    let monthVencimento = Number(this.selectedMonth) + 1;
    let year = Number(this.selectedYear);
    console.log(year)
    if (monthVencimento > 12) {
      monthVencimento = 1;
      year += 1; // Incrementa o ano se o mês for maior que 12
    }

    const month = monthVencimento.toString().padStart(2, '0');
    const yearShort = year.toString().slice(-2); // Pega os últimos dois dígitos do ano
    console.log("Vencimento:", '10' + month + yearShort);
    return '10' + month + yearShort;
  }
  
  // Obter número sequencial (exemplo simplificado)
  private getSequencialRemessa(): string {
    return '0000001'; // Implemente lógica de incremento
  }


  //-------------------------------------------------CNAB 240-------------------------------------------//
  //-------------------------------------------------CNAB 240-------------------------------------------//

  async downloadCNAB240(): Promise<void> {
    this.loading = true;
    this.downloading = true;
    this.textoLoading = 'Gerando arquivo CNAB240...';
  
    try {
      // AGORA usa await aqui
      const cnab = await this.generateCNAB240Content();
  
      const seq = this.getSequencialRemessa().padStart(7, '0');
      const nomeArquivo = `C0240_001_${seq}.REM`;
  
      const blob = new Blob([cnab], { type: 'text/plain;charset=iso-8859-1' });
      saveAs(blob, nomeArquivo);
  
      this.toastr.success('Arquivo CNAB240 gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar CNAB240:', error);
      this.toastr.error('Erro ao gerar arquivo CNAB240');
    } finally {
      this.loading = false;
      this.downloading = false;
    }
  }

  private async generateCNAB240Content(): Promise<string> {
    const headerArquivo  = this.createCNAB240HeaderArquivo();
    const headerLote     = this.createCNAB240HeaderLote();
  
    // AQUI: usa await para resolver a Promise<string[]>
    const detalhes       = await this.createCNAB240Detalhes();
  
    // Agora detalhes é um string[], então .length funciona
    const trailerLote    = this.createCNAB240TrailerLote(detalhes.length + 2);
    const trailerArquivo = this.createCNAB240TrailerArquivo(1);
  
    return [
      headerArquivo,
      headerLote,
      ...detalhes,
      trailerLote,
      trailerArquivo
    ].join('\r\n');
  }
  
  //
  // 1) HEADER DE ARQUIVO (240 chars)
  //
  private createCNAB240HeaderArquivo(): string {
    const data = this.formatCNABDate(new Date());  // DDMMAA
    const seq  = this.getSequencialRemessa().padStart(7, '0');

    return [
      '0',                  // 001 – identificação do registro
      '1',                  // 002 – operacao (1=remessa)
      'C',                  // 003 – literal ‘REMESSA’
      ''.padEnd(7, ' '),    // 004-010 – literal remessa
      '01',                 // 011-012 – código do serviço
      'COBRANCA'.padEnd(15,' '), // 013-027 – literal serviço
      ''.padEnd(240-27-9,' '),   // brancos até posição 231
      seq,                  // 232-238 – número remessa
      ''.padEnd(2,' '),     // 239-240 – complemento
    ].join('').slice(0,240);
  }

  //
  // 2) HEADER DE LOTE (240 chars)
  //
  private createCNAB240HeaderLote(): string {
    // …mesma lógica do header arquivo, mas com registro tipo 1, lote = '0001', etc.
    // Preencha campos como código do banco, agência, conta, nomes…
    const lote = '0001';
    const seqLote = '000001';
    return [
      '1',                  // 001 – registro header de lote
      lote,                 // 002-005 – número do lote
      '1',                  // 006 – tipo de registro
      'C',                  // 007 – tipo da operação
      ' ',                  // 008 – código serviço
      ''.padEnd(15,' '),    // 009-023 – literal serviço
      ''.padEnd(1,' '),     // 024 – versao layout
      ''.padEnd(1,' '),     // 025 – forma de lancamento
      ''.padEnd(240-25,' '),// preencha o restante conforme spec
      seqLote               // 239-240 sequencial dentro do lote
    ].join('').slice(0,240);
  }

  //
  // 3) DETALHES (segmentos P/Q, um por boleto) – cada linha 240 chars
  //
private async createCNAB240Detalhes(): Promise<string[]> {
  const building = this.buildings.find(b => b.id === this.selectedBuildingId);
  const detalhes: string[] = [];

  for (let idx = 0; idx < this.rateiosPorApartamento.length; idx++) {
    const userRateio = this.rateiosPorApartamento[idx];

    // busca usuários e pega o primeiro
    const users = await this.getUserFromApartamento(userRateio.apartamento_id);
    const userToUse = users[0];
    if (!userToUse) {
      this.toastr.warning(`Apartamento ${userRateio.apt_name} sem usuários.`);
      continue;
    }

    // calcula valor em centavos
    const valorTotal = 
      (userRateio.valorComum || 0) +
      (userRateio.valorFundos || 0) +
      (userRateio.valorProvisoes || 0) +
      (userRateio.valorIndividual || 0);
    const valorCent = Math.round(valorTotal * 100).toString().padStart(15, '0');

    // --- SEGMENTO P (240 posições) ---
    const segP = [
      '3',                   // registro detalhe
      '0001',                // lote
      '3',                   // segmento P
      ' ',                   // CNAB exclusivo
      '01',                  // Tipo Inscrição (01 = CPF)
      userToUse.cpf.replace(/\D/g,'').padStart(14,'0'), // CPF (14 dígitos)
      userToUse.first_name.padEnd(40, ' '),             // Nome Pagador (40 chars)
      // ... preencha os demais campos obrigatórios do P ...
      valorCent,             // Valor do Título (positions 140-154)
      ''.padEnd(240 - /*até aqui*/154, ' ')
    ].join('').slice(0, 240);

    // --- SEGMENTO Q (240 posições) ---
    const segQ = [
      '3',                   // registro detalhe
      '0001',                // lote
      '4',                   // segmento Q
      ' ',                   // CNAB exclusivo
      // você pode usar apenas os campos de multa/desconto ou deixar brancos
      ''.padEnd(240 - 4, ' ')
    ].join('').slice(0, 240);

    detalhes.push(segP, segQ);
  }

  return detalhes;
}

  //
  // 4) TRAILER DE LOTE (240 chars)
  //
  private createCNAB240TrailerLote(totalRegistros: number): string {
    const lote = '0001';
    const quantidade = totalRegistros.toString().padStart(6,'0');
    return [
      '5',            // 001 – registro trailer de lote
      lote,           // 002-005 – lote
      '5',            // 006 – tipo registro
      quantidade,     // 007-012 – qtde registros no lote
      ''.padEnd(240-12,' ')
    ].join('').slice(0,240);
  }

  //
  // 5) TRAILER DE ARQUIVO (240 chars)
  //
  private createCNAB240TrailerArquivo(totalLotes: number): string {
    const qtLotes = totalLotes.toString().padStart(6,'0');
    const qtRegistros = (totalLotes * 2 + 2).toString().padStart(6,'0');
    return [
      '9',            // 001 – registro trailer
      qtLotes,        // 002-007 – qtde lotes
      qtRegistros,    // 008-013 – qtde registros
      ''.padEnd(240-13,' ')
    ].join('').slice(0,240);
  }

}
