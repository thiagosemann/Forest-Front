import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaldoFundo } from '../../utilitarios/saldoFundo'; // Supondo que haja um modelo SaldoFundo
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class SaldoFundoService {
  private apiUrl = environment.backendUrl + '/saldofundos'; // Ajuste conforme a rota da API

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllSaldoFundos(): Observable<SaldoFundo[]> {
    return this.http.get<SaldoFundo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getSaldoFundoById(id: number): Observable<SaldoFundo> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SaldoFundo>(url, { headers: this.getHeaders() });
  }

  createSaldoFundo(saldoFundo: SaldoFundo): Observable<SaldoFundo> {
    return this.http.post<SaldoFundo>(this.apiUrl, saldoFundo, { headers: this.getHeaders() });
  }

  updateSaldoFundo(saldoFundo: SaldoFundo): Observable<SaldoFundo> {
    const url = `${this.apiUrl}/${saldoFundo.id}`;
    return this.http.put<SaldoFundo>(url, saldoFundo, { headers: this.getHeaders() });
  }

  deleteSaldoFundo(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

  getSaldoFundosByBuildingId(predioId: number): Observable<SaldoFundo[]> {
    const url = `${this.apiUrl}/predios/${predioId}`;
    return this.http.get<SaldoFundo[]>(url, { headers: this.getHeaders() });
  }
}
