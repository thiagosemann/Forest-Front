import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-fundos',
  templateUrl: './fundos.component.html',
  styleUrls: ['./fundos.component.css']
})

export class FundosComponent  {
  tipoDeFundo: string = "123";

  constructor(  private route: ActivatedRoute,
                private router: Router,

  ) {}

  ngOnInit(): void {
    
  // Capturando a parte da rota depois de /fundos
  this.route.url.subscribe(urlSegments => {
    const path = urlSegments.map(segment => segment.path).join('/');
    // Remove o prefixo 'fundos/' se existir
    const pathAfterFundos = path.replace(/^fundos\/?/, '');
    if(pathAfterFundos==="provisao"){
      this.tipoDeFundo = "Gerencia de Provisões"
    }else if(pathAfterFundos==="reserva"){
      this.tipoDeFundo = "Gerencia de Fundo de Reserva"
    }else if(pathAfterFundos==="obras"){
      this.tipoDeFundo = "Gerencia de Fundo de Obra"
    }
  });
  }




}
