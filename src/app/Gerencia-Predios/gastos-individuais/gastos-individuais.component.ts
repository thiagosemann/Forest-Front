import { Component, OnInit } from '@angular/core';
import { Building } from '../../shared/utilitarios/building';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { ToastrService } from 'ngx-toastr';
import { User } from '../../shared/utilitarios/user';
import { Apartamento } from '../../shared/utilitarios/apartamento';
import { ExcelService } from '../../shared/service/excelService';
import * as XLSX from 'xlsx';
import { GastoIndividual } from '../../shared/utilitarios/gastoIndividual';
import { BuildingService } from '../../shared/service/Banco_de_Dados/buildings_service';
import { ApartamentoService } from '../../shared/service/Banco_de_Dados/apartamento_service';
import { GastosIndividuaisService } from '../../shared/service/Banco_de_Dados/gastosIndividuais_service';
import { CommonExpenseService } from '../../shared/service/Banco_de_Dados/commonExpense_service';
import { ExpenseType } from '../../shared/utilitarios/expenseType';
import { CommonExpense } from '../../shared/utilitarios/commonExpense';
import { SelectionService } from '../../shared/service/selectionService';

@Component({
  selector: 'app-gastos-individuais',
  templateUrl: './gastos-individuais.component.html',
  styleUrls: ['./gastos-individuais.component.css']
})
export class GastosIndividuaisComponent implements OnInit {
  buildings: Building[] = [];
  myForm!: FormGroup;
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;
  expenseTypes:ExpenseType[]=[];
  valorAguaGastoComum:number=0;
  users: User[] = [];
  apartamentos: Apartamento[] = [];
  dataModel: any[] = [];
  gastosIndividuais:GastoIndividual[]=[];
  gastosIndividuaisInsert:GastoIndividual[]=[];
  loading: boolean = false;
  m3TotalAgua:number=0;
  saveData:boolean =false;
  filteredMonths: { monthNumber: number; monthName: string }[] = [];
  uploading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private formBuilder: FormBuilder,
    private apartamentoService: ApartamentoService,
    private excelService: ExcelService,
    private gastosIndividuaisService: GastosIndividuaisService,
    private commonExepenseService: CommonExpenseService,
    private selectionService: SelectionService

  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    this.myForm = this.formBuilder.group({
      taxaAgua:[93.28, Validators.required],
      taxaGas:[10.0, Validators.required]

    });

    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.loadExpenses();
    });
  }

  getAllBuildings(): void {
    this.buildingService.getAllBuildings().subscribe({
      next: (buildings: Building[]) => {
        this.buildings = buildings;
      },
      error: (error) => {
        console.error('Error fetching buildings:', error);
      }
    });
  }



  getAguaGastoComun(): void {
    if(this.selectedBuildingId && this.selectedMonth && this.selectedYear){
      this.commonExepenseService
      .getExpensesByBuildingAndMonth(this.selectedBuildingId, this.selectedMonth, this.selectedYear)
      .subscribe(
        (expenses: CommonExpense[] = []) => {
          const aguaExpense = expenses.find(expense => expense.tipo === "Agua");
          if (aguaExpense) {
            this.valorAguaGastoComum = aguaExpense.valor;
          } 
        },
        (error) => {
          this.toastr.error("Nenhum gasto comum inserido para esse mês.");
          this.valorAguaGastoComum = 0;
          console.error('Error fetching expenses:', error);
        }
      );
    }

  }
  
  getAllApartamentosByBuildingId(buildingId:number,createGastos:boolean): void {
    this.apartamentos=[];
    this.apartamentoService.getApartamentosByBuildingId(buildingId).subscribe({
      next: (apartamentos: Apartamento[]) => {
        if(apartamentos.length==0){
          this.toastr.error("Prédio sem apartamentos cadastrados!")
        }
        this.apartamentos = apartamentos      
        if(createGastos){
          this.createGastoIndividualInsert()
        }
      },
      error: (error) => {
        console.error('Error fetching buildings:', error);
      }
    });
  }

  loadExpenses(): void {
    if(this.loading){
      return
    }
    this.gastosIndividuais = [];
    this.gastosIndividuaisInsert = [];
    if(this.selectedBuildingId==0 || this.selectedMonth==0 || this.selectedYear==0){
      return
    }

    
    this.getAguaGastoComun()
    this.loading = true;
    if (this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
      this.gastosIndividuaisService.getIndividualExpensesByPredioMonthAndYear(this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
        (gastosIndividuais: GastoIndividual[]) => {
          this.gastosIndividuais = gastosIndividuais;
          this.gastosIndividuais.forEach(gasto=>{
            gasto.valorTotal = Number(gasto.aguaValor)+ Number(gasto.gasValor) + Number(gasto.lavanderia) + Number(gasto.multa) + Number(gasto.lazer);
          })
          if(this.gastosIndividuais.length ==0){
            this.getAllApartamentosByBuildingId(this.selectedBuildingId,true);
          }
          this.loadingToFalse();

        },
        (error) => {
          this.toastr.info("Nenhum gasto inserido para esse mês.")
          this.getAllApartamentosByBuildingId(this.selectedBuildingId,true);
          console.error('Error fetching expenses:', error);
          this.loadingToFalse();
        }
      );
    } else {
      this.users = [];
      this.loadingToFalse();
    }

  }
  loadingToFalse():void{
    this.loading = false;
  }


  createGastoIndividualInsert():void{
    this.gastosIndividuaisInsert = [];
    const date = this.setDate();
    this.apartamentos.forEach(apartamento=>{
      let apartamentoAux : GastoIndividual = {
        apt_id: apartamento.id!,
        apt_name: apartamento.nome,
        apt_fracao: apartamento.fracao,
        aguaM3: 0,
        aguaValor: 0,              
        gasM3: 0,
        gasValor: 0,
        lazer: 0,
        lavanderia: 0,
        multa: 0,
        data_gasto:date
      }
      this.gastosIndividuaisInsert.push(apartamentoAux)
    })
  }

  downloadModel(): void {
    this.dataModel = [];
    this.apartamentos.forEach((apartamento) => {
      this.dataModel.push({ Apartamento: apartamento.nome });
    });
    this.excelService.exportToExcel(this.dataModel, 'modelo');
  }

  downloadFilledSheet(): void {
    if (this.gastosIndividuais.length === 0) {
      this.toastr.info('Não há dados para exportar.');
      return;
    }
  
    // Criar uma matriz com os dados que você deseja exportar
    const wsData: any[][] = [
      ['Apartamento', 'Água(m3)', 'Gás(m3)', 'Lazer', 'Lavanderia', 'Multa'],
      ...this.gastosIndividuais.map(gasto => [
        gasto.apt_name,
        gasto.aguaM3,
        gasto.gasM3,
        gasto.lazer,
        gasto.lavanderia,
        gasto.multa
      ])
    ];
  
    // Criação da planilha e aba
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos Individuais');
  
    // Gerar e baixar o arquivo Excel
    XLSX.writeFile(wb, `Gastos_Individuais_${this.selectedMonth}_${this.selectedYear}.xlsx`);
  }

  handleFileInput(event: any): void {
    if(this.valorAguaGastoComum==0){
      this.toastr.error("Insira o valor da água no Gasto Comum!");
      return
    }
    // Começar a girar o spinner
    this.uploading = true;
    this.saveData = true;
    this.gastosIndividuaisInsert=[];
    const file = event.target.files[0]; // Obter o arquivo selecionado
    const reader = new FileReader();
  
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
  
      // Obter a primeira planilha do arquivo
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Converter a planilha para um objeto JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      jsonData.forEach((row: any[]) => {
        let apartamento = this.apartamentos.find(apartamento => apartamento.nome === row[0]);
        let aguaM3 = row[1];
        let gasM3 = row[2];
        let lazer = row[3];
        let lavanderia = row[4];
        let multa = row[5];
        let date = this.setDate() ;
        if (apartamento) {
          this.m3TotalAgua+=Number(aguaM3);
          let apartamentoAux : GastoIndividual = {
            apt_id: apartamento.id!,
            apt_name: apartamento.nome,
            apt_fracao: apartamento.fracao,
            aguaM3: aguaM3  || 0,
            aguaValor: 0,              
            gasM3: gasM3  || 0,
            gasValor: 0,
            lazer: lazer  || 0,
            lavanderia: lavanderia  || 0,
            multa: multa || 0,
            data_gasto: date
          }
          this.gastosIndividuaisInsert.push(apartamentoAux)
        }
      })
      if(this.apartamentos.length!=this.gastosIndividuaisInsert.length){
        this.toastr.error("Verifique os apartamentos inseridos no arquivo!")  
      }
      console.log(this.gastosIndividuaisInsert)
      this.calculateAguaValue();
      this.calculateGasValue();
  
      // Parar de girar o spinner após o carregamento
      this.uploading = false;
    };
  
    reader.onerror = () => {
      console.error('Erro ao ler o arquivo.');
      // Parar de girar o spinner em caso de erro
      this.uploading = false;
    };
  
    // Ler o conteúdo do arquivo como um array buffer
    reader.readAsArrayBuffer(file);
  }
  calculateGasValue(): void {
    let taxaGas = this.myForm.get('taxaGas')?.value.replace(',', '.'); // Substitui vírgula por ponto
    let taxaGasNumber = Number(taxaGas); // Converte para número
  
    this.gastosIndividuaisInsert.forEach(expense => {
      expense.gasValor = expense.gasM3 * taxaGasNumber;
      expense.valorTotal = Number(expense.aguaValor) + 
        Number(expense.gasValor) + 
        Number(expense.lazer) + 
        Number(expense.lavanderia) + 
        Number(expense.multa);
    });
  }
  
  calculateAguaValue(): void {
    let taxaAgua =  Number(this.myForm.get('taxaAgua')?.value);
    let valorTotalAgua = taxaAgua * this.apartamentos.length;
    let diferencaAgua = this.valorAguaGastoComum - valorTotalAgua;
  

    this.gastosIndividuaisInsert.forEach(expense=>{
      if(expense.apt_name?.toUpperCase().includes("VAGA") || expense.apt_name?.toUpperCase().includes("LOJA") ){
        expense.aguaValor = 0;
        return;
      }
      expense.aguaValor= taxaAgua;
      expense.valorTotal = Number(expense.aguaValor) + 
                           Number(expense.gasValor) + 
                           Number(expense.lazer) + 
                           Number(expense.lavanderia) + 
                           Number(expense.multa);
    })
    if(this.valorAguaGastoComum>taxaAgua*this.gastosIndividuaisInsert.length ){
        // Filtrar os gastos com água que ultrapassam 5m³
        const aguaExpenses = this.gastosIndividuaisInsert.filter(gasto => gasto.aguaM3 >= 5);

        // Calcular o total de metros cúbicos de água ultrapassados (acima de 5)
        const aguaM3Ultrapassado = aguaExpenses.reduce((total, expense) => total + (expense.aguaM3 - 5), 0);

        // Se há ultrapassagem de consumo de água, redistribuir a diferença
        if (aguaM3Ultrapassado > 0) {
          aguaExpenses.forEach(expense => {
            const proporcao = (expense.aguaM3 - 5) / aguaM3Ultrapassado;
            expense.aguaValor += proporcao * diferencaAgua; // Adicionar a parte proporcional da diferença
          });
        }
    }
    // Recalcular o valor total de cada apartamento
    this.gastosIndividuaisInsert.forEach(expense => {
      expense.valorTotal = Number(expense.aguaValor) + 
                          Number(expense.gasValor) + 
                          Number(expense.lazer) + 
                          Number(expense.lavanderia) + 
                          Number(expense.multa);
    });

  }
  

  saveGastosIndividuais():void{
    //this.saveData = false;
    this.gastosIndividuaisService.createGastoIndividual(this.gastosIndividuaisInsert).subscribe(
      (gastosIndividuais: GastoIndividual[]) => {
        this.toastr.success("Gastos inseridos com sucesso");
      },
      (error) => {
        console.error('Erro ao criar despesas comuns:', error);
        this.toastr.error('Erro ao criar despesas comuns:', error)
      }
    );
    this.saveData = false;
  }

  cancelGastosIndividuais():void{
    this.saveData = false;
    this.gastosIndividuais.forEach(gasto=>{
      gasto.aguaM3=0;
      gasto.gasM3=0;
      gasto.lazer=0;
      gasto.lavanderia=0;
      gasto.multa=0;
    })
  }

  deleteAll(): void {
    let idsToDelete:number[]=[];
    this.gastosIndividuais.forEach(gasto=>{
      if(gasto.id){
        idsToDelete.push(gasto.id)
      }
    })

    if (idsToDelete.length === 0) {
      this.toastr.warning("Nenhum gasto selecionado para excluir.");
      return;
    }
  
    this.gastosIndividuaisService.deleteIndividualExpensesInBatch(idsToDelete).subscribe({
      next: () => {
        this.toastr.success("Gastos excluídos com sucesso.");
        // Atualiza a lista após a exclusão
        this.loadExpenses();
      },
      error: (error) => {
        console.error("Erro ao excluir gastos:", error);
        this.toastr.error("Erro ao excluir os gastos.");
      }
    });
  }
  
  // Método para formatar valores em Real (R$)
  formatCurrency(value: number| undefined): string {
    if(value){
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return "R$ 0,00"
  }
  
  setDate(): string {
    const date = new Date();
    let day = date.getDate().toString().padStart(2,'0');
    let year = date.getFullYear().toString();

    return this.selectedYear + '-' + this.selectedMonth + '-' + day;

  }

  
}
