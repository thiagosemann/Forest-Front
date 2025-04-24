import { Component } from '@angular/core';
import { Building } from '../../shared/utilitarios/building';
import { Apartamento } from '../../shared/utilitarios/apartamento';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { BuildingService } from '../../shared/service/Banco_de_Dados/buildings_service';
import { ApartamentoService } from '../../shared/service/Banco_de_Dados/apartamento_service';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../../shared/service/excelService';
import * as XLSX from 'xlsx';
import { UsersApartamentosService } from 'src/app/shared/service/Banco_de_Dados/userApartamento_service';
import { UserService } from 'src/app/shared/service/Banco_de_Dados/user_service';
import { UserApartamento } from 'src/app/shared/utilitarios/userApartamento';

@Component({
  selector: 'app-apartamentos-control',
  templateUrl: './apartamentos-control.component.html',
  styleUrls: ['./apartamentos-control.component.css']
})
export class ApartamentosControlComponent {
  showEditComponent = false;
  showAddApartamentosLoteComponent = false;
  showApartamentosComponent = true;
  isEditing: boolean = false;  // Flag para indicar se está editando
  buildingId: number | null = null;
  buildings: Building[] = [];
  apartamentos: Apartamento[] = [];
  myGroup: FormGroup;
  registerForm: FormGroup;
  titleEditApartamento: string = "Editar apartamento";
  loading: boolean = false;
  saveData:boolean =false;
  uploading: boolean = false;
  apartamentosInsert: Apartamento[] = [];
  apartmentUsers: any[] = [];
  allUsers: any[] = [];
  selectedUserId: number | null = null;
  currentApartmentId: number | null = null;
  showModal:boolean = false;
  constructor(
    private buildingService: BuildingService,
    private apartamentoService: ApartamentoService,
    private userApartamentoService: UsersApartamentosService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private userService: UserService

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
    this.manageScreens("apartamentos")
    this.buildingId = event.target.value;
    if (this.buildingId) {
      this.getAllApartamentosByBuildingId(this.buildingId);
      this.loadUserByBuilidngId(); // Carrega todos os usuários disponíveis

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
    this.isEditing = true;
    this.showModal = true;
    this.titleEditApartamento = "Editar Apartamento"
    this.currentApartmentId = apartamento.id ?? null;
    if (apartamento.id !== undefined) {
      this.loadApartmentUsers(apartamento.id);
    }
    this.registerForm.patchValue({
      id: apartamento.id,
      nome: apartamento.nome,
      predio_id: apartamento.predio_id,
      bloco: apartamento.bloco,
      fracao: apartamento.fracao
    });
    
  }
  private loadApartmentUsers(apartmentId: number): void {
    this.userApartamentoService.getUsersByApartamentoId(apartmentId).subscribe({
      next: (users) => {
        this.apartmentUsers = users;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
      }
    });
  }
  loadUserByBuilidngId(): void {
    
    this.userService.getUsersByBuilding(this.buildingId!).subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
      }
    });
  }
  addUserToApartment(): void {
    if (this.currentApartmentId && this.selectedUserId) {
      let userApartamento:UserApartamento = {
        user_id: this.selectedUserId,
        apartamento_id: this.currentApartmentId
      }
      this.userApartamentoService.createUserApartamento(userApartamento)
        .subscribe({
          next: () => {
            this.loadApartmentUsers(this.currentApartmentId!);
            this.selectedUserId = null;
            this.toastr.success('Usuário vinculado com sucesso');
          },
          error: (error) => {
            console.error('Erro ao vincular usuário:', error);
            this.toastr.error(error.error?.message || 'Erro ao vincular usuário');
          }
        });
    }
  }
  
  removeUserFromApartment(userId: number): void {
    if (this.currentApartmentId && userId) {

      this.userApartamentoService.deleteUserApartamento(userId, this.currentApartmentId)
        .subscribe({
          next: () => {
            this.loadApartmentUsers(this.currentApartmentId!);
            this.toastr.success('Usuário removido com sucesso');
          },
          error: (error) => {
            console.error('Erro ao remover usuário:', error);
            this.toastr.error(error.error?.message || 'Erro ao remover usuário');
          }
        });
    }
  }
  

  cancelarEdit(): void {
    this.manageScreens('apartamentos')
    this.isEditing = false;
    this.showModal = false;
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
          this.toastr.success("Apartamento deletado com sucesso!")
          this.getAllApartamentosByBuildingId(this.buildingId!);
        });
      }
    }
  }

  addApartamento(): void {
   
    this.isEditing = false;  // Estamos criando uma nova apartamento
    this.showModal = true;
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
          this.isEditing = false;
          this.showModal = false;
        },
        error: (error) => {
          this.toastr.error('Erro ao atualizar a apartamento.');
          console.error('Erro ao atualizar a apartamento:', error);
          this.isEditing = false;
          this.showModal = false;

        }
      });
    } else {
      this.apartamentoService.createApartamento(apartamento).subscribe({
        next: () => {
          this.toastr.success('Apartamento criada com sucesso!');
          this.showEditComponent = false;
          this.getAllApartamentosByBuildingId(this.buildingId!);
          this.showModal = false;

        },
        error: (error) => {
          this.toastr.error('Erro ao criar a apartamento.');
          console.error('Erro ao criar a apartamento:', error);
          this.showModal = false;

        }
      });
    }
  
  }

  manageScreens(type:String):void{
  if(type=="apartamentos"){
      this.showEditComponent = false;
      this.showAddApartamentosLoteComponent = false;
      this.showApartamentosComponent = true;
    }else if(type=="apartamentosLote"){
      this.showEditComponent = false;
      this.showAddApartamentosLoteComponent = true;
      this.showApartamentosComponent = false;
    }
  }

  addApartamentoEmLote(): void {
    this.manageScreens('apartamentosLote')

  }

  saveApartamentosInBatch(): void {
    // Verifica se há usuários a serem inseridos
    if (this.apartamentosInsert.length > 0) {
      // Inicia a chamada para o serviço que salvará os usuários em lote
      this.apartamentoService.saveApartamentosInBatch(this.apartamentosInsert).subscribe(
        (response) => {
          // Sucesso na inserção em lote
          this.getAllApartamentosByBuildingId(this.buildingId!)
          this.toastr.success('Apartamentos salvos com sucesso!');
          this.apartamentosInsert = []; // Limpa a lista após o sucesso
          this.manageScreens('apartamentos');
          this.saveData = false; // Oculta o botão de salvar
        },
        (error) => {
          // Lida com o erro
          console.error('Erro ao salvar usuários em lote:', error);
          this.toastr.error('Erro ao salvar os usuários.');
        }
      );
    } else {
      this.toastr.error('Nenhum usuário para salvar.');
    }
  }
  
  cancelUsersInBatch():void{
    this.saveData = false;

  }
  handleFileInput(event: any): void {
    // Começar a girar o spinner
    this.loading = true
    this.saveData = true;
    this.apartamentosInsert = [];
  
    // Obter o arquivo do evento
    const file: File = event.target.files[0];
  
    // Verificar se o arquivo é válido (excel)
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const reader = new FileReader();
  
      // Definir o comportamento quando o arquivo for lido
      reader.onload = (e: any) => {
        const binaryString = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
  
        // Obter a primeira planilha (Assumindo que o arquivo tem apenas uma planilha)
        const worksheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
  
        // Converter a planilha em JSON
        const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
        // Remover o cabeçalho e iterar sobre as linhas para armazenar os dados
        const headers = data[0]; // Cabeçalho da planilha
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const apartamento: Apartamento = {
            nome: row[1], // Primeiro nome
            bloco: row[2], // Sobrenome
            fracao: row[3], // E-mail
            predio_id: Number(this.buildingId),
          };
          this.apartamentosInsert.push(apartamento);
        }
  
        // Finalizar a operação
        this.loading = false;
  
        // Exibir mensagem de sucesso ou erro (opcional)
        if (this.apartamentosInsert.length > 0) {
          this.toastr.success(`${this.apartamentosInsert.length} usuários carregados com sucesso.`);
        } else {
          this.toastr.error('Nenhum usuário encontrado no arquivo.');
        }
      };
  
      // Ler o arquivo como uma string binária
      reader.readAsBinaryString(file);
    } else {
      this.uploading = false;
      this.saveData = false;
      this.toastr.error('Por favor, envie um arquivo Excel válido.');
    }
  }

  downloadModel(): void {
    console.log(this.buildings);
    
    if (this.buildingId) {
        const building = this.buildings.find(building => building.id === Number(this.buildingId));
        
        if (building) {
            this.excelService.downloadModelApartamentosLote(building);
        } else {
            console.error("Prédio não encontrado para o ID fornecido:", this.buildingId);
        }
    } else {
        console.warn("Nenhum prédio selecionado.");
    }
}

}
