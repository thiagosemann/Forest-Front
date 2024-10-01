import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fundo } from '../../utilitarios/fundo';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class FundoService {
  private apiUrl = environment.backendUrl + '/fundos';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllFundos(): Observable<Fundo[]> {
    return this.http.get<Fundo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getFundoById(id: number): Observable<Fundo> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Fundo>(url, { headers: this.getHeaders() });
  }

  getFundosByBuildingId(id: number): Observable<Fundo[]> {
    const url = `${this.apiUrl}/predios/${id}`;
    return this.http.get<Fundo[]>(url, { headers: this.getHeaders() });
  }

  createFundo(fundo: Fundo): Observable<Fundo> {
    return this.http.post<Fundo>(this.apiUrl, fundo, { headers: this.getHeaders() });
  }

  updateFundo(fundo: Fundo): Observable<Fundo> {
    const url = `${this.apiUrl}/${fundo.id}`;
    return this.http.put<Fundo>(url, fundo, { headers: this.getHeaders() });
  }

  deleteFundo(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
