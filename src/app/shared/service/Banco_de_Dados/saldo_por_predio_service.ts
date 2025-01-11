import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { SaldoPredio } from '../../utilitarios/saldoPredio';

@Injectable({
  providedIn: 'root'
})
export class SaldoPorPredioService {
  private apiUrl = environment.backendUrl + '/saldos';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllSaldos(): Observable<SaldoPredio[]> {
    return this.http.get<SaldoPredio[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getSaldoById(id: number): Observable<SaldoPredio> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SaldoPredio>(url, { headers: this.getHeaders() });
  }

  getSaldosByBuildingId(predioId: number): Observable<SaldoPredio[]> {
    const url = `${this.apiUrl}/predios/${predioId}`;
    return this.http.get<SaldoPredio[]>(url, { headers: this.getHeaders() });
  }

  createSaldo(saldo: SaldoPredio): Observable<SaldoPredio> {
    return this.http.post<SaldoPredio>(this.apiUrl, saldo, { headers: this.getHeaders() });
  }

  updateSaldo(saldo: SaldoPredio): Observable<SaldoPredio> {
    const url = `${this.apiUrl}/${saldo.id}`;
    return this.http.put<SaldoPredio>(url, saldo, { headers: this.getHeaders() });
  }

  deleteSaldo(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
