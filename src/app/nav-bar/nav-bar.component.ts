import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/service/Banco_de_Dados/authentication';
import { Router, ActivatedRoute  } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Building } from '../shared/utilitarios/building';
import { BuildingService } from '../shared/service/Banco_de_Dados/buildings_service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { SelectionService } from '../shared/service/selectionService';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  user: any = null;
  isMenuOpen = false;
  isDesktopView = true;
  buildings: Building[] = [];
  myForm!: FormGroup; 
  selecao: { predioID: number, month: number, year: number } = { predioID: 0, month: 0, year: 0 };
  years: string[] = ["2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
  months: { monthNumber: number, monthName: string }[] = [
    { monthNumber: 1, monthName: "Janeiro" },
    { monthNumber: 2, monthName: "Fevereiro" },
    { monthNumber: 3, monthName: "Março" },
    { monthNumber: 4, monthName: "Abril" },
    { monthNumber: 5, monthName: "Maio" },
    { monthNumber: 6, monthName: "Junho" },
    { monthNumber: 7, monthName: "Julho" },
    { monthNumber: 8, monthName: "Agosto" },
    { monthNumber: 9, monthName: "Setembro" },
    { monthNumber: 10, monthName: "Outubro" },
    { monthNumber: 11, monthName: "Novembro" },
    { monthNumber: 12, monthName: "Dezembro" }
  ];
  currentRoute: string = ''; // Variável para armazenar a rota atual

  constructor(private authService: AuthenticationService,
              private router: Router, 
              private toastr: ToastrService,
              private buildingService: BuildingService,
              private formBuilder: FormBuilder,
              private selectionService: SelectionService  
            ) {
    // Adicionamos o evento de redimensionamento (resize) para atualizar a exibição do menu quando a janela for redimensionada
    window.addEventListener('resize', () => this.checkViewport());
  }
  
 ngOnInit(): void {
    this.user = this.authService.getUser();
    this.checkViewport();
    this.getAllBuildings();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear().toString();
    this.myForm = this.formBuilder.group({
      building_id: [0, Validators.required],
      months: [currentMonth, Validators.required],
      years: [currentYear, Validators.required]
    });
      // Observar mudanças na rota
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url; // Atualizar a rota atual
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

  changeValues(): void {
    this.selecao = {
      predioID: Number(this.myForm.get('building_id')?.value),
      month: this.myForm.get('months')?.value,
      year: this.myForm.get('years')?.value
    };

    // Atualize os valores no serviço
    this.selectionService.setSelecao(this.selecao);
  }

  showSelects(): boolean {
    const hiddenRoutes = ["/provisao", "/fundos", "/users", "/vagas", "/predios", "/apartamentos"];
    return !hiddenRoutes.includes(this.currentRoute);
  }
  
  logout(): void {
    this.authService.logout();
    this.toastr.error('Deslogado.');
    this.router.navigate(['/login']);
  }
  gastosComuns(): void {
    this.router.navigate(['/gastosComuns']);
  }
  gastosIndividuais(): void {
    this.router.navigate(['/gastosIndividuais']);
  }
  content(): void {
    this.router.navigate(['/content']);
  }
  profile(): void {
    this.router.navigate(['/profile']);
  }
  admin(): void {
      this.router.navigate(['/admin']);
  }
  predios(): void {
    this.router.navigate(['/predios']);
  }
  vagas(): void {
    this.router.navigate(['/vagas']);
  }
  expenseType(): void {
    this.router.navigate(['/expenseType']);
  }
  apartamentos(): void {
    this.router.navigate(['/apartamentos']);
  }
  usuarios(): void {
    this.router.navigate(['/users']);
  }
  rateio(): void {
    this.router.navigate(['/rateio']);
  }
  fundos(): void {
    this.router.navigate(['/fundos']);
  }
  provisao(): void {
    this.router.navigate(['/provisao']);
  }
  
    
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  private checkViewport(): void {
    const width = window.innerWidth;
    this.isDesktopView = width > 990;

    if (this.isDesktopView) {
      this.isMenuOpen = false;
    }
  }
}
