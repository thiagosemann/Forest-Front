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
  usersRateio:any[]=[];
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
                this.usersRateio = resp
                this.usersRateio.forEach(user => {
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
                this.usersRateio = [];
              }
            );
           // this.usersRateio = resp.rateio;
          } else {
            this.rateioGerado=false;
            this.calculateRateioService.getRateioByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
              (resp: any) => {
                this.loading = false; // Encerrar o loading
                if (resp.rateio) {
                  this.usersRateio = resp.rateio;
                  console.log( this.usersRateio)
                } else {
                  this.mensagemErro = 'Insira todos os dados necessários para se realizar o rateio.';
                  this.usersRateio = [];
                }
              },
              (error) => {
                this.loading = false; // Encerrar o loading
                this.mensagemErro = 'Erro ao carregar os dados: ' + error.message;
                this.usersRateio = [];
              }
            );
          }
        },
        (error) => {
          this.loading = false; // Encerrar o loading
          this.mensagemErro = 'Erro ao carregar os dados: ' + error.message;
          this.usersRateio = [];
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
  
    if (this.usersRateio.length === 0) {
      this.loading = false;
      this.textoLoading = "Carregando dados...";
      this.toastr.warning('Nenhum rateio disponível para download.');
      return;
    }
  
    const zip = new JSZip();
    let index = 1;
    const totalUsers = this.usersRateio.length;
  
    for (const user of this.usersRateio) {
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
        usersRateio:this.usersRateio
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

    this.usersRateio.forEach(user=>{
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
  async downloadCNAB400(): Promise<void> {
    this.loading = true;
    this.downloading = true;
    this.textoLoading = "Gerando arquivo CNAB400...";

    try {
      // 1. Gerar conteúdo do CNAB400
      const cnabContent = this.generateCNAB400Content();
      
      // 2. Nome do arquivo conforme padrão do Inter
      const numeroSequencial = this.getSequencialRemessa(); // Implemente essa função
      const nomeArquivo = `C1400_001_${numeroSequencial}.REM`;
  
      // 3. Criar Blob e fazer download
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
  private generateCNAB400Content(): string {
    const header = this.createCNABHeader();
    const detalhes = this.createCNABDetails();
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
  private createCNABDetails(): string[] {
    let building = this.buildings.find((building) => building.id === this.selectedBuildingId);
    console.log(building)

    return this.usersRateio.map((user, index) => {
      const valorTotal = (user.valorComum || 0) + (user.valorFundos || 0) + (user.valorProvisoes || 0) + (user.valorIndividual || 0);
      const valorEmCentavos = Math.round(valorTotal * 100).toString().padStart(13, '0');
      // Gerar "Seu número" (user.apt_name + mês com 2 dígitos)
      const mesFormatado = this.selectedMonth.toString().padStart(2, '0'); // Ex: "03" para março
      const codigoBoleto = (user.apt_name.slice(0, 8) + mesFormatado) // Limita a 10 caracteres
        .toUpperCase() // Remove acentos e mantém maiúsculas
        .replace(/[^A-Z0-9]/g, '') // Remove caracteres especiais
        .padEnd(10, ' '); // Completa com espaços se necessário
      return [
        '1', // Identificação do Registro (1)
        ''.padEnd(19, ' '), // Brancos (2-20)
        '112', // Carteira (21-23) (112 = padrão Inter)
        '0001', // Agência (24-27)
        '123456789'.padStart(9, '0'), // Conta Corrente (28-36) (Ajustar para sua conta)
        '0', // DV da Conta (37) (Ajustar)
        user.apt_name.padEnd(25, ' '), // Número Controle (38-62) (Nome do usuário)
        ''.padEnd(3, ' '), // Brancos (63-65)
        '1', // Campo de Multa (66)
        '0000000000000', // Valor Multa (67-79)
        '0002', // Percentual Multa (80-83)
        '000000', // Data Multa (84-89)
        '00000000000', // Nosso Número (90-100) (Preencher conforme faixa reservada)
        ''.padEnd(8, ' '), // Brancos (101-108)
        '01', // Identificação da Ocorrência (109-110) (01 = Remessa)
        codigoBoleto, // Seu Número (111-120)
        this.dateVencimentoCNAB(), // Data Vencimento (121-126)
        valorEmCentavos, // Valor do Título (127-139)
        '60', // Data Limite Pagamento (140-141) (60 dias após vencimento)
        ''.padEnd(6, ' '), // Brancos (142-147)
        '01', // Espécie do Título (148-149)
        'N', // Identificação (150)
        ''.padEnd(6, ' '), // Data Emissão (151-156)
        ''.padEnd(3, ' '), // Brancos (157-159)
        '1', // Juros/Mora (160)
        '0000000000000', // Valor Juros (161-173)
        '0001', // Taxa Juros (174-177)
        '000000', // Data Mora (178-183)
        '0', // Descontos (184)
        '0000000000000', // Valor Desconto 1 (185-197)
        '0000', // Percentual Desconto 1 (198-201)
        '000000', // Data Desconto 1 (202-207)
        ''.padEnd(13, ' '), // Brancos (208-220)
        '02', // Tipo Inscrição Pagador (221-222) (02 = CNPJ)
        '12345678000195'.padStart(14, '0'), // CNPJ Pagador (223-236)
        user.apt_name.padEnd(40, ' '), // Nome Pagador (237-276)
        'Endereço Pagador'.padEnd(38, ' '), // Endereço (277-314)
        'PR', // UF (315-316)
        building?.cep, // CEP (317-324)
        ''.padEnd(70, ' '), // Mensagem 1 (325-394)
        (index + 1).toString().padStart(6, '0') // Sequencial (395-400)
      ].join('');
    });
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
      // 1. Gerar conteúdo do CNAB240
      const cnab = this.generateCNAB240Content();

      // 2. Nome do arquivo (padrão exemplo)
      const numeroSequencial = this.getSequencialRemessa().padStart(7, '0');
      const nomeArquivo = `C0240_001_${numeroSequencial}.REM`;

      // 3. Criar Blob e baixar
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

  private generateCNAB240Content(): string {
    const headerArquivo  = this.createCNAB240HeaderArquivo();
    const headerLote    = this.createCNAB240HeaderLote();
    const detalhes      = this.createCNAB240Detalhes();        // array de linhas
    const trailerLote   = this.createCNAB240TrailerLote(detalhes.length + 2);
    const trailerArquivo= this.createCNAB240TrailerArquivo(1);  // 1 lote

    // concatena tudo com fim de linha CRLF
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
  private createCNAB240Detalhes(): string[] {
    const building = this.buildings.find(b => b.id === this.selectedBuildingId);
    return this.usersRateio.map((user, idx) => {
      // Calcule valor em centavos e formate campos
      const valorTotal = (user.valorComum||0)+(user.valorFundos||0)+(user.valorProvisoes||0)+(user.valorIndividual||0);
      const valorCent = Math.round(valorTotal*100).toString().padStart(15,'0');

      // SEGMENTO P (informações cobrança)
      const segP = [
        '3',                  // 001 – registro detalhe
        '0001',               // 002-005 – lote
        '3',                  // 006 – segmento P
        ' ',                  // 007 – campo exclusivo CNAB
        '01',                 // 008-009 – tipo inscrição pagador
        '12345678000195',     // 010-023 – CNPJ pagador
        user.apt_name.padEnd(40,' '),    // 024-063 – nome pagador
        // … demais campos até posição 240 …
        valorCent,            // 140-154 – valor do título
        ''.padEnd(240-154,' ')// complete o restante
      ].join('').slice(0,240);

      // SEGMENTO Q (informações complemento, ex.: endereço, multa, descontos…)
      const segQ = ''.padEnd(240,' '); // monte conforme layout do segmento Q

      return [segP, segQ].join('\r\n');
    }).flat();
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
