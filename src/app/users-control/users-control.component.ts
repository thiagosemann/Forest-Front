import { Component, OnInit, NgZone,Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { UserService } from 'src/app/shared/service/user_service';
import { User } from 'src/app/shared/utilitarios/user';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Building } from '../shared/utilitarios/building';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';

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

  constructor(
    private userService: UserService,
    private authService: AuthenticationService,
    private ngZone: NgZone, // Adicione o NgZone
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private buildingService: BuildingService

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

  createNewUser():void{
    this.showEditComponent = true;
    this.userEditing = undefined; // Resetar o prédio em edição
    this.registerForm.reset(); // Resetar o formulário
    this.botaoForm="Criar";
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

  editUser(userAux: User): void {
    this.botaoForm="Atualizar";
    console.log(userAux)
    this.userEditing = userAux;
    this.registerForm.patchValue({
      first_name: this.userEditing.first_name,
      last_name: this.userEditing.last_name,
      cpf: this.userEditing.cpf,
      email: this.userEditing.email,
      role: this.userEditing.role // Preencha o campo 'role' com o valor do usuário
    });
    this.showEditComponent = !this.showEditComponent;

  }
  cancelarEdit(): void {
    this.showEditComponent = !this.showEditComponent;
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
    onSubmit(): void {
        if (this.registerForm.valid) {
          if (this.userEditing) {
              const { id } = this.userEditing;
              const updatedUser = { id, ...this.registerForm.value};
      
              this.userService.updateUser(updatedUser).subscribe(
                  (response) => {
                      // Encontrar o índice do usuário no array
                      const index = this.users.findIndex(user => user.id === updatedUser.id);
                      if (index !== -1) {
                          // Substituir o usuário atualizado pelo antigo no array
                          this.users[index] = updatedUser;
                      }
      
                      // Lógica após a atualização bem-sucedida (por exemplo, exibir uma mensagem de sucesso)
                      let event ={
                          target:{
                              value:this.userEditing!.building_id
                          }
                      }
                      this.toastr.success(response.message);
                      this.showEditComponent = false; // Feche o componente de edição após a atualização
                  },
                  (error) => {
                      console.error('Erro ao atualizar o usuário:', error);
                      // Lógica para lidar com erros (por exemplo, exibir uma mensagem de erro)
                      this.toastr.error('Erro ao atualizar o usuário');
                  }
              );
          }else{
            // Criar novo prédio
            const data = this.registerForm.value;
            data.predio_id =  this.buildingId;
            data.password =  "12345678";
            
            this.userService.addUser(data).subscribe(
              (newUser: Building) => {
                this.toastr.success('Usuário criado com sucesso!');
                this.showEditComponent = false; // Ocultar componente de edição após criação bem-sucedida
              },
              (error) => {
                console.error('Erro ao criar edifício:', error);
                this.toastr.error(error.error.error);
              }
            );
          } 
      } else {
          for (const controlName in this.registerForm.controls) {
              const control = this.registerForm.get(controlName);
              if (control && control.invalid) {
                  this.toastr.error(this.errorMessages[controlName]);
              }
          }
      }
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
    
}