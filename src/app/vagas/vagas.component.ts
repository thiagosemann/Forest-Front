import { Component, OnInit } from '@angular/core';
import { VagaService } from '../shared/service/Banco_de_Dados/vagas_service';
import { Vaga } from '../shared/utilitarios/vaga';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { Building } from '../shared/utilitarios/building';
import { Apartamento } from '../shared/utilitarios/apartamento';
import { ApartamentoService } from '../shared/service/Banco_de_Dados/apartamento_service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'app-vagas',
  templateUrl: './vagas.component.html',
  styleUrls: ['./vagas.component.css']
})
export class VagasComponent implements OnInit {
  vagas: Vaga[] = [];
  showEditComponent = false;
  buildingId: number | null = null;
  buildings: Building[] = [];
  apartamentos: Apartamento[] = [];
  myGroup: FormGroup; // Add a FormGroup property
  registerForm: FormGroup; // FormGroup for the registration/editing of vaga

  constructor(private vagaService: VagaService,
              private buildingService: BuildingService,
              private apartamentoService: ApartamentoService,
              private toastr: ToastrService,
              private formBuilder: FormBuilder


            ) {
              this.myGroup = new FormGroup({
                building_id: new FormControl(''), // Create a form control for 'building_id'
              });
              this.registerForm = this.formBuilder.group({
                id: new FormControl(''), // Optional ID for editing
                nome: new FormControl('', { validators: [Validators.required] }),
                predio_id: new FormControl('', { validators: [Validators.required] }),
                apartamento_id: new FormControl('', { validators: [Validators.required] }),
                fracao: new FormControl('', { validators: [Validators.required] })
              });
            }

  ngOnInit(): void {
    this.getAllBuildings();
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

  onBuildingSelect(event: any): void {
    this.buildingId = event.target.value;
    if(this.buildingId){
      this.getAllApartamentosByBuildingId(this.buildingId);
    }
  }

  getVagasByBuildingId(buildingId: number): void {
    this.vagaService.getVagasByBuildingId(buildingId).subscribe({
      next: (vagas: Vaga[]) => {
        this.vagas = vagas;
        if(vagas.length ==0){
          this.toastr.error("Prédio sem vagas cadastradas!")
        }
      },
      error: (error) => {
        console.error('Error fetching buildings:', error);
      }
    });
  }

  editVaga(vaga: Vaga): void {
    this.showEditComponent = true;
    this.registerForm.patchValue({
      id: vaga.id,
      nome: vaga.nome,
      predio_id: vaga.predio_id,
      apartamento_id: vaga.apartamento_id,
      fracao: vaga.fracao
    });
  }

  cancelarEdit(): void {
    this.showEditComponent = false;
    // Lógica para editar a vaga
  }

  deleteVaga(vaga: Vaga): void {
    if(vaga && vaga.id){
      if (confirm(`Você tem certeza que deseja excluir a vaga ${vaga.nome}?`)) {
        this.vagaService.deleteVaga(vaga.id).subscribe(() => {
          this.getVagasByBuildingId(this.buildingId!);
        });
      }
    }
  }

  getAllApartamentosByBuildingId(buildingId:number): void {
    this.apartamentos=[];
    this.apartamentoService.getApartamentosByBuildingId(buildingId).subscribe({
      next: (apartamentos: Apartamento[]) => {
        console.log(apartamentos);
        if(apartamentos.length==0){
          this.toastr.error("Prédio sem apartamentos cadastrados!")
        }
        this.apartamentos = apartamentos;
        this.getVagasByBuildingId(buildingId);
      
      },
      error: (error) => {
        console.error('Error fetching buildings:', error);
      }
    });
  }

  getAptNameById(vaga: Vaga):string{
    let aptAux = this.apartamentos.find(apartamento=> apartamento.id == vaga.apartamento_id);
    if(aptAux){
      return aptAux.nome
    }else{
      return ""
    }

  }

  onSubmit():void{

  }

}
