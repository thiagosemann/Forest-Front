import { Component, OnInit } from '@angular/core';
import { Building } from '../shared/utilitarios/building';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { BuildingService } from '../shared/service/buildings_service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../shared/utilitarios/user';
import { UserService } from '../shared/service/user_service';
import { ApartamentoService } from '../shared/service/apartamento_service';
import { Apartamento } from '../shared/utilitarios/apartamento';

@Component({
  selector: 'app-gastos-individuais',
  templateUrl: './gastos-individuais.component.html',
  styleUrls: ['./gastos-individuais.component.css']
})
export class GastosIndividuaisComponent implements OnInit {
  buildings: Building[] = [];
  myForm!: FormGroup;
  selectedBuildingId: number=0;
  users:User[]=[];
  apartamentos:Apartamento[]=[];
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
    private userService:UserService,
    private apartamentoService:ApartamentoService
  ) {}


  ngOnInit(): void {
    this.getAllBuildings();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Os meses são indexados de 0 a 11, então somamos 1 para obter o mês atual
    const currentYear = currentDate.getFullYear().toString(); // Obter o ano atual como uma string
    this.myForm = this.formBuilder.group({
      building_id: [0, Validators.required], // Defina o prédio com id=1 como selecionado por padrão
      months: [currentMonth, Validators.required], // Defina o mês atual como selecionado por padrão
      years: [currentYear, Validators.required] // Defina o ano atual como selecionado por padrão
      // Adicione outros controles de formulário conforme necessário
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


  selectBuilding(): void {
    this.selectedBuildingId = this.myForm.get('building_id')?.value;
    if (this.selectedBuildingId) {
      this.apartamentoService.getApartamentosByBuildingId(this.selectedBuildingId).subscribe({
        next:(apartamentos:Apartamento[])=>{
          console.log(apartamentos)
          this.apartamentos = apartamentos;
        },
        error:(error) =>{
          console.error('Error fetching users:', error);
        }
      })
    }else{
      this.users = [];
    }

  }
  
}
