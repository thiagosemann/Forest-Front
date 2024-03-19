import { Component, OnInit, NgZone } from '@angular/core';
import { BuildingService } from '../shared/service/buildings_service';
import { Building } from '../shared/utilitarios/building';
import { UserService } from '../shared/service/user_service';
import { User } from '../shared/utilitarios/user';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private buildingService: BuildingService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private ngZone: NgZone
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

    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const buildingId = this.buildingEditing?.id;
      const updatedBuilding: Building = { id: buildingId, ...this.registerForm.value };


    } else {
      // Handle form validation errors
    }
  }
}
