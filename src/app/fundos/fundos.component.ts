import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Building } from '../shared/utilitarios/building';
import { Fundo } from '../shared/utilitarios/fundo'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { FundoService } from '../shared/service/Banco_de_Dados/fundo_service'; 

@Component({
  selector: 'app-fundos',
  templateUrl: './fundos.component.html',
  styleUrls: ['./fundos.component.css']
})

export class FundosComponent {
  buildings: Building[] = [];
  fundos: Fundo[] = []; 
  myForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private buildingService: BuildingService,
    private fundoService: FundoService 
  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    this.myForm = this.formBuilder.group({
      building_id: [0, Validators.required],
      tipo_fundo: ['', Validators.required],  // Add tipo_fundo control
      porcentagem: [0, [Validators.required, Validators.min(0)]]  // Add porcentagem control
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

  loadFundos(): void {
    const buildingId = this.myForm.get('building_id')?.value;
    if (buildingId && buildingId !== 0) {
      this.fundoService.getFundosByBuildingId(buildingId).subscribe(
        (fundos: Fundo[]) => {
          this.fundos = fundos;
        },
        (error) => {
          console.error('Error fetching fundos:', error);
        }
      );
    }
  }

  cadastrarFundo(): void {
    if (this.myForm.valid) {
      const novoFundo: Fundo = {
        tipo_fundo: this.myForm.get('tipo_fundo')?.value,
        predio_id: this.myForm.get('building_id')?.value,
        porcentagem: this.myForm.get('porcentagem')?.value / 100 // Converte para decimal
      };

      this.fundoService.createFundo(novoFundo).subscribe(
        (response) => {
          console.log('Fundo cadastrado com sucesso!', response);
          this.loadFundos(); // Reload the fundos after successful registration
          this.myForm.reset(); // Reset the form
        },
        (error) => {
          console.error('Error creating fundo:', error);
        }
      );
    }
  }
  deletarFundo(fundo: Fundo): void {
    if (confirm('Você tem certeza que deseja deletar este fundo?')) {
      if(fundo.id){
        this.fundoService.deleteFundo(fundo.id).subscribe(
          () => {
            console.log('Fundo deletado com sucesso!');
            this.loadFundos(); // Reload the fundos after deletion
          },
          (error) => {
            console.error('Error deleting fundo:', error);
          }
        );
      }

    }
  }
}
