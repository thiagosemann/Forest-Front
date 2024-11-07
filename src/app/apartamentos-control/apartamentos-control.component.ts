import { Component } from '@angular/core';
import { Building } from '../shared/utilitarios/building';
import { Apartamento } from '../shared/utilitarios/apartamento';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { ApartamentoService } from '../shared/service/Banco_de_Dados/apartamento_service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-apartamentos-control',
  templateUrl: './apartamentos-control.component.html',
  styleUrls: ['./apartamentos-control.component.css']
})
export class ApartamentosControlComponent {
  showEditComponent = false;
  isEditing: boolean = false;  // Flag para indicar se está editando
  buildingId: number | null = null;
  buildings: Building[] = [];
  apartamentos: Apartamento[] = [];
  myGroup: FormGroup;
  registerForm: FormGroup;
  titleEditApartamento: string = "Editar apartamento";

  constructor(
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
      bloco: new FormControl('', { validators: [Validators.required] }),
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
      },
      error: (error) => {
        console.error('Erro ao buscar apartamentos:', error);
      }
    });
  }


  editApartamento(apartamento: Apartamento): void {
    this.showEditComponent = true;
    this.isEditing = true;
    this.titleEditApartamento = "Editar Apartamento"
    this.registerForm.patchValue({
      id: apartamento.id,
      nome: apartamento.nome,
      predio_id: apartamento.predio_id,
      bloco: apartamento.bloco,
      fracao: apartamento.fracao
    });
    
  }

  cancelarEdit(): void {
    this.showEditComponent = false;
    this.isEditing = false;
    this.registerForm.reset({
      id: "",
      nome: "",
      predio_id: "Selecione",
      bloco: "",
      fracao: ""
    });
    
  }

  deleteApartamento(apartamento: Apartamento): void {
    if (apartamento && apartamento.id) {
      if (confirm(`Você tem certeza que deseja excluir o apartamento: ${apartamento.nome}?`)) {
        this.apartamentoService.deleteApartamento(apartamento.id).subscribe(() => {
          this.toastr.success("Apartamento deletada com sucesso!")
          this.getAllApartamentosByBuildingId(this.buildingId!);
        });
      }
    }
    
  }

  addApartamento(): void {
    this.showEditComponent = true;
    this.isEditing = false;  // Estamos criando uma nova apartamento
    this.titleEditApartamento = "Criar Apartamento"
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
    const apartamento: Apartamento = this.registerForm.value;
    console.log(apartamento)
    if (this.isEditing) {
      this.apartamentoService.updateApartamento(apartamento).subscribe({
        next: () => {
          this.toastr.success('Apartamento atualizada com sucesso!');
          this.showEditComponent = false;
          this.getAllApartamentosByBuildingId(this.buildingId!);
        },
        error: (error) => {
          this.toastr.error('Erro ao atualizar a apartamento.');
          console.error('Erro ao atualizar a apartamento:', error);
        }
      });
    } else {
      this.apartamentoService.createApartamento(apartamento).subscribe({
        next: () => {
          this.toastr.success('Apartamento criada com sucesso!');
          this.showEditComponent = false;
          this.getAllApartamentosByBuildingId(this.buildingId!);
        },
        error: (error) => {
          this.toastr.error('Erro ao criar a apartamento.');
          console.error('Erro ao criar a apartamento:', error);
        }
      });
    }
  
  }

}
