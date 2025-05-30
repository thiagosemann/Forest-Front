import { Component, OnInit, NgZone,Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/shared/utilitarios/user';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Building } from '../../shared/utilitarios/building';
import { BuildingService } from '../../shared/service/Banco_de_Dados/buildings_service';
import { UserService } from '../../shared/service/Banco_de_Dados/user_service';
import { AuthenticationService } from '../../shared/service/Banco_de_Dados/authentication';
import { ExcelService } from '../../shared/service/excelService';
import * as XLSX from 'xlsx';

export const ConfirmValidator = (controlName: string, matchingControlName: string): ValidatorFn => {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    const input = control.get(controlName);
    const matchingInput = control.get(matchingControlName);

    return (input && matchingInput && input.value !== matchingInput.value) ? {'mismatch': true} : null;
  };
};

@Component({
  selector: 'app-user-control',
  templateUrl: './users-control.component.html',
  styleUrls: ['./users-control.component.css']
})
export class UsersControlComponent implements OnInit {
  users: User[] = [];
  myGroup: FormGroup; // Add a FormGroup property
  isEditing: boolean = false;
  user: any = null; // Use o tipo de dado adequado para o usuário
  showEditComponent:boolean = false;
  showCreateUserComponent:boolean = false;
  showUsuariosComponent:boolean = true;
  showAddUsuariosLoteComponent:boolean = false;
  telaEditaCriar:string="";
  registerForm!: FormGroup;
  userID: string = '';
  userEditing : User | undefined;
  buildings: Building[] = [];
  botaoForm:string = "Atualizar";
  buildingId:number| undefined=undefined;
  errorMessages: { [key: string]: string } = {
    first_name: 'Insira o primeiro nome',
    last_name: 'Insira o sobrenome',
    cpf: 'Insira o CPF',
    emailGroup: 'Verifique os e-mails digitados',
    passwordGroup: 'Verifique as senhas digitadas'
  };
  loading: boolean = false;
  usersInsert: User[] = [];
  saveData:boolean =false;
  uploading: boolean = false;
  showModal: boolean = false;
  modalTitle = '';



  constructor(
    private userService: UserService,
    private authService: AuthenticationService,
    private ngZone: NgZone, // Adicione o NgZone
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private buildingService: BuildingService,
    private excelService: ExcelService,

  ) {
    this.myGroup = new FormGroup({
      building_id: new FormControl(''), // Create a form control for 'building_id'
    });

  }

  ngOnInit(): void {
    this.getAllBuildings();

    this.registerForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [''] // Defina o campo 'role' no FormGroup
    });
    this.user = this.authService.getUser(); // use o método apropriado para obter as informações do usuário

  }

  manageScreens(type:String):void{
    if(type=="edit"){
      this.showEditComponent = true;
      this.showUsuariosComponent = false;
      this.showAddUsuariosLoteComponent = false;
      this.showCreateUserComponent = false;
    }else if(type=="usuarios"){
      this.showEditComponent = false;
      this.showUsuariosComponent = true;
      this.showAddUsuariosLoteComponent = false;
      this.showCreateUserComponent = false;
    }else if(type=="usuariosLote"){
      this.showEditComponent = false;
      this.showUsuariosComponent = false;
      this.showAddUsuariosLoteComponent = true;
      this.showCreateUserComponent = false;
    }else if(type=="addUsuario"){
      this.showEditComponent = false;
      this.showUsuariosComponent = false;
      this.showAddUsuariosLoteComponent = false;
      this.showCreateUserComponent = true;
    }
  }

  getAllBuildings():void{
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings; // Set the value inside the subscription
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    ); 
  }

  onBuildingSelect(event: any): void {
    this.buildingId = parseInt(event.target.value, 10);
    this.getUsersByBuilding();
  }

  getUsersByBuilding():void{
    if (this.buildingId) {
      this.userService.getUsersByBuilding(this.buildingId).subscribe(
        (users: User[]) => {
          if(users.length==0){
            this.toastr.info("Prédio sem usuários cadastrados!")
          }
          this.users = users;
        },
        (error) => {
          console.error('Error fetching users by building:', error);
        }
      );
    } else {
      this.users = [];
    }
  }

  createNewUser():void{
    this.manageScreens("addUsuario");
    this.userEditing = undefined; // Resetar o prédio em edição
    this.registerForm.reset(); // Resetar o formulário
    this.telaEditaCriar="Criar Usuário";
    this.botaoForm="Criar";
  }

  editUser(userAux: User): void {
    this.manageScreens("edit")
    this.botaoForm="Atualizar";
    this.telaEditaCriar = "Editar Usuário"
    this.userEditing = userAux;
    this.registerForm.patchValue({
      first_name: this.userEditing.first_name,
      last_name: this.userEditing.last_name,
      cpf: this.userEditing.cpf,
      email: this.userEditing.email,
      role: this.userEditing.role // Preencha o campo 'role' com o valor do usuário
    });
    this.manageScreens("edit")

  }
  cancelarEdit(): void {
    this.manageScreens("usuarios")
  }

  deleteUser(user: User): void {
    const isConfirmed = window.confirm(`Você tem certeza de que deseja EXCLUIR o usuário ${user.first_name} ${user.last_name}?`);
    if (isConfirmed) {
      this.ngZone.run(() => {
        this.userService.deleteUser(user.id).subscribe(
         () => {
            this.users = this.users.filter((u) => u.id !== user.id);
          },
          (error) => {
            console.error('Error deleting user:', error);
          }
        );  
      });
    }
  }
  
    resetPassword(user: User): void {
      const isConfirmed = window.confirm(`Você tem certeza de que deseja redefinir a senha do usuário ${user.first_name} ${user.last_name}?`);
      if (isConfirmed) {
        user.password = "12345678";
        this.userService.updateUser(user).subscribe(
          (response) => {
            this.toastr.success(response.message);
          },
          (error) => {
            console.error('Erro ao atualizar o usuário:', error);
            // Lógica para lidar com erros (por exemplo, exibir uma mensagem de erro)
            this.toastr.error('Erro ao atualizar o usuário');
          }
        );
      }
    }
    criarOuEditarUsuario(): void {
      if (this.registerForm.invalid) return;
      const formValue = this.registerForm.value;
  
      if (this.userEditing) {
        // Atualização
        const updatedUser = { id: this.userEditing.id, ...formValue, building_id: this.buildingId };
        this.userService.updateUser(updatedUser).subscribe(
          res => {
            const idx = this.users.findIndex(u => u.id === updatedUser.id);
            if (idx > -1) this.users[idx] = updatedUser;
            this.toastr.success(res.message);
            this.closeUserModal();
          }, err => this.toastr.error('Erro ao atualizar usuário')
        );
      } else {
        // Criação
        const newUser = { ...formValue, building_id: this.buildingId, password: '12345678' };
        this.userService.addUser(newUser).subscribe(
          res => {
            this.toastr.success('Usuário criado com sucesso!');
            this.getUsersByBuilding();
            this.closeUserModal();
          }, err => this.toastr.error('Erro ao criar usuário')
        );
      }
    }


    saveUsersInBatch(): void {
      this.saveData = false;
      
      // Verifica se há usuários a serem inseridos
      if (this.usersInsert.length > 0) {
        // Inicia a chamada para o serviço que salvará os usuários em lote
        this.userService.saveUsersInBatch(this.usersInsert).subscribe(
          (response) => {
            // Sucesso na inserção em lote
            this.getUsersByBuilding()
            this.toastr.success('Usuários salvos com sucesso!');
            this.usersInsert = []; // Limpa a lista após o sucesso
            this.manageScreens('usuarios');
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
      this.usersInsert = [];
      this.showUsuariosComponent = true;
      this.showAddUsuariosLoteComponent = false;
    }
    handleFileInput(event: any): void {
      // Começar a girar o spinner
      this.loading = true
      this.saveData = true;
      this.usersInsert = [];
    
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
            const user: any = {
              first_name: row[0], // Primeiro nome
              last_name: row[1], // Sobrenome
              cpf: row[2], // CPF
              email: row[3], // E-mail
              building_id: this.buildingId,
              role:'usuario'
            };
            this.usersInsert.push(user);
          }
    
          // Finalizar a operação
          this.loading = false;
    
          // Exibir mensagem de sucesso ou erro (opcional)
          if (this.usersInsert.length > 0) {
            this.toastr.success(`${this.usersInsert.length} usuários carregados com sucesso.`);
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
      this.excelService.downloadModelUsersLote();
    }

    formatDate(dateString: string | undefined): string {
      if (dateString) {
        const dateParts = dateString.split('T')[0].split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        return `${year}-${month}-${day}`;
      }
      return '';
    }

    formatarCPF(cpf: string): string {
      // Formatar o CPF como 000.000.000-00
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    validarCPF(cpf: string): boolean {
      cpf = cpf.replace(/[^\d]+/g, ''); // Remove todos os caracteres não numéricos
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // Verifica se o CPF tem 11 dígitos e se todos são iguais
    
      // Calcula o primeiro dígito verificador
      let add = 0;
      for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
      let rev = 11 - (add % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(cpf.charAt(9))) return false;
    
      // Calcula o segundo dígito verificador
      add = 0;
      for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
      rev = 11 - (add % 11);
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(cpf.charAt(10))) return false;
    
      return true; // Retorna verdadeiro se o CPF é válido
    }
    
    
    openUserModal(mode: 'create' | 'edit', user?: User) {
      this.registerForm.reset();
      if (mode === 'create') {
        this.modalTitle = 'Criar Usuário';
        this.botaoForm = 'Criar';
        this.userEditing = undefined;
      } else {
        this.modalTitle = 'Editar Usuário';
        this.botaoForm = 'Atualizar';
        this.userEditing = user;
        this.registerForm.patchValue({
          first_name: user!.first_name,
          last_name:  user!.last_name,
          cpf:        user!.cpf,
          email:      user!.email,
          role:       user!.role
        });
      }
      this.showModal = true;
    }
  
    closeUserModal() {
      this.showModal = false;
    }
}