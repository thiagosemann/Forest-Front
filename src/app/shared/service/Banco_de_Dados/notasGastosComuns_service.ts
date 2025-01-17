import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { NotaGastoComum } from '../../utilitarios/notasGastosComuns';

@Injectable({
  providedIn: 'root'
})
export class NotaGastoComumService {
  private apiUrl = environment.backendUrl + '/notasGastoComuns';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllNotaGastoComum(): Observable<NotaGastoComum[]> {
    return this.http.get<NotaGastoComum[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getNotaGastoComumById(id: number): Observable<NotaGastoComum> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<NotaGastoComum>(url, { headers: this.getHeaders() });
  }

  getNotaGastoComumByCommonExpenseId(commonExpenseId: number): Observable<NotaGastoComum[]> {
    const url = `${this.apiUrl}/common-expense/${commonExpenseId}`;
    return this.http.get<NotaGastoComum[]>(url, { headers: this.getHeaders() });
  }

  createNotaGastoComum(document: NotaGastoComum): Observable<NotaGastoComum> {
    return this.http.post<any>(this.apiUrl, document, { headers: this.getHeaders() });
  }

  updateNotaGastoComum(document: NotaGastoComum): Observable<NotaGastoComum> {
    const url = `${this.apiUrl}/${document.id}`;
    return this.http.put<NotaGastoComum>(url, document, { headers: this.getHeaders() });
  }

  deleteNotaGastoComum(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

  getNotasByBuildingAndMonth(predio_id: number, month: number, year: number): Observable<NotaGastoComum[]> {
    const url = `${this.apiUrl}/building/${predio_id}/month/${month}/year/${year}`;
    return this.http.get<NotaGastoComum[]>(url, { headers: this.getHeaders() });
  }
}
