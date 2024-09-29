import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provisao } from '../../utilitarios/provisao';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class ProvisaoService {
  private apiUrl = environment.backendUrl + '/provisoes';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllProvisoes(): Observable<Provisao[]> {
    return this.http.get<Provisao[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getProvisaoById(id: number): Observable<Provisao> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Provisao>(url, { headers: this.getHeaders() });
  }

  getProvisoesByBuildingId(id: number): Observable<Provisao[]> {
    const url = `${this.apiUrl}/predios/${id}`;
    return this.http.get<Provisao[]>(url, { headers: this.getHeaders() });
  }

  createProvisao(provisao: Provisao): Observable<Provisao> {
    return this.http.post<Provisao>(this.apiUrl, provisao, { headers: this.getHeaders() });
  }

  updateProvisao(provisao: Provisao): Observable<Provisao> {
    const url = `${this.apiUrl}/${provisao.id}`;
    return this.http.put<Provisao>(url, provisao, { headers: this.getHeaders() });
  }

  deleteProvisao(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
