import { Component } from '@angular/core';
import { Building } from '../shared/utilitarios/building';
import { Fundo } from '../shared/utilitarios/fundo'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FundoService } from '../shared/service/Banco_de_Dados/fundo_service'; 
import { SaldoFundoService } from '../shared/service/Banco_de_Dados/saldoFundos_service';
import { SaldoFundo } from '../shared/utilitarios/saldoFundo';
import { ToastrService } from 'ngx-toastr';
import { SelectionService } from '../shared/service/selectionService';

@Component({
  selector: 'app-fundos',
  templateUrl: './fundos.component.html',
  styleUrls: ['./fundos.component.css']
})

export class FundosComponent {
  fundos: Fundo[] = []; 
  myForm!: FormGroup;
  saldoFundo: SaldoFundo[] = [];
  selectedBuildingId:number=0;

  constructor(
    private formBuilder: FormBuilder,
    private fundoService: FundoService,
    private saldoFundoService: SaldoFundoService,
    private toastr: ToastrService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      tipo_fundo: ['', Validators.required],
      porcentagem: [0, [Validators.required, Validators.min(0)]]
    });

    this.selectionService.selecao$.subscribe(selecao => {
      this.selectedBuildingId = selecao.predioID;
      this.loadFundos();
    });
  }


  loadFundos(): void {
    const buildingId = this.selectedBuildingId;
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
    }else{
      this.toastr.warning("Selecione um prédio!")

    }
  }


  cadastrarFundo(): void {
    if (this.myForm.valid) {
      const novoFundo: Fundo = {
        tipo_fundo: this.myForm.get('tipo_fundo')?.value,
        predio_id: this.selectedBuildingId,
        porcentagem: this.myForm.get('porcentagem')?.value / 100 // Converte para decimal
      };
      console.log(novoFundo)
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
