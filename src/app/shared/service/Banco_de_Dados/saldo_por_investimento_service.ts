import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { SaldoInvestimento } from '../../utilitarios/saldoInvestimento';

@Injectable({
  providedIn: 'root'
})
export class SaldoPorInvestimentoService {
  private apiUrl = environment.backendUrl + '/investimentos';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllInvestimentos(): Observable<SaldoInvestimento[]> {
    return this.http.get<SaldoInvestimento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getInvestimentoById(id: number): Observable<SaldoInvestimento> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SaldoInvestimento>(url, { headers: this.getHeaders() });
  }

  getInvestimentosByBuildingId(predioId: number): Observable<SaldoInvestimento[]> {
    const url = `${this.apiUrl}/predios/${predioId}`;
    return this.http.get<SaldoInvestimento[]>(url, { headers: this.getHeaders() });
  }

  createInvestimento(investimento: SaldoInvestimento): Observable<SaldoInvestimento> {
    return this.http.post<SaldoInvestimento>(this.apiUrl, investimento, { headers: this.getHeaders() });
  }

  updateInvestimento(investimento: SaldoInvestimento): Observable<SaldoInvestimento> {
    const url = `${this.apiUrl}/${investimento.id}`;
    return this.http.put<SaldoInvestimento>(url, investimento, { headers: this.getHeaders() });
  }

  deleteInvestimento(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
