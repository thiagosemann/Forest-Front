import { Component, OnInit } from '@angular/core';
import { VagaService } from '../../shared/service/Banco_de_Dados/vagas_service';
import { BuildingService } from '../../shared/service/Banco_de_Dados/buildings_service';
import { Building } from '../../shared/utilitarios/building';
import { Apartamento } from '../../shared/utilitarios/apartamento';
import { ApartamentoService } from '../../shared/service/Banco_de_Dados/apartamento_service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Vaga } from '../../shared/utilitarios/vaga';

@Component({
  selector: 'app-vagas',
  templateUrl: './vagas.component.html',
  styleUrls: ['./vagas.component.css']
})
export class VagasComponent implements OnInit {
  vagas: Vaga[] = [];
  showEditComponent = false;
  isEditing: boolean = false;  // Flag para indicar se está editando
  buildingId: number | null = null;
  buildings: Building[] = [];
  apartamentos: Apartamento[] = [];
  myGroup: FormGroup;
  registerForm: FormGroup;
  titleEditVaga: string = "Editar vaga";

  constructor(
    private vagaService: VagaService,
    private buildingService: BuildingService,
    private apartamentoService: ApartamentoService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''),
    });

    this.registerForm = this.formBuilder.group({
      id: new FormControl(''), // ID opcional para edição
      nome: new FormControl('', { validators: [Validators.required] }),
      predio_id: new FormControl('Selecione', { validators: [Validators.required] }),
      apartamento_id: new FormControl('Selecione', { validators: [Validators.required] }),
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
        console.error('Erro ao buscar prédios:', error);
      }
    );
  }

  onBuildingSelect(event: any): void {
    this.buildingId = event.target.value;
    if (this.buildingId) {
      this.getAllApartamentosByBuildingId(this.buildingId);
    }
  }

  getAllApartamentosByBuildingId(buildingId: number): void {
    this.apartamentoService.getApartamentosByBuildingId(buildingId).subscribe({
      next: (apartamentos: Apartamento[]) => {
        if (apartamentos.length == 0) {
          this.toastr.error("Prédio sem apartamentos cadastrados!");
        }
        this.apartamentos = apartamentos;
        this.getVagasByBuildingId(buildingId);
      },
      error: (error) => {
        console.error('Erro ao buscar apartamentos:', error);
      }
    });
  }

  getVagasByBuildingId(buildingId: number): void {
    this.vagaService.getVagasByBuildingId(buildingId).subscribe({
      next: (vagas: Vaga[]) => {
        this.vagas = vagas;
        if (vagas.length == 0) {
          this.toastr.error("Prédio sem vagas cadastradas!");
        }
      },
      error: (error) => {
        console.error('Erro ao buscar vagas:', error);
      }
    });
  }

  editVaga(vaga: Vaga): void {
    this.showEditComponent = true;
    this.isEditing = true;
    this.titleEditVaga = "Editar Vaga"
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
    this.isEditing = false;
    this.registerForm.reset({
      id: "",
      nome: "",
      predio_id: "Selecione",
      apartamento_id: "Selecione",
      fracao: ""
    });
  }

  deleteVaga(vaga: Vaga): void {
    if (vaga && vaga.id) {
      if (confirm(`Você tem certeza que deseja excluir a vaga ${vaga.nome}?`)) {
        this.vagaService.deleteVaga(vaga.id).subscribe(() => {
          this.toastr.success("Vaga deletada com sucesso!")
          this.getVagasByBuildingId(this.buildingId!);
        });
      }
    }
  }

  addVaga(): void {
    this.showEditComponent = true;
    this.isEditing = false;  // Estamos criando uma nova vaga
    this.titleEditVaga = "Criar Vaga"
    this.registerForm.reset({  // Resetar o formulário para valores padrão
      id: "",
      nome: "",
      predio_id: "Selecione",
      apartamento_id: "Selecione",
      fracao: ""
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const vaga: Vaga = this.registerForm.value;
    console.log(vaga)
    if (this.isEditing) {
      this.vagaService.updateVaga(vaga).subscribe({
        next: () => {
          this.toastr.success('Vaga atualizada com sucesso!');
          this.showEditComponent = false;
          this.getVagasByBuildingId(this.buildingId!);
        },
        error: (error) => {
          this.toastr.error('Erro ao atualizar a vaga.');
          console.error('Erro ao atualizar a vaga:', error);
        }
      });
    } else {
      this.vagaService.createVaga(vaga).subscribe({
        next: () => {
          this.toastr.success('Vaga criada com sucesso!');
          this.showEditComponent = false;
          this.getVagasByBuildingId(this.buildingId!);
        },
        error: (error) => {
          this.toastr.error('Erro ao criar a vaga.');
          console.error('Erro ao criar a vaga:', error);
        }
      });
    }
  }

  getAptNameById(vaga: Vaga): string {
    const aptAux = this.apartamentos.find(apartamento => apartamento.id == vaga.apartamento_id);
    return aptAux ? aptAux.nome : "";
  }
}
