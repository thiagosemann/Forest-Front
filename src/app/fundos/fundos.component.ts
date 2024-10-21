import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Building } from '../shared/utilitarios/building';
import { Fundo } from '../shared/utilitarios/fundo'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { FundoService } from '../shared/service/Banco_de_Dados/fundo_service'; 
import { SaldoFundoService } from '../shared/service/Banco_de_Dados/saldoFundos_service';
import { SaldoFundo } from '../shared/utilitarios/saldoFundo';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fundos',
  templateUrl: './fundos.component.html',
  styleUrls: ['./fundos.component.css']
})

export class FundosComponent {
  buildings: Building[] = [];
  fundos: Fundo[] = []; 
  myForm!: FormGroup;
  saldoFundo: SaldoFundo[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private buildingService: BuildingService,
    private fundoService: FundoService,
    private saldoFundoService: SaldoFundoService,
    private toastr: ToastrService

  ) {}

  ngOnInit(): void {
    this.getAllBuildings();
    this.myForm = this.formBuilder.group({
      building_id: [0, Validators.required],
      tipo_fundo: ['', Validators.required],
      porcentagem: [0, [Validators.required, Validators.min(0)]]
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
          // Initialize isEditable for each fundo
          this.fundos = fundos.map(fundo => ({
            ...fundo,
            isEditable: false // Adicione a propriedade isEditable
          }));
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
          this.toastr.success('Fundo cadastrado com sucesso!')
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
      if (fundo.id) {
        this.fundoService.deleteFundo(fundo.id).subscribe(
          () => {
            this.toastr.success('Fundo deletado com sucesso!')
            this.loadFundos(); // Reload the fundos after deletion
          },
          (error) => {
            console.error('Error deleting fundo:', error);
          }
        );
      }
    }
  }

  updateSaldo(fundo: Fundo): void {
    // Adicione a lógica para atualizar o saldo no backend, se necessário
    if (fundo && fundo.id != null && fundo.saldo != null) {
      let saldoFundo: SaldoFundo = {
        fundo_id: fundo.id, // Usando fundo_id para a atualização
        saldo: fundo.saldo
      };
      
      this.saldoFundoService.updateSaldoFundo(saldoFundo)
        .subscribe(
          () => {
            this.toastr.success("Saldo atualizado com sucesso!")
            fundo.isEditable = false;
          },
          error => {
            this.toastr.error('Erro ao atualizar saldo')
            console.error('Erro ao atualizar saldo:', error);
          }
        );
    } else {
      console.warn('Informações insuficientes para atualizar o saldo:', fundo);
    }
  }
  
}
