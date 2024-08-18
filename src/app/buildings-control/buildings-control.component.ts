import { Component, OnInit, NgZone } from '@angular/core';
import { Building } from '../shared/utilitarios/building';
import { User } from '../shared/utilitarios/user';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';

@Component({
  selector: 'app-buildings-control',
  templateUrl: './buildings-control.component.html',
  styleUrls: ['./buildings-control.component.css']
})
export class BuildingsControlComponent implements OnInit {
  buildings: Building[] = [];
  users: User[] = [];
  showEditComponent: boolean = false;
  registerForm!: FormGroup;
  buildingEditing: Building | undefined;
  botaoForm:string = "Atualizar";

  constructor(
    private buildingService: BuildingService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.registerForm = this.formBuilder.group({
      nome: ['', Validators.required],
      CNPJ: ['', Validators.required],
      sindico: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      qnt_Apartamentos: ['', Validators.required],
      sindico_id: ['']
    });
  }

  ngOnInit(): void {
    this.getAllBuildings();
  }

  createNewBuilding(): void {
    this.showEditComponent = true;
    this.buildingEditing = undefined; // Resetar o prédio em edição
    this.registerForm.reset(); // Resetar o formulário
    this.botaoForm="Criar";
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

  editBuilding(building: Building): void {
    this.botaoForm="Atualizar";

    this.buildingEditing = building;
    this.registerForm.patchValue({
      nome: building.nome,
      CNPJ: building.CNPJ,
      sindico: building.sindico,
      email: building.email,
      qnt_Apartamentos: building.qnt_Apartamentos,
      sindico_id: building.sindico_id
    });
    this.showEditComponent = !this.showEditComponent;
  }

  cancelarEdit(): void {
    this.showEditComponent = !this.showEditComponent;
  }

  deleteBuilding(building: Building): void {
    const isConfirmed = window.confirm(`Você tem certeza de que deseja excluir o edifício ${building.nome}?`);
    if (isConfirmed) {
      this.buildingService.deleteBuilding(building.id).subscribe(
        () => {
          this.toastr.success('Edifício excluído com sucesso!');
          this.getAllBuildings(); // Atualiza a lista de edifícios após a exclusão
        },
        (error) => {
          console.error('Erro ao excluir edifício:', error);
          this.toastr.error('Erro ao excluir edifício. Por favor, tente novamente.');
        }
      );
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const buildingId = this.buildingEditing?.id;
      const buildingData = this.registerForm.value;
  
      if (this.buildingEditing) {
        // Atualizar prédio existente
        const updatedBuilding: Building = { id: buildingId, ...buildingData };
        this.buildingService.updateBuilding(updatedBuilding).subscribe(
          (updatedBuilding: Building) => {
            this.toastr.success('Edifício atualizado com sucesso!');
            this.getAllBuildings(); // Atualizar lista de prédios após atualização
            this.showEditComponent = false; // Ocultar componente de edição após atualização bem-sucedida
          },
          (error) => {
            console.error('Erro ao atualizar edifício:', error);
            this.toastr.error('Erro ao atualizar edifício. Por favor, tente novamente.');
          }
        );
      } else {
        // Criar novo prédio
        this.buildingService.createBuilding(buildingData).subscribe(
          (newBuilding: Building) => {
            this.toastr.success('Edifício criado com sucesso!');
            this.getAllBuildings(); // Atualizar lista de prédios após criação
            this.showEditComponent = false; // Ocultar componente de edição após criação bem-sucedida
          },
          (error) => {
            console.error('Erro ao criar edifício:', error);
            this.toastr.error('Erro ao criar edifício. Por favor, tente novamente.');
          }
        );
      }
    } else {
      // Tratar erros de validação do formulário
    }
  }
  
}
