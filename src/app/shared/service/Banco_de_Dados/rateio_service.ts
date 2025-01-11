import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { Rateio } from '../../utilitarios/rateio';

@Injectable({
  providedIn: 'root'
})
export class RateioService {
  private apiUrl = environment.backendUrl + '/rateios';

  constructor(private http: HttpClient) { }

  // Função para obter os headers com o token
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Função para obter todos os rateios
  getAllRateios(): Observable<Rateio[]> {
    return this.http.get<Rateio[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Função para obter um rateio específico por ID
  getRateioById(id: number): Observable<Rateio> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Rateio>(url, { headers: this.getHeaders() });
  }

  // Função para obter rateios de um prédio específico e de um mês específico
  getRateiosByBuildingIdAndMonthAndYear(predioId: number, mes: number, ano:number): Observable<Rateio[]> {
    const url = `${this.apiUrl}/predios/${predioId}/${mes}/${ano}`;
    return this.http.get<Rateio[]>(url, { headers: this.getHeaders() });
  }


  // Função para criar um novo rateio
  createRateio(rateio: Rateio): Observable<Rateio> {
    return this.http.post<Rateio>(this.apiUrl, rateio, { headers: this.getHeaders() });
  }

  // Função para atualizar um rateio existente
  updateRateio(rateio: Rateio): Observable<Rateio> {
    const url = `${this.apiUrl}/${rateio.id}`;
    return this.http.put<Rateio>(url, rateio, { headers: this.getHeaders() });
  }

  // Função para deletar um rateio pelo ID
  deleteRateio(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
