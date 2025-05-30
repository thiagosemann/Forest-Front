import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { ToastrService } from 'ngx-toastr';
import { BuildingService } from 'src/app/shared/service/Banco_de_Dados/buildings_service';
import { CommonExpenseService } from 'src/app/shared/service/Banco_de_Dados/commonExpense_service';
import { ExpenseTypeService } from 'src/app/shared/service/Banco_de_Dados/tipoGasto_service';
import { SelectionService } from 'src/app/shared/service/selectionService';
import { Building } from 'src/app/shared/utilitarios/building';
import { CommonExpense } from 'src/app/shared/utilitarios/commonExpense';
import { ExpenseType } from 'src/app/shared/utilitarios/expenseType';

@Component({
  selector: 'app-buildings-review',
  templateUrl: './buildings-review.component.html',
  styleUrls: ['./buildings-review.component.css']
})
export class BuildingsReviewComponent implements OnInit {
  buildings: Building[] = [];
  commonExepenses: CommonExpense[] = [];
  gastosView: string = "inicial";
  selectedFiles: File[] = [];
  contasAdicionar : any[]=[];
  rateio:number=0;
  provisao:number=0;
  inserido:number=0;
  inseridoBool:boolean=false;
  valorTotalPorApt:number=0;
  manualGastoForm!: FormGroup;
  expenseTypes:ExpenseType[]=[];
  valorTotal:number=0;
  valorParcela:number=0;
  selectedBuildingId:number=0;
  selectedMonth:number=0;
  selectedYear:number=0;
  showModal: boolean = false;

  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private formBuilder: FormBuilder,
    private commonExepenseService: CommonExpenseService,
    private expenseTypeService: ExpenseTypeService,
    private selectionService: SelectionService,
  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    this.getAllExpenses();
    this.manualGastoForm = this.formBuilder.group({
      detalhe: ['Selecione'],
      nome_original: [''],
      tipo: ['Selecione', Validators.required],   
      data: ["", Validators.required],
      valorTotal: ['', [Validators.required]],
      parcela:['1', [Validators.required, Validators.min(1)]]      
    });
    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.selectedMonth = selecao.month;
      this.selectedYear = selecao.year;
      this.loadExpenses();
    });

 
  }
  
  getAllBuildings(): void {
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        console.log(buildings)
        this.buildings = buildings;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
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

  toggleAddGastosView(tela:string): void {
    if(tela=="inicial"){
      this.gastosView='inicial'
    }else if(tela=="lote"){
      this.gastosView='lote'
    }
  }

  formatarData(data: string): string {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }


  
  // Método chamado quando um arquivo é selecionado
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;

        // Verificar se o arquivo já foi selecionado
        const isDuplicate = this.selectedFiles.some(selectedFile => selectedFile.name === fileName);

        // Verificar se o nome do arquivo está na lista de nomes esperados

        if (!isDuplicate ) {
          // Adicionar o arquivo à lista de arquivos selecionados
          this.selectedFiles.push(file);
          this.readFiles();
        } else {
          this.toastr.warning(`Arquivo duplicado ou com nome inválido: ${fileName}`);
        }
      }


    }

  }
  readFiles(): void {
    this.contasAdicionar = [];
    for (const selectedFile of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        const lines = fileContent.split('\n');
  
        for (const line of lines) {
          const columns = line.split(';');
  
          if (columns.length === 4 && columns[0] !== "Data Lançamento") {
            const valorString = columns[2].replace(',', '.').replace(/\./g, '').replace(/(?!^)(?=\d{2}$)/, '.'); // Substituir a vírgula por ponto e manter apenas o último ponto
  
            let valorFloat = parseFloat(valorString);
            if (!isNaN(valorFloat)) { // Verificar se a conversão para float foi bem-sucedida
              // Formatando para sempre ter dois dígitos após a vírgula
              valorFloat = parseFloat(valorFloat.toFixed(2));
              if (valorFloat < 0) {
                const objAux = {
                  data: columns[0],
                  nome_original: columns[1],
                  valor: valorFloat*-1,
                  adicionar: true,
                  tipo: "Rateio",
                  parcelas: "1"
                };
                this.inserido += valorFloat*-1;
                this.contasAdicionar.push(objAux);
                console.log(valorString);
              }
            }
          }
        }
        this.calculateValorTotal();
      };
  
      reader.readAsText(selectedFile);
    }
  }
   
  deleteFile(index: number): void {
    if (index >= 0 && index < this.selectedFiles!.length) {
      this.selectedFiles!.splice(index, 1);
    }
    this.readFiles();
  }
 
  loadExpenses(): void {
    let dateAux = this.selectedYear + "-" + this.selectedMonth.toString().padStart(2, '0') + "-01";
    this.manualGastoForm.get('data')?.setValue(dateAux);

    this.rateio = 0;
    this.provisao = 0;
    this.commonExepenses = [];  
    if ( this.selectedBuildingId && this.selectedMonth && this.selectedYear) {
      this.commonExepenseService.getExpensesByBuildingAndMonth( this.selectedBuildingId, this.selectedMonth, this.selectedYear).subscribe(
        (expenses: any[]) => {
          console.log(expenses)
          expenses.forEach(expense=>{
            expense.valor = parseFloat(expense.valor);
            if(expense.tipo=="Rateio"){
              this.rateio += expense.valor
            }else if(expense.tipo=="Provisão"){
              this.provisao += expense.valor
            }
            this.commonExepenses.push(expense);
            
          })
          this.calculateValorTotal();
        },
        (error) => {
          console.error('Error fetching expenses:', error);
          this.commonExepenses = [];
        }
      );
    }else{
      this.toastr.warning('Selecione o prédio, o mês e o ano!');
    }
  }
  calculateValorTotal():void{
    this.valorTotal = this.inserido + this.provisao + this.rateio;
    let building = this.buildings.find(building=>building.id === this.selectedBuildingId);
    console.log(building)

    if(building && building.qnt_Apartamentos){
      this.valorTotalPorApt = this.valorTotal / building?.qnt_Apartamentos;
    }
  }

  submitGastos(): void {
    let contasAdd: CommonExpense[] = [];
    let verificacao =0;
    this.contasAdicionar.forEach(conta => {
        const parcelas = parseInt(conta.parcelas);
        const dataParts = conta.data.split('/');
        const dia = parseInt(dataParts[0]);
        const mes = parseInt(dataParts[1]) - 1; // Ajuste para começar do zero
        const ano = parseInt(dataParts[2]);
        let dataGasto = new Date(ano, mes, dia); // Criar o objeto Date com os valores corretos
               
        for (let i = 0; i < parcelas; i++) {
          const obj: CommonExpense = {
            data_gasto: `${dataGasto.getFullYear()}-${dataGasto.getMonth() + 1}-${dataGasto.getDate()}`, // Formatando a data com template literals
            nome_original: conta.nome_original,
            valor: (parseFloat(conta.valor))/parcelas,
            tipo: conta.tipo,
            parcela: i + 1,
            total_parcelas: parcelas,
            predio_id: this.selectedBuildingId,
            tipo_Gasto_Extra:conta.tipo_Gasto_Extra? conta.tipo_Gasto_Extra:""
          };
          if(conta.tipoGasto_id){obj.tipoGasto_id = Number(conta.tipoGasto_id)}
          if(conta.nome_original==""){verificacao++;}
          if(conta.checkboxDetalhe){
            if(conta.tipo_Gasto_Extra==""){
              verificacao++;
            }
          }else{
            if(!conta.tipoGasto_id){verificacao++;console.log("conta",conta)}
          }
          contasAdd.push(obj);
           // Incrementar o mês para a próxima parcela
          dataGasto.setMonth(dataGasto.getMonth()+1)
        }
      
    });
    // Chamada para enviar o array de despesas comuns para o servidor
    if(verificacao==0){
      this.sendCommonExpenses(contasAdd);
    }else{
      this.toastr.warning("Preencha todos os campos!")
    }

    
  }

  deleteConta(conta: any): void {
    // Filtra a lista para remover o item selecionado
    this.contasAdicionar = this.contasAdicionar.filter(c => c !== conta);
    // Recalcula o valor total após a remoção
    this.calculateValorTotal();
  }
  

  checkBoxClikedDetalhe(conta:any):void{
    if(!conta.checkboxDetalhe){
      conta.tipo_Gasto_Extra= "";
    }

    console.log(this.contasAdicionar)
  }
  
  selectContaAddChange(conta:any):void{
    this.inserido = 0;
    this.contasAdicionar.forEach(conta=>{
      this.inserido+=conta.valor/conta.parcelas;  
    })

    this.calculateValorTotal();
  }

  deleteExpense(expense: CommonExpense): void {
   
    if (confirm("Tem certeza que deseja excluir esta despesa comum?") && expense.id ) {
      this.commonExepenseService.deleteCommonExpense(expense.id).subscribe(
        () => {
          // Remover a despesa excluída do array local
          const index = this.commonExepenses.findIndex(e => e.id === expense.id);
          console.log(index)
          if (index !== -1) {
            this.commonExepenses.splice(index, 1);
            this.toastr.success('Despesa excluída com sucesso.');
          }
        },
        (error) => {
          console.error('Erro ao excluir despesa:', error);
          this.toastr.error('Erro ao excluir despesa. Por favor, tente novamente mais tarde.');
        }
      );
    }
  }

  submitManualGasto(): void {

    if (this.manualGastoForm.valid) {
      // Aqui você pode acessar os valores do formulário
      const detalheId = this.manualGastoForm.get('detalhe')?.value;
      const nome_original = this.manualGastoForm.get('nome_original')?.value;
      const tipo = this.manualGastoForm.get('tipo')?.value;
      const valorTotal = this.manualGastoForm.get('valorTotal')?.value;
      const parcela = this.manualGastoForm.get('parcela')?.value;
      const predioID = Number(this.selectedBuildingId);
      // Obter a data do formulário
      let data = this.manualGastoForm.get('data')?.value;
      data = new Date(data); // Converter para objeto Date
      data.setDate(data.getDate() + 1); // Corrigir o problema de menos 1 dia

      let commonExpenses: CommonExpense[] = [];
  
      if (parcela == 1) {
        if(detalheId=="Selecione"){
          let commonExpenseAux: CommonExpense = {
            data_gasto: `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`, // Formatando a data
            nome_original: nome_original,
            valor: Number(valorTotal),
            tipo: tipo,
            parcela: 1,
            total_parcelas: 1,
            predio_id: predioID,
            tipo_Gasto_Extra:nome_original
          };
          commonExpenses.push(commonExpenseAux);
        }else{
          let expenseType = this.expenseTypes.find(expenseType=>expenseType.id === detalheId);
          let commonExpenseAux: CommonExpense = {
            data_gasto: `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`, // Formatando a data
            nome_original: expenseType?.detalhes || "Gasto Comun",
            valor: Number(valorTotal),
            tipo: tipo,
            parcela: 1,
            total_parcelas: 1,
            predio_id: predioID,
            tipoGasto_id: detalheId ,
            tipo_Gasto_Extra:""
          };
          commonExpenses.push(commonExpenseAux);
        }

      } else {
        for (let i = 0; i < parcela; i++) {
          let newDate = new Date(data);
          newDate.setMonth(newDate.getMonth() + i); // Adicionar um mês para cada parcela
          let commonExpenseAux: CommonExpense = {
            data_gasto:  `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`,
            nome_original: nome_original,
            valor: Number(valorTotal) / Number(parcela),
            tipo: tipo,
            parcela: i + 1,
            total_parcelas: parcela,
            predio_id: predioID,
            tipoGasto_id: detalheId,
            tipo_Gasto_Extra:""
          };
          commonExpenses.push(commonExpenseAux);
        }
      }
      console.log(commonExpenses)
      this.sendCommonExpenses(commonExpenses);
      this.manualGastoForm.reset();
      this.valorParcela = 0;
      this.manualGastoForm.get('parcela')?.setValue(1);
      this.showModal = false;
    } else {
      this.toastr.error('Por favor, preencha todos os campos corretamente.');
    }
  }

  sendCommonExpenses(commonExpenses:CommonExpense[]):void{
    console.log(commonExpenses)
    this.commonExepenseService.createCommonExpenses(commonExpenses).subscribe(
      (createdExpenses: CommonExpense[]) => {
        console.log('Despesas comuns criadas com sucesso:', createdExpenses);
        this.contasAdicionar = [];
        this.loadExpenses();
        this.toastr.success("Gastos enviados com sucesso!")
        this.toggleAddGastosView("inicial")
      },
      (error) => {
        console.error('Erro ao criar despesas comuns:', error);
        this.toastr.error('Erro ao criar despesas comuns:', error)
      }
    );
  }
  
  
  changeInputParcela():void{
    const parcela = this.manualGastoForm.get('parcela')?.value;
    if(Number(parcela)==0){
      this.manualGastoForm.get('parcela')?.setValue(1);
    }
    const valor = this.manualGastoForm.get('valorTotal')?.value;
    console.log('valor:', valor);
    console.log('parcela:', parcela);
    if(Number(parcela)==1){
      this.valorParcela= 0;
    }else{
      this.valorParcela = Number(valor)/Number(parcela);
    }

  }


  closeModal(): void {
    this.showModal = false;
  }
  
  openModal(): void {
    this.showModal = true;
  }
  
  saveExpenseType(): void {

  }
  
  
}
