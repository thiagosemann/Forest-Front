import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vaga } from '../../utilitarios/vaga';

@Injectable({
  providedIn: 'root'
})
export class VagaService {
  private apiUrl = 'http://localhost:80/vagas';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllVagas(): Observable<Vaga[]> {
    return this.http.get<Vaga[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getVagaById(id: number): Observable<Vaga> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Vaga>(url, { headers: this.getHeaders() });
  }

  getVagasByBuildingId(id: number): Observable<Vaga[]> {
    const url = `${this.apiUrl}/predios/${id}`;
    return this.http.get<Vaga[]>(url, { headers: this.getHeaders() });
  }

  getVagasByApartamentId(id: number): Observable<Vaga[]> {
    const url = `${this.apiUrl}/apartamentos/${id}`;
    return this.http.get<Vaga[]>(url, { headers: this.getHeaders() });
  }

  createVaga(vaga: Vaga): Observable<Vaga> {
    return this.http.post<Vaga>(this.apiUrl, vaga, { headers: this.getHeaders() });
  }

  updateVaga(vaga: Vaga): Observable<Vaga> {
    const url = `${this.apiUrl}/${vaga.id}`;
    return this.http.put<Vaga>(url, vaga, { headers: this.getHeaders() });
  }

  deleteVaga(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
