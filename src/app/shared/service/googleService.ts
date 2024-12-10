import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class GoogleScriptService {
  private apiUrl = environment.backendUrl + '/enviar-imagem'; // Defina sua URL do backend aqui

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Função para enviar dados e imagem
  enviarImagem(cod_reserva: string, CPF: string, Nome: string, Telefone: string, imagemBase64: string): Observable<any> {
    const dados = {
      cod_reserva,
      CPF,
      Nome,
      Telefone,
      imagemBase64
    };

    console.log('Enviando dados para o backend:', dados);  // Log para checar os dados enviados

    return this.http.post(this.apiUrl, dados, { headers: this.getHeaders() });
  }
}

