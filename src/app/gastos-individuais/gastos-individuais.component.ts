import { Component, OnInit } from '@angular/core';
import { Building } from '../shared/utilitarios/building';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { BuildingService } from '../shared/service/buildings_service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../shared/utilitarios/user';
import { UserService } from '../shared/service/user_service';
import { ApartamentoService } from '../shared/service/apartamento_service';
import { Apartamento } from '../shared/utilitarios/apartamento';
import { ExcelService } from '../shared/service/excelService';
import * as XLSX from 'xlsx';
import { GastoIndividual } from '../shared/utilitarios/gastoIndividual';
import { GastosIndividuaisService } from '../shared/service/gastosIndividuais_service';

@Component({
  selector: 'app-gastos-individuais',
  templateUrl: './gastos-individuais.component.html',
  styleUrls: ['./gastos-individuais.component.css']
})
export class GastosIndividuaisComponent implements OnInit {
  buildings: Building[] = [];
  myForm!: FormGroup;
  selectedBuildingId: number = 0;
  users: User[] = [];
  apartamentos: Apartamento[] = [];
  dataModel: any[] = [];
  gastosIndividuais:GastoIndividual[]=[];
  saveData:boolean =false;
  months: { monthNumber: number; monthName: string }[] = [
    { monthNumber: 1, monthName: 'Janeiro' },
    { monthNumber: 2, monthName: 'Fevereiro' },
    { monthNumber: 3, monthName: 'Março' },
    { monthNumber: 4, monthName: 'Abril' },
    { monthNumber: 5, monthName: 'Maio' },
    { monthNumber: 6, monthName: 'Junho' },
    { monthNumber: 7, monthName: 'Julho' },
    { monthNumber: 8, monthName: 'Agosto' },
    { monthNumber: 9, monthName: 'Setembro' },
    { monthNumber: 10, monthName: 'Outubro' },
    { monthNumber: 11, monthName: 'Novembro' },
    { monthNumber: 12, monthName: 'Dezembro' }
  ];
  years: string[] = ['2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  uploading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private apartamentoService: ApartamentoService,
    private excelService: ExcelService,
    private gastosIndividuaisService: GastosIndividuaisService
  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear().toString();
    this.myForm = this.formBuilder.group({
      building_id: [0, Validators.required],
      months: [currentMonth, Validators.required],
      years: [currentYear, Validators.required]
    });
  }

  getAllBuildings(): void {
    this.buildingService.getAllBuildings().subscribe({
      next: (buildings: Building[]) => {
        console.log(buildings);
        this.buildings = buildings;
      },
      error: (error) => {
        console.error('Error fetching buildings:', error);
      }
    });
  }

  loadExpenses(): void {
    const buildingId = this.myForm.get('building_id')?.value;
    const month = this.myForm.get('months')?.value;
    const year = this.myForm.get('years')?.value;
    this.gastosIndividuais = [];
    if (buildingId && month && year) {
      this.gastosIndividuaisService.getIndividualExpensesByAptMonthAndYear(buildingId, month, year).subscribe(
        (gastosIndividuais: GastoIndividual[]) => {
          console.log(gastosIndividuais)
          this.gastosIndividuais = gastosIndividuais;
        },
        (error) => {
          console.error('Error fetching expenses:', error);
       
        }
      );
    } else {
      this.users = [];
    }
  }

  downloadModel(): void {
    this.dataModel = [];
    this.apartamentos.forEach((apartamento) => {
      this.dataModel.push({ Apartamento: apartamento.nome });
    });
    this.excelService.exportToExcel(this.dataModel, 'modelo');
  }

handleFileInput(event: any): void {
    // Começar a girar o spinner
    this.uploading = true;
    this.saveData = true;
    this.gastosIndividuais=[];
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
   
        if (apartamento) {
          let apartamentoAux : GastoIndividual = {
            apt_id: apartamento.id,
            apt_name: apartamento.nome,
            apt_fracao: apartamento.fracao,
            aguaM3: row[1],
            aguaValor: 0,              
            gasM3: row[2],
            gasValor: 0,
            lazer: row[3],
            lavanderia: row[4],
            multa: row[5]
          }
          this.gastosIndividuais.push(apartamentoAux)
        }
      })
  
      console.log('Conteúdo do arquivo:', this.gastosIndividuais);
  
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
  saveGastosIndividuais():void{
    //this.saveData = false;
    console.log(this.gastosIndividuais)
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



  
}
