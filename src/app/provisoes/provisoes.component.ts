import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Building } from '../shared/utilitarios/building';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';

@Component({
  selector: 'app-provisoes',
  templateUrl: './provisoes.component.html',
  styleUrls: ['./provisoes.component.css']
})
export class ProvisoesComponent implements OnInit {

  tipoDeFundo: string = "123";
  rotaAtual: string = '';
  myForm!: FormGroup; // Initialize myForm as a FormGroup
  buildings: Building[] = [];
  loading: boolean = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
              private buildingService: BuildingService

            ) {}

  ngOnInit(): void {
    this.getAllBuildings();

    // Capturando a parte da rota depois de /fundos
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(segment => segment.path).join('/');
      // Remove o prefixo 'fundos/' se existir
      const pathAfterFundos = path.replace(/^fundos\/?/, '');
      this.rotaAtual = pathAfterFundos;
      if(pathAfterFundos==="provisao"){
        this.tipoDeFundo = "Gerencia de Provisões"
      }else if(pathAfterFundos==="reserva"){
        this.tipoDeFundo = "Gerencia de Fundo de Reserva"
      }else if(pathAfterFundos==="obras"){
        this.tipoDeFundo = "Gerencia de Fundo de Obra"
      }
    });
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
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  }

  loadFundos():void{
    if(this.loading){
      return
    }
    this.loading = true;
  }

  loadingToFalse():void{
    this.loading = false;
  }


}