import { Component, OnInit } from '@angular/core';
import { VagaService } from '../shared/service/Banco_de_Dados/vagas_service';
import { Vaga } from '../shared/utilitarios/vaga';

@Component({
  selector: 'app-vagas',
  templateUrl: './vagas.component.html',
  styleUrls: ['./vagas.component.css']
})
export class VagasComponent implements OnInit {
  vagas: Vaga[] = [];
  showEditComponent = false;
  buildingId: number | null = null;

  constructor(private vagaService: VagaService) {}

  ngOnInit(): void {
    this.getAllVagas();
  }

  getAllVagas(): void {
    this.vagaService.getAllVagas().subscribe((vagas) => {
      this.vagas = vagas;
    });
  }

  onBuildingSelect(event: any): void {
    this.buildingId = event.target.value;
    if(this.buildingId){
      this.getVagasByBuildingId(this.buildingId);
    }
  }

  getVagasByBuildingId(buildingId: number): void {
    this.vagaService.getVagasByBuildingId(buildingId).subscribe((vagas) => {
      this.vagas = vagas;
    });
  }

  editVaga(vaga: Vaga): void {
    this.showEditComponent = true;
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
}
