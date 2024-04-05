import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { ToastrService } from 'ngx-toastr';
import { BuildingService } from 'src/app/shared/service/buildings_service';
import { CommonExpenseService } from 'src/app/shared/service/commonExpense_service';
import { Building } from 'src/app/shared/utilitarios/building';
import { CommonExpense } from 'src/app/shared/utilitarios/commonExpense';

@Component({
  selector: 'app-buildings-review',
  templateUrl: './buildings-review.component.html',
  styleUrls: ['./buildings-review.component.css']
})
export class BuildingsReviewComponent implements OnInit {
  buildings: Building[] = [];
  commonExepenses: CommonExpense[] = [];
  buildingId: number | undefined = 1;
  myForm!: FormGroup; // Initialize myForm as a FormGroup
  addGastosView: boolean = false;
  selectedFiles: File[] = [];
  contasAdicionar : any[]=[];
  months: { monthNumber: number, monthName: string }[] = [
    { monthNumber: 1, monthName: "Janeiro" },
    { monthNumber: 2, monthName: "Fevereiro" },
    { monthNumber: 3, monthName: "Março" },
    { monthNumber: 4, monthName: "Abril" },
    { monthNumber: 5, monthName: "Maio" },
    { monthNumber: 6, monthName: "Junho" },
    { monthNumber: 7, monthName: "Julho" },
    { monthNumber: 8, monthName: "Agosto" },
    { monthNumber: 9, monthName: "Setembro" },
    { monthNumber: 10, monthName: "Outubro" },
    { monthNumber: 11, monthName: "Novembro" },
    { monthNumber: 12, monthName: "Dezembro" }
  ];
  
  years: string[] = ["2022", "2023","2024", "2025", "2026", "2027", "2028", "2029","2030" ];

  

  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private formBuilder: FormBuilder,
    private commonExepenseService: CommonExpenseService,

  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Os meses são indexados de 0 a 11, então somamos 1 para obter o mês atual
    const currentYear = currentDate.getFullYear().toString(); // Obter o ano atual como uma string
    this.myForm = this.formBuilder.group({
      building_id: [1, Validators.required], // Defina o prédio com id=1 como selecionado por padrão
      months: [currentMonth, Validators.required], // Defina o mês atual como selecionado por padrão
      years: [currentYear, Validators.required] // Defina o ano atual como selecionado por padrão
      // Adicione outros controles de formulário conforme necessário
    });
    this.loadExpenses();
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
  getAllCommonExpenses(): void {
    this.commonExepenseService.getAllCommonExpenses().subscribe(
      (expenses: CommonExpense[]) => {
        this.commonExepenses = expenses;
        console.log(this.commonExepenses)
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
  }
  toggleAddGastosView(): void {
    this.addGastosView = !this.addGastosView;
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
    this.contasAdicionar=[];
    // Iterar sobre os arquivos selecionados
    for (const selectedFile of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Callback executado quando o arquivo é lido com sucesso
        const fileContent = event.target?.result as string; // Conteúdo do arquivo como string
        // Agora você pode processar o conteúdo do arquivo CSV, por exemplo, dividindo-o por linhas e colunas
        const lines = fileContent.split('\n'); // Separar o conteúdo em linhas
        // Processar cada linha do arquivo CSV
        for (const line of lines) {
          // Dividir a linha em colunas usando ";"
          const columns = line.split(';');
          // Agora você pode trabalhar com os valores das colunas
          if(columns.length==4 && columns[0]!="Data Lançamento"){

            const objAux={
              data:columns[0],
              detalhe:columns[1],
              valor:parseFloat(columns[2]),
              adicionar:true
            }
            if(parseFloat(columns[2])<0){
              this.contasAdicionar.push(objAux)
            }

         }

        }
      };
      console.log(this.contasAdicionar)
      // Ler o arquivo como texto
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
    const buildingId = this.myForm.get('building_id')?.value;
    const month = this.myForm.get('months')?.value;
    const year = this.myForm.get('years')?.value;
  
    if (buildingId && month && year) {
      this.commonExepenseService.getExpensesByBuildingAndMonth(buildingId, month, year).subscribe(
        (expenses: CommonExpense[]) => {
          this.commonExepenses = expenses;
          console.log(this.commonExepenses);
        },
        (error) => {
          console.error('Error fetching expenses:', error);
          this.commonExepenses = [];
        }
      );
    }
  }
  
}
